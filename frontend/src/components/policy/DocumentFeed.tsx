'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  CheckCircle,
  Download,
  Sparkles,
  Clock,
  Eye
} from 'lucide-react';

interface DocumentEvent {
  id: string;
  type: 'generated' | 'exported' | 'viewed' | 'approved' | 'ai_enhanced';
  documentName: string;
  template: string;
  timestamp: Date;
}

const EVENT_CONFIG = {
  generated: { icon: Sparkles, color: '#ec4899', label: 'Generated' },
  exported: { icon: Download, color: '#3b82f6', label: 'Exported' },
  viewed: { icon: Eye, color: '#8b5cf6', label: 'Viewed' },
  approved: { icon: CheckCircle, color: '#10b981', label: 'Approved' },
  ai_enhanced: { icon: Sparkles, color: '#f59e0b', label: 'AI Enhanced' }
};

const TEMPLATES = [
  'Operational Efficiency',
  'Risk Assessment',
  'Fairness Audit',
  'Ethical Compliance',
  'Sustainability Report',
  'Stakeholder Brief',
  'Fleet Performance',
  'Quarterly Review'
];

const DOCUMENT_NAMES = [
  'Q1 Report',
  'Weekly Summary',
  'Monthly Analysis',
  'Safety Brief',
  'Performance Review',
  'Compliance Audit',
  'Strategy Document'
];

export default function DocumentFeed() {
  const [events, setEvents] = useState<DocumentEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateEvent = (): DocumentEvent => {
      const types: DocumentEvent['type'][] = ['generated', 'exported', 'viewed', 'approved', 'ai_enhanced'];
      const type = types[Math.floor(Math.random() * types.length)];

      return {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        documentName: DOCUMENT_NAMES[Math.floor(Math.random() * DOCUMENT_NAMES.length)],
        template: TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)],
        timestamp: new Date()
      };
    };

    // Initial events
    const initialEvents = Array.from({ length: 5 }, () => {
      const event = generateEvent();
      event.timestamp = new Date(Date.now() - Math.random() * 3600000);
      return event;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setEvents(initialEvents);

    // Add new events
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        setEvents(prev => [generateEvent(), ...prev].slice(0, 20));
      }
    }, 8000);

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
          <FileText className="w-4 h-4 text-pink-400" />
          Document Activity
        </h3>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-pink-500"
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
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[11px] text-white font-medium">{event.documentName}</span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${config.color}20`, color: config.color }}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">{event.template}</p>
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
