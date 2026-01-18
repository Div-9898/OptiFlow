from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid


class EthicalSimulator:
    """Ethical dilemma simulator with multi-framework evaluation"""
    
    DILEMMA_TYPES = [
        "resource_allocation",
        "safety_vs_deadline",
        "privacy_vs_optimization",
        "fairness_vs_profit",
        "transparency_vs_efficiency"
    ]
    
    FRAMEWORK_WEIGHTS = {
        "utilitarian": 0.30,
        "deontological": 0.25,
        "virtue_ethics": 0.25,
        "care_ethics": 0.20
    }
    
    def __init__(self):
        self.scenarios = self._load_scenarios()
    
    def _load_scenarios(self) -> Dict[str, Dict]:
        """Load predefined ethical scenarios"""
        return {
            "scenario_1": {
                "id": "scenario_1",
                "type": "resource_allocation",
                "situation": "During peak delivery hours, you have 3 vehicles but 5 urgent deliveries. Two deliveries are for hospitals (medical supplies), two for regular customers with time-sensitive packages, and one for a high-value corporate client.",
                "stakeholders": ["Hospitals", "Regular Customers", "Corporate Client", "Drivers", "Company"],
                "options": [
                    {
                        "id": "opt_a",
                        "description": "Prioritize hospital deliveries and corporate client, delay regular customers",
                        "tradeoffs": ["Medical needs met", "High-value client satisfied", "Regular customers disappointed"],
                        "ethical_scores": {"utilitarian": 0.8, "deontological": 0.7, "virtue_ethics": 0.75, "care_ethics": 0.65}
                    },
                    {
                        "id": "opt_b",
                        "description": "First-come-first-served regardless of urgency",
                        "tradeoffs": ["Fair process", "Potentially life-threatening delays", "Equal treatment"],
                        "ethical_scores": {"utilitarian": 0.4, "deontological": 0.9, "virtue_ethics": 0.5, "care_ethics": 0.3}
                    },
                    {
                        "id": "opt_c",
                        "description": "Prioritize purely by delivery value/profit",
                        "tradeoffs": ["Maximum profit", "Medical supplies delayed", "Equity concerns"],
                        "ethical_scores": {"utilitarian": 0.5, "deontological": 0.3, "virtue_ethics": 0.2, "care_ethics": 0.2}
                    }
                ]
            },
            "scenario_2": {
                "id": "scenario_2",
                "type": "safety_vs_deadline",
                "situation": "A driver reports feeling fatigued but has 3 more deliveries to complete before the guaranteed delivery window closes. Weather is deteriorating.",
                "stakeholders": ["Driver", "Customers", "Company", "Other Road Users"],
                "options": [
                    {
                        "id": "opt_a",
                        "description": "Allow driver to rest, miss delivery windows",
                        "tradeoffs": ["Driver safety ensured", "Customers disappointed", "Potential refunds"],
                        "ethical_scores": {"utilitarian": 0.6, "deontological": 0.9, "virtue_ethics": 0.85, "care_ethics": 0.95}
                    },
                    {
                        "id": "opt_b",
                        "description": "Complete deliveries, offer bonus to driver",
                        "tradeoffs": ["Commitments met", "Safety risk", "Financial incentive"],
                        "ethical_scores": {"utilitarian": 0.5, "deontological": 0.3, "virtue_ethics": 0.3, "care_ethics": 0.4}
                    },
                    {
                        "id": "opt_c",
                        "description": "Reassign to another driver, incur delay",
                        "tradeoffs": ["Safety maintained", "Moderate delay", "Extra cost"],
                        "ethical_scores": {"utilitarian": 0.75, "deontological": 0.8, "virtue_ethics": 0.8, "care_ethics": 0.85}
                    }
                ]
            },
            "scenario_3": {
                "id": "scenario_3",
                "type": "privacy_vs_optimization",
                "situation": "The AI system can improve delivery efficiency by 25% if it accesses detailed customer behavioral data including shopping patterns and home occupancy schedules.",
                "stakeholders": ["Customers", "Company", "Drivers", "Data Protection Authorities"],
                "options": [
                    {
                        "id": "opt_a",
                        "description": "Collect data with opt-in consent and transparency",
                        "tradeoffs": ["Customer choice respected", "Lower optimization gains", "Trust maintained"],
                        "ethical_scores": {"utilitarian": 0.7, "deontological": 0.95, "virtue_ethics": 0.9, "care_ethics": 0.85}
                    },
                    {
                        "id": "opt_b",
                        "description": "Collect data by default with opt-out option",
                        "tradeoffs": ["Higher participation", "Privacy concerns", "Regulatory risk"],
                        "ethical_scores": {"utilitarian": 0.75, "deontological": 0.4, "virtue_ethics": 0.5, "care_ethics": 0.55}
                    },
                    {
                        "id": "opt_c",
                        "description": "Do not collect behavioral data",
                        "tradeoffs": ["Privacy protected", "Efficiency gains lost", "Competitive disadvantage"],
                        "ethical_scores": {"utilitarian": 0.5, "deontological": 0.9, "virtue_ethics": 0.85, "care_ethics": 0.8}
                    }
                ]
            }
        }
    
    async def get_scenarios(self, dilemma_type: Optional[str] = None) -> List[Dict]:
        """Get available scenarios, optionally filtered by type"""
        scenarios = list(self.scenarios.values())
        
        if dilemma_type:
            scenarios = [s for s in scenarios if s["type"] == dilemma_type]
        
        return scenarios
    
    async def get_scenario_by_id(self, scenario_id: str) -> Optional[Dict]:
        """Get a specific scenario by ID"""
        return self.scenarios.get(scenario_id)
    
    async def generate_scenario(self, dilemma_type: str) -> Dict:
        """Generate a new scenario using AI"""
        # In production, this would use Gemini to generate scenarios
        # For now, return a template-based scenario
        
        scenario_id = f"generated_{uuid.uuid4().hex[:8]}"
        
        templates = {
            "resource_allocation": {
                "situation": f"[AI Generated] Resource allocation dilemma in logistics operations...",
                "stakeholders": ["Customers", "Drivers", "Company", "Community"]
            },
            "safety_vs_deadline": {
                "situation": f"[AI Generated] Safety versus deadline conflict...",
                "stakeholders": ["Driver", "Customers", "Company", "Public Safety"]
            }
        }
        
        template = templates.get(dilemma_type, templates["resource_allocation"])
        
        return {
            "id": scenario_id,
            "type": dilemma_type,
            "situation": template["situation"],
            "stakeholders": template["stakeholders"],
            "options": [
                {
                    "id": "opt_a",
                    "description": "Option prioritizing safety/ethics",
                    "tradeoffs": ["Ethical choice", "Potential business impact"],
                    "ethical_scores": {"utilitarian": 0.7, "deontological": 0.9, "virtue_ethics": 0.85, "care_ethics": 0.9}
                },
                {
                    "id": "opt_b",
                    "description": "Option prioritizing efficiency/profit",
                    "tradeoffs": ["Business benefit", "Ethical concerns"],
                    "ethical_scores": {"utilitarian": 0.6, "deontological": 0.4, "virtue_ethics": 0.5, "care_ethics": 0.45}
                },
                {
                    "id": "opt_c",
                    "description": "Balanced compromise option",
                    "tradeoffs": ["Moderate on all fronts", "May not fully satisfy anyone"],
                    "ethical_scores": {"utilitarian": 0.65, "deontological": 0.7, "virtue_ethics": 0.7, "care_ethics": 0.7}
                }
            ],
            "generated_at": datetime.utcnow().isoformat()
        }
    
    async def evaluate_decision(self, scenario: Dict, decision: str) -> Dict[str, Any]:
        """Evaluate a decision against ethical frameworks"""
        
        # Find the selected option
        selected_option = None
        for option in scenario["options"]:
            if option["id"] == decision:
                selected_option = option
                break
        
        if not selected_option:
            raise ValueError(f"Invalid decision: {decision}")
        
        scores = selected_option["ethical_scores"]
        
        # Calculate weighted overall score
        overall = sum(
            scores.get(framework, 0) * weight
            for framework, weight in self.FRAMEWORK_WEIGHTS.items()
        )
        
        # Analyze stakeholder impact
        stakeholder_impact = {}
        for stakeholder in scenario["stakeholders"]:
            # Simulated impact calculation
            stakeholder_impact[stakeholder] = {
                "impact_score": round(0.3 + (overall * 0.5) + (hash(stakeholder) % 20) / 100, 2),
                "sentiment": "positive" if overall > 0.6 else "neutral" if overall > 0.4 else "negative"
            }
        
        # Generate recommendation
        if overall >= 0.75:
            recommendation = "This decision aligns well with ethical principles across frameworks."
        elif overall >= 0.5:
            recommendation = "This decision has mixed ethical implications. Consider stakeholder concerns."
        else:
            recommendation = "This decision may face ethical challenges. Review alternatives."
        
        return {
            "utilitarian": scores.get("utilitarian", 0),
            "deontological": scores.get("deontological", 0),
            "virtue_ethics": scores.get("virtue_ethics", 0),
            "care_ethics": scores.get("care_ethics", 0),
            "overall": round(overall, 3),
            "analysis": f"Decision '{decision}' scores {overall:.1%} on ethical alignment.",
            "stakeholder_impact": stakeholder_impact,
            "recommendation": recommendation
        }
    
    def update_weights(self, weights: Dict[str, float]):
        """Update framework weights"""
        self.FRAMEWORK_WEIGHTS.update(weights)
