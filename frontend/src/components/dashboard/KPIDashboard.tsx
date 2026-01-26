'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Fuel, Clock, Leaf, Package, Target } from 'lucide-react';

interface KPIProps {
  totalDistanceSaved: number;
  fuelSaved: number;
  co2Reduced: number;
  onTimeRate: number;
  deliveriesCompleted: number;
  routeEfficiency: number;
}

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
}

function AnimatedCounter({ value, suffix = '', prefix = '', decimals = 0, duration = 1000 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className="font-mono tabular-nums">
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
}

interface SparklineProps {
  data: number[];
  color: string;
  height?: number;
}

function Sparkline({ data, color, height = 24 }: SparklineProps) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * 60;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="60" height={height} className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function KPIDashboard({
  totalDistanceSaved,
  fuelSaved,
  co2Reduced,
  onTimeRate,
  deliveriesCompleted,
  routeEfficiency
}: KPIProps) {
  const [sparklineData, setSparklineData] = useState({
    distance: [0, 5, 12, 18, 25, 30, 38, 45, 52, 60],
    fuel: [0, 3, 8, 15, 22, 28, 35, 42, 48, 55],
    efficiency: [85, 87, 86, 89, 91, 90, 93, 94, 95, 96],
  });

  // Update sparkline data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSparklineData(prev => ({
        distance: [...prev.distance.slice(1), totalDistanceSaved],
        fuel: [...prev.fuel.slice(1), fuelSaved],
        efficiency: [...prev.efficiency.slice(1), routeEfficiency],
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [totalDistanceSaved, fuelSaved, routeEfficiency]);

  const kpis = [
    {
      icon: TrendingDown,
      label: 'Distance Saved',
      value: totalDistanceSaved,
      suffix: ' km',
      color: '#00ff88',
      sparkline: sparklineData.distance,
    },
    {
      icon: Fuel,
      label: 'Fuel Saved',
      value: fuelSaved,
      suffix: ' L',
      color: '#ff8800',
      sparkline: sparklineData.fuel,
    },
    {
      icon: Leaf,
      label: 'CO₂ Reduced',
      value: co2Reduced,
      suffix: ' kg',
      color: '#00d4ff',
      sparkline: null,
    },
    {
      icon: Clock,
      label: 'On-Time Rate',
      value: onTimeRate,
      suffix: '%',
      color: '#a855f7',
      decimals: 1,
      sparkline: null,
    },
    {
      icon: Package,
      label: 'Deliveries',
      value: deliveriesCompleted,
      suffix: '',
      color: '#ffd93d',
      sparkline: null,
    },
    {
      icon: Target,
      label: 'Efficiency',
      value: routeEfficiency,
      suffix: '%',
      color: '#ff6b6b',
      decimals: 1,
      sparkline: sparklineData.efficiency,
    },
  ];

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
    >
      <div
        className="flex items-center gap-1 px-2 py-2 rounded-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
          border: '1px solid rgba(100, 200, 255, 0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-default"
            >
              <div
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: `${kpi.color}15` }}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: kpi.color }} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] text-gray-500 uppercase tracking-wider">{kpi.label}</span>
                <span
                  className="text-sm font-bold"
                  style={{ color: kpi.color }}
                >
                  <AnimatedCounter
                    value={kpi.value}
                    suffix={kpi.suffix}
                    decimals={kpi.decimals || 0}
                  />
                </span>
              </div>
              {kpi.sparkline && (
                <Sparkline data={kpi.sparkline} color={kpi.color} />
              )}
              {index < kpis.length - 1 && (
                <div className="w-px h-8 bg-gray-800 ml-2" />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
