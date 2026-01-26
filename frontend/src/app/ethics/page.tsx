'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Dice5, 
  Target,
  Users,
  Zap,
  ChevronRight,
  BarChart2,
  Scale,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Sliders,
  History,
  Lightbulb,
  Shield,
  Heart,
  BookOpen,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  Lock,
  DollarSign,
  Clock,
  Truck,
  UserCheck,
  Building2,
  Activity
} from 'lucide-react';
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend,
  CartesianGrid
} from 'recharts';
import { cn } from '@/lib/utils';
import PageLayout from '@/components/dashboard/PageLayout';
import {
  EthicsKPIDashboard,
  FrameworkGauges,
  DecisionFeed
} from '@/components/ethics';

// Types
interface DilemmaOption {
  id: string;
  title: string;
  description: string;
  scores: {
    utilitarian: number;
    deontological: number;
    virtue: number;
    care: number;
  };
  stakeholderImpacts?: {
    name: string;
    impact: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
  tradeoffs?: string[];
}

interface Scenario {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  stakeholders: string[];
  options: DilemmaOption[];
}

interface SimulationResult {
  successRate: number;
  avgCost: number;
  confidenceInterval: [number, number];
  simulations: number;
  riskDistribution: number[];
  percentiles: { p10: number; p50: number; p90: number };
  factors: {
    weather: number;
    traffic: number;
    driver: number;
    external: number;
  };
}

interface HistoryEntry {
  id: string;
  timestamp: Date;
  scenarioId: string;
  optionId: string;
  result: SimulationResult;
}

// Framework colors
const frameworkColors = {
  utilitarian: '#3b82f6',
  deontological: '#8b5cf6',
  virtue: '#10b981',
  care: '#f59e0b'
};

const frameworkIcons = {
  utilitarian: <TrendingUp className="w-4 h-4" />,
  deontological: <Scale className="w-4 h-4" />,
  virtue: <Shield className="w-4 h-4" />,
  care: <Heart className="w-4 h-4" />
};

const frameworkDescriptions = {
  utilitarian: 'Greatest good for the greatest number',
  deontological: 'Following moral rules and duties',
  virtue: 'Acting with moral character',
  care: 'Prioritizing relationships and context'
};

export default function EthicsSimulatorPage() {
  // Core state
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  
  // Advanced features state
  const [compareMode, setCompareMode] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<Record<string, SimulationResult>>({});
  const [simulationHistory, setSimulationHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showFrameworkInfo, setShowFrameworkInfo] = useState(false);
  
  // Framework weights (customizable)
  const [frameworkWeights, setFrameworkWeights] = useState({
    utilitarian: 0.30,
    deontological: 0.25,
    virtue: 0.25,
    care: 0.20
  });
  const [showWeightEditor, setShowWeightEditor] = useState(false);
  
  // What-if parameters
  const [whatIfParams, setWhatIfParams] = useState({
    weatherSeverity: 0.5,
    trafficDensity: 0.5,
    driverExperience: 0.7,
    externalEventProb: 0.05
  });
  const [showWhatIf, setShowWhatIf] = useState(false);

  // Scenarios data
  const scenarios: Scenario[] = [
    {
      id: 'resource',
      type: 'Resource Allocation',
      title: 'Medical vs Commercial Delivery',
      description: 'Three vehicles available, five urgent deliveries. Two for hospitals, two regular, one corporate.',
      icon: <Truck className="w-5 h-5" />,
      stakeholders: ['Hospitals', 'Regular Customers', 'Corporate Client', 'Drivers', 'Company'],
      options: [
        {
          id: 'prioritize_medical',
          title: 'Prioritize Medical',
          description: 'Hospitals first, then high-value clients',
          scores: { utilitarian: 0.85, deontological: 0.75, virtue: 0.80, care: 0.90 },
          stakeholderImpacts: [
            { name: 'Hospitals', impact: 0.95, sentiment: 'positive' },
            { name: 'Regular Customers', impact: 0.40, sentiment: 'negative' },
            { name: 'Corporate Client', impact: 0.70, sentiment: 'neutral' },
            { name: 'Drivers', impact: 0.75, sentiment: 'positive' },
            { name: 'Company', impact: 0.80, sentiment: 'positive' }
          ],
          tradeoffs: ['Medical needs prioritized', 'Regular customers may be delayed', 'Strong ethical stance']
        },
        {
          id: 'first_come',
          title: 'First-Come-First-Served',
          description: 'Process in order received',
          scores: { utilitarian: 0.45, deontological: 0.90, virtue: 0.55, care: 0.35 },
          stakeholderImpacts: [
            { name: 'Hospitals', impact: 0.50, sentiment: 'negative' },
            { name: 'Regular Customers', impact: 0.85, sentiment: 'positive' },
            { name: 'Corporate Client', impact: 0.60, sentiment: 'neutral' },
            { name: 'Drivers', impact: 0.80, sentiment: 'positive' },
            { name: 'Company', impact: 0.65, sentiment: 'neutral' }
          ],
          tradeoffs: ['Fair and consistent process', 'May delay urgent medical needs', 'Easy to defend legally']
        },
        {
          id: 'maximize_profit',
          title: 'Maximize Revenue',
          description: 'Prioritize by delivery value',
          scores: { utilitarian: 0.55, deontological: 0.30, virtue: 0.25, care: 0.20 },
          stakeholderImpacts: [
            { name: 'Hospitals', impact: 0.25, sentiment: 'negative' },
            { name: 'Regular Customers', impact: 0.30, sentiment: 'negative' },
            { name: 'Corporate Client', impact: 0.95, sentiment: 'positive' },
            { name: 'Drivers', impact: 0.70, sentiment: 'neutral' },
            { name: 'Company', impact: 0.90, sentiment: 'positive' }
          ],
          tradeoffs: ['Maximum short-term profit', 'Reputational risk', 'Ethical concerns']
        }
      ]
    },
    {
      id: 'safety',
      type: 'Safety vs Deadline',
      title: 'Fatigued Driver Dilemma',
      description: 'Driver reports fatigue with 3 deliveries remaining before window closes. Weather deteriorating.',
      icon: <UserCheck className="w-5 h-5" />,
      stakeholders: ['Driver', 'Customers', 'Company', 'Other Road Users'],
      options: [
        {
          id: 'stop_immediately',
          title: 'Stop Immediately',
          description: 'Pull over and rest, miss all remaining deliveries',
          scores: { utilitarian: 0.40, deontological: 0.95, virtue: 0.90, care: 0.85 },
          stakeholderImpacts: [
            { name: 'Driver', impact: 0.95, sentiment: 'positive' },
            { name: 'Customers', impact: 0.20, sentiment: 'negative' },
            { name: 'Company', impact: 0.50, sentiment: 'neutral' },
            { name: 'Other Road Users', impact: 0.90, sentiment: 'positive' }
          ],
          tradeoffs: ['Maximum safety', 'Missed deliveries', 'Clear ethical choice']
        },
        {
          id: 'complete_nearest',
          title: 'Complete Nearest Only',
          description: 'Deliver to closest location, then rest',
          scores: { utilitarian: 0.70, deontological: 0.65, virtue: 0.70, care: 0.75 },
          stakeholderImpacts: [
            { name: 'Driver', impact: 0.70, sentiment: 'neutral' },
            { name: 'Customers', impact: 0.55, sentiment: 'neutral' },
            { name: 'Company', impact: 0.65, sentiment: 'neutral' },
            { name: 'Other Road Users', impact: 0.75, sentiment: 'positive' }
          ],
          tradeoffs: ['Balanced approach', 'Moderate risk', 'Partial fulfillment']
        },
        {
          id: 'push_through',
          title: 'Push Through',
          description: 'Complete all deliveries despite fatigue',
          scores: { utilitarian: 0.55, deontological: 0.20, virtue: 0.25, care: 0.30 },
          stakeholderImpacts: [
            { name: 'Driver', impact: 0.15, sentiment: 'negative' },
            { name: 'Customers', impact: 0.85, sentiment: 'positive' },
            { name: 'Company', impact: 0.75, sentiment: 'positive' },
            { name: 'Other Road Users', impact: 0.20, sentiment: 'negative' }
          ],
          tradeoffs: ['All deliveries completed', 'Safety risk', 'Potential liability']
        }
      ]
    },
    {
      id: 'privacy',
      type: 'Privacy vs Optimization',
      title: 'Customer Data Collection',
      description: 'AI can improve efficiency by 25% with detailed customer behavioral data including home schedules.',
      icon: <Lock className="w-5 h-5" />,
      stakeholders: ['Customers', 'Company', 'Drivers', 'Regulators'],
      options: [
        {
          id: 'opt_in_consent',
          title: 'Opt-in Consent',
          description: 'Collect data only with explicit customer permission',
          scores: { utilitarian: 0.70, deontological: 0.95, virtue: 0.90, care: 0.85 },
          stakeholderImpacts: [
            { name: 'Customers', impact: 0.90, sentiment: 'positive' },
            { name: 'Company', impact: 0.60, sentiment: 'neutral' },
            { name: 'Drivers', impact: 0.65, sentiment: 'neutral' },
            { name: 'Regulators', impact: 0.95, sentiment: 'positive' }
          ],
          tradeoffs: ['Privacy respected', 'Lower optimization gains', 'Regulatory compliance']
        },
        {
          id: 'opt_out_default',
          title: 'Opt-out Default',
          description: 'Collect by default with opt-out option buried in settings',
          scores: { utilitarian: 0.75, deontological: 0.40, virtue: 0.45, care: 0.50 },
          stakeholderImpacts: [
            { name: 'Customers', impact: 0.40, sentiment: 'negative' },
            { name: 'Company', impact: 0.85, sentiment: 'positive' },
            { name: 'Drivers', impact: 0.80, sentiment: 'positive' },
            { name: 'Regulators', impact: 0.30, sentiment: 'negative' }
          ],
          tradeoffs: ['Higher data collection', 'Privacy concerns', 'Regulatory risk']
        },
        {
          id: 'no_collection',
          title: 'No Data Collection',
          description: 'Forgo efficiency gains to protect privacy completely',
          scores: { utilitarian: 0.50, deontological: 0.90, virtue: 0.85, care: 0.80 },
          stakeholderImpacts: [
            { name: 'Customers', impact: 0.95, sentiment: 'positive' },
            { name: 'Company', impact: 0.40, sentiment: 'negative' },
            { name: 'Drivers', impact: 0.50, sentiment: 'neutral' },
            { name: 'Regulators', impact: 0.90, sentiment: 'positive' }
          ],
          tradeoffs: ['Maximum privacy', 'Competitive disadvantage', 'Strong ethical stance']
        }
      ]
    },
    {
      id: 'fairness',
      type: 'Fairness vs Profit',
      title: 'Service Area Expansion',
      description: 'Algorithm suggests avoiding low-income areas due to lower profitability and higher risk.',
      icon: <Building2 className="w-5 h-5" />,
      stakeholders: ['Low-income Residents', 'Existing Customers', 'Investors', 'Community'],
      options: [
        {
          id: 'equal_service',
          title: 'Equal Service',
          description: 'Serve all areas equally regardless of profitability',
          scores: { utilitarian: 0.75, deontological: 0.90, virtue: 0.95, care: 0.90 },
          stakeholderImpacts: [
            { name: 'Low-income Residents', impact: 0.95, sentiment: 'positive' },
            { name: 'Existing Customers', impact: 0.80, sentiment: 'positive' },
            { name: 'Investors', impact: 0.45, sentiment: 'negative' },
            { name: 'Community', impact: 0.90, sentiment: 'positive' }
          ],
          tradeoffs: ['Social equity', 'Lower margins', 'Community goodwill']
        },
        {
          id: 'tiered_service',
          title: 'Tiered Service',
          description: 'Offer basic service to underserved areas, premium elsewhere',
          scores: { utilitarian: 0.70, deontological: 0.55, virtue: 0.60, care: 0.65 },
          stakeholderImpacts: [
            { name: 'Low-income Residents', impact: 0.55, sentiment: 'neutral' },
            { name: 'Existing Customers', impact: 0.85, sentiment: 'positive' },
            { name: 'Investors', impact: 0.70, sentiment: 'neutral' },
            { name: 'Community', impact: 0.60, sentiment: 'neutral' }
          ],
          tradeoffs: ['Compromise approach', 'Some access provided', 'Equity concerns']
        },
        {
          id: 'profit_optimize',
          title: 'Profit Optimize',
          description: 'Follow algorithm recommendation, avoid unprofitable areas',
          scores: { utilitarian: 0.40, deontological: 0.25, virtue: 0.20, care: 0.25 },
          stakeholderImpacts: [
            { name: 'Low-income Residents', impact: 0.10, sentiment: 'negative' },
            { name: 'Existing Customers', impact: 0.75, sentiment: 'positive' },
            { name: 'Investors', impact: 0.95, sentiment: 'positive' },
            { name: 'Community', impact: 0.20, sentiment: 'negative' }
          ],
          tradeoffs: ['Maximum profit', 'Discrimination concerns', 'Reputational risk']
        }
      ]
    }
  ];

  const currentScenario = scenarios.find(s => s.id === selectedScenario);
  const currentOption = currentScenario?.options.find(o => o.id === selectedOption);

  // Calculate weighted overall score
  const calculateWeightedScore = (scores: DilemmaOption['scores']) => {
    return (
      scores.utilitarian * frameworkWeights.utilitarian +
      scores.deontological * frameworkWeights.deontological +
      scores.virtue * frameworkWeights.virtue +
      scores.care * frameworkWeights.care
    );
  };

  // Run Monte Carlo simulation
  const runSimulation = async (option: DilemmaOption): Promise<SimulationResult> => {
    const scores = option.scores;
    const baseSuccessProb = (scores.utilitarian + scores.deontological + scores.virtue + scores.care) / 4;
    
    const numSimulations = 1000;
    const outcomes: { success: boolean; cost: number; risk: number }[] = [];
    
    for (let i = 0; i < numSimulations; i++) {
      // Apply what-if parameters
      const weatherFactor = (0.5 + Math.random() * 0.5) * (1 - whatIfParams.weatherSeverity * 0.5);
      const trafficFactor = (0.5 + Math.random() * 0.5) * (1 - whatIfParams.trafficDensity * 0.5);
      const driverFactor = 0.6 + Math.random() * 0.4 * whatIfParams.driverExperience;
      const externalEvent = Math.random() < whatIfParams.externalEventProb;
      
      let adjustedProb = baseSuccessProb * weatherFactor * trafficFactor * driverFactor;
      if (externalEvent) adjustedProb *= 0.5;
      
      const success = Math.random() < Math.min(adjustedProb, 0.98);
      const baseCost = success ? 800 : 2000;
      const variableCost = Math.random() * 500;
      const cost = baseCost + variableCost + (1 - baseSuccessProb) * 500;
      const risk = (1 - adjustedProb) * 0.7 + (externalEvent ? 0.3 : 0);
      
      outcomes.push({ success, cost, risk });
    }
    
    const successRate = outcomes.filter(o => o.success).length / numSimulations;
    const costs = outcomes.map(o => o.cost);
    const avgCost = costs.reduce((a, b) => a + b, 0) / numSimulations;
    const risks = outcomes.map(o => o.risk);
    
    // Risk distribution (10 bins)
    const riskDistribution = Array(10).fill(0);
    risks.forEach(r => {
      const bin = Math.min(9, Math.floor(r * 10));
      riskDistribution[bin]++;
    });
    const normalizedDist = riskDistribution.map(c => c / numSimulations);
    
    const sortedCosts = [...costs].sort((a, b) => a - b);
    
    return {
      successRate,
      avgCost: Math.round(avgCost),
      confidenceInterval: [
        Math.round(successRate * 100 - 6) / 100,
        Math.round(successRate * 100 + 6) / 100
      ],
      simulations: numSimulations,
      riskDistribution: normalizedDist,
      percentiles: {
        p10: Math.round(sortedCosts[Math.floor(0.10 * numSimulations)]),
        p50: Math.round(sortedCosts[Math.floor(0.50 * numSimulations)]),
        p90: Math.round(sortedCosts[Math.floor(0.90 * numSimulations)])
      },
      factors: {
        weather: 1 - whatIfParams.weatherSeverity,
        traffic: 1 - whatIfParams.trafficDensity,
        driver: whatIfParams.driverExperience,
        external: 1 - whatIfParams.externalEventProb * 10
      }
    };
  };

  const handleSimulate = async () => {
    if (!currentScenario || !currentOption) return;
    
    setIsSimulating(true);
    
    // Simulate processing time
    await new Promise(r => setTimeout(r, 1500));
    
    const result = await runSimulation(currentOption);
    setSimulationResult(result);
    
    // Add to history
    const historyEntry: HistoryEntry = {
      id: `${Date.now()}`,
      timestamp: new Date(),
      scenarioId: currentScenario.id,
      optionId: currentOption.id,
      result
    };
    setSimulationHistory(prev => [historyEntry, ...prev].slice(0, 10));
    
    setIsSimulating(false);
  };

  const handleCompareAll = async () => {
    if (!currentScenario) return;
    
    setIsSimulating(true);
    setCompareMode(true);
    
    await new Promise(r => setTimeout(r, 2000));
    
    const results: Record<string, SimulationResult> = {};
    for (const option of currentScenario.options) {
      results[option.id] = await runSimulation(option);
    }
    
    setComparisonResults(results);
    setIsSimulating(false);
  };

  // Radar chart data for ethical framework scores
  const radarData = useMemo(() => {
    if (!currentOption) return [];
    return [
      { framework: 'Utilitarian', score: currentOption.scores.utilitarian * 100, fullMark: 100 },
      { framework: 'Deontological', score: currentOption.scores.deontological * 100, fullMark: 100 },
      { framework: 'Virtue', score: currentOption.scores.virtue * 100, fullMark: 100 },
      { framework: 'Care', score: currentOption.scores.care * 100, fullMark: 100 }
    ];
  }, [currentOption]);

  // Comparison chart data
  const comparisonChartData = useMemo(() => {
    if (!currentScenario || Object.keys(comparisonResults).length === 0) return [];
    return currentScenario.options.map(opt => ({
      name: opt.title,
      successRate: Math.round((comparisonResults[opt.id]?.successRate || 0) * 100),
      cost: comparisonResults[opt.id]?.avgCost || 0,
      ethicalScore: Math.round(calculateWeightedScore(opt.scores) * 100)
    }));
  }, [currentScenario, comparisonResults]);

  // AI Recommendation
  const aiRecommendation = useMemo(() => {
    if (!currentScenario || Object.keys(comparisonResults).length === 0) return null;
    
    let bestOption = currentScenario.options[0];
    let bestScore = -Infinity;
    
    for (const option of currentScenario.options) {
      const result = comparisonResults[option.id];
      if (!result) continue;
      
      const ethicalScore = calculateWeightedScore(option.scores);
      const combinedScore = result.successRate * 0.4 + ethicalScore * 0.4 - (result.avgCost / 5000) * 0.2;
      
      if (combinedScore > bestScore) {
        bestScore = combinedScore;
        bestOption = option;
      }
    }
    
    return {
      option: bestOption,
      score: bestScore,
      reasoning: `Based on your framework weights and simulation results, "${bestOption.title}" offers the best balance of ${Math.round(comparisonResults[bestOption.id]?.successRate * 100)}% success rate with strong ethical alignment (${Math.round(calculateWeightedScore(bestOption.scores) * 100)}% weighted score).`
    };
  }, [currentScenario, comparisonResults, frameworkWeights]);

  return (
    <PageLayout>
      <div className="min-h-screen bg-dark-900 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Ethical Dilemma <span className="text-accent-orange">Simulator</span>
              </h1>
              <p className="text-gray-400">
                Monte Carlo simulation for ethical decision-making with multi-framework analysis
              </p>
            </div>
            
            {/* Top action buttons */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowHistory(!showHistory)}
                className={cn(
                  'px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all',
                  showHistory ? 'bg-accent-purple text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                )}
              >
                <History className="w-4 h-4" />
                History ({simulationHistory.length})
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowFrameworkInfo(!showFrameworkInfo)}
                className={cn(
                  'px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all',
                  showFrameworkInfo ? 'bg-accent-cyan text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                )}
              >
                <BookOpen className="w-4 h-4" />
                Framework Guide
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* KPI Dashboard */}
        <div className="mb-4">
          <EthicsKPIDashboard
            decisionsAnalyzed={simulationHistory.length + 247}
            avgEthicalScore={simulationResult?.successRate || 0.82}
            simulationsRun={simulationHistory.length * 1000 + 5000}
            consensusRate={78}
            stakeholdersConsidered={85}
            frameworksApplied={4}
          />
        </div>

        {/* Framework Info Panel */}
        <AnimatePresence>
          {showFrameworkInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="glass-dark rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent-cyan" />
                  Ethical Framework Guide
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(frameworkColors).map(([key, color]) => (
                    <div key={key} className="p-4 bg-dark-700 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                          {frameworkIcons[key as keyof typeof frameworkIcons]}
                        </div>
                        <span className="font-medium text-white capitalize">{key}</span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {frameworkDescriptions[key as keyof typeof frameworkDescriptions]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Panel */}
        <AnimatePresence>
          {showHistory && simulationHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="glass-dark rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-accent-purple" />
                  Simulation History
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {simulationHistory.map((entry) => {
                    const scenario = scenarios.find(s => s.id === entry.scenarioId);
                    const option = scenario?.options.find(o => o.id === entry.optionId);
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            {entry.timestamp.toLocaleTimeString()}
                          </span>
                          <span className="text-sm text-white">{scenario?.title}</span>
                          <ArrowRight className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-accent-orange">{option?.title}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-green-400">{Math.round(entry.result.successRate * 100)}%</span>
                          <span className="text-gray-400">${entry.result.avgCost}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-12 gap-6">
          {/* Scenario Selection - Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-3"
          >
            <div className="glass-dark rounded-2xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent-orange" />
                Scenarios
              </h3>
              
              <div className="space-y-3">
                {scenarios.map((scenario) => (
                  <motion.button
                    key={scenario.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      setSelectedScenario(scenario.id);
                      setSelectedOption(null);
                      setSimulationResult(null);
                      setCompareMode(false);
                      setComparisonResults({});
                    }}
                    className={cn(
                      'w-full p-4 rounded-xl text-left transition-all',
                      selectedScenario === scenario.id
                        ? 'bg-accent-orange/20 border border-accent-orange'
                        : 'bg-dark-700 border border-transparent hover:bg-dark-600'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-accent-orange">{scenario.icon}</span>
                        <span className="text-xs text-accent-orange font-medium">
                          {scenario.type}
                        </span>
                      </div>
                      <ChevronRight className={cn(
                        'w-4 h-4 transition-transform text-gray-500',
                        selectedScenario === scenario.id && 'rotate-90 text-accent-orange'
                      )} />
                    </div>
                    <p className="font-medium text-white mt-2">{scenario.title}</p>
                    <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                      {scenario.description}
                    </p>
                    {selectedScenario === scenario.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 flex flex-wrap gap-1"
                      >
                        {scenario.stakeholders.map(s => (
                          <span key={s} className="text-xs px-2 py-1 bg-dark-600 rounded text-gray-400">
                            {s}
                          </span>
                        ))}
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* What-If Parameters */}
              <div className="mt-6 pt-6 border-t border-dark-600">
                <button
                  onClick={() => setShowWhatIf(!showWhatIf)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-accent-cyan" />
                    What-If Parameters
                  </span>
                  <ChevronRight className={cn(
                    'w-4 h-4 text-gray-500 transition-transform',
                    showWhatIf && 'rotate-90'
                  )} />
                </button>
                
                <AnimatePresence>
                  {showWhatIf && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-4"
                    >
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Weather Severity</span>
                          <span className="text-white">{Math.round(whatIfParams.weatherSeverity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={whatIfParams.weatherSeverity * 100}
                          onChange={(e) => setWhatIfParams(prev => ({ ...prev, weatherSeverity: parseInt(e.target.value) / 100 }))}
                          className="w-full accent-accent-cyan"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Traffic Density</span>
                          <span className="text-white">{Math.round(whatIfParams.trafficDensity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={whatIfParams.trafficDensity * 100}
                          onChange={(e) => setWhatIfParams(prev => ({ ...prev, trafficDensity: parseInt(e.target.value) / 100 }))}
                          className="w-full accent-accent-cyan"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">Driver Experience</span>
                          <span className="text-white">{Math.round(whatIfParams.driverExperience * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={whatIfParams.driverExperience * 100}
                          onChange={(e) => setWhatIfParams(prev => ({ ...prev, driverExperience: parseInt(e.target.value) / 100 }))}
                          className="w-full accent-accent-cyan"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">External Event Probability</span>
                          <span className="text-white">{Math.round(whatIfParams.externalEventProb * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          value={whatIfParams.externalEventProb * 100}
                          onChange={(e) => setWhatIfParams(prev => ({ ...prev, externalEventProb: parseInt(e.target.value) / 100 }))}
                          className="w-full accent-accent-cyan"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Framework Weight Editor */}
              <div className="mt-6 pt-6 border-t border-dark-600">
                <button
                  onClick={() => setShowWeightEditor(!showWeightEditor)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <span className="text-sm font-medium text-white flex items-center gap-2">
                    <Scale className="w-4 h-4 text-accent-purple" />
                    Framework Weights
                  </span>
                  <ChevronRight className={cn(
                    'w-4 h-4 text-gray-500 transition-transform',
                    showWeightEditor && 'rotate-90'
                  )} />
                </button>
                
                <AnimatePresence>
                  {showWeightEditor && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 space-y-3"
                    >
                      {Object.entries(frameworkWeights).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400 capitalize">{key}</span>
                            <span className="text-white">{Math.round(value * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={value * 100}
                            onChange={(e) => {
                              const newValue = parseInt(e.target.value) / 100;
                              setFrameworkWeights(prev => ({ ...prev, [key]: newValue }));
                            }}
                            className="w-full"
                            style={{ accentColor: frameworkColors[key as keyof typeof frameworkColors] }}
                          />
                        </div>
                      ))}
                      <p className="text-xs text-gray-500 mt-2">
                        Total: {Math.round(Object.values(frameworkWeights).reduce((a, b) => a + b, 0) * 100)}%
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Main Content - Center Column */}
          <div className="col-span-6">
            <AnimatePresence mode="wait">
              {currentScenario ? (
                <motion.div
                  key={currentScenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Decision Options */}
                  <div className="glass-dark rounded-2xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">
                        Decision Options
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        onClick={handleCompareAll}
                        disabled={isSimulating}
                        className="px-4 py-2 rounded-lg bg-accent-purple/20 text-accent-purple text-sm font-medium flex items-center gap-2 hover:bg-accent-purple/30 transition-all disabled:opacity-50"
                      >
                        <Eye className="w-4 h-4" />
                        Compare All
                      </motion.button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {currentScenario.options.map((option) => (
                        <motion.button
                          key={option.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            setSelectedOption(option.id);
                            setSimulationResult(null);
                            setCompareMode(false);
                          }}
                          className={cn(
                            'p-4 rounded-xl text-left transition-all relative overflow-hidden',
                            selectedOption === option.id
                              ? 'bg-accent-orange/20 border-2 border-accent-orange'
                              : 'bg-dark-700 border-2 border-transparent hover:border-dark-500'
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-white">{option.title}</p>
                            <span className={cn(
                              'text-xs px-2 py-1 rounded font-medium',
                              calculateWeightedScore(option.scores) >= 0.7 ? 'bg-green-500/20 text-green-400' :
                              calculateWeightedScore(option.scores) >= 0.5 ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            )}>
                              {Math.round(calculateWeightedScore(option.scores) * 100)}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">{option.description}</p>
                          
                          {/* Mini framework bars */}
                          <div className="mt-3 space-y-1">
                            {Object.entries(option.scores).map(([framework, score]) => (
                              <div key={framework} className="flex items-center gap-2">
                                <div 
                                  className="w-1.5 h-1.5 rounded-full" 
                                  style={{ backgroundColor: frameworkColors[framework as keyof typeof frameworkColors] }}
                                />
                                <div className="flex-1 h-1 bg-dark-600 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: frameworkColors[framework as keyof typeof frameworkColors] }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score * 100}%` }}
                                    transition={{ delay: 0.1 }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Comparison result overlay */}
                          {compareMode && comparisonResults[option.id] && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 bg-dark-900/90 flex items-center justify-center"
                            >
                              <div className="text-center">
                                <p className="text-2xl font-bold text-green-400">
                                  {Math.round(comparisonResults[option.id].successRate * 100)}%
                                </p>
                                <p className="text-xs text-gray-400">Success Rate</p>
                                <p className="text-lg font-semibold text-white mt-1">
                                  ${comparisonResults[option.id].avgCost}
                                </p>
                                <p className="text-xs text-gray-400">Avg Cost</p>
                              </div>
                            </motion.div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Comparison Charts */}
                  {compareMode && comparisonChartData.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-dark rounded-2xl p-6 mb-6"
                    >
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-accent-purple" />
                        Decision Comparison
                      </h3>
                      
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={comparisonChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1f2937',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#fff'
                              }}
                            />
                            <Legend />
                            <Bar dataKey="successRate" name="Success Rate %" fill="#10b981" />
                            <Bar dataKey="ethicalScore" name="Ethical Score %" fill="#8b5cf6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* AI Recommendation */}
                      {aiRecommendation && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-4 p-4 bg-gradient-to-r from-accent-orange/10 to-accent-purple/10 rounded-xl border border-accent-orange/30"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-accent-orange/20 rounded-lg">
                              <Sparkles className="w-5 h-5 text-accent-orange" />
                            </div>
                            <div>
                              <p className="font-medium text-white flex items-center gap-2">
                                AI Recommendation: 
                                <span className="text-accent-orange">{aiRecommendation.option.title}</span>
                              </p>
                              <p className="text-sm text-gray-400 mt-1">
                                {aiRecommendation.reasoning}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {/* Single Option Details & Simulation */}
                  {selectedOption && currentOption && !compareMode && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {/* Ethical Framework Radar */}
                      <div className="glass-dark rounded-2xl p-6 mb-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Ethical Framework Analysis
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={radarData}>
                                <PolarGrid stroke="#374151" />
                                <PolarAngleAxis 
                                  dataKey="framework" 
                                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <PolarRadiusAxis 
                                  angle={30} 
                                  domain={[0, 100]} 
                                  tick={{ fill: '#6b7280', fontSize: 10 }}
                                />
                                <Radar
                                  name="Score"
                                  dataKey="score"
                                  stroke="#f97316"
                                  fill="#f97316"
                                  fillOpacity={0.3}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="space-y-3">
                            {Object.entries(currentOption.scores).map(([framework, score]) => (
                              <div key={framework} className="p-3 bg-dark-700 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="p-1.5 rounded"
                                      style={{ backgroundColor: `${frameworkColors[framework as keyof typeof frameworkColors]}20` }}
                                    >
                                      {frameworkIcons[framework as keyof typeof frameworkIcons]}
                                    </div>
                                    <span className="text-sm font-medium text-white capitalize">{framework}</span>
                                  </div>
                                  <span 
                                    className="text-lg font-bold"
                                    style={{ color: frameworkColors[framework as keyof typeof frameworkColors] }}
                                  >
                                    {Math.round(score * 100)}%
                                  </span>
                                </div>
                                <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: frameworkColors[framework as keyof typeof frameworkColors] }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                            <div className="p-3 bg-accent-orange/10 border border-accent-orange/30 rounded-lg">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-300">Weighted Overall</span>
                                <span className="text-xl font-bold text-accent-orange">
                                  {Math.round(calculateWeightedScore(currentOption.scores) * 100)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Monte Carlo Simulation */}
                      <div className="glass-dark rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Dice5 className="w-5 h-5 text-accent-orange" />
                            Monte Carlo Simulation
                          </h3>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSimulate}
                            disabled={isSimulating}
                            className={cn(
                              'px-6 py-3 rounded-xl font-medium flex items-center gap-2',
                              isSimulating
                                ? 'bg-dark-600 text-gray-400'
                                : 'bg-accent-orange text-white hover:shadow-lg hover:shadow-accent-orange/25'
                            )}
                          >
                            {isSimulating ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                >
                                  <RefreshCw className="w-5 h-5" />
                                </motion.div>
                                Running 1000 simulations...
                              </>
                            ) : (
                              <>
                                <Zap className="w-5 h-5" />
                                Run Simulation
                              </>
                            )}
                          </motion.button>
                        </div>

                        {/* Simulation Results */}
                        {simulationResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                          >
                            {/* Key Metrics */}
                            <div className="grid grid-cols-4 gap-4">
                              <div className="p-4 bg-dark-700 rounded-xl text-center">
                                <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                                <p className="text-2xl font-bold text-white">
                                  {Math.round(simulationResult.successRate * 100)}%
                                </p>
                                <p className="text-xs text-gray-400">Success Rate</p>
                              </div>
                              <div className="p-4 bg-dark-700 rounded-xl text-center">
                                <DollarSign className="w-6 h-6 text-accent-cyan mx-auto mb-2" />
                                <p className="text-2xl font-bold text-white">
                                  ${simulationResult.avgCost}
                                </p>
                                <p className="text-xs text-gray-400">Avg Cost</p>
                              </div>
                              <div className="p-4 bg-dark-700 rounded-xl text-center">
                                <Activity className="w-6 h-6 text-accent-purple mx-auto mb-2" />
                                <p className="text-2xl font-bold text-white">
                                  {Math.round(simulationResult.confidenceInterval[0] * 100)}-{Math.round(simulationResult.confidenceInterval[1] * 100)}%
                                </p>
                                <p className="text-xs text-gray-400">95% CI</p>
                              </div>
                              <div className="p-4 bg-dark-700 rounded-xl text-center">
                                <Dice5 className="w-6 h-6 text-accent-orange mx-auto mb-2" />
                                <p className="text-2xl font-bold text-white">
                                  {simulationResult.simulations}
                                </p>
                                <p className="text-xs text-gray-400">Simulations</p>
                              </div>
                            </div>

                            {/* Risk Distribution Chart */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-300 mb-3">Risk Distribution</h4>
                              <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={simulationResult.riskDistribution.map((val, idx) => ({ 
                                    bin: `${idx * 10}-${(idx + 1) * 10}%`, 
                                    value: Math.round(val * 100) 
                                  }))}>
                                    <XAxis dataKey="bin" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                    <Tooltip
                                      contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#fff'
                                      }}
                                    />
                                    <Bar dataKey="value" name="Frequency %">
                                      {simulationResult.riskDistribution.map((_, idx) => (
                                        <Cell 
                                          key={idx} 
                                          fill={idx < 3 ? '#10b981' : idx < 6 ? '#f59e0b' : '#ef4444'} 
                                        />
                                      ))}
                                    </Bar>
                                  </BarChart>
                                </ResponsiveContainer>
                              </div>
                            </div>

                            {/* Cost Percentiles */}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-3 bg-dark-700 rounded-lg text-center">
                                <p className="text-xs text-gray-400 mb-1">10th Percentile</p>
                                <p className="text-lg font-semibold text-green-400">${simulationResult.percentiles.p10}</p>
                              </div>
                              <div className="p-3 bg-dark-700 rounded-lg text-center">
                                <p className="text-xs text-gray-400 mb-1">Median (50th)</p>
                                <p className="text-lg font-semibold text-yellow-400">${simulationResult.percentiles.p50}</p>
                              </div>
                              <div className="p-3 bg-dark-700 rounded-lg text-center">
                                <p className="text-xs text-gray-400 mb-1">90th Percentile</p>
                                <p className="text-lg font-semibold text-red-400">${simulationResult.percentiles.p90}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-dark rounded-2xl p-12 text-center"
                >
                  <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select a scenario to begin ethical analysis</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Explore different ethical dilemmas and simulate outcomes
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Stakeholder Impact & Tradeoffs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-3"
          >
            {currentOption && (
              <div className="space-y-6 sticky top-6">
                {/* Stakeholder Impact */}
                {currentOption.stakeholderImpacts && (
                  <div className="glass-dark rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-accent-cyan" />
                      Stakeholder Impact
                    </h3>
                    <div className="space-y-3">
                      {currentOption.stakeholderImpacts.map((impact) => (
                        <div key={impact.name} className="p-3 bg-dark-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white">{impact.name}</span>
                            <span className={cn(
                              'text-xs px-2 py-1 rounded font-medium',
                              impact.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                              impact.sentiment === 'neutral' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            )}>
                              {impact.sentiment === 'positive' ? <CheckCircle className="w-3 h-3 inline mr-1" /> : 
                               impact.sentiment === 'negative' ? <AlertTriangle className="w-3 h-3 inline mr-1" /> :
                               <Info className="w-3 h-3 inline mr-1" />}
                              {Math.round(impact.impact * 100)}%
                            </span>
                          </div>
                          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                            <motion.div
                              className={cn(
                                'h-full rounded-full',
                                impact.sentiment === 'positive' ? 'bg-green-500' :
                                impact.sentiment === 'neutral' ? 'bg-yellow-500' :
                                'bg-red-500'
                              )}
                              initial={{ width: 0 }}
                              animate={{ width: `${impact.impact * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tradeoffs */}
                {currentOption.tradeoffs && (
                  <div className="glass-dark rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Scale className="w-5 h-5 text-accent-purple" />
                      Key Tradeoffs
                    </h3>
                    <div className="space-y-2">
                      {currentOption.tradeoffs.map((tradeoff, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 p-3 bg-dark-700 rounded-lg"
                        >
                          <div className="w-6 h-6 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-accent-purple">{idx + 1}</span>
                          </div>
                          <p className="text-sm text-gray-300">{tradeoff}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Insights */}
                <div className="glass-dark rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    Quick Insights
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-dark-700 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Dominant Framework</p>
                      <p className="text-sm font-medium text-white">
                        {Object.entries(currentOption.scores).reduce((a, b) => 
                          a[1] > b[1] ? a : b
                        )[0].charAt(0).toUpperCase() + Object.entries(currentOption.scores).reduce((a, b) => 
                          a[1] > b[1] ? a : b
                        )[0].slice(1)} ({Math.round(Math.max(...Object.values(currentOption.scores)) * 100)}%)
                      </p>
                    </div>
                    <div className="p-3 bg-dark-700 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Ethical Risk Level</p>
                      <p className={cn(
                        'text-sm font-medium',
                        calculateWeightedScore(currentOption.scores) >= 0.7 ? 'text-green-400' :
                        calculateWeightedScore(currentOption.scores) >= 0.5 ? 'text-yellow-400' :
                        'text-red-400'
                      )}>
                        {calculateWeightedScore(currentOption.scores) >= 0.7 ? 'Low Risk - Ethically Sound' :
                         calculateWeightedScore(currentOption.scores) >= 0.5 ? 'Medium Risk - Proceed with Caution' :
                         'High Risk - Significant Concerns'}
                      </p>
                    </div>
                    <div className="p-3 bg-dark-700 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Framework Consensus</p>
                      <p className="text-sm font-medium text-white">
                        {(() => {
                          const scores = Object.values(currentOption.scores);
                          const variance = scores.reduce((sum, s) => sum + Math.pow(s - (scores.reduce((a, b) => a + b, 0) / 4), 2), 0) / 4;
                          return variance < 0.02 ? 'Strong Agreement' : variance < 0.05 ? 'Moderate Agreement' : 'Significant Divergence';
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Bottom Row - Framework Gauges & Decision Feed */}
        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-6">
            <FrameworkGauges
              utilitarian={selectedOption && currentScenario?.options.find(o => o.id === selectedOption)?.scores.utilitarian || 0.75}
              deontological={selectedOption && currentScenario?.options.find(o => o.id === selectedOption)?.scores.deontological || 0.68}
              virtue={selectedOption && currentScenario?.options.find(o => o.id === selectedOption)?.scores.virtue || 0.72}
              care={selectedOption && currentScenario?.options.find(o => o.id === selectedOption)?.scores.care || 0.80}
            />
          </div>
          <div className="col-span-6">
            <DecisionFeed />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
