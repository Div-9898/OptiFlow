'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Cloud, 
  Car, 
  Users, 
  Wrench,
  Activity,
  TrendingUp,
  TrendingDown,
  Shield,
  MapPin,
  X,
  ChevronRight,
  RefreshCw,
  Send,
  Clock,
  Target,
  Radio,
  AlertCircle,
  CheckCircle,
  Truck,
  Gauge,
  Brain,
  Zap,
  Eye
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { cn } from '@/lib/utils';
import PageLayout from '@/components/dashboard/PageLayout';
import {
  RiskKPIDashboard,
  RiskAlertToasts,
  RiskTrendGauges,
  IncidentFeed
} from '@/components/risk';

// Types
interface RiskFactor {
  name: string;
  current_value: number;
  previous_value: number;
  weight: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  prediction_1h: number;
  prediction_6h: number;
  description: string;
  mitigation: string;
  icon: string;
  color: string;
}

interface VehicleRisk {
  vehicle_id: string;
  vehicle_name: string;
  driver_name: string;
  overall_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  factors: RiskFactor[];
  location: { lat: number; lng: number };
  predictions: Array<{ hour: number; time: string; predicted_risk: number; risk_level: string }>;
  anomaly_detected: boolean;
  anomaly_description: string | null;
  recommended_actions: string[];
  timestamp: string;
}

interface FleetSummary {
  average_risk: number;
  high_risk_count: number;
  critical_count: number;
  total_vehicles: number;
  risk_distribution: { low: number; medium: number; high: number; critical: number };
  top_risk_factors: Array<{ name: string; average: number; max: number; vehicles_affected: number }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  ai_summary: string;
  predictions: Array<{ hour: number; predicted_risk: number; risk_level: string }>;
}

interface Alert {
  id: string;
  vehicle_id: string;
  vehicle_name: string;
  driver_name: string;
  risk_level: string;
  overall_score: number;
  location: { lat: number; lng: number };
  top_factors: Array<{ name: string; value: number; color: string }>;
  recommended_actions: string[];
  anomaly_detected: boolean;
  anomaly_description: string | null;
  timestamp: string;
}

// Risk color helper
const getRiskColor = (level: string | number): string => {
  if (typeof level === 'number') {
    if (level < 0.3) return '#10b981';
    if (level < 0.55) return '#f59e0b';
    if (level < 0.75) return '#ef4444';
    return '#dc2626';
  }
  switch (level) {
    case 'low': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'high': return '#ef4444';
    case 'critical': return '#dc2626';
    default: return '#6b7280';
  }
};

// Icon component helper
const FactorIcon = ({ name }: { name: string }) => {
  const iconClass = "w-5 h-5";
  switch (name.toLowerCase()) {
    case 'weather': return <Cloud className={iconClass} />;
    case 'traffic': return <Car className={iconClass} />;
    case 'driver fatigue': return <Users className={iconClass} />;
    case 'vehicle health': return <Wrench className={iconClass} />;
    case 'route risk': return <MapPin className={iconClass} />;
    case 'cargo status': return <Truck className={iconClass} />;
    case 'driving behavior': return <Gauge className={iconClass} />;
    default: return <AlertTriangle className={iconClass} />;
  }
};

// Mock fleet summary - defined outside component
const MOCK_FLEET_SUMMARY: FleetSummary = {
  average_risk: 0.44,
  high_risk_count: 2,
  critical_count: 1,
  total_vehicles: 12,
  risk_distribution: { low: 5, medium: 4, high: 2, critical: 1 },
  top_risk_factors: [
    { name: 'Driver Fatigue', average: 0.35, max: 0.78, vehicles_affected: 4 },
    { name: 'Vehicle Health', average: 0.28, max: 0.82, vehicles_affected: 3 },
    { name: 'Route Risk', average: 0.38, max: 0.65, vehicles_affected: 5 },
    { name: 'Weather', average: 0.22, max: 0.55, vehicles_affected: 6 },
    { name: 'Traffic', average: 0.42, max: 0.71, vehicles_affected: 7 }
  ],
  trend: 'stable',
  ai_summary: 'Fleet operating at moderate risk levels. Driver fatigue elevated for 4 vehicles - recommend scheduled breaks. One vehicle requires immediate inspection due to engine temperature alerts.',
  predictions: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    predicted_risk: 0.35 + Math.sin(i / 4) * 0.15,
    risk_level: i >= 8 && i <= 18 ? 'medium' : 'low'
  }))
};

// Initial alerts data - defined outside component
// Uses same truck names as Overview page (Truck A through F)
const INITIAL_ALERTS: Alert[] = [
  // LOW RISK ALERTS - Normal operations
  {
    id: 'alert-routine-1',
    vehicle_id: 'VH-1001',
    vehicle_name: 'Truck A',
    driver_name: 'Ahmed Hassan',
    risk_level: 'low',
    overall_score: 0.22,
    location: { lat: 25.0185, lng: 55.0272 },
    top_factors: [
      { name: '✅ All Systems Normal', value: 0.18, color: '#10b981' },
      { name: '📍 On Schedule', value: 0.15, color: '#10b981' }
    ],
    recommended_actions: ['Continue current route', 'Maintain safe speed', 'Check in at next stop'],
    anomaly_detected: false,
    anomaly_description: 'Operating normally | 3 deliveries completed | ETA on track',
    timestamp: new Date(Date.now() - 600000).toISOString()
  },
  {
    id: 'alert-routine-2',
    vehicle_id: 'VH-1004',
    vehicle_name: 'Truck D',
    driver_name: 'Carlos Silva',
    risk_level: 'low',
    overall_score: 0.28,
    location: { lat: 25.2697, lng: 55.3095 },
    top_factors: [
      { name: '🚗 Speed: 65 km/h', value: 0.22, color: '#10b981' },
      { name: '😊 Driver Alert', value: 0.18, color: '#10b981' }
    ],
    recommended_actions: ['Maintain current pace', 'Good progress - continue', 'Scheduled break in 1 hour'],
    anomaly_detected: false,
    anomaly_description: 'Smooth driving | All metrics within normal range | Good fuel efficiency',
    timestamp: new Date(Date.now() - 480000).toISOString()
  },
  // MEDIUM RISK ALERTS
  {
    id: 'alert-speed-1',
    vehicle_id: 'VH-1002',
    vehicle_name: 'Truck B',
    driver_name: 'Raj Patel',
    risk_level: 'medium',
    overall_score: 0.52,
    location: { lat: 25.0805, lng: 55.1403 },
    top_factors: [
      { name: '🚗 Speed: 88 km/h', value: 0.55, color: '#f59e0b' },
      { name: '⚡ Hard Braking: 2x', value: 0.42, color: '#eab308' }
    ],
    recommended_actions: ['Send speed advisory to driver', 'Review driving pattern', 'Monitor for next 15 min'],
    anomaly_detected: false,
    anomaly_description: 'Slightly above speed limit | 2 hard brakes detected | Otherwise normal',
    timestamp: new Date(Date.now() - 180000).toISOString()
  },
  {
    id: 'alert-delay-1',
    vehicle_id: 'VH-1005',
    vehicle_name: 'Truck E',
    driver_name: 'Wei Chen',
    risk_level: 'medium',
    overall_score: 0.48,
    location: { lat: 25.1860, lng: 55.2674 },
    top_factors: [
      { name: '🕐 ETA Delay: +25min', value: 0.52, color: '#f59e0b' },
      { name: '🚧 Moderate Traffic', value: 0.58, color: '#f59e0b' }
    ],
    recommended_actions: ['Notify customer of delay', 'Consider alternate route via E44', 'Update delivery window'],
    anomaly_detected: false,
    anomaly_description: 'Traffic congestion on Al Khail Rd | 1 delivery may be delayed',
    timestamp: new Date(Date.now() - 420000).toISOString()
  },
  {
    id: 'alert-stress-1',
    vehicle_id: 'VH-1004',
    vehicle_name: 'Truck D',
    driver_name: 'Carlos Silva',
    risk_level: 'medium',
    overall_score: 0.45,
    location: { lat: 25.1212, lng: 55.3811 },
    top_factors: [
      { name: '😐 Stress Level: 55%', value: 0.55, color: '#f59e0b' },
      { name: '💓 HRV: 42ms', value: 0.48, color: '#eab308' }
    ],
    recommended_actions: ['Check in with driver', 'Offer break if needed', 'Monitor for next 30 min'],
    anomaly_detected: false,
    anomaly_description: 'Moderate stress indicators | HRV slightly low | Continue monitoring',
    timestamp: new Date(Date.now() - 540000).toISOString()
  },
  // HIGH RISK ALERTS
  {
    id: 'alert-fatigue-1',
    vehicle_id: 'VH-1003',
    vehicle_name: 'Truck C',
    driver_name: 'Mohammad Ali',
    risk_level: 'high',
    overall_score: 0.72,
    location: { lat: 25.2048, lng: 55.2708 },
    top_factors: [
      { name: '😴 Driver Fatigue: 68%', value: 0.68, color: '#ef4444' },
      { name: '❤️ Heart Rate: 88 BPM', value: 0.58, color: '#f59e0b' }
    ],
    recommended_actions: ['Mandatory 15-min break required', 'Alert nearby rest stop', 'Notify fleet manager'],
    anomaly_detected: true,
    anomaly_description: 'Fatigue score elevated | Blink rate increasing | Break recommended soon',
    timestamp: new Date().toISOString()
  },
  {
    id: 'alert-tire-1',
    vehicle_id: 'VH-1006',
    vehicle_name: 'Truck F',
    driver_name: 'Yusuf Ibrahim',
    risk_level: 'high',
    overall_score: 0.65,
    location: { lat: 25.0441, lng: 55.1174 },
    top_factors: [
      { name: '🛞 Tire Pressure: 28 PSI', value: 0.62, color: '#ef4444' },
      { name: '⚠️ Service Due', value: 0.55, color: '#f59e0b' }
    ],
    recommended_actions: ['Check tire pressure at next stop', 'Schedule maintenance', 'Monitor tire temp'],
    anomaly_detected: false,
    anomaly_description: 'Front-right tire pressure low (28 PSI vs 35 PSI normal) | Service overdue',
    timestamp: new Date(Date.now() - 90000).toISOString()
  },
  // LOW RISK - More normal operations
  {
    id: 'alert-routine-3',
    vehicle_id: 'VH-1002',
    vehicle_name: 'Truck B',
    driver_name: 'Raj Patel',
    risk_level: 'low',
    overall_score: 0.25,
    location: { lat: 25.1336, lng: 55.2272 },
    top_factors: [
      { name: '📦 Cargo Secure', value: 0.15, color: '#10b981' },
      { name: '🌡️ Temp Normal: 4°C', value: 0.12, color: '#10b981' }
    ],
    recommended_actions: ['Continue refrigeration monitoring', 'All cargo conditions optimal', 'Next delivery in 20 min'],
    anomaly_detected: false,
    anomaly_description: 'Cold chain intact | Cargo temperature stable at 4°C | All sensors normal',
    timestamp: new Date(Date.now() - 720000).toISOString()
  }
];

// Dynamic vehicle risk data - matches Overview truck data
const MOCK_VEHICLES: VehicleRisk[] = [
  {
    vehicle_id: 'VH-1001',
    vehicle_name: 'Truck A',
    driver_name: 'Ahmed Hassan',
    overall_score: 0.22,
    risk_level: 'low',
    factors: [
      { name: 'Weather', current_value: 0.15, previous_value: 0.18, weight: 0.2, trend: 'decreasing', prediction_1h: 0.14, prediction_6h: 0.12, description: 'Clear conditions, optimal visibility', mitigation: 'Continue monitoring', icon: '☀️', color: '#10b981' },
      { name: 'Traffic', current_value: 0.25, previous_value: 0.30, weight: 0.2, trend: 'decreasing', prediction_1h: 0.22, prediction_6h: 0.20, description: 'Light traffic on current route', mitigation: 'Maintain current route', icon: '🚗', color: '#10b981' },
      { name: 'Driver Fatigue', current_value: 0.18, previous_value: 0.15, weight: 0.3, trend: 'stable', prediction_1h: 0.20, prediction_6h: 0.25, description: 'Driver well-rested, 3 hours into shift', mitigation: 'Schedule break in 2 hours', icon: '😊', color: '#10b981' },
      { name: 'Vehicle Health', current_value: 0.12, previous_value: 0.12, weight: 0.3, trend: 'stable', prediction_1h: 0.12, prediction_6h: 0.13, description: 'All systems nominal, recent maintenance', mitigation: 'No action needed', icon: '✅', color: '#10b981' }
    ],
    location: { lat: 25.0185, lng: 55.0272 },
    predictions: Array.from({ length: 12 }, (_, i) => ({ hour: i, time: `${8 + i}:00`, predicted_risk: 0.20 + Math.sin(i / 3) * 0.08, risk_level: 'low' })),
    anomaly_detected: false,
    anomaly_description: null,
    recommended_actions: ['Continue current route', 'Maintain safe driving practices', 'Check in at next stop'],
    timestamp: new Date().toISOString()
  },
  {
    vehicle_id: 'VH-1002',
    vehicle_name: 'Truck B',
    driver_name: 'Raj Patel',
    overall_score: 0.58,
    risk_level: 'medium',
    factors: [
      { name: 'Weather', current_value: 0.35, previous_value: 0.25, weight: 0.2, trend: 'increasing', prediction_1h: 0.42, prediction_6h: 0.50, description: 'Heat advisory - 45°C expected', mitigation: 'Monitor cargo temperature', icon: '🌡️', color: '#f59e0b' },
      { name: 'Traffic', current_value: 0.68, previous_value: 0.55, weight: 0.2, trend: 'increasing', prediction_1h: 0.72, prediction_6h: 0.45, description: 'Heavy traffic on Sheikh Zayed Rd', mitigation: 'Consider alternate route via E44', icon: '🚧', color: '#ef4444' },
      { name: 'Driver Fatigue', current_value: 0.48, previous_value: 0.42, weight: 0.3, trend: 'increasing', prediction_1h: 0.55, prediction_6h: 0.62, description: 'Driver on shift for 5 hours', mitigation: 'Schedule 15-min break soon', icon: '😐', color: '#f59e0b' },
      { name: 'Vehicle Health', current_value: 0.32, previous_value: 0.30, weight: 0.3, trend: 'stable', prediction_1h: 0.33, prediction_6h: 0.35, description: 'Tire pressure slightly low', mitigation: 'Check tires at next stop', icon: '⚠️', color: '#f59e0b' }
    ],
    location: { lat: 25.1972, lng: 55.2744 },
    predictions: Array.from({ length: 12 }, (_, i) => ({ hour: i, time: `${8 + i}:00`, predicted_risk: 0.55 + Math.sin(i / 3) * 0.12, risk_level: i > 4 && i < 8 ? 'high' : 'medium' })),
    anomaly_detected: false,
    anomaly_description: null,
    recommended_actions: ['Schedule driver break in next 30 min', 'Check tire pressure at next stop', 'Monitor traffic and reroute if needed', 'Keep cargo AC running'],
    timestamp: new Date().toISOString()
  },
  {
    vehicle_id: 'VH-1003',
    vehicle_name: 'Truck C',
    driver_name: 'Mohammad Ali',
    overall_score: 0.82,
    risk_level: 'critical',
    factors: [
      { name: 'Weather', current_value: 0.28, previous_value: 0.25, weight: 0.2, trend: 'stable', prediction_1h: 0.28, prediction_6h: 0.30, description: 'Normal conditions', mitigation: 'No action needed', icon: '☀️', color: '#10b981' },
      { name: 'Traffic', current_value: 0.45, previous_value: 0.50, weight: 0.2, trend: 'decreasing', prediction_1h: 0.40, prediction_6h: 0.35, description: 'Moderate traffic', mitigation: 'Continue current route', icon: '🚗', color: '#f59e0b' },
      { name: 'Driver Fatigue', current_value: 0.78, previous_value: 0.72, weight: 0.3, trend: 'increasing', prediction_1h: 0.85, prediction_6h: 0.92, description: 'CRITICAL: Driver showing fatigue signs', mitigation: 'MANDATORY REST NOW', icon: '😴', color: '#dc2626' },
      { name: 'Vehicle Health', current_value: 0.88, previous_value: 0.75, weight: 0.3, trend: 'increasing', prediction_1h: 0.92, prediction_6h: 0.95, description: 'CRITICAL: Engine temp 108°C', mitigation: 'STOP VEHICLE IMMEDIATELY', icon: '🔧', color: '#dc2626' }
    ],
    location: { lat: 25.0805, lng: 55.1403 },
    predictions: Array.from({ length: 12 }, (_, i) => ({ hour: i, time: `${8 + i}:00`, predicted_risk: 0.80 + Math.sin(i / 2) * 0.10, risk_level: 'critical' })),
    anomaly_detected: true,
    anomaly_description: 'CRITICAL: Engine overheating (108°C) and driver fatigue (78%) detected simultaneously. Immediate action required.',
    recommended_actions: ['🚨 STOP VEHICLE IMMEDIATELY', 'Call roadside assistance: 800-HELP', 'Do NOT restart engine', 'Driver must take mandatory rest', 'Dispatch backup vehicle'],
    timestamp: new Date().toISOString()
  },
  {
    vehicle_id: 'VH-1004',
    vehicle_name: 'Truck D',
    driver_name: 'Carlos Silva',
    overall_score: 0.35,
    risk_level: 'low',
    factors: [
      { name: 'Weather', current_value: 0.20, previous_value: 0.22, weight: 0.2, trend: 'decreasing', prediction_1h: 0.18, prediction_6h: 0.15, description: 'Good visibility, mild temperature', mitigation: 'Continue normal operations', icon: '☀️', color: '#10b981' },
      { name: 'Traffic', current_value: 0.38, previous_value: 0.45, weight: 0.2, trend: 'decreasing', prediction_1h: 0.32, prediction_6h: 0.28, description: 'Traffic clearing on E311', mitigation: 'Good progress expected', icon: '🚗', color: '#10b981' },
      { name: 'Driver Fatigue', current_value: 0.28, previous_value: 0.25, weight: 0.3, trend: 'stable', prediction_1h: 0.30, prediction_6h: 0.35, description: 'Driver alert, 4 hours into shift', mitigation: 'Plan break at midpoint', icon: '😊', color: '#10b981' },
      { name: 'Vehicle Health', current_value: 0.22, previous_value: 0.22, weight: 0.3, trend: 'stable', prediction_1h: 0.22, prediction_6h: 0.23, description: 'Vehicle in excellent condition', mitigation: 'No issues detected', icon: '✅', color: '#10b981' }
    ],
    location: { lat: 25.2697, lng: 55.3095 },
    predictions: Array.from({ length: 12 }, (_, i) => ({ hour: i, time: `${8 + i}:00`, predicted_risk: 0.32 + Math.sin(i / 4) * 0.08, risk_level: 'low' })),
    anomaly_detected: false,
    anomaly_description: null,
    recommended_actions: ['Maintain current pace', 'Schedule routine check at next depot', 'Continue safe driving'],
    timestamp: new Date().toISOString()
  },
  {
    vehicle_id: 'VH-1005',
    vehicle_name: 'Truck E',
    driver_name: 'Wei Chen',
    overall_score: 0.68,
    risk_level: 'high',
    factors: [
      { name: 'Weather', current_value: 0.55, previous_value: 0.45, weight: 0.2, trend: 'increasing', prediction_1h: 0.65, prediction_6h: 0.72, description: 'Sandstorm warning in effect', mitigation: 'Reduce speed, use fog lights', icon: '🌪️', color: '#ef4444' },
      { name: 'Traffic', current_value: 0.72, previous_value: 0.65, weight: 0.2, trend: 'increasing', prediction_1h: 0.78, prediction_6h: 0.60, description: 'Accident ahead causing delays', mitigation: 'Reroute via Al Khail Road', icon: '🚧', color: '#ef4444' },
      { name: 'Driver Fatigue', current_value: 0.45, previous_value: 0.40, weight: 0.3, trend: 'increasing', prediction_1h: 0.52, prediction_6h: 0.65, description: 'Driver needs break soon', mitigation: 'Stop at next rest area', icon: '😐', color: '#f59e0b' },
      { name: 'Vehicle Health', current_value: 0.58, previous_value: 0.52, weight: 0.3, trend: 'increasing', prediction_1h: 0.62, prediction_6h: 0.68, description: 'Brake pads worn - service due', mitigation: 'Service brakes after this route', icon: '⚠️', color: '#f59e0b' }
    ],
    location: { lat: 25.2048, lng: 55.2538 },
    predictions: Array.from({ length: 12 }, (_, i) => ({ hour: i, time: `${8 + i}:00`, predicted_risk: 0.65 + Math.sin(i / 2) * 0.15, risk_level: i > 2 && i < 6 ? 'critical' : 'high' })),
    anomaly_detected: true,
    anomaly_description: 'Multiple risk factors elevated: Sandstorm conditions, traffic delays, and brake maintenance overdue.',
    recommended_actions: ['Reduce speed to 60 km/h due to sandstorm', 'Reroute to avoid accident zone', 'Schedule brake service after delivery', 'Driver break at next safe location'],
    timestamp: new Date().toISOString()
  },
  {
    vehicle_id: 'VH-1006',
    vehicle_name: 'Truck F',
    driver_name: 'Yusuf Ibrahim',
    overall_score: 0.42,
    risk_level: 'medium',
    factors: [
      { name: 'Weather', current_value: 0.30, previous_value: 0.28, weight: 0.2, trend: 'stable', prediction_1h: 0.32, prediction_6h: 0.35, description: 'Warm but manageable', mitigation: 'Monitor cargo temperature', icon: '☀️', color: '#f59e0b' },
      { name: 'Traffic', current_value: 0.52, previous_value: 0.48, weight: 0.2, trend: 'increasing', prediction_1h: 0.58, prediction_6h: 0.45, description: 'Rush hour approaching', mitigation: 'Plan for delays', icon: '🚗', color: '#f59e0b' },
      { name: 'Driver Fatigue', current_value: 0.38, previous_value: 0.35, weight: 0.3, trend: 'increasing', prediction_1h: 0.42, prediction_6h: 0.50, description: 'Driver approaching fatigue threshold', mitigation: 'Break recommended in 1 hour', icon: '😐', color: '#f59e0b' },
      { name: 'Vehicle Health', current_value: 0.25, previous_value: 0.25, weight: 0.3, trend: 'stable', prediction_1h: 0.25, prediction_6h: 0.26, description: 'All systems normal', mitigation: 'Continue monitoring', icon: '✅', color: '#10b981' }
    ],
    location: { lat: 25.1860, lng: 55.2674 },
    predictions: Array.from({ length: 12 }, (_, i) => ({ hour: i, time: `${8 + i}:00`, predicted_risk: 0.40 + Math.sin(i / 3) * 0.12, risk_level: i > 5 ? 'medium' : 'low' })),
    anomaly_detected: false,
    anomaly_description: null,
    recommended_actions: ['Plan for rush hour traffic delays', 'Schedule driver break within 1 hour', 'Keep cargo compartment cool'],
    timestamp: new Date().toISOString()
  }
];

export default function RiskCenterPage() {
  // State
  const [fleetSummary, setFleetSummary] = useState<FleetSummary | null>(null);
  const [vehicles, setVehicles] = useState<VehicleRisk[]>(MOCK_VEHICLES);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [resolvedAlerts, setResolvedAlerts] = useState(0);
  const [incidentsToday, setIncidentsToday] = useState(0);

  // Fetch fleet risk data
  const fetchFleetRisk = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/risk/fleet');
      if (response.ok) {
        const data = await response.json();
        setFleetSummary(data.summary);
        if (data.vehicles && data.vehicles.length > 0) {
          setVehicles(data.vehicles);
        }
        setLastUpdate(new Date());
      } else {
        setFleetSummary(MOCK_FLEET_SUMMARY);
        // Keep MOCK_VEHICLES already set in state
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching fleet risk:', error);
      setFleetSummary(MOCK_FLEET_SUMMARY);
      // Keep MOCK_VEHICLES already set in state
      setLastUpdate(new Date());
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/risk/alerts');
      if (response.ok) {
        const data = await response.json();
        if (data.alerts?.length > 0) {
          setAlerts(data.alerts);
        }
        // Keep existing alerts if API returns empty
      }
      // Keep existing alerts if API fails
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Keep existing alerts on error
    }
  }, []);

  // Generate dynamic AI insights based on alerts
  const generateDynamicInsights = (alertsList: Alert[]) => {
    const criticalCount = alertsList.filter(a => a.risk_level === 'critical').length;
    const highCount = alertsList.filter(a => a.risk_level === 'high').length;
    const mediumCount = alertsList.filter(a => a.risk_level === 'medium').length;

    const fatigueAlerts = alertsList.filter(a => a.top_factors.some(f => f.name.toLowerCase().includes('fatigue') || f.name.toLowerCase().includes('stress')));
    const vehicleAlerts = alertsList.filter(a => a.top_factors.some(f => f.name.toLowerCase().includes('engine') || f.name.toLowerCase().includes('brake') || f.name.toLowerCase().includes('tire')));
    const packageAlerts = alertsList.filter(a => a.top_factors.some(f => f.name.toLowerCase().includes('cargo') || f.name.toLowerCase().includes('cold')));

    let insights = `🔍 Real-Time Fleet Analysis\n\n`;
    const overallRisk = criticalCount > 0 ? 'HIGH' : highCount > 2 ? 'ELEVATED' : 'MODERATE';
    insights += `📊 Status: Fleet risk is ${overallRisk} with ${alertsList.length} active alerts\n`;
    insights += `   • ${criticalCount} Critical | ${highCount} High | ${mediumCount} Medium\n\n`;

    if (fatigueAlerts.length > 0) {
      insights += `😴 Driver Wellness (${fatigueAlerts.length} alerts)\n`;
      fatigueAlerts.slice(0, 2).forEach(a => {
        insights += `   • ${a.vehicle_name}: ${a.anomaly_description?.split('|')[0] || 'Fatigue detected'}\n`;
      });
      insights += `   ➡️ Action: Schedule mandatory breaks\n\n`;
    }

    if (vehicleAlerts.length > 0) {
      insights += `🔧 Vehicle Health (${vehicleAlerts.length} alerts)\n`;
      vehicleAlerts.slice(0, 2).forEach(a => {
        insights += `   • ${a.vehicle_name}: ${a.anomaly_description?.split('|')[0] || 'Maintenance required'}\n`;
      });
      insights += `   ➡️ Action: Dispatch maintenance team\n\n`;
    }

    if (packageAlerts.length > 0) {
      insights += `📦 Cargo Status (${packageAlerts.length} alerts)\n`;
      packageAlerts.slice(0, 2).forEach(a => {
        insights += `   • ${a.vehicle_name}: ${a.anomaly_description?.split('|')[0] || 'Cargo issue detected'}\n`;
      });
      insights += `   ➡️ Action: Contact customer, document condition\n\n`;
    }

    insights += `💡 AI Recommendations\n`;
    if (criticalCount > 0) insights += `   🚨 PRIORITY: Address ${criticalCount} critical alert(s) immediately\n`;
    if (fatigueAlerts.length > 0) insights += `   • Route drivers to nearest rest stops\n`;
    if (vehicleAlerts.length > 0) insights += `   • Consider vehicle swap for maintenance-flagged units\n`;
    insights += `   • Continue monitoring all active situations\n`;

    return insights;
  };

  // Fetch AI insights
  const fetchAiInsights = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/risk/ai-insights');
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.detailed_insights || data.summary || generateDynamicInsights(INITIAL_ALERTS));
      } else {
        setAiInsights(generateDynamicInsights(INITIAL_ALERTS));
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
      setAiInsights(generateDynamicInsights(INITIAL_ALERTS));
    }
  }, []);

  // Update AI insights when alerts change
  useEffect(() => {
    if (alerts.length > 0) {
      setAiInsights(generateDynamicInsights(alerts));
    }
  }, [alerts]);

  // Alert templates for real-time generation - matching MOCK_VEHICLES data
  // Includes LOW risk templates to maintain balance
  const alertTemplates = [
    // LOW RISK TEMPLATES - Normal operations (40% chance)
    {
      type: 'routine',
      vehicles: ['Truck A', 'Truck B', 'Truck C', 'Truck D', 'Truck E', 'Truck F'],
      drivers: ['Ahmed Hassan', 'Raj Patel', 'Mohammad Ali', 'Carlos Silva', 'Wei Chen', 'Yusuf Ibrahim'],
      risk: 'low' as const,
      factors: ['✅ All Normal', '📍 On Schedule', '😊 Driver OK'],
      descs: ['Operating normally | All systems green', 'On schedule | Next delivery in 15 min', 'Smooth driving | Good fuel efficiency'],
      actions: ['Continue current route', 'Maintain safe speed', 'Good progress - keep it up', 'Check in at next stop']
    },
    {
      type: 'cargo_ok',
      vehicles: ['Truck A', 'Truck B', 'Truck C', 'Truck D', 'Truck E', 'Truck F'],
      drivers: ['Ahmed Hassan', 'Raj Patel', 'Mohammad Ali', 'Carlos Silva', 'Wei Chen', 'Yusuf Ibrahim'],
      risk: 'low' as const,
      factors: ['📦 Cargo Secure', '🌡️ Temp OK', '✅ Sealed'],
      descs: ['Cargo temperature stable at 4°C', 'All packages secure | No shifts detected', 'Cold chain intact | Sensors normal'],
      actions: ['Continue monitoring', 'Cargo conditions optimal', 'Next checkpoint in 30 min', 'All good - proceed']
    },
    {
      type: 'driver_ok',
      vehicles: ['Truck A', 'Truck B', 'Truck C', 'Truck D', 'Truck E', 'Truck F'],
      drivers: ['Ahmed Hassan', 'Raj Patel', 'Mohammad Ali', 'Carlos Silva', 'Wei Chen', 'Yusuf Ibrahim'],
      risk: 'low' as const,
      factors: ['😊 Alert', '💚 HR Normal', '👁️ Focused'],
      descs: ['Driver well-rested | 3 hours into shift', 'Biometrics normal | HRV healthy', 'Focus level high | Safe driving'],
      actions: ['Schedule break in 2 hours', 'Maintain good habits', 'Continue safe driving', 'Next rest stop in 45 min']
    },
    // MEDIUM RISK TEMPLATES
    {
      type: 'speed',
      vehicles: ['Truck A', 'Truck B', 'Truck C', 'Truck D', 'Truck E', 'Truck F'],
      drivers: ['Ahmed Hassan', 'Raj Patel', 'Mohammad Ali', 'Carlos Silva', 'Wei Chen', 'Yusuf Ibrahim'],
      risk: 'medium' as const,
      factors: ['🚗 Speed', '⚡ Hard Brake', '🛣️ Lane'],
      descs: ['Exceeding limit by 10 km/h | Advisory', '2 hard brakes detected | Monitor', 'Minor lane drift | Check focus'],
      actions: ['Send speed advisory to driver', 'Review driving pattern', 'Schedule coaching session', 'Enable speed limiter']
    },
    {
      type: 'delay',
      vehicles: ['Truck A', 'Truck B', 'Truck C', 'Truck D', 'Truck E', 'Truck F'],
      drivers: ['Ahmed Hassan', 'Raj Patel', 'Mohammad Ali', 'Carlos Silva', 'Wei Chen', 'Yusuf Ibrahim'],
      risk: 'medium' as const,
      factors: ['🕐 ETA Delay', '🚧 Traffic', '📍 Route'],
      descs: ['Moderate traffic | +20min delay', 'Construction zone ahead | Slow traffic', 'Route congestion | Consider alternate'],
      actions: ['Notify customers of delay', 'Calculate alternate route', 'Update delivery windows', 'Monitor traffic updates']
    },
    {
      type: 'stress',
      vehicles: ['Truck A', 'Truck B', 'Truck C', 'Truck D', 'Truck E', 'Truck F'],
      drivers: ['Ahmed Hassan', 'Raj Patel', 'Mohammad Ali', 'Carlos Silva', 'Wei Chen', 'Yusuf Ibrahim'],
      risk: 'medium' as const,
      factors: ['😐 Stress', '💛 HRV Moderate', '🧠 Load'],
      descs: ['Stress level 55% | Monitor', 'HRV slightly low | Watch closely', 'Moderate cognitive load'],
      actions: ['Check in with driver', 'Offer break if needed', 'Monitor for next 30 min', 'Reduce workload if possible']
    },
    // HIGH RISK TEMPLATES
    {
      type: 'fatigue',
      vehicles: ['Truck A', 'Truck B', 'Truck C', 'Truck D', 'Truck E', 'Truck F'],
      drivers: ['Ahmed Hassan', 'Raj Patel', 'Mohammad Ali', 'Carlos Silva', 'Wei Chen', 'Yusuf Ibrahim'],
      risk: 'high' as const,
      factors: ['😴 Fatigue', '👁️ Blink Rate', '💤 Drowsiness'],
      descs: ['Extended driving hours | Break needed', 'Drowsiness signs detected', 'Driver fatigued | Rest required'],
      actions: ['Schedule mandatory 15-min break', 'Route to nearest rest stop', 'Notify fleet manager', 'Enable alertness monitoring']
    },
    {
      type: 'tire',
      vehicles: ['Truck A', 'Truck B', 'Truck C', 'Truck D', 'Truck E', 'Truck F'],
      drivers: ['Ahmed Hassan', 'Raj Patel', 'Mohammad Ali', 'Carlos Silva', 'Wei Chen', 'Yusuf Ibrahim'],
      risk: 'high' as const,
      factors: ['🛞 Tire Pressure', '⚠️ Service Due', '🔩 Alignment'],
      descs: ['Tire pressure low (28 PSI) | Check soon', 'Service overdue | Schedule maintenance', 'Alignment issue | Service needed'],
      actions: ['Check tires at next stop', 'Schedule maintenance', 'Monitor tire temperature', 'Reduce speed if needed']
    },
    {
      type: 'package',
      vehicles: ['Truck A', 'Truck B', 'Truck C', 'Truck D', 'Truck E', 'Truck F'],
      drivers: ['Ahmed Hassan', 'Raj Patel', 'Mohammad Ali', 'Carlos Silva', 'Wei Chen', 'Yusuf Ibrahim'],
      risk: 'high' as const,
      factors: ['📦 Cargo Temp', '🧊 Cold Chain', '📋 Package'],
      descs: ['Cargo temp rising | Check refrigeration', 'Cold chain warning | Monitor closely', 'Package shift detected | Secure cargo'],
      actions: ['Check refrigeration unit', 'Document temperature readings', 'Contact customer if needed', 'Photograph cargo condition']
    },
    // CRITICAL RISK TEMPLATE (rare)
    {
      type: 'engine',
      vehicles: ['Truck A', 'Truck B', 'Truck C', 'Truck D', 'Truck E', 'Truck F'],
      drivers: ['Ahmed Hassan', 'Raj Patel', 'Mohammad Ali', 'Carlos Silva', 'Wei Chen', 'Yusuf Ibrahim'],
      risk: 'critical' as const,
      factors: ['🔧 Engine Temp', '⚙️ Oil Pressure', '🛢️ Coolant'],
      descs: ['Engine temp critical | STOP NOW', 'Oil pressure critical | Do not restart', 'Coolant low | Overheating risk'],
      actions: ['🚨 STOP vehicle immediately', 'Call roadside assistance: 800-HELP', 'Do NOT restart engine', 'Dispatch backup vehicle']
    }
  ];

  // Generate random alert with dynamic actions
  // Weighted distribution: 40% low, 30% medium, 25% high, 5% critical
  const generateNewAlert = (): Alert => {
    // Weighted template selection for balanced alerts
    const rand = Math.random();
    let template;
    if (rand < 0.40) {
      // 40% chance: Low risk (templates 0, 1, 2)
      template = alertTemplates[Math.floor(Math.random() * 3)];
    } else if (rand < 0.70) {
      // 30% chance: Medium risk (templates 3, 4, 5)
      template = alertTemplates[3 + Math.floor(Math.random() * 3)];
    } else if (rand < 0.95) {
      // 25% chance: High risk (templates 6, 7, 8)
      template = alertTemplates[6 + Math.floor(Math.random() * 3)];
    } else {
      // 5% chance: Critical risk (template 9)
      template = alertTemplates[9];
    }

    const idx = Math.floor(Math.random() * template.vehicles.length);

    // Factor values based on risk level
    let factorValues: [number, number];
    let factorColors: [string, string];
    if (template.risk === 'low') {
      factorValues = [15 + Math.floor(Math.random() * 15), 10 + Math.floor(Math.random() * 15)];
      factorColors = ['#10b981', '#10b981']; // Green
    } else if (template.risk === 'medium') {
      factorValues = [45 + Math.floor(Math.random() * 20), 40 + Math.floor(Math.random() * 20)];
      factorColors = ['#f59e0b', '#eab308']; // Yellow/Orange
    } else if (template.risk === 'high') {
      factorValues = [60 + Math.floor(Math.random() * 20), 55 + Math.floor(Math.random() * 20)];
      factorColors = ['#ef4444', '#f59e0b']; // Red/Orange
    } else {
      factorValues = [85 + Math.floor(Math.random() * 12), 75 + Math.floor(Math.random() * 15)];
      factorColors = ['#dc2626', '#ef4444']; // Dark red/Red
    }

    // Get vehicle ID based on truck name (A=1001, B=1002, etc.)
    const vehicleIdMap: Record<string, string> = {
      'Truck A': 'VH-1001', 'Truck B': 'VH-1002', 'Truck C': 'VH-1003',
      'Truck D': 'VH-1004', 'Truck E': 'VH-1005', 'Truck F': 'VH-1006'
    };

    // Score based on risk level
    let overallScore: number;
    if (template.risk === 'low') {
      overallScore = 0.15 + Math.random() * 0.15; // 15-30%
    } else if (template.risk === 'medium') {
      overallScore = 0.40 + Math.random() * 0.18; // 40-58%
    } else if (template.risk === 'high') {
      overallScore = 0.60 + Math.random() * 0.18; // 60-78%
    } else {
      overallScore = 0.82 + Math.random() * 0.15; // 82-97%
    }

    return {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      vehicle_id: vehicleIdMap[template.vehicles[idx]] || `v-${Math.floor(Math.random() * 100)}`,
      vehicle_name: template.vehicles[idx],
      driver_name: template.drivers[idx],
      risk_level: template.risk,
      overall_score: overallScore,
      location: { lat: 25.0 + Math.random() * 0.3, lng: 55.1 + Math.random() * 0.3 },
      top_factors: [
        { name: `${template.factors[0]}: ${factorValues[0]}%`, value: factorValues[0] / 100, color: factorColors[0] },
        { name: `${template.factors[1]}: ${factorValues[1]}%`, value: factorValues[1] / 100, color: factorColors[1] }
      ],
      recommended_actions: template.actions,
      anomaly_detected: template.risk === 'critical' || template.risk === 'high' ? Math.random() > 0.3 : false,
      anomaly_description: template.descs[Math.floor(Math.random() * template.descs.length)],
      timestamp: new Date().toISOString()
    };
  };

  // Real-time alert generation every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert = generateNewAlert();
      setAlerts(prev => {
        const updated = [newAlert, ...prev];
        return updated.slice(0, 12); // Keep max 12 alerts
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Note: Vehicles maintain their original MOCK_VEHICLES data
  // Alerts are shown separately in the Active Alerts panel
  // This preserves diverse risk levels across the fleet

  // Computed metrics from alerts
  const alertMetrics = {
    criticalCount: alerts.filter(a => a.risk_level === 'critical').length,
    highCount: alerts.filter(a => a.risk_level === 'high').length,
    mediumCount: alerts.filter(a => a.risk_level === 'medium').length,
    lowCount: alerts.filter(a => a.risk_level === 'low').length,
    totalAlerts: alerts.length,
    avgRisk: alerts.length > 0 ? alerts.reduce((sum, a) => sum + a.overall_score, 0) / alerts.length : 0.44,
    fatigueAlerts: alerts.filter(a => a.top_factors.some(f => f.name.toLowerCase().includes('fatigue') || f.name.toLowerCase().includes('stress') || f.name.toLowerCase().includes('hrv') || f.name.toLowerCase().includes('drowsiness') || f.name.toLowerCase().includes('blink'))).length,
    vehicleAlerts: alerts.filter(a => a.top_factors.some(f => f.name.toLowerCase().includes('engine') || f.name.toLowerCase().includes('tire') || f.name.toLowerCase().includes('brake') || f.name.toLowerCase().includes('oil') || f.name.toLowerCase().includes('coolant'))).length,
    cargoAlerts: alerts.filter(a => a.top_factors.some(f => f.name.toLowerCase().includes('cargo') || f.name.toLowerCase().includes('cold') || f.name.toLowerCase().includes('package') || f.name.toLowerCase().includes('temp'))).length,
    trafficAlerts: alerts.filter(a => a.top_factors.some(f => f.name.toLowerCase().includes('traffic') || f.name.toLowerCase().includes('delay') || f.name.toLowerCase().includes('eta') || f.name.toLowerCase().includes('route'))).length,
    speedAlerts: alerts.filter(a => a.top_factors.some(f => f.name.toLowerCase().includes('speed') || f.name.toLowerCase().includes('brake') || f.name.toLowerCase().includes('lane'))).length,
  };

  // Top risk factors derived from alerts
  const topRiskFactors = [
    {
      name: 'Driver Fatigue',
      average: alertMetrics.fatigueAlerts > 0 ? Math.min(0.35 + (alertMetrics.fatigueAlerts * 0.12), 0.92) : 0.25,
      max: alertMetrics.fatigueAlerts > 0 ? Math.min(0.55 + (alertMetrics.fatigueAlerts * 0.1), 0.95) : 0.45,
      vehicles_affected: alertMetrics.fatigueAlerts
    },
    {
      name: 'Vehicle Health',
      average: alertMetrics.vehicleAlerts > 0 ? Math.min(0.28 + (alertMetrics.vehicleAlerts * 0.15), 0.90) : 0.22,
      max: alertMetrics.vehicleAlerts > 0 ? Math.min(0.50 + (alertMetrics.vehicleAlerts * 0.12), 0.98) : 0.40,
      vehicles_affected: alertMetrics.vehicleAlerts
    },
    {
      name: 'Route Risk',
      average: alertMetrics.trafficAlerts > 0 ? Math.min(0.32 + (alertMetrics.trafficAlerts * 0.1), 0.85) : 0.28,
      max: alertMetrics.trafficAlerts > 0 ? Math.min(0.48 + (alertMetrics.trafficAlerts * 0.08), 0.88) : 0.42,
      vehicles_affected: alertMetrics.trafficAlerts
    },
    {
      name: 'Cargo Status',
      average: alertMetrics.cargoAlerts > 0 ? Math.min(0.25 + (alertMetrics.cargoAlerts * 0.18), 0.88) : 0.18,
      max: alertMetrics.cargoAlerts > 0 ? Math.min(0.45 + (alertMetrics.cargoAlerts * 0.15), 0.95) : 0.35,
      vehicles_affected: alertMetrics.cargoAlerts
    },
    {
      name: 'Driving Behavior',
      average: alertMetrics.speedAlerts > 0 ? Math.min(0.30 + (alertMetrics.speedAlerts * 0.11), 0.82) : 0.24,
      max: alertMetrics.speedAlerts > 0 ? Math.min(0.52 + (alertMetrics.speedAlerts * 0.09), 0.86) : 0.44,
      vehicles_affected: alertMetrics.speedAlerts
    }
  ].sort((a, b) => b.average - a.average);

  // Dynamic 24-hour forecast based on current alert levels
  const forecastPredictions = Array.from({ length: 24 }, (_, i) => {
    const baseRisk = alertMetrics.avgRisk;
    const criticalFactor = alertMetrics.criticalCount * 0.08;
    const highFactor = alertMetrics.highCount * 0.04;
    // Simulate risk variations through the day
    const timeVariation = Math.sin((i - 6) / 4) * 0.12; // Higher risk during peak hours
    const randomVariation = (Math.sin(i * 1.5) * 0.05);
    const predictedRisk = Math.min(Math.max(baseRisk + criticalFactor + highFactor + timeVariation + randomVariation, 0.15), 0.95);

    return {
      hour: i,
      predicted_risk: predictedRisk,
      risk_level: predictedRisk > 0.7 ? 'critical' : predictedRisk > 0.55 ? 'high' : predictedRisk > 0.35 ? 'medium' : 'low'
    };
  });

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchFleetRisk(), fetchAlerts(), fetchAiInsights()]);
      setLoading(false);
    };
    loadData();

    // Refresh every 15 seconds
    const interval = setInterval(() => {
      fetchFleetRisk();
      fetchAlerts();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchFleetRisk, fetchAlerts, fetchAiInsights]);

  // Handle mitigation action
  const handleMitigation = async (vehicleId: string, action: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/risk/mitigate/${vehicleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      fetchFleetRisk();
      fetchAlerts();
    } catch (error) {
      console.error('Error applying mitigation:', error);
    }
  };

  // Handle broadcast
  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    
    try {
      await fetch('http://localhost:8000/api/v1/risk/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: broadcastMessage, severity: 'warning' })
      });
      setBroadcastMessage('');
      setShowBroadcast(false);
    } catch (error) {
      console.error('Error broadcasting:', error);
    }
  };

  // Dismiss alert
  const dismissAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    setResolvedAlerts(prev => prev + 1);
  };

  // Distribution chart data - from alerts
  const distributionData = [
    { name: 'Low', value: alertMetrics.lowCount || 1, color: '#10b981' },
    { name: 'Medium', value: alertMetrics.mediumCount || 1, color: '#f59e0b' },
    { name: 'High', value: alertMetrics.highCount || 1, color: '#ef4444' },
    { name: 'Critical', value: alertMetrics.criticalCount || 1, color: '#dc2626' }
  ];

  // Trend icon
  const TrendIcon = ({ trend }: { trend: string }) => {
    if (trend === 'increasing') return <TrendingUp className="w-4 h-4 text-red-400" />;
    if (trend === 'decreasing') return <TrendingDown className="w-4 h-4 text-green-400" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-screen bg-dark-900">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-accent-cyan animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading Risk Command Center...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-dark-900 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-8 h-8 text-accent-cyan" />
              Risk <span className="text-red-400">Command Center</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Real-time fleet risk monitoring • Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBroadcast(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
            >
              <Radio className="w-4 h-4" />
              Broadcast Alert
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { fetchFleetRisk(); fetchAlerts(); fetchAiInsights(); }}
              className="flex items-center gap-2 px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded-lg hover:bg-accent-cyan/30 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
          </div>
        </div>

        {/* KPI Dashboard - All metrics from alerts */}
        <div className="mb-4">
          <RiskKPIDashboard
            fleetRiskScore={alertMetrics.avgRisk}
            incidentsToday={alertMetrics.totalAlerts}
            alertsResolved={resolvedAlerts}
            avgResponseTime={2.0 + (alertMetrics.criticalCount * 0.3)}
            vehiclesAtRisk={alertMetrics.criticalCount + alertMetrics.highCount}
            totalVehicles={12}
          />
        </div>

        {/* Risk Alert Toasts */}
        <RiskAlertToasts />

        {/* Top Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Fleet Risk Score - From Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Fleet Risk Score
              </h3>
              <div className="flex items-center gap-1">
                <TrendIcon trend={alertMetrics.criticalCount > 0 ? 'increasing' : alertMetrics.highCount > 2 ? 'stable' : 'decreasing'} />
                <span className="text-xs text-gray-400">{alertMetrics.criticalCount > 0 ? 'High' : 'Stable'}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#1f2937" strokeWidth="8" />
                  <motion.circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke={getRiskColor(alertMetrics.avgRisk)}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${alertMetrics.avgRisk * 214} 214`}
                    initial={{ strokeDasharray: '0 214' }}
                    animate={{ strokeDasharray: `${alertMetrics.avgRisk * 214} 214` }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.span
                    key={Math.round(alertMetrics.avgRisk * 100)}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-2xl font-bold text-white"
                  >
                    {Math.round(alertMetrics.avgRisk * 100)}%
                  </motion.span>
                </div>
              </div>
              <div>
                <motion.p
                  key={alertMetrics.totalAlerts}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-3xl font-bold text-white"
                >
                  {alertMetrics.totalAlerts}
                </motion.p>
                <p className="text-sm text-gray-400">Active Alerts</p>
              </div>
            </div>
          </motion.div>

          {/* Risk Alerts - From alertMetrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-dark rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Alert Breakdown
              <motion.span
                key={alertMetrics.totalAlerts}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 ml-auto"
              >
                {alertMetrics.totalAlerts} total
              </motion.span>
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20 text-center">
                <motion.p
                  key={`critical-${alertMetrics.criticalCount}`}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-red-400"
                >
                  {alertMetrics.criticalCount}
                </motion.p>
                <p className="text-[10px] text-red-300">Critical</p>
              </div>
              <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20 text-center">
                <motion.p
                  key={`high-${alertMetrics.highCount}`}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-orange-400"
                >
                  {alertMetrics.highCount}
                </motion.p>
                <p className="text-[10px] text-orange-300">High</p>
              </div>
              <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-center">
                <motion.p
                  key={`medium-${alertMetrics.mediumCount}`}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-bold text-yellow-400"
                >
                  {alertMetrics.mediumCount}
                </motion.p>
                <p className="text-[10px] text-yellow-300">Medium</p>
              </div>
            </div>
          </motion.div>

          {/* Distribution */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-dark rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Distribution</h3>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distributionData} cx="50%" cy="50%" innerRadius={22} outerRadius={36} dataKey="value" stroke="none">
                      {distributionData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-1">
                {distributionData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-400">{item.name}</span>
                    </div>
                    <span className="text-xs font-medium text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* AI Summary - Derived from Alerts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-dark rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              AI Analysis
              <motion.span
                key={alertMetrics.criticalCount + alertMetrics.highCount}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded ml-auto",
                  alertMetrics.criticalCount > 0 ? "bg-red-500/20 text-red-400" :
                  alertMetrics.highCount > 2 ? "bg-orange-500/20 text-orange-400" :
                  "bg-green-500/20 text-green-400"
                )}
              >
                {alertMetrics.criticalCount > 0 ? '⚠️ Critical' : alertMetrics.highCount > 2 ? '⚡ Elevated' : '✓ Normal'}
              </motion.span>
            </h3>
            <motion.p
              key={`summary-${alertMetrics.totalAlerts}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-300 leading-relaxed line-clamp-4"
            >
              {alertMetrics.criticalCount > 0
                ? `🚨 ${alertMetrics.criticalCount} critical alert(s) require immediate attention. ${alertMetrics.vehicleAlerts > 0 ? 'Vehicle maintenance issues detected.' : ''} ${alertMetrics.fatigueAlerts > 0 ? 'Driver fatigue risks elevated.' : ''}`
                : alertMetrics.highCount > 2
                ? `⚡ Elevated risk with ${alertMetrics.highCount} high-priority alerts. ${alertMetrics.fatigueAlerts > 0 ? `${alertMetrics.fatigueAlerts} driver wellness concerns.` : ''} Monitor closely.`
                : `✓ Fleet operating within acceptable parameters. ${alertMetrics.totalAlerts} active alerts being monitored. ${alertMetrics.fatigueAlerts > 0 ? 'Watch driver fatigue levels.' : 'All systems nominal.'}`
              }
            </motion.p>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Vehicle List */}
          <div className="col-span-4 space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-dark rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent-cyan" />
                Fleet Vehicles
                <span className="ml-auto text-sm text-gray-400">{vehicles.length} total</span>
              </h3>
              
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {vehicles.slice(0, 15).map((vehicle, idx) => (
                  <motion.div
                    key={vehicle.vehicle_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={cn(
                      'p-3 rounded-lg cursor-pointer transition-all hover:bg-dark-600',
                      'border-l-4',
                      vehicle.risk_level === 'critical' ? 'border-red-500 bg-red-500/5' :
                      vehicle.risk_level === 'high' ? 'border-orange-500 bg-orange-500/5' :
                      vehicle.risk_level === 'medium' ? 'border-yellow-500 bg-yellow-500/5' :
                      'border-green-500 bg-green-500/5'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white text-sm">{vehicle.vehicle_name}</p>
                        <p className="text-xs text-gray-400">{vehicle.driver_name}</p>
                      </div>
                      <div className="text-right">
                        <p 
                          className="text-lg font-bold"
                          style={{ color: getRiskColor(vehicle.risk_level) }}
                        >
                          {Math.round(vehicle.overall_score * 100)}%
                        </p>
                        {vehicle.anomaly_detected && (
                          <span className="text-xs text-purple-400">⚠ Anomaly</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Center Column - Charts & Insights */}
          <div className="col-span-5 space-y-4">
            {/* 24-Hour Risk Forecast - Dynamic based on alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-dark rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-cyan" />
                24-Hour Risk Forecast
                <motion.span
                  key={alertMetrics.avgRisk.toFixed(2)}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 ml-auto"
                >
                  Base: {Math.round(alertMetrics.avgRisk * 100)}%
                </motion.span>
              </h3>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastPredictions}>
                    <defs>
                      <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={alertMetrics.criticalCount > 0 ? "#dc2626" : "#ef4444"} stopOpacity={0.4}/>
                        <stop offset="95%" stopColor={alertMetrics.criticalCount > 0 ? "#dc2626" : "#ef4444"} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="hour"
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickFormatter={(v) => `${v}h`}
                    />
                    <YAxis
                      stroke="#6b7280"
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      domain={[0, 1]}
                      tickFormatter={(v) => `${Math.round(v * 100)}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [`${Math.round(value * 100)}%`, 'Risk']}
                      labelFormatter={(label) => `Hour ${label}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted_risk"
                      stroke={alertMetrics.criticalCount > 0 ? "#dc2626" : "#ef4444"}
                      fill="url(#riskGradient)"
                      strokeWidth={2}
                      animationDuration={500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Top Risk Factors - Derived from Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-dark rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-cyan" />
                Top Risk Factors
                <motion.span
                  key={alertMetrics.totalAlerts}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 ml-auto"
                >
                  Live from {alertMetrics.totalAlerts} alerts
                </motion.span>
              </h3>

              <div className="space-y-3">
                {topRiskFactors.map((factor, idx) => (
                  <motion.div
                    key={factor.name}
                    className="space-y-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FactorIcon name={factor.name} />
                        <span className="text-sm font-medium text-white">{factor.name}</span>
                      </div>
                      <motion.span
                        key={`${factor.name}-${factor.vehicles_affected}`}
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded",
                          factor.vehicles_affected > 2 ? "bg-red-500/20 text-red-400" :
                          factor.vehicles_affected > 0 ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-gray-500/20 text-gray-400"
                        )}
                      >
                        {factor.vehicles_affected} affected
                      </motion.span>
                    </div>
                    <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: getRiskColor(factor.average) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.average * 100}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <motion.span key={`avg-${factor.name}-${factor.average}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        Avg: {Math.round(factor.average * 100)}%
                      </motion.span>
                      <motion.span key={`max-${factor.name}-${factor.max}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        Max: {Math.round(factor.max * 100)}%
                      </motion.span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Alerts & Actions */}
          <div className="col-span-3 space-y-4">
            {/* Active Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-dark rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </motion.div>
                  Active Alerts
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 animate-pulse">
                    LIVE
                  </span>
                </span>
                <span className="text-sm text-gray-400">({alerts.length})</span>
              </h3>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {alerts.length > 0 ? (
                    alerts.slice(0, 7).map((alert, idx) => {
                      const timeSince = Math.round((Date.now() - new Date(alert.timestamp).getTime()) / 60000);
                      const timeDisplay = timeSince < 1 ? 'Just now' : timeSince < 60 ? `${timeSince}m ago` : `${Math.round(timeSince / 60)}h ago`;

                      return (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: 20, scale: 0.95 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -20, scale: 0.95 }}
                          transition={{ delay: idx * 0.05 }}
                          layout
                          className={cn(
                            'p-3 rounded-xl border-l-4 cursor-pointer transition-all relative overflow-hidden',
                            alert.risk_level === 'critical'
                              ? 'bg-red-500/10 border-red-500 hover:bg-red-500/20'
                              : alert.risk_level === 'high'
                              ? 'bg-orange-500/10 border-orange-500 hover:bg-orange-500/20'
                              : 'bg-yellow-500/10 border-yellow-500 hover:bg-yellow-500/20'
                          )}
                        >
                          {/* Pulse effect for critical alerts */}
                          {alert.risk_level === 'critical' && (
                            <motion.div
                              className="absolute inset-0 bg-red-500/10"
                              animate={{ opacity: [0, 0.3, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}

                          <div className="relative z-10">
                            {/* Header Row */}
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-white text-sm">{alert.vehicle_name}</p>
                                  <span className={cn(
                                    'text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase',
                                    alert.risk_level === 'critical' ? 'bg-red-500 text-white' :
                                    alert.risk_level === 'high' ? 'bg-orange-500 text-white' :
                                    'bg-yellow-500 text-black'
                                  )}>
                                    {alert.risk_level}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-400">{alert.driver_name}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-500">{timeDisplay}</span>
                                <span
                                  className="text-xl font-bold"
                                  style={{ color: getRiskColor(alert.risk_level) }}
                                >
                                  {Math.round(alert.overall_score * 100)}%
                                </span>
                              </div>
                            </div>

                            {/* Risk Factors */}
                            <div className="flex flex-wrap gap-1 mb-2">
                              {alert.top_factors.map((f, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 rounded-lg text-[10px] font-medium"
                                  style={{ backgroundColor: `${f.color}25`, color: f.color }}
                                >
                                  {f.name}
                                </span>
                              ))}
                            </div>

                            {/* Alert Description */}
                            {alert.anomaly_description && (
                              <p className="text-[11px] text-gray-300 bg-dark-700/50 rounded-lg px-2 py-1.5 mb-2">
                                {alert.anomaly_description}
                              </p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                                className="text-[10px] px-2 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                              >
                                ✓ Resolve
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] px-2 py-1 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors"
                              >
                                📞 Contact
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] px-2 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                              >
                                📍 Locate
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                                className="ml-auto p-1 hover:bg-dark-600 rounded transition-colors"
                              >
                                <X className="w-3 h-3 text-gray-500" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500 opacity-50" />
                      <p className="text-sm font-medium">All clear!</p>
                      <p className="text-xs">Fleet operating normally</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-dark rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                AI Insights
              </h3>

              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto">
                {aiInsights || fleetSummary?.ai_summary || 'Analyzing fleet data...'}
              </div>
            </motion.div>

            {/* Risk Trend Gauges */}
            <RiskTrendGauges
              overallRisk={alerts.length > 0 ? alerts.reduce((sum, a) => sum + a.overall_score, 0) / alerts.length : 0.44}
              driverFatigue={0.35 + (alerts.filter(a => a.risk_level === 'high' || a.risk_level === 'critical').length * 0.08)}
              vehicleHealth={0.75 - (alerts.filter(a => a.top_factors.some(f => f.name.toLowerCase().includes('engine') || f.name.toLowerCase().includes('brake'))).length * 0.1)}
              routeRisk={0.38 + (alerts.filter(a => a.top_factors.some(f => f.name.toLowerCase().includes('traffic') || f.name.toLowerCase().includes('delay'))).length * 0.05)}
            />
          </div>
        </div>

        {/* Incident Feed - Below main grid */}
        <div className="mt-6">
          <IncidentFeed />
        </div>

        {/* Vehicle Detail Modal */}
        <AnimatePresence>
          {selectedVehicle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedVehicle(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-dark-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                      <Truck className="w-6 h-6 text-accent-cyan" />
                      {selectedVehicle.vehicle_name}
                    </h2>
                    <p className="text-gray-400 mt-1">Driver: {selectedVehicle.driver_name}</p>
                  </div>
                  <div className="text-right">
                    <div 
                      className="text-3xl font-bold"
                      style={{ color: getRiskColor(selectedVehicle.risk_level) }}
                    >
                      {Math.round(selectedVehicle.overall_score * 100)}%
                    </div>
                    <span 
                      className="px-2 py-1 rounded text-sm font-medium capitalize"
                      style={{ 
                        backgroundColor: `${getRiskColor(selectedVehicle.risk_level)}20`,
                        color: getRiskColor(selectedVehicle.risk_level)
                      }}
                    >
                      {selectedVehicle.risk_level} Risk
                    </span>
                  </div>
                </div>

                {/* Anomaly Alert */}
                {selectedVehicle.anomaly_detected && (
                  <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Anomaly Detected</span>
                    </div>
                    <p className="text-sm text-purple-300 mt-1">{selectedVehicle.anomaly_description}</p>
                  </div>
                )}

                {/* Risk Factors */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Risk Factors</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedVehicle.factors.map((factor, idx) => (
                      <div key={idx} className="p-3 bg-dark-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${factor.color}20` }}
                          >
                            <FactorIcon name={factor.name} />
                          </div>
                          <div>
                            <span className="text-sm font-medium text-white">{factor.name}</span>
                            <div className="flex items-center gap-1">
                              <TrendIcon trend={factor.trend} />
                              <span className="text-xs text-gray-400">{factor.trend}</span>
                            </div>
                          </div>
                        </div>
                        <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              backgroundColor: factor.color,
                              width: `${factor.current_value * 100}%`
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">{factor.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Actions */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">Recommended Actions</h3>
                  <div className="space-y-2">
                    {selectedVehicle.recommended_actions.map((action, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleMitigation(selectedVehicle.vehicle_id, action)}
                        className="w-full p-3 bg-dark-700 hover:bg-dark-600 rounded-lg text-left transition-colors flex items-center justify-between group"
                      >
                        <span className="text-sm text-white">{action}</span>
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-accent-cyan transition-colors" />
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Prediction Chart */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-3">12-Hour Prediction</h3>
                  <div className="h-32 bg-dark-700 rounded-lg p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedVehicle.predictions.slice(0, 12)}>
                        <XAxis 
                          dataKey="time" 
                          stroke="#6b7280" 
                          tick={{ fill: '#6b7280', fontSize: 10 }}
                        />
                        <YAxis 
                          stroke="#6b7280" 
                          tick={{ fill: '#6b7280', fontSize: 10 }}
                          domain={[0, 1]}
                          tickFormatter={(v) => `${Math.round(v * 100)}%`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1a1a2e',
                            border: '1px solid rgba(0, 245, 255, 0.3)',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="predicted_risk"
                          stroke="#00f5ff"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedVehicle(null)}
                  className="mt-6 w-full py-3 bg-dark-700 hover:bg-dark-600 rounded-xl text-white font-medium transition-colors"
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Broadcast Modal */}
        <AnimatePresence>
          {showBroadcast && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowBroadcast(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-dark-800 rounded-2xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                  <Radio className="w-6 h-6 text-orange-400" />
                  Broadcast Safety Alert
                </h2>
                
                <textarea
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Enter safety message for all drivers..."
                  className="w-full h-32 p-3 bg-dark-700 rounded-lg text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setShowBroadcast(false)}
                    className="flex-1 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBroadcast}
                    className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Broadcast
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
