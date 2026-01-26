'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  Shield,
  Scale,
  Leaf,
  FileText,
  Users
} from 'lucide-react';

interface TemplateGaugesProps {
  operational: number;
  safety: number;
  ethics: number;
  sustainability: number;
}

function TemplateGauge({
  label,
  value,
  color,
  icon: Icon
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
}) {
  const circumference = 2 * Math.PI * 32;
  const percentage = value;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
          <Icon className="w-4 h-4 mb-0.5" style={{ color }} />
          <motion.span
            className="text-sm font-bold font-mono"
            style={{ color }}
          >
            {value}%
          </motion.span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 mt-2 text-center">{label}</span>
    </div>
  );
}

export default function TemplateGauges({
  operational,
  safety,
  ethics,
  sustainability
}: TemplateGaugesProps) {
  const gauges = [
    { label: 'Operational', value: operational, color: '#00f5ff', icon: TrendingUp },
    { label: 'Safety', value: safety, color: '#ef4444', icon: Shield },
    { label: 'Ethics', value: ethics, color: '#8b5cf6', icon: Scale },
    { label: 'Sustainability', value: sustainability, color: '#10b981', icon: Leaf }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-xl p-4"
    >
      <h3 className="text-sm font-semibold text-white mb-4">Template Usage</h3>
      <div className="flex items-center justify-around">
        {gauges.map((gauge, index) => (
          <motion.div
            key={gauge.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <TemplateGauge {...gauge} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
