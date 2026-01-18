"""
Delivery Event Generator
Simulates delivery status changes and generates realistic delivery events
"""

import random
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List


CUSTOMER_NAMES = [
    "Sarah Johnson", "Michael Chen", "Fatima Al-Hassan", "David Brown",
    "Emma Wilson", "James Taylor", "Aisha Mohammed", "Robert Anderson",
    "Maria Garcia", "Ahmed Ibrahim", "Jennifer Lee", "Thomas Moore",
    "Priya Sharma", "William Clark", "Lisa Rodriguez", "Khalid Mansour"
]

ADDRESSES = [
    "Downtown Dubai, Burj Khalifa Area",
    "Dubai Marina, JBR Walk",
    "Jumeirah Beach Residence, Tower 4",
    "Business Bay, Executive Towers",
    "DIFC, Gate Building",
    "Palm Jumeirah, Shoreline Apartments",
    "Dubai Silicon Oasis, Building A",
    "Al Barsha, Mall of Emirates Area",
    "Deira, Gold Souk District",
    "Dubai Internet City, Building 1",
    "JLT, Cluster D",
    "Motor City, Uptown Apartments",
    "Discovery Gardens, Building 5",
    "Dubai Sports City, Victory Heights",
    "Arabian Ranches, Community Center"
]


class DeliveryGenerator:
    """Generates delivery events and maintains delivery state"""
    
    def __init__(self, num_deliveries: int = 150):
        self.num_deliveries = num_deliveries
        self.completed_count = 0
        self.on_time_count = 0
        self.deliveries = self._initialize_deliveries()
    
    def _initialize_deliveries(self) -> Dict[str, Dict]:
        """Initialize deliveries for the day"""
        deliveries = {}
        
        for i in range(self.num_deliveries):
            delivery_id = f"delivery_{i + 1}"
            
            # Random status distribution
            status_roll = random.random()
            if status_roll < 0.2:
                status = "delivered"
                self.completed_count += 1
                self.on_time_count += 1 if random.random() < 0.92 else 0
            elif status_roll < 0.4:
                status = "in_transit"
            elif status_roll < 0.6:
                status = "assigned"
            else:
                status = "pending"
            
            # Random time window
            hour_start = random.randint(8, 18)
            
            delivery = {
                "id": delivery_id,
                "customerName": random.choice(CUSTOMER_NAMES),
                "address": random.choice(ADDRESSES),
                "lat": 24.9 + random.uniform(0, 0.5),
                "lng": 55.0 + random.uniform(0, 0.5),
                "timeWindowStart": f"{hour_start:02d}:00",
                "timeWindowEnd": f"{hour_start + 2:02d}:00",
                "priority": random.choice(["high", "medium", "medium", "medium", "low"]),
                "status": status,
                "assignedVehicleId": f"vehicle_{random.randint(0, 24)}" if status in ["assigned", "in_transit"] else None,
                "estimatedArrival": None,
                "packageWeight": round(random.uniform(0.5, 25), 1)
            }
            
            if status == "in_transit":
                # Add ETA
                minutes_remaining = random.randint(5, 45)
                eta = datetime.now() + timedelta(minutes=minutes_remaining)
                delivery["estimatedArrival"] = eta.isoformat()
            
            deliveries[delivery_id] = delivery
        
        return deliveries
    
    def generate_event(self) -> Optional[Dict[str, Any]]:
        """Generate a random delivery event"""
        
        # Find deliveries that can have events
        candidates = []
        
        for delivery_id, delivery in self.deliveries.items():
            if delivery["status"] == "pending":
                candidates.append(("assigned", delivery))
            elif delivery["status"] == "assigned":
                candidates.append(("in_transit", delivery))
            elif delivery["status"] == "in_transit":
                candidates.append(("delivered", delivery))
        
        if not candidates:
            return None
        
        # Pick a random transition
        new_status, delivery = random.choice(candidates)
        
        # Update delivery
        delivery["status"] = new_status
        
        if new_status == "assigned":
            delivery["assignedVehicleId"] = f"vehicle_{random.randint(0, 24)}"
        elif new_status == "in_transit":
            minutes_remaining = random.randint(10, 40)
            eta = datetime.now() + timedelta(minutes=minutes_remaining)
            delivery["estimatedArrival"] = eta.isoformat()
        elif new_status == "delivered":
            self.completed_count += 1
            # Check if on time (simplified)
            if random.random() < 0.92:
                self.on_time_count += 1
            delivery["actualArrival"] = datetime.now().isoformat()
        
        # Create event
        return {
            "deliveryId": delivery["id"],
            "status": new_status,
            "vehicleId": delivery["assignedVehicleId"],
            "customerName": delivery["customerName"],
            "estimatedArrival": delivery.get("estimatedArrival"),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get delivery statistics"""
        return {
            "total": self.num_deliveries,
            "completed": self.completed_count,
            "on_time_rate": round((self.on_time_count / self.completed_count * 100) if self.completed_count > 0 else 0, 1),
            "pending": sum(1 for d in self.deliveries.values() if d["status"] == "pending"),
            "in_transit": sum(1 for d in self.deliveries.values() if d["status"] == "in_transit")
        }
    
    def get_all_deliveries(self) -> List[Dict]:
        """Get all deliveries"""
        return list(self.deliveries.values())
