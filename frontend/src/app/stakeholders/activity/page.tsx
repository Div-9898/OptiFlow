'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { useExecutiveStore } from '@/stores/executiveStore';
import {
  ArrowLeft,
  Activity,
  Truck,
  AlertTriangle,
  CheckCircle,
  Shield,
  Scale,
  Brain,
  Route,
  Package,
  Filter,
  Clock,
  TrendingUp,
  BarChart3,
  Zap,
  Bell,
  Eye,
  Pause,
  Play
} from 'lucide-react';

// Activity types config
const typeConfig = {
  delivery: { icon: Package, color: '#10b981', label: 'Delivery' },
  alert: { icon: AlertTriangle, color: '#ef4444', label: 'Alert' },
  optimization: { icon: Route, color: '#3b82f6', label: 'Optimization' },
  risk: { icon: Shield, color: '#f59e0b', label: 'Risk' },
  fairness: { icon: Scale, color: '#8b5cf6', label: 'Fairness' },
  ethics: { icon: Brain, color: '#ec4899', label: 'Ethics' },
  vehicle: { icon: Truck, color: '#00f5ff', label: 'Vehicle' }
};

const priorityConfig = {
  low: { color: '#6b7280', pulse: false, label: 'Low' },
  medium: { color: '#3b82f6', pulse: false, label: 'Medium' },
  high: { color: '#f59e0b', pulse: true, label: 'High' },
  critical: { color: '#ef4444', pulse: true, label: 'Critical' }
};

interface ActivityItem {
  id: string;
  timestamp: Date;
  type: keyof typeof typeConfig;
  title: string;
  description: string;
  priority: keyof typeof priorityConfig;
}

// Activity templates
const activityTemplates = [
  { type: 'delivery' as const, title: 'Delivery Completed', desc: 'Order #{{id}} delivered to {{location}}', priority: 'low' as const },
  { type: 'delivery' as const, title: 'Delivery En Route', desc: 'Vehicle {{vehicle}} departed for {{location}}', priority: 'low' as const },
  { type: 'optimization' as const, title: 'Route Optimized', desc: 'Saved {{savings}}km on {{vehicle}} route', priority: 'medium' as const },
  { type: 'alert' as const, title: 'Traffic Congestion', desc: 'Heavy traffic detected on Route {{route}}', priority: 'high' as const },
  { type: 'risk' as const, title: 'Risk Score Update', desc: '{{vehicle}} risk score changed to {{score}}', priority: 'medium' as const },
  { type: 'risk' as const, title: 'Driver Fatigue Alert', desc: 'Driver {{driver}} showing fatigue signs', priority: 'critical' as const },
  { type: 'fairness' as const, title: 'Coverage Gap Detected', desc: '{{zone}} below target coverage ({{coverage}}%)', priority: 'high' as const },
  { type: 'fairness' as const, title: 'Workload Balanced', desc: 'Distribution optimized for {{drivers}} drivers', priority: 'low' as const },
  { type: 'ethics' as const, title: 'Decision Logged', desc: 'Scenario "{{scenario}}" resolved with {{score}}% consensus', priority: 'medium' as const },
  { type: 'vehicle' as const, title: 'Maintenance Due', desc: '{{vehicle}} scheduled for service', priority: 'medium' as const },
];

const locations = ['Dubai Marina', 'Downtown Dubai', 'JBR', 'Palm Jumeirah', 'Business Bay', 'Al Quoz', 'Deira'];
const vehicles = ['Alpha-01', 'Alpha-02', 'Beta-03', 'Beta-05', 'Gamma-07'];
const drivers = ['Ahmed K.', 'Sarah M.', 'Raj P.', 'Omar H.', 'Fatima A.'];

function generateActivity(): ActivityItem {
  const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
  const id = Math.random().toString(36).substring(7).toUpperCase();
  let description = template.desc
    .replace('{{id}}', Math.floor(Math.random() * 9000 + 1000).toString())
    .replace('{{location}}', locations[Math.floor(Math.random() * locations.length)])
    .replace('{{vehicle}}', vehicles[Math.floor(Math.random() * vehicles.length)])
    .replace('{{savings}}', (Math.random() * 15 + 5).toFixed(1))
    .replace('{{route}}', `R-${Math.floor(Math.random() * 20 + 1)}`)
    .replace('{{score}}', (Math.random() * 40 + 20).toFixed(0))
    .replace('{{driver}}', drivers[Math.floor(Math.random() * drivers.length)])
    .replace('{{zone}}', locations[Math.floor(Math.random() * locations.length)])
    .replace('{{coverage}}', (Math.random() * 20 + 60).toFixed(0))
    .replace('{{drivers}}', Math.floor(Math.random() * 10 + 5).toString())
    .replace('{{scenario}}', 'Resource Allocation');

  return { id, timestamp: new Date(), type: template.type, title: template.title, description, priority: template.priority };
}

// Activity card
function ActivityCard({ activity, isNew }: { activity: ActivityItem; isNew: boolean }) {
  const config = typeConfig[activity.type];
  const prioConfig = priorityConfig[activity.priority];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      className="p-4 rounded-xl mb-3"
      style={{
        background: isNew ? `${config.color}10` : 'rgba(255,255,255,0.03)',
        borderLeft: `4px solid ${config.color}`,
        border: `1px solid ${config.color}20`
      }}
    >
      <div className="flex items-start gap-3">
        <div className="relative">
          <div className="p-2 rounded-lg" style={{ backgroundColor: `${config.color}20` }}>
            <Icon className="w-5 h-5" style={{ color: config.color }} />
          </div>
          {prioConfig.pulse && (
            <motion.div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ backgroundColor: prioConfig.color }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-white">{activity.title}</p>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase" style={{ backgroundColor: `${prioConfig.color}20`, color: prioConfig.color }}>
              {prioConfig.label}
            </span>
          </div>
          <p className="text-sm text-gray-400">{activity.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-gray-500">{activity.timestamp.toLocaleTimeString()}</span>
            <span className="text-[10px] text-gray-600 uppercase">{config.label}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Analytics mini chart
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((val, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t"
          style={{ backgroundColor: color }}
          initial={{ height: 0 }}
          animate={{ height: `${(val / max) * 100}%` }}
          transition={{ delay: i * 0.05 }}
        />
      ))}
    </div>
  );
}

// Stat card
function StatCard({ icon: Icon, label, value, color, subtext }: { icon: React.ElementType; label: string; value: string; color: string; subtext?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}20` }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-xs text-gray-400">{label}</span>
      </div>
      <p className="text-2xl font-bold font-mono" style={{ color }}>{value}</p>
      {subtext && <p className="text-[10px] text-gray-500 mt-1">{subtext}</p>}
    </motion.div>
  );
}

export default function ActivityStreamPage() {
  const router = useRouter();
  const { metrics } = useExecutiveStore();
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);

  // Initialize activities
  useEffect(() => {
    const initial: ActivityItem[] = [];
    for (let i = 0; i < 15; i++) {
      const activity = generateActivity();
      activity.timestamp = new Date(Date.now() - (i * 30000));
      initial.push(activity);
    }
    setActivities(initial);
    setIsLoading(false);
  }, []);

  // Generate new activities
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActivities(prev => [generateActivity(), ...prev.slice(0, 49)]);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Analytics data
  const hourlyActivity = [12, 18, 24, 15, 22, 28, 32, 25, 30, 35, 28, 24];
  const typeDistribution = Object.keys(typeConfig).map(type => ({
    type,
    count: activities.filter(a => a.type === type).length,
    ...typeConfig[type as keyof typeof typeConfig]
  }));

  const criticalCount = activities.filter(a => a.priority === 'critical').length;
  const highCount = activities.filter(a => a.priority === 'high').length;
  const filteredActivities = filter ? activities.filter(a => a.type === filter) : activities;

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#050a12]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <motion.div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
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
                <motion.div className="p-3 rounded-xl bg-purple-500/20" animate={{ boxShadow: ['0 0 20px rgba(139, 92, 246, 0.3)', '0 0 40px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(139, 92, 246, 0.3)'] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Activity className="w-6 h-6 text-purple-400" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Activity Stream</h1>
                  <p className="text-sm text-gray-500">Real-time operations feed & analytics</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {criticalCount > 0 && (
                <motion.div className="px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <span className="text-sm font-bold text-red-400">{criticalCount} Critical</span>
                </motion.div>
              )}
              <button onClick={() => setIsPaused(!isPaused)} className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${isPaused ? 'bg-white/10 text-gray-400' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                <span className="text-sm font-bold">{isPaused ? 'PAUSED' : 'LIVE'}</span>
              </button>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-4">
            <StatCard icon={Bell} label="Total Events" value={activities.length.toString()} color="#8b5cf6" subtext="Last hour" />
            <StatCard icon={AlertTriangle} label="Critical" value={criticalCount.toString()} color="#ef4444" subtext="Needs attention" />
            <StatCard icon={Zap} label="High Priority" value={highCount.toString()} color="#f59e0b" subtext="Active alerts" />
            <StatCard icon={CheckCircle} label="Resolved" value={Math.floor(activities.length * 0.7).toString()} color="#10b981" subtext="Auto-handled" />
            <StatCard icon={Clock} label="Avg Response" value="2.3s" color="#00f5ff" subtext="System response" />
          </div>

          {/* Analytics Row */}
          <div className="grid grid-cols-3 gap-6">
            {/* Hourly Activity */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl p-5" style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white">Hourly Activity</span>
              </div>
              <MiniBarChart data={hourlyActivity} color="#8b5cf6" />
              <div className="flex justify-between mt-2 text-[9px] text-gray-500">
                <span>12h ago</span><span>Now</span>
              </div>
            </motion.div>

            {/* Type Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-2xl p-5 col-span-2" style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid rgba(100, 200, 255, 0.1)' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-white">Event Types</span>
                </div>
                {filter && (
                  <button onClick={() => setFilter(null)} className="text-xs text-cyan-400 hover:underline">Clear Filter</button>
                )}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {typeDistribution.map((item) => {
                  const Icon = item.icon;
                  const isActive = filter === item.type;
                  return (
                    <button key={item.type} onClick={() => setFilter(isActive ? null : item.type)} className={`p-3 rounded-xl text-center transition-all ${isActive ? 'ring-2 ring-cyan-400' : ''}`} style={{ backgroundColor: `${item.color}15`, border: isActive ? `2px solid ${item.color}` : 'none' }}>
                      <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: item.color }} />
                      <p className="text-lg font-bold text-white">{item.count}</p>
                      <p className="text-[8px] text-gray-500 uppercase">{item.label}</p>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Activity Feed */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-5" style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white">Live Feed</span>
                {filter && <span className="px-2 py-0.5 rounded text-xs bg-cyan-500/20 text-cyan-400">Filtered: {filter}</span>}
              </div>
              <span className="text-xs text-gray-500">{filteredActivities.length} events</span>
            </div>
            <div className="max-h-[500px] overflow-y-auto pr-2">
              <AnimatePresence mode="popLayout">
                {filteredActivities.slice(0, 20).map((activity, i) => (
                  <ActivityCard key={activity.id} activity={activity} isNew={i === 0 && !isPaused} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
