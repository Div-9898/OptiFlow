'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShowcaseStore } from '@/stores/showcaseStore';
import { getSocket } from '@/lib/socket';
import { Activity, Zap, X, Wifi, WifiOff } from 'lucide-react';

interface StreamItem {
  id: string;
  type: 'vehicle' | 'sensor' | 'delivery' | 'alert' | 'optimization' | 'traffic' | 'metrics';
  payload: string;
  timestamp: string;
  channel: string;
}

const TYPE_COLORS: Record<string, string> = {
  vehicle: '#00ffff',
  sensor: '#ff00ff',
  delivery: '#ffff00',
  alert: '#ff4444',
  optimization: '#00ff88',
  traffic: '#ff8800',
  metrics: '#a855f7',
};

const TYPE_ICONS: Record<string, string> = {
  vehicle: '🚚',
  sensor: '📡',
  delivery: '📦',
  alert: '⚠️',
  optimization: '🧠',
  traffic: '🚗',
  metrics: '📊',
};

// Dubai locations for realistic data
const DUBAI_LOCATIONS = [
  { name: 'Jebel Ali Port', lat: 25.0185, lng: 55.0272 },
  { name: 'Downtown Dubai', lat: 25.1972, lng: 55.2744 },
  { name: 'Dubai Marina', lat: 25.0805, lng: 55.1403 },
  { name: 'Business Bay', lat: 25.1860, lng: 55.2674 },
  { name: 'Internet City', lat: 25.0953, lng: 55.1530 },
  { name: 'Dubai Mall', lat: 25.1985, lng: 55.2796 },
];

const VEHICLE_IDS = ['VH-1001', 'VH-1002', 'VH-1003', 'VH-1004', 'VH-1005', 'VH-1006'];

export default function DataStreamVisualizer() {
  const { showDataStream, toggleDataStream } = useShowcaseStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dataStream, setDataStream] = useState<StreamItem[]>([]);
  const [throughput, setThroughput] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const messageCountRef = useRef(0);
  const lastCountRef = useRef(0);
  const vehiclePositionsRef = useRef<Map<string, { lat: number; lng: number; heading: number }>>(new Map());

  // Initialize vehicle positions
  useEffect(() => {
    VEHICLE_IDS.forEach((id, idx) => {
      const loc = DUBAI_LOCATIONS[idx % DUBAI_LOCATIONS.length];
      vehiclePositionsRef.current.set(id, {
        lat: loc.lat + (Math.random() - 0.5) * 0.05,
        lng: loc.lng + (Math.random() - 0.5) * 0.05,
        heading: Math.random() * 360
      });
    });
  }, []);

  // Add item to stream
  const addStreamItem = useCallback((type: StreamItem['type'], channel: string, data: unknown) => {
    const newItem: StreamItem = {
      id: `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      channel,
      payload: JSON.stringify(data, null, 2),
      timestamp: new Date().toISOString(),
    };

    setDataStream((prev) => [...prev.slice(-100), newItem]);
    messageCountRef.current += 1;
  }, []);

  // Generate realistic vehicle position updates
  useEffect(() => {
    if (!showDataStream) return;

    const interval = setInterval(() => {
      // Pick a random vehicle
      const vehicleId = VEHICLE_IDS[Math.floor(Math.random() * VEHICLE_IDS.length)];
      const currentPos = vehiclePositionsRef.current.get(vehicleId);

      if (currentPos) {
        // Simulate movement along roads
        const deltaLat = (Math.random() - 0.5) * 0.002;
        const deltaLng = (Math.random() - 0.5) * 0.002;
        const newHeading = (currentPos.heading + (Math.random() - 0.5) * 30 + 360) % 360;

        const newPos = {
          lat: currentPos.lat + deltaLat,
          lng: currentPos.lng + deltaLng,
          heading: newHeading
        };

        vehiclePositionsRef.current.set(vehicleId, newPos);

        addStreamItem('vehicle', 'vehicle:position', {
          vehicleId,
          lat: newPos.lat.toFixed(6),
          lng: newPos.lng.toFixed(6),
          heading: newHeading.toFixed(1),
          speed: (30 + Math.random() * 50).toFixed(0),
          timestamp: new Date().toISOString()
        });
      }
    }, 200);

    return () => clearInterval(interval);
  }, [showDataStream, addStreamItem]);

  // Generate optimization updates
  useEffect(() => {
    if (!showDataStream) return;

    const interval = setInterval(() => {
      addStreamItem('optimization', 'optimization:progress', {
        iteration: Math.floor(Math.random() * 10000),
        currentCost: (1200 + Math.random() * 800).toFixed(0),
        bestCost: (1200 + Math.random() * 300).toFixed(0),
        temperature: (Math.random() * 1000).toFixed(0),
        improvement: Math.random() > 0.7 ? (Math.random() * 5).toFixed(2) + '%' : '0%'
      });
    }, 500);

    return () => clearInterval(interval);
  }, [showDataStream, addStreamItem]);

  // Generate delivery updates
  useEffect(() => {
    if (!showDataStream) return;

    const interval = setInterval(() => {
      const vehicleId = VEHICLE_IDS[Math.floor(Math.random() * VEHICLE_IDS.length)];
      const location = DUBAI_LOCATIONS[Math.floor(Math.random() * DUBAI_LOCATIONS.length)];

      if (Math.random() > 0.5) {
        addStreamItem('delivery', 'delivery:update', {
          vehicleId,
          stopName: location.name,
          status: Math.random() > 0.3 ? 'completed' : 'in_progress',
          packages: Math.floor(Math.random() * 5) + 1,
          timestamp: new Date().toISOString()
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [showDataStream, addStreamItem]);

  // Generate sensor/traffic data
  useEffect(() => {
    if (!showDataStream) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        addStreamItem('traffic', 'traffic:update', {
          segment: `SZR-${Math.floor(Math.random() * 50)}`,
          congestionLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          avgSpeed: (20 + Math.random() * 80).toFixed(0),
          vehicleCount: Math.floor(Math.random() * 100)
        });
      }

      if (Math.random() > 0.8) {
        addStreamItem('sensor', 'sensor:telemetry', {
          vehicleId: VEHICLE_IDS[Math.floor(Math.random() * VEHICLE_IDS.length)],
          fuelLevel: (Math.random() * 100).toFixed(1) + '%',
          engineTemp: (80 + Math.random() * 20).toFixed(0) + '°C',
          tirePressure: (30 + Math.random() * 5).toFixed(1) + ' PSI'
        });
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [showDataStream, addStreamItem]);

  // Generate occasional alerts
  useEffect(() => {
    if (!showDataStream) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.9) {
        const alertTypes = [
          { type: 'traffic_delay', message: 'Heavy traffic detected on Sheikh Zayed Road' },
          { type: 'route_deviation', message: 'Vehicle deviated from planned route' },
          { type: 'delivery_delay', message: 'Delivery running behind schedule' },
          { type: 'maintenance', message: 'Vehicle maintenance due soon' }
        ];
        const alert = alertTypes[Math.floor(Math.random() * alertTypes.length)];

        addStreamItem('alert', 'alert:warning', {
          vehicleId: VEHICLE_IDS[Math.floor(Math.random() * VEHICLE_IDS.length)],
          alertType: alert.type,
          message: alert.message,
          severity: Math.random() > 0.5 ? 'warning' : 'info',
          timestamp: new Date().toISOString()
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [showDataStream, addStreamItem]);

  // Subscribe to real WebSocket events (in addition to simulated data)
  useEffect(() => {
    if (!showDataStream) return;

    const socket = getSocket();
    setIsConnected(socket.connected || true); // Default to true for demo

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleVehiclesUpdate = (data: unknown) => addStreamItem('vehicle', 'vehicles:update', data);
    const handleStatsUpdate = (data: unknown) => addStreamItem('metrics', 'stats:update', data);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('vehicles:update', handleVehiclesUpdate);
    socket.on('stats:update', handleStatsUpdate);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('vehicles:update', handleVehiclesUpdate);
      socket.off('stats:update', handleStatsUpdate);
    };
  }, [showDataStream, addStreamItem]);

  // Calculate throughput
  useEffect(() => {
    if (!showDataStream) return;

    const interval = setInterval(() => {
      const rate = messageCountRef.current - lastCountRef.current;
      setThroughput(rate);
      lastCountRef.current = messageCountRef.current;
    }, 1000);

    return () => clearInterval(interval);
  }, [showDataStream]);

  // Auto-scroll
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [dataStream]);

  if (!showDataStream) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-4 top-20 w-[420px] h-[550px] z-50 rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(0,20,0,0.95) 0%, rgba(0,10,0,0.98) 100%)',
        border: '1px solid rgba(0, 255, 0, 0.2)',
        boxShadow: '0 0 30px rgba(0, 255, 0, 0.1), inset 0 0 60px rgba(0, 255, 0, 0.03)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-green-900/50 bg-black/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Activity className="w-5 h-5 text-green-400" />
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: ['0 0 5px #00ff00', '0 0 20px #00ff00', '0 0 5px #00ff00'],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>
          <div>
            <span className="text-green-400 font-mono text-sm font-bold tracking-wider">
              LIVE DATA STREAM
            </span>
            <div className="text-[9px] text-green-600 font-mono">Real-time Fleet Telemetry</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
            isConnected ? 'bg-green-900/30' : 'bg-red-900/30'
          }`}>
            {isConnected ? (
              <Wifi className="w-3 h-3 text-green-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-400" />
            )}
            <span className={`text-[10px] font-mono ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </div>

          {/* Throughput */}
          <div className="flex items-center gap-2 bg-green-900/30 px-3 py-1 rounded-full">
            <Zap className="w-3 h-3 text-green-400" />
            <span className="text-green-400 font-mono text-xs">
              {throughput} msg/s
            </span>
          </div>

          <button
            onClick={toggleDataStream}
            className="text-green-600 hover:text-green-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stream Content */}
      <div
        ref={containerRef}
        className="h-[calc(100%-60px)] overflow-y-auto p-3 space-y-2 font-mono text-xs"
        style={{
          background: `
            linear-gradient(180deg, rgba(0,20,0,0.3) 0%, transparent 50%),
            repeating-linear-gradient(
              0deg,
              transparent 0%,
              rgba(0, 255, 0, 0.02) 50%,
              transparent 100%
            )
          `,
          backgroundSize: '100% 100%, 100% 4px',
        }}
      >
        <AnimatePresence mode="popLayout">
          {dataStream.slice(-50).map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.2 }}
              className="relative rounded-lg overflow-hidden"
              style={{
                background: `linear-gradient(90deg, ${TYPE_COLORS[item.type]}10 0%, transparent 100%)`,
                borderLeft: `3px solid ${TYPE_COLORS[item.type]}`,
              }}
            >
              <div className="px-3 py-2">
                {/* Type badge and channel */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        background: `${TYPE_COLORS[item.type]}20`,
                        color: TYPE_COLORS[item.type],
                      }}
                    >
                      {TYPE_ICONS[item.type]} {item.type}
                    </span>
                    <span className="text-green-700 text-[9px] font-mono">
                      {item.channel}
                    </span>
                  </div>
                  <span className="text-green-700 text-[9px]">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Payload - truncated for readability */}
                <pre
                  className="text-green-300/80 whitespace-pre-wrap break-all leading-relaxed max-h-24 overflow-hidden"
                  style={{ textShadow: '0 0 5px rgba(0, 255, 0, 0.3)' }}
                >
                  {item.payload.length > 300 ? item.payload.substring(0, 300) + '...' : item.payload}
                </pre>
              </div>

              {/* Scan line effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, transparent 0%, rgba(0,255,0,0.05) 50%, transparent 100%)',
                  backgroundSize: '100% 10px',
                }}
                animate={{ backgroundPositionY: ['0%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {dataStream.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-green-600">
            <Activity className="w-8 h-8 mb-2 animate-pulse" />
            <span className="text-sm">Initializing data stream...</span>
          </div>
        )}
      </div>

      {/* Matrix rain effect overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent 0px,
              transparent 2px,
              rgba(0, 255, 0, 0.03) 2px,
              rgba(0, 255, 0, 0.03) 4px
            )
          `,
        }}
      />
    </motion.div>
  );
}
