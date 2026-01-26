'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Truck,
  AlertTriangle,
  CheckCircle,
  Shield,
  Scale,
  Brain,
  Route,
  Clock,
  Zap,
  Package,
  User,
  MapPin
} from 'lucide-react';

interface ActivityItem {
  id: string;
  timestamp: Date;
  type: 'delivery' | 'alert' | 'optimization' | 'risk' | 'fairness' | 'ethics' | 'vehicle';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, string | number>;
}

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
  low: { color: '#6b7280', pulse: false },
  medium: { color: '#3b82f6', pulse: false },
  high: { color: '#f59e0b', pulse: true },
  critical: { color: '#ef4444', pulse: true }
};

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
  { type: 'vehicle' as const, title: 'Maintenance Due', desc: '{{vehicle}} scheduled for service in {{days}} days', priority: 'medium' as const },
  { type: 'vehicle' as const, title: 'Vehicle Checkpoint', desc: '{{vehicle}} completed checkpoint at {{location}}', priority: 'low' as const },
];

const locations = ['Dubai Marina', 'Downtown Dubai', 'JBR', 'Palm Jumeirah', 'Business Bay', 'Al Quoz', 'Deira'];
const vehicles = ['Alpha-01', 'Alpha-02', 'Beta-03', 'Beta-05', 'Gamma-07'];
const drivers = ['Ahmed K.', 'Sarah M.', 'Raj P.', 'Omar H.', 'Fatima A.'];
const scenarios = ['Resource Allocation', 'Safety vs Deadline', 'Privacy Optimization', 'Service Expansion'];
const zones = ['Al Quoz', 'Industrial Area', 'Outer Districts'];

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
    .replace('{{zone}}', zones[Math.floor(Math.random() * zones.length)])
    .replace('{{coverage}}', (Math.random() * 20 + 60).toFixed(0))
    .replace('{{drivers}}', Math.floor(Math.random() * 10 + 5).toString())
    .replace('{{scenario}}', scenarios[Math.floor(Math.random() * scenarios.length)])
    .replace('{{days}}', Math.floor(Math.random() * 7 + 1).toString());

  return {
    id,
    timestamp: new Date(),
    type: template.type,
    title: template.title,
    description,
    priority: template.priority
  };
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

function ActivityCard({ activity, isNew }: { activity: ActivityItem; isNew: boolean }) {
  const config = typeConfig[activity.type];
  const prioConfig = priorityConfig[activity.priority];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-white/5"
      style={{
        borderLeft: `3px solid ${config.color}`,
        background: isNew ? `${config.color}10` : 'transparent'
      }}
    >
      <div className="relative mt-0.5">
        <div
          className="p-1.5 rounded-lg"
          style={{ backgroundColor: `${config.color}20` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
        </div>
        {prioConfig.pulse && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{ border: `1px solid ${prioConfig.color}` }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-white">{activity.title}</p>
          {activity.priority !== 'low' && (
            <span
              className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
              style={{
                backgroundColor: `${prioConfig.color}20`,
                color: prioConfig.color
              }}
            >
              {activity.priority}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">{activity.description}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-[10px] text-gray-500 font-mono">{formatTime(activity.timestamp)}</p>
        <p className="text-[8px] text-gray-600 uppercase">{config.label}</p>
      </div>
    </motion.div>
  );
}

export default function LiveActivityStream() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize with some activities
  useEffect(() => {
    const initial: ActivityItem[] = [];
    for (let i = 0; i < 8; i++) {
      const activity = generateActivity();
      activity.timestamp = new Date(Date.now() - (i * 30000)); // Stagger timestamps
      initial.push(activity);
    }
    setActivities(initial);
  }, []);

  // Generate new activities periodically
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setActivities(prev => {
        const newActivity = generateActivity();
        const updated = [newActivity, ...prev.slice(0, 19)]; // Keep last 20
        return updated;
      });
    }, 4000 + Math.random() * 3000); // Random interval 4-7 seconds

    return () => clearInterval(interval);
  }, [isPaused]);

  const criticalCount = activities.filter(a => a.priority === 'critical').length;
  const highCount = activities.filter(a => a.priority === 'high').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
        border: '1px solid rgba(100, 200, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-2 rounded-lg bg-cyan-500/20"
              animate={{
                boxShadow: ['0 0 10px rgba(0, 245, 255, 0.2)', '0 0 20px rgba(0, 245, 255, 0.4)', '0 0 10px rgba(0, 245, 255, 0.2)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Activity className="w-5 h-5 text-cyan-400" />
            </motion.div>
            <div>
              <h3 className="text-base font-semibold text-white">Live Activity Stream</h3>
              <p className="text-[10px] text-gray-500">Real-time operations feed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <motion.div
                className="px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <span className="text-[10px] font-bold text-red-400">{criticalCount} CRITICAL</span>
              </motion.div>
            )}
            {highCount > 0 && (
              <div className="px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
                <span className="text-[10px] font-bold text-orange-400">{highCount} HIGH</span>
              </div>
            )}
            <motion.button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-1 rounded-full text-[10px] font-medium transition-colors ${
                isPaused
                  ? 'bg-white/10 text-gray-400 border border-white/20'
                  : 'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isPaused ? 'PAUSED' : 'LIVE'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Activity list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2 space-y-1"
        style={{ maxHeight: '400px' }}
      >
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              isNew={index === 0}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-white/10 flex items-center justify-between">
        <p className="text-[10px] text-gray-500">
          Showing last {activities.length} activities
        </p>
        <div className="flex items-center gap-3">
          {Object.entries(typeConfig).slice(0, 4).map(([key, config]) => {
            const Icon = config.icon;
            const count = activities.filter(a => a.type === key).length;
            return (
              <div key={key} className="flex items-center gap-1">
                <Icon className="w-3 h-3" style={{ color: config.color }} />
                <span className="text-[10px] text-gray-400">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
