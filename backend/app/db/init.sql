-- Initialize Logistics AI Platform Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 100,
    current_lat DECIMAL(10, 8) NOT NULL,
    current_lng DECIMAL(11, 8) NOT NULL,
    heading DECIMAL(5, 2) DEFAULT 0,
    speed DECIMAL(6, 2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'idle',
    driver_id UUID,
    driver_name VARCHAR(100),
    fuel_level INTEGER DEFAULT 100,
    current_load INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    time_window_start TIME,
    time_window_end TIME,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'pending',
    assigned_vehicle_id UUID REFERENCES vehicles(id),
    estimated_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    package_weight DECIMAL(8, 2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk scores table
CREATE TABLE IF NOT EXISTS risk_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id),
    overall_score DECIMAL(4, 3) NOT NULL,
    weather_score DECIMAL(4, 3),
    traffic_score DECIMAL(4, 3),
    driver_fatigue_score DECIMAL(4, 3),
    vehicle_health_score DECIMAL(4, 3),
    risk_level VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IoT sensor data table
CREATE TABLE IF NOT EXISTS iot_sensor_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES vehicles(id),
    fuel_level DECIMAL(5, 2),
    tire_pressure JSONB,
    engine_temp DECIMAL(5, 2),
    battery_voltage DECIMAL(4, 2),
    odometer_reading DECIMAL(12, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optimization runs table
CREATE TABLE IF NOT EXISTS optimization_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    algorithm VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    num_vehicles INTEGER,
    num_deliveries INTEGER,
    initial_cost DECIMAL(12, 2),
    final_cost DECIMAL(12, 2),
    savings_percent DECIMAL(5, 2),
    total_iterations INTEGER,
    routes JSONB,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID,
    customer_name VARCHAR(100),
    content TEXT NOT NULL,
    tone VARCHAR(20),
    sentiment_positive DECIMAL(4, 3),
    sentiment_negative DECIMAL(4, 3),
    sentiment_neutral DECIMAL(4, 3),
    message_type VARCHAR(20) DEFAULT 'outbound',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fairness audits table
CREATE TABLE IF NOT EXISTS fairness_audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    demographic_parity DECIMAL(6, 4),
    geographic_equity DECIMAL(6, 4),
    temporal_fairness DECIMAL(6, 4),
    gini_coefficient DECIMAL(6, 4),
    disparate_impact_ratio DECIMAL(6, 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ethical simulations table
CREATE TABLE IF NOT EXISTS ethical_simulations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dilemma_type VARCHAR(50),
    scenario JSONB,
    decision VARCHAR(100),
    simulation_results JSONB,
    num_simulations INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);
CREATE INDEX IF NOT EXISTS idx_deliveries_vehicle ON deliveries(assigned_vehicle_id);
CREATE INDEX IF NOT EXISTS idx_risk_scores_vehicle ON risk_scores(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_iot_data_vehicle ON iot_sensor_data(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_messages_customer ON messages(customer_id);
