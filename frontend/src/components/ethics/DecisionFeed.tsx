'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  CheckCircle,
  AlertTriangle,
  Zap,
  Scale,
  RefreshCw
} from 'lucide-react';

interface Decision {
  id: string;
  type: 'simulation' | 'analysis' | 'recommendation' | 'validation' | 'conflict';
  scenario: string;
  outcome: string;
  score: number;
  timestamp: Date;
}

const DECISION_CONFIG = {
  simulation: { icon: Zap, color: '#f97316' },
  analysis: { icon: Brain, color: '#8b5cf6' },
  recommendation: { icon: CheckCircle, color: '#10b981' },
  validation: { icon: Scale, color: '#3b82f6' },
  conflict: { icon: AlertTriangle, color: '#ef4444' }
};

const SCENARIOS = [
  'Resource Allocation',
  'Safety vs Deadline',
  'Privacy Trade-off',
  'Fairness Decision',
  'Cost Optimization'
];

export default function DecisionFeed() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateDecision = (): Decision => {
      const types: Decision['type'][] = ['simulation', 'analysis', 'recommendation', 'validation', 'conflict'];
      const type = types[Math.floor(Math.random() * types.length)];
      const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
      const score = 0.5 + Math.random() * 0.5;

      const outcomes: Record<Decision['type'], string[]> = {
        simulation: [
          `Monte Carlo: ${(score * 100).toFixed(0)}% success rate`,
          `1000 simulations completed`,
          `Confidence interval: ${((score - 0.05) * 100).toFixed(0)}-${((score + 0.05) * 100).toFixed(0)}%`,
          `Risk factor: ${(1 - score).toFixed(2)}`
        ],
        analysis: [
          `Framework consensus: ${(score * 100).toFixed(0)}%`,
          `Stakeholder impact assessed`,
          `Trade-offs identified: 3`,
          `Ethical score: ${(score * 100).toFixed(0)}%`
        ],
        recommendation: [
          `Optimal path identified`,
          `Best option: Score ${(score * 100).toFixed(0)}%`,
          `AI confidence: High`,
          `Proceed recommended`
        ],
        validation: [
          `Decision validated`,
          `All frameworks aligned`,
          `Compliance: Passed`,
          `Audit trail recorded`
        ],
        conflict: [
          `Framework disagreement detected`,
          `Stakeholder conflict identified`,
          `Manual review required`,
          `Escalation triggered`
        ]
      };

      return {
        id: `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        scenario,
        outcome: outcomes[type][Math.floor(Math.random() * outcomes[type].length)],
        score,
        timestamp: new Date()
      };
    };

    // Initial decisions
    const initialDecisions = Array.from({ length: 5 }, () => {
      const decision = generateDecision();
      decision.timestamp = new Date(Date.now() - Math.random() * 600000);
      return decision;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setDecisions(initialDecisions);

    // Add new decisions
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        setDecisions(prev => [generateDecision(), ...prev].slice(0, 20));
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [decisions[0]?.id]);

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
          <Brain className="w-4 h-4 text-purple-400" />
          Decision History
        </h3>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="w-3 h-3 text-gray-500" />
        </motion.div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence mode="popLayout">
          {decisions.map((decision) => {
            const config = DECISION_CONFIG[decision.type];
            const Icon = config.icon;

            return (
              <motion.div
                key={decision.id}
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
                      <span className="text-[10px] text-gray-400">{decision.scenario}</span>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded capitalize"
                        style={{ backgroundColor: `${config.color}20`, color: config.color }}
                      >
                        {decision.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-tight">
                      {decision.outcome}
                    </p>
                    <span className="text-[9px] text-gray-600 mt-1 block">
                      {formatTime(decision.timestamp)}
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
