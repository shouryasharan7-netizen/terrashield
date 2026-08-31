import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import AirQualityStation
from app.services.air_quality import ingest_all_air_quality_stations

router = APIRouter(prefix="/api/air-quality", tags=["Air Quality"])

@router.get("")
def get_air_quality(db: Session = Depends(get_db)):
    stations = db.query(AirQualityStation).all()
    if not stations:
        ingest_all_air_quality_stations(db)
        stations = db.query(AirQualityStation).all()

    features = []
    total_aqi = 0
    for s in stations:
        total_aqi += s.aqi
        # Color coding AQI standards
        if s.aqi <= 50:
            aqi_category = "Good"
            color = "#10B981"
        elif s.aqi <= 100:
            aqi_category = "Moderate"
            color = "#FBBF24"
        elif s.aqi <= 150:
            aqi_category = "Unhealthy for Sensitive Groups"
            color = "#F97316"
        elif s.aqi <= 200:
            aqi_category = "Unhealthy"
            color = "#EF4444"
        elif s.aqi <= 300:
            aqi_category = "Very Unhealthy"
            color = "#8B5CF6"
        else:
            aqi_category = "Hazardous"
            color = "#7E22CE"

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [s.longitude, s.latitude]
            },
            "properties": {
                "id": s.id,
                "station_name": s.station_name,
                "aqi": s.aqi,
                "category": aqi_category,
                "color": color,
                "pm2_5": s.pm2_5,
                "pm10": s.pm10,
                "co": s.co,
                "no2": s.no2,
                "measured_at": s.measured_at.isoformat() if s.measured_at else None,
                "source": "OpenAQ / Open-Meteo European Atmosphere Service"
            }
        })

    avg_aqi = round(total_aqi / len(stations), 1) if stations else 0

    return {
        "type": "FeatureCollection",
        "average_aqi": avg_aqi,
        "stations_count": len(features),
        "last_refresh": datetime.datetime.utcnow().isoformat(),
        "features": features
    }

@router.post("/refresh")
def refresh_air_quality(db: Session = Depends(get_db)):
    ingest_all_air_quality_stations(db)
    return {"status": "success", "message": "Updated global air quality stations."}
