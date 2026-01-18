"""
Traffic Data Generator
Simulates traffic conditions across Dubai zones
"""

import random
from datetime import datetime
from typing import Dict, Any, List


DUBAI_ZONES = [
    {"id": "downtown", "name": "Downtown Dubai", "lat": 25.2048, "lng": 55.2708},
    {"id": "marina", "name": "Dubai Marina", "lat": 25.0805, "lng": 55.1403},
    {"id": "deira", "name": "Deira", "lat": 25.2697, "lng": 55.3095},
    {"id": "jumeirah", "name": "Jumeirah", "lat": 25.2106, "lng": 55.2538},
    {"id": "al_quoz", "name": "Al Quoz Industrial", "lat": 25.1336, "lng": 55.2272},
    {"id": "business_bay", "name": "Business Bay", "lat": 25.1860, "lng": 55.2674},
    {"id": "internet_city", "name": "Dubai Internet City", "lat": 25.0952, "lng": 55.1538},
    {"id": "al_barsha", "name": "Al Barsha", "lat": 25.1011, "lng": 55.2067},
    {"id": "jebel_ali", "name": "Jebel Ali", "lat": 24.9857, "lng": 55.0272},
    {"id": "airport", "name": "Dubai Airport Area", "lat": 25.2528, "lng": 55.3644},
]


class TrafficGenerator:
    """Generates realistic traffic data for Dubai zones"""
    
    def __init__(self):
        self.zone_states = {zone["id"]: self._init_zone_state() for zone in DUBAI_ZONES}
        self.incidents = []
    
    def _init_zone_state(self) -> Dict:
        """Initialize zone traffic state"""
        return {
            "congestion_level": random.uniform(0.2, 0.5),
            "average_speed": random.uniform(40, 60),
            "incident_count": 0
        }
    
    def _get_time_factor(self) -> float:
        """Get congestion factor based on time of day"""
        hour = datetime.now().hour
        
        # Rush hours have higher congestion
        if 7 <= hour <= 9:
            return 1.5  # Morning rush
        elif 17 <= hour <= 19:
            return 1.6  # Evening rush
        elif 12 <= hour <= 14:
            return 1.2  # Lunch time
        elif 0 <= hour <= 5:
            return 0.5  # Night time
        else:
            return 1.0  # Normal
    
    def generate_traffic_data(self) -> List[Dict[str, Any]]:
        """Generate traffic data for all zones"""
        time_factor = self._get_time_factor()
        traffic_data = []
        
        for zone in DUBAI_ZONES:
            state = self.zone_states[zone["id"]]
            
            # Update congestion with time factor
            base_congestion = state["congestion_level"]
            target_congestion = base_congestion * time_factor
            state["congestion_level"] += (target_congestion - state["congestion_level"]) * 0.3
            
            # Add random fluctuation
            state["congestion_level"] += random.uniform(-0.05, 0.05)
            state["congestion_level"] = max(0.1, min(0.95, state["congestion_level"]))
            
            # Calculate average speed (inverse of congestion)
            max_speed = 80
            state["average_speed"] = max_speed * (1 - state["congestion_level"] * 0.7)
            state["average_speed"] += random.uniform(-5, 5)
            state["average_speed"] = max(15, min(80, state["average_speed"]))
            
            # Random incidents
            if random.random() < 0.02:  # 2% chance of new incident
                state["incident_count"] += 1
                self.incidents.append({
                    "zone": zone["id"],
                    "type": random.choice(["accident", "construction", "event", "breakdown"]),
                    "time": datetime.utcnow().isoformat()
                })
            elif state["incident_count"] > 0 and random.random() < 0.1:
                state["incident_count"] -= 1  # Incident cleared
            
            traffic_data.append({
                "zoneId": zone["id"],
                "zoneName": zone["name"],
                "lat": zone["lat"],
                "lng": zone["lng"],
                "congestionLevel": round(state["congestion_level"], 3),
                "averageSpeed": round(state["average_speed"], 1),
                "incidentCount": state["incident_count"],
                "timestamp": datetime.utcnow().isoformat()
            })
        
        return traffic_data
    
    def get_zone_traffic(self, zone_id: str) -> Dict[str, Any]:
        """Get traffic for a specific zone"""
        if zone_id not in self.zone_states:
            return None
        
        zone = next((z for z in DUBAI_ZONES if z["id"] == zone_id), None)
        if not zone:
            return None
        
        state = self.zone_states[zone_id]
        
        return {
            "zoneId": zone_id,
            "zoneName": zone["name"],
            "congestionLevel": round(state["congestion_level"], 3),
            "averageSpeed": round(state["average_speed"], 1),
            "incidentCount": state["incident_count"],
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def get_incidents(self) -> List[Dict]:
        """Get all current incidents"""
        return self.incidents[-20:]  # Last 20 incidents
