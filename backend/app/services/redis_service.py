"""Redis service for real-time data streaming"""
import redis.asyncio as redis
import json
import asyncio
from typing import Dict, Any, List, Optional, Callable
from app.core.config import settings


class RedisService:
    """Service for interacting with Redis for real-time data"""
    
    def __init__(self):
        self.redis: Optional[redis.Redis] = None
        self._pubsub = None
        self._listeners: Dict[str, List[Callable]] = {}
    
    async def connect(self):
        """Connect to Redis"""
        if not self.redis:
            self.redis = redis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True
            )
            print("✅ Connected to Redis")
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis:
            await self.redis.close()
            self.redis = None
            print("👋 Disconnected from Redis")
    
    async def get_all_vehicles(self) -> List[Dict[str, Any]]:
        """Get all vehicle data from Redis"""
        if not self.redis:
            await self.connect()
        
        vehicles = []
        
        # Get all vehicle keys (format: vehicle:vehicle_X)
        keys = await self.redis.keys("vehicle:vehicle_*")
        
        # Filter to get only the main vehicle keys (not :position or :sensors)
        main_keys = [k for k in keys if ':position' not in k and ':sensors' not in k]
        
        for key in main_keys:
            try:
                data = await self.redis.get(key)
                if data:
                    vehicle = json.loads(data)
                    
                    # Get position data
                    pos_key = f"{key}:position"
                    pos_data = await self.redis.get(pos_key)
                    if pos_data:
                        position = json.loads(pos_data)
                        vehicle.update({
                            'lat': position.get('lat'),
                            'lng': position.get('lng'),
                            'heading': position.get('heading'),
                            'speed': position.get('speed')
                        })
                    
                    # Get sensor data
                    sensor_key = f"{key}:sensors"
                    sensor_data = await self.redis.get(sensor_key)
                    if sensor_data:
                        vehicle['sensors'] = json.loads(sensor_data)
                    
                    vehicles.append(vehicle)
            except (json.JSONDecodeError, Exception) as e:
                print(f"Error parsing vehicle data for {key}: {e}")
                continue
        
        return vehicles
    
    async def get_vehicle(self, vehicle_id: str) -> Optional[Dict[str, Any]]:
        """Get specific vehicle data from Redis"""
        if not self.redis:
            await self.connect()
        
        key = f"vehicle:{vehicle_id}"
        data = await self.redis.get(key)
        
        if not data:
            return None
        
        try:
            vehicle = json.loads(data)
            
            # Get position
            pos_data = await self.redis.get(f"{key}:position")
            if pos_data:
                position = json.loads(pos_data)
                vehicle.update({
                    'lat': position.get('lat'),
                    'lng': position.get('lng'),
                    'heading': position.get('heading'),
                    'speed': position.get('speed')
                })
            
            # Get sensors
            sensor_data = await self.redis.get(f"{key}:sensors")
            if sensor_data:
                vehicle['sensors'] = json.loads(sensor_data)
            
            return vehicle
        except json.JSONDecodeError:
            return None
    
    async def get_all_deliveries(self) -> List[Dict[str, Any]]:
        """Get all delivery data from Redis"""
        if not self.redis:
            await self.connect()
        
        deliveries = []
        keys = await self.redis.keys("delivery:*")
        
        for key in keys:
            try:
                data = await self.redis.get(key)
                if data:
                    deliveries.append(json.loads(data))
            except json.JSONDecodeError:
                continue
        
        return deliveries
    
    async def get_traffic_data(self) -> List[Dict[str, Any]]:
        """Get traffic data from Redis"""
        if not self.redis:
            await self.connect()
        
        traffic = []
        keys = await self.redis.keys("traffic:*")
        
        for key in keys:
            try:
                data = await self.redis.get(key)
                if data:
                    traffic.append(json.loads(data))
            except json.JSONDecodeError:
                continue
        
        return traffic
    
    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get aggregated dashboard statistics"""
        vehicles = await self.get_all_vehicles()
        deliveries = await self.get_all_deliveries()
        
        active_vehicles = len([v for v in vehicles if v.get('status') in ['active', 'en_route']])
        total_vehicles = len(vehicles)
        
        completed_deliveries = len([d for d in deliveries if d.get('status') == 'delivered'])
        total_deliveries = len(deliveries)
        
        on_time = len([d for d in deliveries if d.get('status') == 'delivered' and d.get('onTime', True)])
        on_time_rate = (on_time / completed_deliveries * 100) if completed_deliveries > 0 else 0
        
        # Calculate average risk score
        risk_scores = [v.get('riskScore', 0) for v in vehicles if v.get('riskScore') is not None]
        avg_risk = sum(risk_scores) / len(risk_scores) if risk_scores else 0
        
        return {
            'activeVehicles': active_vehicles,
            'totalVehicles': total_vehicles,
            'completedDeliveries': completed_deliveries,
            'totalDeliveries': total_deliveries,
            'onTimeRate': round(on_time_rate, 1),
            'fleetRiskScore': round(avg_risk, 1)
        }
    
    async def subscribe_to_updates(self, callback: Callable):
        """Subscribe to Redis pub/sub for real-time updates"""
        if not self.redis:
            await self.connect()
        
        pubsub = self.redis.pubsub()
        await pubsub.subscribe('vehicle_updates', 'delivery_updates', 'traffic_updates')
        
        async for message in pubsub.listen():
            if message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                    await callback(message['channel'], data)
                except json.JSONDecodeError:
                    continue


# Singleton instance
redis_service = RedisService()
