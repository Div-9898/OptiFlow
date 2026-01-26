'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain,
  Target,
  Zap,
  Users,
  Scale,
  CheckCircle
} from 'lucide-react';

interface EthicsKPIDashboardProps {
  decisionsAnalyzed: number;
  avgEthicalScore: number;
  simulationsRun: number;
  consensusRate: number;
  stakeholdersConsidered: number;
  frameworksApplied: number;
}

export default function EthicsKPIDashboard({
  decisionsAnalyzed,
  avgEthicalScore,
  simulationsRun,
  consensusRate,
  stakeholdersConsidered,
  frameworksApplied
}: EthicsKPIDashboardProps) {
  const [animatedValues, setAnimatedValues] = useState({
    decisionsAnalyzed: 0,
    avgEthicalScore: 0,
    simulationsRun: 0,
    consensusRate: 0,
    stakeholdersConsidered: 0,
    frameworksApplied: 0
  });

  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const startValues = { ...animatedValues };
    const targetValues = { decisionsAnalyzed, avgEthicalScore, simulationsRun, consensusRate, stakeholdersConsidered, frameworksApplied };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        decisionsAnalyzed: Math.round(startValues.decisionsAnalyzed + (targetValues.decisionsAnalyzed - startValues.decisionsAnalyzed) * easeOut),
        avgEthicalScore: startValues.avgEthicalScore + (targetValues.avgEthicalScore - startValues.avgEthicalScore) * easeOut,
        simulationsRun: Math.round(startValues.simulationsRun + (targetValues.simulationsRun - startValues.simulationsRun) * easeOut),
        consensusRate: startValues.consensusRate + (targetValues.consensusRate - startValues.consensusRate) * easeOut,
        stakeholdersConsidered: Math.round(startValues.stakeholdersConsidered + (targetValues.stakeholdersConsidered - startValues.stakeholdersConsidered) * easeOut),
        frameworksApplied: Math.round(startValues.frameworksApplied + (targetValues.frameworksApplied - startValues.frameworksApplied) * easeOut)
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [decisionsAnalyzed, avgEthicalScore, simulationsRun, consensusRate, stakeholdersConsidered, frameworksApplied]);

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#10b981';
    if (score >= 0.6) return '#f59e0b';
    return '#ef4444';
  };

  const kpis = [
    {
      icon: Brain,
      label: 'Decisions Analyzed',
      value: animatedValues.decisionsAnalyzed.toLocaleString(),
      suffix: '',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      icon: Target,
      label: 'Avg Ethical Score',
      value: (animatedValues.avgEthicalScore * 100).toFixed(0),
      suffix: '%',
      color: getScoreColor(avgEthicalScore),
      bgColor: `${getScoreColor(avgEthicalScore)}15`
    },
    {
      icon: Zap,
      label: 'Simulations',
      value: animatedValues.simulationsRun.toLocaleString(),
      suffix: '',
      color: '#f97316',
      bgColor: 'rgba(249, 115, 22, 0.1)'
    },
    {
      icon: CheckCircle,
      label: 'Consensus Rate',
      value: animatedValues.consensusRate.toFixed(0),
      suffix: '%',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: Users,
      label: 'Stakeholders',
      value: animatedValues.stakeholdersConsidered.toString(),
      suffix: '',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      icon: Scale,
      label: 'Frameworks',
      value: animatedValues.frameworksApplied.toString(),
      suffix: '',
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)'
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
