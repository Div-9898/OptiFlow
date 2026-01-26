'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Smile,
  Frown,
  Meh,
  Sparkles,
  Volume2,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageLayout from '@/components/dashboard/PageLayout';
import {
  CommKPIDashboard,
  SentimentGauges,
  MessageFeed,
  CustomerScorePanel
} from '@/components/communication';

export default function CommunicationHubPage() {
  const [message, setMessage] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState('friendly');
  const [sentiment, setSentiment] = useState({ positive: 0.7, neutral: 0.2, negative: 0.1 });
  const [messagesSent, setMessagesSent] = useState(156);
  const [responseRate, setResponseRate] = useState(94);
  const [avgSentiment, setAvgSentiment] = useState(8.2);
  const [escalations, setEscalations] = useState(3);
  const [avgResponseTime, setAvgResponseTime] = useState(3.5);
  const [customerSatisfaction, setCustomerSatisfaction] = useState(4.6);
  const [apiStatus, setApiStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [lastGeneratedSentiment, setLastGeneratedSentiment] = useState<{ positive: number; neutral: number; negative: number } | null>(null);

  const tones = [
    { id: 'formal', name: 'Formal', description: 'Professional B2B' },
    { id: 'friendly', name: 'Friendly', description: 'Warm & approachable' },
    { id: 'urgent', name: 'Urgent', description: 'Time-sensitive' },
    { id: 'apologetic', name: 'Apologetic', description: 'Issue resolution' },
  ];

  // Real-time metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time metric fluctuations
      setMessagesSent(prev => prev + Math.floor(Math.random() * 3));
      setResponseRate(prev => Math.min(100, Math.max(85, prev + (Math.random() - 0.5) * 2)));
      setAvgSentiment(prev => Math.min(10, Math.max(6, prev + (Math.random() - 0.5) * 0.3)));
      setAvgResponseTime(prev => Math.max(1, prev + (Math.random() - 0.5) * 0.5));

      // Occasionally update escalations
      if (Math.random() > 0.95) {
        setEscalations(prev => prev + 1);
      }

      // Update sentiment breakdown slightly
      setSentiment(prev => {
        const newPositive = Math.min(0.9, Math.max(0.5, prev.positive + (Math.random() - 0.5) * 0.05));
        const newNegative = Math.min(0.2, Math.max(0.05, prev.negative + (Math.random() - 0.5) * 0.02));
        const newNeutral = 1 - newPositive - newNegative;
        return { positive: newPositive, neutral: newNeutral, negative: newNegative };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Call Gemini API to generate message
  const handleGenerateMessage = useCallback(async () => {
    if (!message.trim()) {
      // If no context provided, use a default
      setMessage('Customer asking about their delivery status');
    }

    setIsGenerating(true);
    setApiStatus('loading');
    setGeneratedMessage('');
    setLastGeneratedSentiment(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${apiUrl}/communication/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: `CUST-${Math.floor(Math.random() * 10000)}`,
          context: message.trim() || 'Customer asking about their delivery status',
          tone: selectedTone,
          delivery_status: 'in_transit'
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedMessage(data.message);
      setLastGeneratedSentiment(data.sentiment);
      setApiStatus('success');

      // Update metrics after successful generation
      setMessagesSent(prev => prev + 1);

      // Update sentiment based on generated message sentiment
      if (data.sentiment) {
        setSentiment({
          positive: data.sentiment.positive || 0.7,
          neutral: data.sentiment.neutral || 0.2,
          negative: data.sentiment.negative || 0.1
        });
      }

    } catch (error) {
      console.error('Failed to generate message:', error);
      setApiStatus('error');

      // Fallback to template messages if API fails
      const fallbackMessages = {
        friendly: `Hi there! 👋 Thanks for reaching out about "${message || 'your delivery'}". Great news - your package is on its way! Our driver is currently in your area and should arrive within the next 15-20 minutes. You can track your delivery in real-time through our app. We appreciate your patience!`,
        formal: `Dear Valued Customer,\n\nThank you for your inquiry regarding "${message || 'your shipment'}". We are pleased to inform you that your package (Tracking #DXB-${Math.floor(Math.random() * 10000)}) is currently in transit.\n\nEstimated delivery: Within 15-20 minutes\nDriver: En route to your location\n\nPlease ensure someone is available to receive the package.\n\nBest regards,\nLogistics AI Platform`,
        urgent: `⚠️ URGENT UPDATE\n\nRegarding: "${message || 'Your Delivery'}"\n\nYour delivery is arriving in approximately 10 minutes. Please ensure you or an authorized representative is available to receive the package.\n\nIf you need to reschedule, contact us immediately:\n📞 +971-XXX-XXXX\n📧 support@logistics-ai.com\n\nTrack live: app.logistics-ai.com/track`,
        apologetic: `Dear Customer,\n\nWe sincerely apologize regarding "${message || 'the delay with your delivery'}". Due to unexpected circumstances, there has been a slight delay.\n\nWe understand this may be inconvenient, and we truly value your patience. As a token of our appreciation, we're applying a 10% discount to your next order.\n\nNew estimated arrival: 20-30 minutes\n\nThank you for your understanding.`,
      };

      setGeneratedMessage(fallbackMessages[selectedTone as keyof typeof fallbackMessages]);
    } finally {
      setIsGenerating(false);
    }
  }, [message, selectedTone]);

  return (
    <PageLayout>
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Communication <span className="text-accent-purple">Hub</span>
        </h1>
        <p className="text-gray-400">
          AI-powered customer messaging with Gemini
        </p>
      </motion.div>

      {/* KPI Dashboard */}
      <div className="mb-6">
        <CommKPIDashboard
          messagesSent={messagesSent}
          responseRate={responseRate}
          avgSentiment={avgSentiment}
          escalations={escalations}
          avgResponseTime={avgResponseTime}
          customerSatisfaction={customerSatisfaction}
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Message Generator */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-7"
        >
          <div className="glass-dark rounded-2xl p-6">
            {/* Tone Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Message Tone
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {tones.map((tone) => (
                  <motion.button
                    key={tone.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTone(tone.id)}
                    className={cn(
                      'p-3 rounded-xl text-center transition-all',
                      selectedTone === tone.id
                        ? 'bg-accent-purple/20 border border-accent-purple'
                        : 'bg-dark-700 border border-transparent hover:bg-dark-600'
                    )}
                  >
                    <p className="font-medium text-white text-sm">{tone.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{tone.description}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Context Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Delivery Context
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter delivery context (e.g., Package arriving in 15 minutes, driver name Ahmed...)"
                className="w-full h-32 p-4 bg-dark-700 border border-dark-600 rounded-xl text-white placeholder-gray-500 resize-none focus:outline-none focus:border-accent-purple transition-colors"
              />
            </div>

            {/* Generate Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerateMessage}
              disabled={isGenerating}
              className={cn(
                'w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all',
                isGenerating
                  ? 'bg-dark-600 text-gray-400'
                  : 'bg-gradient-to-r from-accent-purple to-accent-magenta text-white hover:shadow-neon-magenta'
              )}
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  Generating with Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate Message
                </>
              )}
            </motion.button>

            {/* Generated Message */}
            {(generatedMessage || isGenerating) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-dark-700 rounded-xl border border-accent-purple/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">Generated Message</h4>
                    {apiStatus === 'success' && (
                      <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        Gemini AI
                      </span>
                    )}
                    {apiStatus === 'error' && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        Fallback
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-dark-600 text-gray-400 hover:text-white transition-colors">
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 transition-colors"
                      onClick={() => {
                        setMessagesSent(prev => prev + 1);
                        setCustomerSatisfaction(prev => Math.min(5, prev + 0.01));
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isGenerating ? (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating with Gemini AI...</span>
                  </div>
                ) : (
                  <>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-300 leading-relaxed whitespace-pre-line"
                    >
                      {generatedMessage}
                    </motion.p>

                    {/* Sentiment Analysis of Generated Message */}
                    {lastGeneratedSentiment && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 pt-4 border-t border-dark-600"
                      >
                        <p className="text-xs text-gray-500 mb-2">Message Sentiment Analysis</p>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <Smile className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-green-400">{(lastGeneratedSentiment.positive * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Meh className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-yellow-400">{(lastGeneratedSentiment.neutral * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Frown className="w-4 h-4 text-red-400" />
                            <span className="text-sm text-red-400">{(lastGeneratedSentiment.negative * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right Panel - Sentiment Analysis & Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-5 space-y-4"
        >
          {/* Sentiment Gauges */}
          <SentimentGauges
            positive={sentiment.positive * 100}
            neutral={sentiment.neutral * 100}
            negative={sentiment.negative * 100}
          />

          {/* Customer Score Panel */}
          <CustomerScorePanel
            npsScore={72}
            csatScore={4.6}
            totalResponses={1842}
            trend={5.2}
          />

          {/* Message Activity Feed */}
          <MessageFeed />
        </motion.div>
      </div>
    </div>
    </PageLayout>
  );
}
