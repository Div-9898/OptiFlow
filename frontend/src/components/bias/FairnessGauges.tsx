'use client';

import { motion } from 'framer-motion';

interface FairnessGaugesProps {
  geographicEquity: number;
  workloadBalance: number;
  customerParity: number;
  accessEquity: number;
}

function FairnessGauge({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: string;
}) {
  const circumference = 2 * Math.PI * 32;
  const percentage = value * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getStatusLabel = (val: number) => {
    if (val >= 0.85) return 'Excellent';
    if (val >= 0.7) return 'Good';
    if (val >= 0.5) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="32"
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
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-lg font-bold font-mono"
            style={{ color }}
          >
            {percentage.toFixed(0)}%
          </motion.span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 mt-2 text-center">{label}</span>
      <span className="text-[9px] mt-1" style={{ color }}>
        {getStatusLabel(value)}
      </span>
    </div>
  );
}

export default function FairnessGauges({
  geographicEquity,
  workloadBalance,
  customerParity,
  accessEquity
}: FairnessGaugesProps) {
  const getColor = (value: number) => {
    if (value >= 0.8) return '#10b981';
    if (value >= 0.6) return '#f59e0b';
    return '#ef4444';
  };

  const gauges = [
    { label: 'Geographic', value: geographicEquity },
    { label: 'Workload', value: workloadBalance },
    { label: 'Customer', value: customerParity },
    { label: 'Access', value: accessEquity }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-xl p-4"
    >
      <h3 className="text-sm font-semibold text-white mb-4">Fairness Dimensions</h3>
      <div className="flex items-center justify-around">
        {gauges.map((gauge, index) => (
          <motion.div
            key={gauge.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <FairnessGauge
              label={gauge.label}
              value={gauge.value}
              color={getColor(gauge.value)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
