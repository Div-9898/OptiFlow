import { create } from 'zustand';
import { useDashboardStore } from './dashboardStore';
import { useRiskStore } from './riskStore';
import { useOptimizationStore } from './optimizationStore';

// Aggregated metrics for Executive Command Center
export interface ExecutiveMetrics {
  // Operations (from dashboardStore)
  totalVehicles: number;
  activeVehicles: number;
  totalDeliveries: number;
  completedDeliveries: number;
  onTimeRate: number;
  totalDistance: number;
  fuelEfficiency: number;
  vehicleUtilization: number;

  // Risk (from riskStore)
  fleetRiskScore: number;
  activeAlerts: number;
  criticalAlerts: number;
  highRiskVehicles: number;

  // VRP/Optimization (from optimizationStore)
  routeEfficiency: number;
  costSavingsPercent: number;
  costSavingsYTD: number;
  isOptimizing: boolean;

  // Fairness metrics (shared constants matching Bias Audit page)
  demographicParity: number;
  geographicEquity: number;
  temporalFairness: number;
  workloadBalance: number;
  overallFairness: number;

  // Ethics metrics (shared constants matching Ethics Lab page)
  ethicalCompliance: number;
  decisionConsensus: number;
  stakeholdersConsidered: number;
  frameworksApplied: number;

  // Meta
  lastUpdated: string;
}

// Default values that match the other pages
const defaultMetrics: ExecutiveMetrics = {
  // Operations
  totalVehicles: 25,
  activeVehicles: 18,
  totalDeliveries: 156,
  completedDeliveries: 89,
  onTimeRate: 94,
  totalDistance: 1247,
  fuelEfficiency: 87,
  vehicleUtilization: 75,

  // Risk
  fleetRiskScore: 28,
  activeAlerts: 3,
  criticalAlerts: 1,
  highRiskVehicles: 2,

  // VRP
  routeEfficiency: 94,
  costSavingsPercent: 18,
  costSavingsYTD: 287450,
  isOptimizing: false,

  // Fairness (matches Bias Audit page values)
  demographicParity: 92,
  geographicEquity: 78,
  temporalFairness: 88,
  workloadBalance: 85,
  overallFairness: 86,

  // Ethics (matches Ethics Lab page values)
  ethicalCompliance: 94,
  decisionConsensus: 78,
  stakeholdersConsidered: 85,
  frameworksApplied: 4,

  lastUpdated: new Date().toISOString(),
};

interface ExecutiveState {
  metrics: ExecutiveMetrics;
  pendingDecisions: PendingDecision[];
  activityStream: ActivityItem[];
  fleetVehicles: FleetVehicle[];
}

interface ExecutiveActions {
  updateMetrics: (updates: Partial<ExecutiveMetrics>) => void;
  addActivity: (activity: Omit<ActivityItem, 'id' | 'timestamp'>) => void;
  addDecision: (decision: Omit<PendingDecision, 'id'>) => void;
  resolveDecision: (id: string) => void;
  updateFleetVehicles: (vehicles: FleetVehicle[]) => void;
  syncFromStores: () => void;
}

export interface PendingDecision {
  id: string;
  title: string;
  category: 'resource' | 'safety' | 'ethics' | 'fairness';
  urgency: 'immediate' | 'today' | 'this_week';
  description: string;
  options: {
    label: string;
    recommendation?: boolean;
    impact: number;
    risk: number;
  }[];
  stakeholdersAffected: number;
  aiRecommendation: string;
  deadline?: string;
}

export interface ActivityItem {
  id: string;
  timestamp: Date;
  type: 'delivery' | 'alert' | 'optimization' | 'risk' | 'fairness' | 'ethics' | 'vehicle';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface FleetVehicle {
  id: string;
  name: string;
  status: 'delivering' | 'returning' | 'idle' | 'maintenance';
  currentStop: number;
  totalStops: number;
  eta: string;
  driver: string;
  risk: 'low' | 'medium' | 'high';
}

// Initial pending decisions
const initialDecisions: PendingDecision[] = [
  {
    id: '1',
    title: 'Driver Fatigue Override Request',
    category: 'safety',
    urgency: 'immediate',
    description: 'Driver Ahmed K. requests to continue delivery despite fatigue alert. 3 stops remaining.',
    options: [
      { label: 'Approve Override', impact: 60, risk: 75 },
      { label: 'Mandatory Rest', recommendation: true, impact: 85, risk: 15 },
      { label: 'Assign Replacement', impact: 70, risk: 20 }
    ],
    stakeholdersAffected: 4,
    aiRecommendation: 'Recommend mandatory rest based on biometric data showing elevated fatigue markers.',
    deadline: '30 min'
  },
  {
    id: '2',
    title: 'Coverage Gap in Al Quoz',
    category: 'fairness',
    urgency: 'today',
    description: 'Service coverage in Al Quoz has dropped to 72%, below 80% target. Requires resource reallocation.',
    options: [
      { label: 'Reallocate 2 Vehicles', recommendation: true, impact: 88, risk: 25 },
      { label: 'Schedule for Tomorrow', impact: 45, risk: 40 },
      { label: 'Accept Current Level', impact: 30, risk: 60 }
    ],
    stakeholdersAffected: 156,
    aiRecommendation: 'Immediate reallocation will improve equity score by 8% with minimal cost impact.',
    deadline: 'EOD'
  },
  {
    id: '3',
    title: 'Emergency Medical vs Commercial',
    category: 'ethics',
    urgency: 'immediate',
    description: 'Medical supply delivery conflicts with premium commercial delivery. Both time-critical.',
    options: [
      { label: 'Prioritize Medical', recommendation: true, impact: 92, risk: 10 },
      { label: 'Prioritize Commercial', impact: 65, risk: 45 },
      { label: 'Split Resources', impact: 70, risk: 30 }
    ],
    stakeholdersAffected: 12,
    aiRecommendation: 'Medical priority aligned with utilitarian and care ethics frameworks (94% ethical score).',
    deadline: '15 min'
  }
];

// Initial fleet vehicles
const initialFleetVehicles: FleetVehicle[] = [
  { id: 'v1', name: 'Truck Alpha-01', status: 'delivering', currentStop: 4, totalStops: 8, eta: '14:32', driver: 'Ahmed K.', risk: 'low' },
  { id: 'v2', name: 'Van Beta-03', status: 'delivering', currentStop: 6, totalStops: 12, eta: '15:15', driver: 'Sarah M.', risk: 'low' },
  { id: 'v3', name: 'Truck Alpha-02', status: 'returning', currentStop: 8, totalStops: 8, eta: '13:45', driver: 'Raj P.', risk: 'medium' },
  { id: 'v4', name: 'Van Beta-05', status: 'idle', currentStop: 0, totalStops: 0, eta: '-', driver: 'Omar H.', risk: 'low' },
  { id: 'v5', name: 'Truck Gamma-07', status: 'delivering', currentStop: 2, totalStops: 6, eta: '16:00', driver: 'Fatima A.', risk: 'high' },
];

type ExecutiveStore = ExecutiveState & ExecutiveActions;

export const useExecutiveStore = create<ExecutiveStore>((set, get) => ({
  metrics: defaultMetrics,
  pendingDecisions: initialDecisions,
  activityStream: [],
  fleetVehicles: initialFleetVehicles,

  updateMetrics: (updates) => {
    set((state) => ({
      metrics: {
        ...state.metrics,
        ...updates,
        lastUpdated: new Date().toISOString()
      }
    }));
  },

  addActivity: (activity) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
    };
    set((state) => ({
      activityStream: [newActivity, ...state.activityStream].slice(0, 50)
    }));
  },

  addDecision: (decision) => {
    const newDecision: PendingDecision = {
      ...decision,
      id: Math.random().toString(36).substring(7),
    };
    set((state) => ({
      pendingDecisions: [newDecision, ...state.pendingDecisions]
    }));
  },

  resolveDecision: (id) => {
    set((state) => ({
      pendingDecisions: state.pendingDecisions.filter(d => d.id !== id)
    }));
  },

  updateFleetVehicles: (vehicles) => {
    set({ fleetVehicles: vehicles });
  },

  // Sync metrics from other stores - only sync if values are meaningful (non-zero)
  syncFromStores: () => {
    const dashboardMetrics = useDashboardStore.getState().metrics;
    const riskState = useRiskStore.getState();
    const optimizationState = useOptimizationStore.getState();

    const updates: Partial<ExecutiveMetrics> = {};

    // Sync from dashboard store - only if activeVehicles > 0 (indicates real data)
    if (dashboardMetrics.activeVehicles > 0) {
      updates.totalVehicles = dashboardMetrics.totalVehicles;
      updates.activeVehicles = dashboardMetrics.activeVehicles;
      updates.totalDeliveries = dashboardMetrics.totalDeliveries;
      updates.completedDeliveries = dashboardMetrics.completedDeliveries;
      updates.onTimeRate = Math.round(dashboardMetrics.onTimeRate);
      updates.totalDistance = Math.round(dashboardMetrics.totalDistance);
      updates.fuelEfficiency = Math.round(dashboardMetrics.fuelEfficiency);
      updates.vehicleUtilization = dashboardMetrics.totalVehicles > 0
        ? Math.round((dashboardMetrics.activeVehicles / dashboardMetrics.totalVehicles) * 100)
        : 0;
    }

    // Sync from risk store - only if there's actual risk data
    if (riskState.overallFleetRisk > 0) {
      updates.fleetRiskScore = Math.round(riskState.overallFleetRisk * 100);
    }
    if (riskState.activeAlerts.length > 0) {
      updates.activeAlerts = riskState.activeAlerts.length;
      updates.criticalAlerts = riskState.getCriticalAlerts().length;
      updates.highRiskVehicles = riskState.getVehiclesByRiskLevel('high').length +
                                  riskState.getVehiclesByRiskLevel('critical').length;
    }

    // Sync from optimization store - only if there's an active run with data
    if (optimizationState.currentRun && optimizationState.currentRun.savingsPercent && optimizationState.currentRun.savingsPercent > 0) {
      updates.isOptimizing = optimizationState.isOptimizing;
      updates.costSavingsPercent = Math.round(optimizationState.currentRun.savingsPercent);
    }

    if (Object.keys(updates).length > 0) {
      get().updateMetrics(updates);
    }
  }
}));

// Helper hook to get synced metrics
export function useExecutiveMetrics() {
  const metrics = useExecutiveStore((state) => state.metrics);
  const syncFromStores = useExecutiveStore((state) => state.syncFromStores);

  return { metrics, syncFromStores };
}
