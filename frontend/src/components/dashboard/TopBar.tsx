'use client';

import { motion } from 'framer-motion';
import { 
  Bell, 
  Moon, 
  Sun, 
  Wifi, 
  WifiOff,
  Search,
  Settings,
  User,
} from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';

interface TopBarProps {
  isConnected: boolean;
}

export default function TopBar({ isConnected }: TopBarProps) {
  const { isDarkMode, toggleDarkMode, lastUpdated } = useDashboardStore();

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-dark-800/50 backdrop-blur-sm border-b border-dark-600">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles, deliveries..."
            className="w-64 pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-accent-cyan transition-colors"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
            isConnected
              ? 'bg-green-500/10 text-green-400'
              : 'bg-red-500/10 text-red-400'
          )}
        >
          {isConnected ? (
            <>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Wifi className="w-3.5 h-3.5" />
              </motion.div>
              <span>Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <span className="text-xs text-gray-400">
            Updated {formatRelativeTime(lastUpdated)}
          </span>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-cyan rounded-full" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Settings */}
        <button className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-3 pl-4 border-l border-dark-600">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan to-accent-purple flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-white">Operator</p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
