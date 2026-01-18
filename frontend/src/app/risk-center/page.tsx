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
    default: return <AlertTriangle className={iconClass} />;
  }
};

export default function RiskCenterPage() {
  // State
  const [fleetSummary, setFleetSummary] = useState<FleetSummary | null>(null);
  const [vehicles, setVehicles] = useState<VehicleRisk[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch fleet risk data
  const fetchFleetRisk = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/risk/fleet');
      if (response.ok) {
        const data = await response.json();
        setFleetSummary(data.summary);
        setVehicles(data.vehicles);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching fleet risk:', error);
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/risk/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  }, []);

  // Fetch AI insights
  const fetchAiInsights = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/risk/ai-insights');
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.detailed_insights || data.summary);
      }
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    }
  }, []);

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
  };

  // Distribution chart data
  const distributionData = fleetSummary ? [
    { name: 'Low', value: fleetSummary.risk_distribution.low, color: '#10b981' },
    { name: 'Medium', value: fleetSummary.risk_distribution.medium, color: '#f59e0b' },
    { name: 'High', value: fleetSummary.risk_distribution.high, color: '#ef4444' },
    { name: 'Critical', value: fleetSummary.risk_distribution.critical, color: '#dc2626' }
  ] : [];

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

        {/* Top Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Fleet Risk Score */}
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
                <TrendIcon trend={fleetSummary?.trend || 'stable'} />
                <span className="text-xs text-gray-400 capitalize">{fleetSummary?.trend}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#1f2937" strokeWidth="8" />
                  <circle
                    cx="40" cy="40" r="34" fill="none"
                    stroke={getRiskColor(fleetSummary?.average_risk || 0)}
                    strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${(fleetSummary?.average_risk || 0) * 214} 214`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {Math.round((fleetSummary?.average_risk || 0) * 100)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{fleetSummary?.total_vehicles}</p>
                <p className="text-sm text-gray-400">Total Vehicles</p>
              </div>
            </div>
          </motion.div>

          {/* Critical & High Risk */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-dark rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Risk Alerts
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-3xl font-bold text-red-400">{fleetSummary?.critical_count || 0}</p>
                <p className="text-xs text-red-300">Critical</p>
              </div>
              <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <p className="text-3xl font-bold text-orange-400">{fleetSummary?.high_risk_count || 0}</p>
                <p className="text-xs text-orange-300">High Risk</p>
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

          {/* AI Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-dark rounded-xl p-5"
          >
            <h3 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              AI Analysis
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed line-clamp-4">
              {fleetSummary?.ai_summary || 'Analyzing fleet data...'}
            </p>
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
            {/* 24-Hour Risk Forecast */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-dark rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent-cyan" />
                24-Hour Risk Forecast
              </h3>
              
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={fleetSummary?.predictions || []}>
                    <defs>
                      <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted_risk"
                      stroke="#ef4444"
                      fill="url(#riskGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Top Risk Factors */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-dark rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-cyan" />
                Top Risk Factors
              </h3>
              
              <div className="space-y-3">
                {fleetSummary?.top_risk_factors.slice(0, 5).map((factor, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FactorIcon name={factor.name} />
                        <span className="text-sm font-medium text-white">{factor.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{factor.vehicles_affected} affected</span>
                    </div>
                    <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: getRiskColor(factor.average) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.average * 100}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Avg: {Math.round(factor.average * 100)}%</span>
                      <span>Max: {Math.round(factor.max * 100)}%</span>
                    </div>
                  </div>
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
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  Active Alerts
                </span>
                <span className="text-sm text-gray-400">({alerts.length})</span>
              </h3>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {alerts.length > 0 ? (
                    alerts.slice(0, 5).map((alert) => (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={cn(
                          'p-3 rounded-lg border-l-4 cursor-pointer hover:bg-dark-600/50 transition-colors',
                          alert.risk_level === 'critical' 
                            ? 'bg-red-500/10 border-red-500' 
                            : 'bg-orange-500/10 border-orange-500'
                        )}
                        onClick={() => {
                          const vehicle = vehicles.find(v => v.vehicle_id === alert.vehicle_id);
                          if (vehicle) setSelectedVehicle(vehicle);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-white text-sm">{alert.vehicle_name}</p>
                            <p className="text-xs text-gray-400">{alert.driver_name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {alert.top_factors.slice(0, 2).map((f, i) => (
                                <span 
                                  key={i}
                                  className="px-1.5 py-0.5 rounded text-xs"
                                  style={{ backgroundColor: `${f.color}20`, color: f.color }}
                                >
                                  {f.name}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span 
                              className="text-lg font-bold"
                              style={{ color: getRiskColor(alert.risk_level) }}
                            >
                              {Math.round(alert.overall_score * 100)}%
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }}
                              className="p-1 hover:bg-dark-700 rounded transition-colors"
                            >
                              <X className="w-3 h-3 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500 opacity-50" />
                      <p className="text-sm font-medium">No active alerts</p>
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
          </div>
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
