import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import FireDetection
from app.services.nasa_firms import fetch_and_ingest_firms_data

router = APIRouter(prefix="/api/fires", tags=["Wildfires"])

@router.get("")
def get_active_fires(
    limit: int = Query(600, ge=10, le=2000),
    min_confidence: str = Query("0"),
    db: Session = Depends(get_db)
):
    query = db.query(FireDetection)
    count = query.count()
    if count == 0:
        fetch_and_ingest_firms_data(db)
        
    fires = db.query(FireDetection).order_by(FireDetection.scan_time.desc()).limit(limit).all()
    
    features = []
    total_frp = 0.0
    for f in fires:
        total_frp += (f.frp or 0.0)
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [f.longitude, f.latitude]
            },
            "properties": {
                "id": f.id,
                "brightness": f.brightness,
                "confidence": f.confidence,
                "frp": f.frp,
                "satellite": f.satellite,
                "scan_time": f.scan_time.isoformat() if f.scan_time else None,
                "source": f.source,
                "daynight": f.daynight
            }
        })
    
    return {
        "type": "FeatureCollection",
        "total_count": len(features),
        "total_frp_megawatts": round(total_frp, 1),
        "last_refresh": datetime.datetime.utcnow().isoformat(),
        "features": features
    }

@router.post("/refresh")
def refresh_fire_data(db: Session = Depends(get_db)):
    fetch_and_ingest_firms_data(db)
    return {"status": "success", "message": "Triggered NASA FIRMS satellite data refresh."}
