'use client';

import { motion } from 'framer-motion';
import { DollarSign, Fuel, Clock, Route, Wrench } from 'lucide-react';

interface CostBreakdownPanelProps {
  fuelCost: number;
  timeCost: number;
  distanceCost: number;
  maintenanceCost: number;
  totalCost: number;
  previousCost?: number;
}

export default function CostBreakdownPanel({
  fuelCost,
  timeCost,
  distanceCost,
  maintenanceCost,
  totalCost,
  previousCost
}: CostBreakdownPanelProps) {
  const breakdown = [
    {
      icon: Fuel,
      label: 'Fuel',
      value: fuelCost,
      color: '#f97316',
      percentage: totalCost > 0 ? (fuelCost / totalCost) * 100 : 0
    },
    {
      icon: Clock,
      label: 'Time',
      value: timeCost,
      color: '#06b6d4',
      percentage: totalCost > 0 ? (timeCost / totalCost) * 100 : 0
    },
    {
      icon: Route,
      label: 'Distance',
      value: distanceCost,
      color: '#8b5cf6',
      percentage: totalCost > 0 ? (distanceCost / totalCost) * 100 : 0
    },
    {
      icon: Wrench,
      label: 'Maintenance',
      value: maintenanceCost,
      color: '#10b981',
      percentage: totalCost > 0 ? (maintenanceCost / totalCost) * 100 : 0
    }
  ];

  const savings = previousCost ? previousCost - totalCost : 0;
  const savingsPercentage = previousCost ? (savings / previousCost) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-xl p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-400" />
          Cost Breakdown
        </h3>
        {savings > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400"
          >
            -{savingsPercentage.toFixed(1)}% saved
          </motion.div>
        )}
      </div>

      {/* Total Cost */}
      <div className="text-center mb-4 p-3 bg-dark-700 rounded-lg">
        <p className="text-xs text-gray-400 mb-1">Total Estimated Cost</p>
        <motion.p
          className="text-2xl font-bold text-white font-mono"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          AED {totalCost.toFixed(0)}
        </motion.p>
        {previousCost && (
          <p className="text-[10px] text-gray-500 mt-1">
            Previous: AED {previousCost.toFixed(0)}
          </p>
        )}
      </div>

      {/* Stacked bar */}
      <div className="h-3 rounded-full overflow-hidden flex mb-4 bg-dark-600">
        {breakdown.map((item, index) => (
          <motion.div
            key={item.label}
            className="h-full"
            style={{ backgroundColor: item.color }}
            initial={{ width: 0 }}
            animate={{ width: `${item.percentage}%` }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
          />
        ))}
      </div>

      {/* Breakdown items */}
      <div className="space-y-2">
        {breakdown.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <Icon className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500">
                  {item.percentage.toFixed(0)}%
                </span>
                <span
                  className="text-xs font-semibold font-mono"
                  style={{ color: item.color }}
                >
                  AED {item.value.toFixed(0)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
