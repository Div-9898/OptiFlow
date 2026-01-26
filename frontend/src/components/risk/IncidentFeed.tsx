'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  AlertCircle,
  Wrench,
  Thermometer
} from 'lucide-react';

interface Incident {
  id: string;
  type: 'alert' | 'warning' | 'maintenance' | 'resolved' | 'monitoring';
  severity: 'critical' | 'high' | 'medium' | 'low';
  vehicleId: string;
  message: string;
  timestamp: Date;
  status: 'active' | 'resolved' | 'monitoring';
}

const INCIDENT_CONFIG = {
  alert: { icon: AlertTriangle, color: '#ef4444' },
  warning: { icon: AlertCircle, color: '#f59e0b' },
  maintenance: { icon: Wrench, color: '#3b82f6' },
  resolved: { icon: CheckCircle, color: '#10b981' },
  monitoring: { icon: Clock, color: '#8b5cf6' }
};

const VEHICLE_IDS = ['VH-001', 'VH-002', 'VH-003', 'VH-004', 'VH-005', 'VH-006'];

export default function IncidentFeed() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateIncident = (): Incident => {
      const types: Incident['type'][] = ['alert', 'warning', 'maintenance', 'resolved', 'monitoring'];
      const severities: Incident['severity'][] = ['critical', 'high', 'medium', 'low'];
      const statuses: Incident['status'][] = ['active', 'resolved', 'monitoring'];

      const type = types[Math.floor(Math.random() * types.length)];
      const vehicleId = VEHICLE_IDS[Math.floor(Math.random() * VEHICLE_IDS.length)];

      const messages: Record<Incident['type'], string[]> = {
        alert: [
          `Brake system alert on ${vehicleId}`,
          `Engine overheating on ${vehicleId}`,
          `Critical oil pressure on ${vehicleId}`,
          `Battery failure detected on ${vehicleId}`
        ],
        warning: [
          `Tire pressure low on ${vehicleId}`,
          `Service due on ${vehicleId}`,
          `Fuel efficiency drop on ${vehicleId}`,
          `Coolant level warning on ${vehicleId}`
        ],
        maintenance: [
          `Scheduled maintenance for ${vehicleId}`,
          `Oil change required on ${vehicleId}`,
          `Brake inspection due on ${vehicleId}`,
          `Filter replacement on ${vehicleId}`
        ],
        resolved: [
          `Issue resolved on ${vehicleId}`,
          `Alert cleared for ${vehicleId}`,
          `Maintenance completed on ${vehicleId}`,
          `${vehicleId} back to normal operation`
        ],
        monitoring: [
          `Monitoring ${vehicleId} performance`,
          `Tracking ${vehicleId} metrics`,
          `Observing ${vehicleId} behavior`,
          `Recording ${vehicleId} data`
        ]
      };

      return {
        id: `incident-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        severity: severities[Math.floor(Math.random() * severities.length)],
        vehicleId,
        message: messages[type][Math.floor(Math.random() * messages[type].length)],
        timestamp: new Date(),
        status: type === 'resolved' ? 'resolved' : type === 'monitoring' ? 'monitoring' : statuses[Math.floor(Math.random() * 2)]
      };
    };

    // Initial incidents
    const initialIncidents = Array.from({ length: 5 }, () => {
      const incident = generateIncident();
      incident.timestamp = new Date(Date.now() - Math.random() * 3600000);
      return incident;
    }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setIncidents(initialIncidents);

    // Add new incidents
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        setIncidents(prev => [generateIncident(), ...prev].slice(0, 20));
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [incidents[0]?.id]);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSeverityColor = (severity: Incident['severity']) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#3b82f6';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-dark rounded-xl p-4 h-[300px] flex flex-col"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          Incident Feed
        </h3>
        <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
          {incidents.filter(i => i.status === 'active').length} active
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence mode="popLayout">
          {incidents.map((incident) => {
            const config = INCIDENT_CONFIG[incident.type];
            const Icon = config.icon;
            const severityColor = getSeverityColor(incident.severity);

            return (
              <motion.div
                key={incident.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                className="p-2 rounded-lg bg-dark-700"
                style={{
                  borderLeft: `3px solid ${config.color}`
                }}
              >
                <div className="flex items-start gap-2">
                  <Icon
                    className="w-4 h-4 mt-0.5 shrink-0"
                    style={{ color: config.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                        style={{ backgroundColor: `${severityColor}20`, color: severityColor }}
                      >
                        {incident.severity}
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {incident.vehicleId}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-300 leading-tight">
                      {incident.message}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[9px] text-gray-500">
                        {formatTime(incident.timestamp)}
                      </span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded capitalize"
                        style={{
                          backgroundColor: incident.status === 'resolved' ? 'rgba(16, 185, 129, 0.2)' :
                                          incident.status === 'monitoring' ? 'rgba(139, 92, 246, 0.2)' :
                                          'rgba(239, 68, 68, 0.2)',
                          color: incident.status === 'resolved' ? '#10b981' :
                                 incident.status === 'monitoring' ? '#8b5cf6' :
                                 '#ef4444'
                        }}
                      >
                        {incident.status}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
