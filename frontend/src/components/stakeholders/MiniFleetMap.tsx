'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Map,
  Truck,
  MapPin,
  Navigation,
  Maximize2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface Vehicle {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'delivering' | 'returning' | 'idle' | 'maintenance';
  heading: number;
  speed: number;
  risk: 'low' | 'medium' | 'high';
}

interface Depot {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// Dubai coordinates roughly centered
const MAP_CENTER = { lat: 25.2048, lng: 55.2708 };
const MAP_BOUNDS = {
  minLat: 25.0,
  maxLat: 25.4,
  minLng: 54.9,
  maxLng: 55.6
};

// Convert geo coordinates to SVG coordinates
function geoToSvg(lat: number, lng: number, width: number, height: number) {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * width;
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * height;
  return { x, y };
}

const statusColors = {
  delivering: '#10b981',
  returning: '#3b82f6',
  idle: '#6b7280',
  maintenance: '#f59e0b'
};

const riskColors = {
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444'
};

// Mock data
const mockVehicles: Vehicle[] = [
  { id: 'v1', name: 'Alpha-01', lat: 25.08, lng: 55.14, status: 'delivering', heading: 45, speed: 42, risk: 'low' },
  { id: 'v2', name: 'Alpha-02', lat: 25.19, lng: 55.27, status: 'delivering', heading: 120, speed: 38, risk: 'low' },
  { id: 'v3', name: 'Beta-03', lat: 25.25, lng: 55.32, status: 'returning', heading: 200, speed: 50, risk: 'medium' },
  { id: 'v4', name: 'Beta-05', lat: 25.12, lng: 55.20, status: 'delivering', heading: 90, speed: 35, risk: 'high' },
  { id: 'v5', name: 'Gamma-07', lat: 25.22, lng: 55.15, status: 'idle', heading: 0, speed: 0, risk: 'low' },
  { id: 'v6', name: 'Gamma-08', lat: 25.30, lng: 55.38, status: 'delivering', heading: 315, speed: 45, risk: 'low' },
  { id: 'v7', name: 'Delta-02', lat: 25.15, lng: 55.42, status: 'maintenance', heading: 0, speed: 0, risk: 'low' },
  { id: 'v8', name: 'Delta-04', lat: 25.28, lng: 55.25, status: 'delivering', heading: 60, speed: 40, risk: 'low' },
];

const mockDepots: Depot[] = [
  { id: 'd1', name: 'Main Depot', lat: 25.20, lng: 55.27 },
  { id: 'd2', name: 'South Hub', lat: 25.08, lng: 55.18 },
];

function VehicleMarker({
  vehicle,
  x,
  y,
  isSelected,
  onSelect
}: {
  vehicle: Vehicle;
  x: number;
  y: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const color = statusColors[vehicle.status];
  const riskColor = riskColors[vehicle.risk];

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onSelect}
      style={{ cursor: 'pointer' }}
    >
      {/* Risk ring for high risk vehicles */}
      {vehicle.risk === 'high' && (
        <motion.circle
          r="12"
          fill="none"
          stroke={riskColor}
          strokeWidth="2"
          animate={{
            r: [10, 15, 10],
            opacity: [0.8, 0.2, 0.8]
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Vehicle direction indicator */}
      {vehicle.speed > 0 && (
        <motion.line
          x1="0"
          y1="0"
          x2={Math.sin(vehicle.heading * Math.PI / 180) * 15}
          y2={-Math.cos(vehicle.heading * Math.PI / 180) * 15}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
        />
      )}

      {/* Vehicle marker */}
      <motion.circle
        r={isSelected ? 8 : 6}
        fill={color}
        stroke={isSelected ? '#fff' : color}
        strokeWidth={isSelected ? 2 : 1}
        animate={vehicle.speed > 0 ? {
          scale: [1, 1.1, 1]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          filter: `drop-shadow(0 0 ${isSelected ? 8 : 4}px ${color})`
        }}
      />

      {/* Selection highlight */}
      {isSelected && (
        <motion.circle
          r="12"
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          strokeDasharray="3,3"
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
      )}
    </g>
  );
}

export default function MiniFleetMap() {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const width = 400;
  const height = 280;

  // Simulate vehicle movement
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prev => prev.map(v => {
        if (v.status === 'idle' || v.status === 'maintenance') return v;

        const movement = 0.003;
        const newLat = v.lat + (Math.random() - 0.5) * movement;
        const newLng = v.lng + (Math.random() - 0.5) * movement;

        return {
          ...v,
          lat: Math.max(MAP_BOUNDS.minLat, Math.min(MAP_BOUNDS.maxLat, newLat)),
          lng: Math.max(MAP_BOUNDS.minLng, Math.min(MAP_BOUNDS.maxLng, newLng)),
          heading: (v.heading + (Math.random() - 0.5) * 30) % 360,
          speed: v.status === 'delivering' ? 35 + Math.random() * 20 : 40 + Math.random() * 15
        };
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const selected = vehicles.find(v => v.id === selectedVehicle);
  const activeCount = vehicles.filter(v => v.status === 'delivering' || v.status === 'returning').length;
  const highRiskCount = vehicles.filter(v => v.risk === 'high').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden h-full"
      style={{
        background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
        border: '1px solid rgba(100, 200, 255, 0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}
    >
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20">
            <Map className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Live Fleet Map</h3>
            <p className="text-[9px] text-gray-500">{activeCount} vehicles active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {highRiskCount > 0 && (
            <motion.div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30"
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-[9px] font-bold text-red-400">{highRiskCount}</span>
            </motion.div>
          )}
          <motion.div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-[9px] font-bold text-green-400">LIVE</span>
          </motion.div>
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <svg
          ref={svgRef}
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="bg-[#0a0f1a]"
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(100, 200, 255, 0.05)"
                strokeWidth="0.5"
              />
            </pattern>
            {/* Road pattern */}
            <filter id="road-glow">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Background grid */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Stylized roads (simplified) */}
          <g stroke="rgba(100, 200, 255, 0.1)" strokeWidth="2" fill="none" filter="url(#road-glow)">
            <path d={`M 0 ${height/2} L ${width} ${height/2}`} />
            <path d={`M ${width/2} 0 L ${width/2} ${height}`} />
            <path d={`M 0 ${height/3} L ${width} ${height/3}`} />
            <path d={`M 0 ${height*2/3} L ${width} ${height*2/3}`} />
            <path d={`M ${width/3} 0 L ${width/3} ${height}`} />
            <path d={`M ${width*2/3} 0 L ${width*2/3} ${height}`} />
          </g>

          {/* Depots */}
          {mockDepots.map(depot => {
            const pos = geoToSvg(depot.lat, depot.lng, width, height);
            return (
              <g key={depot.id} transform={`translate(${pos.x}, ${pos.y})`}>
                <rect
                  x="-8"
                  y="-8"
                  width="16"
                  height="16"
                  fill="rgba(139, 92, 246, 0.3)"
                  stroke="#8b5cf6"
                  strokeWidth="1"
                  rx="3"
                />
                <MapPin className="w-4 h-4 text-purple-400" x="-8" y="-8" />
              </g>
            );
          })}

          {/* Vehicles */}
          {vehicles.map(vehicle => {
            const pos = geoToSvg(vehicle.lat, vehicle.lng, width, height);
            return (
              <VehicleMarker
                key={vehicle.id}
                vehicle={vehicle}
                x={pos.x}
                y={pos.y}
                isSelected={selectedVehicle === vehicle.id}
                onSelect={() => setSelectedVehicle(vehicle.id === selectedVehicle ? null : vehicle.id)}
              />
            );
          })}
        </svg>

        {/* Selected vehicle info overlay */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-2 left-2 right-2 p-3 rounded-lg"
            style={{
              background: 'rgba(10, 15, 25, 0.95)',
              border: `1px solid ${statusColors[selected.status]}40`,
              backdropFilter: 'blur(8px)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${statusColors[selected.status]}20` }}
                >
                  <Truck className="w-4 h-4" style={{ color: statusColors[selected.status] }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{selected.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                      style={{
                        backgroundColor: `${statusColors[selected.status]}20`,
                        color: statusColors[selected.status]
                      }}
                    >
                      {selected.status}
                    </span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase"
                      style={{
                        backgroundColor: `${riskColors[selected.risk]}20`,
                        color: riskColors[selected.risk]
                      }}
                    >
                      {selected.risk} risk
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold font-mono text-cyan-400">{selected.speed.toFixed(0)} km/h</p>
                <p className="text-[9px] text-gray-500">Current Speed</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="px-3 py-2 border-t border-white/10 flex items-center justify-between">
        <div className="flex gap-3">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[9px] text-gray-500 capitalize">{status}</span>
            </div>
          ))}
        </div>
        <button className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
          <Maximize2 className="w-3 h-3" />
          Expand
        </button>
      </div>
    </motion.div>
  );
}
