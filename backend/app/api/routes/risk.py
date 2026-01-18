from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
import asyncio
import random
from dataclasses import asdict

from app.db.database import get_db
from app.models.db_models import Vehicle, RiskScore
from app.models.schemas import RiskScoreResponse, RiskPredictionRequest
from app.core.risk.enhanced_scorer import enhanced_risk_scorer, VehicleRiskProfile, FleetRiskSummary
from app.core.socketio import sio
from app.services.gemini_service import GeminiService
from app.services.redis_service import redis_service

router = APIRouter()
gemini_service = GeminiService()


class RedisVehicle:
    """Wrapper class to convert Redis vehicle data to object format"""
    def __init__(self, data: Dict[str, Any]):
        self.id = data.get('id', str(uuid4()))
        self.name = data.get('name', f"Vehicle-{self.id[:8]}")
        self.driver_name = data.get('driverName', data.get('driver', 'Unknown Driver'))
        self.current_lat = data.get('lat', data.get('currentLat', 25.2048))
        self.current_lng = data.get('lng', data.get('currentLng', 55.2708))
        self.fuel_level = data.get('fuelLevel', 50)
        self.capacity = data.get('capacity', 1000)
        self.current_load = data.get('currentLoad', 500)
        self.status = data.get('status', 'active')
        self.speed = data.get('speed', 0)
        self.heading = data.get('heading', 0)
        
        # Handle sensor data if present
        sensors = data.get('sensors', {})
        if sensors:
            self.fuel_level = sensors.get('fuelLevel', self.fuel_level)


async def get_vehicles_from_redis() -> List[RedisVehicle]:
    """Fetch all vehicles from Redis and convert to vehicle objects"""
    try:
        await redis_service.connect()
        vehicles_data = await redis_service.get_all_vehicles()
        
        if vehicles_data:
            return [RedisVehicle(v) for v in vehicles_data]
        return []
    except Exception as e:
        print(f"Error fetching vehicles from Redis: {e}")
        return []


# Fallback mock vehicle class for when Redis is empty
class MockVehicle:
    def __init__(self, idx: int):
        self.id = str(uuid4())
        self.name = f"Vehicle-{idx + 1:02d}"
        self.driver_name = f"Driver {['Ahmed', 'Mohammed', 'Ali', 'Omar', 'Hassan', 'Yusuf', 'Ibrahim', 'Khalid', 'Saeed', 'Tariq', 'Rashid', 'Faisal', 'Nasser', 'Sultan', 'Majid', 'Hamad', 'Salim', 'Waleed', 'Badr', 'Zayed', 'Mansour', 'Saif', 'Khaled', 'Fahad', 'Abdullah'][idx % 25]}"
        # Dubai area coordinates
        self.current_lat = 25.2048 + random.uniform(-0.08, 0.08)
        self.current_lng = 55.2708 + random.uniform(-0.12, 0.12)
        self.fuel_level = random.randint(20, 95)
        self.capacity = 1000
        self.current_load = random.randint(200, 900)
        self.status = random.choice(['active', 'active', 'active', 'idle'])


def generate_mock_vehicles(count: int = 25) -> List[MockVehicle]:
    """Generate mock vehicles for testing"""
    return [MockVehicle(i) for i in range(count)]


def profile_to_dict(profile: VehicleRiskProfile) -> dict:
    """Convert VehicleRiskProfile to dictionary"""
    return {
        "vehicle_id": profile.vehicle_id,
        "vehicle_name": profile.vehicle_name,
        "driver_name": profile.driver_name,
        "overall_score": profile.overall_score,
        "risk_level": profile.risk_level,
        "factors": [
            {
                "name": f.name,
                "current_value": f.current_value,
                "previous_value": f.previous_value,
                "weight": f.weight,
                "trend": f.trend,
                "prediction_1h": f.prediction_1h,
                "prediction_6h": f.prediction_6h,
                "description": f.description,
                "mitigation": f.mitigation,
                "icon": f.icon,
                "color": f.color
            }
            for f in profile.factors
        ],
        "location": profile.location,
        "predictions": profile.predictions,
        "anomaly_detected": profile.anomaly_detected,
        "anomaly_description": profile.anomaly_description,
        "recommended_actions": profile.recommended_actions,
        "timestamp": profile.timestamp
    }


def summary_to_dict(summary: FleetRiskSummary) -> dict:
    """Convert FleetRiskSummary to dictionary"""
    return {
        "average_risk": summary.average_risk,
        "high_risk_count": summary.high_risk_count,
        "critical_count": summary.critical_count,
        "total_vehicles": summary.total_vehicles,
        "risk_distribution": summary.risk_distribution,
        "top_risk_factors": summary.top_risk_factors,
        "trend": summary.trend,
        "ai_summary": summary.ai_summary,
        "predictions": summary.predictions
    }


@router.get("/risk/fleet")
async def get_fleet_risk_dashboard(db: AsyncSession = Depends(get_db)):
    """Get comprehensive fleet risk dashboard data"""
    
    # First try to get vehicles from Redis (real-time simulation data)
    vehicles = await get_vehicles_from_redis()
    
    # If Redis is empty, try database
    if not vehicles:
        result = await db.execute(select(Vehicle))
        vehicles = list(result.scalars().all())
    
    # If still empty, use mock vehicles as fallback
    if not vehicles:
        vehicles = generate_mock_vehicles(25)
    
    # Calculate fleet risk summary
    fleet_summary = await enhanced_risk_scorer.calculate_fleet_risk(vehicles)
    
    # Get individual vehicle profiles
    vehicle_profiles = []
    for vehicle in vehicles:
        profile = await enhanced_risk_scorer.calculate_vehicle_risk(vehicle)
        vehicle_profiles.append(profile_to_dict(profile))
    
    # Sort by risk level (critical first)
    risk_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    vehicle_profiles.sort(key=lambda x: (risk_order.get(x["risk_level"], 4), -x["overall_score"]))
    
    return {
        "summary": summary_to_dict(fleet_summary),
        "vehicles": vehicle_profiles,
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/risk/vehicle/{vehicle_id}")
async def get_vehicle_risk_detail(vehicle_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get detailed risk assessment for a specific vehicle"""
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    profile = await enhanced_risk_scorer.calculate_vehicle_risk(vehicle)
    
    # Get historical data
    history_result = await db.execute(
        select(RiskScore)
        .where(RiskScore.vehicle_id == vehicle_id)
        .order_by(RiskScore.created_at.desc())
        .limit(50)
    )
    history = history_result.scalars().all()
    
    profile_dict = profile_to_dict(profile)
    profile_dict["history"] = [
        {
            "overall": h.overall_score,
            "timestamp": h.created_at.isoformat()
        }
        for h in history
    ]
    
    return profile_dict


@router.post("/risk/predict/{vehicle_id}")
async def predict_vehicle_risk(
    vehicle_id: UUID,
    horizon: int = 24,
    db: AsyncSession = Depends(get_db)
):
    """Predict future risk for a vehicle with confidence intervals"""
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    profile = await enhanced_risk_scorer.calculate_vehicle_risk(vehicle)
    
    return {
        "vehicle_id": str(vehicle_id),
        "vehicle_name": vehicle.name,
        "current_risk": profile.overall_score,
        "horizon_hours": horizon,
        "predictions": profile.predictions[:horizon],
        "generated_at": datetime.utcnow().isoformat()
    }


@router.get("/risk/alerts")
async def get_risk_alerts(
    severity: Optional[str] = None,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Get active risk alerts with filtering"""
    
    # First try Redis
    vehicles = await get_vehicles_from_redis()
    
    # Fallback to database
    if not vehicles:
        result = await db.execute(select(Vehicle))
        vehicles = list(result.scalars().all())
    
    # Fallback to mock
    if not vehicles:
        vehicles = generate_mock_vehicles(25)
    
    alerts = []
    for vehicle in vehicles:
        profile = await enhanced_risk_scorer.calculate_vehicle_risk(vehicle)
        
        # Create alerts for high/critical risks
        if profile.risk_level in ["high", "critical"]:
            if severity and profile.risk_level != severity:
                continue
                
            alert = {
                "id": f"alert_{profile.vehicle_id}_{datetime.utcnow().timestamp()}",
                "vehicle_id": profile.vehicle_id,
                "vehicle_name": profile.vehicle_name,
                "driver_name": profile.driver_name,
                "risk_level": profile.risk_level,
                "overall_score": profile.overall_score,
                "location": profile.location,
                "top_factors": [
                    {"name": f.name, "value": f.current_value, "color": f.color}
                    for f in sorted(profile.factors, key=lambda x: x.current_value, reverse=True)[:3]
                ],
                "recommended_actions": profile.recommended_actions,
                "anomaly_detected": profile.anomaly_detected,
                "anomaly_description": profile.anomaly_description,
                "timestamp": profile.timestamp
            }
            alerts.append(alert)
    
    # Sort by severity and score
    severity_order = {"critical": 0, "high": 1}
    alerts.sort(key=lambda x: (severity_order.get(x["risk_level"], 2), -x["overall_score"]))
    
    return {
        "alerts": alerts[:limit],
        "total_count": len(alerts),
        "critical_count": sum(1 for a in alerts if a["risk_level"] == "critical"),
        "high_count": sum(1 for a in alerts if a["risk_level"] == "high"),
        "timestamp": datetime.utcnow().isoformat()
    }


@router.post("/risk/mitigate/{vehicle_id}")
async def apply_risk_mitigation(
    vehicle_id: UUID,
    action: str,
    db: AsyncSession = Depends(get_db)
):
    """Apply a risk mitigation action to a vehicle"""
    result = await db.execute(select(Vehicle).where(Vehicle.id == vehicle_id))
    vehicle = result.scalar_one_or_none()
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    # Log the mitigation action
    mitigation_response = {
        "vehicle_id": str(vehicle_id),
        "action": action,
        "status": "applied",
        "message": f"Mitigation '{action}' has been applied to {vehicle.name}",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Emit WebSocket event
    await sio.emit('risk:mitigation_applied', mitigation_response)
    
    return mitigation_response


@router.post("/risk/broadcast")
async def broadcast_safety_alert(
    message: str,
    severity: str = "info",
    target_vehicles: Optional[List[str]] = None,
    db: AsyncSession = Depends(get_db)
):
    """Broadcast a safety alert to drivers"""
    broadcast_data = {
        "id": f"broadcast_{datetime.utcnow().timestamp()}",
        "message": message,
        "severity": severity,
        "target_vehicles": target_vehicles or "all",
        "timestamp": datetime.utcnow().isoformat()
    }
    
    # Emit to all connected clients
    await sio.emit('risk:broadcast', broadcast_data)
    
    return {
        "status": "sent",
        "broadcast": broadcast_data
    }


@router.get("/risk/ai-insights")
async def get_ai_risk_insights(db: AsyncSession = Depends(get_db)):
    """Get AI-generated risk insights using Gemini"""
    
    # First try Redis
    vehicles = await get_vehicles_from_redis()
    
    # Fallback to database
    if not vehicles:
        result = await db.execute(select(Vehicle))
        vehicles = list(result.scalars().all())
    
    # Fallback to mock
    if not vehicles:
        vehicles = generate_mock_vehicles(25)
    
    # Get fleet summary
    fleet_summary = await enhanced_risk_scorer.calculate_fleet_risk(list(vehicles))
    
    # Generate AI insights
    context = f"""
    Fleet Status:
    - Total vehicles: {fleet_summary.total_vehicles}
    - Average risk: {fleet_summary.average_risk:.1%}
    - High risk vehicles: {fleet_summary.high_risk_count}
    - Critical vehicles: {fleet_summary.critical_count}
    - Top risk factors: {', '.join(f['name'] for f in fleet_summary.top_risk_factors[:3])}
    - Current trend: {fleet_summary.trend}
    """
    
    # Try to get Gemini insights
    try:
        prompt = f"""Based on this fleet risk data, provide 3-5 actionable insights:
        
{context}

Format each insight as a brief bullet point with a specific recommendation.
Focus on practical actions that fleet managers can take right now."""
        
        if gemini_service.model:
            response = await gemini_service.model.generate_content_async(prompt)
            ai_insights = response.text.strip()
        else:
            ai_insights = fleet_summary.ai_summary
    except Exception as e:
        ai_insights = fleet_summary.ai_summary
    
    return {
        "summary": fleet_summary.ai_summary,
        "detailed_insights": ai_insights,
        "risk_distribution": fleet_summary.risk_distribution,
        "top_factors": fleet_summary.top_risk_factors,
        "predictions": fleet_summary.predictions[:12],  # Next 12 hours
        "timestamp": datetime.utcnow().isoformat()
    }


# Background task for streaming risk updates
async def stream_risk_updates(db_session):
    """Stream real-time risk updates via WebSocket"""
    while True:
        try:
            async with db_session() as db:
                result = await db.execute(select(Vehicle))
                vehicles = result.scalars().all()
                
                for vehicle in vehicles:
                    profile = await enhanced_risk_scorer.calculate_vehicle_risk(vehicle)
                    
                    # Emit individual vehicle risk update
                    await sio.emit('risk:vehicle_update', profile_to_dict(profile))
                    
                    # Emit alert if high/critical
                    if profile.risk_level in ["high", "critical"]:
                        await sio.emit('risk:alert', {
                            "vehicle_id": profile.vehicle_id,
                            "vehicle_name": profile.vehicle_name,
                            "risk_level": profile.risk_level,
                            "overall_score": profile.overall_score,
                            "top_factor": profile.factors[0].name if profile.factors else "Unknown",
                            "timestamp": profile.timestamp
                        })
                
                # Emit fleet summary
                fleet_summary = await enhanced_risk_scorer.calculate_fleet_risk(list(vehicles))
                await sio.emit('risk:fleet_update', summary_to_dict(fleet_summary))
                
        except Exception as e:
            print(f"Error in risk streaming: {e}")
        
        await asyncio.sleep(10)  # Update every 10 seconds


@router.get("/risk/assessment")
async def get_fleet_risk_assessment(db: AsyncSession = Depends(get_db)):
    """Get current risk assessment for entire fleet (legacy endpoint)"""
    
    # First try Redis
    vehicles = await get_vehicles_from_redis()
    
    # Fallback to database
    if not vehicles:
        result = await db.execute(select(Vehicle))
        vehicles = list(result.scalars().all())
    
    # Fallback to mock
    if not vehicles:
        vehicles = generate_mock_vehicles(25)
    
    assessments = []
    for vehicle in vehicles:
        profile = await enhanced_risk_scorer.calculate_vehicle_risk(vehicle)
        assessments.append({
            "vehicle_id": profile.vehicle_id,
            "vehicle_name": profile.vehicle_name,
            "overall": profile.overall_score,
            "weather": next((f.current_value for f in profile.factors if "weather" in f.name.lower()), 0),
            "traffic": next((f.current_value for f in profile.factors if "traffic" in f.name.lower()), 0),
            "driver_fatigue": next((f.current_value for f in profile.factors if "fatigue" in f.name.lower()), 0),
            "vehicle_health": next((f.current_value for f in profile.factors if "health" in f.name.lower()), 0),
            "level": profile.risk_level,
            "timestamp": profile.timestamp
        })
    
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
