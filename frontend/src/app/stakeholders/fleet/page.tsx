'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { useExecutiveStore, FleetVehicle } from '@/stores/executiveStore';
import {
  ArrowLeft,
  Navigation,
  Truck,
  Route,
  Clock,
  Fuel,
  Zap,
  TrendingUp,
  TrendingDown,
  MapPin,
  Activity,
  AlertTriangle,
  CheckCircle,
  Package,
  Timer,
  Gauge,
  Target,
  Users
} from 'lucide-react';

// Animated counter component
function AnimatedCounter({ value, suffix = '', prefix = '', decimals = 0 }: { value: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();
    const duration = 1500;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <>{prefix}{displayValue.toFixed(decimals)}{suffix}</>;
}

// Large gauge component
function LargeGauge({ value, label, color, size = 180 }: { value: number; label: string; color: string; size?: number }) {
  const radius = (size - 20) / 2;
  const circumference = radius * Math.PI * 1.5;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size * 0.75 }}>
      <svg width={size} height={size * 0.75} className="overflow-visible">
        <defs>
          <filter id={`gauge-glow-${label.replace(/\s/g, '')}`}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id={`gauge-gradient-${label.replace(/\s/g, '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <path
          d={`M ${10} ${size * 0.65} A ${radius} ${radius} 0 1 1 ${size - 10} ${size * 0.65}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <motion.path
          d={`M ${10} ${size * 0.65} A ${radius} ${radius} 0 1 1 ${size - 10} ${size * 0.65}`}
          fill="none"
          stroke={`url(#gauge-gradient-${label.replace(/\s/g, '')})`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          filter={`url(#gauge-glow-${label.replace(/\s/g, '')})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
        <span className="text-4xl font-bold font-mono" style={{ color, textShadow: `0 0 30px ${color}50` }}>
          <AnimatedCounter value={value} suffix="%" />
        </span>
        <span className="text-xs text-gray-500 uppercase tracking-wider mt-1">{label}</span>
      </div>
    </div>
  );
}

// Sparkline component
function Sparkline({ data, color, height = 60, width = 200 }: { data: number[]; color: string; height?: number; width?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="sparkline-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <polygon points={areaPoints} fill={`url(#sparkline-gradient-${color.replace('#', '')})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#sparkline-glow)"
      />
      <motion.circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 10) - 5}
        r="4"
        fill={color}
        filter="url(#sparkline-glow)"
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </svg>
  );
}

// Vehicle status card
function VehicleStatusCard({ vehicle, index }: { vehicle: FleetVehicle; index: number }) {
  const statusConfig = {
    delivering: { color: '#10b981', label: 'En Route', icon: Navigation },
    returning: { color: '#3b82f6', label: 'Returning', icon: ArrowLeft },
    idle: { color: '#6b7280', label: 'Idle', icon: Clock },
    maintenance: { color: '#f59e0b', label: 'Maintenance', icon: Zap }
  };
  const riskConfig = {
    low: { color: '#10b981', label: 'Low Risk' },
    medium: { color: '#f59e0b', label: 'Medium Risk' },
    high: { color: '#ef4444', label: 'High Risk' }
  };

  const config = statusConfig[vehicle.status];
  const risk = riskConfig[vehicle.risk];
  const StatusIcon = config.icon;
  const progress = vehicle.totalStops > 0 ? (vehicle.currentStop / vehicle.totalStops) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${config.color}30`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.color}20` }}>
            <Truck className="w-5 h-5" style={{ color: config.color }} />
          </div>
          <div>
            <p className="font-medium text-white">{vehicle.name}</p>
            <p className="text-xs text-gray-500">{vehicle.driver}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="px-2 py-1 rounded text-[10px] font-bold uppercase" style={{ backgroundColor: `${config.color}20`, color: config.color }}>
            {config.label}
          </span>
          <span className="px-2 py-0.5 rounded text-[9px]" style={{ backgroundColor: `${risk.color}20`, color: risk.color }}>
            {risk.label}
          </span>
        </div>
      </div>

      {vehicle.status === 'delivering' && (
        <>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gray-400">Progress</span>
            <span className="text-cyan-400">Stop {vehicle.currentStop}/{vehicle.totalStops}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden mb-2">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: config.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-400">ETA: {vehicle.eta}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400">On Track</span>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

// Donut chart component
function DonutChart({ segments, size = 150 }: { segments: { value: number; color: string; label: string }[]; size?: number }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - 20) / 2;
  const circumference = radius * 2 * Math.PI;
  let currentOffset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="20" />
        {segments.map((segment, i) => {
          const segmentLength = (segment.value / total) * circumference;
          const offset = currentOffset;
          currentOffset += segmentLength;
          return (
            <motion.circle
              key={i}
              cx={size/2}
              cy={size/2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="20"
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.2 }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{total}</span>
        <span className="text-[10px] text-gray-500 uppercase">Total</span>
      </div>
    </div>
  );
}

export default function FleetOperationsPage() {
  const router = useRouter();
  const { metrics, fleetVehicles, syncFromStores } = useExecutiveStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    syncFromStores();
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [syncFromStores]);

  // Mock data for charts
  const deliveryTrend = [85, 88, 92, 87, 91, 94, 89, 93, 96, 94, 97, 95];
  const utilizationTrend = [72, 75, 78, 74, 80, 82, 79, 84, 86, 83, 88, 85];

  const vehicleStatusDistribution = [
    { value: fleetVehicles.filter(v => v.status === 'delivering').length, color: '#10b981', label: 'Delivering' },
    { value: fleetVehicles.filter(v => v.status === 'returning').length, color: '#3b82f6', label: 'Returning' },
    { value: fleetVehicles.filter(v => v.status === 'idle').length, color: '#6b7280', label: 'Idle' },
    { value: fleetVehicles.filter(v => v.status === 'maintenance').length, color: '#f59e0b', label: 'Maintenance' },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#050a12]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <motion.div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050a12] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/stakeholders')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="flex items-center gap-3">
                <motion.div className="p-3 rounded-xl bg-cyan-500/20" animate={{ boxShadow: ['0 0 20px rgba(0, 245, 255, 0.3)', '0 0 40px rgba(0, 245, 255, 0.5)', '0 0 20px rgba(0, 245, 255, 0.3)'] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Navigation className="w-6 h-6 text-cyan-400" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Fleet Operations</h1>
                  <p className="text-sm text-gray-500">Real-time vehicle tracking & performance analytics</p>
                </div>
              </div>
            </div>
            <motion.div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30" animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <motion.div className="w-2 h-2 rounded-full bg-green-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
              <span className="text-sm font-bold text-green-400">LIVE</span>
            </motion.div>
          </motion.div>

          {/* Main Gauges Row */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-4 gap-6">
            {[
              { value: metrics.vehicleUtilization, label: 'Fleet Utilization', color: '#00f5ff' },
              { value: metrics.totalDeliveries > 0 ? Math.round((metrics.completedDeliveries / metrics.totalDeliveries) * 100) : 57, label: 'Delivery Progress', color: '#10b981' },
              { value: Math.round(metrics.onTimeRate), label: 'On-Time Rate', color: '#8b5cf6' },
              { value: metrics.fuelEfficiency, label: 'Fuel Efficiency', color: '#f59e0b' },
            ].map((gauge, i) => (
              <motion.div key={gauge.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.1 }} className="rounded-2xl p-6 flex flex-col items-center" style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: `1px solid ${gauge.color}20` }}>
                <LargeGauge value={gauge.value} label={gauge.label} color={gauge.color} />
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-6">
            {/* Delivery Trend */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-5" style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Delivery Trend</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400">+12%</span>
                </div>
              </div>
              <Sparkline data={deliveryTrend} color="#10b981" height={80} width={280} />
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div><p className="text-lg font-bold text-white">{metrics.completedDeliveries}</p><p className="text-[9px] text-gray-500">Completed</p></div>
                <div><p className="text-lg font-bold text-white">{metrics.totalDeliveries - metrics.completedDeliveries}</p><p className="text-[9px] text-gray-500">Pending</p></div>
                <div><p className="text-lg font-bold text-green-400">{Math.round(metrics.onTimeRate)}%</p><p className="text-[9px] text-gray-500">On-Time</p></div>
              </div>
            </motion.div>

            {/* Utilization Trend */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="rounded-2xl p-5" style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid rgba(0, 245, 255, 0.2)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-white">Utilization Trend</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-cyan-400" />
                  <span className="text-xs text-cyan-400">+8%</span>
                </div>
              </div>
              <Sparkline data={utilizationTrend} color="#00f5ff" height={80} width={280} />
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div><p className="text-lg font-bold text-white">{metrics.activeVehicles}</p><p className="text-[9px] text-gray-500">Active</p></div>
                <div><p className="text-lg font-bold text-white">{metrics.totalVehicles - metrics.activeVehicles}</p><p className="text-[9px] text-gray-500">Inactive</p></div>
                <div><p className="text-lg font-bold text-cyan-400">{metrics.vehicleUtilization}%</p><p className="text-[9px] text-gray-500">Utilization</p></div>
              </div>
            </motion.div>

            {/* Vehicle Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-5" style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white">Vehicle Status</span>
              </div>
              <div className="flex items-center justify-center">
                <DonutChart segments={vehicleStatusDistribution} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {vehicleStatusDistribution.map((seg) => (
                  <div key={seg.label} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                    <span className="text-[10px] text-gray-400">{seg.label}</span>
                    <span className="text-[10px] font-bold text-white ml-auto">{seg.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Fleet Status */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl p-5" style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid rgba(100, 200, 255, 0.1)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">Active Fleet Status</span>
              </div>
              <span className="text-xs text-gray-500">{fleetVehicles.length} vehicles tracked</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {fleetVehicles.map((vehicle, i) => (
                <VehicleStatusCard key={vehicle.id} vehicle={vehicle} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
