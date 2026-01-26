// Vehicle Types
export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  status: VehicleStatus;
  driverId: string;
  driverName: string;
  capacity: number;
  currentLoad: number;
  fuelLevel: number;
  nextDeliveryId: string | null;
  route: Coordinate[];
}

export type VehicleStatus = 'active' | 'idle' | 'maintenance' | 'offline';

export interface Coordinate {
  lat: number;
  lng: number;
}

// Delivery Types
export interface Delivery {
  id: string;
  customerName: string;
  address: string;
  lat: number;
  lng: number;
  timeWindowStart: string;
  timeWindowEnd: string;
  priority: DeliveryPriority;
  status: DeliveryStatus;
  assignedVehicleId: string | null;
  estimatedArrival: string | null;
  actualArrival: string | null;
  packageWeight: number;
}

export type DeliveryPriority = 'high' | 'medium' | 'low';
export type DeliveryStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'failed';

// Risk Types
export interface RiskScore {
  vehicleId: string;
  overall: number;
  weather: number;
  traffic: number;
  driverFatigue: number;
  vehicleHealth: number;
  level: RiskLevel;
  factors: RiskFactor[];
  timestamp: string;
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskFactor {
  name: string;
  value: number;
  weight: number;
  description: string;
}

// IoT Sensor Types
export interface IoTSensorData {
  vehicleId: string;
  fuelLevel: number;
  tirePressure: number[];
  engineTemp: number;
  batteryVoltage: number;
  odometerReading: number;
  timestamp: string;
}

// Traffic Types
export interface TrafficData {
  zoneId: string;
  congestionLevel: number;
  averageSpeed: number;
  incidentCount: number;
  timestamp: string;
}

// Weather Types
export interface WeatherData {
  temperature: number;
  precipitation: number;
  visibility: number;
  windSpeed: number;
  condition: string;
  timestamp: string;
}

// Optimization Types
export interface OptimizationRun {
  id: string;
  status: OptimizationStatus;
  algorithm: string;
  iteration: number;
  currentCost: number;
  bestCost: number;
  temperature?: number;
  routes: OptimizedRoute[];
  startTime: string;
  endTime?: string;
  savingsPercent?: number;
}

export type OptimizationStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface OptimizedRoute {
  vehicleId: string;
  stops: RouteStop[];
  totalDistance: number;
  totalTime: number;
  polyline: string;
}

export interface RouteStop {
  deliveryId: string;
  sequence: number;
  arrivalTime: string;
  departureTime: string;
  lat: number;
  lng: number;
}

// Communication Types
export interface Message {
  id: string;
  customerId: string;
  customerName: string;
  content: string;
  tone: MessageTone;
  sentiment: SentimentScore;
  createdAt: string;
  type: 'inbound' | 'outbound';
}

export type MessageTone = 'formal' | 'friendly' | 'urgent' | 'apologetic';

export interface SentimentScore {
  positive: number;
  negative: number;
  neutral: number;
}

// Fairness Types
export interface FairnessMetrics {
  demographicParity: number;
  geographicEquity: number;
  temporalFairness: number;
  giniCoefficient: number;
  disparateImpactRatio: number;
  timestamp: string;
}

export interface BiasAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  affectedGroup: string;
  recommendation: string;
  timestamp: string;
}

// Ethics Types
export interface EthicalDilemma {
  id: string;
  type: DilemmaType;
  situation: string;
  stakeholders: string[];
  options: DilemmaOption[];
}

export type DilemmaType = 
  | 'resource_allocation'
  | 'safety_vs_deadline'
  | 'privacy_vs_optimization'
  | 'fairness_vs_profit'
  | 'transparency_vs_efficiency';

export interface DilemmaOption {
  id: string;
  description: string;
  tradeoffs: string[];
  ethicalScores: EthicalScores;
}

export interface EthicalScores {
  utilitarian: number;
  deontological: number;
  virtueEthics: number;
  careEthics: number;
}

export interface MonteCarloResult {
  successRate: number;
  averageCost: number;
  riskDistribution: number[];
  confidenceInterval: [number, number];
  simulations: number;
}

// Stakeholder Types
export interface Stakeholder {
  id: string;
  name: string;
  type: StakeholderType;
  power: number;
  interest: number;
  influence: number;
}

export type StakeholderType = 
  | 'company'
  | 'drivers'
  | 'customers'
  | 'regulators'
  | 'community'
  | 'shareholders';

export interface StakeholderRelationship {
  source: string;
  target: string;
  type: RelationshipType;
  strength: number;
}

export type RelationshipType = 
  | 'influences'
  | 'depends_on'
  | 'conflicts_with'
  | 'benefits_from';

// Dashboard Types
export interface DashboardMetrics {
  totalVehicles: number;
  activeVehicles: number;
  totalDeliveries: number;
  completedDeliveries: number;
  onTimeRate: number;
  averageRiskScore: number;
  totalDistance: number;
  fuelEfficiency: number;
}

// WebSocket Event Types
export interface SocketEvents {
  'vehicle:position': VehiclePositionUpdate;
  'vehicle:status': VehicleStatusUpdate;
  'delivery:status': DeliveryStatusUpdate;
  'optimization:progress': OptimizationProgress;
  'optimization:complete': OptimizationComplete;
  'risk:alert': RiskAlert;
  'metrics:update': DashboardMetrics;
  'iot:sensor': IoTSensorData;
  'vehicles:update': any;
  'stats:update': any;
  'alert': RiskAlert;
}

export interface VehiclePositionUpdate {
  vehicleId: string;
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: string;
}

export interface VehicleStatusUpdate {
  vehicleId: string;
  status: VehicleStatus;
  timestamp: string;
}

export interface DeliveryStatusUpdate {
  deliveryId: string;
  status: DeliveryStatus;
  vehicleId: string;
  timestamp: string;
}

export interface OptimizationProgress {
  runId: string;
  iteration: number;
  currentCost: number;
  bestCost: number;
  temperature?: number;
  currentRoutes: OptimizedRoute[];
}

export interface OptimizationComplete {
  runId: string;
  routes: OptimizedRoute[];
  savingsPercent: number;
  totalIterations: number;
}

export interface RiskAlert {
  id?: string;
  vehicleId: string;
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  recommendation: string;
  timestamp: string;
}
