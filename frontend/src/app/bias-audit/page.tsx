'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Scale, 
  MapPin, 
  Clock, 
  Users,
  AlertCircle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { cn } from '@/lib/utils';

export default function BiasAuditPage() {
  const [selectedMetric, setSelectedMetric] = useState('demographic');

  const fairnessMetrics = [
    { id: 'demographic', name: 'Demographic Parity', value: 0.92, threshold: 0.8, status: 'pass' },
    { id: 'geographic', name: 'Geographic Equity', value: 0.78, threshold: 0.8, status: 'warning' },
    { id: 'temporal', name: 'Temporal Fairness', value: 0.88, threshold: 0.8, status: 'pass' },
    { id: 'workload', name: 'Workload Distribution', value: 0.85, threshold: 0.7, status: 'pass' },
  ];

  const zoneData = [
    { zone: 'Downtown', coverage: 98, color: '#10b981' },
    { zone: 'Marina', coverage: 95, color: '#10b981' },
    { zone: 'Jumeirah', coverage: 92, color: '#10b981' },
    { zone: 'Deira', coverage: 88, color: '#f59e0b' },
    { zone: 'Al Quoz', coverage: 78, color: '#ef4444' },
  ];

  const giniCoefficient = 0.24;
  const isGiniFair = giniCoefficient < 0.3;

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Bias Audit <span className="text-accent-lime">Laboratory</span>
        </h1>
        <p className="text-gray-400">
          Fairness metrics and counterfactual analysis
        </p>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-dark rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Overall Fairness Score</h3>
            <p className="text-gray-400">Based on 4 key metrics</p>
          </div>
          <div className="text-right">
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-5xl font-bold text-accent-lime"
            >
              86%
            </motion.p>
            <p className="text-sm text-gray-400 mt-1">Above threshold</p>
          </div>
        </div>
        
        <div className="mt-6 h-3 bg-dark-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-lime"
            initial={{ width: 0 }}
            animate={{ width: '86%' }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-6"
        >
          <div className="glass-dark rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-accent-lime" />
              Fairness Metrics
            </h3>
            
            <div className="space-y-4">
              {fairnessMetrics.map((metric, index) => (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={cn(
                    'p-4 rounded-xl cursor-pointer transition-all',
                    selectedMetric === metric.id
                      ? 'bg-dark-600 ring-1 ring-accent-lime'
                      : 'bg-dark-700 hover:bg-dark-600'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{metric.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-lg font-bold',
                        metric.status === 'pass' ? 'text-green-400' : 'text-orange-400'
                      )}>
                        {(metric.value * 100).toFixed(0)}%
                      </span>
                      {metric.status === 'pass' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-orange-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="relative h-2 bg-dark-800 rounded-full overflow-hidden">
                    <motion.div
                      className={cn(
                        'absolute inset-y-0 left-0 rounded-full',
                        metric.status === 'pass' ? 'bg-green-400' : 'bg-orange-400'
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/50"
                      style={{ left: `${metric.threshold * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Threshold: {(metric.threshold * 100).toFixed(0)}%
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Panel */}
        <div className="col-span-6 space-y-6">
          {/* Geographic Equity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-dark rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent-cyan" />
              Geographic Coverage
            </h3>
            
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} stroke="#6b7280" />
                  <YAxis dataKey="zone" type="category" stroke="#6b7280" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a25',
                      border: '1px solid rgba(0, 245, 255, 0.2)',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="coverage" radius={[0, 4, 4, 0]}>
                    {zoneData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Gini Coefficient */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-dark rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-accent-purple" />
              Driver Workload Distribution
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Gini Coefficient</p>
                <p className={cn(
                  'text-4xl font-bold',
                  isGiniFair ? 'text-green-400' : 'text-orange-400'
                )}>
                  {giniCoefficient.toFixed(2)}
                </p>
                <p className={cn(
                  'text-sm mt-1',
                  isGiniFair ? 'text-green-400' : 'text-orange-400'
                )}>
                  {isGiniFair ? 'Fair distribution' : 'Unequal distribution'}
                </p>
              </div>
              
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#2e2e3a"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke={isGiniFair ? '#10b981' : '#f59e0b'}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(1 - giniCoefficient) * 352} 352`}
                    initial={{ strokeDashoffset: 352 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BarChart3 className={cn(
                    'w-8 h-8',
                    isGiniFair ? 'text-green-400' : 'text-orange-400'
                  )} />
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between text-xs text-gray-400">
              <span>0 = Perfect equality</span>
              <span>1 = Maximum inequality</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 glass-dark rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-dark-700 rounded-xl border-l-4 border-orange-400">
            <p className="font-medium text-white">Increase Al Quoz Coverage</p>
            <p className="text-sm text-gray-400 mt-1">
              Add 2 vehicles during peak hours to improve service equity
            </p>
          </div>
          <div className="p-4 bg-dark-700 rounded-xl border-l-4 border-green-400">
            <p className="font-medium text-white">Workload Balance Achieved</p>
            <p className="text-sm text-gray-400 mt-1">
              Driver assignments are within fair distribution thresholds
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
