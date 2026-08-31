import datetime
import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import AlertRule, FireDetection
from geopy.distance import geodesic

router = APIRouter(prefix="/api/alerts", tags=["Alerts & Geofencing"])

class AlertCreate(BaseModel):
    user_location: str
    center_lat: float
    center_lon: float
    radius_km: float = 25.0
    threshold_score: float = 75.0
    alert_type: str = "Wildfire Threat"

@router.get("")
def list_alerts(db: Session = Depends(get_db)):
    rules = db.query(AlertRule).order_by(AlertRule.created_at.desc()).all()
    active_breaches = []

    # Evaluate each geofence against active fires
    for rule in rules:
        if not rule.is_active:
            continue
        
        fires = db.query(FireDetection).all()
        threats_in_zone = []
        for f in fires:
            dist = geodesic((rule.center_lat, rule.center_lon), (f.latitude, f.longitude)).kilometers
            if dist <= rule.radius_km:
                threats_in_zone.append({
                    "fire_id": f.id,
                    "lat": f.latitude,
                    "lon": f.longitude,
                    "brightness": f.brightness,
                    "frp": f.frp,
                    "distance_km": round(dist, 1)
                })
        
        status = "BREACHED" if threats_in_zone else "CLEAR"
        active_breaches.append({
            "id": rule.id,
            "user_location": rule.user_location,
            "center": [rule.center_lon, rule.center_lat],
            "radius_km": rule.radius_km,
            "status": status,
            "threats_count": len(threats_in_zone),
            "threats": threats_in_zone[:5],
            "created_at": rule.created_at.isoformat() if rule.created_at else None,
            "recommended_action": "Evacuate immediately via designated West corridors" if threats_in_zone else "Monitor perimeter conditions normally"
        })

    return {
        "total_rules": len(rules),
        "active_monitoring": active_breaches
    }

@router.post("")
def create_alert_geofence(payload: AlertCreate, db: Session = Depends(get_db)):
    rule = AlertRule(
        user_location=payload.user_location,
        center_lat=payload.center_lat,
        center_lon=payload.center_lon,
        radius_km=payload.radius_km,
        threshold_score=payload.threshold_score,
        alert_type=payload.alert_type,
        is_active=True
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return {"status": "created", "rule_id": rule.id, "location": rule.user_location}

@router.delete("/{alert_id}")
def delete_alert(alert_id: int, db: Session = Depends(get_db)):
    rule = db.query(AlertRule).filter(AlertRule.id == alert_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Alert rule not found")
    db.delete(rule)
    db.commit()
    return {"status": "deleted", "id": alert_id}
