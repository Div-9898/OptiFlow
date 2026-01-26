'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, MessageSquare, Send, Users, TrendingUp, Clock,
  Package, Truck, CheckCircle2, AlertTriangle, RefreshCw,
  ThumbsUp, ThumbsDown, Star, Zap, Mail, Phone, MapPin,
  ChevronRight, Filter, Search, BarChart3, Activity,
  Smile, Meh, Frown, Volume2, Globe, Sparkles, Bot,
  Brain, TrendingDown, ArrowUp, ArrowDown, Minus, Eye
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { cn } from '@/lib/utils';

// Sentiment Analysis Keywords (simulates NLP)
const SENTIMENT_KEYWORDS = {
  positive: [
    'thank', 'thanks', 'great', 'excellent', 'awesome', 'perfect', 'amazing', 'love',
    'wonderful', 'fantastic', 'happy', 'pleased', 'satisfied', 'good', 'best', 'quick',
    'fast', 'early', 'helpful', 'friendly', 'professional', 'recommend', 'impressed',
    'delivered', 'success', 'smooth', 'efficient', 'on time', 'appreciate'
  ],
  negative: [
    'bad', 'terrible', 'awful', 'horrible', 'worst', 'late', 'delayed', 'wrong',
    'damaged', 'broken', 'missing', 'lost', 'angry', 'frustrated', 'disappointed',
    'poor', 'slow', 'rude', 'unprofessional', 'never', 'complaint', 'refund',
    'cancel', 'unacceptable', 'failed', 'problem', 'issue', 'error', 'mistake'
  ],
  neutral: [
    'okay', 'ok', 'fine', 'alright', 'normal', 'average', 'expected', 'standard',
    'usual', 'typical', 'when', 'where', 'how', 'what', 'update', 'status', 'track'
  ]
};

// Real-time sentiment analyzer
const analyzeSentiment = (text: string): { sentiment: 'positive' | 'neutral' | 'negative'; score: number; confidence: number; keywords: string[] } => {
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;
  const foundKeywords: string[] = [];

  SENTIMENT_KEYWORDS.positive.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      positiveScore += 1;
      foundKeywords.push(keyword);
    }
  });

  SENTIMENT_KEYWORDS.negative.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      negativeScore += 1;
      foundKeywords.push(keyword);
    }
  });

  SENTIMENT_KEYWORDS.neutral.forEach(keyword => {
    if (lowerText.includes(keyword)) {
      neutralScore += 0.5;
    }
  });

  const totalScore = positiveScore + negativeScore + neutralScore || 1;
  const normalizedPositive = positiveScore / totalScore;
  const normalizedNegative = negativeScore / totalScore;

  let sentiment: 'positive' | 'neutral' | 'negative';
  let score: number;

  if (positiveScore > negativeScore && positiveScore > neutralScore) {
    sentiment = 'positive';
    score = 0.5 + (normalizedPositive * 0.5);
  } else if (negativeScore > positiveScore && negativeScore > neutralScore) {
    sentiment = 'negative';
    score = 0.5 - (normalizedNegative * 0.5);
  } else {
    sentiment = 'neutral';
    score = 0.5;
  }

  const confidence = Math.min(0.95, 0.5 + (foundKeywords.length * 0.1));

  return { sentiment, score, confidence, keywords: foundKeywords.slice(0, 3) };
};

// Types
interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number;
  confidence: number;
  keywords: string[];
  analyzedAt: Date;
}

interface CustomerUpdate {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryId: string;
  vehicleId: string;
  type: 'eta_update' | 'delivery_started' | 'out_for_delivery' | 'delivered' | 'delayed' | 'rescheduled' | 'issue' | 'review';
  message: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  channel: 'sms' | 'email' | 'push' | 'whatsapp';
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentimentAnalysis?: SentimentAnalysis;
  aiGenerated: boolean;
  isReview?: boolean;
  rating?: number;
  response?: {
    message: string;
    timestamp: Date;
    sentiment: 'positive' | 'neutral' | 'negative';
  };
}

interface SentimentTrendPoint {
  time: string;
  positive: number;
  neutral: number;
  negative: number;
  avgScore: number;
}

interface CustomerMetrics {
  totalCustomers: number;
  activeDeliveries: number;
  messagesSentToday: number;
  responseRate: number;
  avgResponseTime: number; // minutes
  satisfactionScore: number; // 0-100
  npsScore: number; // -100 to 100
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  reviewsToday: number;
  avgSentimentScore: number;
  sentimentTrend: 'improving' | 'stable' | 'declining';
  lastAnalyzedMessage?: string;
}

// Customer review messages for realistic sentiment analysis
const customerReviews = {
  positive: [
    "Excellent service! The driver was so friendly and my package arrived earlier than expected. Thank you!",
    "Amazing delivery experience! Fast, professional, and the tracking was perfect. Highly recommend!",
    "Great job! My order was delivered on time and the driver was very helpful. Love this service!",
    "Fantastic! Package arrived in perfect condition. The delivery team is wonderful!",
    "Best delivery experience ever! Quick, efficient, and the app updates were so helpful. Thank you so much!",
    "Impressed with the speed of delivery. Everything was smooth and professional. Will use again!",
    "Perfect delivery! On time, great communication, and friendly driver. Couldn't ask for more!",
    "Super happy with the service! Fast delivery and excellent customer support. Appreciate it!",
    "Wonderful experience from start to finish. The driver went above and beyond. Thank you!",
    "Outstanding service! My package was delivered early and in great condition. Love it!"
  ],
  negative: [
    "Very disappointed. Package arrived late and damaged. This is unacceptable!",
    "Terrible experience. Driver was rude and the delivery was delayed by hours. Never again!",
    "Awful service! Wrong item delivered and customer support was unhelpful. Want a refund!",
    "Frustrated with this company. My package has been lost and nobody is helping me!",
    "Poor delivery service. Package was left in the rain and got damaged. Very angry!",
    "Worst experience ever. Delivery was cancelled without notice. This is a problem!",
    "Disappointed and frustrated. Late delivery and broken items. Need to file a complaint!",
    "Horrible! Package never arrived and tracking shows it as delivered. This is a mistake!",
    "Bad service. Driver couldn't find my address and didn't even try to call. Unacceptable!",
    "Very unhappy. Waited all day for a delivery that never came. This is an issue!"
  ],
  neutral: [
    "Delivery was okay. Nothing special but got the job done.",
    "Package arrived. When can I expect the second part of my order?",
    "Fine delivery. Would like to know the status of my other shipment.",
    "Standard service. How do I update my delivery address for next time?",
    "Normal delivery experience. What are your operating hours?",
    "Okay service. Can you track my package from last week?",
    "Average delivery. Where can I find my receipt?",
    "Delivery completed. How do I schedule a pickup?",
    "Alright experience. When will my refund be processed?",
    "Typical delivery. Can I change my delivery time for tomorrow?"
  ]
};

// Generate mock customer updates with real-time sentiment analysis
const generateCustomerUpdate = (index: number, forceReview = false): CustomerUpdate => {
  const types: CustomerUpdate['type'][] = ['eta_update', 'delivery_started', 'out_for_delivery', 'delivered', 'delayed', 'rescheduled', 'issue', 'review'];
  const channels: CustomerUpdate['channel'][] = ['sms', 'email', 'push', 'whatsapp'];
  const statuses: CustomerUpdate['status'][] = ['sent', 'delivered', 'read', 'failed'];

  // 40% chance of generating a review, or forced review
  const isReview = forceReview || Math.random() < 0.4;
  const type = isReview ? 'review' : types[Math.floor(Math.random() * (types.length - 1))];

  const customerNames = [
    'Mohammed Al-Rashid', 'Sarah Johnson', 'Ahmed Hassan', 'Emily Chen',
    'Fatima Al-Mansoori', 'David Smith', 'Aisha Khan', 'Michael Brown',
    'Layla Ibrahim', 'James Wilson', 'Noura Al-Sayed', 'Robert Taylor',
    'Omar Khalid', 'Lisa Anderson', 'Hassan Ali', 'Jennifer White',
    'Yusuf Ibrahim', 'Maria Garcia', 'Ali Hassan', 'Emma Thompson'
  ];

  const systemMessages: Record<Exclude<CustomerUpdate['type'], 'review'>, string[]> = {
    eta_update: [
      'Your delivery is on track! ETA updated to 2:30 PM.',
      'Good news! Your package will arrive earlier than expected - by 1:45 PM.',
      'Traffic update: Your delivery ETA is now 3:15 PM.'
    ],
    delivery_started: [
      'Great news! Your order has left our warehouse and is on its way.',
      'Your delivery is now in transit. Track it live in our app!',
      'Exciting! Your package just started its journey to you.'
    ],
    out_for_delivery: [
      'Almost there! Your package is out for delivery.',
      'Your driver is in your area. Delivery within the next hour!',
      'Final stretch! Your order will arrive very soon.'
    ],
    delivered: [
      'Delivered! Your package has been successfully delivered. Thank you for choosing us!',
      'Success! Your order was delivered and signed for.',
      'All done! Your delivery is complete. We hope you enjoy your purchase!'
    ],
    delayed: [
      'We apologize - your delivery is delayed due to traffic. New ETA: 4:30 PM.',
      'Update: Weather conditions have caused a slight delay. We\'re working to deliver ASAP.',
      'Sorry for the inconvenience. Your delivery will arrive 30 minutes later than expected.'
    ],
    rescheduled: [
      'Your delivery has been rescheduled to tomorrow between 10 AM - 2 PM.',
      'As requested, your delivery is now scheduled for Saturday morning.',
      'Delivery rescheduled: New date is January 22nd, 2026.'
    ],
    issue: [
      'We need your help! Please confirm your delivery address.',
      'Attention: Unable to access your building. Please provide gate code.',
      'Issue: Package requires signature. Will attempt delivery again tomorrow.'
    ]
  };

  const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];

  // Generate message based on type
  let message: string;
  let sentimentCategory: 'positive' | 'neutral' | 'negative';
  let rating: number | undefined;

  if (isReview) {
    // Weighted random: 60% positive, 25% neutral, 15% negative
    const rand = Math.random();
    if (rand < 0.60) {
      sentimentCategory = 'positive';
      rating = Math.floor(Math.random() * 2) + 4; // 4-5 stars
    } else if (rand < 0.85) {
      sentimentCategory = 'neutral';
      rating = 3; // 3 stars
    } else {
      sentimentCategory = 'negative';
      rating = Math.floor(Math.random() * 2) + 1; // 1-2 stars
    }
    message = customerReviews[sentimentCategory][Math.floor(Math.random() * customerReviews[sentimentCategory].length)];
  } else {
    message = systemMessages[type as Exclude<CustomerUpdate['type'], 'review'>][
      Math.floor(Math.random() * systemMessages[type as Exclude<CustomerUpdate['type'], 'review'>].length)
    ];
    sentimentCategory = 'neutral';
  }

  // Run real-time sentiment analysis on the message
  const sentimentResult = analyzeSentiment(message);

  return {
    id: `update-${Date.now()}-${index}`,
    customerId: `cust-${1000 + Math.floor(Math.random() * 9000)}`,
    customerName,
    customerEmail: `${customerName.toLowerCase().replace(' ', '.')}@email.com`,
    customerPhone: `+971 5${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
    deliveryId: `DEL-${Math.floor(Math.random() * 90000) + 10000}`,
    vehicleId: `VH-${1001 + Math.floor(Math.random() * 6)}`,
    type,
    message,
    timestamp: new Date(Date.now() - Math.random() * 60000), // Within last minute for real-time feel
    status: statuses[Math.floor(Math.random() * statuses.length)],
    channel: channels[Math.floor(Math.random() * channels.length)],
    sentiment: sentimentResult.sentiment,
    sentimentAnalysis: {
      ...sentimentResult,
      analyzedAt: new Date()
    },
    aiGenerated: !isReview && Math.random() > 0.3,
    isReview,
    rating,
    response: !isReview && Math.random() > 0.7 ? {
      message: customerReviews[['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as 'positive' | 'neutral' | 'negative'][Math.floor(Math.random() * 5)].split('.')[0] + '.',
      timestamp: new Date(Date.now() - Math.random() * 1800000),
      sentiment: sentimentResult.sentiment
    } : undefined
  };
};

// KPI Card Component
function KPICard({
  icon: Icon,
  label,
  value,
  suffix = '',
  trend,
  color
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  suffix?: string;
  trend?: { value: number; positive: boolean };
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl"
      style={{
        background: 'linear-gradient(180deg, rgba(15,20,35,0.95) 0%, rgba(10,15,25,0.98) 100%)',
        border: `1px solid ${color}30`,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            trend.positive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          )}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </motion.div>
  );
}

// Enhanced Sentiment Gauge Component with real-time updates
function SentimentGauge({
  positive,
  neutral,
  negative,
  isAnalyzing = false,
  lastAnalysis
}: {
  positive: number;
  neutral: number;
  negative: number;
  isAnalyzing?: boolean;
  lastAnalysis?: SentimentAnalysis | null;
}) {
  const total = positive + neutral + negative || 1;
  const posPercent = (positive / total) * 100;
  const neuPercent = (neutral / total) * 100;
  const negPercent = (negative / total) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Customer Sentiment</span>
          {isAnalyzing && (
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-cyan-400 flex items-center gap-1"
            >
              <Brain className="w-3 h-3" />
              Analyzing...
            </motion.span>
          )}
        </div>
      </div>

      <div className="h-4 bg-dark-700 rounded-full overflow-hidden flex relative">
        <motion.div
          className="h-full bg-gradient-to-r from-green-500 to-green-400"
          initial={{ width: 0 }}
          animate={{ width: `${posPercent}%` }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400"
          initial={{ width: 0 }}
          animate={{ width: `${neuPercent}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
        <motion.div
          className="h-full bg-gradient-to-r from-red-500 to-red-400"
          initial={{ width: 0 }}
          animate={{ width: `${negPercent}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <motion.div
          className="p-2 rounded-lg bg-green-500/10 border border-green-500/20"
          animate={lastAnalysis?.sentiment === 'positive' ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <Smile className="w-4 h-4 text-green-400" />
            <span className="text-sm font-bold text-green-400">{posPercent.toFixed(0)}%</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Positive</p>
        </motion.div>

        <motion.div
          className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20"
          animate={lastAnalysis?.sentiment === 'neutral' ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <Meh className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-bold text-yellow-400">{neuPercent.toFixed(0)}%</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Neutral</p>
        </motion.div>

        <motion.div
          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20"
          animate={lastAnalysis?.sentiment === 'negative' ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <Frown className="w-4 h-4 text-red-400" />
            <span className="text-sm font-bold text-red-400">{negPercent.toFixed(0)}%</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Negative</p>
        </motion.div>
      </div>
    </div>
  );
}

// Real-time Sentiment Analysis Panel
function RealTimeSentimentPanel({
  lastAnalysis,
  sentimentTrend,
  avgScore
}: {
  lastAnalysis: SentimentAnalysis | null;
  sentimentTrend: SentimentTrendPoint[];
  avgScore: number;
}) {
  const trendDirection = useMemo(() => {
    if (sentimentTrend.length < 2) return 'stable';
    const recent = sentimentTrend.slice(-5);
    const avgRecent = recent.reduce((sum, p) => sum + p.avgScore, 0) / recent.length;
    const avgOlder = sentimentTrend.slice(0, -5).reduce((sum, p) => sum + p.avgScore, 0) / Math.max(1, sentimentTrend.length - 5);
    if (avgRecent > avgOlder + 0.05) return 'improving';
    if (avgRecent < avgOlder - 0.05) return 'declining';
    return 'stable';
  }, [sentimentTrend]);

  return (
    <div className="space-y-4">
      {/* Latest Analysis Card */}
      {lastAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg border bg-gradient-to-r from-dark-700/50 to-dark-800/50"
          style={{
            borderColor: lastAnalysis.sentiment === 'positive' ? 'rgba(34, 197, 94, 0.3)' :
              lastAnalysis.sentiment === 'negative' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(234, 179, 8, 0.3)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Brain className="w-3 h-3 text-cyan-400" />
              Latest Analysis
            </span>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              lastAnalysis.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                lastAnalysis.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
            )}>
              {lastAnalysis.sentiment.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <p className="text-[10px] text-gray-500">Score</p>
              <p className="text-lg font-bold text-white">{(lastAnalysis.score * 100).toFixed(0)}%</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Confidence</p>
              <p className="text-lg font-bold text-cyan-400">{(lastAnalysis.confidence * 100).toFixed(0)}%</p>
            </div>
          </div>

          {lastAnalysis.keywords.length > 0 && (
            <div>
              <p className="text-[10px] text-gray-500 mb-1">Keywords Detected</p>
              <div className="flex flex-wrap gap-1">
                {lastAnalysis.keywords.map((kw, i) => (
                  <span
                    key={i}
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full',
                      lastAnalysis.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                        lastAnalysis.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                    )}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Trend Chart */}
      {sentimentTrend.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-400">Sentiment Trend</span>
            <span className={cn(
              'text-xs flex items-center gap-1',
              trendDirection === 'improving' ? 'text-green-400' :
                trendDirection === 'declining' ? 'text-red-400' : 'text-yellow-400'
            )}>
              {trendDirection === 'improving' ? <TrendingUp className="w-3 h-3" /> :
                trendDirection === 'declining' ? <TrendingDown className="w-3 h-3" /> :
                  <Minus className="w-3 h-3" />}
              {trendDirection.charAt(0).toUpperCase() + trendDirection.slice(1)}
            </span>
          </div>
          <div className="h-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sentimentTrend}>
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" hide />
                <YAxis domain={[0, 1]} hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a1a25',
                    border: '1px solid rgba(0, 245, 255, 0.2)',
                    borderRadius: '8px',
                    fontSize: '10px'
                  }}
                  formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, 'Score']}
                />
                <Area
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#22c55e"
                  fill="url(#sentimentGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Average Score */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-dark-700/50">
        <div>
          <p className="text-[10px] text-gray-500">Overall Sentiment Score</p>
          <p className="text-2xl font-bold text-white">{(avgScore * 100).toFixed(0)}%</p>
        </div>
        <div className={cn(
          'p-3 rounded-full',
          avgScore >= 0.7 ? 'bg-green-500/20' : avgScore >= 0.5 ? 'bg-yellow-500/20' : 'bg-red-500/20'
        )}>
          {avgScore >= 0.7 ? <Smile className="w-6 h-6 text-green-400" /> :
            avgScore >= 0.5 ? <Meh className="w-6 h-6 text-yellow-400" /> :
              <Frown className="w-6 h-6 text-red-400" />}
        </div>
      </div>
    </div>
  );
}

// Live Update Card with sentiment analysis display
function UpdateCard({ update, onSendResponse, showSentiment = true }: { update: CustomerUpdate; onSendResponse: (id: string) => void; showSentiment?: boolean }) {
  const typeConfig: Record<CustomerUpdate['type'], { icon: React.ElementType; color: string; bg: string }> = {
    eta_update: { icon: Clock, color: '#3b82f6', bg: 'bg-blue-500/10' },
    delivery_started: { icon: Truck, color: '#22c55e', bg: 'bg-green-500/10' },
    out_for_delivery: { icon: MapPin, color: '#f59e0b', bg: 'bg-yellow-500/10' },
    delivered: { icon: CheckCircle2, color: '#10b981', bg: 'bg-emerald-500/10' },
    delayed: { icon: AlertTriangle, color: '#ef4444', bg: 'bg-red-500/10' },
    rescheduled: { icon: RefreshCw, color: '#8b5cf6', bg: 'bg-purple-500/10' },
    issue: { icon: AlertTriangle, color: '#f97316', bg: 'bg-orange-500/10' },
    review: { icon: Star, color: '#f59e0b', bg: 'bg-yellow-500/10' }
  };

  const channelIcons: Record<CustomerUpdate['channel'], React.ElementType> = {
    sms: MessageSquare,
    email: Mail,
    push: Bell,
    whatsapp: MessageSquare
  };

  const config = typeConfig[update.type];
  const Icon = config.icon;
  const ChannelIcon = channelIcons[update.channel];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="p-4 rounded-xl border border-dark-600 hover:border-dark-500 transition-all"
      style={{
        background: 'linear-gradient(180deg, rgba(15,20,35,0.9) 0%, rgba(10,15,25,0.95) 100%)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2.5 rounded-xl', config.bg)}>
          <Icon className="w-5 h-5" style={{ color: config.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">{update.customerName}</span>
              {update.aiGenerated && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-[10px]">
                  <Bot className="w-3 h-3" /> AI
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <ChannelIcon className="w-3.5 h-3.5 text-gray-500" />
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full',
                update.status === 'read' ? 'bg-green-500/20 text-green-400' :
                update.status === 'delivered' ? 'bg-blue-500/20 text-blue-400' :
                update.status === 'sent' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              )}>
                {update.status}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-300 mb-2">{update.message}</p>

          {/* Rating Stars for Reviews */}
          {update.isReview && update.rating && (
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'w-4 h-4',
                    star <= update.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                  )}
                />
              ))}
              <span className="text-xs text-gray-400 ml-2">{update.rating}/5</span>
            </div>
          )}

          {/* Sentiment Analysis Badge */}
          {showSentiment && update.sentimentAnalysis && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'inline-flex items-center gap-2 px-2 py-1 rounded-lg mb-2 text-[10px]',
                update.sentimentAnalysis.sentiment === 'positive' ? 'bg-green-500/10 border border-green-500/20' :
                  update.sentimentAnalysis.sentiment === 'negative' ? 'bg-red-500/10 border border-red-500/20' :
                    'bg-yellow-500/10 border border-yellow-500/20'
              )}
            >
              <Brain className="w-3 h-3 text-cyan-400" />
              <span className={cn(
                'font-medium',
                update.sentimentAnalysis.sentiment === 'positive' ? 'text-green-400' :
                  update.sentimentAnalysis.sentiment === 'negative' ? 'text-red-400' : 'text-yellow-400'
              )}>
                {update.sentimentAnalysis.sentiment.toUpperCase()}
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400">
                Score: {(update.sentimentAnalysis.score * 100).toFixed(0)}%
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-cyan-400">
                {(update.sentimentAnalysis.confidence * 100).toFixed(0)}% conf
              </span>
              {update.sentimentAnalysis.keywords.length > 0 && (
                <>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-400">
                    "{update.sentimentAnalysis.keywords[0]}"
                  </span>
                </>
              )}
            </motion.div>
          )}

          <div className="flex items-center gap-3 text-[10px] text-gray-500">
            <span className="flex items-center gap-1">
              <Package className="w-3 h-3" />
              {update.deliveryId}
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-3 h-3" />
              {update.vehicleId}
            </span>
            <span>{update.timestamp.toLocaleTimeString()}</span>
          </div>

          {/* Customer Response */}
          {update.response && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-lg bg-dark-700/50 border-l-2"
              style={{ borderColor: update.response.sentiment === 'positive' ? '#22c55e' : update.response.sentiment === 'negative' ? '#ef4444' : '#f59e0b' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] text-gray-500">Customer replied:</span>
                {update.response.sentiment === 'positive' && <ThumbsUp className="w-3 h-3 text-green-400" />}
                {update.response.sentiment === 'negative' && <ThumbsDown className="w-3 h-3 text-red-400" />}
              </div>
              <p className="text-xs text-gray-300">"{update.response.message}"</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Message Composer
function MessageComposer({ onSend }: { onSend: (message: string, channel: string) => void }) {
  const [message, setMessage] = useState('');
  const [channel, setChannel] = useState<'sms' | 'email' | 'push' | 'whatsapp'>('sms');
  const [isGenerating, setIsGenerating] = useState(false);

  const templates = [
    { label: 'ETA Update', message: 'Your delivery is on track! ETA: [TIME]. Track live: [LINK]' },
    { label: 'Delay Notice', message: 'We apologize - your delivery is delayed. New ETA: [TIME]. We\'re doing everything to get your package to you ASAP.' },
    { label: 'Delivered', message: 'Great news! Your package has been delivered. Thank you for choosing us!' },
    { label: 'Feedback Request', message: 'How was your delivery experience? Rate us: [LINK]' },
  ];

  const generateAIMessage = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setMessage('Your delivery from Dubai Logistics is progressing smoothly! Your driver Ahmed is currently 3.2km away and will arrive by approximately 2:45 PM. Track your package in real-time through our app. Thank you for your patience!');
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="p-4 rounded-xl border border-dark-600" style={{
      background: 'linear-gradient(180deg, rgba(15,20,35,0.95) 0%, rgba(10,15,25,0.98) 100%)',
    }}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-white flex items-center gap-2">
          <Send className="w-4 h-4 text-cyan-400" />
          Compose Message
        </h4>
        <div className="flex gap-1">
          {(['sms', 'email', 'push', 'whatsapp'] as const).map((ch) => (
            <button
              key={ch}
              onClick={() => setChannel(ch)}
              className={cn(
                'px-2 py-1 rounded-lg text-[10px] transition-all',
                channel === ch
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              {ch.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Templates */}
      <div className="flex flex-wrap gap-2 mb-3">
        {templates.map((t) => (
          <button
            key={t.label}
            onClick={() => setMessage(t.message)}
            className="px-2 py-1 rounded-lg text-[10px] bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600 transition-all"
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={generateAIMessage}
          disabled={isGenerating}
          className="px-2 py-1 rounded-lg text-[10px] bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all flex items-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          {isGenerating ? 'Generating...' : 'AI Generate'}
        </button>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="w-full h-24 px-3 py-2 rounded-lg bg-dark-700 border border-dark-600 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 resize-none"
      />

      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-gray-500">{message.length}/500 characters</span>
        <button
          onClick={() => { onSend(message, channel); setMessage(''); }}
          disabled={!message.trim()}
          className="px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send to All
        </button>
      </div>
    </div>
  );
}

// Main Page Component
export default function CustomerUpdatesPage() {
  const [updates, setUpdates] = useState<CustomerUpdate[]>([]);
  const [metrics, setMetrics] = useState<CustomerMetrics>({
    totalCustomers: 2847,
    activeDeliveries: 156,
    messagesSentToday: 1234,
    responseRate: 78.5,
    avgResponseTime: 4.2,
    satisfactionScore: 92,
    npsScore: 67,
    sentimentBreakdown: { positive: 68, neutral: 24, negative: 8 },
    reviewsToday: 156,
    avgSentimentScore: 0.72,
    sentimentTrend: 'stable'
  });
  const [filter, setFilter] = useState<'all' | CustomerUpdate['type']>('all');
  const [isLive, setIsLive] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<SentimentAnalysis | null>(null);
  const [sentimentTrend, setSentimentTrend] = useState<SentimentTrendPoint[]>([]);
  const updateIntervalRef = useRef<NodeJS.Timeout>();

  // Initialize updates and sentiment trend
  useEffect(() => {
    const initialUpdates = Array.from({ length: 15 }, (_, i) => generateCustomerUpdate(i));
    setUpdates(initialUpdates.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));

    // Initialize sentiment trend with historical data
    const initialTrend: SentimentTrendPoint[] = [];
    for (let i = 20; i >= 0; i--) {
      const time = new Date(Date.now() - i * 60000);
      initialTrend.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        positive: 60 + Math.random() * 20,
        neutral: 15 + Math.random() * 15,
        negative: 5 + Math.random() * 10,
        avgScore: 0.65 + Math.random() * 0.2
      });
    }
    setSentimentTrend(initialTrend);
  }, []);

  // Process incoming update and update metrics based on sentiment
  const processNewUpdate = useCallback((newUpdate: CustomerUpdate) => {
    if (newUpdate.sentimentAnalysis) {
      setIsAnalyzing(true);

      // Simulate analysis delay for visual effect
      setTimeout(() => {
        setLastAnalysis(newUpdate.sentimentAnalysis!);
        setIsAnalyzing(false);

        // Update sentiment breakdown based on new message
        setMetrics(prev => {
          const sentiment = newUpdate.sentimentAnalysis!.sentiment;
          const newBreakdown = { ...prev.sentimentBreakdown };

          // Increment the relevant sentiment count
          if (sentiment === 'positive') newBreakdown.positive += 1;
          else if (sentiment === 'negative') newBreakdown.negative += 1;
          else newBreakdown.neutral += 1;

          // Calculate new average sentiment score
          const total = newBreakdown.positive + newBreakdown.neutral + newBreakdown.negative;
          const newAvgScore = (
            (newBreakdown.positive * 0.9) +
            (newBreakdown.neutral * 0.5) +
            (newBreakdown.negative * 0.1)
          ) / total;

          // Update satisfaction score based on sentiment
          let satisfactionDelta = 0;
          if (sentiment === 'positive') satisfactionDelta = Math.random() * 0.3;
          else if (sentiment === 'negative') satisfactionDelta = -Math.random() * 0.5;

          // Update NPS score based on sentiment
          let npsDelta = 0;
          if (sentiment === 'positive') npsDelta = Math.random() * 0.5;
          else if (sentiment === 'negative') npsDelta = -Math.random() * 1;

          // Determine trend
          let trend: 'improving' | 'stable' | 'declining' = 'stable';
          if (newAvgScore > prev.avgSentimentScore + 0.02) trend = 'improving';
          else if (newAvgScore < prev.avgSentimentScore - 0.02) trend = 'declining';

          return {
            ...prev,
            messagesSentToday: prev.messagesSentToday + 1,
            reviewsToday: newUpdate.isReview ? prev.reviewsToday + 1 : prev.reviewsToday,
            sentimentBreakdown: newBreakdown,
            avgSentimentScore: newAvgScore,
            satisfactionScore: Math.max(0, Math.min(100, prev.satisfactionScore + satisfactionDelta)),
            npsScore: Math.max(-100, Math.min(100, prev.npsScore + npsDelta)),
            responseRate: Math.min(100, prev.responseRate + (Math.random() - 0.5) * 0.5),
            sentimentTrend: trend
          };
        });

        // Update sentiment trend chart
        setSentimentTrend(prev => {
          const newPoint: SentimentTrendPoint = {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            positive: metrics.sentimentBreakdown.positive,
            neutral: metrics.sentimentBreakdown.neutral,
            negative: metrics.sentimentBreakdown.negative,
            avgScore: newUpdate.sentimentAnalysis!.score
          };
          return [...prev.slice(-29), newPoint];
        });
      }, 500);
    }
  }, [metrics.sentimentBreakdown]);

  // Live updates
  useEffect(() => {
    if (isLive) {
      updateIntervalRef.current = setInterval(() => {
        // Generate new update (40% chance of review)
        const newUpdate = generateCustomerUpdate(Date.now(), Math.random() < 0.5);
        setUpdates(prev => [newUpdate, ...prev.slice(0, 49)]);

        // Process the new update for sentiment analysis
        processNewUpdate(newUpdate);
      }, 2500);
    }

    return () => {
      if (updateIntervalRef.current) clearInterval(updateIntervalRef.current);
    };
  }, [isLive, processNewUpdate]);

  const filteredUpdates = filter === 'all'
    ? updates
    : updates.filter(u => u.type === filter);

  const handleSendMessage = (message: string, channel: string) => {
    const newUpdate: CustomerUpdate = {
      id: `update-${Date.now()}`,
      customerId: 'broadcast',
      customerName: 'All Customers',
      customerEmail: 'broadcast@dubailogistics.ae',
      customerPhone: 'N/A',
      deliveryId: 'BROADCAST',
      vehicleId: 'ALL',
      type: 'eta_update',
      message,
      timestamp: new Date(),
      status: 'sent',
      channel: channel as CustomerUpdate['channel'],
      aiGenerated: false
    };
    setUpdates(prev => [newUpdate, ...prev]);
    setMetrics(prev => ({ ...prev, messagesSentToday: prev.messagesSentToday + 1 }));
  };

  return (
    <div className="flex h-screen bg-dark-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar isConnected={isConnected} />

        <div className="flex-1 overflow-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <Bell className="w-7 h-7 text-cyan-400" />
                Customer Updates
                <motion.span
                  className="ml-2 px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-2"
                  animate={{ opacity: isLive ? [1, 0.5, 1] : 1 }}
                  transition={{ duration: 1.5, repeat: isLive ? Infinity : 0 }}
                >
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  {isLive ? 'LIVE' : 'PAUSED'}
                </motion.span>
              </h1>
              <p className="text-gray-500 mt-1">Real-time customer communication & delivery notifications</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLive(!isLive)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                  isLive
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-dark-700 text-gray-400 border border-dark-600'
                )}
              >
                {isLive ? <Activity className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                {isLive ? 'Live Mode' : 'Resume'}
              </button>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <KPICard
              icon={Users}
              label="Total Customers"
              value={metrics.totalCustomers}
              color="#3b82f6"
              trend={{ value: 12, positive: true }}
            />
            <KPICard
              icon={MessageSquare}
              label="Messages Today"
              value={metrics.messagesSentToday}
              color="#22c55e"
              trend={{ value: 8, positive: true }}
            />
            <KPICard
              icon={TrendingUp}
              label="Response Rate"
              value={metrics.responseRate.toFixed(1)}
              suffix="%"
              color="#f59e0b"
              trend={{ value: 3, positive: true }}
            />
            <KPICard
              icon={Star}
              label="Satisfaction"
              value={metrics.satisfactionScore}
              suffix="%"
              color="#a855f7"
              trend={{ value: 2, positive: true }}
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Live Feed */}
            <div className="col-span-2 space-y-4">
              {/* Filter Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50 border border-dark-600">
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-400">Filter:</span>
                  {(['all', 'review', 'delivered', 'delayed', 'issue'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        'px-3 py-1 rounded-lg text-xs transition-all',
                        filter === f
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                          : 'text-gray-500 hover:text-gray-300 hover:bg-dark-700',
                        f === 'review' && 'flex items-center gap-1'
                      )}
                    >
                      {f === 'review' && <Star className="w-3 h-3" />}
                      {f === 'all' ? 'All' : f.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    className="pl-9 pr-4 py-1.5 rounded-lg bg-dark-700 border border-dark-600 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              {/* Updates Feed */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                <AnimatePresence mode="popLayout">
                  {filteredUpdates.map((update) => (
                    <UpdateCard
                      key={update.id}
                      update={update}
                      onSendResponse={(id) => console.log('Respond to', id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column - Metrics & Composer */}
            <div className="space-y-4">
              {/* Real-Time Sentiment Analysis */}
              <div className="p-4 rounded-xl border border-dark-600" style={{
                background: 'linear-gradient(180deg, rgba(15,20,35,0.95) 0%, rgba(10,15,25,0.98) 100%)',
              }}>
                <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  Real-Time Sentiment Analysis
                  {isAnalyzing && (
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="ml-2 text-xs text-cyan-400"
                    >
                      Processing...
                    </motion.span>
                  )}
                </h4>

                <SentimentGauge
                  positive={metrics.sentimentBreakdown.positive}
                  neutral={metrics.sentimentBreakdown.neutral}
                  negative={metrics.sentimentBreakdown.negative}
                  isAnalyzing={isAnalyzing}
                  lastAnalysis={lastAnalysis}
                />

                {/* Real-time Analysis Panel */}
                <div className="mt-4 pt-4 border-t border-dark-600">
                  <RealTimeSentimentPanel
                    lastAnalysis={lastAnalysis}
                    sentimentTrend={sentimentTrend}
                    avgScore={metrics.avgSentimentScore}
                  />
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 rounded-lg bg-dark-700/50">
                    <p className="text-[10px] text-gray-500">NPS Score</p>
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        'text-xl font-bold',
                        metrics.npsScore >= 50 ? 'text-green-400' : metrics.npsScore >= 0 ? 'text-yellow-400' : 'text-red-400'
                      )}>
                        {metrics.npsScore >= 0 ? '+' : ''}{metrics.npsScore.toFixed(0)}
                      </p>
                      {metrics.sentimentTrend === 'improving' && <ArrowUp className="w-4 h-4 text-green-400" />}
                      {metrics.sentimentTrend === 'declining' && <ArrowDown className="w-4 h-4 text-red-400" />}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-dark-700/50">
                    <p className="text-[10px] text-gray-500">Reviews Today</p>
                    <p className="text-xl font-bold text-purple-400">{metrics.reviewsToday}</p>
                  </div>
                </div>
              </div>

              {/* Channel Distribution */}
              <div className="p-4 rounded-xl border border-dark-600" style={{
                background: 'linear-gradient(180deg, rgba(15,20,35,0.95) 0%, rgba(10,15,25,0.98) 100%)',
              }}>
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  Channel Distribution
                </h4>
                <div className="space-y-2">
                  {[
                    { channel: 'SMS', percent: 45, color: '#22c55e' },
                    { channel: 'WhatsApp', percent: 30, color: '#25d366' },
                    { channel: 'Email', percent: 15, color: '#3b82f6' },
                    { channel: 'Push', percent: 10, color: '#f59e0b' },
                  ].map((item) => (
                    <div key={item.channel}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">{item.channel}</span>
                        <span style={{ color: item.color }}>{item.percent}%</span>
                      </div>
                      <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percent}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Composer */}
              <MessageComposer onSend={handleSendMessage} />

              {/* Quick Stats */}
              <div className="p-4 rounded-xl border border-dark-600" style={{
                background: 'linear-gradient(180deg, rgba(15,20,35,0.95) 0%, rgba(10,15,25,0.98) 100%)',
              }}>
                <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Today's Highlights
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-green-500/10">
                    <span className="text-green-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Deliveries Completed
                    </span>
                    <span className="font-bold text-green-400">847</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-yellow-500/10">
                    <span className="text-yellow-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      In Transit
                    </span>
                    <span className="font-bold text-yellow-400">156</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-red-500/10">
                    <span className="text-red-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Issues Flagged
                    </span>
                    <span className="font-bold text-red-400">12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
