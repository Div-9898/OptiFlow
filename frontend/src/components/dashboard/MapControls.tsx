'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Thermometer,
  RotateCw,
  Layers,
  ChevronDown,
  Building2,
  Navigation,
  Map,
} from 'lucide-react';

interface MapControlsProps {
  onRotate: (bearing: number) => void;
  onToggleHeatmap: (enabled: boolean) => void;
  onToggle3DBuildings: (enabled: boolean) => void;
  onToggleTraffic: (enabled: boolean) => void;
  onResetView: () => void;
  currentBearing: number;
}

export default function MapControls({
  onRotate,
  onToggleHeatmap,
  onToggle3DBuildings,
  onToggleTraffic,
  onResetView,
  currentBearing,
}: MapControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [buildings3DEnabled, setBuildings3DEnabled] = useState(true);
  const [trafficEnabled, setTrafficEnabled] = useState(false);

  const handleRotate = (direction: 'cw' | 'ccw') => {
    const newBearing = currentBearing + (direction === 'cw' ? 45 : -45);
    onRotate(newBearing);
  };

  const toggleHeatmap = () => {
    setHeatmapEnabled(!heatmapEnabled);
    onToggleHeatmap(!heatmapEnabled);
  };

  const toggle3DBuildings = () => {
    setBuildings3DEnabled(!buildings3DEnabled);
    onToggle3DBuildings(!buildings3DEnabled);
  };

  const toggleTraffic = () => {
    setTrafficEnabled(!trafficEnabled);
    onToggleTraffic(!trafficEnabled);
  };

  const presetViews = [
    { label: 'North', bearing: 0, icon: '⬆️' },
    { label: 'East', bearing: 90, icon: '➡️' },
    { label: 'South', bearing: 180, icon: '⬇️' },
    { label: 'West', bearing: 270, icon: '⬅️' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-[360px] right-4 z-10"
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
          border: '1px solid rgba(100, 150, 255, 0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        {/* Compass / Rotation */}
        <div className="p-3 border-b border-gray-800/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Rotation</span>
            <motion.div
              animate={{ rotate: -currentBearing }}
              transition={{ type: 'spring', stiffness: 100 }}
              className="relative w-8 h-8"
            >
              <Compass className="w-8 h-8 text-cyan-400" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-0.5 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-red-500" />
            </motion.div>
          </div>

          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRotate('ccw')}
              className="flex-1 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            >
              <RotateCw className="w-4 h-4 mx-auto transform -scale-x-100" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onResetView}
              className="flex-1 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            >
              <Navigation className="w-4 h-4 mx-auto" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRotate('cw')}
              className="flex-1 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
            >
              <RotateCw className="w-4 h-4 mx-auto" />
            </motion.button>
          </div>

          {/* Preset directions */}
          <div className="flex items-center gap-1 mt-2">
            {presetViews.map((view) => (
              <motion.button
                key={view.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onRotate(view.bearing)}
                className={`flex-1 py-1 text-[10px] rounded transition-colors ${
                  Math.abs(currentBearing % 360 - view.bearing) < 10
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-gray-800/30 text-gray-500 hover:text-gray-300'
                }`}
              >
                {view.icon}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Layers Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-300">Map Layers</span>
          </div>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-2 space-y-1 border-t border-gray-800/50">
                {/* Heat Map */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleHeatmap}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                    heatmapEnabled
                      ? 'bg-orange-500/10 border border-orange-500/30'
                      : 'bg-gray-800/30 hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Thermometer
                      className="w-4 h-4"
                      style={{ color: heatmapEnabled ? '#ff8800' : '#666' }}
                    />
                    <span className={`text-xs ${heatmapEnabled ? 'text-orange-400' : 'text-gray-400'}`}>
                      Traffic Heat Map
                    </span>
                  </div>
                  <div
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                      heatmapEnabled ? 'bg-orange-500' : 'bg-gray-600'
                    }`}
                  >
                    <motion.div
                      className="w-3 h-3 rounded-full bg-white"
                      animate={{ x: heatmapEnabled ? 14 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </motion.button>

                {/* 3D Buildings */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggle3DBuildings}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                    buildings3DEnabled
                      ? 'bg-purple-500/10 border border-purple-500/30'
                      : 'bg-gray-800/30 hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2
                      className="w-4 h-4"
                      style={{ color: buildings3DEnabled ? '#a855f7' : '#666' }}
                    />
                    <span className={`text-xs ${buildings3DEnabled ? 'text-purple-400' : 'text-gray-400'}`}>
                      3D Buildings
                    </span>
                  </div>
                  <div
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                      buildings3DEnabled ? 'bg-purple-500' : 'bg-gray-600'
                    }`}
                  >
                    <motion.div
                      className="w-3 h-3 rounded-full bg-white"
                      animate={{ x: buildings3DEnabled ? 14 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </motion.button>

                {/* Traffic Layer */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleTraffic}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                    trafficEnabled
                      ? 'bg-red-500/10 border border-red-500/30'
                      : 'bg-gray-800/30 hover:bg-gray-700/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Map
                      className="w-4 h-4"
                      style={{ color: trafficEnabled ? '#ff4444' : '#666' }}
                    />
                    <span className={`text-xs ${trafficEnabled ? 'text-red-400' : 'text-gray-400'}`}>
                      Traffic Layer
                    </span>
                  </div>
                  <div
                    className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                      trafficEnabled ? 'bg-red-500' : 'bg-gray-600'
                    }`}
                  >
                    <motion.div
                      className="w-3 h-3 rounded-full bg-white"
                      animate={{ x: trafficEnabled ? 14 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
