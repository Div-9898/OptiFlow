'use client';

import { motion } from 'framer-motion';
import { Swords, Trophy, TrendingDown, Timer, Route } from 'lucide-react';

interface AlgorithmStats {
  name: string;
  color: string;
  cost: number;
  distance: number;
  time: number;
  iterations: number;
  isWinner?: boolean;
}

interface AlgorithmBattlePanelProps {
  algorithms: AlgorithmStats[];
  isRunning: boolean;
}

export default function AlgorithmBattlePanel({ algorithms, isRunning }: AlgorithmBattlePanelProps) {
  const sortedByPerformance = [...algorithms].sort((a, b) => a.cost - b.cost);
  const winner = sortedByPerformance[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-dark rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={isRunning ? { rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 0.5, repeat: isRunning ? Infinity : 0 }}
        >
          <Swords className="w-5 h-5 text-red-500" />
        </motion.div>
        <h3 className="text-sm font-semibold text-white">Algorithm Battle</h3>
        {isRunning && (
          <span className="ml-auto text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 animate-pulse">
            LIVE
          </span>
        )}
      </div>

      <div className="space-y-3">
        {algorithms.map((algo, index) => {
          const isLeading = algo.name === winner?.name && !isRunning;
          return (
            <motion.div
              key={algo.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg transition-all ${
                isLeading
                  ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30'
                  : 'bg-dark-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: algo.color }}
                  />
                  <span className="text-sm font-medium text-white">{algo.name}</span>
                  {isLeading && (
                    <Trophy className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <span
                  className="text-xs font-mono px-2 py-1 rounded"
                  style={{
                    backgroundColor: `${algo.color}20`,
                    color: algo.color
                  }}
                >
                  #{index + 1}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingDown className="w-3 h-3 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-400">Cost</p>
                  <p className="text-sm font-bold font-mono" style={{ color: algo.color }}>
                    {algo.cost.toFixed(0)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Route className="w-3 h-3 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-400">Distance</p>
                  <p className="text-sm font-bold font-mono" style={{ color: algo.color }}>
                    {algo.distance.toFixed(1)}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Timer className="w-3 h-3 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-400">Time</p>
                  <p className="text-sm font-bold font-mono" style={{ color: algo.color }}>
                    {algo.time.toFixed(2)}s
                  </p>
                </div>
              </div>

              {/* Progress bar showing relative performance */}
              <div className="mt-2 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: algo.color }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.max(20, 100 - ((algo.cost - winner.cost) / winner.cost) * 100)}%`
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
