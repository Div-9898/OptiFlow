'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Network,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Users,
  Link
} from 'lucide-react';

interface RelationshipEvent {
  id: string;
  type: 'new_link' | 'strengthened' | 'weakened' | 'interaction' | 'policy_impact';
  source: string;
  target: string;
  change: number;
  timestamp: Date;
}

const EVENT_CONFIG = {
  new_link: { icon: Link, color: '#10b981', label: 'New Link' },
  strengthened: { icon: TrendingUp, color: '#3b82f6', label: 'Strengthened' },
  weakened: { icon: TrendingDown, color: '#f59e0b', label: 'Weakened' },
  interaction: { icon: Users, color: '#8b5cf6', label: 'Interaction' },
  policy_impact: { icon: Network, color: '#00f5ff', label: 'Policy Impact' }
};

const STAKEHOLDERS = [
  'Logistics Co.', 'Drivers', 'Customers', 'Regulators',
  'Community', 'Shareholders', 'Suppliers', 'Competitors'
];

export default function RelationshipFeed() {
  const [events, setEvents] = useState<RelationshipEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateEvent = (): RelationshipEvent => {
      const types: RelationshipEvent['type'][] = ['new_link', 'strengthened', 'weakened', 'interaction', 'policy_impact'];
      const type = types[Math.floor(Math.random() * types.length)];
      const source = STAKEHOLDERS[Math.floor(Math.random() * STAKEHOLDERS.length)];
      let target = STAKEHOLDERS[Math.floor(Math.random() * STAKEHOLDERS.length)];
      while (target === source) {
        target = STAKEHOLDERS[Math.floor(Math.random() * STAKEHOLDERS.length)];
      }

      return {
        id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        source,
        target,
        change: type === 'weakened' ? -(Math.random() * 0.15) : Math.random() * 0.2,
        timestamp: new Date()
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
      if (Math.random() > 0.5) {
        setEvents(prev => [generateEvent(), ...prev].slice(0, 20));
      }
    }, 7000);

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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-dark rounded-xl p-4 h-[300px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Network className="w-4 h-4 text-cyan-400" />
          Relationship Activity
        </h3>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-cyan-500"
        />
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence mode="popLayout">
          {events.map((event) => {
            const config = EVENT_CONFIG[event.type];
            const Icon = config.icon;

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
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-[10px] text-white font-medium">{event.source}</span>
                      <ArrowRight className="w-3 h-3 text-gray-500" />
                      <span className="text-[10px] text-white font-medium">{event.target}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${config.color}20`, color: config.color }}
                      >
                        {config.label}
                      </span>
                      {event.change !== 0 && (
                        <span className={`text-[10px] font-mono ${event.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {event.change > 0 ? '+' : ''}{(event.change * 100).toFixed(1)}%
                        </span>
                      )}
                    </div>
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
