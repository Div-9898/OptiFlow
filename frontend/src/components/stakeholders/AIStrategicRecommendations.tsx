'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Target,
  Users,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronRight,
  Zap,
  Shield,
  Handshake,
  ArrowRight
} from 'lucide-react';

interface Recommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'engagement' | 'risk_mitigation' | 'opportunity' | 'relationship';
  title: string;
  rationale: string;
  affectedStakeholders: string[];
  suggestedActions: string[];
  timeframe: 'immediate' | 'short_term' | 'long_term';
  impact: number;
}

interface AIStrategicRecommendationsProps {
  stakeholders: { id: string; name: string; type: string; power: number; interest: number }[];
  policyImpacts: Record<string, { score: number }>;
}

const categoryConfig = {
  engagement: { icon: Users, color: '#3b82f6', label: 'Engagement' },
  risk_mitigation: { icon: Shield, color: '#ef4444', label: 'Risk Mitigation' },
  opportunity: { icon: TrendingUp, color: '#10b981', label: 'Opportunity' },
  relationship: { icon: Handshake, color: '#8b5cf6', label: 'Relationship' }
};

const priorityConfig = {
  critical: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'CRITICAL' },
  high: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', label: 'HIGH' },
  medium: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', label: 'MEDIUM' },
  low: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)', label: 'LOW' }
};

const timeframeConfig = {
  immediate: { icon: Zap, label: 'Immediate', color: '#ef4444' },
  short_term: { icon: Clock, label: '1-4 Weeks', color: '#f59e0b' },
  long_term: { icon: Target, label: '1-3 Months', color: '#3b82f6' }
};

export default function AIStrategicRecommendations({
  stakeholders,
  policyImpacts
}: AIStrategicRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  // Generate recommendations based on stakeholder data
  useEffect(() => {
    const generateRecommendations = () => {
      const recs: Recommendation[] = [];

      // Analyze stakeholders
      const highPowerLowEngagement = stakeholders.filter(
        s => s.power > 0.7 && s.interest < 0.6
      );
      const negativeImpacts = Object.entries(policyImpacts).filter(
        ([_, impact]) => impact.score < -0.2
      );

      // High power stakeholder recommendations
      highPowerLowEngagement.forEach((s, i) => {
        recs.push({
          id: `engage-${s.id}`,
          priority: 'critical',
          category: 'engagement',
          title: `Increase Engagement with ${s.name}`,
          rationale: `${s.name} has high power (${Math.round(s.power * 100)}%) but lower interest (${Math.round(s.interest * 100)}%). Proactive engagement is essential to maintain positive relationship.`,
          affectedStakeholders: [s.name],
          suggestedActions: [
            'Schedule executive meeting within 2 weeks',
            'Share quarterly roadmap and strategic updates',
            'Address any outstanding concerns directly',
            'Establish regular communication cadence'
          ],
          timeframe: 'immediate',
          impact: 85 + Math.random() * 10
        });
      });

      // Policy impact recommendations
      negativeImpacts.forEach(([stakeholderId, impact]) => {
        const stakeholder = stakeholders.find(s => s.id === stakeholderId);
        if (stakeholder) {
          recs.push({
            id: `mitigate-${stakeholderId}`,
            priority: 'high',
            category: 'risk_mitigation',
            title: `Mitigate Negative Policy Impact on ${stakeholder.name}`,
            rationale: `Current policy simulation shows negative impact (${Math.round(impact.score * 100)}%) on ${stakeholder.name}. Mitigation strategies needed.`,
            affectedStakeholders: [stakeholder.name],
            suggestedActions: [
              'Review policy terms for potential adjustments',
              'Develop compensation or benefits package',
              'Create transition support program',
              'Establish feedback mechanism for concerns'
            ],
            timeframe: 'short_term',
            impact: 70 + Math.random() * 15
          });
        }
      });

      // Opportunity recommendations
      const satisfiedStakeholders = stakeholders.filter(
        s => s.interest > 0.8 && s.power > 0.5
      );
      if (satisfiedStakeholders.length > 0) {
        recs.push({
          id: 'opportunity-leverage',
          priority: 'medium',
          category: 'opportunity',
          title: 'Leverage Stakeholder Advocates',
          rationale: `${satisfiedStakeholders.length} stakeholder(s) show high engagement and satisfaction. These can be leveraged as advocates for policy support.`,
          affectedStakeholders: satisfiedStakeholders.map(s => s.name),
          suggestedActions: [
            'Invite to advisory board or focus groups',
            'Feature success stories in communications',
            'Collaborate on industry initiatives',
            'Develop partnership expansion opportunities'
          ],
          timeframe: 'short_term',
          impact: 75 + Math.random() * 10
        });
      }

      // Relationship building recommendations
      recs.push({
        id: 'relationship-network',
        priority: 'low',
        category: 'relationship',
        title: 'Strengthen Network Connections',
        rationale: 'Improving inter-stakeholder relationships can create synergies and reduce conflict potential.',
        affectedStakeholders: stakeholders.slice(0, 3).map(s => s.name),
        suggestedActions: [
          'Facilitate stakeholder roundtable discussions',
          'Create shared working groups for common interests',
          'Develop collaborative projects',
          'Establish conflict resolution mechanisms'
        ],
        timeframe: 'long_term',
        impact: 60 + Math.random() * 15
      });

      // Sort by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

      setRecommendations(recs);
      setIsGenerating(false);
    };

    // Simulate AI processing
    const timer = setTimeout(generateRecommendations, 1500);
    return () => clearTimeout(timer);
  }, [stakeholders, policyImpacts]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 60px rgba(139, 92, 246, 0.05)'
      }}
    >
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="p-2 rounded-lg bg-purple-500/20"
              animate={{
                boxShadow: ['0 0 15px rgba(139, 92, 246, 0.3)', '0 0 25px rgba(139, 92, 246, 0.5)', '0 0 15px rgba(139, 92, 246, 0.3)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Lightbulb className="w-5 h-5 text-yellow-400" style={{ filter: 'drop-shadow(0 0 6px #fbbf24)' }} />
            </motion.div>
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                AI Strategic Recommendations
                <Sparkles className="w-4 h-4 text-purple-400" />
              </h3>
              <p className="text-xs text-gray-500">Real-time analysis based on stakeholder dynamics</p>
            </div>
          </div>
          <motion.div
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-green-400"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">LIVE</span>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-10">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-8 h-8 text-purple-400" />
            </motion.div>
            <p className="text-sm text-gray-400 mt-3">Analyzing stakeholder dynamics...</p>
          </div>
        ) : (
          <AnimatePresence>
            {recommendations.map((rec, index) => {
              const catConfig = categoryConfig[rec.category];
              const prioConfig = priorityConfig[rec.priority];
              const timeConfig = timeframeConfig[rec.timeframe];
              const CatIcon = catConfig.icon;
              const TimeIcon = timeConfig.icon;
              const isExpanded = expandedId === rec.id;

              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    borderLeft: `3px solid ${prioConfig.color}`
                  }}
                >
                  {/* Main row */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                    className="w-full p-4 text-left flex items-start gap-3 hover:bg-white/5 transition-colors"
                  >
                    <div
                      className="p-2 rounded-lg mt-0.5"
                      style={{ backgroundColor: `${catConfig.color}15` }}
                    >
                      <CatIcon className="w-4 h-4" style={{ color: catConfig.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                          style={{ backgroundColor: prioConfig.bg, color: prioConfig.color }}
                        >
                          {prioConfig.label}
                        </span>
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-medium uppercase"
                          style={{ backgroundColor: `${catConfig.color}15`, color: catConfig.color }}
                        >
                          {catConfig.label}
                        </span>
                        <div className="flex items-center gap-1">
                          <TimeIcon className="w-3 h-3" style={{ color: timeConfig.color }} />
                          <span className="text-[9px] text-gray-500">{timeConfig.label}</span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-white">{rec.title}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{rec.rationale}</p>

                      {/* Stakeholder chips */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {rec.affectedStakeholders.slice(0, 3).map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-gray-300"
                          >
                            {s}
                          </span>
                        ))}
                        {rec.affectedStakeholders.length > 3 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-gray-400">
                            +{rec.affectedStakeholders.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-lg font-bold font-mono text-cyan-400">{rec.impact.toFixed(0)}%</p>
                        <p className="text-[9px] text-gray-500">Impact</p>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </motion.div>
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-white/5"
                      >
                        <div className="p-4 bg-white/5">
                          <p className="text-xs font-medium text-white mb-3">Suggested Actions:</p>
                          <div className="space-y-2">
                            {rec.suggestedActions.map((action, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-start gap-2"
                              >
                                <ArrowRight className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-gray-300">{action}</span>
                              </motion.div>
                            ))}
                          </div>
                          <button className="mt-4 px-4 py-2 rounded-lg text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-colors">
                            Take Action
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
        <p className="text-[10px] text-gray-500">
          {recommendations.length} recommendations generated
        </p>
        <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
          Export Report <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
