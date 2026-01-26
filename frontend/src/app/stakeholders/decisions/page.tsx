'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { useExecutiveStore, PendingDecision } from '@/stores/executiveStore';
import {
  ArrowLeft,
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
  ThumbsUp,
  BarChart3,
  TrendingUp,
  Target,
  History,
  Lightbulb,
  Award,
  Timer
} from 'lucide-react';

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

// Decision card with expanded details
function DecisionCard({ decision, isExpanded, onToggle, onDecide }: { decision: PendingDecision; isExpanded: boolean; onToggle: () => void; onDecide: (index: number) => void }) {
  const catConfig = categoryConfig[decision.category];
  const urgConfig = urgencyConfig[decision.urgency];
  const CatIcon = catConfig.icon;
  const UrgIcon = urgConfig.icon;

  return (
    <motion.div layout className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', borderLeft: `4px solid ${catConfig.color}`, boxShadow: decision.urgency === 'immediate' ? `0 0 30px ${urgConfig.color}20` : 'none' }}>
      <button onClick={onToggle} className="w-full p-5 text-left flex items-start gap-4 hover:bg-white/5 transition-colors">
        <div className="relative">
          <motion.div className="p-3 rounded-xl" style={{ backgroundColor: `${catConfig.color}20` }} animate={decision.urgency === 'immediate' ? { boxShadow: [`0 0 15px ${catConfig.color}40`, `0 0 25px ${catConfig.color}60`, `0 0 15px ${catConfig.color}40`] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
            <CatIcon className="w-6 h-6" style={{ color: catConfig.color }} />
          </motion.div>
          {decision.urgency === 'immediate' && (
            <motion.div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1" style={{ backgroundColor: `${urgConfig.color}20`, color: urgConfig.color }}>
              <UrgIcon className="w-3 h-3" />{urgConfig.label}
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-medium uppercase" style={{ backgroundColor: `${catConfig.color}15`, color: catConfig.color }}>
              {catConfig.label}
            </span>
            {decision.deadline && <span className="text-xs text-gray-500">Deadline: {decision.deadline}</span>}
          </div>
          <p className="text-lg font-semibold text-white mb-1">{decision.title}</p>
          <p className="text-sm text-gray-400">{decision.description}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1"><Users className="w-4 h-4 text-gray-500" /><span className="text-xs text-gray-400">{decision.stakeholdersAffected} affected</span></div>
            <div className="flex items-center gap-1"><Brain className="w-4 h-4 text-purple-400" /><span className="text-xs text-purple-400">AI Ready</span></div>
          </div>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}><ChevronRight className="w-6 h-6 text-gray-500" /></motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-white/10">
            <div className="p-5 space-y-5">
              {/* AI Recommendation */}
              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-purple-300">AI Recommendation</span>
                  <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-400">98% Confidence</span>
                </div>
                <p className="text-sm text-gray-300">{decision.aiRecommendation}</p>
              </div>

              {/* Options */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Decision Options</p>
                <div className="space-y-3">
                  {decision.options.map((option, index) => (
                    <motion.button key={index} onClick={() => onDecide(index)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className={`w-full p-4 rounded-xl text-left transition-all ${option.recommendation ? 'bg-green-500/15 border-2 border-green-500/40 hover:bg-green-500/25' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {option.recommendation && <Award className="w-5 h-5 text-green-400" />}
                          <span className="font-medium text-white">{option.label}</span>
                          {option.recommendation && <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-green-500/30 text-green-400">RECOMMENDED</span>}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1"><ThumbsUp className="w-4 h-4 text-green-400" /><span className="text-sm text-green-400">{option.impact}%</span></div>
                          <div className="flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-orange-400" /><span className="text-sm text-orange-400">{option.risk}%</span></div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Stats card
function StatCard({ icon: Icon, label, value, color, trend }: { icon: React.ElementType; label: string; value: string; color: string; trend?: string }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-5 rounded-2xl" style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: `1px solid ${color}20` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}><Icon className="w-5 h-5" style={{ color }} /></div>
        {trend && <div className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-green-400" /><span className="text-xs text-green-400">{trend}</span></div>}
      </div>
      <p className="text-3xl font-bold font-mono" style={{ color, textShadow: `0 0 30px ${color}40` }}>{value}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{label}</p>
    </motion.div>
  );
}

// Decision history item
function HistoryItem({ title, category, outcome, time }: { title: string; category: keyof typeof categoryConfig; outcome: 'approved' | 'modified'; time: string }) {
  const config = categoryConfig[category];
  const Icon = config.icon;
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
      <div className="p-1.5 rounded" style={{ backgroundColor: `${config.color}20` }}><Icon className="w-4 h-4" style={{ color: config.color }} /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{title}</p>
        <p className="text-[10px] text-gray-500">{time}</p>
      </div>
      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${outcome === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
        {outcome === 'approved' ? 'Approved' : 'Modified'}
      </span>
    </motion.div>
  );
}

export default function DecisionCenterPage() {
  const router = useRouter();
  const { pendingDecisions, resolveDecision } = useExecutiveStore();
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [resolvedCount, setResolvedCount] = useState(47);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (pendingDecisions.length > 0) setExpandedId(pendingDecisions[0].id);
    }, 600);
    return () => clearTimeout(timer);
  }, [pendingDecisions]);

  const handleDecide = (decisionId: string, optionIndex: number) => {
    resolveDecision(decisionId);
    setResolvedCount(prev => prev + 1);
    setExpandedId(null);
  };

  const immediateCount = pendingDecisions.filter(d => d.urgency === 'immediate').length;
  const todayCount = pendingDecisions.filter(d => d.urgency === 'today').length;

  // Mock history
  const decisionHistory = [
    { title: 'Route Reoptimization Request', category: 'resource' as const, outcome: 'approved' as const, time: '2h ago' },
    { title: 'Driver Break Extension', category: 'safety' as const, outcome: 'approved' as const, time: '4h ago' },
    { title: 'Priority Customer Escalation', category: 'ethics' as const, outcome: 'modified' as const, time: '6h ago' },
    { title: 'Zone Coverage Adjustment', category: 'fairness' as const, outcome: 'approved' as const, time: '1d ago' },
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#050a12]">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <motion.div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
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
                <motion.div className="p-3 rounded-xl bg-orange-500/20" animate={{ boxShadow: immediateCount > 0 ? ['0 0 20px rgba(245, 158, 11, 0.3)', '0 0 40px rgba(245, 158, 11, 0.5)', '0 0 20px rgba(245, 158, 11, 0.3)'] : 'none' }} transition={{ duration: 2, repeat: Infinity }}>
                  <Gavel className="w-6 h-6 text-orange-400" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Decision Center</h1>
                  <p className="text-sm text-gray-500">Executive actions & AI-powered insights</p>
                </div>
              </div>
            </div>
            {immediateCount > 0 && (
              <motion.div className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                <span className="text-sm font-bold text-red-400">{immediateCount} Urgent Actions Required</span>
              </motion.div>
            )}
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard icon={Gavel} label="Pending Decisions" value={pendingDecisions.length.toString()} color="#f59e0b" />
            <StatCard icon={AlertTriangle} label="Immediate" value={immediateCount.toString()} color="#ef4444" />
            <StatCard icon={Clock} label="Due Today" value={todayCount.toString()} color="#3b82f6" />
            <StatCard icon={CheckCircle} label="Resolved (30d)" value={resolvedCount.toString()} color="#10b981" trend="+12%" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Pending Decisions */}
            <div className="col-span-2 space-y-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Timer className="w-5 h-5 text-orange-400" />Pending Decisions
                </h2>
                <span className="text-xs text-gray-500">{pendingDecisions.length} awaiting action</span>
              </motion.div>

              <AnimatePresence mode="popLayout">
                {pendingDecisions.length > 0 ? (
                  pendingDecisions.map((decision) => (
                    <DecisionCard key={decision.id} decision={decision} isExpanded={expandedId === decision.id} onToggle={() => setExpandedId(expandedId === decision.id ? null : decision.id)} onDecide={(index) => handleDecide(decision.id, index)} />
                  ))
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-10 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-white">All Decisions Resolved</p>
                    <p className="text-sm text-gray-500">No pending items require attention</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* AI Insights */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-white">AI Decision Support</span>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-white/5">
                    <p className="text-sm text-gray-300">All pending decisions have AI recommendations with 95%+ confidence scores.</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Accuracy (30d)</span>
                    <span className="font-bold text-green-400">97.2%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Avg Decision Time</span>
                    <span className="font-bold text-cyan-400">4.2 min</span>
                  </div>
                </div>
              </motion.div>

              {/* Recent History */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl p-5" style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid rgba(100, 200, 255, 0.1)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-cyan-400" />
                  <span className="font-medium text-white">Recent Decisions</span>
                </div>
                <div className="space-y-2">
                  {decisionHistory.map((item, i) => (
                    <HistoryItem key={i} {...item} />
                  ))}
                </div>
              </motion.div>

              {/* Category Distribution */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="rounded-2xl p-5" style={{ background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-orange-400" />
                  <span className="font-medium text-white">By Category</span>
                </div>
                <div className="space-y-2">
                  {Object.entries(categoryConfig).map(([key, config]) => {
                    const count = pendingDecisions.filter(d => d.category === key).length;
                    const Icon = config.icon;
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <Icon className="w-4 h-4" style={{ color: config.color }} />
                        <span className="text-xs text-gray-400 flex-1">{config.label}</span>
                        <span className="text-sm font-bold text-white">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
