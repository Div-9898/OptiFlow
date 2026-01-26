'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  AlertTriangle,
  CheckCircle,
  Search,
  FileCheck,
  Map
} from 'lucide-react';

interface AuditEvent {
  id: string;
  type: 'check' | 'warning' | 'passed' | 'analysis' | 'review';
  category: 'geographic' | 'workload' | 'customer' | 'driver';
  message: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high';
}

const AUDIT_CONFIG = {
  check: { icon: Search, color: '#3b82f6' },
  warning: { icon: AlertTriangle, color: '#f59e0b' },
  passed: { icon: CheckCircle, color: '#10b981' },
  analysis: { icon: Scale, color: '#8b5cf6' },
  review: { icon: FileCheck, color: '#06b6d4' }
};

export default function AuditFeed() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateEvent = (): AuditEvent => {
      const types: AuditEvent['type'][] = ['check', 'warning', 'passed', 'analysis', 'review'];
      const categories: AuditEvent['category'][] = ['geographic', 'workload', 'customer', 'driver'];
      const severities: AuditEvent['severity'][] = ['low', 'medium', 'high'];

      const type = types[Math.floor(Math.random() * types.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];

      const messages: Record<AuditEvent['type'], string[]> = {
        check: [
          `Analyzing ${category} distribution patterns`,
          `Running equity check for ${category} metrics`,
          `Scanning ${category} data for anomalies`,
          `Validating ${category} fairness scores`
        ],
        warning: [
          `Potential bias detected in ${category} area`,
          `${category.charAt(0).toUpperCase() + category.slice(1)} disparity found`,
          `Review needed for ${category} metrics`,
          `Threshold exceeded in ${category} category`
        ],
        passed: [
          `${category.charAt(0).toUpperCase() + category.slice(1)} equity check passed`,
          `No bias detected in ${category} distribution`,
          `${category.charAt(0).toUpperCase() + category.slice(1)} metrics within range`,
          `Fairness validated for ${category}`
        ],
        analysis: [
          `Deep analysis of ${category} patterns`,
          `Statistical review of ${category} data`,
          `Trend analysis for ${category} metrics`,
          `Correlation check in ${category}`
        ],
        review: [
          `Completed ${category} audit cycle`,
          `Generated ${category} fairness report`,
          `Archived ${category} audit results`,
          `Updated ${category} compliance status`
        ]
      };

      return {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        category,
        message: messages[type][Math.floor(Math.random() * messages[type].length)],
        timestamp: new Date(),
        severity: type === 'warning' ? severities[Math.floor(Math.random() * severities.length)] : undefined
      };
    };

    // Initial events
    const initialEvents = Array.from({ length: 5 }, () => {
      const event = generateEvent();
      event.timestamp = new Date(Date.now() - Math.random() * 600000);
      return event;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setEvents(initialEvents);

    // Add new events
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        setEvents(prev => [generateEvent(), ...prev].slice(0, 20));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events[0]?.id]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryColor = (category: AuditEvent['category']) => {
    switch (category) {
      case 'geographic': return '#10b981';
      case 'workload': return '#3b82f6';
      case 'customer': return '#8b5cf6';
      case 'driver': return '#f59e0b';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-dark rounded-xl p-4 h-[300px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Scale className="w-4 h-4 text-green-400" />
          Audit Activity
        </h3>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-green-500"
        />
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence mode="popLayout">
          {events.map((event) => {
            const config = AUDIT_CONFIG[event.type];
            const Icon = config.icon;
            const categoryColor = getCategoryColor(event.category);

            return (
              <motion.div
                key={event.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="p-2 rounded-lg"
                style={{
                  borderLeft: `2px solid ${config.color}`,
                  background: `linear-gradient(90deg, ${config.color}08 0%, transparent 100%)`
                }}
              >
                <div className="flex items-start gap-2">
                  <Icon
                    className="w-3.5 h-3.5 mt-0.5 shrink-0"
                    style={{ color: config.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded capitalize"
                        style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
                      >
                        {event.category}
                      </span>
                      {event.severity && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded uppercase"
                          style={{
                            backgroundColor: event.severity === 'high' ? 'rgba(239, 68, 68, 0.2)' :
                                            event.severity === 'medium' ? 'rgba(245, 158, 11, 0.2)' :
                                            'rgba(59, 130, 246, 0.2)',
                            color: event.severity === 'high' ? '#ef4444' :
                                   event.severity === 'medium' ? '#f59e0b' :
                                   '#3b82f6'
                          }}
                        >
                          {event.severity}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-300 leading-tight">
                      {event.message}
                    </p>
                    <span className="text-[9px] text-gray-600 mt-1 block">
                      {formatTime(event.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
