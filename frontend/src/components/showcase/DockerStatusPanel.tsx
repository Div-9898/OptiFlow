'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShowcaseStore } from '@/stores/showcaseStore';
import { X, Activity, HardDrive, Cpu, MemoryStick } from 'lucide-react';

interface ContainerStatus {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'starting' | 'stopped';
  cpuPercent: number;
  memoryPercent: number;
  memoryUsage: string;
  uptime: string;
  ports?: string;
}

const CONTAINER_ICONS: Record<string, string> = {
  'fleet-frontend': '🖥️',
  'fleet-backend': '🔌',
  'fleet-simulation': '🚚',
  'fleet-redis': '⚡',
  'fleet-postgres': '🗄️',
  'fleet-neo4j': '🕸️',
};

const CONTAINER_COLORS: Record<string, string> = {
  'fleet-frontend': '#00d4ff',
  'fleet-backend': '#00ff88',
  'fleet-simulation': '#ff8800',
  'fleet-redis': '#dc382d',
  'fleet-postgres': '#336791',
  'fleet-neo4j': '#008cc1',
};

// Simulated container data (in a real scenario, this would come from an API)
const MOCK_CONTAINERS: ContainerStatus[] = [
  {
    id: 'c1',
    name: 'fleet-frontend',
    image: 'node:20-alpine',
    status: 'running',
    cpuPercent: 12,
    memoryPercent: 28,
    memoryUsage: '256MB',
    uptime: '2h 34m',
    ports: '3000:3000',
  },
  {
    id: 'c2',
    name: 'fleet-backend',
    image: 'python:3.11-slim',
    status: 'running',
    cpuPercent: 35,
    memoryPercent: 42,
    memoryUsage: '512MB',
    uptime: '2h 34m',
    ports: '8000:8000',
  },
  {
    id: 'c3',
    name: 'fleet-simulation',
    image: 'python:3.11-slim',
    status: 'running',
    cpuPercent: 45,
    memoryPercent: 38,
    memoryUsage: '384MB',
    uptime: '2h 34m',
  },
  {
    id: 'c4',
    name: 'fleet-redis',
    image: 'redis:7-alpine',
    status: 'running',
    cpuPercent: 8,
    memoryPercent: 15,
    memoryUsage: '64MB',
    uptime: '2h 35m',
    ports: '6379:6379',
  },
  {
    id: 'c5',
    name: 'fleet-postgres',
    image: 'postgres:16-alpine',
    status: 'running',
    cpuPercent: 5,
    memoryPercent: 22,
    memoryUsage: '128MB',
    uptime: '2h 35m',
    ports: '5432:5432',
  },
  {
    id: 'c6',
    name: 'fleet-neo4j',
    image: 'neo4j:5.18-community',
    status: 'running',
    cpuPercent: 18,
    memoryPercent: 35,
    memoryUsage: '512MB',
    uptime: '2h 35m',
    ports: '7474:7474',
  },
];

function MeterBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="flex-1">
      <div className="flex justify-between text-[9px] text-gray-500 mb-1">
        <span>{label}</span>
        <span style={{ color }}>{value.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export default function DockerStatusPanel() {
  const { showDockerStatus, toggleDockerStatus } = useShowcaseStore();
  const [containers, setContainers] = useState<ContainerStatus[]>(MOCK_CONTAINERS);

  // Simulate live metrics updates
  useEffect(() => {
    if (!showDockerStatus) return;

    const interval = setInterval(() => {
      setContainers((prev) =>
        prev.map((c) => ({
          ...c,
          cpuPercent: Math.max(0, Math.min(100, c.cpuPercent + (Math.random() - 0.5) * 10)),
          memoryPercent: Math.max(0, Math.min(100, c.memoryPercent + (Math.random() - 0.5) * 5)),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [showDockerStatus]);

  if (!showDockerStatus) return null;

  const totalCpu = containers.reduce((acc, c) => acc + c.cpuPercent, 0) / containers.length;
  const totalMem = containers.reduce((acc, c) => acc + c.memoryPercent, 0) / containers.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed bottom-4 left-4 w-[420px] z-50 rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(20,20,30,0.95) 0%, rgba(10,10,20,0.98) 100%)',
        border: '1px solid rgba(0, 150, 255, 0.2)',
        boxShadow: '0 0 30px rgba(0, 150, 255, 0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-900/30 bg-gradient-to-r from-blue-900/20 to-transparent">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-2xl">🐳</span>
            <motion.div
              className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div>
            <span className="text-blue-300 font-semibold text-sm">Docker Compose</span>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-green-500" />
                {containers.length} containers
              </span>
              <span>•</span>
              <span className="text-green-400">All healthy</span>
            </div>
          </div>
        </div>

        <button
          onClick={toggleDockerStatus}
          className="text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Overall Stats */}
      <div className="px-4 py-2 bg-black/20 border-b border-gray-800/50 flex gap-6">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <div className="text-xs">
            <span className="text-gray-400">CPU</span>
            <span className="ml-2 text-cyan-400 font-mono">{totalCpu.toFixed(0)}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MemoryStick className="w-4 h-4 text-purple-400" />
          <div className="text-xs">
            <span className="text-gray-400">Memory</span>
            <span className="ml-2 text-purple-400 font-mono">{totalMem.toFixed(0)}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-orange-400" />
          <div className="text-xs">
            <span className="text-gray-400">Disk I/O</span>
            <span className="ml-2 text-orange-400 font-mono">12MB/s</span>
          </div>
        </div>
      </div>

      {/* Container List */}
      <div className="max-h-[300px] overflow-y-auto p-2 space-y-2">
        <AnimatePresence>
          {containers.map((container, index) => (
            <motion.div
              key={container.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-lg bg-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{CONTAINER_ICONS[container.name] || '📦'}</span>
                  <div>
                    <div
                      className="font-semibold text-sm"
                      style={{ color: CONTAINER_COLORS[container.name] || '#fff' }}
                    >
                      {container.name}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">{container.image}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {container.ports && (
                    <span className="text-[9px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded font-mono">
                      {container.ports}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <motion.div
                      className="w-2 h-2 rounded-full bg-green-500"
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-[10px] text-green-400 uppercase">{container.status}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <MeterBar
                  value={container.cpuPercent}
                  color={CONTAINER_COLORS[container.name] || '#00ffff'}
                  label="CPU"
                />
                <MeterBar value={container.memoryPercent} color="#a855f7" label="MEM" />
              </div>

              <div className="mt-2 flex justify-between text-[9px] text-gray-600">
                <span>Uptime: {container.uptime}</span>
                <span>{container.memoryUsage}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-800/50 bg-black/30">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>docker-compose.yml</span>
          <span className="font-mono">v2.24.5</span>
        </div>
      </div>
    </motion.div>
  );
}
