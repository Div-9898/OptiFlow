'use client';

import { motion } from 'framer-motion';
import {
  Heart, Activity, Brain, Eye, Thermometer, Wind,
  Watch, Battery, Wifi, AlertTriangle, Coffee, Footprints
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DriverBiometrics as BiometricsData } from '@/lib/fleetRoutes';

interface DriverBiometricsProps {
  biometrics: BiometricsData;
  driverName: string;
  color: string;
}

// Animated heart rate line
function HeartRateLine({ heartRate, color }: { heartRate: number; color: string }) {
  const points = Array.from({ length: 40 }, (_, i) => {
    const baseY = 20;
    const x = i * 5;

    // Create ECG-like pattern
    if (i % 10 === 4) return `${x},${baseY - 15}`; // P wave
    if (i % 10 === 5) return `${x},${baseY + 25}`; // Q dip
    if (i % 10 === 6) return `${x},${baseY - 30}`; // R spike
    if (i % 10 === 7) return `${x},${baseY + 10}`; // S dip
    if (i % 10 === 8) return `${x},${baseY - 5}`; // T wave
    return `${x},${baseY}`;
  }).join(' ');

  return (
    <div className="relative h-12 overflow-hidden">
      <motion.svg
        width="200"
        height="50"
        className="absolute"
        animate={{ x: [0, -100] }}
        transition={{ duration: 60 / heartRate * 10, repeat: Infinity, ease: 'linear' }}
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_6px_currentColor]"
        />
      </motion.svg>
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-dark-800 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-dark-800 to-transparent" />
    </div>
  );
}

// Circular gauge for metrics
function CircularGauge({
  value,
  max,
  label,
  unit,
  color,
  warning,
  critical
}: {
  value: number;
  max: number;
  label: string;
  unit: string;
  color: string;
  warning?: number;
  critical?: number;
}) {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let statusColor = color;
  if (critical && value >= critical) statusColor = '#ef4444';
  else if (warning && value >= warning) statusColor = '#f59e0b';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={statusColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 4px ${statusColor})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold" style={{ color: statusColor }}>
            {typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : Math.round(value)}
          </span>
          <span className="text-[8px] text-gray-500">{unit}</span>
        </div>
      </div>
      <span className="text-[9px] text-gray-400 mt-1 text-center">{label}</span>
    </div>
  );
}

export default function DriverBiometrics({ biometrics, driverName, color }: DriverBiometricsProps) {
  const alertnessColors = {
    high: '#22c55e',
    normal: '#3b82f6',
    low: '#f59e0b',
    critical: '#ef4444'
  };

  const signalColors = {
    excellent: '#22c55e',
    good: '#3b82f6',
    fair: '#f59e0b',
    poor: '#ef4444'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
        border: '1px solid rgba(100, 150, 255, 0.15)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{
          background: `linear-gradient(90deg, ${color}20 0%, transparent 100%)`,
          borderBottom: `1px solid ${color}30`
        }}
      >
        <div className="flex items-center gap-2">
          <Watch className="w-4 h-4" style={{ color }} />
          <span className="text-xs font-medium text-white">Biometrics Stream</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-green-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            LIVE
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <Wifi className="w-3 h-3" style={{ color: signalColors[biometrics.signalStrength] }} />
          <span>{biometrics.signalStrength}</span>
          <Battery className="w-3 h-3" />
          <span>{biometrics.deviceBattery}%</span>
        </div>
      </div>

      {/* Heart Rate Section */}
      <div className="px-4 py-3 border-b border-dark-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 60 / biometrics.heartRate, repeat: Infinity }}
            >
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            </motion.div>
            <span className="text-2xl font-bold text-white">{Math.round(biometrics.heartRate)}</span>
            <span className="text-xs text-gray-500">BPM</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500">HRV</div>
            <div className="text-sm font-medium text-cyan-400">{Math.round(biometrics.heartRateVariability)} ms</div>
          </div>
        </div>
        <HeartRateLine heartRate={biometrics.heartRate} color="#ef4444" />
      </div>

      {/* Fatigue & Alertness */}
      <div className="px-4 py-3 border-b border-dark-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Driver Alertness</span>
          </div>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              color: alertnessColors[biometrics.alertnessLevel],
              backgroundColor: `${alertnessColors[biometrics.alertnessLevel]}20`,
              border: `1px solid ${alertnessColors[biometrics.alertnessLevel]}40`
            }}
          >
            {biometrics.alertnessLevel.toUpperCase()}
          </span>
        </div>

        {/* Fatigue Bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-gray-500 mb-1">
            <span>Fatigue Level</span>
            <span className={cn(
              biometrics.fatigueScore > 70 ? 'text-red-400' :
              biometrics.fatigueScore > 50 ? 'text-yellow-400' :
              biometrics.fatigueScore > 30 ? 'text-blue-400' : 'text-green-400'
            )}>
              {Math.round(biometrics.fatigueScore)}%
            </span>
          </div>
          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${biometrics.fatigueScore}%` }}
              transition={{ duration: 0.5 }}
              style={{
                background: biometrics.fatigueScore > 70
                  ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                  : biometrics.fatigueScore > 50
                  ? 'linear-gradient(90deg, #22c55e, #f59e0b)'
                  : 'linear-gradient(90deg, #22c55e, #3b82f6)'
              }}
            />
          </div>
        </div>

        {/* Warning Banner */}
        {biometrics.fatigueScore > 60 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-xs',
              biometrics.fatigueScore > 70
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            )}
          >
            <AlertTriangle className="w-4 h-4" />
            {biometrics.fatigueScore > 70
              ? 'Critical fatigue detected - Break required'
              : 'Elevated fatigue - Consider break soon'}
          </motion.div>
        )}
      </div>

      {/* Vital Gauges */}
      <div className="px-4 py-3 border-b border-dark-700">
        <div className="grid grid-cols-4 gap-2">
          <CircularGauge
            value={Math.round(biometrics.eyeBlinkRate)}
            max={35}
            label="Blink Rate"
            unit="/min"
            color="#a855f7"
            warning={22}
            critical={28}
          />
          <CircularGauge
            value={Math.round(biometrics.stressLevel)}
            max={100}
            label="Stress"
            unit="%"
            color="#f59e0b"
            warning={60}
            critical={80}
          />
          <CircularGauge
            value={Number(biometrics.bodyTemperature.toFixed(1))}
            max={40}
            label="Body Temp"
            unit="°C"
            color="#06b6d4"
            warning={37.5}
            critical={38}
          />
          <CircularGauge
            value={Math.round(biometrics.bloodOxygen)}
            max={100}
            label="SpO₂"
            unit="%"
            color="#22c55e"
          />
        </div>
      </div>

      {/* Activity & Breaks */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2">
            <Footprints className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-xs font-medium text-white">{biometrics.stepCount.toLocaleString()}</div>
              <div className="text-[9px] text-gray-500">Steps Today</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-xs font-medium text-white">{biometrics.hoursAwake.toFixed(1)}h</div>
              <div className="text-[9px] text-gray-500">Awake</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-yellow-400" />
            <div>
              <div className={cn(
                'text-xs font-medium',
                biometrics.lastBreakMinutesAgo > 120 ? 'text-red-400' :
                biometrics.lastBreakMinutesAgo > 90 ? 'text-yellow-400' : 'text-white'
              )}>
                {biometrics.lastBreakMinutesAgo} min
              </div>
              <div className="text-[9px] text-gray-500">Since Break</div>
            </div>
          </div>
        </div>
      </div>

      {/* Device Footer */}
      <div className="px-4 py-2 bg-dark-800/50 flex items-center justify-between text-[9px] text-gray-500">
        <span>Device: {biometrics.deviceId}</span>
        <span>Last sync: {new Date(biometrics.lastSync).toLocaleTimeString()}</span>
      </div>
    </motion.div>
  );
}
