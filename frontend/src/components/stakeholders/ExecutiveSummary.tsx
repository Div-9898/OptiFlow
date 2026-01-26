'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  Activity
} from 'lucide-react';

interface ExecutiveSummaryProps {
  totalStakeholders: number;
  overallHealth: number;
  engagementScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  criticalAlerts: number;
  opportunities: number;
  policyImpactScore?: number;
}

// Animated counter
function AnimatedValue({ value, decimals = 0, prefix = '', suffix = '' }: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();
    const duration = 1200;

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

  return <>{prefix}{displayValue.toFixed(decimals)}{suffix}</>;
}

// Large circular gauge
function HealthGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
        <defs>
          <filter id="health-glow">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="health-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="10"
        />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="url(#health-gradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          filter="url(#health-glow)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold font-mono"
          style={{ color, textShadow: `0 0 20px ${color}50` }}
        >
          <AnimatedValue value={value} />
        </motion.span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
}

export default function ExecutiveSummary({
  totalStakeholders,
  overallHealth,
  engagementScore,
  riskLevel,
  criticalAlerts,
  opportunities,
  policyImpactScore
}: ExecutiveSummaryProps) {
  const healthColor = overallHealth > 70 ? '#10b981' : overallHealth > 50 ? '#f59e0b' : '#ef4444';
  const riskColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444'
  };

  const summaryMetrics: Array<{
    icon: typeof Users;
    label: string;
    value: number;
    suffix: string;
    color: string;
    trend: 'up' | 'down' | 'stable';
    trendValue: string;
  }> = [
    {
      icon: Users,
      label: 'Active Stakeholders',
      value: totalStakeholders,
      suffix: '',
      color: '#00f5ff',
      trend: 'up',
      trendValue: '+2'
    },
    {
      icon: Activity,
      label: 'Engagement Score',
      value: engagementScore,
      suffix: '%',
      color: '#8b5cf6',
      trend: 'up',
      trendValue: '+5%'
    },
    {
      icon: AlertTriangle,
      label: 'Critical Alerts',
      value: criticalAlerts,
      suffix: '',
      color: criticalAlerts > 0 ? '#ef4444' : '#10b981',
      trend: criticalAlerts > 0 ? 'up' : 'stable',
      trendValue: criticalAlerts > 0 ? 'Action Required' : 'All Clear'
    },
    {
      icon: Sparkles,
      label: 'Opportunities',
      value: opportunities,
      suffix: '',
      color: '#10b981',
      trend: 'up',
      trendValue: '+3 new'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden mb-6"
      style={{
        background: 'linear-gradient(135deg, rgba(10,15,25,0.95) 0%, rgba(15,20,35,0.95) 50%, rgba(10,15,25,0.95) 100%)',
        border: '1px solid rgba(100, 200, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 80px rgba(0, 245, 255, 0.05)'
      }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          {/* Left side - Main health gauge */}
          <div className="flex items-center gap-8">
            <div className="relative">
              <HealthGauge value={overallHealth} label="Health Score" color={healthColor} />
              {/* Pulsing ring for critical health */}
              {overallHealth < 50 && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: `2px solid ${healthColor}` }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Stakeholder <span className="text-accent-cyan">Intelligence</span>
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Executive Dashboard Overview
                </p>
              </div>

              {/* Risk Level Indicator */}
              <div className="flex items-center gap-3">
                <div
                  className="px-4 py-2 rounded-lg flex items-center gap-2"
                  style={{
                    backgroundColor: `${riskColors[riskLevel]}15`,
                    border: `1px solid ${riskColors[riskLevel]}40`
                  }}
                >
                  <Shield className="w-4 h-4" style={{ color: riskColors[riskLevel] }} />
                  <span className="text-sm font-medium" style={{ color: riskColors[riskLevel] }}>
                    {riskLevel.toUpperCase()} RISK
                  </span>
                </div>

                {policyImpactScore !== undefined && (
                  <div
                    className="px-4 py-2 rounded-lg flex items-center gap-2"
                    style={{
                      backgroundColor: policyImpactScore > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `1px solid ${policyImpactScore > 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`
                    }}
                  >
                    <BarChart3
                      className="w-4 h-4"
                      style={{ color: policyImpactScore > 0 ? '#10b981' : '#ef4444' }}
                    />
                    <span
                      className="text-sm font-medium font-mono"
                      style={{ color: policyImpactScore > 0 ? '#10b981' : '#ef4444' }}
                    >
                      {policyImpactScore > 0 ? '+' : ''}{policyImpactScore}% Impact
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Quick metrics */}
          <div className="grid grid-cols-2 gap-4">
            {summaryMetrics.map((metric, index) => {
              const Icon = metric.icon;
              const TrendIcon = metric.trend === 'up' ? ArrowUpRight : metric.trend === 'down' ? ArrowDownRight : CheckCircle;

              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl min-w-[140px]"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className="p-1.5 rounded-lg"
                      style={{ backgroundColor: `${metric.color}15` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: metric.color }} />
                    </div>
                    <div
                      className="flex items-center gap-1 text-[10px]"
                      style={{ color: metric.trend === 'up' ? '#10b981' : metric.trend === 'down' ? '#ef4444' : '#6b7280' }}
                    >
                      <TrendIcon className="w-3 h-3" />
                      <span>{metric.trendValue}</span>
                    </div>
                  </div>
                  <p
                    className="text-2xl font-bold font-mono"
                    style={{ color: metric.color, textShadow: `0 0 15px ${metric.color}30` }}
                  >
                    <AnimatedValue value={metric.value} suffix={metric.suffix} />
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                    {metric.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10">
          <span className="text-xs text-gray-500">Quick Actions:</span>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/30 hover:bg-accent-cyan/30 transition-all"
          >
            Generate Report
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all"
          >
            Run Policy Simulation
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-all"
          >
            Schedule Review
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
