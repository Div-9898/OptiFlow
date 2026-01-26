'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  PiggyBank,
  Fuel,
  Clock,
  Wrench,
  BarChart3,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useExecutiveStore } from '@/stores/executiveStore';

// Animated counter with formatting
function AnimatedCurrency({ value, prefix = '$' }: { value: number; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();
    const duration = 1500;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
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

  const formatted = displayValue >= 1000000
    ? `${(displayValue / 1000000).toFixed(2)}M`
    : displayValue >= 1000
    ? `${(displayValue / 1000).toFixed(1)}K`
    : displayValue.toFixed(0);

  return <>{prefix}{formatted}</>;
}

// Sparkline chart
function Sparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkline-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="sparkline-glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#sparkline-gradient-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#sparkline-glow)"
      />
      <circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * (height - 8) - 4}
        r="4"
        fill={color}
        filter="url(#sparkline-glow)"
      />
    </svg>
  );
}

// Savings breakdown bar
function SavingsBar({
  items
}: {
  items: { label: string; value: number; color: string; icon: React.ElementType }[]
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-2">
      {/* Stacked bar */}
      <div className="h-3 rounded-full overflow-hidden flex bg-white/5">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ width: 0 }}
            animate={{ width: `${(item.value / total) * 100}%` }}
            transition={{ duration: 1, delay: i * 0.2 }}
            style={{ backgroundColor: item.color }}
            className="h-full"
          />
        ))}
      </div>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <Icon className="w-3 h-3" style={{ color: item.color }} />
              <span className="text-[10px] text-gray-400">{item.label}</span>
              <span className="text-[10px] font-mono text-white ml-auto">
                ${(item.value / 1000).toFixed(1)}K
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FinancialImpactPanel() {
  const { metrics } = useExecutiveStore();

  // Financial breakdown values derived from costSavingsYTD
  const totalSavings = metrics.costSavingsYTD;
  const savingsTarget = 350000;
  const fuelSavings = Math.round(totalSavings * 0.31); // 31% from fuel
  const timeSavings = Math.round(totalSavings * 0.236); // 23.6% from time
  const maintenanceSavings = Math.round(totalSavings * 0.158); // 15.8% from maintenance
  const routeOptimizationSavings = Math.round(totalSavings * 0.296); // 29.6% from routes
  const monthlyTrend = [18500, 21200, 19800, 24500, 26200, 28400, 32100, 35200];
  const projectedAnnual = Math.round(totalSavings * 1.48); // ~48% more projected

  const savingsProgress = (totalSavings / savingsTarget) * 100;
  const trendChange = ((monthlyTrend[monthlyTrend.length - 1] -
    monthlyTrend[monthlyTrend.length - 2]) /
    monthlyTrend[monthlyTrend.length - 2] * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden h-full"
      style={{
        background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(16, 185, 129, 0.05)'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-2 rounded-lg bg-green-500/20"
              animate={{
                boxShadow: ['0 0 15px rgba(16, 185, 129, 0.3)', '0 0 25px rgba(16, 185, 129, 0.5)', '0 0 15px rgba(16, 185, 129, 0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <PiggyBank className="w-5 h-5 text-green-400" />
            </motion.div>
            <div>
              <h3 className="text-base font-semibold text-white">Financial Impact</h3>
              <p className="text-[10px] text-gray-500">Cost savings & efficiency gains</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-green-400">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-sm font-bold">+{trendChange.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Main savings figure */}
        <div className="text-center py-4">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Savings YTD</p>
          <motion.div
            className="text-4xl font-bold font-mono"
            style={{
              color: '#10b981',
              textShadow: '0 0 30px rgba(16, 185, 129, 0.5)'
            }}
          >
            <AnimatedCurrency value={totalSavings} />
          </motion.div>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="h-2 w-32 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-green-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(savingsProgress, 100)}%` }}
                transition={{ duration: 1.5 }}
              />
            </div>
            <span className="text-[10px] text-gray-400">
              {savingsProgress.toFixed(0)}% of target
            </span>
          </div>
        </div>

        {/* Monthly trend sparkline */}
        <div className="p-3 rounded-xl bg-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] text-gray-400">Monthly Trend</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              <span className="text-[10px] text-green-400">Trending up</span>
            </div>
          </div>
          <Sparkline data={monthlyTrend} color="#10b981" />
        </div>

        {/* Savings breakdown */}
        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">Savings Breakdown</p>
          <SavingsBar
            items={[
              { label: 'Fuel', value: fuelSavings, color: '#f59e0b', icon: Fuel },
              { label: 'Time', value: timeSavings, color: '#3b82f6', icon: Clock },
              { label: 'Maintenance', value: maintenanceSavings, color: '#8b5cf6', icon: Wrench },
              { label: 'Routes', value: routeOptimizationSavings, color: '#10b981', icon: TrendingUp },
            ]}
          />
        </div>

        {/* Projected annual */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-gray-300">Projected Annual Savings</span>
            </div>
            <span className="text-lg font-bold font-mono text-green-400">
              <AnimatedCurrency value={projectedAnnual} />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
