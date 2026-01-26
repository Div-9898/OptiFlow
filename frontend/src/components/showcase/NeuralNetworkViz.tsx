'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShowcaseStore } from '@/stores/showcaseStore';
import { Brain, TrendingDown, X } from 'lucide-react';

interface Node {
  x: number;
  y: number;
  layer: number;
  index: number;
  activation: number;
}

interface Connection {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  weight: number;
  signalProgress: number;
}

const LAYER_SIZES = [6, 12, 16, 12, 6, 3];
const COLORS = {
  nodeInactive: '#1a1a2e',
  nodeActive: '#00ffff',
  signal: '#ff00ff',
};

export default function NeuralNetworkViz() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const isInitializedRef = useRef(false);

  const { showNeuralNetwork, toggleNeuralNetwork } = useShowcaseStore();

  const [currentCost, setCurrentCost] = useState(1850);
  const [bestCost, setBestCost] = useState(1850);
  const [iteration, setIteration] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Initialize network structure once
  useEffect(() => {
    if (isInitializedRef.current) return;

    const width = 500;
    const height = 220;
    const padding = 40;

    const nodes: Node[] = [];
    const layerWidth = (width - padding * 2) / (LAYER_SIZES.length - 1);

    LAYER_SIZES.forEach((size, layerIndex) => {
      const layerHeight = height - padding * 2;
      const nodeSpacing = layerHeight / (size + 1);

      for (let i = 0; i < size; i++) {
        nodes.push({
          x: padding + layerIndex * layerWidth,
          y: padding + (i + 1) * nodeSpacing,
          layer: layerIndex,
          index: i,
          activation: 0,
        });
      }
    });

    // Create connections between adjacent layers (sparse for performance)
    const connections: Connection[] = [];
    for (let l = 0; l < LAYER_SIZES.length - 1; l++) {
      const currentLayerNodes = nodes.filter((n) => n.layer === l);
      const nextLayerNodes = nodes.filter((n) => n.layer === l + 1);

      currentLayerNodes.forEach((fromNode) => {
        // Connect to subset of next layer for performance
        const connectionCount = Math.min(3, nextLayerNodes.length);
        const step = Math.max(1, Math.floor(nextLayerNodes.length / connectionCount));

        for (let i = 0; i < connectionCount; i++) {
          const toIdx = Math.min(i * step, nextLayerNodes.length - 1);
          const toNode = nextLayerNodes[toIdx];
          connections.push({
            fromX: fromNode.x,
            fromY: fromNode.y,
            toX: toNode.x,
            toY: toNode.y,
            weight: Math.random(),
            signalProgress: -1,
          });
        }
      });
    }

    nodesRef.current = nodes;
    connectionsRef.current = connections;
    isInitializedRef.current = true;
  }, []);

  // Animation and rendering
  useEffect(() => {
    if (!showNeuralNetwork) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastUpdate = 0;
    const updateInterval = 100; // Update state every 100ms

    const render = (timestamp: number) => {
      // Update simulation at fixed interval
      if (isActive && timestamp - lastUpdate > updateInterval) {
        lastUpdate = timestamp;

        // Update iteration and costs
        setIteration((i) => i + 1);
        setCurrentCost((c) => {
          const newCost = c - Math.random() * 15;
          const clamped = Math.max(850, newCost);
          setBestCost((best) => Math.min(best, clamped));
          return clamped;
        });

        // Update node activations
        nodesRef.current = nodesRef.current.map((node) => ({
          ...node,
          activation: Math.random() > 0.7 ? Math.random() : node.activation * 0.85,
        }));

        // Update connection signals
        connectionsRef.current = connectionsRef.current.map((conn) => ({
          ...conn,
          signalProgress: Math.random() > 0.9
            ? 0
            : conn.signalProgress >= 0 && conn.signalProgress < 1.2
              ? conn.signalProgress + 0.15
              : -1,
        }));
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      connectionsRef.current.forEach((conn) => {
        ctx.beginPath();
        ctx.moveTo(conn.fromX, conn.fromY);
        ctx.lineTo(conn.toX, conn.toY);

        if (conn.signalProgress >= 0 && conn.signalProgress <= 1) {
          // Active signal
          const gradient = ctx.createLinearGradient(conn.fromX, conn.fromY, conn.toX, conn.toY);
          const pos = Math.max(0, Math.min(1, conn.signalProgress));
          const start = Math.max(0, pos - 0.15);
          const end = Math.min(1, pos + 0.15);

          gradient.addColorStop(0, 'rgba(51, 51, 102, 0.2)');
          gradient.addColorStop(start, 'rgba(51, 51, 102, 0.2)');
          gradient.addColorStop(pos, COLORS.signal);
          gradient.addColorStop(end, 'rgba(51, 51, 102, 0.2)');
          gradient.addColorStop(1, 'rgba(51, 51, 102, 0.2)');

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = `rgba(51, 51, 102, ${0.15 + conn.weight * 0.2})`;
          ctx.lineWidth = 0.5;
        }
        ctx.stroke();
      });

      // Draw nodes
      nodesRef.current.forEach((node) => {
        const glow = node.activation;

        // Glow
        if (glow > 0.3) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6 + glow * 4, 0, Math.PI * 2);
          const glowGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 10);
          glowGrad.addColorStop(0, `rgba(0, 255, 255, ${glow * 0.4})`);
          glowGrad.addColorStop(1, 'rgba(0, 255, 255, 0)');
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }

        // Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3 + glow * 2, 0, Math.PI * 2);
        ctx.fillStyle = glow > 0.5 ? COLORS.nodeActive : '#3a3a5e';
        ctx.fill();
        ctx.strokeStyle = glow > 0.5 ? COLORS.nodeActive : '#444466';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [showNeuralNetwork, isActive]);

  if (!showNeuralNetwork) return null;

  const savingsPercent = ((1850 - bestCost) / 1850) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-4 right-4 w-[520px] z-50 rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(10,10,30,0.95) 0%, rgba(20,10,40,0.95) 100%)',
        border: '1px solid rgba(138, 43, 226, 0.3)',
        boxShadow: '0 0 40px rgba(138, 43, 226, 0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-900/30">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isActive ? { rotate: 360 } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Brain className="w-5 h-5 text-purple-400" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-purple-300 font-semibold text-sm">VRP Neural Engine</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-700/50 text-gray-400'
                }`}
              >
                {isActive ? 'OPTIMIZING' : 'IDLE'}
              </span>
            </div>
            <span className="text-[10px] text-gray-500">Deep Reinforcement Learning</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsActive(!isActive);
              if (!isActive) {
                setIteration(0);
                setCurrentCost(1850);
                setBestCost(1850);
              }
            }}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              isActive
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                : 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30'
            }`}
          >
            {isActive ? 'Stop' : 'Start'}
          </button>
          <button
            onClick={toggleNeuralNetwork}
            className="text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={500}
          height={220}
          className="w-full"
          style={{ background: 'transparent' }}
        />
        <div className="absolute bottom-1 left-0 right-0 flex justify-between px-8 text-[8px] text-gray-600 font-mono">
          <span>INPUT</span>
          <span>HIDDEN</span>
          <span>HIDDEN</span>
          <span>HIDDEN</span>
          <span>HIDDEN</span>
          <span>OUTPUT</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3 p-3 border-t border-purple-900/30">
        <div className="text-center">
          <div className="text-[10px] text-gray-500 mb-1">Iteration</div>
          <div className="text-base font-bold text-cyan-400 font-mono">
            {iteration.toLocaleString()}
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-500 mb-1">Current Cost</div>
          <div className="text-base font-bold text-orange-400 font-mono">
            {currentCost.toFixed(0)} km
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-500 mb-1">Best Found</div>
          <div className="text-base font-bold text-green-400 font-mono">
            {bestCost.toFixed(0)} km
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-gray-500 mb-1">Savings</div>
          <div className="flex items-center justify-center gap-1">
            <TrendingDown className="w-3 h-3 text-green-400" />
            <span className="text-base font-bold text-green-400 font-mono">
              {savingsPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {isActive && (
        <div className="h-1 bg-dark-700 overflow-hidden">
          <motion.div
            className="h-full w-1/4 bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500"
            animate={{ x: ['0%', '400%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  );
}
