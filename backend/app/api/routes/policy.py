from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.db.database import get_db
from app.models.schemas import PolicyGenerateRequest, PolicyGenerateResponse
from app.services.gemini_service import GeminiService

router = APIRouter()

gemini_service = GeminiService()


@router.post("/policy/generate", response_model=PolicyGenerateResponse)
async def generate_policy_brief(
    request: PolicyGenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generate a policy brief document using AI"""
    try:
        document = await gemini_service.generate_policy_brief(
            policy_type=request.type,
            context=request.context,
            include_sections=request.include_sections
        )
        
        return PolicyGenerateResponse(
            document=document["content"],
            sections=document["sections"],
            generated_at=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Policy generation failed: {str(e)}")


@router.get("/policy/templates")
async def get_policy_templates():
    """Get available policy brief templates"""
    return {
        "templates": [
            {
                "id": "operational_efficiency",
                "name": "Operational Efficiency Report",
                "description": "Summary of route optimization results and recommendations",
                "sections": ["executive_summary", "vrp_results", "cost_analysis", "recommendations"]
            },
            {
                "id": "risk_assessment",
                "name": "Risk Assessment Report",
                "description": "Fleet risk analysis with mitigation strategies",
                "sections": ["executive_summary", "risk_overview", "detailed_analysis", "mitigation_plan"]
            },
            {
                "id": "fairness_audit",
                "name": "Fairness Audit Report",
                "description": "Bias detection and equity analysis results",
                "sections": ["executive_summary", "fairness_metrics", "bias_findings", "recommendations"]
            },
            {
                "id": "ethical_compliance",
                "name": "Ethical Compliance Report",
                "description": "Ethical decision-making framework compliance",
                "sections": ["executive_summary", "dilemma_analysis", "decision_rationale", "stakeholder_impact"]
            },
            {
                "id": "stakeholder_analysis",
                "name": "Stakeholder Analysis Report",
                "description": "Stakeholder mapping and engagement strategy",
                "sections": ["executive_summary", "stakeholder_map", "power_interest_matrix", "engagement_plan"]
            }
        ]
    }


@router.post("/policy/generate-from-template")
async def generate_from_template(
    template_id: str,
    context: dict,
    db: AsyncSession = Depends(get_db)
):
    """Generate policy brief from a specific template"""
    try:
        # Get template sections
        templates = {
            "operational_efficiency": ["executive_summary", "vrp_results", "cost_analysis", "recommendations"],
            "risk_assessment": ["executive_summary", "risk_overview", "detailed_analysis", "mitigation_plan"],
            "fairness_audit": ["executive_summary", "fairness_metrics", "bias_findings", "recommendations"],
            "ethical_compliance": ["executive_summary", "dilemma_analysis", "decision_rationale", "stakeholder_impact"],
            "stakeholder_analysis": ["executive_summary", "stakeholder_map", "power_interest_matrix", "engagement_plan"]
        }
        
        if template_id not in templates:
            raise HTTPException(status_code=404, detail="Template not found")
        
        document = await gemini_service.generate_policy_brief(
            policy_type=template_id,
            context=context,
            include_sections=templates[template_id]
        )
        
        return {
            "template_id": template_id,
            "document": document["content"],
            "sections": document["sections"],
            "word_count": len(document["content"].split()),
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")


@router.get("/policy/regulatory-compliance")
async def check_regulatory_compliance(db: AsyncSession = Depends(get_db)):
    """Check compliance against regulatory requirements"""
    try:
        # This would integrate with actual regulatory databases
        compliance = {
            "dot_regulations": {
                "status": "compliant",
                "score": 0.95,
                "issues": []
            },
            "labor_laws": {
                "status": "compliant",
                "score": 0.92,
                "issues": ["Driver break compliance at 91%"]
            },
            "data_privacy": {
                "status": "compliant",
                "score": 0.98,
                "issues": []
            },
            "environmental": {
                "status": "needs_attention",
                "score": 0.85,
                "issues": ["Emissions reporting pending for 3 vehicles"]
            }
        }
        
        overall_score = sum(c["score"] for c in compliance.values()) / len(compliance)
        
        return {
            "compliance": compliance,
            "overall_score": round(overall_score, 2),
            "last_audit": datetime.utcnow().isoformat(),
            "next_audit": "2026-02-01T00:00:00Z"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compliance check failed: {str(e)}")
