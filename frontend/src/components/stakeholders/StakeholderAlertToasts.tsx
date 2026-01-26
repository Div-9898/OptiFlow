'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Users,
  Handshake,
  FileWarning,
  Sparkles,
  X,
  Eye,
  Bell,
  Zap
} from 'lucide-react';

interface StakeholderAlert {
  id: string;
  type: 'sentiment_change' | 'relationship_shift' | 'policy_reaction' | 'engagement_drop' | 'opportunity';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  stakeholder?: string;
  timestamp: Date;
  progress: number;
}

const alertConfig = {
  sentiment_change: {
    icon: TrendingDown,
    label: 'Sentiment Change',
    criticalColor: '#ef4444',
    warningColor: '#f59e0b',
    infoColor: '#3b82f6'
  },
  relationship_shift: {
    icon: Handshake,
    label: 'Relationship Shift',
    criticalColor: '#ef4444',
    warningColor: '#f59e0b',
    infoColor: '#00f5ff'
  },
  policy_reaction: {
    icon: FileWarning,
    label: 'Policy Reaction',
    criticalColor: '#ef4444',
    warningColor: '#f59e0b',
    infoColor: '#8b5cf6'
  },
  engagement_drop: {
    icon: Users,
    label: 'Engagement Alert',
    criticalColor: '#ef4444',
    warningColor: '#f59e0b',
    infoColor: '#3b82f6'
  },
  opportunity: {
    icon: Sparkles,
    label: 'Opportunity',
    criticalColor: '#10b981',
    warningColor: '#10b981',
    infoColor: '#10b981'
  }
};

const sampleAlerts: Omit<StakeholderAlert, 'id' | 'timestamp' | 'progress'>[] = [
  {
    type: 'sentiment_change',
    severity: 'critical',
    title: 'Shareholder Sentiment Drop',
    message: 'Shareholders sentiment decreased by 15% following quarterly report',
    stakeholder: 'Shareholders'
  },
  {
    type: 'relationship_shift',
    severity: 'warning',
    title: 'Regulatory Relationship Weakening',
    message: 'Relationship strength with Regulators decreased to 65%',
    stakeholder: 'Regulatory Bodies'
  },
  {
    type: 'policy_reaction',
    severity: 'warning',
    title: 'Negative Policy Response',
    message: 'Drivers showing resistance to Efficiency Optimization policy',
    stakeholder: 'Delivery Drivers'
  },
  {
    type: 'engagement_drop',
    severity: 'info',
    title: 'Customer Engagement Dip',
    message: 'Customer engagement metrics dropped 5% this week',
    stakeholder: 'Customers'
  },
  {
    type: 'opportunity',
    severity: 'info',
    title: 'Partnership Opportunity',
    message: 'Technology Suppliers interested in expanded collaboration',
    stakeholder: 'Technology Suppliers'
  },
  {
    type: 'sentiment_change',
    severity: 'warning',
    title: 'Community Concerns Rising',
    message: 'Local community expressing concerns about traffic increase',
    stakeholder: 'Local Community'
  },
  {
    type: 'opportunity',
    severity: 'info',
    title: 'Competitive Advantage',
    message: 'Competitors struggling with delivery times - opportunity to gain market share',
    stakeholder: 'Competitors'
  }
];

export default function StakeholderAlertToasts() {
  const [alerts, setAlerts] = useState<StakeholderAlert[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Generate random alert
  const generateAlert = useCallback(() => {
    const randomAlert = sampleAlerts[Math.floor(Math.random() * sampleAlerts.length)];
    const newAlert: StakeholderAlert = {
      ...randomAlert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      progress: 100
    };
    return newAlert;
  }, []);

  // Add new alerts periodically
  useEffect(() => {
    // Initial alert after 3 seconds
    const initialTimer = setTimeout(() => {
      setAlerts(prev => [generateAlert(), ...prev].slice(0, 5));
    }, 3000);

    // Subsequent alerts every 20-40 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance to add alert
        setAlerts(prev => [generateAlert(), ...prev].slice(0, 5));
      }
    }, 25000 + Math.random() * 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [generateAlert]);

  // Auto-dismiss alerts with progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setAlerts(prev =>
        prev
          .map(alert => ({
            ...alert,
            progress: Math.max(0, alert.progress - 0.5)
          }))
          .filter(alert => alert.progress > 0)
      );
    }, 50);

    return () => clearInterval(progressInterval);
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getColor = (alert: StakeholderAlert) => {
    const config = alertConfig[alert.type];
    switch (alert.severity) {
      case 'critical':
        return config.criticalColor;
      case 'warning':
        return config.warningColor;
      default:
        return config.infoColor;
    }
  };

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-24 right-6 z-50 w-80">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center justify-between mb-3 px-3 py-2 rounded-lg bg-dark-800/90 backdrop-blur-sm border border-white/10"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Bell className="w-4 h-4 text-accent-cyan" style={{ filter: 'drop-shadow(0 0 4px #00f5ff)' }} />
          </motion.div>
          <span className="text-sm font-medium text-white">Stakeholder Alerts</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-accent-cyan/20 text-accent-cyan">
            {alerts.length}
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <Eye className="w-4 h-4 text-gray-400" />
        </button>
      </motion.div>

      {/* Alerts Stack */}
      <AnimatePresence>
        {!isMinimized && alerts.map((alert, index) => {
          const config = alertConfig[alert.type];
          const Icon = config.icon;
          const color = getColor(alert);

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="mb-2 rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, rgba(15,20,30,0.95) 0%, rgba(10,15,25,0.98) 100%)',
                border: `1px solid ${color}30`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 20px ${color}15`
              }}
            >
              {/* Alert content */}
              <div className="p-3">
                <div className="flex items-start gap-3">
                  {/* Icon with pulse effect for critical */}
                  <div className="relative">
                    <motion.div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${color}20` }}
                      animate={alert.severity === 'critical' ? {
                        boxShadow: [`0 0 0 0 ${color}40`, `0 0 0 8px ${color}00`]
                      } : {}}
                      transition={alert.severity === 'critical' ? {
                        duration: 1.5,
                        repeat: Infinity
                      } : {}}
                    >
                      <Icon
                        className="w-4 h-4"
                        style={{ color, filter: `drop-shadow(0 0 4px ${color})` }}
                      />
                    </motion.div>
                    {alert.severity === 'critical' && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider"
                        style={{ color }}
                      >
                        {config.label}
                      </span>
                      {alert.severity === 'critical' && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/20 text-red-400 uppercase">
                          Critical
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-white mb-1 truncate">
                      {alert.title}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {alert.message}
                    </p>
                    {alert.stakeholder && (
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ backgroundColor: `${color}15`, color }}
                        >
                          {alert.stakeholder}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dismiss button */}
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-500 hover:text-white" />
                  </button>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                    style={{
                      backgroundColor: `${color}15`,
                      color,
                      border: `1px solid ${color}30`
                    }}
                  >
                    View Details
                  </button>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 bg-white/5 hover:bg-white/10 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Auto-dismiss progress bar */}
              <div className="h-1 bg-dark-700">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: color, width: `${alert.progress}%` }}
                  transition={{ duration: 0.05 }}
                />
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* "LIVE" indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-2 mt-2"
      >
        <motion.div
          className="w-2 h-2 rounded-full bg-green-500"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Live Monitoring</span>
      </motion.div>
    </div>
  );
}
