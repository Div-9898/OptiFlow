from fastapi import APIRouter, HTTPException
from datetime import datetime

from app.models.schemas import StakeholderNetworkResponse
from app.core.stakeholders.network import StakeholderNetwork
from app.db.database import get_neo4j_driver

router = APIRouter()

stakeholder_network = StakeholderNetwork()


@router.get("/stakeholders/network", response_model=StakeholderNetworkResponse)
async def get_stakeholder_network():
    """Get complete stakeholder network graph"""
    try:
        network = await stakeholder_network.get_network()
        
        return StakeholderNetworkResponse(
            nodes=network["nodes"],
            links=network["links"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get network: {str(e)}")


@router.get("/stakeholders/{stakeholder_id}")
async def get_stakeholder_details(stakeholder_id: str):
    """Get detailed information about a specific stakeholder"""
    try:
        stakeholder = await stakeholder_network.get_stakeholder(stakeholder_id)
        
        if not stakeholder:
            raise HTTPException(status_code=404, detail="Stakeholder not found")
        
        return stakeholder
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stakeholder: {str(e)}")


@router.get("/stakeholders/{stakeholder_id}/impact/{policy_id}")
async def get_stakeholder_policy_impact(stakeholder_id: str, policy_id: str):
    """Get impact of a policy on a specific stakeholder"""
    try:
        impact = await stakeholder_network.calculate_policy_impact(
            stakeholder_id=stakeholder_id,
            policy_id=policy_id
        )
        
        return {
            "stakeholder_id": stakeholder_id,
            "policy_id": policy_id,
            "impact_score": impact["score"],
            "positive_effects": impact["positive"],
            "negative_effects": impact["negative"],
            "net_benefit": impact["net_benefit"],
            "confidence": impact["confidence"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Impact analysis failed: {str(e)}")


@router.get("/stakeholders/power-interest-matrix")
async def get_power_interest_matrix():
    """Get power/interest matrix categorization"""
    try:
        matrix = await stakeholder_network.get_power_interest_matrix()
        
        return {
            "quadrants": {
                "high_power_high_interest": matrix["manage_closely"],
                "high_power_low_interest": matrix["keep_satisfied"],
                "low_power_high_interest": matrix["keep_informed"],
                "low_power_low_interest": matrix["monitor"]
            },
            "stakeholder_positions": matrix["positions"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matrix analysis failed: {str(e)}")


@router.post("/stakeholders/simulate-policy")
async def simulate_policy_impact(policy: dict):
    """Simulate impact of a proposed policy on all stakeholders"""
    try:
        simulation = await stakeholder_network.simulate_policy(policy)
        
        return {
            "policy": policy,
            "stakeholder_impacts": simulation["impacts"],
            "overall_support": simulation["overall_support"],
            "risk_areas": simulation["risks"],
            "recommendations": simulation["recommendations"],
            "simulated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Policy simulation failed: {str(e)}")


@router.get("/stakeholders/relationships")
async def get_all_relationships():
    """Get all stakeholder relationships"""
    try:
        relationships = await stakeholder_network.get_all_relationships()
        
        return {
            "relationships": relationships,
            "relationship_types": [
                "influences",
                "depends_on",
                "conflicts_with",
                "benefits_from"
            ],
            "count": len(relationships)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get relationships: {str(e)}")
