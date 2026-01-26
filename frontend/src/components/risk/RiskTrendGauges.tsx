'use client';

import { motion } from 'framer-motion';

interface GaugeProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  showWarning?: boolean;
}

function RiskGauge({ label, value, maxValue, color, showWarning }: GaugeProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine color based on risk level
  const getRiskColor = () => {
    if (value < 0.3) return '#10b981';
    if (value < 0.6) return '#f59e0b';
    return '#ef4444';
  };

  const displayColor = color || getRiskColor();

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
          {/* Background circle */}
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="5"
          />
          {/* Warning zone (red section at the end) */}
          {showWarning && (
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="rgba(239, 68, 68, 0.2)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${circumference * 0.3} ${circumference * 0.7}`}
              strokeDashoffset={-circumference * 0.7}
            />
          )}
          {/* Progress circle */}
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={displayColor}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-sm font-bold font-mono"
            style={{ color: displayColor }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {(value * 100).toFixed(0)}%
          </motion.span>
        </div>
      </div>
      <span className="text-[9px] text-gray-400 mt-1 text-center leading-tight">{label}</span>
    </div>
  );
}

interface RiskTrendGaugesProps {
  overallRisk: number;
  driverFatigue: number;
  vehicleHealth: number;
  routeRisk: number;
}

export default function RiskTrendGauges({
  overallRisk,
  driverFatigue,
  vehicleHealth,
  routeRisk
}: RiskTrendGaugesProps) {
  const gauges = [
    {
      label: 'Overall Risk',
      value: overallRisk,
      maxValue: 1,
      showWarning: true
    },
    {
      label: 'Driver Fatigue',
      value: driverFatigue,
      maxValue: 1,
      showWarning: true
    },
    {
      label: 'Vehicle Health',
      value: 1 - vehicleHealth, // Invert for display (high health = low risk)
      maxValue: 1,
      showWarning: false
    },
    {
      label: 'Route Risk',
      value: routeRisk,
      maxValue: 1,
      showWarning: true
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-xl p-4"
    >
      <h3 className="text-sm font-semibold text-white mb-3">Risk Indicators</h3>
      <div className="grid grid-cols-4 gap-2">
        {gauges.map((gauge, index) => (
          <motion.div
            key={gauge.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex justify-center"
          >
            <RiskGauge {...gauge} color="" />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
