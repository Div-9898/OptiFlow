'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Network, Users, Zap, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stakeholder {
  id: string;
  name: string;
  type: string;
  power: number;
  interest: number;
  x?: number;
  y?: number;
}

interface Link {
  source: string;
  target: string;
  type: string;
  strength: number;
}

export default function StakeholdersPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedStakeholder, setSelectedStakeholder] = useState<string | null>(null);
  const [hoveredStakeholder, setHoveredStakeholder] = useState<string | null>(null);

  const stakeholders: Stakeholder[] = [
    { id: 'company', name: 'Logistics Company', type: 'company', power: 0.9, interest: 0.95 },
    { id: 'drivers', name: 'Delivery Drivers', type: 'drivers', power: 0.6, interest: 0.9 },
    { id: 'customers', name: 'Customers', type: 'customers', power: 0.7, interest: 0.85 },
    { id: 'regulators', name: 'Regulators', type: 'regulators', power: 0.85, interest: 0.6 },
    { id: 'community', name: 'Community', type: 'community', power: 0.4, interest: 0.5 },
    { id: 'shareholders', name: 'Shareholders', type: 'shareholders', power: 0.8, interest: 0.9 },
  ];

  const links: Link[] = [
    { source: 'company', target: 'drivers', type: 'employs', strength: 0.9 },
    { source: 'company', target: 'customers', type: 'serves', strength: 0.85 },
    { source: 'regulators', target: 'company', type: 'regulates', strength: 0.8 },
    { source: 'shareholders', target: 'company', type: 'invests_in', strength: 0.85 },
    { source: 'drivers', target: 'customers', type: 'delivers_to', strength: 0.9 },
    { source: 'company', target: 'community', type: 'impacts', strength: 0.6 },
  ];

  const typeColors: Record<string, string> = {
    company: '#00f5ff',
    drivers: '#39ff14',
    customers: '#a855f7',
    regulators: '#ef4444',
    community: '#f59e0b',
    shareholders: '#3b82f6',
  };

  // Calculate positions in a circle
  const positions = stakeholders.map((s, i) => {
    const angle = (i / stakeholders.length) * Math.PI * 2 - Math.PI / 2;
    const radius = 150;
    return {
      ...s,
      x: 200 + Math.cos(angle) * radius,
      y: 200 + Math.sin(angle) * radius,
    };
  });

  const getStakeholderById = (id: string) => positions.find(s => s.id === id);

  const quadrants = {
    manage_closely: stakeholders.filter(s => s.power >= 0.6 && s.interest >= 0.6),
    keep_satisfied: stakeholders.filter(s => s.power >= 0.6 && s.interest < 0.6),
    keep_informed: stakeholders.filter(s => s.power < 0.6 && s.interest >= 0.6),
    monitor: stakeholders.filter(s => s.power < 0.6 && s.interest < 0.6),
  };

  return (
    <div className="min-h-screen bg-dark-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Stakeholder <span className="text-accent-cyan">Network</span>
        </h1>
        <p className="text-gray-400">
          Force-directed graph visualization of stakeholder relationships
        </p>
      </motion.div>

      <div className="grid grid-cols-12 gap-6">
        {/* Network Graph */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-7 glass-dark rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Network className="w-5 h-5 text-accent-cyan" />
            Relationship Map
          </h3>
          
          <div className="relative w-full h-[400px]">
            <svg className="w-full h-full">
              {/* Links */}
              {links.map((link, i) => {
                const source = getStakeholderById(link.source);
                const target = getStakeholderById(link.target);
                if (!source || !target) return null;
                
                return (
                  <motion.line
                    key={i}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke="rgba(0, 245, 255, 0.3)"
                    strokeWidth={link.strength * 3}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                  />
                );
              })}
              
              {/* Nodes */}
              {positions.map((stakeholder, i) => (
                <motion.g
                  key={stakeholder.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedStakeholder(stakeholder.id)}
                  onMouseEnter={() => setHoveredStakeholder(stakeholder.id)}
                  onMouseLeave={() => setHoveredStakeholder(null)}
                >
                  <circle
                    cx={stakeholder.x}
                    cy={stakeholder.y}
                    r={20 + stakeholder.power * 15}
                    fill={typeColors[stakeholder.type]}
                    opacity={
                      hoveredStakeholder
                        ? hoveredStakeholder === stakeholder.id
                          ? 1
                          : 0.3
                        : 0.8
                    }
                    className="transition-opacity duration-200"
                  />
                  <circle
                    cx={stakeholder.x}
                    cy={stakeholder.y}
                    r={20 + stakeholder.power * 15 + 5}
                    fill="none"
                    stroke={typeColors[stakeholder.type]}
                    strokeWidth="2"
                    opacity={selectedStakeholder === stakeholder.id ? 1 : 0}
                    className="transition-opacity duration-200"
                  />
                  <text
                    x={stakeholder.x}
                    y={(stakeholder.y || 0) + 45}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="500"
                  >
                    {stakeholder.name}
                  </text>
                </motion.g>
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-400 capitalize">{type}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Panel */}
        <div className="col-span-5 space-y-6">
          {/* Power-Interest Matrix */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-dark rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-purple" />
              Power-Interest Matrix
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/30">
                <p className="text-xs text-red-400 font-medium mb-2">Manage Closely</p>
                <div className="space-y-1">
                  {quadrants.manage_closely.map(s => (
                    <p key={s.id} className="text-xs text-white">{s.name}</p>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/30">
                <p className="text-xs text-yellow-400 font-medium mb-2">Keep Satisfied</p>
                <div className="space-y-1">
                  {quadrants.keep_satisfied.map(s => (
                    <p key={s.id} className="text-xs text-white">{s.name}</p>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/30">
                <p className="text-xs text-blue-400 font-medium mb-2">Keep Informed</p>
                <div className="space-y-1">
                  {quadrants.keep_informed.map(s => (
                    <p key={s.id} className="text-xs text-white">{s.name}</p>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-gray-500/10 rounded-xl border border-gray-500/30">
                <p className="text-xs text-gray-400 font-medium mb-2">Monitor</p>
                <div className="space-y-1">
                  {quadrants.monitor.map(s => (
                    <p key={s.id} className="text-xs text-white">{s.name}</p>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Selected Stakeholder Details */}
          {selectedStakeholder && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-dark rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {getStakeholderById(selectedStakeholder)?.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Power</span>
                    <span className="text-white">
                      {((getStakeholderById(selectedStakeholder)?.power || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent-cyan rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(getStakeholderById(selectedStakeholder)?.power || 0) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Interest</span>
                    <span className="text-white">
                      {((getStakeholderById(selectedStakeholder)?.interest || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent-purple rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(getStakeholderById(selectedStakeholder)?.interest || 0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-dark-600">
                <p className="text-sm text-gray-400">Relationships:</p>
                <div className="mt-2 space-y-1">
                  {links
                    .filter(l => l.source === selectedStakeholder || l.target === selectedStakeholder)
                    .map((link, i) => (
                      <p key={i} className="text-xs text-white">
                        <span className="text-accent-cyan">{link.type}</span>
                        {' → '}
                        {link.source === selectedStakeholder
                          ? getStakeholderById(link.target)?.name
                          : getStakeholderById(link.source)?.name}
                      </p>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
