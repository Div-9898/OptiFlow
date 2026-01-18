import numpy as np
from typing import Dict, Any, List
import asyncio


class MonteCarloSimulator:
    """Monte Carlo simulation for ethical decision outcomes"""
    
    def __init__(self, num_simulations: int = 1000):
        self.default_simulations = num_simulations
    
    async def run_simulation(
        self,
        scenario: Dict,
        decision: str,
        num_simulations: int = None
    ) -> Dict[str, Any]:
        """Run Monte Carlo simulation for a decision"""
        
        n = num_simulations or self.default_simulations
        
        # Find selected option
        selected_option = None
        for option in scenario["options"]:
            if option["id"] == decision:
                selected_option = option
                break
        
        if not selected_option:
            raise ValueError(f"Invalid decision: {decision}")
        
        # Base probabilities from ethical scores
        base_scores = selected_option["ethical_scores"]
        base_success_prob = np.mean(list(base_scores.values()))
        
        # Run simulations
        outcomes = await self._simulate_outcomes(
            base_success_prob,
            scenario,
            decision,
            n
        )
        
        # Calculate statistics
        success_rate = np.mean([o["success"] for o in outcomes])
        costs = [o["cost"] for o in outcomes]
        avg_cost = np.mean(costs)
        
        # Risk distribution (binned)
        risk_scores = [o["risk"] for o in outcomes]
        risk_distribution = np.histogram(risk_scores, bins=10, range=(0, 1))[0]
        risk_distribution = (risk_distribution / n).tolist()
        
        # Confidence interval (95%)
        sorted_costs = np.sort(costs)
        ci_lower = sorted_costs[int(0.025 * n)]
        ci_upper = sorted_costs[int(0.975 * n)]
        
        return {
            "success_rate": round(float(success_rate), 4),
            "average_cost": round(float(avg_cost), 2),
            "risk_distribution": [round(r, 4) for r in risk_distribution],
            "confidence_interval": [round(float(ci_lower), 2), round(float(ci_upper), 2)],
            "simulations": n,
            "percentiles": {
                "p10": round(float(np.percentile(costs, 10)), 2),
                "p50": round(float(np.percentile(costs, 50)), 2),
                "p90": round(float(np.percentile(costs, 90)), 2)
            }
        }
    
    async def _simulate_outcomes(
        self,
        base_prob: float,
        scenario: Dict,
        decision: str,
        n: int
    ) -> List[Dict]:
        """Simulate n outcomes with environmental variability"""
        
        outcomes = []
        
        # Run in batches to avoid blocking
        batch_size = 100
        
        for batch_start in range(0, n, batch_size):
            batch_end = min(batch_start + batch_size, n)
            batch_outcomes = []
            
            for _ in range(batch_end - batch_start):
                # Random environmental factors
                weather_factor = np.random.beta(2, 5)  # Skewed towards good weather
                traffic_factor = np.random.beta(3, 4)  # Moderate traffic
                driver_factor = np.random.beta(4, 2)   # Skewed towards good performance
                external_event = np.random.random() < 0.05  # 5% chance of external event
                
                # Calculate success probability with factors
                adjusted_prob = base_prob * (
                    0.3 + 0.2 * (1 - weather_factor) +
                    0.2 * (1 - traffic_factor) +
                    0.3 * driver_factor
                )
                
                if external_event:
                    adjusted_prob *= 0.5  # External event reduces success
                
                success = np.random.random() < adjusted_prob
                
                # Calculate cost
                base_cost = 1000
                cost = base_cost * (
                    1 +
                    weather_factor * 0.3 +
                    traffic_factor * 0.4 +
                    (0 if success else 0.5) +
                    (0.5 if external_event else 0)
                )
                
                # Calculate risk score
                risk = (
                    weather_factor * 0.25 +
                    traffic_factor * 0.25 +
                    (1 - driver_factor) * 0.3 +
                    (0.5 if external_event else 0) * 0.2
                )
                
                batch_outcomes.append({
                    "success": success,
                    "cost": cost,
                    "risk": min(risk, 1.0),
                    "factors": {
                        "weather": weather_factor,
                        "traffic": traffic_factor,
                        "driver": driver_factor,
                        "external_event": external_event
                    }
                })
            
            outcomes.extend(batch_outcomes)
            
            # Yield to event loop periodically
            if batch_start % 500 == 0:
                await asyncio.sleep(0)
        
        return outcomes
    
    async def compare_decisions(
        self,
        scenario: Dict,
        num_simulations: int = None
    ) -> Dict[str, Any]:
        """Compare all decisions using Monte Carlo simulation"""
        
        comparisons = {}
        
        for option in scenario["options"]:
            result = await self.run_simulation(
                scenario,
                option["id"],
                num_simulations
            )
            comparisons[option["id"]] = {
                "description": option["description"],
                "success_rate": result["success_rate"],
                "average_cost": result["average_cost"],
                "risk_profile": result["risk_distribution"]
            }
        
        # Determine best decision
        best_decision = max(
            comparisons.items(),
            key=lambda x: x[1]["success_rate"] - x[1]["average_cost"] / 10000
        )
        
        return {
            "comparisons": comparisons,
            "recommended": best_decision[0],
            "recommendation_reason": f"Highest success rate ({best_decision[1]['success_rate']:.1%}) with acceptable cost"
        }
