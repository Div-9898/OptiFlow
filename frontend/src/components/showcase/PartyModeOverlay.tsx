'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShowcaseStore } from '@/stores/showcaseStore';
import { useKonamiCode } from '@/hooks/useKonamiCode';
import { Music, Sparkles, X } from 'lucide-react';

// Confetti particle component
function Confetti({ count = 100 }: { count?: number }) {
  const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#8800ff', '#ff00ff'];

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            backgroundColor: colors[i % colors.length],
            left: `${Math.random() * 100}%`,
            top: -20,
          }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight + 50,
            rotate: Math.random() * 720 - 360,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            delay: Math.random() * 3,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

// Disco ball component
function DiscoBall() {
  return (
    <motion.div
      className="fixed top-10 left-1/2 -translate-x-1/2 z-[9998]"
      initial={{ y: -100, scale: 0 }}
      animate={{ y: 0, scale: 1 }}
      exit={{ y: -100, scale: 0 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <motion.div
        className="relative w-20 h-20 rounded-full"
        animate={{ rotateY: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        style={{
          background: 'radial-gradient(circle at 30% 30%, #ffffff, #888888)',
          boxShadow: '0 0 60px rgba(255,255,255,0.5)',
        }}
      >
        {/* Mirror tiles effect */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/80 rounded-sm"
            style={{
              left: `${(i % 5) * 20 + 10}%`,
              top: `${Math.floor(i / 5) * 25 + 10}%`,
            }}
            animate={{
              opacity: [0.5, 1, 0.5],
              boxShadow: [
                '0 0 5px #fff',
                '0 0 20px #fff',
                '0 0 5px #fff',
              ],
            }}
            transition={{
              duration: 0.5,
              delay: i * 0.1,
              repeat: Infinity,
            }}
          />
        ))}
      </motion.div>
      {/* String */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-10 bg-gray-400 -translate-y-full" />
    </motion.div>
  );
}

// Rainbow border effect
function RainbowBorder() {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-[9997]"
      style={{
        border: '4px solid transparent',
        borderRadius: '0',
      }}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            'linear-gradient(0deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff) padding-box, linear-gradient(0deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff) border-box',
            'linear-gradient(360deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff) padding-box, linear-gradient(360deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #8800ff) border-box',
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        style={{
          border: '4px solid transparent',
          background: 'transparent',
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />
    </motion.div>
  );
}

// Party mode activation toast
function PartyActivatedToast({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 100, opacity: 0, scale: 0.8 }}
      className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] px-8 py-4 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #ff00ff, #00ffff)',
        boxShadow: '0 0 40px rgba(255, 0, 255, 0.5)',
      }}
    >
      <div className="flex items-center gap-4">
        <motion.span
          className="text-4xl"
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          🎉
        </motion.span>
        <div>
          <h3 className="text-xl font-bold text-white">PARTY MODE ACTIVATED!</h3>
          <p className="text-white/80 text-sm">You found the secret! Press ESC to exit.</p>
        </div>
        <motion.span
          className="text-4xl"
          animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
        >
          🕺
        </motion.span>
      </div>
    </motion.div>
  );
}

export default function PartyModeOverlay() {
  const { isPartyMode, togglePartyMode } = useShowcaseStore();
  const [showToast, setShowToast] = useState(false);

  // Activate party mode with Konami code
  const activateParty = useCallback(() => {
    if (!isPartyMode) {
      togglePartyMode();
      setShowToast(true);
    }
  }, [isPartyMode, togglePartyMode]);

  const { progress, showHint } = useKonamiCode(activateParty);

  // ESC to exit party mode
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPartyMode) {
        togglePartyMode();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isPartyMode, togglePartyMode]);

  // Inject party mode CSS
  useEffect(() => {
    if (isPartyMode) {
      const style = document.createElement('style');
      style.id = 'party-mode-styles';
      style.textContent = `
        .route-line, [class*="route"] path {
          animation: rainbow-stroke 1s linear infinite !important;
        }

        .vehicle-marker, [class*="marker"] {
          animation: disco-bounce 0.5s ease-in-out infinite !important;
        }

        @keyframes rainbow-stroke {
          0% { stroke: #ff0000; }
          16% { stroke: #ff8800; }
          33% { stroke: #ffff00; }
          50% { stroke: #00ff00; }
          66% { stroke: #0088ff; }
          83% { stroke: #8800ff; }
          100% { stroke: #ff0000; }
        }

        @keyframes disco-bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(10deg); }
        }

        body {
          animation: party-bg 3s linear infinite;
        }

        @keyframes party-bg {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
      `;
      document.head.appendChild(style);

      return () => {
        const existingStyle = document.getElementById('party-mode-styles');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [isPartyMode]);

  return (
    <>
      {/* Konami code progress hint */}
      <AnimatePresence>
        {showHint && !isPartyMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-purple-900/90 rounded-full text-purple-300 text-sm font-mono"
          >
            <Sparkles className="inline-block w-4 h-4 mr-2" />
            Keep going... {Math.round(progress * 100)}%
          </motion.div>
        )}
      </AnimatePresence>

      {/* Party mode overlays */}
      <AnimatePresence>
        {isPartyMode && (
          <>
            <Confetti count={150} />
            <DiscoBall />
            <RainbowBorder />

            {/* Exit button */}
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              onClick={togglePartyMode}
              className="fixed top-4 right-4 z-[10000] p-3 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-6 h-6" />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Activation toast */}
      <AnimatePresence>
        {showToast && (
          <PartyActivatedToast onClose={() => setShowToast(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
