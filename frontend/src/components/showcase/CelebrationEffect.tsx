'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShowcaseStore } from '@/stores/showcaseStore';
import { CheckCircle, Package, Sparkles, Trophy } from 'lucide-react';

// Confetti burst component
function ConfettiBurst({ x, y }: { x: number; y: number }) {
  const particles = Array.from({ length: 30 });
  const colors = ['#ff0', '#0ff', '#f0f', '#0f0', '#f80', '#08f'];

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]" style={{ perspective: 500 }}>
      {particles.map((_, i) => {
        const angle = (i / particles.length) * Math.PI * 2;
        const velocity = 100 + Math.random() * 150;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity;

        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2"
            style={{
              left: x,
              top: y,
              backgroundColor: colors[i % colors.length],
              borderRadius: Math.random() > 0.5 ? '50%' : '0',
            }}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: dx,
              y: dy + 200,
              scale: 0,
              opacity: 0,
              rotate: Math.random() * 720,
            }}
            transition={{
              duration: 1 + Math.random() * 0.5,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}

// Ripple effect
function RippleEffect({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <motion.div
      className="fixed pointer-events-none z-[9998]"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 0.8 }}
      animate={{ scale: 3, opacity: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
    >
      <div
        className="w-32 h-32 -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
        style={{ borderColor: color }}
      />
    </motion.div>
  );
}

// Main celebration overlay
function CelebrationOverlay({
  message,
  subMessage,
  onComplete,
}: {
  message: string;
  subMessage?: string;
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background pulse */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-cyan-500/10 to-green-500/10"
        animate={{
          opacity: [0, 0.3, 0],
        }}
        transition={{ duration: 1, repeat: 2 }}
      />

      {/* Center content */}
      <motion.div
        className="relative flex flex-col items-center"
        initial={{ scale: 0.5, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      >
        {/* Animated checkmark */}
        <motion.div
          className="relative mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
        >
          <motion.div
            className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(34, 197, 94, 0.4)',
                '0 0 0 20px rgba(34, 197, 94, 0)',
              ],
            }}
            transition={{ duration: 1, repeat: 2 }}
          >
            <CheckCircle className="w-12 h-12 text-green-400" />
          </motion.div>

          {/* Sparkles */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i * Math.PI) / 2) * 60,
                y: Math.sin((i * Math.PI) / 2) * 60,
              }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.6 }}
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          ))}
        </motion.div>

        {/* Text */}
        <motion.h2
          className="text-3xl font-bold text-white mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ textShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}
        >
          {message}
        </motion.h2>

        {subMessage && (
          <motion.p
            className="text-lg text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {subMessage}
          </motion.p>
        )}

        {/* Points animation */}
        <motion.div
          className="mt-4 flex items-center gap-2 text-yellow-400"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
        >
          <Trophy className="w-5 h-5" />
          <motion.span
            className="text-xl font-bold"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ delay: 1, duration: 0.3 }}
          >
            +100 pts
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Corner confetti */}
      <ConfettiBurst x={window.innerWidth / 2} y={window.innerHeight / 2 - 50} />
    </motion.div>
  );
}

export default function CelebrationEffect() {
  const { showCelebration, celebrationMessage, hideCelebration } = useShowcaseStore();
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Clean up old ripples
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  return (
    <>
      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <RippleEffect key={ripple.id} x={ripple.x} y={ripple.y} color="#00ff88" />
        ))}
      </AnimatePresence>

      {/* Main celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationOverlay
            message={celebrationMessage || 'Delivery Complete!'}
            subMessage="Package delivered successfully"
            onComplete={hideCelebration}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Export a function to trigger celebrations from anywhere
export function useCelebration() {
  const { triggerCelebration } = useShowcaseStore();
  return triggerCelebration;
}
