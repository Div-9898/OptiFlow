from fastapi import APIRouter, HTTPException
from datetime import datetime
from typing import Optional

from app.models.schemas import (
    EthicalDilemmaSchema,
    MonteCarloRequest,
    MonteCarloResponse
)
from app.core.ethics.simulator import EthicalSimulator
from app.core.ethics.monte_carlo import MonteCarloSimulator

router = APIRouter()

ethical_simulator = EthicalSimulator()
monte_carlo = MonteCarloSimulator()


@router.get("/ethics/scenarios")
async def get_ethical_scenarios(dilemma_type: Optional[str] = None):
    """Get available ethical dilemma scenarios"""
    scenarios = await ethical_simulator.get_scenarios(dilemma_type)
    
    return {
        "scenarios": scenarios,
        "count": len(scenarios),
        "types": [
            "resource_allocation",
            "safety_vs_deadline",
            "privacy_vs_optimization",
            "fairness_vs_profit",
            "transparency_vs_efficiency"
        ]
    }


@router.post("/ethics/generate-scenario")
async def generate_scenario(dilemma_type: str):
    """Generate a new ethical dilemma scenario using AI"""
    try:
        scenario = await ethical_simulator.generate_scenario(dilemma_type)
        
        return {
            "scenario": scenario,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate scenario: {str(e)}")


@router.post("/ethics/simulate", response_model=MonteCarloResponse)
async def run_monte_carlo_simulation(request: MonteCarloRequest):
    """Run Monte Carlo simulation for ethical decision"""
    try:
        # Get the scenario
        scenario = await ethical_simulator.get_scenario_by_id(request.scenario_id)
        
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        
        # Run simulation
        result = await monte_carlo.run_simulation(
            scenario=scenario,
            decision=request.decision,
            num_simulations=request.num_simulations
        )
        
        return MonteCarloResponse(
            success_rate=result["success_rate"],
            average_cost=result["average_cost"],
            risk_distribution=result["risk_distribution"],
            confidence_interval=result["confidence_interval"],
            simulations=request.num_simulations
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")


@router.post("/ethics/evaluate-decision")
async def evaluate_decision(scenario_id: str, decision: str):
    """Evaluate a decision against multiple ethical frameworks"""
    try:
        scenario = await ethical_simulator.get_scenario_by_id(scenario_id)
        
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        
        evaluation = await ethical_simulator.evaluate_decision(scenario, decision)
        
        return {
            "scenario_id": scenario_id,
            "decision": decision,
            "ethical_scores": {
                "utilitarian": evaluation["utilitarian"],
                "deontological": evaluation["deontological"],
                "virtue_ethics": evaluation["virtue_ethics"],
                "care_ethics": evaluation["care_ethics"]
            },
            "overall_score": evaluation["overall"],
            "analysis": evaluation["analysis"],
            "stakeholder_impact": evaluation["stakeholder_impact"],
            "recommendation": evaluation["recommendation"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


@router.get("/ethics/framework-weights")
async def get_framework_weights():
    """Get current ethical framework weights"""
    return {
        "frameworks": {
            "utilitarian": {
                "weight": 0.30,
                "description": "Maximize overall good for the greatest number"
            },
            "deontological": {
                "weight": 0.25,
                "description": "Follow moral rules and duties regardless of outcome"
            },
            "virtue_ethics": {
                "weight": 0.25,
                "description": "Act according to virtuous character traits"
            },
            "care_ethics": {
                "weight": 0.20,
                "description": "Prioritize relationships and responsibilities to others"
            }
        },
        "configurable": True
    }


@router.post("/ethics/update-weights")
async def update_framework_weights(weights: dict):
    """Update ethical framework weights"""
    # Validate weights sum to 1.0
    total = sum(weights.values())
    if abs(total - 1.0) > 0.01:
        raise HTTPException(
            status_code=400,
            detail=f"Weights must sum to 1.0, got {total}"
        )
    
    ethical_simulator.update_weights(weights)
    
    return {
        "message": "Weights updated",
        "new_weights": weights
    }
