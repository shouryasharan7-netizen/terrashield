import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine, SessionLocal
from app.routes import fires, air_quality, predictions, evacuation, alerts, reports, analytics
from app.models.entities import FireDetection
from app.services.nasa_firms import seed_fallback_fire_data

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TerraShield API",
    description="Production-grade AI Environmental Risk Command Center API providing real-time satellite fire detection, air quality monitoring, ML risk forecasts, and geofenced evacuation routing.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(fires.router)
app.include_router(air_quality.router)
app.include_router(predictions.router)
app.include_router(evacuation.router)
app.include_router(alerts.router)
app.include_router(reports.router)
app.include_router(analytics.router)

@app.on_event("startup")
async def startup_event():
    # Database is already initialized and seeded with live data.
    # Non-blocking periodic sync in background
    async def periodic_refresh():
        while True:
            await asyncio.sleep(300) # 5 min
            try:
                from app.services.nasa_firms import fetch_and_ingest_firms_data
                from app.services.air_quality import ingest_all_air_quality_stations
                db = SessionLocal()
                fetch_and_ingest_firms_data(db, max_records=600)
                ingest_all_air_quality_stations(db)
                db.close()
            except Exception as e:
                print(f"Periodic sync log: {e}")

    asyncio.create_task(periodic_refresh())

@app.get("/")
def health_check():
    return {
        "service": "TerraShield AI Environmental Risk Command Center",
        "status": "online",
        "endpoints": [
            "/api/fires",
            "/api/air-quality",
            "/api/predictions/predict-risk",
            "/api/evacuation/route",
            "/api/alerts",
            "/api/reports",
            "/api/analytics"
        ]
    }
