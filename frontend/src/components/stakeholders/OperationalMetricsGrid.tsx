'use client';

import { motion } from 'framer-motion';
import {
  Shield,
  Scale,
  Brain,
  Truck,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity
} from 'lucide-react';
import { useExecutiveStore } from '@/stores/executiveStore';

interface MetricData {
  id: string;
  label: string;
  value: number;
  target: number;
  unit: string;
  category: 'risk' | 'fairness' | 'ethics' | 'operations';
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const categoryConfig = {
  risk: { icon: Shield, color: '#ef4444', label: 'Risk Management' },
  fairness: { icon: Scale, color: '#8b5cf6', label: 'Fairness & Equity' },
  ethics: { icon: Brain, color: '#f59e0b', label: 'Ethics & Compliance' },
  operations: { icon: Truck, color: '#00f5ff', label: 'Operations' }
};

const statusConfig = {
  excellent: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: CheckCircle },
  good: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', icon: CheckCircle },
  warning: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: AlertTriangle },
  critical: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: AlertTriangle }
};

// Mini gauge component
function MiniGauge({ value, color, size = 48 }: { value: number; color: string; size?: number }) {
  const radius = (size - 6) / 2;
  const circumference = radius * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size / 2 + 4} className="overflow-visible">
      <defs>
        <filter id={`mini-glow-${color.replace('#', '')}`}>
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path
        d={`M 3 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 3} ${size / 2}`}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <motion.path
        d={`M 3 ${size / 2} A ${radius} ${radius} 0 0 1 ${size - 3} ${size / 2}`}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        filter={`url(#mini-glow-${color.replace('#', '')})`}
      />
    </svg>
  );
}

function MetricCard({ metric, index }: { metric: MetricData; index: number }) {
  const catConfig = categoryConfig[metric.category];
  const statConfig = statusConfig[metric.status];
  const CatIcon = catConfig.icon;
  const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;

  const trendColor = metric.category === 'risk'
    ? (metric.trend === 'down' ? '#10b981' : '#ef4444')
    : (metric.trend === 'up' ? '#10b981' : metric.trend === 'down' ? '#ef4444' : '#6b7280');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className="p-3 rounded-xl cursor-pointer transition-all"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: `1px solid ${catConfig.color}20`,
        boxShadow: `0 4px 20px rgba(0,0,0,0.2), 0 0 30px ${catConfig.color}05`
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div
          className="p-1.5 rounded-lg"
          style={{ backgroundColor: `${catConfig.color}15` }}
        >
          <CatIcon className="w-3.5 h-3.5" style={{ color: catConfig.color }} />
        </div>
        <div
          className="px-2 py-0.5 rounded-full flex items-center gap-1"
          style={{ backgroundColor: statConfig.bg }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: statConfig.color }}
          />
          <span
            className="text-[8px] font-bold uppercase"
            style={{ color: statConfig.color }}
          >
            {metric.status}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <MiniGauge value={Math.round(metric.value)} color={catConfig.color} />
        <div className="flex-1">
          <p className="text-lg font-bold font-mono text-white">
            {Math.round(metric.value)}{metric.unit}
          </p>
          <p className="text-[9px] text-gray-500">
            Target: {metric.target}{metric.unit}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-[10px] text-gray-400 truncate">{metric.label}</p>
        <div className="flex items-center gap-1">
          <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
          <span className="text-[9px] font-mono" style={{ color: trendColor }}>
            {metric.trend === 'up' ? '+' : metric.trend === 'down' ? '-' : ''}{Math.abs(metric.trendValue).toFixed(1)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function getStatus(value: number, target: number, isRisk = false): 'excellent' | 'good' | 'warning' | 'critical' {
  if (isRisk) {
    if (value <= target * 0.7) return 'excellent';
    if (value <= target) return 'good';
    if (value <= target * 1.3) return 'warning';
    return 'critical';
  }
  if (value >= target * 1.05) return 'excellent';
  if (value >= target) return 'good';
  if (value >= target * 0.9) return 'warning';
  return 'critical';
}

export default function OperationalMetricsGrid() {
  const { metrics } = useExecutiveStore();

  // Build metrics from store data - matching values from other pages
  const metricData: MetricData[] = [
    // Operations (from VRP Arena / Dashboard)
    {
      id: 'route-efficiency',
      label: 'Route Efficiency',
      value: metrics.routeEfficiency,
      target: 95,
      unit: '%',
      category: 'operations',
      trend: 'up',
      trendValue: 2.3,
      status: getStatus(metrics.routeEfficiency, 95)
    },
    {
      id: 'vehicle-utilization',
      label: 'Vehicle Utilization',
      value: metrics.vehicleUtilization,
      target: 85,
      unit: '%',
      category: 'operations',
      trend: 'up',
      trendValue: 5.1,
      status: getStatus(metrics.vehicleUtilization, 85)
    },
    {
      id: 'on-time-delivery',
      label: 'On-Time Delivery',
      value: metrics.onTimeRate,
      target: 95,
      unit: '%',
      category: 'operations',
      trend: 'stable',
      trendValue: 0.2,
      status: getStatus(metrics.onTimeRate, 95)
    },

    // Risk (from Risk Center)
    {
      id: 'fleet-risk',
      label: 'Fleet Risk Score',
      value: metrics.fleetRiskScore,
      target: 35,
      unit: '',
      category: 'risk',
      trend: 'down',
      trendValue: 4.2,
      status: getStatus(metrics.fleetRiskScore, 35, true)
    },
    {
      id: 'driver-safety',
      label: 'Driver Safety Index',
      value: 100 - metrics.fleetRiskScore,
      target: 90,
      unit: '%',
      category: 'risk',
      trend: 'up',
      trendValue: 1.8,
      status: getStatus(100 - metrics.fleetRiskScore, 90)
    },

    // Fairness (from Bias Audit - exact values)
    {
      id: 'demographic-parity',
      label: 'Demographic Parity',
      value: metrics.demographicParity,
      target: 85,
      unit: '%',
      category: 'fairness',
      trend: 'up',
      trendValue: 1.5,
      status: getStatus(metrics.demographicParity, 85)
    },
    {
      id: 'geographic-equity',
      label: 'Geographic Equity',
      value: metrics.geographicEquity,
      target: 80,
      unit: '%',
      category: 'fairness',
      trend: 'up',
      trendValue: 3.2,
      status: getStatus(metrics.geographicEquity, 80)
    },
    {
      id: 'workload-balance',
      label: 'Workload Balance',
      value: metrics.workloadBalance,
      target: 80,
      unit: '%',
      category: 'fairness',
      trend: 'stable',
      trendValue: 0.5,
      status: getStatus(metrics.workloadBalance, 80)
    },

    // Ethics (from Ethics Lab - exact values)
    {
      id: 'ethical-compliance',
      label: 'Ethical Compliance',
      value: metrics.ethicalCompliance,
      target: 90,
      unit: '%',
      category: 'ethics',
      trend: 'up',
      trendValue: 2.1,
      status: getStatus(metrics.ethicalCompliance, 90)
    },
    {
      id: 'decision-consensus',
      label: 'Decision Consensus',
      value: metrics.decisionConsensus,
      target: 75,
      unit: '%',
      category: 'ethics',
      trend: 'up',
      trendValue: 4.5,
      status: getStatus(metrics.decisionConsensus, 75)
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
        border: '1px solid rgba(100, 200, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/10">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Operational Metrics</h3>
              <p className="text-[9px] text-gray-500">Cross-platform performance indicators</p>
            </div>
          </div>
          <div className="flex gap-2">
            {Object.entries(categoryConfig).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <div
                  key={key}
                  className="p-1.5 rounded"
                  style={{ backgroundColor: `${config.color}15` }}
                  title={config.label}
                >
                  <Icon className="w-3 h-3" style={{ color: config.color }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-3">
        <div className="grid grid-cols-5 gap-2">
          {metricData.map((metric, index) => (
            <MetricCard key={metric.id} metric={metric} index={index} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
