'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Layers,
  Download,
  Clock,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface PolicyKPIDashboardProps {
  documentsGenerated: number;
  templatesUsed: number;
  exportCount: number;
  avgGenerationTime: number;
  complianceCoverage: number;
  qualityScore: number;
}

export default function PolicyKPIDashboard({
  documentsGenerated,
  templatesUsed,
  exportCount,
  avgGenerationTime,
  complianceCoverage,
  qualityScore
}: PolicyKPIDashboardProps) {
  const [animatedValues, setAnimatedValues] = useState({
    documentsGenerated: 0,
    templatesUsed: 0,
    exportCount: 0,
    avgGenerationTime: 0,
    complianceCoverage: 0,
    qualityScore: 0
  });

  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const startValues = { ...animatedValues };
    const targetValues = { documentsGenerated, templatesUsed, exportCount, avgGenerationTime, complianceCoverage, qualityScore };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        documentsGenerated: Math.round(startValues.documentsGenerated + (targetValues.documentsGenerated - startValues.documentsGenerated) * easeOut),
        templatesUsed: Math.round(startValues.templatesUsed + (targetValues.templatesUsed - startValues.templatesUsed) * easeOut),
        exportCount: Math.round(startValues.exportCount + (targetValues.exportCount - startValues.exportCount) * easeOut),
        avgGenerationTime: startValues.avgGenerationTime + (targetValues.avgGenerationTime - startValues.avgGenerationTime) * easeOut,
        complianceCoverage: startValues.complianceCoverage + (targetValues.complianceCoverage - startValues.complianceCoverage) * easeOut,
        qualityScore: startValues.qualityScore + (targetValues.qualityScore - startValues.qualityScore) * easeOut
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [documentsGenerated, templatesUsed, exportCount, avgGenerationTime, complianceCoverage, qualityScore]);

  const kpis = [
    {
      icon: FileText,
      label: 'Documents',
      value: animatedValues.documentsGenerated.toString(),
      suffix: '',
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)'
    },
    {
      icon: Layers,
      label: 'Templates Used',
      value: animatedValues.templatesUsed.toString(),
      suffix: '',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      icon: Download,
      label: 'Exports',
      value: animatedValues.exportCount.toString(),
      suffix: '',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      icon: Clock,
      label: 'Avg Gen Time',
      value: animatedValues.avgGenerationTime.toFixed(1),
      suffix: 's',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      icon: CheckCircle,
      label: 'Compliance',
      value: animatedValues.complianceCoverage.toFixed(0),
      suffix: '%',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: TrendingUp,
      label: 'Quality Score',
      value: animatedValues.qualityScore.toFixed(1),
      suffix: '/10',
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
