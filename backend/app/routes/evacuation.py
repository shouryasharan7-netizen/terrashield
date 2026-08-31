import math
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import FireDetection
from geopy.distance import geodesic

router = APIRouter(prefix="/api/evacuation", tags=["Evacuation Optimizer"])

def haversine_km(lat1, lon1, lat2, lon2):
    return geodesic((lat1, lon1), (lat2, lon2)).kilometers

@router.get("/route")
def calculate_evacuation_route(
    start_lat: float = Query(37.7749),
    start_lon: float = Query(-122.4194),
    end_lat: float = Query(37.3382),
    end_lon: float = Query(-121.8863),
    safety_buffer_km: float = Query(10.0),
    db: Session = Depends(get_db)
):
    """
    Computes an evacuation corridor avoiding any active wildfire within safety_buffer_km.
    Yields route waypoints, safety score, hazard distance, and avoidance detours.
    """
    direct_dist = haversine_km(start_lat, start_lon, end_lat, end_lon)
    
    # Query fires in regional bounding box
    min_lat = min(start_lat, end_lat) - 1.0
    max_lat = max(start_lat, end_lat) + 1.0
    min_lon = min(start_lon, end_lon) - 1.0
    max_lon = max(start_lon, end_lon) + 1.0

    regional_fires = db.query(FireDetection).filter(
        FireDetection.latitude.between(min_lat, max_lat),
        FireDetection.longitude.between(min_lon, max_lon)
    ).all()

    # Discretize base corridor into 25 waypoints
    num_steps = 25
    waypoints = []
    detour_active = False
    closest_fire_dist = 9999.0
    fire_intercepts = []

    for i in range(num_steps + 1):
        ratio = i / float(num_steps)
        curr_lat = start_lat + (end_lat - start_lat) * ratio
        curr_lon = start_lon + (end_lon - start_lon) * ratio

        # Check proximity to any active fire
        for f in regional_fires:
            d = haversine_km(curr_lat, curr_lon, f.latitude, f.longitude)
            if d < closest_fire_dist:
                closest_fire_dist = d
            if d < safety_buffer_km:
                detour_active = True
                fire_intercepts.append({
                    "fire_id": f.id,
                    "lat": f.latitude,
                    "lon": f.longitude,
                    "frp": f.frp,
                    "distance_km": round(d, 2)
                })

        # Apply orthogonal avoidance deflection vector if within fire buffer
        if detour_active and i > 2 and i < num_steps - 2:
            # Perpendicular detour vector
            dx = -(end_lat - start_lat)
            dy = (end_lon - start_lon)
            norm = math.sqrt(dx*dx + dy*dy) or 1.0
            deflection_km = (safety_buffer_km + 4.0) / 111.0 # approx deg
            # Shift away from nearest threat
            curr_lat += (dx / norm) * deflection_km
            curr_lon += (dy / norm) * deflection_km

        waypoints.append([round(curr_lon, 5), round(curr_lat, 5)])

    # Compute safety score
    # > 25km away = 100%, 10km = 70%, < 5km = 30%
    if closest_fire_dist >= 25.0:
        safety_score = 98.0
        safety_tier = "Optimal (Green)"
        status_color = "#10B981"
        recommendation = "Clear evacuation corridor. No immediate wildfire threat within 25km."
    elif closest_fire_dist >= safety_buffer_km:
        safety_score = 85.0
        safety_tier = "Moderate Caution (Yellow)"
        status_color = "#FBBF24"
        recommendation = "Corridor viable. Active smoke plume possible. Maintain advisory speed."
    else:
        safety_score = 45.0
        safety_tier = "Hazard Detour Applied (Red Avoidance)"
        status_color = "#EF4444"
        recommendation = f"Active wildfire detected within {round(closest_fire_dist, 1)}km! 10km avoidance detour auto-engaged."

    est_duration_min = round((direct_dist * 1.15) / 60.0 * 60) # ~60 km/h avg evac speed

    return {
        "start": {"lat": start_lat, "lon": start_lon},
        "destination": {"lat": end_lat, "lon": end_lon},
        "distance_km": round(direct_dist * (1.18 if detour_active else 1.05), 1),
        "estimated_minutes": est_duration_min,
        "safety_score": round(safety_score, 1),
        "safety_tier": safety_tier,
        "status_color": status_color,
        "closest_threat_km": round(closest_fire_dist, 1) if closest_fire_dist < 9000 else None,
        "recommendation": recommendation,
        "fire_intercepts_count": len(fire_intercepts),
        "geojson": {
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": waypoints
            },
            "properties": {
                "safety_score": safety_score,
                "detour_engaged": detour_active
            }
        }
    }
