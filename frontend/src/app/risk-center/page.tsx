'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Cloud, 
  Car, 
  Users, 
  Wrench,
  Activity,
  TrendingUp,
  Shield
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { useRiskStore } from '@/stores/riskStore';
import { cn, getRiskColor } from '@/lib/utils';

export default function RiskCenterPage() {
  const { overallFleetRisk, vehicleRisks, activeAlerts, weatherData } = useRiskStore();
  const [selectedFactor, setSelectedFactor] = useState<string | null>(null);
  const [radarAngle, setRadarAngle] = useState(0);

  // Animate radar sweep
  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const riskFactors = [
    { id: 'weather', name: 'Weather', icon: Cloud, value: 0.25, color: '#3b82f6' },
    { id: 'traffic', name: 'Traffic', icon: Car, value: 0.35, color: '#f59e0b' },
    { id: 'fatigue', name: 'Driver Fatigue', icon: Users, value: 0.28, color: '#a855f7' },
    { id: 'vehicle', name: 'Vehicle Health', icon: Wrench, value: 0.18, color: '#10b981' },
  ];

  const riskDistribution = [
    { name: 'Low', value: 15, color: '#10b981' },
    { name: 'Medium', value: 7, color: '#f59e0b' },
    { name: 'High', value: 2, color: '#ef4444' },
    { name: 'Critical', value: 1, color: '#dc2626' },
  ];

  const hourlyRisk = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    risk: 0.2 + Math.sin((i - 8) * 0.3) * 0.2 + Math.random() * 0.1,
  }));

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Risk <span className="text-red-400">Command Center</span>
        </h1>
        <p className="text-gray-400">
          Real-time fleet risk monitoring and prediction
        </p>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Radar Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-5 glass-dark rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-cyan" />
            Threat Radar
          </h3>
          
          <div className="relative w-full aspect-square max-w-md mx-auto">
            {/* Radar circles */}
            {[1, 2, 3, 4].map((ring) => (
              <div
                key={ring}
                className="absolute border border-accent-cyan/20 rounded-full"
                style={{
                  width: `${ring * 25}%`,
                  height: `${ring * 25}%`,
                  left: `${50 - ring * 12.5}%`,
                  top: `${50 - ring * 12.5}%`,
                }}
              />
            ))}
            
            {/* Radar sweep */}
            <div
              className="absolute inset-0 origin-center"
              style={{ transform: `rotate(${radarAngle}deg)` }}
            >
              <div
                className="absolute top-1/2 left-1/2 w-1/2 h-[2px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, #00f5ff)',
                  transformOrigin: 'left center',
                }}
              />
              <div
                className="absolute top-1/2 left-1/2 w-1/2"
                style={{
                  height: '50%',
                  background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0, 245, 255, 0.1) 30deg, transparent 30deg)',
                  transformOrigin: 'left top',
                }}
              />
            </div>

            {/* Risk points */}
            {Array.from(vehicleRisks.entries()).slice(0, 10).map(([id, risk], i) => {
              const angle = (i / 10) * 360;
              const distance = risk.overall * 40 + 10;
              const x = 50 + distance * Math.cos((angle * Math.PI) / 180);
              const y = 50 + distance * Math.sin((angle * Math.PI) / 180);
              
              return (
                <motion.div
                  key={id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    backgroundColor: getRiskColor(risk.overall),
                    boxShadow: `0 0 10px ${getRiskColor(risk.overall)}`,
                  }}
                />
              );
            })}

            {/* Center indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-accent-cyan" />
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-4">
            {['low', 'medium', 'high', 'critical'].map((level) => (
              <div key={level} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getRiskColor(level === 'low' ? 0.2 : level === 'medium' ? 0.5 : level === 'high' ? 0.75 : 0.9) }}
                />
                <span className="text-xs text-gray-400 capitalize">{level}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Panel */}
        <div className="col-span-7 space-y-6">
          {/* Risk Factors */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-dark rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Risk Factors</h3>
            <div className="grid grid-cols-2 gap-4">
              {riskFactors.map((factor) => {
                const Icon = factor.icon;
                return (
                  <motion.div
                    key={factor.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedFactor(factor.id)}
                    className={cn(
                      'p-4 rounded-xl cursor-pointer transition-all',
                      selectedFactor === factor.id
                        ? 'bg-dark-600 ring-1 ring-accent-cyan'
                        : 'bg-dark-700 hover:bg-dark-600'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${factor.color}20` }}
                      >
                        <Icon className="w-5 h-5" style={{ color: factor.color }} />
                      </div>
                      <span className="font-medium text-white">{factor.name}</span>
                    </div>
                    
                    <div className="relative h-2 bg-dark-800 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ backgroundColor: factor.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${factor.value * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                    <p className="text-right text-sm text-gray-400 mt-1">
                      {(factor.value * 100).toFixed(0)}%
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Risk Distribution & Timeline */}
          <div className="grid grid-cols-2 gap-6">
            {/* Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-dark rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Fleet Distribution</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      stroke="none"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {riskDistribution.map((item) => (
                  <div key={item.name} className="text-center">
                    <p className="text-lg font-bold" style={{ color: item.color }}>
                      {item.value}
                    </p>
                    <p className="text-xs text-gray-400">{item.name}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-dark rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent-cyan" />
                24h Risk Forecast
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyRisk}>
                    <XAxis dataKey="hour" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                    <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} domain={[0, 1]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a25',
                        border: '1px solid rgba(0, 245, 255, 0.2)',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="risk"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 glass-dark rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          Active Alerts ({activeAlerts.length})
        </h3>
        
        <div className="space-y-3">
          <AnimatePresence>
            {activeAlerts.length > 0 ? (
              activeAlerts.slice(0, 5).map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    'p-4 rounded-xl border-l-4',
                    alert.severity === 'high'
                      ? 'bg-red-500/10 border-red-500'
                      : alert.severity === 'medium'
                      ? 'bg-orange-500/10 border-orange-500'
                      : 'bg-yellow-500/10 border-yellow-500'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">{alert.description}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {alert.affectedGroup} • {alert.recommendation}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No active alerts - fleet operating normally</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
