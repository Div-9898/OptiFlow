'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  Users, 
  Zap, 
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Filter,
  Search,
  Info,
  FileText,
  ArrowRight,
  Shield,
  Building2,
  Truck,
  UserCheck,
  Gavel,
  Home,
  DollarSign,
  Package,
  Swords,
  Lightbulb,
  Activity,
  Eye,
  Sparkles,
  Settings
} from 'lucide-react';
import { 
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  Legend,
  CartesianGrid
} from 'recharts';
import { cn } from '@/lib/utils';
import PageLayout from '@/components/dashboard/PageLayout';

// Types
interface Stakeholder {
  id: string;
  name: string;
  type: string;
  power: number;
  interest: number;
  influence: number;
  description: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface Link {
  source: string;
  target: string;
  type: string;
  strength: number;
}

interface Policy {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface PolicyImpact {
  stakeholderId: string;
  score: number;
  positive: string[];
  negative: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

// Icon mapping for stakeholder types
const stakeholderIcons: Record<string, React.ReactNode> = {
  company: <Building2 className="w-4 h-4" />,
  drivers: <Truck className="w-4 h-4" />,
  customers: <UserCheck className="w-4 h-4" />,
  regulators: <Gavel className="w-4 h-4" />,
  community: <Home className="w-4 h-4" />,
  shareholders: <DollarSign className="w-4 h-4" />,
  suppliers: <Package className="w-4 h-4" />,
  competitors: <Swords className="w-4 h-4" />
};

// Color scheme for stakeholder types
const typeColors: Record<string, string> = {
  company: '#00f5ff',
  drivers: '#39ff14',
  customers: '#a855f7',
  regulators: '#ef4444',
  community: '#f59e0b',
  shareholders: '#3b82f6',
  suppliers: '#10b981',
  competitors: '#f43f5e'
};

// Relationship type colors and labels
const relationshipTypes: Record<string, { color: string; label: string }> = {
  employs: { color: '#39ff14', label: 'Employs' },
  serves: { color: '#a855f7', label: 'Serves' },
  regulates: { color: '#ef4444', label: 'Regulates' },
  impacts: { color: '#f59e0b', label: 'Impacts' },
  invests_in: { color: '#3b82f6', label: 'Invests In' },
  delivers_to: { color: '#00f5ff', label: 'Delivers To' },
  protects: { color: '#10b981', label: 'Protects' },
  depends_on: { color: '#8b5cf6', label: 'Depends On' },
  conflicts_with: { color: '#f43f5e', label: 'Conflicts With' },
  benefits_from: { color: '#22d3ee', label: 'Benefits From' },
  influences: { color: '#fbbf24', label: 'Influences' }
};

export default function StakeholdersPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedStakeholder, setSelectedStakeholder] = useState<string | null>(null);
  const [hoveredStakeholder, setHoveredStakeholder] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [showPolicySimulator, setShowPolicySimulator] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [policyImpacts, setPolicyImpacts] = useState<Record<string, PolicyImpact>>({});
  const [filterType, setFilterType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'network' | 'matrix' | 'influence'>('network');
  const animationRef = useRef<number>();

  // Extended stakeholder data
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([
    { id: 'company', name: 'Logistics Company', type: 'company', power: 0.9, interest: 0.95, influence: 0.85, description: 'The logistics company operating the platform' },
    { id: 'drivers', name: 'Delivery Drivers', type: 'drivers', power: 0.6, interest: 0.9, influence: 0.7, description: 'Employees who perform deliveries' },
    { id: 'customers', name: 'Customers', type: 'customers', power: 0.7, interest: 0.85, influence: 0.75, description: 'End customers receiving deliveries' },
    { id: 'regulators', name: 'Regulatory Bodies', type: 'regulators', power: 0.85, interest: 0.6, influence: 0.8, description: 'Government and regulatory agencies' },
    { id: 'community', name: 'Local Community', type: 'community', power: 0.4, interest: 0.5, influence: 0.45, description: 'Communities affected by logistics operations' },
    { id: 'shareholders', name: 'Shareholders', type: 'shareholders', power: 0.8, interest: 0.9, influence: 0.75, description: 'Company investors and shareholders' },
    { id: 'suppliers', name: 'Technology Suppliers', type: 'suppliers', power: 0.5, interest: 0.7, influence: 0.55, description: 'Technology and vehicle suppliers' },
    { id: 'competitors', name: 'Competitors', type: 'competitors', power: 0.6, interest: 0.8, influence: 0.5, description: 'Competing logistics companies' }
  ]);

  const links: Link[] = [
    { source: 'company', target: 'drivers', type: 'employs', strength: 0.9 },
    { source: 'company', target: 'customers', type: 'serves', strength: 0.85 },
    { source: 'regulators', target: 'company', type: 'regulates', strength: 0.8 },
    { source: 'company', target: 'community', type: 'impacts', strength: 0.6 },
    { source: 'shareholders', target: 'company', type: 'invests_in', strength: 0.85 },
    { source: 'drivers', target: 'customers', type: 'delivers_to', strength: 0.9 },
    { source: 'regulators', target: 'drivers', type: 'protects', strength: 0.7 },
    { source: 'company', target: 'suppliers', type: 'depends_on', strength: 0.65 },
    { source: 'competitors', target: 'company', type: 'conflicts_with', strength: 0.4 },
    { source: 'customers', target: 'company', type: 'benefits_from', strength: 0.8 },
    { source: 'community', target: 'regulators', type: 'influences', strength: 0.5 },
    { source: 'shareholders', target: 'drivers', type: 'influences', strength: 0.4 }
  ];

  const policies: Policy[] = [
    { id: 'efficiency_increase', name: 'Efficiency Optimization', description: 'Implement AI-driven route optimization to reduce delivery times by 25%', category: 'Operations' },
    { id: 'safety_policy', name: 'Enhanced Safety Protocol', description: 'Mandatory rest periods and driver fatigue monitoring systems', category: 'Safety' },
    { id: 'green_initiative', name: 'Green Fleet Initiative', description: 'Transition 50% of fleet to electric vehicles by 2025', category: 'Environment' },
    { id: 'fair_pricing', name: 'Fair Pricing Model', description: 'Transparent pricing with no surge fees for essential deliveries', category: 'Pricing' },
    { id: 'data_privacy', name: 'Data Privacy Enhancement', description: 'Opt-in only data collection with full transparency', category: 'Privacy' }
  ];

  // Initialize positions for force simulation
  useEffect(() => {
    const centerX = 300;
    const centerY = 250;
    
    setStakeholders(prev => prev.map((s, i) => {
      const angle = (i / prev.length) * Math.PI * 2 - Math.PI / 2;
      const radius = 150;
      return {
        ...s,
        x: centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 20,
        y: centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0
      };
    }));
  }, []);

  // Force-directed simulation
  useEffect(() => {
    if (!simulationRunning) return;

    const simulate = () => {
      setStakeholders(prev => {
        const newPositions = [...prev];
        const centerX = 300;
        const centerY = 250;
        
        // Apply forces
        for (let i = 0; i < newPositions.length; i++) {
          let fx = 0, fy = 0;
          
          // Repulsion between nodes
          for (let j = 0; j < newPositions.length; j++) {
            if (i === j) continue;
            const dx = (newPositions[i].x || 0) - (newPositions[j].x || 0);
            const dy = (newPositions[i].y || 0) - (newPositions[j].y || 0);
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 1000 / (dist * dist);
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }
          
          // Attraction to linked nodes
          links.forEach(link => {
            if (link.source === newPositions[i].id || link.target === newPositions[i].id) {
              const otherId = link.source === newPositions[i].id ? link.target : link.source;
              const other = newPositions.find(n => n.id === otherId);
              if (other) {
                const dx = (other.x || 0) - (newPositions[i].x || 0);
                const dy = (other.y || 0) - (newPositions[i].y || 0);
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                fx += dx * link.strength * 0.01;
                fy += dy * link.strength * 0.01;
              }
            }
          });
          
          // Center gravity
          fx += (centerX - (newPositions[i].x || 0)) * 0.01;
          fy += (centerY - (newPositions[i].y || 0)) * 0.01;
          
          // Update velocity and position
          newPositions[i].vx = ((newPositions[i].vx || 0) + fx) * 0.5;
          newPositions[i].vy = ((newPositions[i].vy || 0) + fy) * 0.5;
          newPositions[i].x = (newPositions[i].x || 0) + (newPositions[i].vx || 0);
          newPositions[i].y = (newPositions[i].y || 0) + (newPositions[i].vy || 0);
          
          // Boundary constraints
          newPositions[i].x = Math.max(50, Math.min(550, newPositions[i].x || 0));
          newPositions[i].y = Math.max(50, Math.min(450, newPositions[i].y || 0));
        }
        
        return newPositions;
      });
      
      animationRef.current = requestAnimationFrame(simulate);
    };
    
    animationRef.current = requestAnimationFrame(simulate);
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [simulationRunning, links]);

  // Simulate policy impact
  const simulatePolicy = async (policyId: string) => {
    setIsSimulating(true);
    setSelectedPolicy(policyId);
    
    await new Promise(r => setTimeout(r, 1500));
    
    const impacts: Record<string, PolicyImpact> = {};
    
    // Predefined policy impacts
    const policyEffects: Record<string, Record<string, PolicyImpact>> = {
      efficiency_increase: {
        company: { stakeholderId: 'company', score: 0.8, positive: ['Higher profits', 'Better reputation', 'Competitive advantage'], negative: [], sentiment: 'positive' },
        drivers: { stakeholderId: 'drivers', score: 0.4, positive: ['Less idle time', 'Optimized routes'], negative: ['Increased workload', 'Less flexibility'], sentiment: 'neutral' },
        customers: { stakeholderId: 'customers', score: 0.9, positive: ['Faster delivery', 'Better tracking', 'Lower costs'], negative: [], sentiment: 'positive' },
        regulators: { stakeholderId: 'regulators', score: 0.3, positive: ['Innovation encouragement'], negative: ['Need new regulations'], sentiment: 'neutral' },
        community: { stakeholderId: 'community', score: -0.2, positive: [], negative: ['More traffic', 'Noise pollution'], sentiment: 'negative' },
        shareholders: { stakeholderId: 'shareholders', score: 0.85, positive: ['Higher returns', 'Growth potential'], negative: [], sentiment: 'positive' },
        suppliers: { stakeholderId: 'suppliers', score: 0.5, positive: ['New tech demands'], negative: ['Higher standards'], sentiment: 'neutral' },
        competitors: { stakeholderId: 'competitors', score: -0.6, positive: [], negative: ['Market pressure', 'Need to adapt'], sentiment: 'negative' }
      },
      safety_policy: {
        company: { stakeholderId: 'company', score: 0.3, positive: ['Reduced liability', 'Better image'], negative: ['Higher costs', 'Slower operations'], sentiment: 'neutral' },
        drivers: { stakeholderId: 'drivers', score: 0.9, positive: ['Better working conditions', 'Health protection', 'Job security'], negative: [], sentiment: 'positive' },
        customers: { stakeholderId: 'customers', score: -0.1, positive: ['Safer deliveries'], negative: ['Possible delays'], sentiment: 'neutral' },
        regulators: { stakeholderId: 'regulators', score: 0.8, positive: ['Compliance', 'Industry leadership'], negative: [], sentiment: 'positive' },
        community: { stakeholderId: 'community', score: 0.6, positive: ['Safer roads', 'Less accidents'], negative: [], sentiment: 'positive' },
        shareholders: { stakeholderId: 'shareholders', score: 0.2, positive: ['Long-term stability'], negative: ['Short-term costs'], sentiment: 'neutral' },
        suppliers: { stakeholderId: 'suppliers', score: 0.4, positive: ['Safety tech demand'], negative: [], sentiment: 'neutral' },
        competitors: { stakeholderId: 'competitors', score: 0.1, positive: [], negative: ['Industry standard change'], sentiment: 'neutral' }
      },
      green_initiative: {
        company: { stakeholderId: 'company', score: 0.5, positive: ['Brand value', 'Future readiness'], negative: ['High investment'], sentiment: 'neutral' },
        drivers: { stakeholderId: 'drivers', score: 0.6, positive: ['Modern vehicles', 'Training opportunities'], negative: ['Learning curve'], sentiment: 'positive' },
        customers: { stakeholderId: 'customers', score: 0.7, positive: ['Eco-friendly option', 'Premium feel'], negative: [], sentiment: 'positive' },
        regulators: { stakeholderId: 'regulators', score: 0.9, positive: ['Environmental compliance', 'Policy alignment'], negative: [], sentiment: 'positive' },
        community: { stakeholderId: 'community', score: 0.85, positive: ['Cleaner air', 'Less noise', 'Better health'], negative: [], sentiment: 'positive' },
        shareholders: { stakeholderId: 'shareholders', score: 0.4, positive: ['ESG appeal', 'Future growth'], negative: ['Capital requirements'], sentiment: 'neutral' },
        suppliers: { stakeholderId: 'suppliers', score: 0.75, positive: ['New contracts', 'EV infrastructure'], negative: [], sentiment: 'positive' },
        competitors: { stakeholderId: 'competitors', score: -0.3, positive: [], negative: ['Competitive pressure'], sentiment: 'negative' }
      },
      fair_pricing: {
        company: { stakeholderId: 'company', score: 0.2, positive: ['Customer loyalty', 'Market share'], negative: ['Lower margins'], sentiment: 'neutral' },
        drivers: { stakeholderId: 'drivers', score: 0.3, positive: ['Stable demand'], negative: ['Less bonus opportunities'], sentiment: 'neutral' },
        customers: { stakeholderId: 'customers', score: 0.95, positive: ['Predictable costs', 'Fairness', 'Trust'], negative: [], sentiment: 'positive' },
        regulators: { stakeholderId: 'regulators', score: 0.7, positive: ['Consumer protection'], negative: [], sentiment: 'positive' },
        community: { stakeholderId: 'community', score: 0.8, positive: ['Accessible services', 'Equity'], negative: [], sentiment: 'positive' },
        shareholders: { stakeholderId: 'shareholders', score: -0.3, positive: ['Brand value'], negative: ['Lower profits'], sentiment: 'negative' },
        suppliers: { stakeholderId: 'suppliers', score: 0.1, positive: [], negative: ['Price pressure'], sentiment: 'neutral' },
        competitors: { stakeholderId: 'competitors', score: -0.5, positive: [], negative: ['Price war risk'], sentiment: 'negative' }
      },
      data_privacy: {
        company: { stakeholderId: 'company', score: 0.4, positive: ['Trust building', 'Compliance'], negative: ['Less data insights'], sentiment: 'neutral' },
        drivers: { stakeholderId: 'drivers', score: 0.6, positive: ['Privacy protection'], negative: [], sentiment: 'positive' },
        customers: { stakeholderId: 'customers', score: 0.9, positive: ['Control over data', 'Transparency', 'Trust'], negative: [], sentiment: 'positive' },
        regulators: { stakeholderId: 'regulators', score: 0.85, positive: ['GDPR alignment', 'Best practices'], negative: [], sentiment: 'positive' },
        community: { stakeholderId: 'community', score: 0.7, positive: ['Privacy rights'], negative: [], sentiment: 'positive' },
        shareholders: { stakeholderId: 'shareholders', score: 0.1, positive: ['Reduced risk'], negative: ['Limited analytics'], sentiment: 'neutral' },
        suppliers: { stakeholderId: 'suppliers', score: 0.2, positive: [], negative: ['Data restrictions'], sentiment: 'neutral' },
        competitors: { stakeholderId: 'competitors', score: 0.3, positive: [], negative: ['Industry standard'], sentiment: 'neutral' }
      }
    };
    
    const selectedEffects = policyEffects[policyId] || {};
    stakeholders.forEach(s => {
      impacts[s.id] = selectedEffects[s.id] || {
        stakeholderId: s.id,
        score: (Math.random() - 0.3) * 1.2,
        positive: [],
        negative: [],
        sentiment: 'neutral'
      };
    });
    
    setPolicyImpacts(impacts);
    setIsSimulating(false);
  };

  const getStakeholderById = (id: string) => stakeholders.find(s => s.id === id);

  // Filter stakeholders
  const filteredStakeholders = useMemo(() => {
    return stakeholders.filter(s => {
      if (filterType && s.type !== filterType) return false;
      if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [stakeholders, filterType, searchQuery]);

  // Quadrant categorization
  const quadrants = useMemo(() => ({
    manage_closely: stakeholders.filter(s => s.power >= 0.6 && s.interest >= 0.6),
    keep_satisfied: stakeholders.filter(s => s.power >= 0.6 && s.interest < 0.6),
    keep_informed: stakeholders.filter(s => s.power < 0.6 && s.interest >= 0.6),
    monitor: stakeholders.filter(s => s.power < 0.6 && s.interest < 0.6),
  }), [stakeholders]);

  // Scatter chart data for power-interest matrix
  const scatterData = useMemo(() => {
    return stakeholders.map(s => ({
      x: s.interest * 100,
      y: s.power * 100,
      z: s.influence * 100,
      name: s.name,
      id: s.id,
      type: s.type
    }));
  }, [stakeholders]);

  // Influence radar data
  const influenceData = useMemo(() => {
    if (!selectedStakeholder) return [];
    const s = getStakeholderById(selectedStakeholder);
    if (!s) return [];
    return [
      { metric: 'Power', value: s.power * 100 },
      { metric: 'Interest', value: s.interest * 100 },
      { metric: 'Influence', value: s.influence * 100 },
      { metric: 'Connections', value: links.filter(l => l.source === s.id || l.target === s.id).length * 15 },
      { metric: 'Centrality', value: 70 + Math.random() * 20 }
    ];
  }, [selectedStakeholder, links]);

  // Policy impact summary
  const policyImpactSummary = useMemo(() => {
    if (Object.keys(policyImpacts).length === 0) return null;
    
    const scores = Object.values(policyImpacts).map(i => i.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const positiveCount = scores.filter(s => s > 0.3).length;
    const negativeCount = scores.filter(s => s < -0.2).length;
    const neutralCount = scores.length - positiveCount - negativeCount;
    
    const risks = stakeholders.filter(s => 
      policyImpacts[s.id]?.score < -0.2 && s.power > 0.6
    );
    
    return {
      avgScore,
      positiveCount,
      negativeCount,
      neutralCount,
      risks,
      recommendation: avgScore > 0.4 ? 'Strong support expected' : 
                       avgScore > 0.1 ? 'Mixed reception, engage key stakeholders' :
                       'Significant opposition likely, reconsider approach'
    };
  }, [policyImpacts, stakeholders]);

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
                Stakeholder <span className="text-accent-cyan">Network</span>
              </h1>
              <p className="text-gray-400">
                Interactive force-directed graph with policy impact simulation
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-dark-700 rounded-lg p-1">
                {[
                  { id: 'network', label: 'Network', icon: <Network className="w-4 h-4" /> },
                  { id: 'matrix', label: 'Matrix', icon: <Target className="w-4 h-4" /> },
                  { id: 'influence', label: 'Influence', icon: <Activity className="w-4 h-4" /> }
                ].map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id as typeof viewMode)}
                    className={cn(
                      'px-3 py-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all',
                      viewMode === mode.id ? 'bg-accent-cyan text-dark-900' : 'text-gray-400 hover:text-white'
                    )}
                  >
                    {mode.icon}
                    {mode.label}
                  </button>
                ))}
              </div>
              
              {/* Policy Simulator Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowPolicySimulator(!showPolicySimulator)}
                className={cn(
                  'px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all',
                  showPolicySimulator ? 'bg-accent-purple text-white' : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                )}
              >
                <Sparkles className="w-4 h-4" />
                Policy Simulator
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Policy Simulator Panel */}
        <AnimatePresence>
          {showPolicySimulator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="glass-dark rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent-purple" />
                  Policy Impact Simulator
                </h3>
                
                <div className="grid grid-cols-5 gap-4 mb-6">
                  {policies.map(policy => (
                    <motion.button
                      key={policy.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => simulatePolicy(policy.id)}
                      disabled={isSimulating}
                      className={cn(
                        'p-4 rounded-xl text-left transition-all',
                        selectedPolicy === policy.id
                          ? 'bg-accent-purple/20 border-2 border-accent-purple'
                          : 'bg-dark-700 border-2 border-transparent hover:border-dark-500'
                      )}
                    >
                      <span className="text-xs text-accent-purple font-medium">{policy.category}</span>
                      <p className="font-medium text-white mt-1">{policy.name}</p>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{policy.description}</p>
                    </motion.button>
                  ))}
                </div>

                {/* Policy Impact Results */}
                {policyImpactSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="p-4 bg-dark-700 rounded-xl text-center">
                        <p className={cn(
                          'text-2xl font-bold',
                          policyImpactSummary.avgScore > 0.3 ? 'text-green-400' :
                          policyImpactSummary.avgScore > 0 ? 'text-yellow-400' : 'text-red-400'
                        )}>
                          {policyImpactSummary.avgScore > 0 ? '+' : ''}{(policyImpactSummary.avgScore * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Avg Support</p>
                      </div>
                      <div className="p-4 bg-dark-700 rounded-xl text-center">
                        <p className="text-2xl font-bold text-green-400">{policyImpactSummary.positiveCount}</p>
                        <p className="text-xs text-gray-400 mt-1">Supporters</p>
                      </div>
                      <div className="p-4 bg-dark-700 rounded-xl text-center">
                        <p className="text-2xl font-bold text-yellow-400">{policyImpactSummary.neutralCount}</p>
                        <p className="text-xs text-gray-400 mt-1">Neutral</p>
                      </div>
                      <div className="p-4 bg-dark-700 rounded-xl text-center">
                        <p className="text-2xl font-bold text-red-400">{policyImpactSummary.negativeCount}</p>
                        <p className="text-xs text-gray-400 mt-1">Opponents</p>
                      </div>
                    </div>
                    
                    {policyImpactSummary.risks.length > 0 && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-4">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">High-Power Opposition</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {policyImpactSummary.risks.map(s => (
                            <span key={s.id} className="px-3 py-1 bg-red-500/20 rounded-full text-xs text-red-400">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="p-4 bg-accent-cyan/10 border border-accent-cyan/30 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-accent-cyan" />
                        <span className="font-medium text-white">AI Recommendation:</span>
                        <span className="text-gray-300">{policyImpactSummary.recommendation}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Visualization Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-8 glass-dark rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {viewMode === 'network' && <Network className="w-5 h-5 text-accent-cyan" />}
                {viewMode === 'matrix' && <Target className="w-5 h-5 text-accent-purple" />}
                {viewMode === 'influence' && <Activity className="w-5 h-5 text-accent-orange" />}
                {viewMode === 'network' ? 'Relationship Map' : viewMode === 'matrix' ? 'Power-Interest Matrix' : 'Influence Analysis'}
              </h3>
              
              {viewMode === 'network' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSimulationRunning(!simulationRunning)}
                    className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                  >
                    {simulationRunning ? <Pause className="w-4 h-4 text-gray-400" /> : <Play className="w-4 h-4 text-gray-400" />}
                  </button>
                  <button
                    onClick={() => {
                      const centerX = 300;
                      const centerY = 250;
                      setStakeholders(prev => prev.map((s, i) => {
                        const angle = (i / prev.length) * Math.PI * 2 - Math.PI / 2;
                        const radius = 150;
                        return { ...s, x: centerX + Math.cos(angle) * radius, y: centerY + Math.sin(angle) * radius, vx: 0, vy: 0 };
                      }));
                    }}
                    className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}
            </div>

            {/* Network View */}
            {viewMode === 'network' && (
              <div className="relative w-full h-[500px]">
                <svg ref={svgRef} className="w-full h-full">
                  {/* Links */}
                  {links.map((link, i) => {
                    const source = getStakeholderById(link.source);
                    const target = getStakeholderById(link.target);
                    if (!source || !target) return null;
                    
                    const isHighlighted = hoveredStakeholder === link.source || hoveredStakeholder === link.target ||
                                          selectedStakeholder === link.source || selectedStakeholder === link.target;
                    
                    return (
                      <g key={i}>
                        <motion.line
                          x1={source.x}
                          y1={source.y}
                          x2={target.x}
                          y2={target.y}
                          stroke={relationshipTypes[link.type]?.color || 'rgba(0, 245, 255, 0.3)'}
                          strokeWidth={isHighlighted ? link.strength * 4 : link.strength * 2}
                          opacity={hoveredStakeholder ? (isHighlighted ? 0.8 : 0.1) : 0.4}
                          className="transition-all duration-200"
                        />
                        {isHighlighted && (
                          <text
                            x={((source.x || 0) + (target.x || 0)) / 2}
                            y={((source.y || 0) + (target.y || 0)) / 2 - 5}
                            textAnchor="middle"
                            fill={relationshipTypes[link.type]?.color}
                            fontSize="10"
                            fontWeight="500"
                          >
                            {relationshipTypes[link.type]?.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                  
                  {/* Nodes */}
                  {filteredStakeholders.map((stakeholder) => {
                    const nodeRadius = 22 + stakeholder.power * 18;
                    const isSelected = selectedStakeholder === stakeholder.id;
                    const isHovered = hoveredStakeholder === stakeholder.id;
                    const hasImpact = policyImpacts[stakeholder.id];
                    const impactScore = hasImpact?.score || 0;
                    
                    return (
                      <motion.g
                        key={stakeholder.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedStakeholder(stakeholder.id)}
                        onMouseEnter={() => setHoveredStakeholder(stakeholder.id)}
                        onMouseLeave={() => setHoveredStakeholder(null)}
                      >
                        {/* Glow effect */}
                        {(isSelected || isHovered) && (
                          <circle
                            cx={stakeholder.x}
                            cy={stakeholder.y}
                            r={nodeRadius + 10}
                            fill="none"
                            stroke={typeColors[stakeholder.type]}
                            strokeWidth="2"
                            opacity="0.5"
                          />
                        )}
                        
                        {/* Policy impact ring */}
                        {hasImpact && (
                          <circle
                            cx={stakeholder.x}
                            cy={stakeholder.y}
                            r={nodeRadius + 5}
                            fill="none"
                            stroke={impactScore > 0.3 ? '#10b981' : impactScore < -0.2 ? '#ef4444' : '#f59e0b'}
                            strokeWidth="3"
                            strokeDasharray="4 2"
                          />
                        )}
                        
                        {/* Main node */}
                        <circle
                          cx={stakeholder.x}
                          cy={stakeholder.y}
                          r={nodeRadius}
                          fill={typeColors[stakeholder.type]}
                          opacity={hoveredStakeholder ? (isHovered || isSelected ? 1 : 0.3) : 0.85}
                          className="transition-opacity duration-200"
                        />
                        
                        {/* Selection ring */}
                        {isSelected && (
                          <circle
                            cx={stakeholder.x}
                            cy={stakeholder.y}
                            r={nodeRadius + 3}
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                          />
                        )}
                        
                        {/* Label */}
                        <text
                          x={stakeholder.x}
                          y={(stakeholder.y || 0) + nodeRadius + 15}
                          textAnchor="middle"
                          fill="white"
                          fontSize="11"
                          fontWeight="500"
                          opacity={hoveredStakeholder ? (isHovered || isSelected ? 1 : 0.3) : 1}
                        >
                          {stakeholder.name}
                        </text>
                        
                        {/* Impact score badge */}
                        {hasImpact && (
                          <g>
                            <circle
                              cx={(stakeholder.x || 0) + nodeRadius - 5}
                              cy={(stakeholder.y || 0) - nodeRadius + 5}
                              r="12"
                              fill={impactScore > 0.3 ? '#10b981' : impactScore < -0.2 ? '#ef4444' : '#f59e0b'}
                            />
                            <text
                              x={(stakeholder.x || 0) + nodeRadius - 5}
                              y={(stakeholder.y || 0) - nodeRadius + 9}
                              textAnchor="middle"
                              fill="white"
                              fontSize="9"
                              fontWeight="bold"
                            >
                              {impactScore > 0 ? '+' : ''}{(impactScore * 100).toFixed(0)}
                            </text>
                          </g>
                        )}
                      </motion.g>
                    );
                  })}
                </svg>
              </div>
            )}

            {/* Matrix View */}
            {viewMode === 'matrix' && (
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Interest" 
                      domain={[0, 100]}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      label={{ value: 'Interest Level', position: 'bottom', fill: '#9ca3af' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Power" 
                      domain={[0, 100]}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      label={{ value: 'Power Level', angle: -90, position: 'left', fill: '#9ca3af' }}
                    />
                    <ZAxis type="number" dataKey="z" range={[100, 400]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-dark-800 p-3 rounded-lg border border-dark-600">
                              <p className="font-medium text-white">{data.name}</p>
                              <p className="text-xs text-gray-400">Power: {data.y.toFixed(0)}%</p>
                              <p className="text-xs text-gray-400">Interest: {data.x.toFixed(0)}%</p>
                              <p className="text-xs text-gray-400">Influence: {data.z.toFixed(0)}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter name="Stakeholders" data={scatterData}>
                      {scatterData.map((entry, index) => (
                        <Cell 
                          key={index} 
                          fill={typeColors[entry.type]} 
                          stroke={selectedStakeholder === entry.id ? 'white' : 'transparent'}
                          strokeWidth={2}
                          cursor="pointer"
                          onClick={() => setSelectedStakeholder(entry.id)}
                        />
                      ))}
                    </Scatter>
                    
                    {/* Quadrant labels */}
                    <text x={75} y={25} fill="#9ca3af" fontSize="11">Keep Satisfied</text>
                    <text x={320} y={25} fill="#ef4444" fontSize="11" fontWeight="bold">Manage Closely</text>
                    <text x={75} y={280} fill="#6b7280" fontSize="11">Monitor</text>
                    <text x={320} y={280} fill="#3b82f6" fontSize="11">Keep Informed</text>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Influence View */}
            {viewMode === 'influence' && (
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stakeholders.map(s => ({
                    name: s.name,
                    power: s.power * 100,
                    interest: s.interest * 100,
                    influence: s.influence * 100,
                    type: s.type
                  }))} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={120} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="power" name="Power" fill="#00f5ff" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="interest" name="Interest" fill="#a855f7" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="influence" name="Influence" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 justify-center border-t border-dark-600 pt-4">
              {Object.entries(typeColors).map(([type, color]) => (
                <button
                  key={type}
                  onClick={() => setFilterType(filterType === type ? null : type)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1 rounded-full transition-all',
                    filterType === type ? 'bg-dark-600' : 'hover:bg-dark-700'
                  )}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-xs text-gray-400 capitalize">{type}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right Panel */}
          <div className="col-span-4 space-y-6">
            {/* Search & Filter */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-dark rounded-2xl p-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search stakeholders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-accent-cyan"
                />
              </div>
            </motion.div>

            {/* Selected Stakeholder Details */}
            <AnimatePresence mode="wait">
              {selectedStakeholder && (
                <motion.div
                  key={selectedStakeholder}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-dark rounded-2xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${typeColors[getStakeholderById(selectedStakeholder)?.type || '']}20` }}
                    >
                      {stakeholderIcons[getStakeholderById(selectedStakeholder)?.type || '']}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {getStakeholderById(selectedStakeholder)?.name}
                      </h3>
                      <p className="text-xs text-gray-400 capitalize">
                        {getStakeholderById(selectedStakeholder)?.type}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-4">
                    {getStakeholderById(selectedStakeholder)?.description}
                  </p>
                  
                  {/* Radar Chart */}
                  <div className="h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={influenceData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 9 }} />
                        <Radar
                          name="Metrics"
                          dataKey="value"
                          stroke={typeColors[getStakeholderById(selectedStakeholder)?.type || '']}
                          fill={typeColors[getStakeholderById(selectedStakeholder)?.type || '']}
                          fillOpacity={0.3}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Metrics */}
                  <div className="space-y-3">
                    {['power', 'interest', 'influence'].map(metric => {
                      const value = (getStakeholderById(selectedStakeholder)?.[metric as keyof Stakeholder] as number) || 0;
                      return (
                        <div key={metric}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400 capitalize">{metric}</span>
                            <span className="text-white font-medium">{(value * 100).toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: typeColors[getStakeholderById(selectedStakeholder)?.type || ''] }}
                              initial={{ width: 0 }}
                              animate={{ width: `${value * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Relationships */}
                  <div className="mt-4 pt-4 border-t border-dark-600">
                    <p className="text-sm text-gray-400 mb-3">Relationships</p>
                    <div className="space-y-2">
                      {links
                        .filter(l => l.source === selectedStakeholder || l.target === selectedStakeholder)
                        .map((link, i) => {
                          const isOutgoing = link.source === selectedStakeholder;
                          const otherId = isOutgoing ? link.target : link.source;
                          const other = getStakeholderById(otherId);
                          return (
                            <div 
                              key={i} 
                              className="flex items-center justify-between p-2 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors"
                              onClick={() => setSelectedStakeholder(otherId)}
                            >
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: typeColors[other?.type || ''] }}
                                />
                                <span className="text-xs text-white">{other?.name}</span>
                              </div>
                              <span 
                                className="text-xs px-2 py-1 rounded"
                                style={{ 
                                  backgroundColor: `${relationshipTypes[link.type]?.color}20`,
                                  color: relationshipTypes[link.type]?.color
                                }}
                              >
                                {isOutgoing ? '→' : '←'} {relationshipTypes[link.type]?.label}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Policy Impact if available */}
                  {policyImpacts[selectedStakeholder] && (
                    <div className="mt-4 pt-4 border-t border-dark-600">
                      <p className="text-sm text-gray-400 mb-3">Policy Impact</p>
                      <div className={cn(
                        'p-3 rounded-lg',
                        policyImpacts[selectedStakeholder].score > 0.3 ? 'bg-green-500/10 border border-green-500/30' :
                        policyImpacts[selectedStakeholder].score < -0.2 ? 'bg-red-500/10 border border-red-500/30' :
                        'bg-yellow-500/10 border border-yellow-500/30'
                      )}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-white font-medium">Impact Score</span>
                          <span className={cn(
                            'text-lg font-bold',
                            policyImpacts[selectedStakeholder].score > 0.3 ? 'text-green-400' :
                            policyImpacts[selectedStakeholder].score < -0.2 ? 'text-red-400' : 'text-yellow-400'
                          )}>
                            {policyImpacts[selectedStakeholder].score > 0 ? '+' : ''}
                            {(policyImpacts[selectedStakeholder].score * 100).toFixed(0)}%
                          </span>
                        </div>
                        {policyImpacts[selectedStakeholder].positive.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-green-400 mb-1">Positive Effects:</p>
                            <div className="flex flex-wrap gap-1">
                              {policyImpacts[selectedStakeholder].positive.map((p, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-green-500/20 rounded text-green-400">{p}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {policyImpacts[selectedStakeholder].negative.length > 0 && (
                          <div>
                            <p className="text-xs text-red-400 mb-1">Negative Effects:</p>
                            <div className="flex flex-wrap gap-1">
                              {policyImpacts[selectedStakeholder].negative.map((n, i) => (
                                <span key={i} className="text-xs px-2 py-1 bg-red-500/20 rounded text-red-400">{n}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Power-Interest Quadrants Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-dark rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-accent-purple" />
                Engagement Strategy
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                  <p className="text-xs text-red-400 font-medium mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Manage Closely
                  </p>
                  <div className="space-y-1">
                    {quadrants.manage_closely.map(s => (
                      <button 
                        key={s.id} 
                        className="block text-xs text-white hover:text-red-400 transition-colors"
                        onClick={() => setSelectedStakeholder(s.id)}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                  <p className="text-xs text-yellow-400 font-medium mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Keep Satisfied
                  </p>
                  <div className="space-y-1">
                    {quadrants.keep_satisfied.map(s => (
                      <button 
                        key={s.id} 
                        className="block text-xs text-white hover:text-yellow-400 transition-colors"
                        onClick={() => setSelectedStakeholder(s.id)}
                      >
                        {s.name}
                      </button>
                    ))}
                    {quadrants.keep_satisfied.length === 0 && (
                      <p className="text-xs text-gray-500">None</p>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30">
                  <p className="text-xs text-blue-400 font-medium mb-2 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Keep Informed
                  </p>
                  <div className="space-y-1">
                    {quadrants.keep_informed.map(s => (
                      <button 
                        key={s.id} 
                        className="block text-xs text-white hover:text-blue-400 transition-colors"
                        onClick={() => setSelectedStakeholder(s.id)}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-gray-500/10 rounded-xl border border-gray-500/30">
                  <p className="text-xs text-gray-400 font-medium mb-2 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Monitor
                  </p>
                  <div className="space-y-1">
                    {quadrants.monitor.map(s => (
                      <button 
                        key={s.id} 
                        className="block text-xs text-white hover:text-gray-300 transition-colors"
                        onClick={() => setSelectedStakeholder(s.id)}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
