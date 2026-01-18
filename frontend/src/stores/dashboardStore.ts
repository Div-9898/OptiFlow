import { create } from 'zustand';
import { DashboardMetrics } from '@/types';

export type ModuleType = 
  | 'overview'
  | 'vrp-arena'
  | 'risk-center'
  | 'communication'
  | 'bias-audit'
  | 'ethics'
  | 'stakeholders'
  | 'policy';

interface DashboardState {
  activeModule: ModuleType;
  isDarkMode: boolean;
  isSidebarCollapsed: boolean;
  metrics: DashboardMetrics;
  isLoading: boolean;
  lastUpdated: string | null;
}

interface DashboardActions {
  setActiveModule: (module: ModuleType) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  updateMetrics: (metrics: Partial<DashboardMetrics>) => void;
  setLoading: (loading: boolean) => void;
  setLastUpdated: (timestamp: string) => void;
}

type DashboardStore = DashboardState & DashboardActions;

const initialMetrics: DashboardMetrics = {
  totalVehicles: 25,
  activeVehicles: 0,
  totalDeliveries: 150,
  completedDeliveries: 0,
  onTimeRate: 0,
  averageRiskScore: 0,
  totalDistance: 0,
  fuelEfficiency: 0,
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  activeModule: 'overview',
  isDarkMode: true,
  isSidebarCollapsed: false,
  metrics: initialMetrics,
  isLoading: true,
  lastUpdated: null,

  setActiveModule: (module) => set({ activeModule: module }),
  
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  
  updateMetrics: (newMetrics) =>
    set((state) => ({
      metrics: { ...state.metrics, ...newMetrics },
      lastUpdated: new Date().toISOString(),
    })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
}));
