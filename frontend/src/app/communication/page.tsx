'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Send, 
  Smile, 
  Frown, 
  Meh,
  Sparkles,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PageLayout from '@/components/dashboard/PageLayout';

export default function CommunicationHubPage() {
  const [message, setMessage] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState('friendly');
  const [sentiment, setSentiment] = useState({ positive: 0.7, neutral: 0.2, negative: 0.1 });

  const tones = [
    { id: 'formal', name: 'Formal', description: 'Professional B2B' },
    { id: 'friendly', name: 'Friendly', description: 'Warm & approachable' },
    { id: 'urgent', name: 'Urgent', description: 'Time-sensitive' },
    { id: 'apologetic', name: 'Apologetic', description: 'Issue resolution' },
  ];

  const handleGenerateMessage = async () => {
    setIsGenerating(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const messages = {
      friendly: "Hi there! 🚚 Great news - your package is on its way! Our driver Ahmed is just 15 minutes away. Track your delivery in real-time through the app. Can't wait for it to reach you!",
      formal: "Dear Valued Customer, We are pleased to inform you that your shipment #DXB-2847 is currently in transit and scheduled for delivery within the next 15-20 minutes. Please ensure someone is available to receive the package.",
      urgent: "IMPORTANT: Your delivery is arriving in 10 minutes. Please be available to receive it. If you need to reschedule, contact us immediately at +971-XXX-XXXX.",
      apologetic: "We sincerely apologize for the delay with your delivery. Due to unexpected traffic conditions, your package will arrive approximately 20 minutes later than scheduled. We truly value your patience and understanding.",
    };
    
    setGeneratedMessage(messages[selectedTone as keyof typeof messages]);
    setIsGenerating(false);
  };

  return (
    <PageLayout>
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Communication <span className="text-accent-purple">Hub</span>
        </h1>
        <p className="text-gray-400">
          AI-powered customer messaging with Gemini
        </p>
      </motion.div>

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
            {generatedMessage && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-dark-700 rounded-xl border border-accent-purple/20"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-white">Generated Message</h4>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-dark-600 text-gray-400 hover:text-white transition-colors">
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg bg-dark-600 text-gray-400 hover:text-white transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-300 leading-relaxed"
                >
                  {generatedMessage.split('').map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.01 }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </motion.p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right Panel - Sentiment Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-5"
        >
          {/* Sentiment Radar */}
          <div className="glass-dark rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-6">
              Sentiment Analysis
            </h3>
            
            <div className="relative w-64 h-64 mx-auto">
              {/* Radar background */}
              <div className="absolute inset-0 rounded-full border-2 border-dark-600" />
              <div className="absolute inset-8 rounded-full border border-dark-600" />
              <div className="absolute inset-16 rounded-full border border-dark-600" />
              
              {/* Sentiment indicators */}
              <motion.div
                className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Smile className="w-8 h-8 text-green-400" />
                <span className="text-green-400 font-bold mt-1">
                  {(sentiment.positive * 100).toFixed(0)}%
                </span>
              </motion.div>
              
              <div className="absolute bottom-4 left-8 flex flex-col items-center">
                <Frown className="w-8 h-8 text-red-400" />
                <span className="text-red-400 font-bold mt-1">
                  {(sentiment.negative * 100).toFixed(0)}%
                </span>
              </div>
              
              <div className="absolute bottom-4 right-8 flex flex-col items-center">
                <Meh className="w-8 h-8 text-gray-400" />
                <span className="text-gray-400 font-bold mt-1">
                  {(sentiment.neutral * 100).toFixed(0)}%
                </span>
              </div>

              {/* Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-accent-purple/20 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-accent-purple" />
                </div>
              </div>
            </div>
          </div>

          {/* Message Stats */}
          <div className="glass-dark rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Today&apos;s Messages
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-700 rounded-xl">
                <p className="text-2xl font-bold text-accent-cyan">156</p>
                <p className="text-sm text-gray-400">Total Sent</p>
              </div>
              <div className="p-4 bg-dark-700 rounded-xl">
                <p className="text-2xl font-bold text-green-400">94%</p>
                <p className="text-sm text-gray-400">Positive Rate</p>
              </div>
              <div className="p-4 bg-dark-700 rounded-xl">
                <p className="text-2xl font-bold text-accent-purple">12</p>
                <p className="text-sm text-gray-400">AI Generated</p>
              </div>
              <div className="p-4 bg-dark-700 rounded-xl">
                <p className="text-2xl font-bold text-orange-400">3</p>
                <p className="text-sm text-gray-400">Escalations</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    </PageLayout>
  );
}
