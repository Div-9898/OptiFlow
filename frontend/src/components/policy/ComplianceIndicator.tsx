'use client';

import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface ComplianceStatus {
  name: string;
  status: 'compliant' | 'review' | 'pending';
  score: number;
  lastAudit: string;
}

interface ComplianceIndicatorProps {
  regulations: ComplianceStatus[];
  overallScore: number;
}

export default function ComplianceIndicator({ regulations, overallScore }: ComplianceIndicatorProps) {
  const getStatusColor = (status: ComplianceStatus['status']) => {
    switch (status) {
      case 'compliant': return '#10b981';
      case 'review': return '#f59e0b';
      case 'pending': return '#3b82f6';
    }
  };

  const getStatusIcon = (status: ComplianceStatus['status']) => {
    switch (status) {
      case 'compliant': return CheckCircle;
      case 'review': return AlertTriangle;
      case 'pending': return Clock;
    }
  };

  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-xl p-4"
    >
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 text-green-400" />
        Compliance Status
      </h3>

      <div className="flex gap-4">
        {/* Overall Score Gauge */}
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke={overallScore >= 90 ? '#10b981' : overallScore >= 70 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                className="text-xl font-bold font-mono text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {overallScore}%
              </motion.span>
              <span className="text-[9px] text-gray-400">Overall</span>
            </div>
          </div>
        </div>

        {/* Regulation List */}
        <div className="flex-1 space-y-2">
          {regulations.map((reg, index) => {
            const StatusIcon = getStatusIcon(reg.status);
            const statusColor = getStatusColor(reg.status);

            return (
              <motion.div
                key={reg.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-2 bg-dark-700 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <StatusIcon className="w-3 h-3" style={{ color: statusColor }} />
                  <span className="text-[11px] text-white">{reg.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-gray-500">{reg.lastAudit}</span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded capitalize"
                    style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
                  >
                    {reg.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
