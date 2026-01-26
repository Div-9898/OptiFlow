'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Package,
  Truck,
  AlertTriangle,
  CheckCircle,
  Navigation,
  Zap,
  Clock
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'delivery' | 'pickup' | 'route_change' | 'alert' | 'optimization' | 'departure' | 'arrival';
  vehicleId: string;
  message: string;
  timestamp: Date;
  details?: string;
}

const EVENT_TYPES = {
  delivery: { icon: CheckCircle, color: '#00ff88', label: 'Delivery' },
  pickup: { icon: Package, color: '#00d4ff', label: 'Pickup' },
  route_change: { icon: Navigation, color: '#ff8800', label: 'Route' },
  alert: { icon: AlertTriangle, color: '#ff4444', label: 'Alert' },
  optimization: { icon: Zap, color: '#a855f7', label: 'Optimize' },
  departure: { icon: Truck, color: '#ffd93d', label: 'Departure' },
  arrival: { icon: Clock, color: '#00ff88', label: 'Arrival' },
};

const VEHICLE_IDS = ['VH-1001', 'VH-1002', 'VH-1003', 'VH-1004', 'VH-1005', 'VH-1006'];

const LOCATIONS = [
  'Dubai Marina', 'Downtown Dubai', 'Business Bay', 'JBR', 'Palm Jumeirah',
  'DIFC', 'Jebel Ali Port', 'Al Quoz', 'Internet City', 'Media City'
];

export default function EventTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate random events
  useEffect(() => {
    const generateEvent = (): TimelineEvent => {
      const types: TimelineEvent['type'][] = ['delivery', 'pickup', 'route_change', 'optimization', 'departure', 'arrival'];
      const type = types[Math.floor(Math.random() * types.length)];
      const vehicleId = VEHICLE_IDS[Math.floor(Math.random() * VEHICLE_IDS.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

      const messages: Record<TimelineEvent['type'], string[]> = {
        delivery: [
          `Delivered 3 packages to ${location}`,
          `Express delivery completed at ${location}`,
          `Successfully dropped off at ${location}`,
        ],
        pickup: [
          `Collected 5 packages from ${location}`,
          `Pickup completed at ${location}`,
          `Loaded cargo at ${location}`,
        ],
        route_change: [
          `Rerouted to avoid traffic on SZR`,
          `New route assigned - 15% faster`,
          `Detour via ${location} to optimize`,
        ],
        alert: [
          `Heavy traffic detected ahead`,
          `Delivery window at risk`,
          `Vehicle maintenance due soon`,
        ],
        optimization: [
          `Route optimized - saving 12 km`,
          `AI found better route sequence`,
          `Real-time adjustment applied`,
        ],
        departure: [
          `Departed from ${location}`,
          `Started route from warehouse`,
          `Left ${location} heading to next stop`,
        ],
        arrival: [
          `Arrived at ${location}`,
          `Reached destination in ${location}`,
          `ETA confirmed at ${location}`,
        ],
      };

      return {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        vehicleId,
        message: messages[type][Math.floor(Math.random() * messages[type].length)],
        timestamp: new Date(),
        details: Math.random() > 0.5 ? `Stop ${Math.floor(Math.random() * 8) + 1} of 8` : undefined,
      };
    };

    // Add initial events
    const initialEvents = Array.from({ length: 5 }, () => {
      const event = generateEvent();
      event.timestamp = new Date(Date.now() - Math.random() * 60000);
      return event;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setEvents(initialEvents);

    // Add new events periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        setEvents(prev => [generateEvent(), ...prev].slice(0, 20));
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to top when new event arrives
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
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="absolute right-4 top-20 z-10 w-72"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
          border: '1px solid rgba(100, 150, 255, 0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-800/50 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Activity className="w-4 h-4 text-cyan-400" />
            </motion.div>
            <span className="text-sm font-semibold text-white">Live Activity</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400">
              {events.length}
            </span>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="text-gray-500"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </button>

        {/* Events List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 280 }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div
                ref={scrollRef}
                className="h-[280px] overflow-y-auto p-2 space-y-1.5"
                style={{ scrollBehavior: 'smooth' }}
              >
                <AnimatePresence mode="popLayout">
                  {events.map((event) => {
                    const eventType = EVENT_TYPES[event.type];
                    const Icon = eventType.icon;

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ x: -20, opacity: 0, height: 0 }}
                        animate={{ x: 0, opacity: 1, height: 'auto' }}
                        exit={{ x: 20, opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-2 rounded-lg hover:bg-white/5 transition-colors cursor-default"
                        style={{
                          borderLeft: `2px solid ${eventType.color}`,
                          background: `linear-gradient(90deg, ${eventType.color}08 0%, transparent 100%)`,
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <Icon
                            className="w-3.5 h-3.5 mt-0.5 shrink-0"
                            style={{ color: eventType.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className="text-[10px] font-bold px-1 py-0.5 rounded"
                                style={{
                                  backgroundColor: `${eventType.color}20`,
                                  color: eventType.color
                                }}
                              >
                                {event.vehicleId}
                              </span>
                              <span className="text-[9px] text-gray-600">
                                {formatTime(event.timestamp)}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-300 mt-0.5 leading-tight">
                              {event.message}
                            </p>
                            {event.details && (
                              <span className="text-[9px] text-gray-500">{event.details}</span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
