'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { useDashboardStore, ModuleType } from '@/stores/dashboardStore';

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const { isConnected } = useSocketConnection();
  const { activeModule, setActiveModule } = useDashboardStore();

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      {/* Sidebar Navigation */}
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <TopBar isConnected={isConnected} />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
