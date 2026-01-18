'use client';

import { motion } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Route,
  AlertTriangle,
  MessageSquare,
  Scale,
  Brain,
  Network,
  FileText,
  ChevronLeft,
  ChevronRight,
  Truck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardStore, ModuleType } from '@/stores/dashboardStore';

interface SidebarProps {
  activeModule?: ModuleType;
  onModuleChange?: (module: ModuleType) => void;
}

const modules = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/' },
  { id: 'vrp-arena', label: 'VRP Arena', icon: Route, path: '/vrp-arena' },
  { id: 'risk-center', label: 'Risk Center', icon: AlertTriangle, path: '/risk-center' },
  { id: 'communication', label: 'Communication', icon: MessageSquare, path: '/communication' },
  { id: 'bias-audit', label: 'Bias Audit', icon: Scale, path: '/bias-audit' },
  { id: 'ethics', label: 'Ethics Lab', icon: Brain, path: '/ethics' },
  { id: 'stakeholders', label: 'Stakeholders', icon: Network, path: '/stakeholders' },
  { id: 'policy', label: 'Policy Gen', icon: FileText, path: '/policy' },
] as const;

export default function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  const { isSidebarCollapsed, toggleSidebar } = useDashboardStore();
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarCollapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative flex flex-col bg-dark-800 border-r border-dark-600 z-20"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-dark-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-magenta flex items-center justify-center">
            <Truck className="w-6 h-6 text-white" />
          </div>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="text-sm font-bold text-white">Logistics AI</span>
              <span className="text-xs text-gray-400">Platform</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {modules.map((module) => {
            const Icon = module.icon;
            const isActive = pathname === module.path || (pathname === '/' && module.id === 'overview');

            return (
              <li key={module.id}>
                <Link
                  href={module.path}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    'hover:bg-dark-600',
                    isActive && 'bg-dark-600 text-accent-cyan',
                    !isActive && 'text-gray-400 hover:text-white'
                  )}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-4 bg-accent-cyan rounded-r-full"
                      />
                    )}
                  </div>
                  {!isSidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {module.label}
                    </motion.span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Button */}
      <div className="p-2 border-t border-dark-600">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-600 transition-colors"
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
