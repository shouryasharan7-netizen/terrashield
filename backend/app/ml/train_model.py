import os
import pickle
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score

def generate_synthetic_fire_weather_data(n_samples=5000, random_state=42):
    np.random.seed(random_state)
    
    # 1. Weather variables
    # Temperature (°C): typically 5°C to 45°C
    temp_max = np.random.uniform(5, 45, n_samples)
    
    # Relative Humidity (%): 5% to 95%
    humidity_min = np.random.uniform(5, 95, n_samples)
    
    # Wind Speed (km/h): 0 to 60 km/h
    wind_speed = np.random.uniform(0, 60, n_samples)
    
    # Precipitation (mm in past 24h): skewed, mostly dry or small showers
    precipitation = np.random.exponential(scale=2.5, size=n_samples)
    precipitation = np.clip(precipitation - 1.0, 0, 50)  # ~40% zero rain
    
    # Day of Year (1 - 365)
    day_of_year = np.random.randint(1, 366, n_samples)
    
    # Latitude (-60 to 70) and Longitude (-180 to 180)
    latitude = np.random.uniform(-60, 70, n_samples)
    longitude = np.random.uniform(-180, 180, n_samples)
    
    # 2. Physics-inspired Wildfire Risk Function (0 - 100)
    # Based on McArthur Forest Fire Danger Index & Canadian FWI principles
    temp_factor = np.clip((temp_max - 15) / 30.0, 0, 1) * 35.0
    humidity_factor = np.clip((85 - humidity_min) / 75.0, 0, 1) * 35.0
    wind_factor = np.clip(wind_speed / 45.0, 0, 1) * 20.0
    rain_suppression = np.clip(precipitation * 6.0, 0, 45.0)
    
    # Seasonality
    is_northern = latitude >= 0
    summer_peak_day = np.where(is_northern, 205, 20)
    season_diff = np.abs(day_of_year - summer_peak_day)
    season_diff = np.minimum(season_diff, 365 - season_diff)
    season_factor = (1.0 - (season_diff / 182.5)) * 10.0
    
    # Base risk score calculation
    raw_risk = temp_factor + humidity_factor + wind_factor + season_factor - rain_suppression
    
    # Natural environmental noise
    noise = np.random.normal(0, 4.0, n_samples)
    risk_score = np.clip(raw_risk + noise, 0, 100)
    
    df = pd.DataFrame({
        'temp_max': temp_max,
        'humidity_min': humidity_min,
        'wind_speed': wind_speed,
        'precipitation': precipitation,
        'day_of_year': day_of_year,
        'latitude': latitude,
        'longitude': longitude,
        'risk_score': risk_score
    })
    return df

def train_and_save_model():
    print("Generating 5,000 synthetic environmental records...")
    df = generate_synthetic_fire_weather_data()
    
    feature_cols = ['temp_max', 'humidity_min', 'wind_speed', 'precipitation', 'day_of_year', 'latitude', 'longitude']
    X = df[feature_cols]
    y = df['risk_score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Random Forest Regressor (100 estimators)...")
    rf = RandomForestRegressor(n_estimators=100, max_depth=16, min_samples_leaf=2, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    
    predictions = rf.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, predictions))
    r2 = r2_score(y_test, predictions)
    
    print(f"Model Trained Successfully! R2 Score: {r2:.4f}, RMSE: {rmse:.2f}")
    
    model_payload = {
        'model': rf,
        'feature_names': feature_cols,
        'metrics': {'r2': float(r2), 'rmse': float(rmse)},
        'feature_importances': {k: float(v) for k, v in zip(feature_cols, rf.feature_importances_)}
    }
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, 'fire_risk_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model_payload, f)
    
    print(f"Model saved to {model_path}")
    print("Feature Importances:", model_payload['feature_importances'])
    return model_path

if __name__ == '__main__':
    train_and_save_model()
