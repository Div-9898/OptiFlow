'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Network,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  Activity,
  Target,
  Zap,
  Shield
} from 'lucide-react';

interface StakeholderKPIDashboardProps {
  totalStakeholders: number;
  avgEngagement: number;
  policyImpacts: number;
  relationships: number;
  activeInteractions: number;
  satisfactionScore: number;
}

// Animated Counter Component
interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
}

function AnimatedCounter({ value, suffix = '', prefix = '', decimals = 0, duration = 1000 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();

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
  }, [value, duration]);

  return (
    <span className="font-mono tabular-nums">
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
}

// Sparkline Component
interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
  width?: number;
}

function Sparkline({ data, color, height = 24, width = 60 }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  // Calculate gradient based on trend
  const isUpward = data[data.length - 1] > data[0];
  const gradientId = `sparkline-gradient-${color.replace('#', '')}`;

  return (
    <svg width={width} height={height} className="opacity-80">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End point dot */}
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
        r="3"
        fill={color}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

// Trend Indicator Component
function TrendIndicator({ trend, color }: { trend: 'up' | 'down' | 'stable'; color: string }) {
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const bgColor = trend === 'up' ? 'rgba(16, 185, 129, 0.2)' : trend === 'down' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(156, 163, 175, 0.2)';
  const iconColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#9ca3af';

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className="p-1 rounded-full"
      style={{ backgroundColor: bgColor }}
    >
      <Icon className="w-3 h-3" style={{ color: iconColor }} />
    </motion.div>
  );
}

export default function StakeholderKPIDashboard({
  totalStakeholders,
  avgEngagement,
  policyImpacts,
  relationships,
  activeInteractions,
  satisfactionScore
}: StakeholderKPIDashboardProps) {
  // Historical data for sparklines (simulated real-time updates)
  const [sparklineData, setSparklineData] = useState({
    stakeholders: [6, 6, 7, 7, 7, 8, 8, 8, 8, 8],
    engagement: [72, 74, 73, 76, 78, 75, 79, 81, 80, avgEngagement],
    impacts: [2, 3, 3, 4, 4, 5, 5, 5, 5, policyImpacts],
    relationships: [65, 68, 70, 72, 71, 74, 76, 78, 77, relationships],
    interactions: [8, 9, 10, 11, 10, 12, 11, 12, 12, activeInteractions],
    satisfaction: [3.2, 3.4, 3.5, 3.6, 3.5, 3.7, 3.8, 3.6, 3.8, satisfactionScore]
  });

  // Calculate trends based on recent data
  const getTrend = (data: number[]): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlier = data.slice(-6, -3);
    const earlierAvg = earlier.length > 0 ? earlier.reduce((a, b) => a + b, 0) / earlier.length : avg;
    const diff = ((avg - earlierAvg) / earlierAvg) * 100;
    if (diff > 2) return 'up';
    if (diff < -2) return 'down';
    return 'stable';
  };

  // Update sparkline data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSparklineData(prev => ({
        stakeholders: [...prev.stakeholders.slice(1), totalStakeholders],
        engagement: [...prev.engagement.slice(1), avgEngagement + (Math.random() - 0.5) * 2],
        impacts: [...prev.impacts.slice(1), policyImpacts],
        relationships: [...prev.relationships.slice(1), relationships + (Math.random() - 0.5) * 3],
        interactions: [...prev.interactions.slice(1), activeInteractions + Math.floor((Math.random() - 0.5) * 2)],
        satisfaction: [...prev.satisfaction.slice(1), satisfactionScore + (Math.random() - 0.5) * 0.2]
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [totalStakeholders, avgEngagement, policyImpacts, relationships, activeInteractions, satisfactionScore]);

  const kpis = [
    {
      icon: Users,
      label: 'Stakeholders',
      value: totalStakeholders,
      suffix: '',
      decimals: 0,
      color: '#00f5ff',
      bgColor: 'rgba(0, 245, 255, 0.15)',
      sparkline: sparklineData.stakeholders,
      trend: getTrend(sparklineData.stakeholders)
    },
    {
      icon: Activity,
      label: 'Engagement',
      value: avgEngagement,
      suffix: '%',
      decimals: 0,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      sparkline: sparklineData.engagement,
      trend: getTrend(sparklineData.engagement)
    },
    {
      icon: FileText,
      label: 'Policy Impacts',
      value: policyImpacts,
      suffix: '',
      decimals: 0,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.15)',
      sparkline: sparklineData.impacts,
      trend: getTrend(sparklineData.impacts)
    },
    {
      icon: Network,
      label: 'Relationships',
      value: relationships,
      suffix: '%',
      decimals: 0,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      sparkline: sparklineData.relationships,
      trend: getTrend(sparklineData.relationships)
    },
    {
      icon: Zap,
      label: 'Interactions',
      value: activeInteractions,
      suffix: '',
      decimals: 0,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      sparkline: sparklineData.interactions,
      trend: getTrend(sparklineData.interactions)
    },
    {
      icon: Shield,
      label: 'Satisfaction',
      value: satisfactionScore,
      suffix: '/5',
      decimals: 1,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.15)',
      sparkline: sparklineData.satisfaction,
      trend: getTrend(sparklineData.satisfaction)
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{
        background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
        border: '1px solid rgba(100, 200, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div className="flex items-center gap-1 overflow-x-auto">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' }}
              className="flex items-center gap-3 px-4 py-2 rounded-xl transition-colors cursor-default min-w-fit"
            >
              <div
                className="p-2.5 rounded-xl relative"
                style={{
                  backgroundColor: kpi.bgColor,
                  boxShadow: `0 0 20px ${kpi.color}20`
                }}
              >
                <Icon className="w-4 h-4" style={{ color: kpi.color, filter: `drop-shadow(0 0 4px ${kpi.color})` }} />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider whitespace-nowrap">{kpi.label}</span>
                  <TrendIndicator trend={kpi.trend} color={kpi.color} />
                </div>
                <span
                  className="text-lg font-bold"
                  style={{ color: kpi.color, textShadow: `0 0 10px ${kpi.color}40` }}
                >
                  <AnimatedCounter value={kpi.value} suffix={kpi.suffix} decimals={kpi.decimals} />
                </span>
              </div>
              {kpi.sparkline && (
                <Sparkline data={kpi.sparkline} color={kpi.color} width={50} height={20} />
              )}
              {index < kpis.length - 1 && (
                <div className="w-px h-12 bg-gradient-to-b from-transparent via-gray-700 to-transparent ml-2" />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
