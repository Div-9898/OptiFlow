'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { useExecutiveStore } from '@/stores/executiveStore';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Fuel,
  Clock,
  Wrench,
  Route,
  BarChart3,
  Target,
  Zap,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Percent
} from 'lucide-react';

// Animated currency counter
function AnimatedCurrency({ value, prefix = '$' }: { value: number; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();
    const duration = 2000;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (endValue - startValue) * easeOut;
      setDisplayValue(current);
      if (progress < 1) requestAnimationFrame(animate);
      else previousValue.current = endValue;
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

// Large bar chart
function BarChart({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end gap-3 h-48">
      {data.map((item, i) => (
        <div key={item.label} className="flex-1 flex flex-col items-center">
          <motion.div
            className="w-full rounded-t-lg relative overflow-hidden"
            style={{ backgroundColor: `${color}30` }}
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / max) * 160}px` }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
          >
            <motion.div
              className="absolute bottom-0 left-0 right-0"
              style={{ background: `linear-gradient(to top, ${color}, ${color}80)` }}
              initial={{ height: 0 }}
              animate={{ height: '100%' }}
              transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow">${(item.value / 1000).toFixed(0)}K</span>
            </div>
          </motion.div>
          <span className="text-[10px] text-gray-500 mt-2 text-center">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Stacked horizontal bar
function StackedBar({ items }: { items: { label: string; value: number; color: string; icon: React.ElementType }[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      <div className="h-8 rounded-full overflow-hidden flex bg-white/5">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ width: 0 }}
            animate={{ width: `${(item.value / total) * 100}%` }}
            transition={{ duration: 1, delay: i * 0.2 }}
            className="h-full relative group"
            style={{ backgroundColor: item.color }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded" style={{ backgroundColor: `${item.color}20` }}>
                  <Icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>
              <p className="text-lg font-bold font-mono" style={{ color: item.color }}>
                ${(item.value / 1000).toFixed(1)}K
              </p>
              <p className="text-[10px] text-gray-500">{((item.value / total) * 100).toFixed(1)}% of total</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Line chart with area fill
function AreaChart({ data, color, height = 120 }: { data: number[]; color: string; height?: number }) {
  const width = 600;
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.9;
  const range = max - min;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 20) - 10;
    return { x, y, val };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `M 0 ${height} ${points.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${width} ${height} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`area-gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="line-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <motion.path d={areaD} fill={`url(#area-gradient-${color.replace('#', '')})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} />
      <motion.path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" filter="url(#line-glow)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2 }} />
      {points.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r="4" fill={color} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }} />
      ))}
    </svg>
  );
}

// KPI Card
function KPICard({ icon: Icon, label, value, subvalue, color, trend, delay }: { icon: React.ElementType; label: string; value: string; subvalue?: string; color: string; trend?: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="p-5 rounded-2xl"
      style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: `1px solid ${color}20` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trend >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3 text-green-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
            <span className={`text-xs font-bold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>{trend >= 0 ? '+' : ''}{trend}%</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-bold font-mono" style={{ color, textShadow: `0 0 30px ${color}40` }}>{value}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{label}</p>
      {subvalue && <p className="text-[10px] text-gray-600 mt-1">{subvalue}</p>}
    </motion.div>
  );
}

export default function FinancialImpactPage() {
  const router = useRouter();
  const { metrics, syncFromStores } = useExecutiveStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    syncFromStores();
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, [syncFromStores]);

  // Derived financial data
  const totalSavings = metrics.costSavingsYTD;
  const savingsTarget = 350000;
  const fuelSavings = Math.round(totalSavings * 0.31);
  const timeSavings = Math.round(totalSavings * 0.236);
  const maintenanceSavings = Math.round(totalSavings * 0.158);
  const routeOptimizationSavings = Math.round(totalSavings * 0.296);
  const projectedAnnual = Math.round(totalSavings * 1.48);
  const savingsProgress = (totalSavings / savingsTarget) * 100;

  const monthlyData = [
    { label: 'Jan', value: 18500 },
    { label: 'Feb', value: 21200 },
    { label: 'Mar', value: 19800 },
    { label: 'Apr', value: 24500 },
    { label: 'May', value: 26200 },
    { label: 'Jun', value: 28400 },
    { label: 'Jul', value: 32100 },
    { label: 'Aug', value: 35200 },
    { label: 'Sep', value: 38900 },
    { label: 'Oct', value: 41200 },
    { label: 'Nov', value: 43800 },
    { label: 'Dec', value: 46000 },
  ];

  const quarterlyTrend = [45200, 70500, 106200, 131000];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#050a12]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <motion.div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050a12] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/stakeholders')} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="flex items-center gap-3">
                <motion.div className="p-3 rounded-xl bg-green-500/20" animate={{ boxShadow: ['0 0 20px rgba(16, 185, 129, 0.3)', '0 0 40px rgba(16, 185, 129, 0.5)', '0 0 20px rgba(16, 185, 129, 0.3)'] }} transition={{ duration: 2, repeat: Infinity }}>
                  <DollarSign className="w-6 h-6 text-green-400" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Financial Impact</h1>
                  <p className="text-sm text-gray-500">Cost savings & efficiency analytics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-green-400">Savings on Track</span>
            </div>
          </motion.div>

          {/* Hero Savings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl p-8 text-center" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(0, 245, 255, 0.05) 50%, rgba(139, 92, 246, 0.1) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-2">Total Savings Year-to-Date</p>
            <motion.div className="text-6xl font-bold font-mono text-green-400 mb-4" style={{ textShadow: '0 0 60px rgba(16, 185, 129, 0.5)' }}>
              <AnimatedCurrency value={totalSavings} />
            </motion.div>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-48 rounded-full bg-white/10 overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-green-500 to-cyan-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${Math.min(savingsProgress, 100)}%` }} transition={{ duration: 1.5 }} />
                </div>
                <span className="text-sm text-gray-400">{savingsProgress.toFixed(0)}% of ${(savingsTarget / 1000).toFixed(0)}K target</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-sm font-bold text-green-400">+23% vs last year</span>
              </div>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4">
            <KPICard icon={Target} label="Projected Annual" value={`$${(projectedAnnual / 1000).toFixed(0)}K`} subvalue="Based on current trajectory" color="#10b981" trend={18} delay={0.2} />
            <KPICard icon={Percent} label="Savings Rate" value={`${metrics.costSavingsPercent}%`} subvalue="Of total operational cost" color="#00f5ff" trend={5} delay={0.25} />
            <KPICard icon={Route} label="Route Efficiency" value={`${metrics.routeEfficiency}%`} subvalue="Optimized vs baseline" color="#8b5cf6" trend={12} delay={0.3} />
            <KPICard icon={Calendar} label="Monthly Avg" value={`$${(totalSavings / 12 / 1000).toFixed(1)}K`} subvalue="Per month this year" color="#f59e0b" trend={8} delay={0.35} />
          </div>

          {/* Savings Breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-6" style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div className="flex items-center gap-2 mb-6">
              <PiggyBank className="w-5 h-5 text-green-400" />
              <span className="text-lg font-semibold text-white">Savings Breakdown by Category</span>
            </div>
            <StackedBar items={[
              { label: 'Fuel Optimization', value: fuelSavings, color: '#f59e0b', icon: Fuel },
              { label: 'Time Efficiency', value: timeSavings, color: '#3b82f6', icon: Clock },
              { label: 'Maintenance', value: maintenanceSavings, color: '#8b5cf6', icon: Wrench },
              { label: 'Route Optimization', value: routeOptimizationSavings, color: '#10b981', icon: Route },
            ]} />
          </motion.div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl p-6" style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid rgba(0, 245, 255, 0.2)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  <span className="text-lg font-semibold text-white">Monthly Savings</span>
                </div>
                <span className="text-xs text-gray-500">2024 Fiscal Year</span>
              </div>
              <BarChart data={monthlyData} color="#00f5ff" />
            </motion.div>

            {/* Quarterly Trend */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="rounded-2xl p-6" style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span className="text-lg font-semibold text-white">Cumulative Growth</span>
                </div>
                <span className="text-xs text-gray-500">Quarterly Progress</span>
              </div>
              <AreaChart data={quarterlyTrend} color="#8b5cf6" height={180} />
              <div className="mt-4 grid grid-cols-4 gap-2">
                {['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => (
                  <div key={q} className="text-center">
                    <p className="text-sm font-bold text-white">${(quarterlyTrend[i] / 1000).toFixed(0)}K</p>
                    <p className="text-[10px] text-gray-500">{q}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ROI Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-lg font-semibold text-white">Return on AI Investment</span>
                </div>
                <p className="text-sm text-gray-400">Platform investment vs cost savings realized</p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold font-mono text-green-400">847%</p>
                <p className="text-xs text-gray-500">ROI This Year</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
