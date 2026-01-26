'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShowcaseStore } from '@/stores/showcaseStore';
import {
  Settings2,
  Activity,
  Box,
  ChevronUp,
  ChevronDown,
  Code,
} from 'lucide-react';

interface ToggleButtonProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  color: string;
  shortcut?: string;
}

function ToggleButton({ icon: Icon, label, isActive, onClick, color, shortcut }: ToggleButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm font-medium w-full ${
        isActive
          ? 'text-white'
          : 'text-gray-400 hover:text-gray-200'
      }`}
      style={{
        background: isActive ? `${color}20` : 'transparent',
        border: `1px solid ${isActive ? color : 'transparent'}`,
        boxShadow: isActive ? `0 0 10px ${color}30` : 'none',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon className="w-4 h-4" style={{ color: isActive ? color : undefined }} />
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-800 text-gray-500 font-mono">
          {shortcut}
        </span>
      )}
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: isActive ? color : '#444' }}
        animate={isActive ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.button>
  );
}

export default function ShowcaseControlPanel() {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    showDataStream,
    showDockerStatus,
    showTechStack,
    toggleDataStream,
    toggleDockerStatus,
    toggleTechStack,
  } = useShowcaseStore();

  const features = [
    {
      icon: Activity,
      label: 'Live Data Stream',
      isActive: showDataStream,
      onClick: toggleDataStream,
      color: '#00ff88',
      shortcut: 'D',
    },
    {
      icon: Box,
      label: 'Infrastructure',
      isActive: showDockerStatus,
      onClick: toggleDockerStatus,
      color: '#2496ed',
      shortcut: 'I',
    },
    {
      icon: Code,
      label: 'Architecture',
      isActive: showTechStack,
      onClick: toggleTechStack,
      color: '#a855f7',
      shortcut: 'A',
    },
  ];

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-4 bottom-24 z-50"
    >
      <div
        className="rounded-xl overflow-hidden w-48"
        style={{
          background: 'linear-gradient(180deg, rgba(15,15,25,0.95) 0%, rgba(10,10,20,0.98) 100%)',
          border: '1px solid rgba(100, 150, 255, 0.1)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2.5 border-b border-gray-800/50 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-white">Demo Panels</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          )}
        </button>

        {/* Feature Toggles */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-2 space-y-1"
            >
              {features.map((feature) => (
                <ToggleButton key={feature.label} {...feature} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
