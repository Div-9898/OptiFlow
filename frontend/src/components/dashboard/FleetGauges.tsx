'use client';

import { motion } from 'framer-motion';
import { Truck, Target, Clock } from 'lucide-react';

interface GaugeProps {
  value: number;
  maxValue: number;
  label: string;
  icon: React.ElementType;
  color: string;
  size?: number;
}

function CircularGauge({ value, maxValue, label, icon: Icon, color, size = 80 }: GaugeProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg className="absolute inset-0 -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={strokeWidth}
          />
          {/* Animated progress */}
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
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              filter: `drop-shadow(0 0 6px ${color}50)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-4 h-4 mb-0.5" style={{ color }} />
          <span className="text-sm font-bold text-white">{percentage.toFixed(0)}%</span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 mt-1.5 uppercase tracking-wider">{label}</span>
    </div>
  );
}

interface FleetGaugesProps {
  fleetUtilization: number;
  routeEfficiency: number;
  timeAdherence: number;
}

export default function FleetGauges({ fleetUtilization, routeEfficiency, timeAdherence }: FleetGaugesProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="absolute bottom-24 left-[340px] z-10"
    >
      <div
        className="p-4 rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(10,15,25,0.9) 0%, rgba(5,10,20,0.95) 100%)',
          border: '1px solid rgba(100, 150, 255, 0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3 text-center">
          Fleet Performance
        </div>
        <div className="flex items-center gap-4">
          <CircularGauge
            value={fleetUtilization}
            maxValue={100}
            label="Utilization"
            icon={Truck}
            color="#00ff88"
          />
          <CircularGauge
            value={routeEfficiency}
            maxValue={100}
            label="Efficiency"
            icon={Target}
            color="#00d4ff"
          />
          <CircularGauge
            value={timeAdherence}
            maxValue={100}
            label="On-Time"
            icon={Clock}
            color="#a855f7"
          />
        </div>
      </div>
    </motion.div>
  );
}
