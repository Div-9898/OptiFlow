import { create } from 'zustand';
import { Vehicle, VehiclePositionUpdate, VehicleStatus, Coordinate } from '@/types';

interface VehicleState {
  vehicles: Map<string, Vehicle>;
  selectedVehicleId: string | null;
  hoveredVehicleId: string | null;
  vehicleTrails: Map<string, Coordinate[]>;
}

interface VehicleActions {
  setVehicles: (vehicles: Vehicle[]) => void;
  updateVehiclePosition: (update: VehiclePositionUpdate) => void;
  updateVehicleStatus: (vehicleId: string, status: VehicleStatus) => void;
  selectVehicle: (vehicleId: string | null) => void;
  setHoveredVehicle: (vehicleId: string | null) => void;
  addToTrail: (vehicleId: string, position: Coordinate) => void;
  clearTrails: () => void;
  getVehicleById: (vehicleId: string) => Vehicle | undefined;
  getActiveVehicles: () => Vehicle[];
}

type VehicleStore = VehicleState & VehicleActions;

const MAX_TRAIL_LENGTH = 50;

export const useVehicleStore = create<VehicleStore>((set, get) => ({
  vehicles: new Map(),
  selectedVehicleId: null,
  hoveredVehicleId: null,
  vehicleTrails: new Map(),

  setVehicles: (vehicles) => {
    const vehicleMap = new Map<string, Vehicle>();
    vehicles.forEach((v) => vehicleMap.set(v.id, v));
    set({ vehicles: vehicleMap });
  },

  updateVehiclePosition: (update) => {
    set((state) => {
      const vehicles = new Map(state.vehicles);
      const vehicle = vehicles.get(update.vehicleId);
      
      if (vehicle) {
        vehicles.set(update.vehicleId, {
          ...vehicle,
          lat: update.lat,
          lng: update.lng,
          heading: update.heading,
          speed: update.speed,
        });

        // Add to trail
        const trails = new Map(state.vehicleTrails);
        const trail = trails.get(update.vehicleId) || [];
        const newTrail = [...trail, { lat: update.lat, lng: update.lng }];
        
        if (newTrail.length > MAX_TRAIL_LENGTH) {
          newTrail.shift();
        }
        
        trails.set(update.vehicleId, newTrail);
        
        return { vehicles, vehicleTrails: trails };
      }
      
      return state;
    });
  },

  updateVehicleStatus: (vehicleId, status) => {
    set((state) => {
      const vehicles = new Map(state.vehicles);
      const vehicle = vehicles.get(vehicleId);
      
      if (vehicle) {
        vehicles.set(vehicleId, { ...vehicle, status });
      }
      
      return { vehicles };
    });
  },

  selectVehicle: (vehicleId) => {
    set({ selectedVehicleId: vehicleId });
  },

  setHoveredVehicle: (vehicleId) => {
    set({ hoveredVehicleId: vehicleId });
  },

  addToTrail: (vehicleId, position) => {
    set((state) => {
      const trails = new Map(state.vehicleTrails);
      const trail = trails.get(vehicleId) || [];
      const newTrail = [...trail, position];
      
      if (newTrail.length > MAX_TRAIL_LENGTH) {
        newTrail.shift();
      }
      
      trails.set(vehicleId, newTrail);
      return { vehicleTrails: trails };
    });
  },

  clearTrails: () => {
    set({ vehicleTrails: new Map() });
  },

  getVehicleById: (vehicleId) => {
    return get().vehicles.get(vehicleId);
  },

  getActiveVehicles: () => {
    const vehicles = Array.from(get().vehicles.values());
    return vehicles.filter((v) => v.status === 'active');
  },
}));
