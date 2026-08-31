import os
import pickle
import numpy as np
import datetime

class FireRiskPredictor:
    def __init__(self):
        self.model_payload = None
        self.load_model()

    def load_model(self):
        model_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ml", "fire_risk_model.pkl")
        if os.path.exists(model_path):
            try:
                with open(model_path, "rb") as f:
                    self.model_payload = pickle.load(f)
                print("ML Fire Risk Model loaded successfully.")
            except Exception as e:
                print(f"Error loading fire risk model: {e}")
        else:
            print("Model file not found. Re-training on the fly...")
            from app.ml.train_model import train_and_save_model
            train_and_save_model()
            with open(model_path, "rb") as f:
                self.model_payload = pickle.load(f)

    def predict_risk(self, temp_max: float, humidity_min: float, wind_speed: float, 
                     precipitation: float, day_of_year: int, lat: float, lon: float):
        if not self.model_payload:
            self.load_model()

        rf = self.model_payload["model"]
        feature_names = self.model_payload["feature_names"]
        
        # Calculate Fuel Moisture Index (FMI) proxy:
        # FMI = 10 - 0.25*(temp - humidity)
        fmi = max(2.0, min(30.0, 10.0 - 0.25 * (temp_max - humidity_min)))
        
        row = np.array([[temp_max, humidity_min, wind_speed, precipitation, day_of_year, lat, lon]])
        
        # Point prediction
        predicted_score = float(rf.predict(row)[0])
        predicted_score = max(0.0, min(100.0, round(predicted_score, 1)))

        # Ensemble Tree Predictions for Real-Time Confidence Interval
        tree_preds = [tree.predict(row)[0] for tree in rf.estimators_]
        std_dev = float(np.std(tree_preds))
        # 90% confidence interval ~ 1.645 * std_dev
        ci_lower = max(0.0, round(predicted_score - 1.645 * std_dev, 1))
        ci_upper = min(100.0, round(predicted_score + 1.645 * std_dev, 1))

        # Risk Classification
        if predicted_score >= 80.0:
            level = "Emergency"
            color = "#EF4444"
            description = "Extreme fire weather behavior. Rapid rate of spread, crown fires likely, immediate containment unlikely."
        elif predicted_score >= 60.0:
            level = "Warning"
            color = "#F59E0B"
            description = "High fire danger. Uncontrolled spot fires expected, rapid perimeter expansion under sustained winds."
        elif predicted_score >= 40.0:
            level = "Watch"
            color = "#3B82F6"
            description = "Moderate risk. Fires will ignite from most causes; spread is moderate, ground control feasible."
        else:
            level = "Low"
            color = "#10B981"
            description = "Low fire danger. Moisture dampens fuel bed; low probability of sustained ignition."

        return {
            "risk_score": predicted_score,
            "risk_level": level,
            "color": color,
            "confidence_interval": {
                "lower": ci_lower,
                "upper": ci_upper,
                "std_dev": round(std_dev, 2)
            },
            "fuel_moisture_index": round(fmi, 1),
            "description": description,
            "metrics": self.model_payload.get("metrics", {}),
            "feature_contributions": {
                "temperature": round(temp_max, 1),
                "humidity": round(humidity_min, 1),
                "wind_speed": round(wind_speed, 1),
                "precipitation": round(precipitation, 1)
            }
        }

predictor = FireRiskPredictor()
