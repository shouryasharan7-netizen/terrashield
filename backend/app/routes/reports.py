from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import CommunityReport, FireDetection
from geopy.distance import geodesic
import datetime

router = APIRouter(prefix="/api/reports", tags=["Community Reporting"])

class ReportCreate(BaseModel):
    latitude: float
    longitude: float
    threat_type: str # fire, smoke, flood, deforestation
    title: str = "Environmental Hazard Report"
    description: str
    photo_url: str = ""
    reporter_name: str = "Citizen Watcher"

@router.get("")
def list_reports(db: Session = Depends(get_db)):
    reports = db.query(CommunityReport).order_by(CommunityReport.created_at.desc()).all()
    features = []
    for r in reports:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [r.longitude, r.latitude]
            },
            "properties": {
                "id": r.id,
                "threat_type": r.threat_type,
                "title": r.title,
                "description": r.description,
                "photo_url": r.photo_url,
                "reporter_name": r.reporter_name,
                "is_verified": r.is_verified,
                "nearest_satellite_km": r.nearest_satellite_km,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
        })
    return {
        "type": "FeatureCollection",
        "total_reports": len(features),
        "features": features
    }

@router.post("")
def submit_community_report(payload: ReportCreate, db: Session = Depends(get_db)):
    # Calculate proximity to nearest satellite fire detection
    fires = db.query(FireDetection).all()
    min_dist = 9999.0
    for f in fires:
        d = geodesic((payload.latitude, payload.longitude), (f.latitude, f.longitude)).kilometers
        if d < min_dist:
            min_dist = d

    # Verified badge if within 2km of NASA satellite detection
    is_verified = (min_dist <= 2.0)

    report = CommunityReport(
        latitude=payload.latitude,
        longitude=payload.longitude,
        threat_type=payload.threat_type,
        title=payload.title,
        description=payload.description,
        photo_url=payload.photo_url or "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=500&auto=format&fit=crop&q=60",
        reporter_name=payload.reporter_name,
        is_verified=is_verified,
        nearest_satellite_km=round(min_dist, 2) if min_dist < 9000 else None,
        created_at=datetime.datetime.utcnow()
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        "status": "success",
        "report_id": report.id,
        "is_verified": report.is_verified,
        "verification_note": "Satellite Confirmed (within 2km of NASA detection)" if is_verified else f"Ground report logged ({round(min_dist, 1)}km from nearest satellite node)"
    }
