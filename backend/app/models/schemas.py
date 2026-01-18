from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


# Enums
class VehicleStatus(str, Enum):
    active = "active"
    idle = "idle"
    maintenance = "maintenance"
    offline = "offline"


class DeliveryPriority(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class DeliveryStatus(str, Enum):
    pending = "pending"
    assigned = "assigned"
    in_transit = "in_transit"
    delivered = "delivered"
    failed = "failed"


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class MessageTone(str, Enum):
    formal = "formal"
    friendly = "friendly"
    urgent = "urgent"
    apologetic = "apologetic"


# Vehicle Schemas
class VehicleBase(BaseModel):
    name: str
    plate_number: str
    capacity: int = 100


class VehicleCreate(VehicleBase):
    lat: float
    lng: float
    driver_name: Optional[str] = None


class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[VehicleStatus] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    heading: Optional[float] = None
    speed: Optional[float] = None
    fuel_level: Optional[int] = None
    current_load: Optional[int] = None


class VehicleResponse(VehicleBase):
    id: UUID
    lat: float = Field(alias="current_lat")
    lng: float = Field(alias="current_lng")
    heading: float
    speed: float
    status: VehicleStatus
    driver_id: Optional[UUID] = None
    driver_name: Optional[str] = None
    fuel_level: int
    current_load: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


class VehiclePositionUpdate(BaseModel):
    vehicle_id: str
    lat: float
    lng: float
    heading: float
    speed: float
    timestamp: str


# Delivery Schemas
class DeliveryBase(BaseModel):
    customer_name: str
    address: str
    lat: float
    lng: float
    priority: DeliveryPriority = DeliveryPriority.medium


class DeliveryCreate(DeliveryBase):
    time_window_start: Optional[str] = None
    time_window_end: Optional[str] = None
    package_weight: float = 1.0


class DeliveryResponse(DeliveryBase):
    id: UUID
    status: DeliveryStatus
    assigned_vehicle_id: Optional[UUID] = None
    estimated_arrival: Optional[datetime] = None
    time_window_start: Optional[str] = None
    time_window_end: Optional[str] = None
    package_weight: float

    class Config:
        from_attributes = True


# Optimization Schemas
class OptimizationRequest(BaseModel):
    delivery_locations: List[Dict[str, Any]]
    num_vehicles: int
    depot_location: Dict[str, float]
    algorithm: str = "ortools"
    time_limit_seconds: int = 30
    # Genetic Algorithm params
    population_size: int = 50
    mutation_rate: float = 0.1
    # Simulated Annealing params
    initial_temp: float = 10000.0
    cooling_rate: float = 0.995


class OptimizationProgress(BaseModel):
    run_id: str
    iteration: int
    current_cost: float
    best_cost: float
    temperature: Optional[float] = None
    current_routes: List[Dict[str, Any]] = []


class OptimizationComplete(BaseModel):
    run_id: str
    routes: List[Dict[str, Any]]
    savings_percent: float
    total_iterations: int


class OptimizationResponse(BaseModel):
    run_id: str
    status: str
    routes: List[Dict[str, Any]] = []


# Risk Schemas
class RiskFactorSchema(BaseModel):
    name: str
    value: float
    weight: float
    description: str


class RiskScoreResponse(BaseModel):
    vehicle_id: str
    overall: float
    weather: float
    traffic: float
    driver_fatigue: float
    vehicle_health: float
    level: RiskLevel
    factors: List[RiskFactorSchema]
    timestamp: str


class RiskPredictionRequest(BaseModel):
    vehicle_id: str
    horizon_hours: int = 24


# Communication Schemas
class MessageGenerateRequest(BaseModel):
    customer_id: str
    context: str
    tone: MessageTone = MessageTone.friendly
    delivery_status: Optional[str] = None


class MessageGenerateResponse(BaseModel):
    message: str
    tone: MessageTone
    sentiment: Dict[str, float]


class SentimentAnalysisRequest(BaseModel):
    text: str


class SentimentAnalysisResponse(BaseModel):
    positive: float
    negative: float
    neutral: float


# Fairness Schemas
class FairnessMetricsResponse(BaseModel):
    demographic_parity: float
    geographic_equity: float
    temporal_fairness: float
    gini_coefficient: float
    disparate_impact_ratio: float
    timestamp: str


class CounterfactualRequest(BaseModel):
    customer_id: str
    changes: Dict[str, Any]


class CounterfactualResponse(BaseModel):
    original_priority: str
    counterfactual_priority: str
    feature_importance: Dict[str, float]
    bias_detected: bool
    explanation: str


# Ethics Schemas
class DilemmaOptionSchema(BaseModel):
    id: str
    description: str
    tradeoffs: List[str]
    ethical_scores: Dict[str, float]


class EthicalDilemmaSchema(BaseModel):
    id: str
    type: str
    situation: str
    stakeholders: List[str]
    options: List[DilemmaOptionSchema]


class MonteCarloRequest(BaseModel):
    scenario_id: str
    decision: str
    num_simulations: int = 1000


class MonteCarloResponse(BaseModel):
    success_rate: float
    average_cost: float
    risk_distribution: List[float]
    confidence_interval: List[float]
    simulations: int


# Stakeholder Schemas
class StakeholderSchema(BaseModel):
    id: str
    name: str
    type: str
    power: float
    interest: float
    influence: float


class StakeholderRelationshipSchema(BaseModel):
    source: str
    target: str
    type: str
    strength: float


class StakeholderNetworkResponse(BaseModel):
    nodes: List[StakeholderSchema]
    links: List[StakeholderRelationshipSchema]


# Policy Schemas
class PolicyGenerateRequest(BaseModel):
    type: str
    context: Dict[str, Any]
    include_sections: List[str] = []


class PolicyGenerateResponse(BaseModel):
    document: str
    sections: List[str]
    generated_at: str


# Dashboard Schemas
class DashboardMetrics(BaseModel):
    total_vehicles: int
    active_vehicles: int
    total_deliveries: int
    completed_deliveries: int
    on_time_rate: float
    average_risk_score: float
    total_distance: float
    fuel_efficiency: float


# IoT Schemas
class IoTSensorDataSchema(BaseModel):
    vehicle_id: str
    fuel_level: float
    tire_pressure: List[float]
    engine_temp: float
    battery_voltage: float
    odometer_reading: float
    timestamp: str
