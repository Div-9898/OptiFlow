'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gavel,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Users,
  Zap,
  Brain,
  Shield,
  Scale,
  ThumbsUp
} from 'lucide-react';
import { useExecutiveStore, PendingDecision } from '@/stores/executiveStore';

const categoryConfig = {
  resource: { icon: Zap, color: '#3b82f6', label: 'Resource Allocation' },
  safety: { icon: Shield, color: '#ef4444', label: 'Safety Decision' },
  ethics: { icon: Brain, color: '#f59e0b', label: 'Ethical Dilemma' },
  fairness: { icon: Scale, color: '#8b5cf6', label: 'Fairness Issue' }
};

const urgencyConfig = {
  immediate: { color: '#ef4444', label: 'Immediate', icon: AlertTriangle },
  today: { color: '#f59e0b', label: 'Today', icon: Clock },
  this_week: { color: '#3b82f6', label: 'This Week', icon: Clock }
};


function DecisionCard({
  decision,
  isExpanded,
  onToggle,
  onDecide
}: {
  decision: PendingDecision;
  isExpanded: boolean;
  onToggle: () => void;
  onDecide: (optionIndex: number) => void;
}) {
  const catConfig = categoryConfig[decision.category];
  const urgConfig = urgencyConfig[decision.urgency];
  const CatIcon = catConfig.icon;
  const UrgIcon = urgConfig.icon;

  return (
    <motion.div
      layout
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderLeft: `4px solid ${catConfig.color}`,
        boxShadow: decision.urgency === 'immediate' ? `0 0 20px ${urgConfig.color}20` : 'none'
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 text-left flex items-start gap-3 hover:bg-white/5 transition-colors"
      >
        <div className="relative mt-0.5">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: `${catConfig.color}20` }}
          >
            <CatIcon className="w-4 h-4" style={{ color: catConfig.color }} />
          </div>
          {decision.urgency === 'immediate' && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1"
              style={{ backgroundColor: `${urgConfig.color}20`, color: urgConfig.color }}
            >
              <UrgIcon className="w-3 h-3" />
              {urgConfig.label}
            </span>
            <span
              className="px-2 py-0.5 rounded text-[9px] font-medium uppercase"
              style={{ backgroundColor: `${catConfig.color}15`, color: catConfig.color }}
            >
              {catConfig.label}
            </span>
            {decision.deadline && (
              <span className="text-[10px] text-gray-500">
                Deadline: {decision.deadline}
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-white">{decision.title}</p>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{decision.description}</p>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3 text-gray-500" />
              <span className="text-[10px] text-gray-400">{decision.stakeholdersAffected} affected</span>
            </div>
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3 text-purple-400" />
              <span className="text-[10px] text-purple-400">AI recommendation available</span>
            </div>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </motion.div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* AI Recommendation */}
              <div
                className="p-3 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-purple-300">AI Recommendation</span>
                </div>
                <p className="text-xs text-gray-300">{decision.aiRecommendation}</p>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Decision Options</p>
                {decision.options.map((option, index) => (
                  <motion.button
                    key={index}
                    onClick={() => onDecide(index)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      option.recommendation
                        ? 'bg-green-500/10 border border-green-500/30 hover:bg-green-500/20'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {option.recommendation && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-green-500/20 text-green-400">
                            Recommended
                          </span>
                        )}
                        <span className="text-sm font-medium text-white">{option.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-green-400" />
                          <span className="text-[10px] text-green-400">{option.impact}%</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-orange-400" />
                          <span className="text-[10px] text-orange-400">{option.risk}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DecisionCenter() {
  const { pendingDecisions, resolveDecision } = useExecutiveStore();
  const [expandedId, setExpandedId] = useState<string | null>(pendingDecisions[0]?.id);

  const handleDecide = (decisionId: string, optionIndex: number) => {
    // Resolve decision in store
    resolveDecision(decisionId);
    setExpandedId(null);
  };

  const immediateCount = pendingDecisions.filter(d => d.urgency === 'immediate').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden h-full flex flex-col"
      style={{
        background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(245, 158, 11, 0.05)'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-2 rounded-lg bg-orange-500/20"
              animate={immediateCount > 0 ? {
                boxShadow: ['0 0 15px rgba(245, 158, 11, 0.3)', '0 0 25px rgba(245, 158, 11, 0.5)', '0 0 15px rgba(245, 158, 11, 0.3)']
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Gavel className="w-5 h-5 text-orange-400" />
            </motion.div>
            <div>
              <h3 className="text-base font-semibold text-white">Decision Center</h3>
              <p className="text-[10px] text-gray-500">Pending executive actions</p>
            </div>
          </div>
          {immediateCount > 0 && (
            <motion.div
              className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="text-xs font-bold text-red-400">{immediateCount} URGENT</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Decisions list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence mode="popLayout">
          {pendingDecisions.length > 0 ? (
            pendingDecisions.map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                isExpanded={expandedId === decision.id}
                onToggle={() => setExpandedId(expandedId === decision.id ? null : decision.id)}
                onDecide={(index) => handleDecide(decision.id, index)}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10"
            >
              <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
              <p className="text-sm text-gray-400">All decisions resolved</p>
              <p className="text-xs text-gray-500">No pending items</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between">
        <p className="text-[10px] text-gray-500">{pendingDecisions.length} pending decisions</p>
        <div className="flex gap-2">
          {Object.entries(categoryConfig).map(([key, config]) => {
            const count = pendingDecisions.filter(d => d.category === key).length;
            if (count === 0) return null;
            const Icon = config.icon;
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
