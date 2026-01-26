'use client';

import { motion } from 'framer-motion';
import {
  Truck,
  Route,
  Clock,
  Fuel,
  Zap,
  TrendingUp,
  Navigation
} from 'lucide-react';
import { useExecutiveStore, FleetVehicle } from '@/stores/executiveStore';

// Animated progress ring
function ProgressRing({
  value,
  size = 80,
  strokeWidth = 6,
  color
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <defs>
        <filter id={`glow-${color.replace('#', '')}`}>
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        filter={`url(#glow-${color.replace('#', '')})`}
      />
    </svg>
  );
}

// Mini vehicle status card
function VehicleCard({ vehicle, index }: { vehicle: FleetVehicle; index: number }) {
  const statusColors = {
    delivering: '#10b981',
    returning: '#3b82f6',
    idle: '#6b7280',
    maintenance: '#f59e0b'
  };

  const statusLabels = {
    delivering: 'En Route',
    returning: 'Returning',
    idle: 'Idle',
    maintenance: 'Maintenance'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
    >
      <div
        className="p-2 rounded-lg"
        style={{ backgroundColor: `${statusColors[vehicle.status]}20` }}
      >
        <Truck className="w-4 h-4" style={{ color: statusColors[vehicle.status] }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white truncate">{vehicle.name}</p>
          <span
            className="px-2 py-0.5 rounded text-[9px] font-bold uppercase"
            style={{
              backgroundColor: `${statusColors[vehicle.status]}20`,
              color: statusColors[vehicle.status]
            }}
          >
            {statusLabels[vehicle.status]}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-gray-500">{vehicle.driver}</span>
          {vehicle.status === 'delivering' && (
            <>
              <span className="text-[10px] text-gray-600">•</span>
              <span className="text-[10px] text-cyan-400">
                Stop {vehicle.currentStop}/{vehicle.totalStops}
              </span>
              <span className="text-[10px] text-gray-600">•</span>
              <span className="text-[10px] text-green-400">ETA {vehicle.eta}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function FleetOperationsOverview() {
  const { metrics, fleetVehicles } = useExecutiveStore();

  // Calculate derived values from store metrics
  const deliveryProgress = metrics.totalDeliveries > 0
    ? (metrics.completedDeliveries / metrics.totalDeliveries) * 100
    : 0;
  const vehicleUtilization = metrics.vehicleUtilization;
  const inMaintenance = metrics.totalVehicles - metrics.activeVehicles -
    Math.max(0, Math.floor((metrics.totalVehicles - metrics.activeVehicles) * 0.3));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden h-full"
      style={{
        background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
        border: '1px solid rgba(0, 245, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(0, 245, 255, 0.05)'
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20">
              <Navigation className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Fleet Operations</h3>
              <p className="text-[9px] text-gray-500">Real-time tracking</p>
            </div>
          </div>
          <motion.div
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-green-400"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">LIVE</span>
          </motion.div>
        </div>
      </div>

      {/* Main metrics */}
      <div className="p-3">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Delivery Progress */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <ProgressRing value={deliveryProgress} color="#10b981" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-green-400 font-mono">
                  {Math.round(deliveryProgress)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Deliveries</p>
              <p className="text-lg font-bold text-white font-mono">
                {metrics.completedDeliveries}/{metrics.totalDeliveries}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-[10px] text-green-400">On track</span>
              </div>
            </div>
          </div>

          {/* Vehicle Utilization */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <ProgressRing value={vehicleUtilization} color="#3b82f6" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-400 font-mono">
                  {Math.round(vehicleUtilization)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Fleet Active</p>
              <p className="text-lg font-bold text-white font-mono">
                {metrics.activeVehicles}/{metrics.totalVehicles}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Truck className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] text-gray-400">{inMaintenance} in maintenance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { icon: Clock, label: 'On-Time', value: `${Math.round(metrics.onTimeRate)}%`, color: '#10b981' },
            { icon: Zap, label: 'Avg Speed', value: `42 km/h`, color: '#f59e0b' },
            { icon: Fuel, label: 'Fuel Eff.', value: `${metrics.fuelEfficiency}%`, color: '#8b5cf6' },
            { icon: Route, label: 'Distance', value: `${metrics.totalDistance} km`, color: '#00f5ff' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-2 rounded-lg bg-white/5 text-center"
            >
              <stat.icon className="w-3.5 h-3.5 mx-auto mb-1" style={{ color: stat.color }} />
              <p className="text-xs font-bold text-white font-mono">{stat.value}</p>
              <p className="text-[8px] text-gray-500 uppercase">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Active vehicles list */}
        <div className="space-y-2">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Active Vehicles</p>
          {fleetVehicles.slice(0, 4).map((vehicle, index) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
