'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Shield,
  Scale,
  Brain,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useExecutiveStore } from '@/stores/executiveStore';

// Large animated counter
function BigCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  color
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  color: string;
}) {
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

  return (
    <span
      className="font-bold font-mono"
      style={{
        color,
        textShadow: `0 0 30px ${color}50`
      }}
    >
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
}

// Health gauge arc
function HealthArc({ value, color, size = 120 }: { value: number; color: string; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = radius * Math.PI * 1.5;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size * 0.75} className="overflow-visible">
      <defs>
        <filter id="health-arc-glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path
        d={`M ${6} ${size * 0.65} A ${radius} ${radius} 0 1 1 ${size - 6} ${size * 0.65}`}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <motion.path
        d={`M ${6} ${size * 0.65} A ${radius} ${radius} 0 1 1 ${size - 6} ${size * 0.65}`}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        filter="url(#health-arc-glow)"
      />
    </svg>
  );
}

export default function ExecutiveCommandHeader() {
  const { metrics, pendingDecisions } = useExecutiveStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate operational health from multiple metrics
  const operationalHealth = Math.round(
    (metrics.onTimeRate * 0.3) +
    ((100 - metrics.fleetRiskScore) * 0.25) +
    (metrics.overallFairness * 0.2) +
    (metrics.ethicalCompliance * 0.15) +
    (metrics.vehicleUtilization * 0.1)
  );

  const healthColor = operationalHealth > 80 ? '#10b981' : operationalHealth > 60 ? '#f59e0b' : '#ef4444';

  const quickStats = [
    {
      icon: Shield,
      label: 'Risk Level',
      value: metrics.fleetRiskScore,
      suffix: '',
      color: metrics.fleetRiskScore < 30 ? '#10b981' : metrics.fleetRiskScore < 50 ? '#f59e0b' : '#ef4444',
      status: metrics.fleetRiskScore < 30 ? 'Low' : metrics.fleetRiskScore < 50 ? 'Medium' : 'High'
    },
    {
      icon: Scale,
      label: 'Fairness',
      value: metrics.overallFairness,
      suffix: '%',
      color: '#8b5cf6',
      status: metrics.overallFairness >= 85 ? 'Good' : 'Warning'
    },
    {
      icon: Brain,
      label: 'Ethics',
      value: metrics.ethicalCompliance,
      suffix: '%',
      color: '#f59e0b',
      status: metrics.ethicalCompliance >= 90 ? 'Excellent' : 'Good'
    },
    {
      icon: Truck,
      label: 'Fleet',
      value: metrics.vehicleUtilization,
      suffix: '%',
      color: '#00f5ff',
      status: metrics.vehicleUtilization >= 80 ? 'Optimal' : 'Normal'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(10,15,25,0.98) 0%, rgba(15,20,35,0.98) 50%, rgba(10,15,25,0.98) 100%)',
        border: '1px solid rgba(100, 200, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 80px rgba(0, 245, 255, 0.08)'
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left - Main health indicator */}
          <div className="flex items-center gap-4">
            <div className="relative flex flex-col items-center">
              <HealthArc value={operationalHealth} color={healthColor} size={100} />
              <div className="absolute top-6 left-0 right-0 flex flex-col items-center">
                <span className="text-2xl font-bold">
                  <BigCounter value={operationalHealth} suffix="%" color={healthColor} />
                </span>
                <span className="text-[9px] text-gray-500 uppercase tracking-wider">
                  Health
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <h1 className="text-xl font-bold text-white">
                  Executive <span className="text-cyan-400">Command Center</span>
                </h1>
                <p className="text-xs text-gray-400">
                  AI-Powered Logistics Operations Overview
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Alerts badge */}
                {metrics.activeAlerts > 0 && (
                  <motion.div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">
                      {metrics.activeAlerts} Active Alerts
                    </span>
                  </motion.div>
                )}

                {/* Pending decisions */}
                {pendingDecisions.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/30">
                    <Clock className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-medium text-orange-400">
                      {pendingDecisions.length} Decisions Pending
                    </span>
                  </div>
                )}

                {/* All clear */}
                {metrics.activeAlerts === 0 && pendingDecisions.length === 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/15 border border-green-500/30">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">
                      All Systems Nominal
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center - Quick stats */}
          <div className="flex gap-3">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-xl text-center min-w-[85px]"
                  style={{
                    background: `${stat.color}08`,
                    border: `1px solid ${stat.color}20`
                  }}
                >
                  <div
                    className="p-1.5 rounded-lg mx-auto w-fit mb-1"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
                  </div>
                  <p
                    className="text-xl font-bold font-mono"
                    style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}30` }}
                  >
                    {Math.round(stat.value)}{stat.suffix}
                  </p>
                  <p className="text-[8px] text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p
                    className="text-[9px] font-medium"
                    style={{ color: stat.color }}
                  >
                    {stat.status}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Right - Time and cost savings */}
          <div className="text-right space-y-2">
            <div>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">System Time</p>
              <p className="text-xl font-mono text-white">
                {currentTime.toLocaleTimeString('en-US', { hour12: false })}
              </p>
              <p className="text-[10px] text-gray-500">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div
              className="p-3 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(0, 245, 255, 0.1) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}
            >
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">YTD Savings</p>
              <div className="flex items-center justify-end gap-1">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-xl font-bold font-mono text-green-400">
                  $<BigCounter value={metrics.costSavingsYTD / 1000} decimals={1} color="#10b981" />K
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
