'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  ThumbsUp,
  Clock,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface CommKPIDashboardProps {
  messagesSent: number;
  responseRate: number;
  avgSentiment: number;
  escalations: number;
  avgResponseTime: number;
  customerSatisfaction: number;
}

export default function CommKPIDashboard({
  messagesSent,
  responseRate,
  avgSentiment,
  escalations,
  avgResponseTime,
  customerSatisfaction
}: CommKPIDashboardProps) {
  const [animatedValues, setAnimatedValues] = useState({
    messagesSent: 0,
    responseRate: 0,
    avgSentiment: 0,
    escalations: 0,
    avgResponseTime: 0,
    customerSatisfaction: 0
  });

  useEffect(() => {
    const duration = 1000;
    const startTime = Date.now();
    const startValues = { ...animatedValues };
    const targetValues = { messagesSent, responseRate, avgSentiment, escalations, avgResponseTime, customerSatisfaction };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedValues({
        messagesSent: Math.round(startValues.messagesSent + (targetValues.messagesSent - startValues.messagesSent) * easeOut),
        responseRate: startValues.responseRate + (targetValues.responseRate - startValues.responseRate) * easeOut,
        avgSentiment: startValues.avgSentiment + (targetValues.avgSentiment - startValues.avgSentiment) * easeOut,
        escalations: Math.round(startValues.escalations + (targetValues.escalations - startValues.escalations) * easeOut),
        avgResponseTime: startValues.avgResponseTime + (targetValues.avgResponseTime - startValues.avgResponseTime) * easeOut,
        customerSatisfaction: startValues.customerSatisfaction + (targetValues.customerSatisfaction - startValues.customerSatisfaction) * easeOut
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [messagesSent, responseRate, avgSentiment, escalations, avgResponseTime, customerSatisfaction]);

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.6) return '#10b981';
    if (sentiment >= 0.4) return '#f59e0b';
    return '#ef4444';
  };

  const kpis = [
    {
      icon: MessageSquare,
      label: 'Messages Sent',
      value: animatedValues.messagesSent.toLocaleString(),
      suffix: '',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      icon: Send,
      label: 'Response Rate',
      value: animatedValues.responseRate.toFixed(1),
      suffix: '%',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: ThumbsUp,
      label: 'Avg Sentiment',
      value: (animatedValues.avgSentiment * 100).toFixed(0),
      suffix: '%',
      color: getSentimentColor(avgSentiment),
      bgColor: `${getSentimentColor(avgSentiment)}15`
    },
    {
      icon: AlertCircle,
      label: 'Escalations',
      value: animatedValues.escalations.toString(),
      suffix: '',
      color: escalations > 5 ? '#ef4444' : '#f59e0b',
      bgColor: escalations > 5 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)'
    },
    {
      icon: Clock,
      label: 'Avg Response',
      value: animatedValues.avgResponseTime.toFixed(1),
      suffix: 's',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      icon: TrendingUp,
      label: 'CSAT Score',
      value: animatedValues.customerSatisfaction.toFixed(1),
      suffix: '/5',
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
