import datetime
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.ml_predictor import predictor
from app.services.weather import fetch_weather_and_forecast
from app.models.entities import RiskPredictionRecord

router = APIRouter(prefix="/api/predictions", tags=["ML Predictions"])

@router.get("/predict-risk")
def predict_risk(
    lat: float = Query(37.7749, ge=-90.0, le=90.0),
    lon: float = Query(-122.4194, ge=-180.0, le=180.0),
    location_name: str = Query("Selected Location"),
    db: Session = Depends(get_db)
):
    """
    Accepts latitude and longitude, fetches real-time weather and 7-day forecast,
    and predicts daily fire risk scores with confidence intervals.
    """
    weather_data = fetch_weather_and_forecast(lat, lon)
    current = weather_data.get("current", {})
    daily = weather_data.get("daily", {})

    now = datetime.datetime.utcnow()
    day_of_year = now.timetuple().tm_yday

    # Current point prediction
    temp_now = float(current.get("temperature_2m", 25.0))
    humid_now = float(current.get("relative_humidity_2m", 40.0))
    wind_now = float(current.get("wind_speed_10m", 15.0))
    rain_now = float(current.get("precipitation", 0.0))

    current_prediction = predictor.predict_risk(
        temp_max=temp_now,
        humidity_min=humid_now,
        wind_speed=wind_now,
        precipitation=rain_now,
        day_of_year=day_of_year,
        lat=lat,
        lon=lon
    )

    # 7-day forecast projection
    forecast_days = []
    dates = daily.get("time", [])
    max_temps = daily.get("temperature_2m_max", [])
    min_humids = daily.get("relative_humidity_2m_min", [])
    max_winds = daily.get("wind_speed_10m_max", [])
    rain_sums = daily.get("precipitation_sum", [])

    for i in range(len(dates)):
        t = float(max_temps[i]) if i < len(max_temps) else temp_now
        h = float(min_humids[i]) if i < len(min_humids) else humid_now
        w = float(max_winds[i]) if i < len(max_winds) else wind_now
        r = float(rain_sums[i]) if i < len(rain_sums) else rain_now

        d_obj = datetime.date.fromisoformat(dates[i])
        f_pred = predictor.predict_risk(
            temp_max=t,
            humidity_min=h,
            wind_speed=w,
            precipitation=r,
            day_of_year=d_obj.timetuple().tm_yday,
            lat=lat,
            lon=lon
        )
        forecast_days.append({
            "date": dates[i],
            "day_name": d_obj.strftime("%a"),
            "risk_score": f_pred["risk_score"],
            "risk_level": f_pred["risk_level"],
            "color": f_pred["color"],
            "confidence_interval": f_pred["confidence_interval"],
            "temp_max": round(t, 1),
            "humidity_min": round(h, 1),
            "wind_max": round(w, 1),
            "precipitation": round(r, 1)
        })

    # Save to history
    record = RiskPredictionRecord(
        latitude=lat,
        longitude=lon,
        location_name=location_name,
        risk_score=current_prediction["risk_score"],
        confidence_interval=current_prediction["confidence_interval"]["std_dev"],
        risk_level=current_prediction["risk_level"],
        features_json=current_prediction["feature_contributions"]
    )
    db.add(record)
    db.commit()

    return {
        "location": {
            "name": location_name,
            "latitude": lat,
            "longitude": lon
        },
        "current_assessment": current_prediction,
        "seven_day_forecast": forecast_days,
        "thresholds": {
            "low": "< 40 (Low Danger)",
            "watch": "40 - 59 (Watch)",
            "warning": "60 - 79 (High Fire Warning)",
            "emergency": ">= 80 (Catastrophic / Emergency)"
        }
    }
