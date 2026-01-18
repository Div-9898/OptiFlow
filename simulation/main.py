"""
Synthetic Data Simulation Container
Generates real-time vehicle positions, IoT sensor data, traffic data, and weather data
"""

import asyncio
import json
import os
import signal
import sys
from datetime import datetime

import redis.asyncio as redis

from generators.vehicle_generator import VehicleGenerator
from generators.delivery_generator import DeliveryGenerator
from generators.iot_sensor_generator import IoTSensorGenerator
from generators.traffic_generator import TrafficGenerator


class SimulationOrchestrator:
    """Orchestrates all data generators and pushes to Redis"""
    
    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.redis: redis.Redis = None
        self.running = True
        
        # Configuration
        self.num_vehicles = 25
        self.position_interval = 2.0  # seconds
        self.iot_interval = 10.0  # seconds
        self.traffic_interval = 30.0  # seconds
        self.metrics_interval = 5.0  # seconds
        
        # Initialize generators
        self.vehicle_gen = VehicleGenerator(self.num_vehicles)
        self.delivery_gen = DeliveryGenerator()
        self.iot_gen = IoTSensorGenerator()
        self.traffic_gen = TrafficGenerator()
        
        # Stats
        self.message_count = 0
        self.start_time = None
    
    async def connect(self):
        """Connect to Redis"""
        print(f"🔌 Connecting to Redis: {self.redis_url}")
        self.redis = await redis.from_url(self.redis_url, decode_responses=True)
        
        # Test connection
        await self.redis.ping()
        print("✅ Redis connection established")
    
    async def disconnect(self):
        """Disconnect from Redis"""
        if self.redis:
            await self.redis.close()
            print("👋 Redis connection closed")
    
    async def publish(self, channel: str, data: dict):
        """Publish data to Redis channel"""
        message = json.dumps(data)
        await self.redis.publish(channel, message)
        self.message_count += 1
    
    async def set_key(self, key: str, data: dict, expire: int = None):
        """Set a Redis key with optional expiration"""
        await self.redis.set(key, json.dumps(data))
        if expire:
            await self.redis.expire(key, expire)
    
    async def vehicle_position_loop(self):
        """Continuously generate and publish vehicle positions"""
        print(f"🚚 Starting vehicle position updates (every {self.position_interval}s)")
        
        while self.running:
            try:
                # Update all vehicle positions
                updates = self.vehicle_gen.update_all_positions()
                
                for update in updates:
                    # Publish to channel
                    await self.publish("vehicle:position", update)
                    
                    # Also store current state
                    await self.set_key(
                        f"vehicle:{update['vehicleId']}:position",
                        update,
                        expire=60
                    )
                
                await asyncio.sleep(self.position_interval)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"❌ Vehicle position error: {e}")
                await asyncio.sleep(1)
    
    async def iot_sensor_loop(self):
        """Generate and publish IoT sensor data"""
        print(f"📡 Starting IoT sensor updates (every {self.iot_interval}s)")
        
        while self.running:
            try:
                for vehicle_id in range(self.num_vehicles):
                    sensor_data = self.iot_gen.generate_sensor_data(f"vehicle_{vehicle_id}")
                    
                    await self.publish("iot:sensor", sensor_data)
                    await self.set_key(
                        f"vehicle:vehicle_{vehicle_id}:sensors",
                        sensor_data,
                        expire=120
                    )
                
                await asyncio.sleep(self.iot_interval)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"❌ IoT sensor error: {e}")
                await asyncio.sleep(1)
    
    async def traffic_loop(self):
        """Generate and publish traffic data"""
        print(f"🚦 Starting traffic updates (every {self.traffic_interval}s)")
        
        while self.running:
            try:
                traffic_data = self.traffic_gen.generate_traffic_data()
                
                for zone_data in traffic_data:
                    await self.publish("traffic:update", zone_data)
                    await self.set_key(
                        f"traffic:{zone_data['zoneId']}",
                        zone_data,
                        expire=300
                    )
                
                await asyncio.sleep(self.traffic_interval)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"❌ Traffic data error: {e}")
                await asyncio.sleep(1)
    
    async def metrics_loop(self):
        """Generate and publish dashboard metrics"""
        print(f"📊 Starting metrics updates (every {self.metrics_interval}s)")
        
        while self.running:
            try:
                vehicles = self.vehicle_gen.get_all_vehicles()
                active_count = sum(1 for v in vehicles if v["status"] == "active")
                
                # Generate delivery stats
                delivery_stats = self.delivery_gen.get_stats()
                
                metrics = {
                    "totalVehicles": self.num_vehicles,
                    "activeVehicles": active_count,
                    "totalDeliveries": delivery_stats["total"],
                    "completedDeliveries": delivery_stats["completed"],
                    "onTimeRate": delivery_stats["on_time_rate"],
                    "averageRiskScore": self.vehicle_gen.get_average_risk(),
                    "totalDistance": self.vehicle_gen.get_total_distance(),
                    "fuelEfficiency": 8.5 + (self.message_count % 10) * 0.1,
                    "timestamp": datetime.utcnow().isoformat()
                }
                
                await self.publish("metrics:update", metrics)
                await self.set_key("metrics:live", metrics, expire=60)
                
                await asyncio.sleep(self.metrics_interval)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"❌ Metrics error: {e}")
                await asyncio.sleep(1)
    
    async def delivery_events_loop(self):
        """Generate random delivery events"""
        print("📦 Starting delivery event simulation")
        
        while self.running:
            try:
                # Random delivery event every 5-15 seconds
                await asyncio.sleep(5 + (self.message_count % 10))
                
                event = self.delivery_gen.generate_event()
                if event:
                    await self.publish("delivery:status", event)
                    # Store the updated delivery in Redis
                    await self.set_key(f"delivery:{event['deliveryId']}", event, expire=3600)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"❌ Delivery event error: {e}")
                await asyncio.sleep(1)
    
    async def stats_reporter(self):
        """Report simulation statistics periodically"""
        while self.running:
            try:
                await asyncio.sleep(30)
                
                elapsed = (datetime.now() - self.start_time).total_seconds()
                rate = self.message_count / elapsed if elapsed > 0 else 0
                
                print(f"📈 Stats: {self.message_count} messages, {rate:.1f} msg/sec")
                
            except asyncio.CancelledError:
                break
            except Exception:
                pass
    
    async def run(self):
        """Run all simulation loops"""
        self.start_time = datetime.now()
        
        print("=" * 50)
        print("🚀 Logistics AI Platform - Data Simulation")
        print("=" * 50)
        print(f"📍 Location: Dubai, UAE")
        print(f"🚚 Vehicles: {self.num_vehicles}")
        print(f"⏱️  Position updates: every {self.position_interval}s")
        print("=" * 50)
        
        await self.connect()
        
        # Initialize vehicles in Redis
        for vehicle in self.vehicle_gen.get_all_vehicles():
            await self.set_key(f"vehicle:{vehicle['id']}", vehicle)
        
        print(f"✅ Initialized {self.num_vehicles} vehicles")
        
        # Initialize deliveries in Redis
        for delivery in self.delivery_gen.get_all_deliveries():
            await self.set_key(f"delivery:{delivery['id']}", delivery)
        
        print(f"✅ Initialized {len(self.delivery_gen.get_all_deliveries())} deliveries")
        
        # Start all loops
        tasks = [
            asyncio.create_task(self.vehicle_position_loop()),
            asyncio.create_task(self.iot_sensor_loop()),
            asyncio.create_task(self.traffic_loop()),
            asyncio.create_task(self.metrics_loop()),
            asyncio.create_task(self.delivery_events_loop()),
            asyncio.create_task(self.stats_reporter()),
        ]
        
        try:
            await asyncio.gather(*tasks)
        except asyncio.CancelledError:
            print("\n🛑 Shutting down simulation...")
        finally:
            self.running = False
            for task in tasks:
                task.cancel()
            await self.disconnect()
    
    def stop(self):
        """Stop the simulation"""
        self.running = False


async def main():
    orchestrator = SimulationOrchestrator()
    
    # Handle shutdown signals
    loop = asyncio.get_event_loop()
    
    def signal_handler():
        orchestrator.stop()
    
    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, signal_handler)
    
    await orchestrator.run()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Simulation stopped")
        sys.exit(0)
