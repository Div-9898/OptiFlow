'use client';

import { motion } from 'framer-motion';

interface GaugeProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  unit?: string;
}

function CircularGauge({ label, value, maxValue, color, unit = '%' }: GaugeProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-lg font-bold font-mono"
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {value.toFixed(0)}
            <span className="text-[10px] text-gray-500">{unit}</span>
          </motion.span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 mt-2 text-center">{label}</span>
    </div>
  );
}

interface RouteEfficiencyGaugesProps {
  routeEfficiency: number;
  vehicleUtilization: number;
  timeSavings: number;
  loadBalance: number;
}

export default function RouteEfficiencyGauges({
  routeEfficiency,
  vehicleUtilization,
  timeSavings,
  loadBalance
}: RouteEfficiencyGaugesProps) {
  const gauges = [
    {
      label: 'Route Efficiency',
      value: routeEfficiency,
      maxValue: 100,
      color: '#10b981'
    },
    {
      label: 'Vehicle Utilization',
      value: vehicleUtilization,
      maxValue: 100,
      color: '#3b82f6'
    },
    {
      label: 'Time Savings',
      value: timeSavings,
      maxValue: 100,
      color: '#f97316'
    },
    {
      label: 'Load Balance',
      value: loadBalance,
      maxValue: 100,
      color: '#8b5cf6'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-xl p-4"
    >
      <h3 className="text-sm font-semibold text-white mb-4">Performance Metrics</h3>
      <div className="flex items-center justify-between gap-2">
        {gauges.map((gauge, index) => (
          <motion.div
            key={gauge.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <CircularGauge {...gauge} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
