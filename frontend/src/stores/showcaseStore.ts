import { create } from 'zustand';

interface DataStreamItem {
  id: string;
  type: 'vehicle' | 'sensor' | 'delivery' | 'alert' | 'optimization' | 'traffic';
  payload: string;
  timestamp: string;
}

interface ShowcaseState {
  // Mode toggles
  isCommandCenterMode: boolean;
  isNightMode: boolean;
  isPartyMode: boolean;
  is3DMode: boolean;
  showDataStream: boolean;
  showDockerStatus: boolean;
  showNeuralNetwork: boolean;
  showTechStack: boolean;

  // Demo mode
  isDemoMode: boolean;
  demoStep: number;

  // Data stream
  dataStream: DataStreamItem[];
  streamThroughput: number;

  // Celebration
  showCelebration: boolean;
  celebrationMessage: string;
}

interface ShowcaseActions {
  toggleCommandCenterMode: () => void;
  toggleNightMode: () => void;
  togglePartyMode: () => void;
  toggle3DMode: () => void;
  toggleDataStream: () => void;
  toggleDockerStatus: () => void;
  toggleNeuralNetwork: () => void;
  toggleTechStack: () => void;

  startDemo: () => void;
  stopDemo: () => void;
  nextDemoStep: () => void;

  addDataStreamItem: (item: Omit<DataStreamItem, 'id' | 'timestamp'>) => void;
  setStreamThroughput: (rate: number) => void;

  triggerCelebration: (message: string) => void;
  hideCelebration: () => void;

  resetAll: () => void;
}

type ShowcaseStore = ShowcaseState & ShowcaseActions;

export const useShowcaseStore = create<ShowcaseStore>((set, get) => ({
  // Initial state
  isCommandCenterMode: false,
  isNightMode: true,
  isPartyMode: false,
  is3DMode: false,
  showDataStream: false,
  showDockerStatus: false,
  showNeuralNetwork: false,
  showTechStack: false,
  isDemoMode: false,
  demoStep: 0,
  dataStream: [],
  streamThroughput: 0,
  showCelebration: false,
  celebrationMessage: '',

  // Actions
  toggleCommandCenterMode: () => set((s) => ({ isCommandCenterMode: !s.isCommandCenterMode })),
  toggleNightMode: () => set((s) => ({ isNightMode: !s.isNightMode })),
  togglePartyMode: () => set((s) => ({ isPartyMode: !s.isPartyMode })),
  toggle3DMode: () => set((s) => ({ is3DMode: !s.is3DMode })),
  toggleDataStream: () => set((s) => ({ showDataStream: !s.showDataStream })),
  toggleDockerStatus: () => set((s) => ({ showDockerStatus: !s.showDockerStatus })),
  toggleNeuralNetwork: () => set((s) => ({ showNeuralNetwork: !s.showNeuralNetwork })),
  toggleTechStack: () => set((s) => ({ showTechStack: !s.showTechStack })),

  startDemo: () => set({ isDemoMode: true, demoStep: 0 }),
  stopDemo: () => set({ isDemoMode: false, demoStep: 0 }),
  nextDemoStep: () => set((s) => ({ demoStep: s.demoStep + 1 })),

  addDataStreamItem: (item) => {
    const newItem: DataStreamItem = {
      ...item,
      id: `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
    };

    set((s) => ({
      dataStream: [...s.dataStream.slice(-100), newItem],
    }));
  },

  setStreamThroughput: (rate) => set({ streamThroughput: rate }),

  triggerCelebration: (message) => {
    set({ showCelebration: true, celebrationMessage: message });
    setTimeout(() => {
      set({ showCelebration: false, celebrationMessage: '' });
    }, 4000);
  },

  hideCelebration: () => set({ showCelebration: false, celebrationMessage: '' }),

  resetAll: () => set({
    isCommandCenterMode: false,
    isNightMode: true,
    isPartyMode: false,
    is3DMode: false,
    showDataStream: false,
    showDockerStatus: false,
    showNeuralNetwork: false,
    showTechStack: false,
    isDemoMode: false,
    demoStep: 0,
    dataStream: [],
    showCelebration: false,
    celebrationMessage: '',
  }),
}));
