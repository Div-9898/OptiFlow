"""
Demand Forecasting Model using PyTorch
Temporal CNN for predicting delivery volumes per zone
"""

import torch
import torch.nn as nn
import numpy as np
from typing import Dict, List, Tuple
from datetime import datetime, timedelta


class DemandForecastModel(nn.Module):
    """
    Temporal CNN for demand forecasting
    Input: Historical demand data (seq_len, num_zones)
    Output: Predicted demand for next N hours per zone
    """
    
    def __init__(
        self,
        num_zones: int = 10,
        seq_len: int = 24,  # 24 hours history
        forecast_horizon: int = 12,  # Predict next 12 hours
        hidden_channels: int = 32
    ):
        super(DemandForecastModel, self).__init__()
        
        self.num_zones = num_zones
        self.forecast_horizon = forecast_horizon
        
        # Temporal convolution layers
        self.conv1 = nn.Conv1d(num_zones, hidden_channels, kernel_size=3, padding=1)
        self.conv2 = nn.Conv1d(hidden_channels, hidden_channels * 2, kernel_size=3, padding=1)
        self.conv3 = nn.Conv1d(hidden_channels * 2, hidden_channels, kernel_size=3, padding=1)
        
        self.bn1 = nn.BatchNorm1d(hidden_channels)
        self.bn2 = nn.BatchNorm1d(hidden_channels * 2)
        self.bn3 = nn.BatchNorm1d(hidden_channels)
        
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)
        
        # Output layers
        self.fc = nn.Linear(hidden_channels * seq_len, num_zones * forecast_horizon)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (batch, num_zones, seq_len)
        
        # Convolution layers
        x = self.relu(self.bn1(self.conv1(x)))
        x = self.dropout(x)
        
        x = self.relu(self.bn2(self.conv2(x)))
        x = self.dropout(x)
        
        x = self.relu(self.bn3(self.conv3(x)))
        
        # Flatten and predict
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        
        # Reshape to (batch, forecast_horizon, num_zones)
        x = x.view(-1, self.forecast_horizon, self.num_zones)
        
        # Apply ReLU for positive demand
        x = torch.relu(x)
        
        return x


class DemandModelService:
    """Service for demand forecasting using PyTorch model"""
    
    ZONES = [
        "downtown", "marina", "deira", "jumeirah", "al_quoz",
        "business_bay", "internet_city", "al_barsha", "jebel_ali", "airport"
    ]
    
    def __init__(self, model_path: str = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = DemandForecastModel(num_zones=len(self.ZONES)).to(self.device)
        
        if model_path:
            self.load_model(model_path)
        else:
            self._initialize_weights()
        
        self.model.eval()
        
        # Historical data buffer (simulated)
        self.history = self._generate_synthetic_history()
    
    def _initialize_weights(self):
        """Initialize model weights"""
        for m in self.model.modules():
            if isinstance(m, nn.Conv1d):
                nn.init.kaiming_normal_(m.weight)
            elif isinstance(m, nn.Linear):
                nn.init.xavier_normal_(m.weight)
    
    def _generate_synthetic_history(self) -> np.ndarray:
        """Generate synthetic historical demand data"""
        np.random.seed(42)
        
        # 24 hours of history for 10 zones
        base_demand = np.array([
            [15, 12, 10, 8, 6, 5, 6, 10, 18, 25, 28, 30,
             28, 25, 22, 20, 22, 28, 32, 28, 20, 15, 12, 10]
            for _ in range(len(self.ZONES))
        ])
        
        # Add zone-specific scaling
        zone_factors = np.array([1.5, 1.2, 1.0, 0.9, 0.7, 1.3, 1.1, 0.8, 0.6, 1.0])
        base_demand = base_demand * zone_factors[:, np.newaxis]
        
        # Add noise
        noise = np.random.normal(0, 2, base_demand.shape)
        return np.clip(base_demand + noise, 0, 50).astype(np.float32)
    
    def load_model(self, path: str):
        """Load model from file"""
        self.model.load_state_dict(torch.load(path, map_location=self.device))
        self.model.eval()
    
    def save_model(self, path: str):
        """Save model to file"""
        torch.save(self.model.state_dict(), path)
    
    def predict(self, horizon_hours: int = 12) -> Dict:
        """Predict demand for next N hours"""
        with torch.no_grad():
            # Prepare input
            x = torch.tensor(self.history, dtype=torch.float32)
            x = x.unsqueeze(0).to(self.device)  # Add batch dimension
            
            # Get predictions
            predictions = self.model(x)
            predictions = predictions.squeeze(0).cpu().numpy()
        
        # Limit to requested horizon
        predictions = predictions[:min(horizon_hours, 12)]
        
        # Format output
        current_hour = datetime.now().hour
        
        forecast = {
            "by_zone": {},
            "by_hour": [],
            "total_forecast": 0
        }
        
        for zone_idx, zone_name in enumerate(self.ZONES):
            zone_demand = predictions[:, zone_idx].tolist()
            forecast["by_zone"][zone_name] = [round(d, 1) for d in zone_demand]
        
        for hour_offset in range(len(predictions)):
            hour = (current_hour + hour_offset + 1) % 24
            hour_total = predictions[hour_offset].sum()
            forecast["by_hour"].append({
                "hour": hour,
                "demand": round(float(hour_total), 1)
            })
            forecast["total_forecast"] += hour_total
        
        forecast["total_forecast"] = round(forecast["total_forecast"], 1)
        
        return forecast
    
    def predict_zone(self, zone_id: str, horizon_hours: int = 12) -> Dict:
        """Predict demand for a specific zone"""
        if zone_id not in self.ZONES:
            raise ValueError(f"Unknown zone: {zone_id}")
        
        full_forecast = self.predict(horizon_hours)
        zone_demand = full_forecast["by_zone"].get(zone_id, [])
        
        return {
            "zone": zone_id,
            "forecast": zone_demand,
            "peak_hour": zone_demand.index(max(zone_demand)) if zone_demand else 0,
            "peak_demand": max(zone_demand) if zone_demand else 0,
            "total_demand": sum(zone_demand)
        }
    
    def get_peak_hours(self) -> List[Dict]:
        """Get peak demand hours for today"""
        forecast = self.predict(12)
        
        sorted_hours = sorted(
            forecast["by_hour"],
            key=lambda x: x["demand"],
            reverse=True
        )
        
        return sorted_hours[:5]  # Top 5 peak hours
