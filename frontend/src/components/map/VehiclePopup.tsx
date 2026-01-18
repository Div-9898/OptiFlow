'use client';

import { motion } from 'framer-motion';
import { Truck, Fuel, MapPin, User, Package } from 'lucide-react';
import type { Vehicle } from '@/types';
import { getStatusColor } from '@/lib/utils';

interface VehiclePopupProps {
  vehicle: Vehicle;
  position: { x: number; y: number };
}

export default function VehiclePopup({ vehicle, position }: VehiclePopupProps) {
  const statusColor = getStatusColor(vehicle.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="fixed z-50 pointer-events-none"
      style={{
        left: position.x,
        top: position.y - 10,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="glass-dark p-3 rounded-xl min-w-[200px] shadow-xl">
        {/* Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-dark-600">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${statusColor}20` }}
          >
            <Truck className="w-4 h-4" style={{ color: statusColor }} />
          </div>
          <div>
            <p className="text-sm font-medium text-white">{vehicle.name}</p>
            <p className="text-xs text-gray-400">{vehicle.plateNumber}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="w-3 h-3 text-accent-cyan" />
            <span className="text-gray-300">{vehicle.speed.toFixed(0)} km/h</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Fuel className="w-3 h-3 text-accent-lime" />
            <span className="text-gray-300">{vehicle.fuelLevel}%</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <User className="w-3 h-3 text-accent-purple" />
            <span className="text-gray-300 truncate">{vehicle.driverName}</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <Package className="w-3 h-3 text-accent-orange" />
            <span className="text-gray-300">{vehicle.currentLoad}/{vehicle.capacity}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-2 pt-2 border-t border-dark-600">
          <span
            className="text-xs px-2 py-0.5 rounded-full capitalize"
            style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
          >
            {vehicle.status}
          </span>
        </div>

        {/* Arrow */}
        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full"
          style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid rgba(26, 26, 37, 0.95)',
          }}
        />
      </div>
    </motion.div>
  );
}
