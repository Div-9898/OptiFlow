'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale,
  MapPin,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  BarChart3,
  ChevronDown,
  Calculator,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Info,
  Lightbulb,
  Target,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import PageLayout from '@/components/dashboard/PageLayout';
import {
  BiasKPIDashboard,
  FairnessGauges,
  AuditFeed
} from '@/components/bias';

// Metric details with calculation formulas, AI insights, and level explanations
const metricDetails: Record<string, {
  formula: string;
  formulaExplanation: string;
  components: { name: string; value: number; description: string }[];
  aiInsights: string[];
  levelExplanation: { low: string; medium: string; high: string };
  recommendations: string[];
  historicalTrend: number;
}> = {
  demographic: {
    formula: 'DP = 1 - |P(favorable|A) - P(favorable|B)|',
    formulaExplanation: 'Measures the difference in favorable outcomes (successful deliveries, on-time arrivals) across different demographic groups. A score of 1.0 means perfect parity.',
    components: [
      { name: 'Group A Favorable Rate', value: 0.94, description: 'Success rate for primary driver demographic' },
      { name: 'Group B Favorable Rate', value: 0.92, description: 'Success rate for secondary driver demographic' },
      { name: 'Parity Gap', value: 0.02, description: 'Absolute difference between groups' },
    ],
    aiInsights: [
      'Driver performance is consistent across all demographic groups, indicating fair assignment algorithms.',
      'Recent route optimization changes improved parity by 3% over the last month.',
      'No significant bias detected in peak-hour assignments across demographic segments.',
    ],
    levelExplanation: {
      low: 'Below 70%: Significant disparity exists between demographic groups. Immediate review of assignment algorithms required.',
      medium: '70-85%: Moderate differences detected. Monitor closely and consider targeted interventions.',
      high: 'Above 85%: Excellent demographic parity. Current policies are effectively ensuring equal treatment.',
    },
    recommendations: [
      'Continue monitoring weekly demographic parity reports',
      'Maintain current assignment algorithm parameters',
    ],
    historicalTrend: 2.3,
  },
  geographic: {
    formula: 'GE = Σ(zone_coverage × zone_weight) / Σ(zone_weight)',
    formulaExplanation: 'Weighted average of service coverage across all delivery zones, considering population density and demand as weights.',
    components: [
      { name: 'Downtown Coverage', value: 0.98, description: 'High-density commercial zone' },
      { name: 'Suburban Coverage', value: 0.82, description: 'Residential areas with moderate demand' },
      { name: 'Industrial Coverage', value: 0.71, description: 'Al Quoz and industrial zones' },
      { name: 'Population Weight Factor', value: 1.2, description: 'Adjustment for underserved areas' },
    ],
    aiInsights: [
      'Al Quoz industrial area showing 22% lower coverage than urban centers - primary driver of score.',
      'Weekend coverage drops by 15% in suburban areas, suggesting resource allocation opportunity.',
      'Adding 2 vehicles to industrial routes could improve overall equity score by 8-10%.',
    ],
    levelExplanation: {
      low: 'Below 70%: Severe geographic disparity. Some areas receiving significantly less service than others.',
      medium: '70-85%: Notable coverage gaps exist. Specific zones need attention to achieve equitable service.',
      high: 'Above 85%: Strong geographic equity. Service coverage is well-distributed across all zones.',
    },
    recommendations: [
      'Increase vehicle allocation to Al Quoz during peak hours',
      'Implement dynamic routing for underserved suburban areas',
      'Consider satellite depot in industrial zone',
    ],
    historicalTrend: -1.5,
  },
  temporal: {
    formula: 'TF = 1 - σ(hourly_performance) / μ(hourly_performance)',
    formulaExplanation: 'Measures consistency of service quality across different time periods. Lower variance in hourly performance indicates better temporal fairness.',
    components: [
      { name: 'Peak Hour Performance', value: 0.91, description: '8-10 AM and 5-7 PM delivery success' },
      { name: 'Off-Peak Performance', value: 0.89, description: 'Mid-day and evening delivery success' },
      { name: 'Night Performance', value: 0.84, description: '10 PM - 6 AM delivery success' },
      { name: 'Performance Variance', value: 0.07, description: 'Standard deviation across time slots' },
    ],
    aiInsights: [
      'Night shift performance is 7% lower than peak hours - fatigue management opportunity identified.',
      'Sunday morning slots show highest customer satisfaction despite lower volume.',
      'Rush hour delays improved by 12% after implementing predictive traffic routing.',
    ],
    levelExplanation: {
      low: 'Below 70%: Significant service quality variation throughout the day. Customers experience inconsistent service.',
      medium: '70-85%: Moderate temporal variations. Some time slots underperforming compared to others.',
      high: 'Above 85%: Consistent service quality throughout all time periods. Customers receive reliable service.',
    },
    recommendations: [
      'Implement fatigue monitoring for night shift drivers',
      'Increase buffer times for rush hour deliveries',
      'Consider shift overlap during transition periods',
    ],
    historicalTrend: 4.2,
  },
  workload: {
    formula: 'WD = 1 - Gini(driver_assignments)',
    formulaExplanation: 'Based on the Gini coefficient of delivery assignments. A Gini of 0 means perfect equality, so WD = 1 - Gini gives higher scores for more equal distribution.',
    components: [
      { name: 'Gini Coefficient', value: 0.15, description: 'Inequality measure of driver workloads' },
      { name: 'Avg Deliveries/Driver', value: 24.3, description: 'Mean daily delivery count' },
      { name: 'Std Deviation', value: 3.2, description: 'Spread of delivery assignments' },
      { name: 'Max/Min Ratio', value: 1.4, description: 'Ratio of highest to lowest workload' },
    ],
    aiInsights: [
      'Workload distribution is within healthy bounds - top performers only handle 40% more than average.',
      'New driver onboarding assignments are appropriately ramped, preventing burnout.',
      'Route optimization reduced workload variance by 18% compared to manual assignments.',
    ],
    levelExplanation: {
      low: 'Below 70%: Unequal workload distribution. Some drivers overworked while others underutilized.',
      medium: '70-85%: Moderate workload imbalance. Review assignment algorithms for optimization.',
      high: 'Above 85%: Fair workload distribution. Drivers receive equitable assignment loads.',
    },
    recommendations: [
      'Continue using AI-based assignment balancing',
      'Monitor senior driver workloads during peak seasons',
    ],
    historicalTrend: 1.8,
  },
};

export default function BiasAuditPage() {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const fairnessMetrics = [
    { id: 'demographic', name: 'Demographic Parity', value: 0.92, threshold: 0.8, status: 'pass', icon: Users },
    { id: 'geographic', name: 'Geographic Equity', value: 0.78, threshold: 0.8, status: 'warning', icon: MapPin },
    { id: 'temporal', name: 'Temporal Fairness', value: 0.88, threshold: 0.8, status: 'pass', icon: Clock },
    { id: 'workload', name: 'Workload Distribution', value: 0.85, threshold: 0.7, status: 'pass', icon: BarChart3 },
  ];

  const getLevel = (value: number) => {
    if (value >= 0.85) return 'high';
    if (value >= 0.70) return 'medium';
    return 'low';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getLevelBgColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-400/10 border-green-400/30';
      case 'medium': return 'bg-yellow-400/10 border-yellow-400/30';
      case 'low': return 'bg-red-400/10 border-red-400/30';
      default: return 'bg-gray-400/10 border-gray-400/30';
    }
  };

  const toggleMetricExpand = (metricId: string) => {
    setExpandedMetric(expandedMetric === metricId ? null : metricId);
  };

  const zoneData = [
    { zone: 'Downtown', coverage: 98, color: '#10b981' },
    { zone: 'Marina', coverage: 95, color: '#10b981' },
    { zone: 'Jumeirah', coverage: 92, color: '#10b981' },
    { zone: 'Deira', coverage: 88, color: '#f59e0b' },
    { zone: 'Al Quoz', coverage: 78, color: '#ef4444' },
  ];

  const giniCoefficient = 0.24;
  const isGiniFair = giniCoefficient < 0.3;

  return (
    <PageLayout>
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Bias Audit <span className="text-accent-lime">Laboratory</span>
        </h1>
        <p className="text-gray-400">
          Fairness metrics and counterfactual analysis
        </p>
      </motion.div>

      {/* KPI Dashboard */}
      <div className="mb-4">
        <BiasKPIDashboard
          overallFairness={0.86}
          equityScore={0.78}
          biasIncidents={2}
          complianceRate={94}
          driversAudited={1247}
          zonesAnalyzed={156}
        />
      </div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-dark rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Overall Fairness Score</h3>
            <p className="text-gray-400">Based on 4 key metrics</p>
          </div>
          <div className="text-right">
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-5xl font-bold text-accent-lime"
            >
              86%
            </motion.p>
            <p className="text-sm text-gray-400 mt-1">Above threshold</p>
          </div>
        </div>
        
        <div className="mt-6 h-3 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-lime"
            initial={{ width: 0 }}
            animate={{ width: '86%' }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-6"
        >
          <div className="glass-dark rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-accent-lime" />
              Fairness Metrics
              <span className="text-xs text-gray-500 font-normal ml-2">(Click to expand)</span>
            </h3>

            <div className="space-y-3">
              {fairnessMetrics.map((metric, index) => {
                const details = metricDetails[metric.id];
                const level = getLevel(metric.value);
                const isExpanded = expandedMetric === metric.id;
                const Icon = metric.icon;

                return (
                  <motion.div
                    key={metric.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-xl overflow-hidden"
                  >
                    {/* Metric Header - Clickable */}
                    <motion.div
                      onClick={() => toggleMetricExpand(metric.id)}
                      className={cn(
                        'p-4 cursor-pointer transition-all',
                        isExpanded
                          ? 'bg-dark-600 ring-1 ring-accent-lime'
                          : 'bg-dark-700 hover:bg-dark-600'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className={cn('w-4 h-4', metric.status === 'pass' ? 'text-green-400' : 'text-orange-400')} />
                          <span className="font-medium text-white">{metric.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'text-lg font-bold',
                            metric.status === 'pass' ? 'text-green-400' : 'text-orange-400'
                          )}>
                            {(metric.value * 100).toFixed(0)}%
                          </span>
                          {metric.status === 'pass' ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-orange-400" />
                          )}
                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          </motion.div>
                        </div>
                      </div>

                      <div className="relative h-2 bg-dark-800 rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            'absolute inset-y-0 left-0 rounded-full',
                            metric.status === 'pass' ? 'bg-green-400' : 'bg-orange-400'
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${metric.value * 100}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/50"
                          style={{ left: `${metric.threshold * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Threshold: {(metric.threshold * 100).toFixed(0)}%
                      </p>
                    </motion.div>

                    {/* Expanded Details Panel */}
                    <AnimatePresence>
                      {isExpanded && details && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-dark-800 border-t border-dark-600 space-y-4">
                            {/* Calculation Formula */}
                            <div className="p-3 bg-dark-700 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <Calculator className="w-4 h-4 text-accent-cyan" />
                                <span className="text-sm font-medium text-accent-cyan">How It's Calculated</span>
                              </div>
                              <code className="block text-sm text-yellow-300 bg-dark-900 p-2 rounded font-mono mb-2">
                                {details.formula}
                              </code>
                              <p className="text-xs text-gray-400">{details.formulaExplanation}</p>
                            </div>

                            {/* Component Breakdown */}
                            <div className="p-3 bg-dark-700 rounded-lg">
                              <div className="flex items-center gap-2 mb-3">
                                <Activity className="w-4 h-4 text-accent-purple" />
                                <span className="text-sm font-medium text-accent-purple">Score Components</span>
                              </div>
                              <div className="space-y-2">
                                {details.components.map((comp, i) => (
                                  <div key={i} className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <p className="text-xs text-white">{comp.name}</p>
                                      <p className="text-[10px] text-gray-500">{comp.description}</p>
                                    </div>
                                    <span className="text-sm font-mono text-white ml-2">
                                      {typeof comp.value === 'number' && comp.value <= 1
                                        ? `${(comp.value * 100).toFixed(0)}%`
                                        : comp.value}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Level Explanation */}
                            <div className={cn('p-3 rounded-lg border', getLevelBgColor(level))}>
                              <div className="flex items-center gap-2 mb-2">
                                <Target className={cn('w-4 h-4', getLevelColor(level))} />
                                <span className={cn('text-sm font-medium capitalize', getLevelColor(level))}>
                                  {level} Score Explanation
                                </span>
                                {details.historicalTrend !== 0 && (
                                  <div className={cn(
                                    'flex items-center gap-1 text-xs ml-auto',
                                    details.historicalTrend > 0 ? 'text-green-400' : 'text-red-400'
                                  )}>
                                    {details.historicalTrend > 0 ? (
                                      <TrendingUp className="w-3 h-3" />
                                    ) : (
                                      <TrendingDown className="w-3 h-3" />
                                    )}
                                    {Math.abs(details.historicalTrend).toFixed(1)}% this month
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-gray-300">
                                {details.levelExplanation[level]}
                              </p>
                            </div>

                            {/* AI Insights */}
                            <div className="p-3 bg-gradient-to-r from-accent-purple/10 to-accent-magenta/10 rounded-lg border border-accent-purple/20">
                              <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-4 h-4 text-accent-magenta" />
                                <span className="text-sm font-medium text-accent-magenta">AI Insights</span>
                              </div>
                              <ul className="space-y-2">
                                {details.aiInsights.map((insight, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                                    <Lightbulb className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                                    {insight}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Recommendations */}
                            {details.recommendations.length > 0 && (
                              <div className="p-3 bg-dark-700 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="w-4 h-4 text-green-400" />
                                  <span className="text-sm font-medium text-green-400">Recommendations</span>
                                </div>
                                <ul className="space-y-1">
                                  {details.recommendations.map((rec, i) => (
                                    <li key={i} className="text-xs text-gray-400 flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                                      {rec}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Right Panel */}
        <div className="col-span-6 space-y-6">
          {/* Geographic Equity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-dark rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent-cyan" />
              Geographic Coverage
            </h3>
            
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke="#6b7280" />
                  <YAxis dataKey="zone" type="category" stroke="#6b7280" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a25',
                      border: '1px solid rgba(0, 245, 255, 0.2)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="coverage" radius={[0, 4, 4, 0]}>
                    {zoneData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Gini Coefficient */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-dark rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-purple" />
              Driver Workload Distribution
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Gini Coefficient</p>
                <p className={cn(
                  'text-4xl font-bold',
                  isGiniFair ? 'text-green-400' : 'text-orange-400'
                )}>
                  {giniCoefficient.toFixed(2)}
                </p>
                <p className={cn(
                  'text-sm mt-1',
                  isGiniFair ? 'text-green-400' : 'text-orange-400'
                )}>
                  {isGiniFair ? 'Fair distribution' : 'Unequal distribution'}
                </p>
              </div>
              
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#2e2e3a"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke={isGiniFair ? '#10b981' : '#f59e0b'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(1 - giniCoefficient) * 352} 352`}
                    initial={{ strokeDashoffset: 352 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BarChart3 className={cn(
                    'w-8 h-8',
                    isGiniFair ? 'text-green-400' : 'text-orange-400'
                  )} />
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between text-xs text-gray-400">
              <span>0 = Perfect equality</span>
              <span>1 = Maximum inequality</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Fairness Gauges & Audit Feed Row */}
      <div className="mt-6 grid grid-cols-12 gap-6">
        <div className="col-span-6">
          <FairnessGauges
            geographicEquity={0.78}
            workloadBalance={0.85}
            customerParity={0.92}
            accessEquity={0.88}
          />
        </div>
        <div className="col-span-6">
          <AuditFeed />
        </div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 glass-dark rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-dark-700 rounded-xl border-l-4 border-orange-400">
            <p className="font-medium text-white">Increase Al Quoz Coverage</p>
            <p className="text-sm text-gray-400 mt-1">
              Add 2 vehicles during peak hours to improve service equity
            </p>
          </div>
          <div className="p-4 bg-dark-700 rounded-xl border-l-4 border-green-400">
            <p className="font-medium text-white">Workload Balance Achieved</p>
            <p className="text-sm text-gray-400 mt-1">
              Driver assignments are within fair distribution thresholds
            </p>
          </div>
        </div>
      </motion.div>
    </div>
    </PageLayout>
  );
}
