import datetime
from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, Text, JSON
from app.database import Base

class FireDetection(Base):
    __tablename__ = "fires"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    brightness = Column(Float, nullable=True)
    confidence = Column(String(32), nullable=True)
    frp = Column(Float, nullable=True) # Fire Radiative Power (MW)
    scan_time = Column(DateTime, nullable=True, default=datetime.datetime.utcnow)
    source = Column(String(32), default="MODIS/VIIRS")
    satellite = Column(String(32), nullable=True)
    daynight = Column(String(4), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AirQualityStation(Base):
    __tablename__ = "air_quality"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    aqi = Column(Integer, nullable=False)
    pm2_5 = Column(Float, nullable=True)
    pm10 = Column(Float, nullable=True)
    co = Column(Float, nullable=True)
    no2 = Column(Float, nullable=True)
    station_name = Column(String(128), nullable=True)
    pollutant = Column(String(32), default="PM2.5")
    measured_at = Column(DateTime, default=datetime.datetime.utcnow)

class RiskPredictionRecord(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(128), nullable=True)
    risk_score = Column(Float, nullable=False)
    confidence_interval = Column(Float, nullable=True)
    risk_level = Column(String(32), nullable=False) # Low, Watch, Warning, Emergency
    features_json = Column(JSON, nullable=True)
    date_predicted = Column(DateTime, default=datetime.datetime.utcnow)

class AlertRule(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_location = Column(String(128), nullable=True)
    center_lat = Column(Float, nullable=True)
    center_lon = Column(Float, nullable=True)
    radius_km = Column(Float, default=25.0)
    geofence_geojson = Column(Text, nullable=True)
    alert_type = Column(String(64), default="Fire Proximity")
    threshold_score = Column(Float, default=80.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class CommunityReport(Base):
    __tablename__ = "community_reports"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    threat_type = Column(String(64), nullable=False) # fire, smoke, flood, deforestation
    title = Column(String(128), nullable=True)
    description = Column(Text, nullable=False)
    photo_url = Column(String(512), nullable=True)
    reporter_name = Column(String(64), default="Local Observer")
    is_verified = Column(Boolean, default=False)
    nearest_satellite_km = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
