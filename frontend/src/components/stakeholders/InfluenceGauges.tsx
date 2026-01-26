'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Target, Users, Network, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

interface InfluenceGaugesProps {
  avgPower: number;
  avgInterest: number;
  avgInfluence: number;
  networkDensity: number;
}

// Animated counter for smooth value transitions
function AnimatedValue({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();
    const duration = 800;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
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

  return <>{displayValue.toFixed(decimals)}</>;
}

function InfluenceGauge({
  label,
  value,
  color,
  icon: Icon,
  trend,
  isHighlighted
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'stable';
  isHighlighted: boolean;
}) {
  const circumference = 2 * Math.PI * 36;
  const percentage = value;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const glowIntensity = percentage > 80 ? '8' : percentage > 60 ? '6' : '4';

  // Inner ring for baseline comparison
  const baselineValue = 70;
  const baselineOffset = circumference - (baselineValue / 100) * circumference;

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280';

  return (
    <motion.div
      className="flex flex-col items-center"
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="relative w-24 h-24">
        {/* SVG with glow filter */}
        <svg className="w-full h-full transform -rotate-90">
          <defs>
            <filter id={`gauge-glow-${color.replace('#', '')}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={glowIntensity} result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id={`gauge-gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="1" />
              <stop offset="100%" stopColor={color} stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <circle
            cx="48"
            cy="48"
            r="36"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />

          {/* Baseline indicator (dashed) */}
          <circle
            cx="48"
            cy="48"
            r="36"
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="2"
            strokeDasharray="4 4"
            strokeDashoffset={baselineOffset}
            opacity="0.5"
          />

          {/* Main progress ring with glow */}
          <motion.circle
            cx="48"
            cy="48"
            r="36"
            fill="none"
            stroke={`url(#gauge-gradient-${color.replace('#', '')})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            filter={`url(#gauge-glow-${color.replace('#', '')})`}
          />

          {/* Pulsing outer ring for highlighted values */}
          {isHighlighted && (
            <motion.circle
              cx="48"
              cy="48"
              r="42"
              fill="none"
              stroke={color}
              strokeWidth="1"
              opacity="0.4"
              animate={{
                r: [42, 44, 42],
                opacity: [0.4, 0.2, 0.4]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="p-1.5 rounded-lg mb-1"
            style={{
              backgroundColor: `${color}20`,
              boxShadow: `0 0 12px ${color}30`
            }}
          >
            <Icon className="w-4 h-4" style={{ color, filter: `drop-shadow(0 0 4px ${color})` }} />
          </div>
          <motion.span
            className="text-lg font-bold font-mono"
            style={{ color, textShadow: `0 0 8px ${color}50` }}
          >
            <AnimatedValue value={percentage} />%
          </motion.span>
        </div>

        {/* Trend indicator badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 p-1 rounded-full"
          style={{ backgroundColor: `${trendColor}30`, border: `1px solid ${trendColor}50` }}
        >
          <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
        </motion.div>
      </div>

      <span className="text-[11px] text-gray-400 mt-3 text-center font-medium">{label}</span>
    </motion.div>
  );
}

export default function InfluenceGauges({
  avgPower,
  avgInterest,
  avgInfluence,
  networkDensity
}: InfluenceGaugesProps) {
  // Track historical values for trend calculation
  const [history, setHistory] = useState({
    power: [avgPower],
    interest: [avgInterest],
    influence: [avgInfluence],
    density: [networkDensity]
  });

  useEffect(() => {
    setHistory(prev => ({
      power: [...prev.power.slice(-5), avgPower],
      interest: [...prev.interest.slice(-5), avgInterest],
      influence: [...prev.influence.slice(-5), avgInfluence],
      density: [...prev.density.slice(-5), networkDensity]
    }));
  }, [avgPower, avgInterest, avgInfluence, networkDensity]);

  const getTrend = (data: number[]): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable';
    const diff = data[data.length - 1] - data[0];
    if (diff > 2) return 'up';
    if (diff < -2) return 'down';
    return 'stable';
  };

  const gauges = [
    {
      label: 'Avg Power',
      value: avgPower,
      color: '#ef4444',
      icon: Zap,
      trend: getTrend(history.power),
      isHighlighted: avgPower > 75
    },
    {
      label: 'Avg Interest',
      value: avgInterest,
      color: '#3b82f6',
      icon: Target,
      trend: getTrend(history.interest),
      isHighlighted: avgInterest > 75
    },
    {
      label: 'Avg Influence',
      value: avgInfluence,
      color: '#8b5cf6',
      icon: Sparkles,
      trend: getTrend(history.influence),
      isHighlighted: avgInfluence > 75
    },
    {
      label: 'Network Density',
      value: networkDensity,
      color: '#00f5ff',
      icon: Network,
      trend: getTrend(history.density),
      isHighlighted: networkDensity > 50
    }
  ];

  // Calculate overall health score
  const healthScore = Math.round((avgPower + avgInterest + avgInfluence + networkDensity) / 4);
  const healthColor = healthScore > 70 ? '#10b981' : healthScore > 50 ? '#f59e0b' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{
        background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
        border: '1px solid rgba(100, 200, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-purple" style={{ filter: 'drop-shadow(0 0 4px #8b5cf6)' }} />
          Influence Metrics
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Health Score</span>
          <motion.div
            className="px-2.5 py-1 rounded-full font-bold text-xs font-mono"
            style={{
              backgroundColor: `${healthColor}20`,
              color: healthColor,
              boxShadow: `0 0 12px ${healthColor}30`,
              border: `1px solid ${healthColor}40`
            }}
            animate={{
              boxShadow: [`0 0 12px ${healthColor}30`, `0 0 20px ${healthColor}50`, `0 0 12px ${healthColor}30`]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {healthScore}%
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-around">
        {gauges.map((gauge, index) => (
          <motion.div
            key={gauge.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.15, type: 'spring', stiffness: 200 }}
          >
            <InfluenceGauge {...gauge} />
          </motion.div>
        ))}
      </div>

      {/* Bottom legend */}
      <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-gray-800/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-500" style={{ boxShadow: '0 0 4px rgba(255,255,255,0.3)' }} />
          <span className="text-[10px] text-gray-500">Baseline (70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#10b981' }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[10px] text-gray-500">Above Target</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-[10px] text-gray-500">Needs Attention</span>
        </div>
      </div>
    </motion.div>
  );
}
