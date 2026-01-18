"""
IoT Sensor Data Generator
Simulates vehicle sensor data including fuel, tire pressure, engine temp, battery
"""

import random
from datetime import datetime
from typing import Dict, Any


class IoTSensorGenerator:
    """Generates realistic IoT sensor data for vehicles"""
    
    def __init__(self):
        # Maintain state for each vehicle to make data realistic
        self.vehicle_states = {}
    
    def _get_vehicle_state(self, vehicle_id: str) -> Dict:
        """Get or initialize vehicle sensor state"""
        if vehicle_id not in self.vehicle_states:
            self.vehicle_states[vehicle_id] = {
                "fuel_level": random.uniform(40, 100),
                "tire_pressure": [random.uniform(32, 36) for _ in range(4)],
                "engine_temp": random.uniform(85, 95),
                "battery_voltage": random.uniform(12.4, 12.8),
                "odometer": random.uniform(50000, 150000)
            }
        return self.vehicle_states[vehicle_id]
    
    def generate_sensor_data(self, vehicle_id: str) -> Dict[str, Any]:
        """Generate sensor data for a vehicle"""
        state = self._get_vehicle_state(vehicle_id)
        
        # Update fuel (slight decrease)
        state["fuel_level"] = max(5, state["fuel_level"] - random.uniform(0.1, 0.5))
        if state["fuel_level"] < 15 and random.random() < 0.1:
            state["fuel_level"] = random.uniform(80, 100)  # Refueled
        
        # Update tire pressure (small fluctuations)
        for i in range(4):
            state["tire_pressure"][i] += random.uniform(-0.2, 0.2)
            state["tire_pressure"][i] = max(28, min(38, state["tire_pressure"][i]))
        
        # Update engine temperature (fluctuates around operating temp)
        hour = datetime.now().hour
        base_temp = 90 if 10 <= hour <= 18 else 85  # Hotter during day
        state["engine_temp"] += (base_temp - state["engine_temp"]) * 0.1
        state["engine_temp"] += random.uniform(-2, 2)
        state["engine_temp"] = max(70, min(105, state["engine_temp"]))
        
        # Update battery (small fluctuations)
        state["battery_voltage"] += random.uniform(-0.05, 0.05)
        state["battery_voltage"] = max(11.5, min(14.0, state["battery_voltage"]))
        
        # Update odometer
        state["odometer"] += random.uniform(0.5, 2)
        
        return {
            "vehicleId": vehicle_id,
            "fuelLevel": round(state["fuel_level"], 1),
            "tirePressure": [round(p, 1) for p in state["tire_pressure"]],
            "engineTemp": round(state["engine_temp"], 1),
            "batteryVoltage": round(state["battery_voltage"], 2),
            "odometerReading": round(state["odometer"], 1),
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def generate_anomaly(self, vehicle_id: str) -> Dict[str, Any]:
        """Generate an anomalous sensor reading"""
        data = self.generate_sensor_data(vehicle_id)
        
        # Pick a random anomaly type
        anomaly_type = random.choice(["fuel", "tire", "engine", "battery"])
        
        if anomaly_type == "fuel":
            data["fuelLevel"] = random.uniform(0, 5)
        elif anomaly_type == "tire":
            tire_idx = random.randint(0, 3)
            data["tirePressure"][tire_idx] = random.uniform(20, 28)
        elif anomaly_type == "engine":
            data["engineTemp"] = random.uniform(100, 120)
        elif anomaly_type == "battery":
            data["batteryVoltage"] = random.uniform(10, 11.5)
        
        data["anomaly"] = True
        data["anomalyType"] = anomaly_type
        
        return data
