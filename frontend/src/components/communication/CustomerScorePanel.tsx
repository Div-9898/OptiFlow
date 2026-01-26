'use client';

import { motion } from 'framer-motion';
import { Star, TrendingUp, Users, Award } from 'lucide-react';

interface CustomerScorePanelProps {
  npsScore: number;
  csatScore: number;
  totalResponses: number;
  trend: number;
}

export default function CustomerScorePanel({
  npsScore,
  csatScore,
  totalResponses,
  trend
}: CustomerScorePanelProps) {
  const getNPSColor = (score: number) => {
    if (score >= 50) return '#10b981';
    if (score >= 0) return '#f59e0b';
    return '#ef4444';
  };

  const getNPSLabel = (score: number) => {
    if (score >= 50) return 'Excellent';
    if (score >= 0) return 'Good';
    return 'Needs Work';
  };

  // Calculate star rating (out of 5)
  const starRating = Math.round(csatScore * 2) / 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-dark rounded-xl p-4"
    >
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-yellow-400" />
        Customer Satisfaction
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* NPS Score */}
        <div className="p-3 bg-dark-700 rounded-lg text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">NPS Score</p>
          <motion.div
            className="text-3xl font-bold font-mono"
            style={{ color: getNPSColor(npsScore) }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
          >
            {npsScore > 0 ? '+' : ''}{npsScore}
          </motion.div>
          <p
            className="text-[10px] mt-1"
            style={{ color: getNPSColor(npsScore) }}
          >
            {getNPSLabel(npsScore)}
          </p>
        </div>

        {/* CSAT Score */}
        <div className="p-3 bg-dark-700 rounded-lg text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">CSAT Score</p>
          <motion.div
            className="text-3xl font-bold font-mono text-yellow-400"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10, delay: 0.1 }}
          >
            {csatScore.toFixed(1)}
          </motion.div>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="w-3 h-3"
                fill={star <= starRating ? '#facc15' : 'none'}
                stroke={star <= starRating ? '#facc15' : '#4b5563'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom metrics */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex items-center gap-2 p-2 bg-dark-700 rounded-lg">
          <Users className="w-4 h-4 text-blue-400" />
          <div>
            <p className="text-[10px] text-gray-500">Responses</p>
            <p className="text-sm font-semibold text-white">{totalResponses.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-dark-700 rounded-lg">
          <TrendingUp className={`w-4 h-4 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          <div>
            <p className="text-[10px] text-gray-500">Trend</p>
            <p className={`text-sm font-semibold ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
