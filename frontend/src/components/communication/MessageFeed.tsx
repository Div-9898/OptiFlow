'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  User,
  Bot,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react';

interface Message {
  id: string;
  type: 'sent' | 'received';
  channel: 'sms' | 'email' | 'app';
  recipient: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  timestamp: Date;
  isAI: boolean;
}

const CHANNELS = ['sms', 'email', 'app'] as const;
const RECIPIENTS = ['John D.', 'Sarah M.', 'Ahmed K.', 'Lisa T.', 'Omar H.'];

const MESSAGE_TEMPLATES = {
  sent: [
    'Your delivery is on the way!',
    'Package arriving in 15 minutes',
    'Delivery confirmed for today',
    'Driver en route to your location',
    'Your order has been dispatched'
  ],
  received: [
    'Thank you! Looking forward to it',
    'Great, I will be home',
    'Can you provide an ETA?',
    'Please leave at door',
    'Excellent service as always!'
  ]
};

export default function MessageFeed() {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateMessage = (): Message => {
      const type = Math.random() > 0.4 ? 'sent' : 'received';
      const sentiment = Math.random() > 0.7 ? 'positive' : Math.random() > 0.3 ? 'neutral' : 'negative';

      return {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        channel: CHANNELS[Math.floor(Math.random() * CHANNELS.length)],
        recipient: RECIPIENTS[Math.floor(Math.random() * RECIPIENTS.length)],
        content: MESSAGE_TEMPLATES[type][Math.floor(Math.random() * MESSAGE_TEMPLATES[type].length)],
        sentiment,
        timestamp: new Date(),
        isAI: type === 'sent' && Math.random() > 0.3
      };
    };

    // Initial messages
    const initialMessages = Array.from({ length: 5 }, () => {
      const msg = generateMessage();
      msg.timestamp = new Date(Date.now() - Math.random() * 600000);
      return msg;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setMessages(initialMessages);

    // Add new messages
    const interval = setInterval(() => {
      if (Math.random() > 0.4) {
        setMessages(prev => [generateMessage(), ...prev].slice(0, 20));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [messages[0]?.id]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSentimentIcon = (sentiment: Message['sentiment']) => {
    switch (sentiment) {
      case 'positive': return ThumbsUp;
      case 'neutral': return Minus;
      case 'negative': return ThumbsDown;
    }
  };

  const getSentimentColor = (sentiment: Message['sentiment']) => {
    switch (sentiment) {
      case 'positive': return '#10b981';
      case 'neutral': return '#f59e0b';
      case 'negative': return '#ef4444';
    }
  };

  const getChannelColor = (channel: Message['channel']) => {
    switch (channel) {
      case 'sms': return '#3b82f6';
      case 'email': return '#8b5cf6';
      case 'app': return '#06b6d4';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-dark rounded-xl p-4 h-[320px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          Message Activity
        </h3>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-green-500"
        />
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => {
            const SentimentIcon = getSentimentIcon(msg.sentiment);
            const sentimentColor = getSentimentColor(msg.sentiment);

            return (
              <motion.div
                key={msg.id}
                initial={{ x: msg.type === 'sent' ? 20 : -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`p-2 rounded-lg ${
                  msg.type === 'sent' ? 'bg-blue-500/10 ml-4' : 'bg-dark-700 mr-4'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    msg.type === 'sent' ? 'bg-blue-500/20' : 'bg-gray-700'
                  }`}>
                    {msg.type === 'sent' ? (
                      msg.isAI ? <Bot className="w-3 h-3 text-blue-400" /> : <Send className="w-3 h-3 text-blue-400" />
                    ) : (
                      <User className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">{msg.recipient}</span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded uppercase"
                          style={{ backgroundColor: `${getChannelColor(msg.channel)}20`, color: getChannelColor(msg.channel) }}
                        >
                          {msg.channel}
                        </span>
                        {msg.isAI && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
                            AI
                          </span>
                        )}
                      </div>
                      <SentimentIcon className="w-3 h-3" style={{ color: sentimentColor }} />
                    </div>
                    <p className="text-[11px] text-gray-300 leading-tight">
                      {msg.content}
                    </p>
                    <span className="text-[9px] text-gray-600 mt-1 block">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
