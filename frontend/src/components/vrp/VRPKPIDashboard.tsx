'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  TrendingDown,
  Truck,
  Route,
  Timer,
  Target
} from 'lucide-react';

interface VRPKPIDashboardProps {
  iterations: number;
  costReduction: number;
  vehiclesUsed: number;
  totalVehicles: number;
  totalDistance: number;
  computeTime: number;
}

export default function VRPKPIDashboard({
  iterations,
  costReduction,
  vehiclesUsed,
  totalVehicles,
  totalDistance,
  computeTime
}: VRPKPIDashboardProps) {
  const [animatedValues, setAnimatedValues] = useState({
    iterations: 0,
    costReduction: 0,
    vehiclesUsed: 0,
    totalDistance: 0,
    computeTime: 0
  });

  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const startValues = { ...animatedValues };
    const targetValues = { iterations, costReduction, vehiclesUsed, totalDistance, computeTime };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        iterations: Math.round(startValues.iterations + (targetValues.iterations - startValues.iterations) * easeOut),
        costReduction: startValues.costReduction + (targetValues.costReduction - startValues.costReduction) * easeOut,
        vehiclesUsed: Math.round(startValues.vehiclesUsed + (targetValues.vehiclesUsed - startValues.vehiclesUsed) * easeOut),
        totalDistance: startValues.totalDistance + (targetValues.totalDistance - startValues.totalDistance) * easeOut,
        computeTime: startValues.computeTime + (targetValues.computeTime - startValues.computeTime) * easeOut
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [iterations, costReduction, vehiclesUsed, totalDistance, computeTime]);

  const kpis = [
    {
      icon: Zap,
      label: 'Iterations',
      value: animatedValues.iterations.toLocaleString(),
      suffix: '',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.1)'
    },
    {
      icon: TrendingDown,
      label: 'Cost Reduction',
      value: animatedValues.costReduction.toFixed(1),
      suffix: '%',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: Truck,
      label: 'Vehicles Used',
      value: `${animatedValues.vehiclesUsed}/${totalVehicles}`,
      suffix: '',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      icon: Route,
      label: 'Total Distance',
      value: animatedValues.totalDistance.toFixed(1),
      suffix: ' km',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      icon: Timer,
      label: 'Compute Time',
      value: animatedValues.computeTime.toFixed(2),
      suffix: 's',
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)'
    },
    {
      icon: Target,
      label: 'Utilization',
      value: ((vehiclesUsed / totalVehicles) * 100).toFixed(0),
      suffix: '%',
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-xl p-3"
    >
      <div className="flex items-center gap-6 overflow-x-auto">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 min-w-fit"
            >
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: kpi.bgColor }}
              >
                <Icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {kpi.label}
                </p>
                <p className="text-lg font-bold font-mono" style={{ color: kpi.color }}>
                  {kpi.value}
                  <span className="text-xs text-gray-500">{kpi.suffix}</span>
                </p>
              </div>
              {index < kpis.length - 1 && (
                <div className="w-px h-10 bg-gray-700 ml-3" />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
