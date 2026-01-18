import numpy as np
from typing import Dict, List, Any
from datetime import datetime
from dataclasses import dataclass


@dataclass
class RiskFactors:
    """Risk factor components"""
    weather: float = 0.0
    driver_fatigue: float = 0.0
    traffic: float = 0.0
    vehicle_health: float = 0.0


class RiskScorer:
    """Risk scoring engine for fleet vehicles"""
    
    WEIGHTS = {
        "weather": 0.25,
        "driver_fatigue": 0.30,
        "traffic": 0.25,
        "vehicle_health": 0.20
    }
    
    RISK_THRESHOLDS = {
        "low": 0.3,
        "medium": 0.6,
        "high": 0.8
    }
    
    def __init__(self):
        self.ml_model = None  # PyTorch model loaded in production
        self._load_model()
    
    def _load_model(self):
        """Load PyTorch risk scoring model"""
        # In production, load actual trained model
        # self.ml_model = torch.load("models/risk_scorer.pt")
        pass
    
    def calculate_score(self, factors: RiskFactors) -> float:
        """Calculate weighted risk score"""
        score = (
            factors.weather * self.WEIGHTS["weather"] +
            factors.driver_fatigue * self.WEIGHTS["driver_fatigue"] +
            factors.traffic * self.WEIGHTS["traffic"] +
            factors.vehicle_health * self.WEIGHTS["vehicle_health"]
        )
        return round(min(max(score, 0), 1), 3)
    
    def get_risk_level(self, score: float) -> str:
        """Determine risk level from score"""
        if score < self.RISK_THRESHOLDS["low"]:
            return "low"
        elif score < self.RISK_THRESHOLDS["medium"]:
            return "medium"
        elif score < self.RISK_THRESHOLDS["high"]:
            return "high"
        return "critical"
    
    async def calculate_vehicle_risk(self, vehicle) -> Dict[str, Any]:
        """Calculate comprehensive risk score for a vehicle"""
        
        # Get individual risk factors
        weather_risk = await self._get_weather_risk(vehicle.current_lat, vehicle.current_lng)
        traffic_risk = await self._get_traffic_risk(vehicle.current_lat, vehicle.current_lng)
        fatigue_risk = self._calculate_fatigue_risk(vehicle)
        health_risk = self._calculate_vehicle_health_risk(vehicle)
        
        factors = RiskFactors(
            weather=weather_risk,
            driver_fatigue=fatigue_risk,
            traffic=traffic_risk,
            vehicle_health=health_risk
        )
        
        overall_score = self.calculate_score(factors)
        risk_level = self.get_risk_level(overall_score)
        
        return {
            "vehicle_id": str(vehicle.id),
            "vehicle_name": vehicle.name,
            "overall": overall_score,
            "weather": weather_risk,
            "traffic": traffic_risk,
            "driver_fatigue": fatigue_risk,
            "vehicle_health": health_risk,
            "level": risk_level,
            "factors": [
                {
                    "name": "Weather",
                    "value": weather_risk,
                    "weight": self.WEIGHTS["weather"],
                    "description": self._get_weather_description(weather_risk)
                },
                {
                    "name": "Driver Fatigue",
                    "value": fatigue_risk,
                    "weight": self.WEIGHTS["driver_fatigue"],
                    "description": self._get_fatigue_description(fatigue_risk)
                },
                {
                    "name": "Traffic",
                    "value": traffic_risk,
                    "weight": self.WEIGHTS["traffic"],
                    "description": self._get_traffic_description(traffic_risk)
                },
                {
                    "name": "Vehicle Health",
                    "value": health_risk,
                    "weight": self.WEIGHTS["vehicle_health"],
                    "description": self._get_health_description(health_risk)
                }
            ],
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def _get_weather_risk(self, lat: float, lng: float) -> float:
        """Get weather-based risk score"""
        # In production, fetch from OpenWeatherMap API
        # For now, return simulated value
        base_risk = 0.15
        # Add some variation based on location
        variation = abs(np.sin(lat * 100) * 0.2)
        return min(base_risk + variation, 1.0)
    
    async def _get_traffic_risk(self, lat: float, lng: float) -> float:
        """Get traffic-based risk score"""
        # In production, fetch from Mapbox Traffic API
        # Simulate based on time of day
        hour = datetime.now().hour
        
        # Higher risk during rush hours
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            base_risk = 0.6
        elif 10 <= hour <= 16:
            base_risk = 0.3
        else:
            base_risk = 0.15
        
        return min(base_risk + np.random.uniform(-0.1, 0.1), 1.0)
    
    def _calculate_fatigue_risk(self, vehicle) -> float:
        """Calculate driver fatigue risk"""
        # In production, use shift logs and telematics
        # Simulate based on current hour
        hour = datetime.now().hour
        
        if 0 <= hour <= 5:
            base_fatigue = 0.7  # Night driving
        elif 14 <= hour <= 16:
            base_fatigue = 0.4  # Post-lunch dip
        else:
            base_fatigue = 0.2
        
        return min(base_fatigue, 1.0)
    
    def _calculate_vehicle_health_risk(self, vehicle) -> float:
        """Calculate vehicle health risk from IoT data"""
        risks = []
        
        # Fuel level risk
        if vehicle.fuel_level < 20:
            risks.append(0.6)
        elif vehicle.fuel_level < 40:
            risks.append(0.3)
        else:
            risks.append(0.1)
        
        # Load capacity risk
        load_ratio = vehicle.current_load / vehicle.capacity if vehicle.capacity > 0 else 0
        if load_ratio > 0.95:
            risks.append(0.5)
        elif load_ratio > 0.8:
            risks.append(0.3)
        else:
            risks.append(0.1)
        
        return np.mean(risks)
    
    def _get_weather_description(self, risk: float) -> str:
        if risk < 0.3:
            return "Clear conditions, optimal driving weather"
        elif risk < 0.6:
            return "Light precipitation, reduced visibility"
        elif risk < 0.8:
            return "Heavy rain/wind, caution advised"
        return "Severe weather warning, consider delay"
    
    def _get_fatigue_description(self, risk: float) -> str:
        if risk < 0.3:
            return "Driver well-rested and alert"
        elif risk < 0.6:
            return "Moderate fatigue indicators"
        elif risk < 0.8:
            return "High fatigue risk, break recommended"
        return "Critical fatigue level, immediate break required"
    
    def _get_traffic_description(self, risk: float) -> str:
        if risk < 0.3:
            return "Light traffic, smooth flow"
        elif risk < 0.6:
            return "Moderate congestion expected"
        elif risk < 0.8:
            return "Heavy traffic, significant delays"
        return "Severe congestion, major delays expected"
    
    def _get_health_description(self, risk: float) -> str:
        if risk < 0.3:
            return "Vehicle in excellent condition"
        elif risk < 0.6:
            return "Minor maintenance items pending"
        elif risk < 0.8:
            return "Maintenance required soon"
        return "Critical maintenance needed"
    
    def get_recommendation(self, risk_level: str) -> str:
        """Get action recommendation based on risk level"""
        recommendations = {
            "low": "Continue normal operations",
            "medium": "Monitor situation, prepare contingencies",
            "high": "Consider route modification or delay",
            "critical": "Immediate intervention required - consider halting operations"
        }
        return recommendations.get(risk_level, "Unknown risk level")
    
    async def predict_risk(self, vehicle, horizon_hours: int = 24) -> List[Dict]:
        """Predict future risk scores"""
        predictions = []
        current_hour = datetime.now().hour
        
        for h in range(horizon_hours):
            future_hour = (current_hour + h) % 24
            
            # Simulate risk prediction based on hour
            if 7 <= future_hour <= 9 or 17 <= future_hour <= 19:
                predicted_risk = 0.5 + np.random.uniform(0, 0.2)
            elif 0 <= future_hour <= 5:
                predicted_risk = 0.4 + np.random.uniform(0, 0.3)
            else:
                predicted_risk = 0.2 + np.random.uniform(0, 0.2)
            
            predictions.append({
                "hour": h,
                "predicted_risk": round(predicted_risk, 3),
                "confidence": round(max(0.5, 1 - h * 0.02), 2),
                "risk_level": self.get_risk_level(predicted_risk)
            })
        
        return predictions
