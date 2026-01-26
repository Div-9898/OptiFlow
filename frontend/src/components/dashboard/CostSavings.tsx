'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Fuel, Clock, Wrench, TrendingUp } from 'lucide-react';

interface CostSavingsProps {
  distanceSavedKm: number;
  fuelPricePerLiter: number;
  avgFuelConsumption: number; // L per 100km
  hourlyOperatingCost: number;
  timeSavedMinutes: number;
}

export default function CostSavings({
  distanceSavedKm,
  fuelPricePerLiter = 3.2, // AED per liter
  avgFuelConsumption = 25, // L per 100km for trucks
  hourlyOperatingCost = 150, // AED per hour
  timeSavedMinutes,
}: CostSavingsProps) {
  const [animatedTotal, setAnimatedTotal] = useState(0);

  // Calculate savings
  const fuelSaved = (distanceSavedKm / 100) * avgFuelConsumption;
  const fuelCostSaved = fuelSaved * fuelPricePerLiter;
  const timeCostSaved = (timeSavedMinutes / 60) * hourlyOperatingCost;
  const maintenanceSaved = distanceSavedKm * 0.5; // Rough estimate: 0.5 AED per km
  const totalSaved = fuelCostSaved + timeCostSaved + maintenanceSaved;

  // Animate total
  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const startValue = animatedTotal;
    const endValue = totalSaved;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedTotal(startValue + (endValue - startValue) * easeOut);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [totalSaved]);

  const breakdown = [
    {
      icon: Fuel,
      label: 'Fuel',
      value: fuelCostSaved,
      color: '#ff8800',
      percentage: totalSaved > 0 ? (fuelCostSaved / totalSaved) * 100 : 0,
    },
    {
      icon: Clock,
      label: 'Time',
      value: timeCostSaved,
      color: '#00d4ff',
      percentage: totalSaved > 0 ? (timeCostSaved / totalSaved) * 100 : 0,
    },
    {
      icon: Wrench,
      label: 'Maintenance',
      value: maintenanceSaved,
      color: '#a855f7',
      percentage: totalSaved > 0 ? (maintenanceSaved / totalSaved) * 100 : 0,
    },
  ];

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="absolute bottom-24 right-[340px] z-10"
    >
      <div
        className="p-4 rounded-2xl w-64"
        style={{
          background: 'linear-gradient(180deg, rgba(10,15,25,0.9) 0%, rgba(5,10,20,0.95) 100%)',
          border: '1px solid rgba(0, 255, 136, 0.15)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3), 0 0 40px rgba(0, 255, 136, 0.05)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-green-500/10">
              <DollarSign className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider">Today's Savings</span>
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp className="w-4 h-4 text-green-400" />
          </motion.div>
        </div>

        {/* Total */}
        <div className="text-center mb-4">
          <motion.div
            className="text-3xl font-bold text-green-400 font-mono"
            style={{ textShadow: '0 0 20px rgba(0, 255, 136, 0.3)' }}
          >
            AED {animatedTotal.toFixed(0)}
          </motion.div>
          <p className="text-[10px] text-gray-500 mt-1">Estimated cost savings</p>
        </div>

        {/* Stacked Bar */}
        <div className="h-2 rounded-full overflow-hidden flex mb-3 bg-gray-800">
          {breakdown.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ width: 0 }}
              animate={{ width: `${item.percentage}%` }}
              transition={{ duration: 0.8, delay: 0.2 * index }}
              className="h-full"
              style={{ backgroundColor: item.color }}
            />
          ))}
        </div>

        {/* Breakdown */}
        <div className="space-y-2">
          {breakdown.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <Icon className="w-3 h-3 text-gray-500" />
                  <span className="text-[11px] text-gray-400">{item.label}</span>
                </div>
                <span
                  className="text-xs font-semibold font-mono"
                  style={{ color: item.color }}
                >
                  AED {item.value.toFixed(0)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-800/50 text-center">
          <p className="text-[9px] text-gray-600">
            Projected monthly: <span className="text-green-400 font-semibold">AED {(totalSaved * 30).toFixed(0)}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
