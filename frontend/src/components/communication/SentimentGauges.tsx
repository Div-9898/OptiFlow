'use client';

import { motion } from 'framer-motion';
import { ThumbsUp, Minus, ThumbsDown } from 'lucide-react';

interface SentimentGaugesProps {
  positive: number;
  neutral: number;
  negative: number;
}

function SentimentGauge({
  label,
  value,
  icon: Icon,
  color
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string
}) {
  const circumference = 2 * Math.PI * 32;
  const strokeDashoffset = circumference - (value / 100) * circumference;

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
          <Icon className="w-4 h-4 mb-1" style={{ color }} />
          <motion.span
            className="text-sm font-bold font-mono"
            style={{ color }}
          >
            {value.toFixed(0)}%
          </motion.span>
        </div>
      </div>
      <span className="text-[10px] text-gray-400 mt-2">{label}</span>
    </div>
  );
}

export default function SentimentGauges({ positive, neutral, negative }: SentimentGaugesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-xl p-4"
    >
      <h3 className="text-sm font-semibold text-white mb-4">Sentiment Analysis</h3>
      <div className="flex items-center justify-around">
        <SentimentGauge
          label="Positive"
          value={positive}
          icon={ThumbsUp}
          color="#10b981"
        />
        <SentimentGauge
          label="Neutral"
          value={neutral}
          icon={Minus}
          color="#f59e0b"
        />
        <SentimentGauge
          label="Negative"
          value={negative}
          icon={ThumbsDown}
          color="#ef4444"
        />
      </div>

      {/* Summary bar */}
      <div className="mt-4 h-2 rounded-full overflow-hidden flex bg-dark-600">
        <motion.div
          className="h-full bg-green-500"
          initial={{ width: 0 }}
          animate={{ width: `${positive}%` }}
          transition={{ duration: 0.8 }}
        />
        <motion.div
          className="h-full bg-yellow-500"
          initial={{ width: 0 }}
          animate={{ width: `${neutral}%` }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />
        <motion.div
          className="h-full bg-red-500"
          initial={{ width: 0 }}
          animate={{ width: `${negative}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
}
