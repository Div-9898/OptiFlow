from typing import Dict, List, Any, Optional
import numpy as np


class StakeholderNetwork:
    """Stakeholder network management and analysis"""
    
    def __init__(self):
        self.stakeholders = self._load_stakeholders()
        self.relationships = self._load_relationships()
    
    def _load_stakeholders(self) -> Dict[str, Dict]:
        """Load stakeholder definitions"""
        return {
            "company": {
                "id": "company",
                "name": "Logistics Company",
                "type": "company",
                "power": 0.9,
                "interest": 0.95,
                "influence": 0.85,
                "description": "The logistics company operating the platform"
            },
            "drivers": {
                "id": "drivers",
                "name": "Delivery Drivers",
                "type": "drivers",
                "power": 0.6,
                "interest": 0.9,
                "influence": 0.7,
                "description": "Employees who perform deliveries"
            },
            "customers": {
                "id": "customers",
                "name": "Customers",
                "type": "customers",
                "power": 0.7,
                "interest": 0.85,
                "influence": 0.75,
                "description": "End customers receiving deliveries"
            },
            "regulators": {
                "id": "regulators",
                "name": "Regulatory Bodies",
                "type": "regulators",
                "power": 0.85,
                "interest": 0.6,
                "influence": 0.8,
                "description": "Government and regulatory agencies"
            },
            "community": {
                "id": "community",
                "name": "Local Community",
                "type": "community",
                "power": 0.4,
                "interest": 0.5,
                "influence": 0.45,
                "description": "Communities affected by logistics operations"
            },
            "shareholders": {
                "id": "shareholders",
                "name": "Shareholders",
                "type": "shareholders",
                "power": 0.8,
                "interest": 0.9,
                "influence": 0.75,
                "description": "Company investors and shareholders"
            },
            "suppliers": {
                "id": "suppliers",
                "name": "Technology Suppliers",
                "type": "suppliers",
                "power": 0.5,
                "interest": 0.7,
                "influence": 0.55,
                "description": "Technology and vehicle suppliers"
            },
            "competitors": {
                "id": "competitors",
                "name": "Competitors",
                "type": "competitors",
                "power": 0.6,
                "interest": 0.8,
                "influence": 0.5,
                "description": "Competing logistics companies"
            }
        }
    
    def _load_relationships(self) -> List[Dict]:
        """Load stakeholder relationships"""
        return [
            {"source": "company", "target": "drivers", "type": "employs", "strength": 0.9},
            {"source": "company", "target": "customers", "type": "serves", "strength": 0.85},
            {"source": "regulators", "target": "company", "type": "regulates", "strength": 0.8},
            {"source": "company", "target": "community", "type": "impacts", "strength": 0.6},
            {"source": "shareholders", "target": "company", "type": "invests_in", "strength": 0.85},
            {"source": "drivers", "target": "customers", "type": "delivers_to", "strength": 0.9},
            {"source": "regulators", "target": "drivers", "type": "protects", "strength": 0.7},
            {"source": "company", "target": "suppliers", "type": "depends_on", "strength": 0.65},
            {"source": "competitors", "target": "company", "type": "conflicts_with", "strength": 0.4},
            {"source": "customers", "target": "company", "type": "benefits_from", "strength": 0.8},
            {"source": "community", "target": "regulators", "type": "influences", "strength": 0.5},
            {"source": "shareholders", "target": "drivers", "type": "influences", "strength": 0.4}
        ]
    
    async def get_network(self) -> Dict[str, Any]:
        """Get complete stakeholder network"""
        nodes = [
            {
                "id": s["id"],
                "name": s["name"],
                "type": s["type"],
                "power": s["power"],
                "interest": s["interest"],
                "influence": s["influence"]
            }
            for s in self.stakeholders.values()
        ]
        
        links = [
            {
                "source": r["source"],
                "target": r["target"],
                "type": r["type"],
                "strength": r["strength"]
            }
            for r in self.relationships
        ]
        
        return {"nodes": nodes, "links": links}
    
    async def get_stakeholder(self, stakeholder_id: str) -> Optional[Dict]:
        """Get detailed stakeholder information"""
        stakeholder = self.stakeholders.get(stakeholder_id)
        
        if not stakeholder:
            return None
        
        # Get related relationships
        incoming = [r for r in self.relationships if r["target"] == stakeholder_id]
        outgoing = [r for r in self.relationships if r["source"] == stakeholder_id]
        
        return {
            **stakeholder,
            "incoming_relationships": incoming,
            "outgoing_relationships": outgoing,
            "total_connections": len(incoming) + len(outgoing)
        }
    
    async def get_power_interest_matrix(self) -> Dict[str, Any]:
        """Categorize stakeholders by power/interest quadrants"""
        
        manage_closely = []  # High power, high interest
        keep_satisfied = []  # High power, low interest
        keep_informed = []   # Low power, high interest
        monitor = []         # Low power, low interest
        
        positions = []
        
        for s in self.stakeholders.values():
            position = {
                "id": s["id"],
                "name": s["name"],
                "power": s["power"],
                "interest": s["interest"]
            }
            positions.append(position)
            
            if s["power"] >= 0.6 and s["interest"] >= 0.6:
                manage_closely.append(s["id"])
            elif s["power"] >= 0.6:
                keep_satisfied.append(s["id"])
            elif s["interest"] >= 0.6:
                keep_informed.append(s["id"])
            else:
                monitor.append(s["id"])
        
        return {
            "manage_closely": manage_closely,
            "keep_satisfied": keep_satisfied,
            "keep_informed": keep_informed,
            "monitor": monitor,
            "positions": positions
        }
    
    async def calculate_policy_impact(
        self,
        stakeholder_id: str,
        policy_id: str
    ) -> Dict[str, Any]:
        """Calculate impact of a policy on a stakeholder"""
        
        stakeholder = self.stakeholders.get(stakeholder_id)
        if not stakeholder:
            return {"error": "Stakeholder not found"}
        
        # Simulated policy impacts
        policy_impacts = {
            "efficiency_increase": {
                "company": {"positive": ["Higher profits", "Better reputation"], "negative": [], "score": 0.8},
                "drivers": {"positive": ["Less idle time"], "negative": ["Increased workload"], "score": 0.4},
                "customers": {"positive": ["Faster delivery"], "negative": [], "score": 0.7},
                "community": {"positive": [], "negative": ["More traffic"], "score": -0.2}
            },
            "safety_policy": {
                "company": {"positive": ["Reduced liability"], "negative": ["Higher costs"], "score": 0.3},
                "drivers": {"positive": ["Better working conditions"], "negative": [], "score": 0.9},
                "regulators": {"positive": ["Compliance"], "negative": [], "score": 0.8},
                "customers": {"positive": [], "negative": ["Possible delays"], "score": -0.1}
            }
        }
        
        # Default impact if policy not predefined
        default_impact = {"positive": [], "negative": [], "score": 0}
        
        policy_data = policy_impacts.get(policy_id, {})
        impact_data = policy_data.get(stakeholder_id, default_impact)
        
        return {
            "score": impact_data.get("score", 0),
            "positive": impact_data.get("positive", []),
            "negative": impact_data.get("negative", []),
            "net_benefit": impact_data.get("score", 0) > 0,
            "confidence": 0.75
        }
    
    async def simulate_policy(self, policy: Dict) -> Dict[str, Any]:
        """Simulate impact of a policy across all stakeholders"""
        
        impacts = {}
        total_support = 0
        risks = []
        
        for stakeholder_id, stakeholder in self.stakeholders.items():
            # Simulated impact based on stakeholder type and policy
            base_impact = np.random.uniform(-0.3, 0.8)
            weighted_impact = base_impact * stakeholder["power"]
            
            impacts[stakeholder_id] = {
                "name": stakeholder["name"],
                "impact_score": round(base_impact, 2),
                "weighted_impact": round(weighted_impact, 2),
                "sentiment": "positive" if base_impact > 0.3 else "neutral" if base_impact > -0.2 else "negative"
            }
            
            total_support += weighted_impact
            
            if base_impact < -0.3 and stakeholder["power"] > 0.6:
                risks.append(f"{stakeholder['name']} may oppose this policy")
        
        # Normalize support score
        overall_support = total_support / len(self.stakeholders)
        
        recommendations = []
        if overall_support < 0.3:
            recommendations.append("Consider revising policy to address stakeholder concerns")
        if len(risks) > 0:
            recommendations.append("Engage with high-power opponents before implementation")
        if overall_support > 0.5:
            recommendations.append("Policy has strong stakeholder support")
        
        return {
            "impacts": impacts,
            "overall_support": round(overall_support, 2),
            "risks": risks,
            "recommendations": recommendations
        }
    
    async def get_all_relationships(self) -> List[Dict]:
        """Get all stakeholder relationships"""
        return self.relationships
