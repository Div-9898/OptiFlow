'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Scale,
  Shield,
  AlertTriangle,
  CheckCircle,
  Users,
  Map
} from 'lucide-react';

interface BiasKPIDashboardProps {
  overallFairness: number;
  equityScore: number;
  biasIncidents: number;
  complianceRate: number;
  driversAudited: number;
  zonesAnalyzed: number;
}

export default function BiasKPIDashboard({
  overallFairness,
  equityScore,
  biasIncidents,
  complianceRate,
  driversAudited,
  zonesAnalyzed
}: BiasKPIDashboardProps) {
  const [animatedValues, setAnimatedValues] = useState({
    overallFairness: 0,
    equityScore: 0,
    biasIncidents: 0,
    complianceRate: 0,
    driversAudited: 0,
    zonesAnalyzed: 0
  });

  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const startValues = { ...animatedValues };
    const targetValues = { overallFairness, equityScore, biasIncidents, complianceRate, driversAudited, zonesAnalyzed };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        overallFairness: startValues.overallFairness + (targetValues.overallFairness - startValues.overallFairness) * easeOut,
        equityScore: startValues.equityScore + (targetValues.equityScore - startValues.equityScore) * easeOut,
        biasIncidents: Math.round(startValues.biasIncidents + (targetValues.biasIncidents - startValues.biasIncidents) * easeOut),
        complianceRate: startValues.complianceRate + (targetValues.complianceRate - startValues.complianceRate) * easeOut,
        driversAudited: Math.round(startValues.driversAudited + (targetValues.driversAudited - startValues.driversAudited) * easeOut),
        zonesAnalyzed: Math.round(startValues.zonesAnalyzed + (targetValues.zonesAnalyzed - startValues.zonesAnalyzed) * easeOut)
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [overallFairness, equityScore, biasIncidents, complianceRate, driversAudited, zonesAnalyzed]);

  const getFairnessColor = (score: number) => {
    if (score >= 0.8) return '#10b981';
    if (score >= 0.6) return '#f59e0b';
    return '#ef4444';
  };

  const kpis = [
    {
      icon: Scale,
      label: 'Fairness Score',
      value: (animatedValues.overallFairness * 100).toFixed(0),
      suffix: '%',
      color: getFairnessColor(overallFairness),
      bgColor: `${getFairnessColor(overallFairness)}15`
    },
    {
      icon: Shield,
      label: 'Equity Score',
      value: (animatedValues.equityScore * 100).toFixed(0),
      suffix: '%',
      color: getFairnessColor(equityScore),
      bgColor: `${getFairnessColor(equityScore)}15`
    },
    {
      icon: AlertTriangle,
      label: 'Bias Incidents',
      value: animatedValues.biasIncidents.toString(),
      suffix: '',
      color: biasIncidents > 5 ? '#ef4444' : biasIncidents > 2 ? '#f59e0b' : '#10b981',
      bgColor: biasIncidents > 5 ? 'rgba(239, 68, 68, 0.1)' : biasIncidents > 2 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: CheckCircle,
      label: 'Compliance',
      value: animatedValues.complianceRate.toFixed(1),
      suffix: '%',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: Users,
      label: 'Drivers Audited',
      value: animatedValues.driversAudited.toString(),
      suffix: '',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      icon: Map,
      label: 'Zones Analyzed',
      value: animatedValues.zonesAnalyzed.toString(),
      suffix: '',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
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
