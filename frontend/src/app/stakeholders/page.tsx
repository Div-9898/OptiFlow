'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { useExecutiveStore } from '@/stores/executiveStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useRiskStore } from '@/stores/riskStore';
import { useOptimizationStore } from '@/stores/optimizationStore';
import {
  ExecutiveCommandHeader,
  OperationalMetricsGrid,
} from '@/components/stakeholders';
import {
  Navigation,
  DollarSign,
  Activity,
  Gavel,
  ChevronRight,
  Truck,
  TrendingUp,
  AlertTriangle,
  Clock,
  Zap,
  BarChart3,
  PieChart,
  Target
} from 'lucide-react';

// Background particle effect for premium feel
function BackgroundParticles() {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; duration: number }>>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 20 + 10
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-cyan-500/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

// Navigation card with preview stats
function NavigationCard({
  title,
  description,
  icon: Icon,
  color,
  href,
  stats,
  delay
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  href: string;
  stats: { label: string; value: string; trend?: 'up' | 'down' | 'stable' }[];
  delay: number;
}) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -5 }}
      onClick={() => router.push(href)}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
      style={{
        background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
        border: `1px solid ${color}30`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 60px ${color}10`
      }}
    >
      {/* Animated border glow on hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${color}20 0%, transparent 50%, ${color}20 100%)`,
          border: `1px solid ${color}50`
        }}
      />

      {/* Header */}
      <div className="relative p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              className="p-3 rounded-xl"
              style={{ backgroundColor: `${color}20` }}
              animate={{
                boxShadow: [`0 0 20px ${color}30`, `0 0 40px ${color}50`, `0 0 20px ${color}30`]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icon className="w-6 h-6" style={{ color }} />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>
          <motion.div
            className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors"
            whileHover={{ x: 5 }}
          >
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </motion.div>
        </div>
      </div>

      {/* Stats preview */}
      <div className="relative p-5">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: delay + 0.1 + i * 0.05 }}
              className="text-center"
            >
              <p className="text-2xl font-bold font-mono" style={{ color }}>
                {stat.value}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-1">
                {stat.label}
              </p>
              {stat.trend && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  {stat.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-400" />}
                  {stat.trend === 'down' && <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />}
                  <span className={`text-[9px] ${stat.trend === 'up' ? 'text-green-400' : stat.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                    {stat.trend === 'up' ? 'Improving' : stat.trend === 'down' ? 'Declining' : 'Stable'}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Mini visualization */}
        <div className="mt-4 h-12 flex items-end gap-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="flex-1 rounded-t"
              style={{ backgroundColor: `${color}40` }}
              initial={{ height: 0 }}
              animate={{ height: `${Math.random() * 100}%` }}
              transition={{ delay: delay + 0.3 + i * 0.02, duration: 0.5 }}
            />
          ))}
        </div>
      </div>

      {/* Floating particles on hover */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ backgroundColor: color, left: `${20 + i * 15}%`, bottom: 0 }}
            animate={{ y: [-10, -50], opacity: [0.8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Quick summary widget
function QuickSummaryWidget({ metrics }: { metrics: any }) {
  const summaryItems = [
    { icon: Truck, label: 'Active Fleet', value: `${metrics.activeVehicles}/${metrics.totalVehicles}`, color: '#00f5ff' },
    { icon: Target, label: 'On-Time Rate', value: `${Math.round(metrics.onTimeRate)}%`, color: '#10b981' },
    { icon: AlertTriangle, label: 'Risk Score', value: `${metrics.fleetRiskScore}`, color: metrics.fleetRiskScore < 30 ? '#10b981' : '#f59e0b' },
    { icon: DollarSign, label: 'Savings YTD', value: `$${(metrics.costSavingsYTD / 1000).toFixed(0)}K`, color: '#10b981' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="grid grid-cols-4 gap-4"
    >
      {summaryItems.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 + i * 0.1 }}
          className="p-4 rounded-xl text-center"
          style={{
            background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
            border: `1px solid ${item.color}20`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.3)`
          }}
        >
          <item.icon className="w-5 h-5 mx-auto mb-2" style={{ color: item.color }} />
          <p className="text-xl font-bold font-mono" style={{ color: item.color }}>{item.value}</p>
          <p className="text-[9px] text-gray-500 uppercase tracking-wider">{item.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function StakeholdersPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Connect to stores
  const { metrics, pendingDecisions, syncFromStores } = useExecutiveStore();

  // Sync data from other stores on mount and periodically
  useEffect(() => {
    syncFromStores();
    const syncInterval = setInterval(() => {
      syncFromStores();
    }, 5000);
    return () => clearInterval(syncInterval);
  }, [syncFromStores]);

  // Simulate initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const navigationCards = [
    {
      title: 'Fleet Operations',
      description: 'Real-time vehicle tracking & performance',
      icon: Navigation,
      color: '#00f5ff',
      href: '/stakeholders/fleet',
      stats: [
        { label: 'Active Vehicles', value: `${metrics.activeVehicles}`, trend: 'up' as const },
        { label: 'Deliveries', value: `${metrics.completedDeliveries}/${metrics.totalDeliveries}`, trend: 'up' as const },
        { label: 'Utilization', value: `${metrics.vehicleUtilization}%`, trend: 'stable' as const },
      ]
    },
    {
      title: 'Financial Impact',
      description: 'Cost savings & efficiency analytics',
      icon: DollarSign,
      color: '#10b981',
      href: '/stakeholders/financial',
      stats: [
        { label: 'YTD Savings', value: `$${(metrics.costSavingsYTD / 1000).toFixed(0)}K`, trend: 'up' as const },
        { label: 'Savings Rate', value: `${metrics.costSavingsPercent}%`, trend: 'up' as const },
        { label: 'Efficiency', value: `${metrics.routeEfficiency}%`, trend: 'up' as const },
      ]
    },
    {
      title: 'Activity Stream',
      description: 'Live operations feed & alerts',
      icon: Activity,
      color: '#8b5cf6',
      href: '/stakeholders/activity',
      stats: [
        { label: 'Active Alerts', value: `${metrics.activeAlerts}`, trend: metrics.activeAlerts > 2 ? 'down' as const : 'stable' as const },
        { label: 'Critical', value: `${metrics.criticalAlerts}`, trend: 'stable' as const },
        { label: 'Events/Hr', value: '24', trend: 'up' as const },
      ]
    },
    {
      title: 'Decision Center',
      description: 'Pending executive actions & AI insights',
      icon: Gavel,
      color: '#f59e0b',
      href: '/stakeholders/decisions',
      stats: [
        { label: 'Pending', value: `${pendingDecisions.length}`, trend: pendingDecisions.length > 2 ? 'down' as const : 'stable' as const },
        { label: 'Urgent', value: `${pendingDecisions.filter(d => d.urgency === 'immediate').length}`, trend: 'stable' as const },
        { label: 'AI Ready', value: '100%', trend: 'up' as const },
      ]
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#050a12]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.div
              className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-cyan-400 text-sm font-medium">Loading Executive Command Center...</p>
            <p className="text-gray-500 text-xs mt-2">Aggregating operational data...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#050a12] overflow-hidden">
      <Sidebar />

      <main className="flex-1 overflow-y-auto relative">
        <BackgroundParticles />

        {/* Main content */}
        <div className="relative z-10 p-6 space-y-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ExecutiveCommandHeader />
          </motion.div>

          {/* Quick Summary */}
          <QuickSummaryWidget metrics={metrics} />

          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-3 pt-4"
          >
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-widest">
              Command Modules
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          </motion.div>

          {/* Navigation Cards Grid */}
          <div className="grid grid-cols-2 gap-6">
            {navigationCards.map((card, index) => (
              <NavigationCard
                key={card.title}
                {...card}
                delay={0.6 + index * 0.1}
              />
            ))}
          </div>

          {/* Footer spacer */}
          <div className="h-6" />
        </div>
      </main>
    </div>
  );
}
