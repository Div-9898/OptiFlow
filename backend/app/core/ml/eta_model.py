"""
ETA Prediction Model using PyTorch LSTM
Predicts estimated time of arrival based on route and traffic conditions
"""

import torch
import torch.nn as nn
import numpy as np
from typing import Dict, List, Tuple


class ETAPredictionModel(nn.Module):
    """
    LSTM model for ETA prediction
    Input: Sequence of (distance, traffic, weather, time_features)
    Output: Predicted delivery time in minutes
    """
    
    def __init__(
        self,
        input_dim: int = 6,
        hidden_dim: int = 64,
        num_layers: int = 2,
        dropout: float = 0.2
    ):
        super(ETAPredictionModel, self).__init__()
        
        self.hidden_dim = hidden_dim
        self.num_layers = num_layers
        
        # LSTM layers
        self.lstm = nn.LSTM(
            input_size=input_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0
        )
        
        # Fully connected layers
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim, 32),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(32, 1),
            nn.ReLU()  # ETA should be positive
        )
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (batch, seq_len, input_dim)
        
        # LSTM forward pass
        lstm_out, (h_n, c_n) = self.lstm(x)
        
        # Use last hidden state
        last_hidden = h_n[-1]  # Shape: (batch, hidden_dim)
        
        # Predict ETA
        output = self.fc(last_hidden)
        
        return output


class ETAModelService:
    """Service for ETA prediction using PyTorch LSTM model"""
    
    def __init__(self, model_path: str = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = ETAPredictionModel().to(self.device)
        
        if model_path:
            self.load_model(model_path)
        else:
            self._initialize_weights()
        
        self.model.eval()
        
        # Average speed assumptions (km/h) by traffic level
        self.speed_by_traffic = {
            0.0: 60,  # No traffic
            0.3: 45,  # Light traffic
            0.5: 35,  # Moderate traffic
            0.7: 25,  # Heavy traffic
            1.0: 15,  # Severe congestion
        }
    
    def _initialize_weights(self):
        """Initialize model weights"""
        for name, param in self.model.named_parameters():
            if 'weight' in name:
                if 'lstm' in name:
                    nn.init.orthogonal_(param)
                else:
                    nn.init.xavier_normal_(param)
            elif 'bias' in name:
                nn.init.zeros_(param)
    
    def load_model(self, path: str):
        """Load model from file"""
        self.model.load_state_dict(torch.load(path, map_location=self.device))
        self.model.eval()
    
    def save_model(self, path: str):
        """Save model to file"""
        torch.save(self.model.state_dict(), path)
    
    def preprocess_route(self, route_data: Dict) -> torch.Tensor:
        """
        Preprocess route data for model
        
        route_data:
            - segments: List of route segments with distance, traffic, etc.
            - origin: (lat, lng)
            - destination: (lat, lng)
            - hour: Current hour
        """
        segments = route_data.get("segments", [])
        
        if not segments:
            # Create single segment from origin to destination
            distance = route_data.get("distance", 10)  # km
            traffic = route_data.get("traffic", 0.3)
            
            segments = [{
                "distance": distance,
                "traffic": traffic,
                "weather": route_data.get("weather", 0.1),
                "is_highway": 0,
                "hour": route_data.get("hour", 12) / 24,
                "is_rush_hour": 1 if route_data.get("hour", 12) in [7, 8, 9, 17, 18, 19] else 0
            }]
        
        # Convert to sequence
        sequence = []
        for seg in segments:
            features = [
                seg.get("distance", 5) / 50,  # Normalize distance (assume max 50km)
                seg.get("traffic", 0.3),
                seg.get("weather", 0.1),
                seg.get("is_highway", 0),
                seg.get("hour", 0.5),
                seg.get("is_rush_hour", 0)
            ]
            sequence.append(features)
        
        # Pad or truncate to fixed length
        max_len = 10
        while len(sequence) < max_len:
            sequence.append([0] * 6)
        sequence = sequence[:max_len]
        
        tensor = torch.tensor([sequence], dtype=torch.float32)
        return tensor.to(self.device)
    
    def predict(self, route_data: Dict) -> Dict:
        """Predict ETA for a route"""
        with torch.no_grad():
            x = self.preprocess_route(route_data)
            eta_normalized = self.model(x).item()
        
        # Scale output to realistic ETA (in minutes)
        # Model outputs normalized value, scale to 0-180 minutes
        base_eta = eta_normalized * 180
        
        # Apply heuristic adjustment based on distance and traffic
        distance = route_data.get("distance", 10)
        traffic = route_data.get("traffic", 0.3)
        
        # Find closest traffic level for speed lookup
        traffic_levels = sorted(self.speed_by_traffic.keys())
        closest_level = min(traffic_levels, key=lambda x: abs(x - traffic))
        avg_speed = self.speed_by_traffic[closest_level]
        
        # Calculate heuristic ETA
        heuristic_eta = (distance / avg_speed) * 60  # Convert to minutes
        
        # Blend model prediction with heuristic
        final_eta = 0.6 * base_eta + 0.4 * heuristic_eta
        final_eta = max(5, final_eta)  # Minimum 5 minutes
        
        # Calculate confidence based on traffic variability
        confidence = max(0.5, 1 - traffic * 0.5)
        
        return {
            "eta_minutes": round(final_eta, 1),
            "eta_formatted": self._format_eta(final_eta),
            "confidence": round(confidence, 2),
            "distance_km": distance,
            "traffic_level": self._traffic_level_name(traffic)
        }
    
    def _format_eta(self, minutes: float) -> str:
        """Format ETA as human-readable string"""
        if minutes < 60:
            return f"{int(minutes)} min"
        hours = int(minutes // 60)
        mins = int(minutes % 60)
        return f"{hours}h {mins}m"
    
    def _traffic_level_name(self, traffic: float) -> str:
        """Get traffic level name"""
        if traffic < 0.2:
            return "free_flow"
        elif traffic < 0.4:
            return "light"
        elif traffic < 0.6:
            return "moderate"
        elif traffic < 0.8:
            return "heavy"
        return "severe"
    
    def predict_batch(self, routes: List[Dict]) -> List[Dict]:
        """Predict ETA for multiple routes"""
        return [self.predict(route) for route in routes]
