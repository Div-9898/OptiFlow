"""Vehicle API routes - reads real-time data from Redis"""
from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any

from app.services.redis_service import redis_service

router = APIRouter()


@router.get("/vehicles", response_model=List[Dict[str, Any]])
async def get_all_vehicles():
    """Get all vehicles with current positions from Redis"""
    try:
        vehicles = await redis_service.get_all_vehicles()
        return vehicles
    except Exception as e:
        print(f"Error fetching vehicles: {e}")
        return []


@router.get("/vehicles/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    """Get specific vehicle details from Redis"""
    vehicle = await redis_service.get_vehicle(vehicle_id)
    
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return vehicle


@router.get("/deliveries", response_model=List[Dict[str, Any]])
async def get_all_deliveries():
    """Get all deliveries from Redis"""
    try:
        deliveries = await redis_service.get_all_deliveries()
        return deliveries
    except Exception as e:
        print(f"Error fetching deliveries: {e}")
        return []


@router.get("/traffic")
async def get_traffic_data():
    """Get traffic data from Redis"""
    try:
        traffic = await redis_service.get_traffic_data()
        return traffic
    except Exception as e:
        print(f"Error fetching traffic: {e}")
        return []


@router.get("/dashboard/stats")
async def get_dashboard_stats():
    """Get aggregated dashboard statistics"""
    try:
        stats = await redis_service.get_dashboard_stats()
        return stats
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return {
            'activeVehicles': 0,
            'totalVehicles': 0,
            'completedDeliveries': 0,
            'totalDeliveries': 0,
            'onTimeRate': 0,
            'fleetRiskScore': 0
        }
