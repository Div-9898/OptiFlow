'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShowcaseStore } from '@/stores/showcaseStore';
import { X, ArrowRight, Zap } from 'lucide-react';

interface TechComponent {
  id: string;
  name: string;
  icon: string;
  tech: string;
  color: string;
  x: number;
  y: number;
  description: string;
}

interface Connection {
  from: string;
  to: string;
  label: string;
  animated?: boolean;
}

// Component positions are centers within the 860x320 diagram area
const COMPONENTS: TechComponent[] = [
  {
    id: 'simulation',
    name: 'Simulation Engine',
    icon: '🚚',
    tech: 'Python 3.11',
    color: '#ff8800',
    x: 100,
    y: 100,
    description: 'Generates 25 vehicles with realistic movement patterns across Dubai',
  },
  {
    id: 'redis',
    name: 'Redis Cache',
    icon: '⚡',
    tech: 'Redis 7',
    color: '#dc382d',
    x: 280,
    y: 100,
    description: 'Pub/Sub messaging & real-time data caching at 500ms intervals',
  },
  {
    id: 'backend',
    name: 'Backend API',
    icon: '🔌',
    tech: 'FastAPI + Socket.IO',
    color: '#00ff88',
    x: 460,
    y: 100,
    description: 'Async WebSocket streaming with REST endpoints for optimization',
  },
  {
    id: 'frontend',
    name: 'Frontend',
    icon: '🖥️',
    tech: 'Next.js 14 + Mapbox',
    color: '#00d4ff',
    x: 700,
    y: 100,
    description: 'Real-time map visualization with Framer Motion animations',
  },
  {
    id: 'vrp',
    name: 'VRP Solver',
    icon: '🧠',
    tech: 'OR-Tools + ML',
    color: '#a855f7',
    x: 280,
    y: 240,
    description: 'Multi-algorithm optimization: OR-Tools, Genetic, Simulated Annealing',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    icon: '🗄️',
    tech: 'PostgreSQL 16',
    color: '#336791',
    x: 460,
    y: 240,
    description: 'Persistent storage for vehicles, deliveries, and historical data',
  },
  {
    id: 'neo4j',
    name: 'Neo4j Graph',
    icon: '🕸️',
    tech: 'Neo4j 5.18',
    color: '#008cc1',
    x: 640,
    y: 240,
    description: 'Stakeholder relationships and influence network analysis',
  },
];

const CONNECTIONS: Connection[] = [
  { from: 'simulation', to: 'redis', label: 'Position updates', animated: true },
  { from: 'redis', to: 'backend', label: 'Pub/Sub', animated: true },
  { from: 'backend', to: 'frontend', label: 'WebSocket', animated: true },
  { from: 'vrp', to: 'backend', label: 'Optimized routes' },
  { from: 'backend', to: 'vrp', label: 'Route requests' },
  { from: 'backend', to: 'postgres', label: 'CRUD ops' },
  { from: 'backend', to: 'neo4j', label: 'Graph queries' },
];

const TECH_BADGES = [
  { name: 'Next.js 14', icon: '▲', color: '#000000' },
  { name: 'FastAPI', icon: '⚡', color: '#009688' },
  { name: 'Redis', icon: '🔴', color: '#DC382D' },
  { name: 'Mapbox GL', icon: '🗺️', color: '#4264FB' },
  { name: 'Docker', icon: '🐳', color: '#2496ED' },
  { name: 'Python', icon: '🐍', color: '#3776AB' },
  { name: 'TypeScript', icon: '💠', color: '#3178C6' },
  { name: 'Socket.IO', icon: '🔌', color: '#010101' },
  { name: 'OR-Tools', icon: '🧮', color: '#4285F4' },
  { name: 'Zustand', icon: '🐻', color: '#443E38' },
  { name: 'Framer', icon: '✨', color: '#0055FF' },
  { name: 'Tailwind', icon: '🎨', color: '#38B2AC' },
];

export default function TechStackShowcase() {
  const { showTechStack, toggleTechStack } = useShowcaseStore();
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [activeDataFlow, setActiveDataFlow] = useState(true);

  if (!showTechStack) return null;

  const getComponentPosition = (id: string) => {
    const comp = COMPONENTS.find((c) => c.id === id);
    return comp ? { x: comp.x, y: comp.y } : { x: 0, y: 0 };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={toggleTechStack}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-[860px] h-[580px] rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(10,10,30,0.98) 0%, rgba(20,10,40,0.98) 100%)',
          border: '1px solid rgba(100, 100, 255, 0.3)',
          boxShadow: '0 0 80px rgba(100, 100, 255, 0.15), inset 0 0 100px rgba(100,100,255,0.05)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏗️</span>
            <div>
              <h2 className="text-xl font-bold text-white">System Architecture</h2>
              <p className="text-xs text-gray-500">Real-time Fleet Optimization Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveDataFlow(!activeDataFlow)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeDataFlow
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-gray-700/50 text-gray-400'
              }`}
            >
              <Zap className="w-3 h-3" />
              Data Flow {activeDataFlow ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={toggleTechStack}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="relative h-[320px] mx-6">
          {/* SVG Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#6666cc" />
              </marker>

              <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00ffff" stopOpacity="0" />
                <stop offset="50%" stopColor="#00ffff" stopOpacity="1" />
                <stop offset="100%" stopColor="#00ffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {CONNECTIONS.map((conn, i) => {
              const from = getComponentPosition(conn.from);
              const to = getComponentPosition(conn.to);

              // Calculate connection points based on relative positions
              const cardWidth = 120;
              const cardHeight = 80;

              // Determine if connection is primarily horizontal or vertical
              const dx = to.x - from.x;
              const dy = to.y - from.y;
              const isHorizontal = Math.abs(dx) > Math.abs(dy);

              let startX, startY, endX, endY;

              if (isHorizontal) {
                // Horizontal connection: exit from right/left edges
                if (dx > 0) {
                  startX = from.x + cardWidth / 2;
                  endX = to.x - cardWidth / 2;
                } else {
                  startX = from.x - cardWidth / 2;
                  endX = to.x + cardWidth / 2;
                }
                startY = from.y;
                endY = to.y;
              } else {
                // Vertical connection: exit from top/bottom edges
                startX = from.x;
                endX = to.x;
                if (dy > 0) {
                  startY = from.y + cardHeight / 2;
                  endY = to.y - cardHeight / 2;
                } else {
                  startY = from.y - cardHeight / 2;
                  endY = to.y + cardHeight / 2;
                }
              }

              // Midpoint for curve
              const midX = (startX + endX) / 2;
              const midY = (startY + endY) / 2;
              const curvature = isHorizontal ? 20 : 15;
              const curveOffset = isHorizontal ? curvature : 0;

              const pathD = `M ${startX} ${startY} Q ${midX} ${midY + curveOffset} ${endX} ${endY}`;

              return (
                <g key={i}>
                  {/* Base line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#4444aa"
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    markerEnd="url(#arrowhead)"
                  />

                  {/* Animated data flow */}
                  {activeDataFlow && conn.animated && (
                    <circle r="4" fill="#00ffff">
                      <animateMotion
                        dur="2s"
                        repeatCount="indefinite"
                        path={pathD}
                      />
                    </circle>
                  )}

                  {/* Label */}
                  <text
                    x={midX}
                    y={midY + curveOffset - 8}
                    textAnchor="middle"
                    className="text-[9px] fill-gray-500"
                    style={{ fontSize: '9px' }}
                  >
                    {conn.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Component Cards */}
          {COMPONENTS.map((comp) => (
            <motion.div
              key={comp.id}
              className="absolute cursor-pointer"
              style={{ left: comp.x - 60, top: comp.y - 40 }}
              onMouseEnter={() => setHoveredComponent(comp.id)}
              onMouseLeave={() => setHoveredComponent(null)}
              whileHover={{ scale: 1.05, zIndex: 10 }}
            >
              <motion.div
                className="w-[120px] h-[80px] p-2 rounded-xl text-center transition-all flex flex-col items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${comp.color}20 0%, ${comp.color}05 100%)`,
                  border: `1px solid ${comp.color}50`,
                  boxShadow:
                    hoveredComponent === comp.id
                      ? `0 0 25px ${comp.color}40, inset 0 0 20px ${comp.color}10`
                      : `0 4px 12px rgba(0,0,0,0.3)`,
                }}
              >
                <span className="text-xl">{comp.icon}</span>
                <div className="mt-1 text-[11px] font-semibold text-white leading-tight">{comp.name}</div>
                <div className="text-[9px] text-gray-400 mt-0.5">{comp.tech}</div>
              </motion.div>

              {/* Tooltip */}
              <AnimatePresence>
                {hoveredComponent === comp.id && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 rounded-lg bg-gray-900 border border-gray-700 text-[10px] text-gray-300 z-20"
                  >
                    {comp.description}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Tech Badges */}
        <div className="px-6 py-3 border-t border-purple-900/30 bg-black/20">
          <div className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">
            Technologies Used
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TECH_BADGES.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.08, boxShadow: `0 0 12px ${tech.color}40` }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  background: `${tech.color}15`,
                  border: `1px solid ${tech.color}30`,
                  color: tech.color === '#000000' ? '#fff' : tech.color,
                }}
              >
                <span className="text-xs">{tech.icon}</span>
                <span>{tech.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Footer */}
        <div className="px-6 py-2 bg-black/40 border-t border-purple-900/30">
          <div className="flex justify-between text-[10px] text-gray-500">
            <span>🚚 25 vehicles streaming at 500ms</span>
            <span>⚡ 6 microservices</span>
            <span>🗄️ 3 databases</span>
            <span>🔌 Real-time WebSocket updates</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
