'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Thermometer,
  Route,
  Target
} from 'lucide-react';

interface OptimizationEvent {
  id: string;
  type: 'new_best' | 'temperature_drop' | 'iteration' | 'converged' | 'swap' | 'improvement';
  message: string;
  timestamp: Date;
  value?: number;
  algorithm?: string;
}

const EVENT_CONFIG = {
  new_best: { icon: Target, color: '#10b981', label: 'Best Found' },
  temperature_drop: { icon: Thermometer, color: '#f97316', label: 'Temp Drop' },
  iteration: { icon: Zap, color: '#3b82f6', label: 'Iteration' },
  converged: { icon: CheckCircle, color: '#22c55e', label: 'Converged' },
  swap: { icon: Route, color: '#8b5cf6', label: 'Swap' },
  improvement: { icon: TrendingDown, color: '#06b6d4', label: 'Improved' }
};

interface OptimizationFeedProps {
  isRunning: boolean;
  currentIteration: number;
  currentCost: number;
  temperature?: number;
  algorithm: string;
}

export default function OptimizationFeed({
  isRunning,
  currentIteration,
  currentCost,
  temperature = 1000,
  algorithm
}: OptimizationFeedProps) {
  const [events, setEvents] = useState<OptimizationEvent[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastCostRef = useRef(currentCost);
  const lastIterRef = useRef(0);

  // Generate events based on optimization state changes
  useEffect(() => {
    if (!isRunning) return;

    // Check for new best solution
    if (currentCost < lastCostRef.current * 0.995) {
      const improvement = ((lastCostRef.current - currentCost) / lastCostRef.current) * 100;
      addEvent({
        type: 'new_best',
        message: `New best: ${currentCost.toFixed(0)} (-${improvement.toFixed(2)}%)`,
        value: currentCost,
        algorithm
      });
      lastCostRef.current = currentCost;
    }

    // Add milestone iterations
    if (currentIteration > 0 && currentIteration % 50 === 0 && currentIteration !== lastIterRef.current) {
      addEvent({
        type: 'iteration',
        message: `Completed ${currentIteration} iterations`,
        value: currentIteration,
        algorithm
      });
      lastIterRef.current = currentIteration;
    }

    // Temperature drops for simulated annealing
    if (algorithm === 'Simulated Annealing' && temperature < 100 && temperature > 10) {
      addEvent({
        type: 'temperature_drop',
        message: `Temperature: ${temperature.toFixed(1)}`,
        value: temperature,
        algorithm
      });
    }
  }, [isRunning, currentIteration, currentCost, temperature, algorithm]);

  // Add convergence event when stopping
  useEffect(() => {
    if (!isRunning && events.length > 0 && events[0]?.type !== 'converged') {
      addEvent({
        type: 'converged',
        message: `${algorithm} converged at cost ${currentCost.toFixed(0)}`,
        value: currentCost,
        algorithm
      });
    }
  }, [isRunning]);

  const addEvent = (event: Omit<OptimizationEvent, 'id' | 'timestamp'>) => {
    const newEvent: OptimizationEvent = {
      ...event,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };
    setEvents(prev => [newEvent, ...prev].slice(0, 30));
  };

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [events[0]?.id]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-dark rounded-xl p-4 h-[280px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Optimization Feed
        </h3>
        {isRunning && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-green-500"
          />
        )}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1.5 pr-1"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence mode="popLayout">
          {events.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Waiting for optimization to start...
            </div>
          ) : (
            events.map((event) => {
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
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: `${config.color}20`,
                            color: config.color
                          }}
                        >
                          {config.label}
                        </span>
                        <span className="text-[9px] text-gray-600">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300 mt-0.5 leading-tight">
                        {event.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
