# TERRASHIELD System Architecture

```
                               ┌──────────────────────────────────────────────┐
                               │             USER CLIENT INTERFACE            │
                               │   Next.js 14 App Router + Tailwind CSS       │
                               │   Leaflet / Carto Dark Matter / Lucide UI    │
                               └──────────────────────┬───────────────────────┘
                                                      │
                                                      ▼  REST API (JSON)
                               ┌──────────────────────────────────────────────┐
                               │           FASTAPI BACKEND ENGINE             │
                               │  - Uvicorn Server (Asynchronous Event Loop)  │
                               │  - Spatial Geodesic Distance Engine          │
                               │  - 5-Min Periodic Background Sync Worker     │
                               └──────────────┬───────────────┬───────────────┘
                                              │               │
                     ┌────────────────────────┘               └────────────────────────┐
                     ▼                                                                 ▼
      ┌─────────────────────────────┐                                   ┌─────────────────────────────┐
      │   MACHINE LEARNING ENGINE   │                                   │    STORAGE & DATA LAYER     │
      │  - Scikit-Learn RF (100 est)│                                   │  - SQLite / PostgreSQL       │
      │  - 90% Confidence Bounds    │                                   │  - FireDetection, Alerts,   │
      │  - Fuel Moisture Index calc │                                   │    AirQuality, Reports      │
      └─────────────────────────────┘                                   └──────────────┬──────────────┘
                                                                                       │
                                     ┌─────────────────────────────────────────────────┴─────────────────────────────────────────────────┐
                                     ▼                                                 ▼                                                 ▼
                      ┌─────────────────────────────┐                   ┌─────────────────────────────┐                   ┌─────────────────────────────┐
                      │      NASA FIRMS API         │                   │    OPEN-METEO / OPENAQ      │                   │      WEATHER ENSEMBLE       │
                      │  - Near-Real-Time CSV       │                   │  - Worldwide AQI Stations   │                   │  - Max Temp, Min Humidity   │
                      │  - VIIRS & MODIS Satellites │                   │  - PM2.5, PM10, CO, NO2     │                   │  - Wind Velocity & Rain     │
                      └─────────────────────────────┘                   └─────────────────────────────┘                   └─────────────────────────────┘
```

## Security & Deployment
- Database: SQLAlchemy ORM with SQLite for local development, immediately portable to Supabase / PostgreSQL by providing `DATABASE_URL`.
- Containerization: FastAPI runs independently of external system daemons and handles CORS gracefully.
- Fallback Resiliency: Automatic fallback dataset prevents map blackout even during external upstream API rate-limiting or maintenance windows.
