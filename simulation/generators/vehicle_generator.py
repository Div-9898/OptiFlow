"""
Vehicle Position Generator
Simulates 25 vehicles moving around Dubai with realistic movement patterns
"""

import random
import math
from datetime import datetime
from typing import List, Dict, Any


# Dubai bounds
DUBAI_CENTER = (25.2048, 55.2708)
DUBAI_BOUNDS = {
    "min_lat": 24.85,
    "max_lat": 25.35,
    "min_lng": 54.95,
    "max_lng": 55.55
}

# Major locations in Dubai for realistic movement
DUBAI_LOCATIONS = [
    {"name": "Downtown Dubai", "lat": 25.2048, "lng": 55.2708},
    {"name": "Dubai Marina", "lat": 25.0805, "lng": 55.1403},
    {"name": "Deira", "lat": 25.2697, "lng": 55.3095},
    {"name": "Jumeirah", "lat": 25.2106, "lng": 55.2538},
    {"name": "Al Quoz", "lat": 25.1336, "lng": 55.2272},
    {"name": "Business Bay", "lat": 25.1860, "lng": 55.2674},
    {"name": "Dubai Internet City", "lat": 25.0952, "lng": 55.1538},
    {"name": "Al Barsha", "lat": 25.1011, "lng": 55.2067},
    {"name": "Jebel Ali", "lat": 24.9857, "lng": 55.0272},
    {"name": "Dubai Airport", "lat": 25.2528, "lng": 55.3644},
]

DRIVER_NAMES = [
    "Ahmed Al-Rashid", "Mohammed Khan", "Raj Patel", "Omar Hassan",
    "Ali Mahmoud", "Yusuf Ibrahim", "Hamza Malik", "Khalid Noor",
    "Tariq Aziz", "Sami Yousef", "Bilal Ahmed", "Zaid Rahman",
    "Imran Hussain", "Faisal Shah", "Kareem Abbas", "Nasser Ali",
    "Amir Saleh", "Jamal Osman", "Hakim Farooq", "Rashid Qasim",
    "Saeed Hammad", "Waleed Jabbar", "Ihsan Iqbal", "Mansoor Latif",
    "Farid Nazir"
]


class VehicleGenerator:
    """Generates realistic vehicle movement data for Dubai"""
    
    def __init__(self, num_vehicles: int = 25):
        self.num_vehicles = num_vehicles
        self.vehicles = self._initialize_vehicles()
        self.total_distance = 0.0
    
    def _initialize_vehicles(self) -> List[Dict[str, Any]]:
        """Initialize vehicles with random positions and states"""
        vehicles = []
        
        for i in range(self.num_vehicles):
            # Random starting location near a major point
            base_location = random.choice(DUBAI_LOCATIONS)
            lat = base_location["lat"] + random.uniform(-0.02, 0.02)
            lng = base_location["lng"] + random.uniform(-0.02, 0.02)
            
            # Random status distribution: 70% active, 20% idle, 10% maintenance
            status_roll = random.random()
            if status_roll < 0.70:
                status = "active"
            elif status_roll < 0.90:
                status = "idle"
            else:
                status = "maintenance"
            
            # Random target destination
            target = random.choice(DUBAI_LOCATIONS)
            
            vehicle = {
                "id": f"vehicle_{i}",
                "name": f"Truck {i + 1:02d}",
                "plateNumber": f"DXB-{random.randint(1000, 9999)}",
                "lat": lat,
                "lng": lng,
                "heading": random.uniform(0, 360),
                "speed": random.uniform(20, 60) if status == "active" else 0,
                "status": status,
                "driverId": f"driver_{i}",
                "driverName": DRIVER_NAMES[i % len(DRIVER_NAMES)],
                "capacity": random.choice([50, 75, 100, 150]),
                "currentLoad": 0,
                "fuelLevel": random.randint(40, 100),
                "nextDeliveryId": f"delivery_{random.randint(1, 150)}" if status == "active" else None,
                "route": [],
                # Internal state for movement
                "_target": target,
                "_risk_score": random.uniform(0.1, 0.5),
                "_distance_traveled": 0.0
            }
            
            vehicle["currentLoad"] = random.randint(0, vehicle["capacity"])
            vehicles.append(vehicle)
        
        return vehicles
    
    def _calculate_bearing(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate bearing between two points"""
        lat1_rad = math.radians(lat1)
        lat2_rad = math.radians(lat2)
        diff_lng = math.radians(lng2 - lng1)
        
        x = math.sin(diff_lng) * math.cos(lat2_rad)
        y = math.cos(lat1_rad) * math.sin(lat2_rad) - math.sin(lat1_rad) * math.cos(lat2_rad) * math.cos(diff_lng)
        
        bearing = math.atan2(x, y)
        return (math.degrees(bearing) + 360) % 360
    
    def _calculate_distance(self, lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two points in km"""
        R = 6371  # Earth's radius in km
        
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        
        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        
        return R * c
    
    def update_vehicle_position(self, vehicle: Dict) -> Dict[str, Any]:
        """Update a single vehicle's position"""
        
        if vehicle["status"] != "active":
            # Occasionally change status
            if random.random() < 0.01:  # 1% chance to change
                if vehicle["status"] == "idle":
                    vehicle["status"] = "active"
                    vehicle["speed"] = random.uniform(30, 50)
                    vehicle["_target"] = random.choice(DUBAI_LOCATIONS)
            
            return self._create_position_update(vehicle)
        
        target = vehicle["_target"]
        
        # Calculate distance to target
        dist_to_target = self._calculate_distance(
            vehicle["lat"], vehicle["lng"],
            target["lat"], target["lng"]
        )
        
        # If close to target, pick new target
        if dist_to_target < 0.5:  # Less than 500m
            vehicle["_target"] = random.choice(DUBAI_LOCATIONS)
            target = vehicle["_target"]
            
            # Complete a delivery sometimes
            if random.random() < 0.3:
                vehicle["currentLoad"] = max(0, vehicle["currentLoad"] - random.randint(5, 20))
                if vehicle["currentLoad"] < 10:
                    # Return to depot for reload
                    vehicle["currentLoad"] = vehicle["capacity"]
        
        # Calculate bearing to target
        bearing = self._calculate_bearing(
            vehicle["lat"], vehicle["lng"],
            target["lat"], target["lng"]
        )
        
        # Add some randomness to movement
        bearing += random.uniform(-15, 15)
        
        # Update speed (simulate traffic and acceleration)
        hour = datetime.now().hour
        if 7 <= hour <= 9 or 17 <= hour <= 19:
            # Rush hour - slower
            target_speed = random.uniform(15, 35)
        else:
            target_speed = random.uniform(30, 60)
        
        # Gradual speed change
        vehicle["speed"] += (target_speed - vehicle["speed"]) * 0.3
        vehicle["speed"] = max(10, min(70, vehicle["speed"]))
        
        # Calculate movement (km per update interval, assuming 2 second updates)
        distance_km = (vehicle["speed"] / 3600) * 2  # Speed in km/h, convert to km/2s
        
        # Convert to lat/lng delta
        delta_lat = distance_km / 111 * math.cos(math.radians(bearing))
        delta_lng = distance_km / (111 * math.cos(math.radians(vehicle["lat"]))) * math.sin(math.radians(bearing))
        
        # Update position
        vehicle["lat"] += delta_lat
        vehicle["lng"] += delta_lng
        vehicle["heading"] = bearing
        
        # Keep within Dubai bounds
        vehicle["lat"] = max(DUBAI_BOUNDS["min_lat"], min(DUBAI_BOUNDS["max_lat"], vehicle["lat"]))
        vehicle["lng"] = max(DUBAI_BOUNDS["min_lng"], min(DUBAI_BOUNDS["max_lng"], vehicle["lng"]))
        
        # Update fuel
        vehicle["fuelLevel"] = max(5, vehicle["fuelLevel"] - random.uniform(0.01, 0.05))
        if vehicle["fuelLevel"] < 20 and random.random() < 0.1:
            vehicle["fuelLevel"] = 100  # Refueled
        
        # Track distance
        vehicle["_distance_traveled"] += distance_km
        self.total_distance += distance_km
        
        # Occasionally change status
        if random.random() < 0.005:  # 0.5% chance
            vehicle["status"] = "idle"
            vehicle["speed"] = 0
        
        return self._create_position_update(vehicle)
    
    def _create_position_update(self, vehicle: Dict) -> Dict[str, Any]:
        """Create a position update message"""
        return {
            "vehicleId": vehicle["id"],
            "lat": round(vehicle["lat"], 6),
            "lng": round(vehicle["lng"], 6),
            "heading": round(vehicle["heading"], 1),
            "speed": round(vehicle["speed"], 1),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def update_all_positions(self) -> List[Dict[str, Any]]:
        """Update all vehicle positions and return updates"""
        updates = []
        for vehicle in self.vehicles:
            update = self.update_vehicle_position(vehicle)
            updates.append(update)
        return updates
    
    def get_all_vehicles(self) -> List[Dict[str, Any]]:
        """Get all vehicles with current state"""
        return [
            {
                "id": v["id"],
                "name": v["name"],
                "plateNumber": v["plateNumber"],
                "lat": round(v["lat"], 6),
                "lng": round(v["lng"], 6),
                "heading": round(v["heading"], 1),
                "speed": round(v["speed"], 1),
                "status": v["status"],
                "driverId": v["driverId"],
                "driverName": v["driverName"],
                "capacity": v["capacity"],
                "currentLoad": v["currentLoad"],
                "fuelLevel": round(v["fuelLevel"]),
                "nextDeliveryId": v["nextDeliveryId"],
                "route": v["route"]
            }
            for v in self.vehicles
        ]
    
    def get_average_risk(self) -> float:
        """Get average risk score for fleet"""
        return round(sum(v["_risk_score"] for v in self.vehicles) / len(self.vehicles), 3)
    
    def get_total_distance(self) -> float:
        """Get total distance traveled by fleet in km"""
        return round(self.total_distance, 2)
