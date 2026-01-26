'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, CheckCircle, Clock, MapPin, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'delivery' | 'pickup' | 'alert' | 'optimization';
  vehicleId: string;
  location: string;
  message: string;
  timestamp: Date;
}

const LOCATIONS = [
  'Dubai Marina',
  'Downtown Dubai',
  'Business Bay',
  'JBR',
  'Palm Jumeirah',
  'Dubai Mall',
  'DIFC',
  'Jebel Ali',
  'Al Quoz',
  'Internet City',
];

const VEHICLE_IDS = ['VH-1001', 'VH-1002', 'VH-1003', 'VH-1004', 'VH-1005', 'VH-1006'];

export default function DeliveryNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 5));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  // Generate random notifications
  useEffect(() => {
    const generateNotification = () => {
      const types: Notification['type'][] = ['delivery', 'pickup', 'optimization'];
      const type = types[Math.floor(Math.random() * types.length)];
      const vehicleId = VEHICLE_IDS[Math.floor(Math.random() * VEHICLE_IDS.length)];
      const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

      const messages: Record<Notification['type'], string[]> = {
        delivery: [
          `Package delivered successfully`,
          `3 packages dropped off`,
          `Express delivery completed`,
        ],
        pickup: [
          `Pickup completed`,
          `5 packages collected`,
          `Warehouse pickup done`,
        ],
        optimization: [
          `Route optimized - 12% faster`,
          `Traffic avoided - new route`,
          `ETA updated - 8 min saved`,
        ],
        alert: [
          `Driver fatigue warning`,
          `Vehicle maintenance due`,
          `Weather delay expected`,
        ],
      };

      addNotification({
        type,
        vehicleId,
        location,
        message: messages[type][Math.floor(Math.random() * messages[type].length)],
      });
    };

    // Initial notification after 2 seconds
    const initialTimeout = setTimeout(generateNotification, 2000);

    // Then every 8-15 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        generateNotification();
      }
    }, 8000 + Math.random() * 7000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [addNotification]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'delivery':
        return { color: '#00ff88', icon: CheckCircle, bg: 'rgba(0, 255, 136, 0.1)' };
      case 'pickup':
        return { color: '#00d4ff', icon: Package, bg: 'rgba(0, 212, 255, 0.1)' };
      case 'optimization':
        return { color: '#a855f7', icon: Clock, bg: 'rgba(168, 85, 247, 0.1)' };
      default:
        return { color: '#888', icon: Package, bg: 'rgba(136, 136, 136, 0.1)' };
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-40 w-80 space-y-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => {
          const styles = getTypeStyles(notification.type);
          const Icon = styles.icon;

          return (
            <motion.div
              key={notification.id}
              initial={{ x: 400, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 400, opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative overflow-hidden rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(15,20,30,0.95) 0%, rgba(10,15,25,0.98) 100%)',
                border: `1px solid ${styles.color}30`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 20px ${styles.color}10`,
              }}
            >
              {/* Progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="absolute top-0 left-0 h-0.5"
                style={{ backgroundColor: styles.color }}
              />

              <div className="p-3">
                <div className="flex items-start gap-3">
                  <div
                    className="p-2 rounded-lg shrink-0"
                    style={{ backgroundColor: styles.bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: styles.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: styles.bg, color: styles.color }}
                      >
                        {notification.vehicleId}
                      </span>
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-sm text-white font-medium mt-1">
                      {notification.message}
                    </p>

                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{notification.location}</span>
                      <span className="mx-1">•</span>
                      <span>Just now</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
