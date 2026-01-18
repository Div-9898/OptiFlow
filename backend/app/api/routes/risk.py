from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from datetime import datetime

from app.db.database import get_db
from app.models.db_models import Vehicle, RiskScore
from app.models.schemas import RiskScoreResponse, RiskPredictionRequest
from app.core.risk.scorer import RiskScorer

router = APIRouter()

risk_scorer = RiskScorer()


@router.get("/risk/assessment")
async def get_fleet_risk_assessment(db: AsyncSession = Depends(get_db)):
    """Get current risk assessment for entire fleet"""
    result = await db.execute(select(Vehicle))
    vehicles = result.scalars().all()
    
    assessments = []
    for vehicle in vehicles:
        # Get latest risk score
        score_result = await db.execute(
            select(RiskScore)
            .where(RiskScore.vehicle_id == vehicle.id)
            .order_by(RiskScore.created_at.desc())
            .limit(1)
        )
        latest_score = score_result.scalar_one_or_none()
        
        if latest_score:
            assessments.append({
                "vehicle_id": str(vehicle.id),
                "vehicle_name": vehicle.name,
                "overall": latest_score.overall_score,
                "weather": latest_score.weather_score or 0,
                "traffic": latest_score.traffic_score or 0,
                "driver_fatigue": latest_score.driver_fatigue_score or 0,
                "vehicle_health": latest_score.vehicle_health_score or 0,
                "level": latest_score.risk_level,
                "timestamp": latest_score.created_at.isoformat()
            })
        else:
            # Calculate new risk score
            risk_data = await risk_scorer.calculate_vehicle_risk(vehicle)
            assessments.append(risk_data)
    
    # Calculate fleet averages
    if assessments:
        avg_risk = sum(a["overall"] for a in assessments) / len(assessments)
    else:
        avg_risk = 0
    
    return {
        "fleet_average_risk": round(avg_risk, 3),
        "vehicles": assessments,
        "high_risk_count": len([a for a in assessments if a.get("level") in ["high", "critical"]]),
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/risk/vehicle/{vehicle_id}")
async def get_vehicle_risk(vehicle_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get detailed risk assessment for a specific vehicle"""
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    risk_data = await risk_scorer.calculate_vehicle_risk(vehicle)
    
    # Add historical data
    history_result = await db.execute(
        select(RiskScore)
        .where(RiskScore.vehicle_id == vehicle_id)
        .order_by(RiskScore.created_at.desc())
        .limit(24)  # Last 24 readings
    )
    history = history_result.scalars().all()
    
    risk_data["history"] = [
        {
            "overall": h.overall_score,
            "timestamp": h.created_at.isoformat()
        }
        for h in history
    ]
    
    return risk_data


@router.post("/risk/predict/{vehicle_id}")
async def predict_vehicle_risk(
    vehicle_id: UUID,
    horizon: int = 24,
    db: AsyncSession = Depends(get_db)
):
    """Predict future risk for a vehicle"""
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    predictions = await risk_scorer.predict_risk(vehicle, horizon_hours=horizon)
    
    return {
        "vehicle_id": str(vehicle_id),
        "horizon_hours": horizon,
        "predictions": predictions,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/risk/alerts")
async def get_risk_alerts(db: AsyncSession = Depends(get_db)):
    """Get current active risk alerts"""
    # Get vehicles with high/critical risk
    result = await db.execute(
        select(RiskScore)
        .where(RiskScore.risk_level.in_(["high", "critical"]))
        .order_by(RiskScore.created_at.desc())
        .limit(20)
    )
    high_risk_scores = result.scalars().all()
    
    alerts = []
    for score in high_risk_scores:
        alerts.append({
            "id": str(score.id),
            "vehicle_id": str(score.vehicle_id),
            "risk_level": score.risk_level,
            "overall_score": score.overall_score,
            "factors": {
                "weather": score.weather_score,
                "traffic": score.traffic_score,
                "driver_fatigue": score.driver_fatigue_score,
                "vehicle_health": score.vehicle_health_score
            },
            "timestamp": score.created_at.isoformat(),
            "recommendation": risk_scorer.get_recommendation(score.risk_level)
        })
    
    return {"alerts": alerts, "count": len(alerts)}
