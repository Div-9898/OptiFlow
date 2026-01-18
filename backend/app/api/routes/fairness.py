from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.db.database import get_db
from app.models.schemas import (
    FairnessMetricsResponse,
    CounterfactualRequest,
    CounterfactualResponse
)
from app.core.fairness.auditor import FairnessAuditor

router = APIRouter()

fairness_auditor = FairnessAuditor()


@router.get("/fairness/audit")
async def run_fairness_audit(db: AsyncSession = Depends(get_db)):
    """Run comprehensive fairness audit"""
    try:
        metrics = await fairness_auditor.run_audit(db)
        
        return {
            "demographic_parity": metrics["demographic_parity"],
            "geographic_equity": metrics["geographic_equity"],
            "temporal_fairness": metrics["temporal_fairness"],
            "gini_coefficient": metrics["gini_coefficient"],
            "disparate_impact_ratio": metrics["disparate_impact_ratio"],
            "overall_fairness_score": metrics["overall_score"],
            "recommendations": metrics["recommendations"],
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fairness audit failed: {str(e)}")


@router.post("/fairness/counterfactual", response_model=CounterfactualResponse)
async def run_counterfactual_analysis(
    request: CounterfactualRequest,
    db: AsyncSession = Depends(get_db)
):
    """Run counterfactual analysis - what if analysis"""
    try:
        result = await fairness_auditor.counterfactual_analysis(
            customer_id=request.customer_id,
            changes=request.changes,
            db=db
        )
        
        return CounterfactualResponse(
            original_priority=result["original_priority"],
            counterfactual_priority=result["counterfactual_priority"],
            feature_importance=result["feature_importance"],
            bias_detected=result["bias_detected"],
            explanation=result["explanation"]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Counterfactual analysis failed: {str(e)}")


@router.get("/fairness/geographic-equity")
async def get_geographic_equity(db: AsyncSession = Depends(get_db)):
    """Get geographic equity heat map data"""
    try:
        equity_data = await fairness_auditor.calculate_geographic_equity(db)
        
        return {
            "zones": equity_data["zones"],
            "overall_equity_score": equity_data["overall_score"],
            "underserved_areas": equity_data["underserved"],
            "overserved_areas": equity_data["overserved"],
            "recommendations": equity_data["recommendations"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Geographic equity analysis failed: {str(e)}")


@router.get("/fairness/driver-workload")
async def get_driver_workload_distribution(db: AsyncSession = Depends(get_db)):
    """Get driver workload distribution with Gini coefficient"""
    try:
        workload_data = await fairness_auditor.calculate_driver_workload(db)
        
        return {
            "drivers": workload_data["drivers"],
            "gini_coefficient": workload_data["gini_coefficient"],
            "is_fair": workload_data["gini_coefficient"] < 0.3,
            "distribution_percentiles": workload_data["percentiles"],
            "recommendations": workload_data["recommendations"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workload analysis failed: {str(e)}")


@router.get("/fairness/temporal")
async def get_temporal_fairness(db: AsyncSession = Depends(get_db)):
    """Analyze temporal fairness - delivery times by zone/customer type"""
    try:
        temporal_data = await fairness_auditor.calculate_temporal_fairness(db)
        
        return {
            "by_hour": temporal_data["by_hour"],
            "by_day": temporal_data["by_day"],
            "by_zone": temporal_data["by_zone"],
            "variance": temporal_data["variance"],
            "is_fair": temporal_data["variance"] < 0.2,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Temporal fairness analysis failed: {str(e)}")


@router.get("/fairness/bias-alerts")
async def get_bias_alerts(db: AsyncSession = Depends(get_db)):
    """Get active bias alerts"""
    try:
        alerts = await fairness_auditor.get_bias_alerts(db)
        
        return {
            "alerts": alerts,
            "count": len(alerts),
            "critical_count": len([a for a in alerts if a.get("severity") == "high"])
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get bias alerts: {str(e)}")
