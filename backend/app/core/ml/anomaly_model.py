"""
Anomaly Detection Model using PyTorch Autoencoder
Detects unusual patterns in IoT sensor data
"""

import torch
import torch.nn as nn
import numpy as np
from typing import Dict, List, Tuple
from collections import deque


class AnomalyAutoencoder(nn.Module):
    """
    Autoencoder for IoT sensor anomaly detection
    Input: Sensor readings (fuel, tire_pressure x 4, engine_temp, battery_voltage)
    Output: Reconstruction of input
    Anomaly = high reconstruction error
    """
    
    def __init__(self, input_dim: int = 7, latent_dim: int = 3):
        super(AnomalyAutoencoder, self).__init__()
        
        # Encoder
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, latent_dim)
        )
        
        # Decoder
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 8),
            nn.ReLU(),
            nn.Linear(8, 16),
            nn.ReLU(),
            nn.Linear(16, input_dim)
        )
    
    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        encoded = self.encoder(x)
        decoded = self.decoder(encoded)
        return decoded, encoded
    
    def encode(self, x: torch.Tensor) -> torch.Tensor:
        return self.encoder(x)
    
    def decode(self, z: torch.Tensor) -> torch.Tensor:
        return self.decoder(z)


class AnomalyModelService:
    """Service for anomaly detection using PyTorch autoencoder"""
    
    def __init__(self, model_path: str = None, threshold: float = 0.1):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = AnomalyAutoencoder().to(self.device)
        self.threshold = threshold
        
        if model_path:
            self.load_model(model_path)
        else:
            self._initialize_and_pretrain()
        
        self.model.eval()
        
        # Keep track of recent readings for dynamic threshold
        self.recent_errors = deque(maxlen=100)
        
        # Normal value ranges for sensors
        self.normal_ranges = {
            "fuel": (10, 100),
            "tire_0": (28, 38),
            "tire_1": (28, 38),
            "tire_2": (28, 38),
            "tire_3": (28, 38),
            "engine_temp": (70, 105),
            "battery": (11.5, 14.0)
        }
    
    def _initialize_and_pretrain(self):
        """Initialize and pretrain on synthetic normal data"""
        # Generate synthetic normal data
        np.random.seed(42)
        n_samples = 1000
        
        normal_data = np.zeros((n_samples, 7))
        normal_data[:, 0] = np.random.uniform(40, 100, n_samples)  # Fuel
        for i in range(4):
            normal_data[:, i + 1] = np.random.uniform(32, 36, n_samples)  # Tires
        normal_data[:, 5] = np.random.uniform(85, 95, n_samples)  # Engine temp
        normal_data[:, 6] = np.random.uniform(12.4, 12.8, n_samples)  # Battery
        
        # Normalize
        normal_data = self._normalize(normal_data)
        
        # Train
        X = torch.tensor(normal_data, dtype=torch.float32).to(self.device)
        
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(self.model.parameters(), lr=0.001)
        
        self.model.train()
        for epoch in range(100):
            optimizer.zero_grad()
            reconstructed, _ = self.model(X)
            loss = criterion(reconstructed, X)
            loss.backward()
            optimizer.step()
        
        self.model.eval()
        
        # Set threshold based on training error
        with torch.no_grad():
            reconstructed, _ = self.model(X)
            errors = ((X - reconstructed) ** 2).mean(dim=1)
            self.threshold = errors.mean().item() + 2 * errors.std().item()
    
    def _normalize(self, data: np.ndarray) -> np.ndarray:
        """Normalize sensor data to 0-1 range"""
        mins = np.array([10, 28, 28, 28, 28, 70, 11.5])
        maxs = np.array([100, 38, 38, 38, 38, 105, 14.0])
        return (data - mins) / (maxs - mins + 1e-6)
    
    def _denormalize(self, data: np.ndarray) -> np.ndarray:
        """Denormalize data back to original range"""
        mins = np.array([10, 28, 28, 28, 28, 70, 11.5])
        maxs = np.array([100, 38, 38, 38, 38, 105, 14.0])
        return data * (maxs - mins) + mins
    
    def load_model(self, path: str):
        """Load model from file"""
        self.model.load_state_dict(torch.load(path, map_location=self.device))
        self.model.eval()
    
    def save_model(self, path: str):
        """Save model to file"""
        torch.save(self.model.state_dict(), path)
    
    def preprocess_sensor_data(self, sensor_data: Dict) -> torch.Tensor:
        """Convert sensor data dict to tensor"""
        tire_pressure = sensor_data.get("tirePressure", [32, 32, 32, 32])
        if len(tire_pressure) < 4:
            tire_pressure = tire_pressure + [32] * (4 - len(tire_pressure))
        
        features = [
            sensor_data.get("fuelLevel", 50),
            tire_pressure[0],
            tire_pressure[1],
            tire_pressure[2],
            tire_pressure[3],
            sensor_data.get("engineTemp", 90),
            sensor_data.get("batteryVoltage", 12.5)
        ]
        
        # Normalize
        features = np.array([features])
        features = self._normalize(features)
        
        return torch.tensor(features, dtype=torch.float32).to(self.device)
    
    def detect(self, sensor_data: Dict) -> Dict:
        """Detect anomalies in sensor data"""
        with torch.no_grad():
            x = self.preprocess_sensor_data(sensor_data)
            reconstructed, latent = self.model(x)
            
            # Calculate reconstruction error per feature
            errors = ((x - reconstructed) ** 2).squeeze().cpu().numpy()
            total_error = errors.mean()
        
        # Track error for dynamic threshold
        self.recent_errors.append(total_error)
        
        # Determine if anomaly
        is_anomaly = total_error > self.threshold
        
        # Identify anomalous features
        anomalous_features = []
        feature_names = ["fuel", "tire_0", "tire_1", "tire_2", "tire_3", "engine_temp", "battery"]
        
        for i, (name, error) in enumerate(zip(feature_names, errors)):
            if error > self.threshold * 1.5:
                # Get actual value
                if "tire" in name:
                    idx = int(name.split("_")[1])
                    actual = sensor_data.get("tirePressure", [32]*4)[idx]
                elif name == "fuel":
                    actual = sensor_data.get("fuelLevel", 50)
                elif name == "engine_temp":
                    actual = sensor_data.get("engineTemp", 90)
                else:
                    actual = sensor_data.get("batteryVoltage", 12.5)
                
                anomalous_features.append({
                    "feature": name,
                    "error": float(error),
                    "actual_value": actual,
                    "normal_range": self.normal_ranges.get(name, (0, 100))
                })
        
        # Calculate confidence
        if self.recent_errors:
            mean_error = np.mean(self.recent_errors)
            std_error = np.std(self.recent_errors) + 1e-6
            z_score = (total_error - mean_error) / std_error
            confidence = min(1.0, max(0.0, 0.5 + z_score * 0.2))
        else:
            confidence = 0.5 if is_anomaly else 0.8
        
        return {
            "is_anomaly": is_anomaly,
            "confidence": round(float(confidence), 3),
            "reconstruction_error": round(float(total_error), 6),
            "threshold": round(float(self.threshold), 6),
            "anomalous_features": anomalous_features,
            "vehicle_id": sensor_data.get("vehicleId", "unknown")
        }
    
    def detect_batch(self, sensor_data_list: List[Dict]) -> List[Dict]:
        """Detect anomalies in batch of sensor data"""
        return [self.detect(data) for data in sensor_data_list]
    
    def update_threshold(self, factor: float = 1.0):
        """Update anomaly threshold"""
        if self.recent_errors:
            mean_error = np.mean(self.recent_errors)
            std_error = np.std(self.recent_errors)
            self.threshold = (mean_error + 2 * std_error) * factor
