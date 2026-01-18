"""
Risk Scoring Model using PyTorch
Predicts risk score from weather, traffic, driver fatigue, and vehicle health data
"""

import torch
import torch.nn as nn
import numpy as np
from typing import Dict, List, Tuple


class RiskScoringModel(nn.Module):
    """
    MLP model for risk scoring
    Input: [weather, traffic, driver_fatigue, vehicle_health, hour, day_of_week]
    Output: risk_score (0-1)
    """
    
    def __init__(self, input_dim: int = 8, hidden_dims: List[int] = [64, 32, 16, 8]):
        super(RiskScoringModel, self).__init__()
        
        layers = []
        prev_dim = input_dim
        
        for hidden_dim in hidden_dims:
            layers.extend([
                nn.Linear(prev_dim, hidden_dim),
                nn.BatchNorm1d(hidden_dim),
                nn.ReLU(),
                nn.Dropout(0.2)
            ])
            prev_dim = hidden_dim
        
        # Output layer
        layers.append(nn.Linear(prev_dim, 1))
        layers.append(nn.Sigmoid())  # Output between 0 and 1
        
        self.network = nn.Sequential(*layers)
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)


class RiskModelService:
    """Service for risk prediction using PyTorch model"""
    
    def __init__(self, model_path: str = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = RiskScoringModel().to(self.device)
        
        if model_path:
            self.load_model(model_path)
        else:
            # Initialize with pre-trained weights simulation
            self._initialize_weights()
        
        self.model.eval()
    
    def _initialize_weights(self):
        """Initialize model with reasonable weights for demo"""
        for m in self.model.modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_normal_(m.weight)
                if m.bias is not None:
                    nn.init.zeros_(m.bias)
    
    def load_model(self, path: str):
        """Load model from file"""
        self.model.load_state_dict(torch.load(path, map_location=self.device))
        self.model.eval()
    
    def save_model(self, path: str):
        """Save model to file"""
        torch.save(self.model.state_dict(), path)
    
    def preprocess_features(self, features: Dict) -> torch.Tensor:
        """Preprocess input features for model"""
        # Normalize features to 0-1 range
        feature_vector = [
            features.get("weather", 0.3),           # Weather risk (0-1)
            features.get("traffic", 0.3),           # Traffic congestion (0-1)
            features.get("driver_fatigue", 0.2),    # Driver fatigue (0-1)
            features.get("vehicle_health", 0.2),    # Vehicle health issues (0-1)
            features.get("hour", 12) / 24,          # Hour of day normalized
            features.get("day_of_week", 0) / 6,     # Day of week normalized
            features.get("fuel_level", 80) / 100,   # Fuel level normalized
            features.get("load_ratio", 0.5),        # Load/capacity ratio
        ]
        
        tensor = torch.tensor([feature_vector], dtype=torch.float32)
        return tensor.to(self.device)
    
    def predict(self, features: Dict) -> Tuple[float, str]:
        """Predict risk score and level"""
        with torch.no_grad():
            x = self.preprocess_features(features)
            risk_score = self.model(x).item()
        
        # Determine risk level
        if risk_score < 0.3:
            level = "low"
        elif risk_score < 0.6:
            level = "medium"
        elif risk_score < 0.8:
            level = "high"
        else:
            level = "critical"
        
        return round(risk_score, 4), level
    
    def predict_batch(self, features_list: List[Dict]) -> List[Tuple[float, str]]:
        """Predict risk for multiple inputs"""
        return [self.predict(f) for f in features_list]
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get approximate feature importance based on first layer weights"""
        first_layer = list(self.model.network.children())[0]
        if isinstance(first_layer, nn.Linear):
            weights = first_layer.weight.abs().mean(dim=0).cpu().numpy()
            total = weights.sum()
            
            feature_names = [
                "weather", "traffic", "driver_fatigue", "vehicle_health",
                "hour", "day_of_week", "fuel_level", "load_ratio"
            ]
            
            importance = {
                name: round(float(w / total), 4)
                for name, w in zip(feature_names, weights)
            }
            
            return dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))
        
        return {}


# Training utilities
def create_synthetic_training_data(n_samples: int = 10000) -> Tuple[np.ndarray, np.ndarray]:
    """Create synthetic training data for risk model"""
    np.random.seed(42)
    
    # Generate features
    X = np.random.rand(n_samples, 8)
    
    # Generate labels based on weighted combination
    weights = np.array([0.25, 0.25, 0.30, 0.20, 0.05, 0.02, -0.03, 0.05])
    y = X @ weights + np.random.normal(0, 0.05, n_samples)
    y = np.clip(y, 0, 1)
    
    return X.astype(np.float32), y.astype(np.float32)


def train_risk_model(model: RiskScoringModel, epochs: int = 100, lr: float = 0.001):
    """Train the risk model on synthetic data"""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    
    X, y = create_synthetic_training_data()
    X_tensor = torch.tensor(X).to(device)
    y_tensor = torch.tensor(y).unsqueeze(1).to(device)
    
    # Split data
    split = int(0.8 * len(X))
    X_train, X_val = X_tensor[:split], X_tensor[split:]
    y_train, y_val = y_tensor[:split], y_tensor[split:]
    
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    
    model.train()
    for epoch in range(epochs):
        optimizer.zero_grad()
        outputs = model(X_train)
        loss = criterion(outputs, y_train)
        loss.backward()
        optimizer.step()
        
        if (epoch + 1) % 20 == 0:
            model.eval()
            with torch.no_grad():
                val_loss = criterion(model(X_val), y_val)
            print(f"Epoch {epoch+1}/{epochs}, Train Loss: {loss.item():.4f}, Val Loss: {val_loss.item():.4f}")
            model.train()
    
    model.eval()
    return model
