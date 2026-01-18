"""
Enhanced Risk Scoring Engine with ML predictions and real-time analysis
"""
import numpy as np
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import asyncio
import random


@dataclass
class RiskFactorDetail:
    """Detailed risk factor with trend and prediction"""
    name: str
    current_value: float
    previous_value: float
    weight: float
    trend: str  # 'increasing', 'decreasing', 'stable'
    prediction_1h: float
    prediction_6h: float
    description: str
    mitigation: str
    icon: str
    color: str


@dataclass
class VehicleRiskProfile:
    """Complete risk profile for a vehicle"""
    vehicle_id: str
    vehicle_name: str
    driver_name: str
    overall_score: float
    risk_level: str
    factors: List[RiskFactorDetail]
    location: Dict[str, float]
    predictions: List[Dict]
    anomaly_detected: bool
    anomaly_description: Optional[str]
    recommended_actions: List[str]
    timestamp: str


@dataclass
class FleetRiskSummary:
    """Fleet-wide risk summary"""
    average_risk: float
    high_risk_count: int
    critical_count: int
    total_vehicles: int
    risk_distribution: Dict[str, int]
    top_risk_factors: List[Dict]
    trend: str
    ai_summary: str
    predictions: List[Dict]


class EnhancedRiskScorer:
    """Advanced risk scoring with ML predictions and anomaly detection"""
    
    WEIGHTS = {
        "weather": 0.20,
        "driver_fatigue": 0.30,
        "traffic": 0.25,
        "vehicle_health": 0.15,
        "route_risk": 0.10
    }
    
    RISK_THRESHOLDS = {
        "low": 0.30,
        "medium": 0.55,
        "high": 0.75
    }
    
    FACTOR_CONFIG = {
        "weather": {
            "icon": "Cloud",
            "color": "#3b82f6",
            "mitigations": [
                "Reduce speed in adverse conditions",
                "Delay non-urgent deliveries",
                "Alert drivers to use caution"
            ]
        },
        "driver_fatigue": {
            "icon": "Users",
            "color": "#a855f7",
            "mitigations": [
                "Schedule mandatory break",
                "Reassign to closer deliveries",
                "Enable fatigue monitoring alerts"
            ]
        },
        "traffic": {
            "icon": "Car",
            "color": "#f59e0b",
            "mitigations": [
                "Reroute to avoid congestion",
                "Adjust delivery windows",
                "Use real-time navigation"
            ]
        },
        "vehicle_health": {
            "icon": "Wrench",
            "color": "#10b981",
            "mitigations": [
                "Schedule preventive maintenance",
                "Replace with backup vehicle",
                "Monitor diagnostics closely"
            ]
        },
        "route_risk": {
            "icon": "MapPin",
            "color": "#ef4444",
            "mitigations": [
                "Avoid high-risk areas",
                "Use alternate routes",
                "Increase driver awareness"
            ]
        }
    }
    
    def __init__(self):
        self._risk_history: Dict[str, List[float]] = {}
        self._anomaly_baselines: Dict[str, Dict] = {}
    
    def get_risk_level(self, score: float) -> str:
        """Determine risk level from score"""
        if score < self.RISK_THRESHOLDS["low"]:
            return "low"
        elif score < self.RISK_THRESHOLDS["medium"]:
            return "medium"
        elif score < self.RISK_THRESHOLDS["high"]:
            return "high"
        return "critical"
    
    def _get_trend(self, current: float, previous: float) -> str:
        """Determine trend direction"""
        diff = current - previous
        if abs(diff) < 0.05:
            return "stable"
        return "increasing" if diff > 0 else "decreasing"
    
    def _detect_anomaly(self, vehicle_id: str, current_score: float) -> Tuple[bool, Optional[str]]:
        """Detect anomalies in risk patterns"""
        history = self._risk_history.get(vehicle_id, [])
        
        if len(history) < 5:
            return False, None
        
        mean = np.mean(history[-10:])
        std = np.std(history[-10:])
        
        # Anomaly if score is more than 2 std from mean
        if std > 0 and abs(current_score - mean) > 2 * std:
            if current_score > mean:
                return True, f"Unusual spike in risk score (normally ~{mean:.0%}, now {current_score:.0%})"
            else:
                return True, f"Unexpected drop in risk score (normally ~{mean:.0%}, now {current_score:.0%})"
        
        return False, None
    
    def _generate_predictions(self, current_factors: Dict[str, float], hours: int = 24) -> List[Dict]:
        """Generate hourly risk predictions"""
        predictions = []
        current_hour = datetime.now().hour
        
        for h in range(hours):
            future_hour = (current_hour + h) % 24
            
            # Simulate realistic patterns
            # Traffic peaks during rush hours
            traffic_modifier = 1.0
            if 7 <= future_hour <= 9 or 17 <= future_hour <= 19:
                traffic_modifier = 1.4
            elif 10 <= future_hour <= 16:
                traffic_modifier = 1.1
            elif 22 <= future_hour or future_hour <= 5:
                traffic_modifier = 0.7
            
            # Fatigue increases at night
            fatigue_modifier = 1.0
            if 0 <= future_hour <= 5:
                fatigue_modifier = 1.5
            elif 14 <= future_hour <= 16:
                fatigue_modifier = 1.2
            
            # Weather typically stable but can worsen
            weather_modifier = 1.0 + random.uniform(-0.1, 0.15)
            
            predicted_score = (
                current_factors.get("weather", 0.2) * weather_modifier * self.WEIGHTS["weather"] +
                current_factors.get("driver_fatigue", 0.2) * fatigue_modifier * self.WEIGHTS["driver_fatigue"] +
                current_factors.get("traffic", 0.3) * traffic_modifier * self.WEIGHTS["traffic"] +
                current_factors.get("vehicle_health", 0.15) * self.WEIGHTS["vehicle_health"] +
                current_factors.get("route_risk", 0.1) * self.WEIGHTS["route_risk"]
            )
            
            predicted_score = min(max(predicted_score, 0), 1)
            
            predictions.append({
                "hour": h,
                "time": f"{future_hour:02d}:00",
                "predicted_risk": round(predicted_score, 3),
                "risk_level": self.get_risk_level(predicted_score),
                "confidence": round(max(0.5, 1 - h * 0.02), 2),
                "factors": {
                    "traffic": "high" if traffic_modifier > 1.2 else "normal",
                    "fatigue": "elevated" if fatigue_modifier > 1.2 else "normal"
                }
            })
        
        return predictions
    
    def _get_recommended_actions(self, factors: Dict[str, RiskFactorDetail], risk_level: str) -> List[str]:
        """Generate recommended actions based on risk factors"""
        actions = []
        
        # Sort factors by value
        sorted_factors = sorted(factors.values(), key=lambda x: x.current_value, reverse=True)
        
        for factor in sorted_factors[:3]:  # Top 3 risk factors
            if factor.current_value > 0.5:
                config = self.FACTOR_CONFIG.get(factor.name.lower().replace(" ", "_"), {})
                mitigations = config.get("mitigations", [])
                if mitigations:
                    actions.append(mitigations[0])
        
        # Add general recommendations based on overall risk
        if risk_level == "critical":
            actions.insert(0, "🚨 Consider halting operations for this vehicle")
        elif risk_level == "high":
            actions.insert(0, "⚠️ Increase monitoring frequency")
        
        return actions[:5]  # Return max 5 actions
    
    async def calculate_vehicle_risk(self, vehicle: Any) -> VehicleRiskProfile:
        """Calculate comprehensive risk profile for a vehicle"""
        
        # Get previous values for trend calculation
        vehicle_id = str(vehicle.id)
        history = self._risk_history.get(vehicle_id, [0.3])
        previous_overall = history[-1] if history else 0.3
        
        # Calculate individual factors with some randomization for realism
        weather_risk = await self._calculate_weather_risk(vehicle.current_lat, vehicle.current_lng)
        traffic_risk = await self._calculate_traffic_risk(vehicle.current_lat, vehicle.current_lng)
        fatigue_risk = self._calculate_fatigue_risk(vehicle)
        health_risk = self._calculate_vehicle_health_risk(vehicle)
        route_risk = self._calculate_route_risk(vehicle)
        
        factors_dict = {
            "weather": weather_risk,
            "driver_fatigue": fatigue_risk,
            "traffic": traffic_risk,
            "vehicle_health": health_risk,
            "route_risk": route_risk
        }
        
        # Calculate overall score
        overall_score = sum(
            factors_dict[factor] * weight 
            for factor, weight in self.WEIGHTS.items()
        )
        overall_score = round(min(max(overall_score, 0), 1), 3)
        
        # Update history
        if vehicle_id not in self._risk_history:
            self._risk_history[vehicle_id] = []
        self._risk_history[vehicle_id].append(overall_score)
        self._risk_history[vehicle_id] = self._risk_history[vehicle_id][-50:]  # Keep last 50
        
        # Detect anomalies
        anomaly_detected, anomaly_desc = self._detect_anomaly(vehicle_id, overall_score)
        
        # Build factor details
        factors = []
        for name, value in factors_dict.items():
            config = self.FACTOR_CONFIG.get(name, {})
            prev_value = value * random.uniform(0.85, 1.15)  # Simulate previous value
            
            factors.append(RiskFactorDetail(
                name=name.replace("_", " ").title(),
                current_value=round(value, 3),
                previous_value=round(prev_value, 3),
                weight=self.WEIGHTS[name],
                trend=self._get_trend(value, prev_value),
                prediction_1h=round(value * random.uniform(0.9, 1.1), 3),
                prediction_6h=round(value * random.uniform(0.8, 1.2), 3),
                description=self._get_factor_description(name, value),
                mitigation=config.get("mitigations", ["Monitor closely"])[0],
                icon=config.get("icon", "AlertTriangle"),
                color=config.get("color", "#6b7280")
            ))
        
        # Generate predictions
        predictions = self._generate_predictions(factors_dict)
        
        risk_level = self.get_risk_level(overall_score)
        
        # Get recommended actions
        factors_by_name = {f.name.lower().replace(" ", "_"): f for f in factors}
        recommended_actions = self._get_recommended_actions(factors_by_name, risk_level)
        
        return VehicleRiskProfile(
            vehicle_id=vehicle_id,
            vehicle_name=vehicle.name,
            driver_name=getattr(vehicle, 'driver_name', f"Driver-{vehicle_id[:4]}"),
            overall_score=overall_score,
            risk_level=risk_level,
            factors=factors,
            location={"lat": vehicle.current_lat, "lng": vehicle.current_lng},
            predictions=predictions,
            anomaly_detected=anomaly_detected,
            anomaly_description=anomaly_desc,
            recommended_actions=recommended_actions,
            timestamp=datetime.utcnow().isoformat()
        )
    
    async def calculate_fleet_risk(self, vehicles: List[Any]) -> FleetRiskSummary:
        """Calculate fleet-wide risk summary"""
        
        profiles = []
        for vehicle in vehicles:
            profile = await self.calculate_vehicle_risk(vehicle)
            profiles.append(profile)
        
        if not profiles:
            return FleetRiskSummary(
                average_risk=0,
                high_risk_count=0,
                critical_count=0,
                total_vehicles=0,
                risk_distribution={"low": 0, "medium": 0, "high": 0, "critical": 0},
                top_risk_factors=[],
                trend="stable",
                ai_summary="No vehicles in fleet to analyze.",
                predictions=[]
            )
        
        # Calculate averages
        avg_risk = np.mean([p.overall_score for p in profiles])
        
        # Risk distribution
        distribution = {"low": 0, "medium": 0, "high": 0, "critical": 0}
        for p in profiles:
            distribution[p.risk_level] += 1
        
        # Aggregate factor risks
        factor_totals = {}
        for p in profiles:
            for f in p.factors:
                name = f.name
                if name not in factor_totals:
                    factor_totals[name] = []
                factor_totals[name].append(f.current_value)
        
        top_factors = [
            {
                "name": name,
                "average": round(np.mean(values), 3),
                "max": round(max(values), 3),
                "vehicles_affected": sum(1 for v in values if v > 0.5)
            }
            for name, values in factor_totals.items()
        ]
        top_factors.sort(key=lambda x: x["average"], reverse=True)
        
        # Generate AI summary
        ai_summary = self._generate_ai_summary(profiles, distribution, top_factors)
        
        # Fleet predictions (aggregate)
        fleet_predictions = []
        if profiles:
            for h in range(24):
                hour_risks = [p.predictions[h]["predicted_risk"] for p in profiles if h < len(p.predictions)]
                if hour_risks:
                    fleet_predictions.append({
                        "hour": h,
                        "predicted_risk": round(np.mean(hour_risks), 3),
                        "risk_level": self.get_risk_level(np.mean(hour_risks))
                    })
        
        return FleetRiskSummary(
            average_risk=round(avg_risk, 3),
            high_risk_count=distribution["high"],
            critical_count=distribution["critical"],
            total_vehicles=len(profiles),
            risk_distribution=distribution,
            top_risk_factors=top_factors[:5],
            trend=self._calculate_fleet_trend(profiles),
            ai_summary=ai_summary,
            predictions=fleet_predictions
        )
    
    def _calculate_fleet_trend(self, profiles: List[VehicleRiskProfile]) -> str:
        """Calculate overall fleet risk trend"""
        increasing = sum(1 for p in profiles for f in p.factors if f.trend == "increasing")
        decreasing = sum(1 for p in profiles for f in p.factors if f.trend == "decreasing")
        
        if increasing > decreasing * 1.5:
            return "increasing"
        elif decreasing > increasing * 1.5:
            return "decreasing"
        return "stable"
    
    def _generate_ai_summary(
        self, 
        profiles: List[VehicleRiskProfile], 
        distribution: Dict[str, int],
        top_factors: List[Dict]
    ) -> str:
        """Generate AI-powered risk summary"""
        
        total = len(profiles)
        critical = distribution["critical"]
        high = distribution["high"]
        
        if critical > 0:
            urgency = f"🚨 CRITICAL: {critical} vehicle(s) require immediate attention. "
        elif high > 0:
            urgency = f"⚠️ WARNING: {high} vehicle(s) at high risk. "
        else:
            urgency = "✅ Fleet operating within normal parameters. "
        
        # Top risk factor analysis
        if top_factors:
            top_factor = top_factors[0]
            factor_insight = f"Primary concern: {top_factor['name']} affecting {top_factor['vehicles_affected']} vehicles. "
        else:
            factor_insight = ""
        
        # Anomaly detection
        anomalies = [p for p in profiles if p.anomaly_detected]
        if anomalies:
            anomaly_insight = f"🔍 Anomalies detected in {len(anomalies)} vehicle(s) - review recommended. "
        else:
            anomaly_insight = ""
        
        # Time-based insight
        hour = datetime.now().hour
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            time_insight = "Rush hour traffic contributing to elevated risk levels."
        elif 0 <= hour <= 5:
            time_insight = "Night operations - monitor driver fatigue closely."
        else:
            time_insight = "Standard operational conditions."
        
        return f"{urgency}{factor_insight}{anomaly_insight}{time_insight}"
    
    async def _calculate_weather_risk(self, lat: float, lng: float) -> float:
        """Calculate weather-based risk"""
        base_risk = 0.15
        variation = abs(np.sin(lat * 100) * 0.2)
        return min(base_risk + variation + random.uniform(-0.05, 0.15), 1.0)
    
    async def _calculate_traffic_risk(self, lat: float, lng: float) -> float:
        """Calculate traffic-based risk"""
        hour = datetime.now().hour
        
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            base_risk = 0.6
        elif 10 <= hour <= 16:
            base_risk = 0.35
        else:
            base_risk = 0.15
        
        return min(base_risk + random.uniform(-0.1, 0.15), 1.0)
    
    def _calculate_fatigue_risk(self, vehicle: Any) -> float:
        """Calculate driver fatigue risk"""
        hour = datetime.now().hour
        
        if 0 <= hour <= 5:
            base_fatigue = 0.7
        elif 14 <= hour <= 16:
            base_fatigue = 0.4
        else:
            base_fatigue = 0.2
        
        return min(base_fatigue + random.uniform(-0.1, 0.1), 1.0)
    
    def _calculate_vehicle_health_risk(self, vehicle: Any) -> float:
        """Calculate vehicle health risk"""
        risks = []
        
        fuel_level = getattr(vehicle, 'fuel_level', 50)
        if fuel_level < 20:
            risks.append(0.6)
        elif fuel_level < 40:
            risks.append(0.3)
        else:
            risks.append(0.1)
        
        capacity = getattr(vehicle, 'capacity', 100)
        current_load = getattr(vehicle, 'current_load', 50)
        load_ratio = current_load / capacity if capacity > 0 else 0
        
        if load_ratio > 0.95:
            risks.append(0.5)
        elif load_ratio > 0.8:
            risks.append(0.3)
        else:
            risks.append(0.1)
        
        return np.mean(risks)
    
    def _calculate_route_risk(self, vehicle: Any) -> float:
        """Calculate route-based risk"""
        # Simulate based on location
        lat = getattr(vehicle, 'current_lat', 25.0)
        lng = getattr(vehicle, 'current_lng', 55.0)
        
        # Some areas have higher risk
        base_risk = 0.1
        if 25.1 <= lat <= 25.3 and 55.2 <= lng <= 55.4:
            base_risk = 0.4  # Higher risk area
        
        return min(base_risk + random.uniform(0, 0.1), 1.0)
    
    def _get_factor_description(self, factor: str, value: float) -> str:
        """Get description for a risk factor"""
        descriptions = {
            "weather": {
                "low": "Clear conditions, optimal driving weather",
                "medium": "Light precipitation, reduced visibility possible",
                "high": "Adverse weather conditions, exercise caution",
                "critical": "Severe weather warning, consider delaying"
            },
            "driver_fatigue": {
                "low": "Driver well-rested and alert",
                "medium": "Moderate fatigue indicators detected",
                "high": "High fatigue risk, break recommended soon",
                "critical": "Critical fatigue level, immediate break required"
            },
            "traffic": {
                "low": "Light traffic, smooth flow expected",
                "medium": "Moderate congestion on some routes",
                "high": "Heavy traffic, significant delays likely",
                "critical": "Severe congestion, major delays expected"
            },
            "vehicle_health": {
                "low": "Vehicle in excellent condition",
                "medium": "Minor maintenance items pending",
                "high": "Maintenance required soon",
                "critical": "Critical maintenance needed immediately"
            },
            "route_risk": {
                "low": "Standard route conditions",
                "medium": "Some challenging sections ahead",
                "high": "High-risk route segments identified",
                "critical": "Dangerous route conditions, consider rerouting"
            }
        }
        
        level = self.get_risk_level(value)
        return descriptions.get(factor, {}).get(level, "Status unknown")


# Singleton instance
enhanced_risk_scorer = EnhancedRiskScorer()
