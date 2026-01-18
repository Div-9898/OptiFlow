'use client';

import { forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, Clock, Fuel, AlertTriangle } from 'lucide-react';
import { useVehicleStore } from '@/stores/vehicleStore';
import { cn, getStatusColor } from '@/lib/utils';
import type { Vehicle, VehicleStatus } from '@/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  isSelected: boolean;
  onSelect: () => void;
}

const VehicleCard = forwardRef<HTMLDivElement, VehicleCardProps>(
  ({ vehicle, isSelected, onSelect }, ref) => {
    const statusColor = getStatusColor(vehicle.status);

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        whileHover={{ scale: 1.01 }}
        onClick={onSelect}
        className={cn(
          'p-3 rounded-xl cursor-pointer transition-all duration-200',
          'border border-transparent',
          isSelected
            ? 'bg-accent-cyan/10 border-accent-cyan/30'
            : 'bg-dark-700/50 hover:bg-dark-700'
        )}
      >
        <div className="flex items-start gap-3">
          {/* Vehicle Icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${statusColor}20` }}
          >
            <Truck className="w-5 h-5" style={{ color: statusColor }} />
          </div>

          {/* Vehicle Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-white truncate">
                {vehicle.name}
              </h4>
              <span
                className="text-xs px-2 py-0.5 rounded-full capitalize"
                style={{
                  backgroundColor: `${statusColor}20`,
                  color: statusColor,
                }}
              >
                {vehicle.status}
              </span>
            </div>

            <p className="text-xs text-gray-400 mt-0.5">{vehicle.plateNumber}</p>

            {/* Stats Row */}
            <div className="flex items-center gap-3 mt-2">
              {/* Speed */}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>{(vehicle.speed || 0).toFixed(0)} km/h</span>
              </div>

              {/* Fuel */}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Fuel className="w-3 h-3" />
                <span>{vehicle.fuelLevel || 0}%</span>
              </div>

              {/* Load */}
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <span>{vehicle.currentLoad || 0}/{vehicle.capacity || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Driver Info */}
        <div className="mt-2 pt-2 border-t border-dark-600 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Driver: {vehicle.driverName || 'Unknown'}
          </span>
          {vehicle.nextDeliveryId && (
            <span className="text-xs text-accent-cyan">
              Next delivery →
            </span>
          )}
        </div>
      </motion.div>
    );
  }
);

VehicleCard.displayName = 'VehicleCard';

export default function VehicleList() {
  const { vehicles, selectedVehicleId, selectVehicle } = useVehicleStore();
  const vehicleArray = Array.from(vehicles.values());

  const statusCounts = vehicleArray.reduce(
    (acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    },
    {} as Record<VehicleStatus, number>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-dark-600">
        <h3 className="text-lg font-semibold text-white">Fleet Status</h3>
        <div className="flex gap-2 mt-2">
          {(['active', 'idle', 'maintenance'] as VehicleStatus[]).map((status) => (
            <span
              key={status}
              className="text-xs px-2 py-1 rounded-full"
              style={{
                backgroundColor: `${getStatusColor(status)}20`,
                color: getStatusColor(status),
              }}
            >
              {statusCounts[status] || 0} {status}
            </span>
          ))}
        </div>
      </div>

      {/* Vehicle List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <AnimatePresence mode="popLayout">
          {vehicleArray.length > 0 ? (
            vehicleArray.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                isSelected={selectedVehicleId === vehicle.id}
                onSelect={() =>
                  selectVehicle(
                    selectedVehicleId === vehicle.id ? null : vehicle.id
                  )
                }
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-gray-400"
            >
              <Truck className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm">No vehicles available</p>
              <p className="text-xs mt-1">Waiting for data...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
