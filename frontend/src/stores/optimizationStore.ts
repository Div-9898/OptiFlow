import { create } from 'zustand';
import { 
  OptimizationRun, 
  OptimizationProgress, 
  OptimizationComplete,
  OptimizedRoute 
} from '@/types';

interface OptimizationState {
  currentRun: OptimizationRun | null;
  runHistory: OptimizationRun[];
  progressHistory: OptimizationProgress[];
  isOptimizing: boolean;
  selectedAlgorithm: 'ortools' | 'genetic' | 'simulated_annealing';
}

interface OptimizationActions {
  startOptimization: (runId: string, algorithm: string) => void;
  updateProgress: (progress: OptimizationProgress) => void;
  completeOptimization: (result: OptimizationComplete) => void;
  cancelOptimization: () => void;
  setAlgorithm: (algorithm: 'ortools' | 'genetic' | 'simulated_annealing') => void;
  clearHistory: () => void;
  getProgressData: () => { iteration: number; currentCost: number; bestCost: number; temperature?: number }[];
}

type OptimizationStore = OptimizationState & OptimizationActions;

export const useOptimizationStore = create<OptimizationStore>((set, get) => ({
  currentRun: null,
  runHistory: [],
  progressHistory: [],
  isOptimizing: false,
  selectedAlgorithm: 'ortools',

  startOptimization: (runId, algorithm) => {
    const newRun: OptimizationRun = {
      id: runId,
      status: 'running',
      algorithm,
      iteration: 0,
      currentCost: 0,
      bestCost: Infinity,
      routes: [],
      startTime: new Date().toISOString(),
    };
    
    set({
      currentRun: newRun,
      isOptimizing: true,
      progressHistory: [],
    });
  },

  updateProgress: (progress) => {
    set((state) => {
      if (!state.currentRun || state.currentRun.id !== progress.runId) {
        return state;
      }

      const updatedRun: OptimizationRun = {
        ...state.currentRun,
        iteration: progress.iteration,
        currentCost: progress.currentCost,
        bestCost: progress.bestCost,
        temperature: progress.temperature,
        routes: progress.currentRoutes,
      };

      return {
        currentRun: updatedRun,
        progressHistory: [...state.progressHistory, progress],
      };
    });
  },

  completeOptimization: (result) => {
    set((state) => {
      if (!state.currentRun || state.currentRun.id !== result.runId) {
        return state;
      }

      const completedRun: OptimizationRun = {
        ...state.currentRun,
        status: 'completed',
        routes: result.routes,
        savingsPercent: result.savingsPercent,
        endTime: new Date().toISOString(),
      };

      return {
        currentRun: completedRun,
        runHistory: [...state.runHistory, completedRun],
        isOptimizing: false,
      };
    });
  },

  cancelOptimization: () => {
    set((state) => {
      if (!state.currentRun) return state;

      const cancelledRun: OptimizationRun = {
        ...state.currentRun,
        status: 'failed',
        endTime: new Date().toISOString(),
      };

      return {
        currentRun: cancelledRun,
        runHistory: [...state.runHistory, cancelledRun],
        isOptimizing: false,
      };
    });
  },

  setAlgorithm: (algorithm) => {
    set({ selectedAlgorithm: algorithm });
  },

  clearHistory: () => {
    set({ runHistory: [], progressHistory: [] });
  },

  getProgressData: () => {
    return get().progressHistory.map((p) => ({
      iteration: p.iteration,
      currentCost: p.currentCost,
      bestCost: p.bestCost,
      temperature: p.temperature,
    }));
  },
}));
