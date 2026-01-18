import numpy as np
from typing import Dict, List, Any
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


class FairnessAuditor:
    """Fairness auditing framework for bias detection"""
    
    def __init__(self):
        self.fairness_threshold = 0.8  # 80% parity threshold
    
    async def run_audit(self, db: AsyncSession) -> Dict[str, Any]:
        """Run comprehensive fairness audit"""
        
        # Calculate all metrics
        demographic_parity = await self._calculate_demographic_parity(db)
        geographic_equity = await self._calculate_geographic_equity_score(db)
        temporal_fairness = await self._calculate_temporal_fairness_score(db)
        gini = await self._calculate_gini_coefficient(db)
        disparate_impact = await self._calculate_disparate_impact(db)
        
        # Calculate overall score
        overall_score = (
            demographic_parity * 0.25 +
            geographic_equity * 0.25 +
            temporal_fairness * 0.25 +
            (1 - gini) * 0.25  # Lower Gini is better
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            demographic_parity,
            geographic_equity,
            temporal_fairness,
            gini,
            disparate_impact
        )
        
        return {
            "demographic_parity": round(demographic_parity, 4),
            "geographic_equity": round(geographic_equity, 4),
            "temporal_fairness": round(temporal_fairness, 4),
            "gini_coefficient": round(gini, 4),
            "disparate_impact_ratio": round(disparate_impact, 4),
            "overall_score": round(overall_score, 4),
            "recommendations": recommendations
        }
    
    async def _calculate_demographic_parity(self, db: AsyncSession) -> float:
        """Calculate demographic parity across customer segments"""
        # In production, query actual delivery data by customer segments
        # Simulated: service rates by segment
        segments = {
            "residential": 0.92,
            "commercial": 0.95,
            "industrial": 0.88
        }
        
        avg_rate = np.mean(list(segments.values()))
        max_diff = max(abs(r - avg_rate) for r in segments.values())
        
        # Parity score: 1 if all equal, lower if differences exist
        parity = 1 - (max_diff / avg_rate) if avg_rate > 0 else 0
        return max(0, min(1, parity))
    
    async def _calculate_geographic_equity_score(self, db: AsyncSession) -> float:
        """Calculate equity across geographic zones"""
        # Simulated zone coverage rates
        zones = {
            "downtown": 0.98,
            "suburbs_north": 0.91,
            "suburbs_south": 0.89,
            "industrial_east": 0.85,
            "outskirts": 0.78
        }
        
        avg_coverage = np.mean(list(zones.values()))
        variance = np.var(list(zones.values()))
        
        # Lower variance = higher equity
        equity_score = 1 - min(variance * 10, 1)  # Scale variance
        return max(0, min(1, equity_score))
    
    async def _calculate_temporal_fairness_score(self, db: AsyncSession) -> float:
        """Calculate fairness in delivery times across periods"""
        # Simulated average delivery times by period (in minutes)
        periods = {
            "morning": 32,
            "midday": 28,
            "afternoon": 35,
            "evening": 42
        }
        
        avg_time = np.mean(list(periods.values()))
        max_deviation = max(abs(t - avg_time) for t in periods.values())
        
        # Score based on consistency
        fairness = 1 - (max_deviation / avg_time) if avg_time > 0 else 0
        return max(0, min(1, fairness))
    
    async def _calculate_gini_coefficient(self, db: AsyncSession) -> float:
        """Calculate Gini coefficient for driver workload distribution"""
        # Simulated driver workloads (deliveries per driver)
        workloads = np.array([45, 42, 48, 38, 52, 41, 47, 39, 50, 44,
                              43, 46, 40, 49, 41, 45, 42, 48, 37, 51,
                              44, 46, 43, 47, 45])
        
        sorted_workloads = np.sort(workloads)
        n = len(workloads)
        cumulative = np.cumsum(sorted_workloads)
        
        gini = (2 * np.sum(np.arange(1, n + 1) * sorted_workloads)) / (n * np.sum(workloads)) - (n + 1) / n
        return max(0, min(1, gini))
    
    async def _calculate_disparate_impact(self, db: AsyncSession) -> float:
        """Calculate disparate impact ratio"""
        # Simulated priority assignment rates
        protected_group_rate = 0.72  # e.g., certain zones
        reference_group_rate = 0.85
        
        if reference_group_rate == 0:
            return 1.0
        
        ratio = protected_group_rate / reference_group_rate
        return round(ratio, 4)
    
    def _generate_recommendations(
        self,
        demographic_parity: float,
        geographic_equity: float,
        temporal_fairness: float,
        gini: float,
        disparate_impact: float
    ) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        if demographic_parity < 0.8:
            recommendations.append(
                "Consider reviewing service prioritization across customer segments"
            )
        
        if geographic_equity < 0.8:
            recommendations.append(
                "Increase resource allocation to underserved zones"
            )
        
        if temporal_fairness < 0.8:
            recommendations.append(
                "Optimize scheduling to reduce delivery time variance across periods"
            )
        
        if gini > 0.3:
            recommendations.append(
                "Rebalance driver assignments to reduce workload inequality"
            )
        
        if disparate_impact < 0.8:
            recommendations.append(
                "Review priority assignment algorithm for potential bias"
            )
        
        if not recommendations:
            recommendations.append("System is operating within fairness thresholds")
        
        return recommendations
    
    async def counterfactual_analysis(
        self,
        customer_id: str,
        changes: Dict[str, Any],
        db: AsyncSession
    ) -> Dict[str, Any]:
        """Perform counterfactual what-if analysis"""
        
        # Simulated original and counterfactual outcomes
        original_features = {
            "zone": "suburbs_south",
            "customer_type": "residential",
            "order_value": 150
        }
        
        # Apply changes
        counterfactual_features = {**original_features, **changes}
        
        # Simulate priority prediction
        original_priority = "medium"
        
        # Check if change affects priority
        if "zone" in changes and changes["zone"] == "downtown":
            counterfactual_priority = "high"
        elif "customer_type" in changes and changes["customer_type"] == "commercial":
            counterfactual_priority = "high"
        else:
            counterfactual_priority = original_priority
        
        # Calculate feature importance (simulated SHAP values)
        feature_importance = {
            "zone": 0.35,
            "customer_type": 0.30,
            "order_value": 0.20,
            "time_window": 0.15
        }
        
        bias_detected = original_priority != counterfactual_priority
        
        explanation = (
            f"Changing {list(changes.keys())} from {original_features.get(list(changes.keys())[0])} "
            f"to {changes[list(changes.keys())[0]]} "
            f"{'would change' if bias_detected else 'would not change'} the priority assignment."
        )
        
        return {
            "original_priority": original_priority,
            "counterfactual_priority": counterfactual_priority,
            "feature_importance": feature_importance,
            "bias_detected": bias_detected,
            "explanation": explanation
        }
    
    async def calculate_geographic_equity(self, db: AsyncSession) -> Dict[str, Any]:
        """Get detailed geographic equity data"""
        zones = [
            {"id": "downtown", "name": "Downtown Dubai", "coverage": 0.98, "deliveries": 450, "lat": 25.2048, "lng": 55.2708},
            {"id": "marina", "name": "Dubai Marina", "coverage": 0.95, "deliveries": 380, "lat": 25.0805, "lng": 55.1403},
            {"id": "deira", "name": "Deira", "coverage": 0.88, "deliveries": 320, "lat": 25.2697, "lng": 55.3095},
            {"id": "jumeirah", "name": "Jumeirah", "coverage": 0.92, "deliveries": 290, "lat": 25.2106, "lng": 55.2538},
            {"id": "al_quoz", "name": "Al Quoz Industrial", "coverage": 0.78, "deliveries": 180, "lat": 25.1336, "lng": 55.2272}
        ]
        
        coverages = [z["coverage"] for z in zones]
        overall_score = np.mean(coverages)
        
        underserved = [z for z in zones if z["coverage"] < 0.85]
        overserved = [z for z in zones if z["coverage"] > 0.95]
        
        return {
            "zones": zones,
            "overall_score": round(overall_score, 4),
            "underserved": [z["id"] for z in underserved],
            "overserved": [z["id"] for z in overserved],
            "recommendations": [
                f"Increase coverage in {z['name']}" for z in underserved
            ]
        }
    
    async def calculate_driver_workload(self, db: AsyncSession) -> Dict[str, Any]:
        """Get driver workload distribution"""
        # Simulated driver data
        drivers = [
            {"id": f"driver_{i}", "name": f"Driver {i}", "deliveries": 40 + np.random.randint(-10, 15)}
            for i in range(25)
        ]
        
        workloads = np.array([d["deliveries"] for d in drivers])
        gini = await self._calculate_gini_coefficient(db)
        
        percentiles = {
            "p10": float(np.percentile(workloads, 10)),
            "p25": float(np.percentile(workloads, 25)),
            "p50": float(np.percentile(workloads, 50)),
            "p75": float(np.percentile(workloads, 75)),
            "p90": float(np.percentile(workloads, 90))
        }
        
        recommendations = []
        if gini > 0.3:
            recommendations.append("Consider rebalancing assignments")
        
        return {
            "drivers": drivers,
            "gini_coefficient": gini,
            "percentiles": percentiles,
            "recommendations": recommendations
        }
    
    async def calculate_temporal_fairness(self, db: AsyncSession) -> Dict[str, Any]:
        """Get temporal fairness analysis"""
        by_hour = {str(h): 25 + np.random.randint(-5, 10) for h in range(8, 20)}
        by_day = {
            "Monday": 145, "Tuesday": 152, "Wednesday": 148,
            "Thursday": 155, "Friday": 138, "Saturday": 98, "Sunday": 75
        }
        by_zone = {
            "downtown": 32, "marina": 28, "deira": 35,
            "jumeirah": 30, "al_quoz": 40
        }
        
        all_times = list(by_zone.values())
        variance = float(np.var(all_times) / np.mean(all_times) if all_times else 0)
        
        return {
            "by_hour": by_hour,
            "by_day": by_day,
            "by_zone": by_zone,
            "variance": round(variance, 4)
        }
    
    async def get_bias_alerts(self, db: AsyncSession) -> List[Dict[str, Any]]:
        """Get active bias alerts"""
        alerts = [
            {
                "id": "alert_1",
                "type": "geographic_disparity",
                "severity": "medium",
                "description": "Al Quoz Industrial zone has 22% lower coverage than average",
                "affected_group": "Al Quoz customers",
                "recommendation": "Add 2 more vehicles to this zone during peak hours",
                "timestamp": datetime.utcnow().isoformat()
            },
            {
                "id": "alert_2",
                "type": "temporal_disparity",
                "severity": "low",
                "description": "Evening deliveries take 15% longer than morning",
                "affected_group": "Evening customers",
                "recommendation": "Review evening routing algorithms",
                "timestamp": datetime.utcnow().isoformat()
            }
        ]
        return alerts
