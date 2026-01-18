from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    plate_number = Column(String(20), unique=True, nullable=False)
    capacity = Column(Integer, default=100)
    current_lat = Column(Float, nullable=False)
    current_lng = Column(Float, nullable=False)
    heading = Column(Float, default=0)
    speed = Column(Float, default=0)
    status = Column(String(20), default="idle")
    driver_id = Column(UUID(as_uuid=True), nullable=True)
    driver_name = Column(String(100), nullable=True)
    fuel_level = Column(Integer, default=100)
    current_load = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    deliveries = relationship("Delivery", back_populates="vehicle")
    risk_scores = relationship("RiskScore", back_populates="vehicle")
    iot_data = relationship("IoTSensorData", back_populates="vehicle")


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_name = Column(String(100), nullable=False)
    address = Column(Text, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    time_window_start = Column(String(10), nullable=True)
    time_window_end = Column(String(10), nullable=True)
    priority = Column(String(20), default="medium")
    status = Column(String(20), default="pending")
    assigned_vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"), nullable=True)
    estimated_arrival = Column(DateTime, nullable=True)
    actual_arrival = Column(DateTime, nullable=True)
    package_weight = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="deliveries")


class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"))
    overall_score = Column(Float, nullable=False)
    weather_score = Column(Float, nullable=True)
    traffic_score = Column(Float, nullable=True)
    driver_fatigue_score = Column(Float, nullable=True)
    vehicle_health_score = Column(Float, nullable=True)
    risk_level = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="risk_scores")


class IoTSensorData(Base):
    __tablename__ = "iot_sensor_data"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id"))
    fuel_level = Column(Float, nullable=True)
    tire_pressure = Column(JSON, nullable=True)
    engine_temp = Column(Float, nullable=True)
    battery_voltage = Column(Float, nullable=True)
    odometer_reading = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="iot_data")


class OptimizationRun(Base):
    __tablename__ = "optimization_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    algorithm = Column(String(50), nullable=False)
    status = Column(String(20), default="pending")
    num_vehicles = Column(Integer, nullable=True)
    num_deliveries = Column(Integer, nullable=True)
    initial_cost = Column(Float, nullable=True)
    final_cost = Column(Float, nullable=True)
    savings_percent = Column(Float, nullable=True)
    total_iterations = Column(Integer, nullable=True)
    routes = Column(JSON, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), nullable=True)
    customer_name = Column(String(100), nullable=True)
    content = Column(Text, nullable=False)
    tone = Column(String(20), nullable=True)
    sentiment_positive = Column(Float, nullable=True)
    sentiment_negative = Column(Float, nullable=True)
    sentiment_neutral = Column(Float, nullable=True)
    message_type = Column(String(20), default="outbound")
    created_at = Column(DateTime, default=datetime.utcnow)


class FairnessAudit(Base):
    __tablename__ = "fairness_audits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    demographic_parity = Column(Float, nullable=True)
    geographic_equity = Column(Float, nullable=True)
    temporal_fairness = Column(Float, nullable=True)
    gini_coefficient = Column(Float, nullable=True)
    disparate_impact_ratio = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class EthicalSimulation(Base):
    __tablename__ = "ethical_simulations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dilemma_type = Column(String(50), nullable=True)
    scenario = Column(JSON, nullable=True)
    decision = Column(String(100), nullable=True)
    simulation_results = Column(JSON, nullable=True)
    num_simulations = Column(Integer, default=1000)
    created_at = Column(DateTime, default=datetime.utcnow)
