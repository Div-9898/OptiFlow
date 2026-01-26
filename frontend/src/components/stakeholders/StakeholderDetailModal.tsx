'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  Truck,
  UserCheck,
  Gavel,
  Home,
  DollarSign,
  Package,
  Swords,
  Zap,
  Target,
  Users,
  Network,
  TrendingUp,
  TrendingDown,
  Minus,
  Lightbulb,
  Calendar,
  Mail,
  FileText,
  Download,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Activity
} from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

interface Stakeholder {
  id: string;
  name: string;
  type: string;
  power: number;
  interest: number;
  influence: number;
  description: string;
}

interface PolicyImpact {
  stakeholderId: string;
  score: number;
  positive: string[];
  negative: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface Link {
  source: string;
  target: string;
  type: string;
  strength: number;
}

interface StakeholderDetailModalProps {
  stakeholder: Stakeholder | null;
  onClose: () => void;
  policyImpact?: PolicyImpact;
  links: Link[];
  allStakeholders: Stakeholder[];
  typeColors: Record<string, string>;
  relationshipTypes: Record<string, { color: string; label: string }>;
}

const stakeholderIcons: Record<string, React.ElementType> = {
  company: Building2,
  drivers: Truck,
  customers: UserCheck,
  regulators: Gavel,
  community: Home,
  shareholders: DollarSign,
  suppliers: Package,
  competitors: Swords
};

// Animated gauge component
function MetricGauge({
  label,
  value,
  color,
  icon: Icon
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ElementType;
}) {
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-18 h-18">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
          <defs>
            <filter id={`gauge-glow-modal-${color.replace('#', '')}`}>
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="5"
          />
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: 'easeOut' }}
            filter={`url(#gauge-glow-modal-${color.replace('#', '')})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className="w-3 h-3 mb-0.5" style={{ color }} />
          <span className="text-sm font-bold font-mono" style={{ color }}>
            {value}%
          </span>
        </div>
      </div>
      <span className="text-[9px] text-gray-400 mt-1">{label}</span>
    </div>
  );
}

export default function StakeholderDetailModal({
  stakeholder,
  onClose,
  policyImpact,
  links,
  allStakeholders,
  typeColors,
  relationshipTypes
}: StakeholderDetailModalProps) {
  if (!stakeholder) return null;

  const Icon = stakeholderIcons[stakeholder.type] || Users;
  const color = typeColors[stakeholder.type] || '#00f5ff';

  // Get connected stakeholders
  const connectedLinks = links.filter(
    l => l.source === stakeholder.id || l.target === stakeholder.id
  );
  const connectedStakeholders = connectedLinks.map(link => {
    const otherId = link.source === stakeholder.id ? link.target : link.source;
    return {
      ...allStakeholders.find(s => s.id === otherId),
      link
    };
  }).filter(s => s.id);

  // Radar data
  const radarData = [
    { metric: 'Power', value: stakeholder.power * 100 },
    { metric: 'Interest', value: stakeholder.interest * 100 },
    { metric: 'Influence', value: stakeholder.influence * 100 },
    { metric: 'Engagement', value: 65 + Math.random() * 25 },
    { metric: 'Satisfaction', value: 70 + Math.random() * 20 }
  ];

  // Historical trend data (simulated)
  const historicalData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    power: Math.max(30, Math.min(100, stakeholder.power * 100 + (Math.random() - 0.5) * 20)),
    interest: Math.max(30, Math.min(100, stakeholder.interest * 100 + (Math.random() - 0.5) * 15)),
    influence: Math.max(30, Math.min(100, stakeholder.influence * 100 + (Math.random() - 0.5) * 18))
  }));

  // AI Recommendations
  const recommendations = [
    {
      priority: 'high',
      title: 'Schedule Quarterly Review',
      description: `Proactive engagement with ${stakeholder.name} recommended to maintain positive relationship`,
      timeframe: 'Next 2 weeks'
    },
    {
      priority: 'medium',
      title: 'Address Concerns',
      description: 'Recent feedback indicates areas requiring attention - review and respond',
      timeframe: 'Within 30 days'
    },
    {
      priority: 'low',
      title: 'Expand Communication',
      description: 'Consider additional touchpoints to strengthen relationship',
      timeframe: 'Ongoing'
    }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(15,20,30,0.98) 0%, rgba(10,15,25,0.99) 100%)',
            border: `1px solid ${color}30`,
            boxShadow: `0 25px 50px rgba(0,0,0,0.5), 0 0 100px ${color}10`
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="p-6 border-b border-white/10"
            style={{
              background: `linear-gradient(135deg, ${color}10 0%, transparent 50%)`
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: `${color}20`,
                    boxShadow: `0 0 30px ${color}30`
                  }}
                  animate={{
                    boxShadow: [`0 0 30px ${color}30`, `0 0 40px ${color}50`, `0 0 30px ${color}30`]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Icon className="w-8 h-8" style={{ color, filter: `drop-shadow(0 0 8px ${color})` }} />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{stakeholder.name}</h2>
                  <p className="text-sm text-gray-400 capitalize">{stakeholder.type}</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-md">{stakeholder.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 mt-6">
              <MetricGauge label="Power" value={Math.round(stakeholder.power * 100)} color="#ef4444" icon={Zap} />
              <MetricGauge label="Interest" value={Math.round(stakeholder.interest * 100)} color="#3b82f6" icon={Target} />
              <MetricGauge label="Influence" value={Math.round(stakeholder.influence * 100)} color="#8b5cf6" icon={Sparkles} />
              <MetricGauge label="Connections" value={connectedStakeholders.length * 12} color="#00f5ff" icon={Network} />
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-6 grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Radar Chart */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-accent-purple" />
                  Stakeholder Profile
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
                      <Radar
                        name="Metrics"
                        dataKey="value"
                        stroke={color}
                        fill={color}
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Relationships */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Network className="w-4 h-4 text-accent-cyan" />
                  Relationships ({connectedStakeholders.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {connectedStakeholders.map((connected, i) => {
                    if (!connected.id) return null;
                    const relType = relationshipTypes[connected.link.type];
                    const isOutgoing = connected.link.source === stakeholder.id;

                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: typeColors[connected.type || ''] }}
                          />
                          <span className="text-xs text-white">{connected.name}</span>
                        </div>
                        <span
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${relType?.color}20`,
                            color: relType?.color
                          }}
                        >
                          {isOutgoing ? '→' : '←'} {relType?.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Policy Impact (if available) */}
              {policyImpact && (
                <div
                  className="p-4 rounded-xl border"
                  style={{
                    backgroundColor: policyImpact.score > 0.3 ? 'rgba(16, 185, 129, 0.1)' :
                      policyImpact.score < -0.2 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                    borderColor: policyImpact.score > 0.3 ? 'rgba(16, 185, 129, 0.3)' :
                      policyImpact.score < -0.2 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Policy Impact Assessment
                  </h3>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">Impact Score</span>
                    <span
                      className="text-xl font-bold font-mono"
                      style={{
                        color: policyImpact.score > 0.3 ? '#10b981' :
                          policyImpact.score < -0.2 ? '#ef4444' : '#f59e0b'
                      }}
                    >
                      {policyImpact.score > 0 ? '+' : ''}{(policyImpact.score * 100).toFixed(0)}%
                    </span>
                  </div>
                  {policyImpact.positive.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] text-green-400 mb-1">Positive Effects:</p>
                      <div className="flex flex-wrap gap-1">
                        {policyImpact.positive.map((p, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {policyImpact.negative.length > 0 && (
                    <div>
                      <p className="text-[10px] text-red-400 mb-1">Negative Effects:</p>
                      <div className="flex flex-wrap gap-1">
                        {policyImpact.negative.map((n, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Historical Trend */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  Historical Trend
                </h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <defs>
                        <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInfluence" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 9 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="power" stroke="#ef4444" fill="url(#colorPower)" strokeWidth={2} />
                      <Area type="monotone" dataKey="influence" stroke="#8b5cf6" fill="url(#colorInfluence)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1 rounded bg-red-500" />
                    <span className="text-[10px] text-gray-400">Power</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-1 rounded bg-purple-500" />
                    <span className="text-[10px] text-gray-400">Influence</span>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }} />
                  AI Strategic Recommendations
                  <motion.span
                    className="ml-auto px-2 py-0.5 rounded text-[9px] font-bold bg-green-500/20 text-green-400"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    LIVE
                  </motion.span>
                </h3>
                <div className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 rounded-lg bg-white/5 border-l-2"
                      style={{
                        borderLeftColor: rec.priority === 'high' ? '#ef4444' :
                          rec.priority === 'medium' ? '#f59e0b' : '#3b82f6'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: rec.priority === 'high' ? 'rgba(239, 68, 68, 0.2)' :
                              rec.priority === 'medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                            color: rec.priority === 'high' ? '#ef4444' :
                              rec.priority === 'medium' ? '#f59e0b' : '#3b82f6'
                          }}
                        >
                          {rec.priority}
                        </span>
                        <span className="text-[10px] text-gray-500">{rec.timeframe}</span>
                      </div>
                      <p className="text-xs font-medium text-white">{rec.title}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{rec.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                style={{
                  backgroundColor: `${color}20`,
                  color,
                  border: `1px solid ${color}40`
                }}
              >
                <Calendar className="w-4 h-4" />
                Schedule Meeting
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-all"
              >
                <Mail className="w-4 h-4" />
                Send Communication
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-all"
            >
              <Download className="w-4 h-4" />
              Export Report
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
