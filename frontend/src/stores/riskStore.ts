import { create } from 'zustand';
import { RiskScore, RiskAlert, RiskLevel, WeatherData, TrafficData } from '@/types';

interface RiskState {
  vehicleRisks: Map<string, RiskScore>;
  activeAlerts: RiskAlert[];
  weatherData: WeatherData | null;
  trafficData: Map<string, TrafficData>;
  overallFleetRisk: number;
  riskThresholds: {
    low: number;
    medium: number;
    high: number;
  };
}

interface RiskActions {
  updateVehicleRisk: (risk: RiskScore) => void;
  addAlert: (alert: RiskAlert) => void;
  dismissAlert: (alertId: string) => void;
  updateWeather: (weather: WeatherData) => void;
  updateTraffic: (traffic: TrafficData) => void;
  calculateFleetRisk: () => void;
  getVehiclesByRiskLevel: (level: RiskLevel) => string[];
  getCriticalAlerts: () => RiskAlert[];
}

type RiskStore = RiskState & RiskActions;

export const useRiskStore = create<RiskStore>((set, get) => ({
  vehicleRisks: new Map(),
  activeAlerts: [],
  weatherData: null,
  trafficData: new Map(),
  overallFleetRisk: 0,
  riskThresholds: {
    low: 0.3,
    medium: 0.6,
    high: 0.8,
  },

  updateVehicleRisk: (risk) => {
    set((state) => {
      const risks = new Map(state.vehicleRisks);
      risks.set(risk.vehicleId, risk);
      return { vehicleRisks: risks };
    });
    get().calculateFleetRisk();
  },

  addAlert: (alert) => {
    set((state) => ({
      activeAlerts: [alert, ...state.activeAlerts].slice(0, 50),
    }));
  },

  dismissAlert: (alertId) => {
    set((state) => ({
      activeAlerts: state.activeAlerts.filter((a) => a.id !== alertId),
    }));
  },

  updateWeather: (weather) => {
    set({ weatherData: weather });
  },

  updateTraffic: (traffic) => {
    set((state) => {
      const trafficData = new Map(state.trafficData);
      trafficData.set(traffic.zoneId, traffic);
      return { trafficData };
    });
  },

  calculateFleetRisk: () => {
    const risks = Array.from(get().vehicleRisks.values());
    if (risks.length === 0) {
      set({ overallFleetRisk: 0 });
      return;
    }
    
    const avgRisk = risks.reduce((sum, r) => sum + r.overall, 0) / risks.length;
    set({ overallFleetRisk: Math.round(avgRisk * 100) / 100 });
  },

  getVehiclesByRiskLevel: (level) => {
    const { vehicleRisks } = get();
    return Array.from(vehicleRisks.entries())
      .filter(([_, risk]) => risk.level === level)
      .map(([id]) => id);
  },

  getCriticalAlerts: () => {
    return get().activeAlerts.filter(
      (a) => a.riskLevel === 'critical' || a.riskLevel === 'high'
    );
  },
}));
