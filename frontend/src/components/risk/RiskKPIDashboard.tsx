'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  Activity
} from 'lucide-react';

interface RiskKPIDashboardProps {
  fleetRiskScore: number;
  incidentsToday: number;
  alertsResolved: number;
  avgResponseTime: number;
  vehiclesAtRisk: number;
  totalVehicles: number;
}

export default function RiskKPIDashboard({
  fleetRiskScore,
  incidentsToday,
  alertsResolved,
  avgResponseTime,
  vehiclesAtRisk,
  totalVehicles
}: RiskKPIDashboardProps) {
  const [animatedValues, setAnimatedValues] = useState({
    fleetRiskScore: 0,
    incidentsToday: 0,
    alertsResolved: 0,
    avgResponseTime: 0,
    vehiclesAtRisk: 0
  });

  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const startValues = { ...animatedValues };
    const targetValues = { fleetRiskScore, incidentsToday, alertsResolved, avgResponseTime, vehiclesAtRisk };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        fleetRiskScore: startValues.fleetRiskScore + (targetValues.fleetRiskScore - startValues.fleetRiskScore) * easeOut,
        incidentsToday: Math.round(startValues.incidentsToday + (targetValues.incidentsToday - startValues.incidentsToday) * easeOut),
        alertsResolved: Math.round(startValues.alertsResolved + (targetValues.alertsResolved - startValues.alertsResolved) * easeOut),
        avgResponseTime: startValues.avgResponseTime + (targetValues.avgResponseTime - startValues.avgResponseTime) * easeOut,
        vehiclesAtRisk: Math.round(startValues.vehiclesAtRisk + (targetValues.vehiclesAtRisk - startValues.vehiclesAtRisk) * easeOut)
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [fleetRiskScore, incidentsToday, alertsResolved, avgResponseTime, vehiclesAtRisk]);

  const getRiskColor = (score: number) => {
    if (score < 0.3) return '#10b981';
    if (score < 0.6) return '#f59e0b';
    return '#ef4444';
  };

  const getRiskLabel = (score: number) => {
    if (score < 0.3) return 'LOW';
    if (score < 0.6) return 'MEDIUM';
    return 'HIGH';
  };

  const kpis = [
    {
      icon: Shield,
      label: 'Fleet Risk Score',
      value: `${Math.round(animatedValues.fleetRiskScore * 100)}%`,
      suffix: '',
      badge: getRiskLabel(fleetRiskScore),
      color: getRiskColor(fleetRiskScore),
      bgColor: `${getRiskColor(fleetRiskScore)}15`
    },
    {
      icon: AlertTriangle,
      label: 'Incidents Today',
      value: animatedValues.incidentsToday.toString(),
      suffix: '',
      color: incidentsToday > 5 ? '#ef4444' : '#f59e0b',
      bgColor: incidentsToday > 5 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'
    },
    {
      icon: CheckCircle,
      label: 'Alerts Resolved',
      value: animatedValues.alertsResolved.toString(),
      suffix: '',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: Clock,
      label: 'Avg Response',
      value: animatedValues.avgResponseTime.toFixed(1),
      suffix: ' min',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      icon: Truck,
      label: 'At Risk',
      value: `${animatedValues.vehiclesAtRisk}/${totalVehicles}`,
      suffix: '',
      color: vehiclesAtRisk > 3 ? '#ef4444' : '#f59e0b',
      bgColor: vehiclesAtRisk > 3 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'
    },
    {
      icon: Activity,
      label: 'Monitoring',
      value: '24/7',
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
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold font-mono" style={{ color: kpi.color }}>
                    {kpi.value}
                    <span className="text-xs text-gray-500">{kpi.suffix}</span>
                  </p>
                  {kpi.badge && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                      style={{ backgroundColor: kpi.bgColor, color: kpi.color }}
                    >
                      {kpi.badge}
                    </span>
                  )}
                </div>
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
