"""Real-time streaming service - pushes Redis updates to WebSocket clients"""
import asyncio
import json
from typing import Optional
import redis.asyncio as redis

from app.core.config import settings
from app.core.socketio import sio
from app.services.redis_service import redis_service


class StreamingService:
    """Service that streams real-time data from Redis to WebSocket clients"""
    
    def __init__(self):
        self._running = False
        self._task: Optional[asyncio.Task] = None
    
    async def start(self):
        """Start the streaming service"""
        if self._running:
            return
        
        self._running = True
        self._task = asyncio.create_task(self._stream_loop())
        print("🚀 Streaming service started")
    
    async def stop(self):
        """Stop the streaming service"""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        print("👋 Streaming service stopped")
    
    async def _stream_loop(self):
        """Main loop that periodically fetches data and broadcasts to clients"""
        await redis_service.connect()
        
        while self._running:
            try:
                # Fetch current data from Redis
                vehicles = await redis_service.get_all_vehicles()
                stats = await redis_service.get_dashboard_stats()
                
                # Broadcast vehicle positions to all connected clients
                if vehicles:
                    await sio.emit('vehicles:update', {
                        'vehicles': vehicles,
                        'timestamp': asyncio.get_event_loop().time()
                    })
                
                # Broadcast dashboard stats
                await sio.emit('stats:update', stats)
                
                # Wait before next update (100ms for smooth real-time feel)
                await asyncio.sleep(0.5)
                
            except Exception as e:
                print(f"Streaming error: {e}")
                await asyncio.sleep(1)
    
    async def broadcast_vehicle_update(self, vehicle_id: str, data: dict):
        """Broadcast a specific vehicle update"""
        await sio.emit('vehicle:position', {
            'vehicleId': vehicle_id,
            **data
        })
    
    async def broadcast_delivery_update(self, delivery_id: str, data: dict):
        """Broadcast a delivery status update"""
        await sio.emit('delivery:update', {
            'deliveryId': delivery_id,
            **data
        })
    
    async def broadcast_alert(self, alert_type: str, data: dict):
        """Broadcast an alert to all clients"""
        await sio.emit('alert', {
            'type': alert_type,
            **data
        })


# Singleton instance
streaming_service = StreamingService()
