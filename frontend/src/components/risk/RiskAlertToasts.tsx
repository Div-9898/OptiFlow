'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  Truck,
  Thermometer,
  Battery,
  Navigation
} from 'lucide-react';

interface RiskAlert {
  id: string;
  type: 'critical' | 'high' | 'medium' | 'low';
  category: 'vehicle' | 'driver' | 'weather' | 'route';
  message: string;
  vehicleId?: string;
  timestamp: Date;
}

const ALERT_CONFIG = {
  critical: { icon: AlertTriangle, color: '#ef4444', label: 'CRITICAL' },
  high: { icon: AlertCircle, color: '#f97316', label: 'HIGH' },
  medium: { icon: Info, color: '#f59e0b', label: 'MEDIUM' },
  low: { icon: Info, color: '#3b82f6', label: 'LOW' }
};

const CATEGORY_ICONS = {
  vehicle: Truck,
  driver: AlertTriangle,
  weather: Thermometer,
  route: Navigation
};

interface RiskAlertToastsProps {
  maxVisible?: number;
}

export default function RiskAlertToasts({ maxVisible = 3 }: RiskAlertToastsProps) {
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);

  // Generate random alerts
  useEffect(() => {
    const generateAlert = (): RiskAlert => {
      const types: RiskAlert['type'][] = ['critical', 'high', 'medium', 'low'];
      const categories: RiskAlert['category'][] = ['vehicle', 'driver', 'weather', 'route'];
      const vehicleIds = ['VH-001', 'VH-002', 'VH-003', 'VH-004', 'VH-005'];

      const type = types[Math.floor(Math.random() * types.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const vehicleId = vehicleIds[Math.floor(Math.random() * vehicleIds.length)];

      const messages: Record<RiskAlert['category'], string[]> = {
        vehicle: [
          `${vehicleId}: Brake system warning`,
          `${vehicleId}: Engine temperature elevated`,
          `${vehicleId}: Tire pressure low`,
          `${vehicleId}: Fuel level critical`
        ],
        driver: [
          `${vehicleId}: Driver fatigue detected`,
          `${vehicleId}: Harsh braking event`,
          `${vehicleId}: Speed limit exceeded`,
          `${vehicleId}: Rest period due`
        ],
        weather: [
          'Heavy rain approaching route area',
          'High winds advisory in effect',
          'Fog warning for coastal routes',
          'Temperature drop expected'
        ],
        route: [
          `${vehicleId}: Traffic congestion ahead`,
          `${vehicleId}: Road closure detected`,
          `${vehicleId}: Accident on planned route`,
          `${vehicleId}: Construction delay expected`
        ]
      };

      return {
        id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        category,
        message: messages[category][Math.floor(Math.random() * messages[category].length)],
        vehicleId: category !== 'weather' ? vehicleId : undefined,
        timestamp: new Date()
      };
    };

    // Add initial alert
    setTimeout(() => {
      setAlerts([generateAlert()]);
    }, 2000);

    // Add new alerts periodically
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        setAlerts(prev => [generateAlert(), ...prev].slice(0, 10));
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Auto-dismiss after 10 seconds
  useEffect(() => {
    if (alerts.length > 0) {
      const timeout = setTimeout(() => {
        setAlerts(prev => prev.slice(0, -1));
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [alerts]);

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 w-80">
      <AnimatePresence>
        {alerts.slice(0, maxVisible).map((alert, index) => {
          const config = ALERT_CONFIG[alert.type];
          const AlertIcon = config.icon;
          const CategoryIcon = CATEGORY_ICONS[alert.category];

          return (
            <motion.div
              key={alert.id}
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(20,25,35,0.98) 0%, rgba(15,20,30,0.98) 100%)',
                border: `1px solid ${config.color}40`,
                boxShadow: `0 4px 20px ${config.color}20`
              }}
            >
              {/* Progress bar for auto-dismiss */}
              <motion.div
                className="absolute bottom-0 left-0 h-1"
                style={{ backgroundColor: config.color }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 10, ease: 'linear' }}
              />

              <div className="p-3">
                <div className="flex items-start gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: alert.type === 'critical' ? Infinity : 0 }}
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${config.color}20` }}
                  >
                    <AlertIcon className="w-4 h-4" style={{ color: config.color }} />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${config.color}20`, color: config.color }}
                      >
                        {config.label}
                      </span>
                      <CategoryIcon className="w-3 h-3 text-gray-500" />
                      <span className="text-[10px] text-gray-500 capitalize">{alert.category}</span>
                    </div>
                    <p className="text-sm text-white leading-tight">{alert.message}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {alert.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
