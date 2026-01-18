'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Zap, Thermometer, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOptimizationStore } from '@/stores/optimizationStore';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { cn } from '@/lib/utils';

export default function VRPArenaPage() {
  const { 
    currentRun, 
    isOptimizing, 
    progressHistory,
    selectedAlgorithm,
    setAlgorithm,
    startOptimization 
  } = useOptimizationStore();
  
  const { isConnected } = useSocketConnection();
  const [showDNAView, setShowDNAView] = useState(false);

  const algorithms = [
    { id: 'ortools', name: 'OR-Tools', description: 'Google\'s industrial solver' },
    { id: 'genetic', name: 'Genetic Algorithm', description: 'Evolution-based optimization' },
    { id: 'simulated_annealing', name: 'Simulated Annealing', description: 'Temperature-based search' },
  ];

  const handleStartOptimization = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${apiUrl}/api/v1/optimization/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_locations: Array.from({ length: 25 }, (_, i) => ({
            id: `delivery_${i}`,
            lat: 25.1 + Math.random() * 0.2,
            lng: 55.1 + Math.random() * 0.3,
          })),
          num_vehicles: 5,
          depot_location: { lat: 25.2048, lng: 55.2708 },
          algorithm: selectedAlgorithm,
          time_limit_seconds: 30,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        startOptimization(data.run_id, selectedAlgorithm);
      } else {
        console.error('Optimization start failed:', await response.text());
      }
    } catch (error) {
      console.error('Optimization API error:', error);
    }
  };

  const progressData = progressHistory.map((p, i) => ({
    iteration: i,
    currentCost: p.currentCost / 1000, // Scale for display
    bestCost: p.bestCost / 1000,
    temperature: p.temperature,
  }));

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Algorithm <span className="text-accent-cyan">Arena</span>
        </h1>
        <p className="text-gray-400">
          Watch VRP optimization algorithms compete in real-time
        </p>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Controls */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-4"
        >
          {/* Algorithm Selection */}
          <div className="glass-dark rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Select Algorithm
            </h3>
            <div className="space-y-3">
              {algorithms.map((algo) => (
                <button
                  key={algo.id}
                  onClick={() => setAlgorithm(algo.id as any)}
                  disabled={isOptimizing}
                  className={cn(
                    'w-full p-4 rounded-xl text-left transition-all duration-300',
                    selectedAlgorithm === algo.id
                      ? 'bg-accent-cyan/20 border border-accent-cyan'
                      : 'bg-dark-700 border border-transparent hover:bg-dark-600',
                    isOptimizing && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{algo.name}</span>
                    {selectedAlgorithm === algo.id && (
                      <motion.div
                        layoutId="selectedIndicator"
                        className="w-2 h-2 rounded-full bg-accent-cyan"
                      />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{algo.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="glass-dark rounded-2xl p-6">
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartOptimization}
                disabled={isOptimizing || !isConnected}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-medium transition-all',
                  isOptimizing
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-accent-cyan text-dark-900 hover:shadow-neon-cyan'
                )}
              >
                {isOptimizing ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Start Optimization
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-xl bg-dark-700 text-gray-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Stats */}
            {currentRun && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-dark-700 rounded-xl">
                  <div className="flex items-center gap-2 text-accent-cyan mb-1">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">Iteration</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {currentRun.iteration}
                  </p>
                </div>
                <div className="p-4 bg-dark-700 rounded-xl">
                  <div className="flex items-center gap-2 text-accent-lime mb-1">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">Best Cost</span>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {(currentRun.bestCost / 1000).toFixed(1)}k
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Panel - Visualization */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-8"
        >
          {/* Cost Convergence Chart */}
          <div className="glass-dark rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">
                Cost Convergence
              </h3>
              {currentRun?.savingsPercent && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-4 py-2 bg-accent-lime/20 rounded-full"
                >
                  <span className="text-accent-lime font-bold">
                    {currentRun.savingsPercent.toFixed(1)}% Savings
                  </span>
                </motion.div>
              )}
            </div>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3a" />
                  <XAxis 
                    dataKey="iteration" 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                    label={{ 
                      value: 'Cost (k)', 
                      angle: -90, 
                      position: 'insideLeft',
                      fill: '#6b7280'
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a25',
                      border: '1px solid rgba(0, 245, 255, 0.2)',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="bestCost"
                    stroke="#39ff14"
                    strokeWidth={3}
                    dot={false}
                    name="Best Cost"
                  />
                  <Line
                    type="monotone"
                    dataKey="currentCost"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    opacity={0.6}
                    name="Current Cost"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Temperature Gauge (for Simulated Annealing) */}
          {selectedAlgorithm === 'simulated_annealing' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-dark rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Thermometer className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold text-white">
                  Temperature
                </h3>
              </div>
              
              <div className="relative h-8 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #3b82f6, #f59e0b, #ef4444)',
                  }}
                  animate={{
                    width: `${(currentRun?.temperature || 0) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {((currentRun?.temperature || 0) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>Cold (Stable)</span>
                <span>Hot (Exploring)</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
