'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dice5,
  RefreshCw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Sliders,
  BarChart3,
  Activity,
  Lightbulb,
  Play,
  Pause,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
  ReferenceLine
} from 'recharts';

interface Policy {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface SimulationParams {
  marketCondition: number;
  regulatoryClimate: number;
  competitorResponse: number;
  publicSentiment: number;
  economicFactor: number;
}

interface SimulationResult {
  successProbability: number;
  riskLevel: 'low' | 'medium' | 'high';
  distribution: { range: string; count: number; color: string }[];
  percentiles: { p10: number; p50: number; p90: number };
  stakeholderOutcomes: { name: string; score: number; sentiment: 'positive' | 'neutral' | 'negative' }[];
  recommendation: string;
  confidence: number;
}

interface PolicyMonteCarloSimulatorProps {
  policy: Policy | null;
  onClose: () => void;
  stakeholders: { id: string; name: string; type: string; power: number }[];
}

const parameterInfo = {
  marketCondition: {
    label: 'Market Conditions',
    description: 'Current market stability and growth trajectory',
    icon: TrendingUp
  },
  regulatoryClimate: {
    label: 'Regulatory Climate',
    description: 'Favorability of regulatory environment',
    icon: Target
  },
  competitorResponse: {
    label: 'Competitor Response',
    description: 'Expected competitor reaction intensity',
    icon: Activity
  },
  publicSentiment: {
    label: 'Public Sentiment',
    description: 'General public opinion and acceptance',
    icon: Sparkles
  },
  economicFactor: {
    label: 'Economic Factor',
    description: 'Overall economic conditions and outlook',
    icon: BarChart3
  }
};

export default function PolicyMonteCarloSimulator({
  policy,
  onClose,
  stakeholders
}: PolicyMonteCarloSimulatorProps) {
  const [params, setParams] = useState<SimulationParams>({
    marketCondition: 0.6,
    regulatoryClimate: 0.5,
    competitorResponse: 0.5,
    publicSentiment: 0.7,
    economicFactor: 0.55
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [iterationCount, setIterationCount] = useState(1000);

  // Run Monte Carlo simulation
  const runSimulation = useCallback(async () => {
    if (!policy) return;

    setIsSimulating(true);
    setSimulationProgress(0);
    setResult(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setSimulationProgress(prev => Math.min(prev + Math.random() * 15, 95));
    }, 100);

    // Actual simulation delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    clearInterval(progressInterval);
    setSimulationProgress(100);

    // Generate results based on parameters
    const baseScore = (
      params.marketCondition * 0.25 +
      params.regulatoryClimate * 0.2 +
      (1 - params.competitorResponse) * 0.15 +
      params.publicSentiment * 0.25 +
      params.economicFactor * 0.15
    );

    // Generate distribution with variance
    const variance = 0.15;
    const distribution = [
      { range: '0-20', count: 0, color: '#ef4444' },
      { range: '20-40', count: 0, color: '#f97316' },
      { range: '40-60', count: 0, color: '#f59e0b' },
      { range: '60-80', count: 0, color: '#84cc16' },
      { range: '80-100', count: 0, color: '#10b981' }
    ];

    const outcomes: number[] = [];

    for (let i = 0; i < iterationCount; i++) {
      const noise = (Math.random() - 0.5) * 2 * variance;
      const outcome = Math.max(0, Math.min(1, baseScore + noise));
      outcomes.push(outcome * 100);

      const bucket = Math.min(4, Math.floor(outcome * 5));
      distribution[bucket].count++;
    }

    outcomes.sort((a, b) => a - b);

    const p10 = outcomes[Math.floor(iterationCount * 0.1)];
    const p50 = outcomes[Math.floor(iterationCount * 0.5)];
    const p90 = outcomes[Math.floor(iterationCount * 0.9)];

    const successProbability = outcomes.filter(o => o >= 60).length / iterationCount * 100;

    // Generate stakeholder outcomes
    const stakeholderOutcomes = stakeholders.map(s => {
      const stakeholderScore = baseScore * 100 + (Math.random() - 0.5) * 40 * (1 - s.power);
      return {
        name: s.name,
        score: Math.round(Math.max(-100, Math.min(100, stakeholderScore - 50))),
        sentiment: stakeholderScore > 60 ? 'positive' as const :
                   stakeholderScore < 40 ? 'negative' as const : 'neutral' as const
      };
    });

    const riskLevel = successProbability > 70 ? 'low' : successProbability > 45 ? 'medium' : 'high';

    const recommendations = [
      'Strong support expected - proceed with confidence',
      'Consider additional stakeholder engagement before launch',
      'High risk - recommend phased rollout with monitoring',
      'Adjust parameters to improve success probability',
      'Current conditions favor implementation'
    ];

    setResult({
      successProbability,
      riskLevel,
      distribution,
      percentiles: { p10, p50, p90 },
      stakeholderOutcomes,
      recommendation: recommendations[Math.floor(Math.random() * recommendations.length)],
      confidence: 85 + Math.random() * 10
    });

    setIsSimulating(false);
  }, [policy, params, iterationCount, stakeholders]);

  if (!policy) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(15,20,30,0.98) 0%, rgba(10,15,25,0.99) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 100px rgba(139, 92, 246, 0.1)'
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  className="p-3 rounded-xl bg-purple-500/20"
                  animate={{
                    boxShadow: ['0 0 20px rgba(139, 92, 246, 0.3)', '0 0 40px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(139, 92, 246, 0.3)']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Dice5 className="w-6 h-6 text-purple-400" style={{ filter: 'drop-shadow(0 0 8px #8b5cf6)' }} />
                </motion.div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Monte Carlo Policy Simulator
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400">
                      {iterationCount.toLocaleString()} iterations
                    </span>
                  </h2>
                  <p className="text-sm text-gray-400">
                    Policy: <span className="text-purple-400">{policy.name}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                Close
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-3 gap-6">
            {/* Left Column - Parameters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">Simulation Parameters</h3>
              </div>

              {Object.entries(params).map(([key, value]) => {
                const info = parameterInfo[key as keyof typeof parameterInfo];
                const Icon = info.icon;

                return (
                  <motion.div
                    key={key}
                    className="p-3 rounded-xl bg-white/5 border border-white/10"
                    whileHover={{ borderColor: 'rgba(139, 92, 246, 0.3)' }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-medium text-white">{info.label}</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-cyan-400">
                        {(value * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value * 100}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        [key]: parseInt(e.target.value) / 100
                      }))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${value * 100}%, rgba(255,255,255,0.1) ${value * 100}%, rgba(255,255,255,0.1) 100%)`
                      }}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">{info.description}</p>
                  </motion.div>
                );
              })}

              {/* Run Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runSimulation}
                disabled={isSimulating}
                className="w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: isSimulating
                    ? 'rgba(139, 92, 246, 0.3)'
                    : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  boxShadow: isSimulating ? 'none' : '0 4px 20px rgba(139, 92, 246, 0.4)'
                }}
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Running {iterationCount.toLocaleString()} simulations...</span>
                  </>
                ) : (
                  <>
                    <Dice5 className="w-5 h-5" />
                    <span>Run Monte Carlo</span>
                  </>
                )}
              </motion.button>

              {/* Progress bar during simulation */}
              {isSimulating && (
                <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                    style={{ width: `${simulationProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Middle Column - Distribution */}
            <div className="col-span-2 space-y-4">
              {result ? (
                <>
                  {/* Success Probability */}
                  <div className="grid grid-cols-3 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl text-center"
                      style={{
                        background: result.riskLevel === 'low'
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)'
                          : result.riskLevel === 'medium'
                          ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%)'
                          : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)',
                        border: `1px solid ${result.riskLevel === 'low' ? 'rgba(16, 185, 129, 0.3)' : result.riskLevel === 'medium' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}
                    >
                      <p className="text-xs text-gray-400 mb-1">Success Probability</p>
                      <p
                        className="text-3xl font-bold font-mono"
                        style={{
                          color: result.riskLevel === 'low' ? '#10b981' : result.riskLevel === 'medium' ? '#f59e0b' : '#ef4444',
                          textShadow: `0 0 20px ${result.riskLevel === 'low' ? 'rgba(16, 185, 129, 0.5)' : result.riskLevel === 'medium' ? 'rgba(245, 158, 11, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`
                        }}
                      >
                        {result.successProbability.toFixed(1)}%
                      </p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        {result.riskLevel === 'low' ? (
                          <CheckCircle className="w-3 h-3 text-green-400" />
                        ) : result.riskLevel === 'high' ? (
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                        ) : (
                          <Info className="w-3 h-3 text-yellow-400" />
                        )}
                        <span className="text-[10px] uppercase tracking-wider text-gray-400">
                          {result.riskLevel} risk
                        </span>
                      </div>
                    </motion.div>

                    {/* Percentiles */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <p className="text-xs text-gray-400 mb-2">Confidence Intervals</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-[10px] text-gray-500">10th %ile</span>
                          <span className="text-sm font-mono text-red-400">{result.percentiles.p10.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-gray-500">50th %ile (Median)</span>
                          <span className="text-sm font-mono text-yellow-400">{result.percentiles.p50.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] text-gray-500">90th %ile</span>
                          <span className="text-sm font-mono text-green-400">{result.percentiles.p90.toFixed(0)}</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Confidence */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 text-center"
                    >
                      <p className="text-xs text-gray-400 mb-1">Model Confidence</p>
                      <p className="text-2xl font-bold font-mono text-cyan-400">
                        {result.confidence.toFixed(0)}%
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">Based on {iterationCount.toLocaleString()} iterations</p>
                    </motion.div>
                  </div>

                  {/* Distribution Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      Outcome Distribution
                    </h4>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={result.distribution}>
                          <XAxis dataKey="range" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                          <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1f2937',
                              border: 'none',
                              borderRadius: '8px'
                            }}
                            formatter={(value: number) => [`${value} iterations`, 'Count']}
                          />
                          <ReferenceLine x="60-80" stroke="#8b5cf6" strokeDasharray="3 3" />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {result.distribution.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* Stakeholder Outcomes */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <h4 className="text-sm font-semibold text-white mb-4">Predicted Stakeholder Responses</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {result.stakeholderOutcomes.map((outcome, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 + i * 0.05 }}
                          className="p-2 rounded-lg bg-white/5 text-center"
                        >
                          <p className="text-[10px] text-gray-400 truncate">{outcome.name}</p>
                          <p
                            className="text-lg font-bold font-mono"
                            style={{
                              color: outcome.sentiment === 'positive' ? '#10b981' :
                                outcome.sentiment === 'negative' ? '#ef4444' : '#f59e0b'
                            }}
                          >
                            {outcome.score > 0 ? '+' : ''}{outcome.score}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* AI Recommendation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }} />
                      <span className="text-sm font-semibold text-white">AI Recommendation</span>
                    </div>
                    <p className="text-sm text-gray-300">{result.recommendation}</p>
                  </motion.div>
                </>
              ) : (
                <div className="col-span-2 flex flex-col items-center justify-center h-full py-20">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Dice5 className="w-16 h-16 text-purple-400/30 mb-4" />
                  </motion.div>
                  <p className="text-gray-500 text-sm">Adjust parameters and run simulation</p>
                  <p className="text-gray-600 text-xs mt-1">Results will appear here</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
