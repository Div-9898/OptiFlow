'use client';

import { motion } from 'framer-motion';
import { Truck, Package, Clock, Gauge, Fuel, AlertTriangle } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useAnimatedValue } from '@/hooks/useAnimatedValue';
import { cn, formatNumber, getRiskColor } from '@/lib/utils';

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  color?: string;
  trend?: number;
  decimals?: number;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  prefix = '',
  color = '#00f5ff',
  trend,
  decimals = 0,
}: MetricCardProps) {
  const animatedValue = useAnimatedValue(value, { duration: 1500, decimals });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="glass-dark p-4 rounded-xl"
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend !== undefined && (
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              trend >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            )}
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-white">
          {prefix}{formatNumber(animatedValue, decimals)}{suffix}
        </p>
        <p className="text-xs text-gray-400 mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

export default function MetricsPanel() {
  const { metrics } = useDashboardStore();

  const metricsData = [
    {
      icon: Truck,
      label: 'Active Vehicles',
      value: metrics.activeVehicles,
      suffix: ` / ${metrics.totalVehicles}`,
      color: '#39ff14',
    },
    {
      icon: Package,
      label: 'Deliveries Today',
      value: metrics.completedDeliveries,
      suffix: ` / ${metrics.totalDeliveries}`,
      color: '#00f5ff',
    },
    {
      icon: Clock,
      label: 'On-Time Rate',
      value: metrics.onTimeRate,
      suffix: '%',
      color: '#a855f7',
      decimals: 1,
    },
    {
      icon: AlertTriangle,
      label: 'Fleet Risk Score',
      value: metrics.averageRiskScore * 100,
      suffix: '%',
      color: getRiskColor(metrics.averageRiskScore),
      decimals: 1,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 max-w-md">
      {metricsData.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <MetricCard {...metric} />
        </motion.div>
      ))}
    </div>
  );
}
