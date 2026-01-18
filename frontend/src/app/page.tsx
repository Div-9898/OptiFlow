'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import MapContainer from '@/components/map/MapContainer';
import MetricsPanel from '@/components/dashboard/MetricsPanel';
import VehicleList from '@/components/dashboard/VehicleList';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { useVehicleStore } from '@/stores/vehicleStore';
import { useDashboardStore } from '@/stores/dashboardStore';

export default function Dashboard() {
  const { isConnected } = useSocketConnection();
  const { activeModule, setActiveModule } = useDashboardStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      {/* Sidebar Navigation */}
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar isConnected={isConnected} />

        {/* Dashboard Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: isLoaded ? 1 : 0, scale: isLoaded ? 1 : 0.98 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex-1 relative"
          >
            <MapContainer />
            
            {/* Floating Metrics Panel */}
            <div className="absolute top-4 left-4 z-10">
              <MetricsPanel />
            </div>
          </motion.div>

          {/* Right Panel - Vehicle List */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-80 border-l border-dark-600 bg-dark-800/50 backdrop-blur-sm overflow-hidden flex flex-col"
          >
            <VehicleList />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
