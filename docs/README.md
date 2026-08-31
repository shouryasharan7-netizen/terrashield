# TERRASHIELD — AI Environmental Risk Command Center

TerraShield is a production-grade environmental protection command platform that monitors live active wildfires (NASA FIRMS satellite feed), tracks atmospheric air quality hazards (OpenAQ / Open-Meteo), forecasts 7-day predictive wildfire risks using an ensemble Random Forest model with 90% confidence intervals, protects communities via automated geofenced alerts, and calculates safe evacuation routes with 10km fire avoidance buffers.

---

## 🌟 Key Features

### 1. Live Threat Map (NASA FIRMS + OpenAQ)
- Near-real-time satellite active wildfire detections from NASA VIIRS and MODIS constellations.
- Color-coded Air Quality Index (AQI) from global monitoring stations.
- Deforestation alerts based on radar canopy depletion patterns.
- Interactive detail drawer showing Fire Radiative Power (FRP), brightness temperature, confidence, and timestamps.

### 2. AI Fire Risk Prediction Engine
- Machine learning model (`RandomForestRegressor`, 100 estimators, $R^2 = 0.9302$) trained on physical Fire Weather Index (FWI) principles.
- Predicts risk scores (0–100) with **90% confidence intervals** derived from decision tree variance.
- Incorporates temperature, humidity, wind velocity, precipitation, and Fuel Moisture Index (FMI).

### 3. Smart Geofence & Alert System
- Allows users to define custom spatial perimeters around towns, ranches, or parks.
- Live spatial intersection checks against satellite wildfire feeds.
- Automated siren, push notifications, and broadcast directives for breached perimeters.

### 4. Evacuation Route Optimizer
- Discretizes corridors between origin and destination.
- Automatically deflects routes around any active wildfire within a **10km safety buffer**.
- Calculates transit duration, distance, and real-time Safety Score (Green/Yellow/Red).

### 5. Impact Analytics & Carbon Accounting
- Real-time calculations of acres burned and early mitigation acreage saved.
- Carbon emission estimations ($Acres \times 5.5 \text{ tons } CO_2$).
- 7-day historical trends of detections vs. AQI.

### 6. Crowdsourced Community Reporting
- Citizen reporting form with categories (fire, smoke, flood, deforestation).
- Instant verification badge if reported within 2km of a NASA satellite detection.

---

## 🚀 Getting Started

### Backend Setup (FastAPI + ML Model)
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload
```

### Frontend Setup (Next.js 14 + Tailwind)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the Command Center.

---

## ⌨️ Keyboard Shortcuts
- `/` — Focus Global Search
- `L` — Toggle Threat Layers
- `R` — Open Community Hazard Report Form
- `ESC` — Dismiss active sirens & modals
