'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Dice5, 
  Target,
  Users,
  Zap,
  ChevronRight,
  BarChart2
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

export default function EthicsSimulatorPage() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const scenarios = [
    {
      id: 'resource',
      type: 'Resource Allocation',
      title: 'Medical vs Commercial Delivery',
      description: 'Three vehicles available, five urgent deliveries. Two for hospitals, two regular, one corporate.',
      options: [
        {
          id: 'prioritize_medical',
          title: 'Prioritize Medical',
          description: 'Hospitals first, then high-value clients',
          scores: { utilitarian: 0.85, deontological: 0.75, virtue: 0.80, care: 0.90 }
        },
        {
          id: 'first_come',
          title: 'First-Come-First-Served',
          description: 'Process in order received',
          scores: { utilitarian: 0.45, deontological: 0.90, virtue: 0.55, care: 0.35 }
        },
        {
          id: 'maximize_profit',
          title: 'Maximize Revenue',
          description: 'Prioritize by delivery value',
          scores: { utilitarian: 0.55, deontological: 0.30, virtue: 0.25, care: 0.20 }
        }
      ]
    },
    {
      id: 'safety',
      type: 'Safety vs Deadline',
      title: 'Fatigued Driver Dilemma',
      description: 'Driver reports fatigue with 3 deliveries remaining before window closes. Weather deteriorating.',
    }
  ];

  const currentScenario = scenarios.find(s => s.id === selectedScenario);

  const handleSimulate = async () => {
    setIsSimulating(true);
    
    // Simulate Monte Carlo
    await new Promise(r => setTimeout(r, 2000));
    
    setSimulationResult({
      successRate: 0.78,
      avgCost: 1250,
      confidenceInterval: [0.72, 0.84],
      simulations: 1000
    });
    
    setIsSimulating(false);
  };

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Ethical Dilemma <span className="text-accent-orange">Simulator</span>
        </h1>
        <p className="text-gray-400">
          Monte Carlo simulation for ethical decision-making
        </p>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Scenario Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-4"
        >
          <div className="glass-dark rounded-2xl p-6">
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
                  }}
                  className={cn(
                    'w-full p-4 rounded-xl text-left transition-all',
                    selectedScenario === scenario.id
                      ? 'bg-accent-orange/20 border border-accent-orange'
                      : 'bg-dark-700 border border-transparent hover:bg-dark-600'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-accent-orange font-medium">
                      {scenario.type}
                    </span>
                    <ChevronRight className={cn(
                      'w-4 h-4 transition-transform',
                      selectedScenario === scenario.id && 'rotate-90'
                    )} />
                  </div>
                  <p className="font-medium text-white mt-1">{scenario.title}</p>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {scenario.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="col-span-8">
          <AnimatePresence mode="wait">
            {currentScenario && currentScenario.options ? (
              <motion.div
                key={currentScenario.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Options */}
                <div className="glass-dark rounded-2xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Decision Options
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {currentScenario.options.map((option: DilemmaOption) => (
                      <motion.button
                        key={option.id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedOption(option.id)}
                        className={cn(
                          'p-4 rounded-xl text-left transition-all',
                          selectedOption === option.id
                            ? 'bg-accent-orange/20 border-2 border-accent-orange'
                            : 'bg-dark-700 border-2 border-transparent hover:border-dark-500'
                        )}
                      >
                        <p className="font-medium text-white">{option.title}</p>
                        <p className="text-sm text-gray-400 mt-1">{option.description}</p>
                        
                        {selectedOption === option.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 space-y-2"
                          >
                            {Object.entries(option.scores).map(([framework, score]) => (
                              <div key={framework}>
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-400 capitalize">{framework}</span>
                                  <span className="text-white">{(score * 100).toFixed(0)}%</span>
                                </div>
                                <div className="h-1 bg-dark-600 rounded-full overflow-hidden">
                                  <motion.div
                                    className="h-full bg-accent-orange rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${score * 100}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Simulate Button */}
                {selectedOption && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-dark rounded-2xl p-6"
                  >
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
                            : 'bg-accent-orange text-white hover:shadow-lg'
                        )}
                      >
                        {isSimulating ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Zap className="w-5 h-5" />
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

                    {/* Results */}
                    {simulationResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-4 gap-4"
                      >
                        <div className="p-4 bg-dark-700 rounded-xl text-center">
                          <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">
                            {(simulationResult.successRate * 100).toFixed(0)}%
                          </p>
                          <p className="text-xs text-gray-400">Success Rate</p>
                        </div>
                        <div className="p-4 bg-dark-700 rounded-xl text-center">
                          <BarChart2 className="w-6 h-6 text-accent-cyan mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">
                            ${simulationResult.avgCost}
                          </p>
                          <p className="text-xs text-gray-400">Avg Cost</p>
                        </div>
                        <div className="p-4 bg-dark-700 rounded-xl text-center">
                          <Users className="w-6 h-6 text-accent-purple mx-auto mb-2" />
                          <p className="text-2xl font-bold text-white">
                            {simulationResult.confidenceInterval[0]*100}-{simulationResult.confidenceInterval[1]*100}%
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
                      </motion.div>
                    )}
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
                <p className="text-gray-400">Select a scenario to begin</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
