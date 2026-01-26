'use client';

import { useEffect, useState, useCallback } from 'react';
import { connectSocket, disconnectSocket, getSocket, onEvent, offEvent } from '@/lib/socket';
import { useVehicleStore } from '@/stores/vehicleStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useOptimizationStore } from '@/stores/optimizationStore';
import { useRiskStore } from '@/stores/riskStore';
import type {
  VehiclePositionUpdate,
  DashboardMetrics,
  OptimizationProgress,
  OptimizationComplete,
  RiskAlert,
  IoTSensorData,
  Vehicle,
} from '@/types';

export function useSocketConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const { setVehicles, updateVehiclePosition } = useVehicleStore();
  const { updateMetrics, setLastUpdated } = useDashboardStore();
  const { updateProgress, completeOptimization } = useOptimizationStore();
  const { addAlert } = useRiskStore();

  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setConnectionError(null);
    console.log('[Socket] Connected successfully');
  }, []);

  const handleDisconnect = useCallback((reason: string) => {
    setIsConnected(false);
    console.log('[Socket] Disconnected:', reason);
  }, []);

  const handleError = useCallback((error: Error) => {
    setConnectionError(error.message);
    console.error('[Socket] Error:', error);
  }, []);

  // Handle bulk vehicle updates from streaming service
  const handleVehiclesUpdate = useCallback(
    (data: { vehicles: Vehicle[]; timestamp: number }) => {
      if (data.vehicles && Array.isArray(data.vehicles)) {
        setVehicles(data.vehicles);
      }
    },
    [setVehicles]
  );

  const handleVehiclePosition = useCallback(
    (data: VehiclePositionUpdate) => {
      updateVehiclePosition(data);
    },
    [updateVehiclePosition]
  );

  // Handle stats updates from streaming service
  const handleStatsUpdate = useCallback(
    (data: any) => {
      updateMetrics({
        activeVehicles: data.activeVehicles || 0,
        totalVehicles: data.totalVehicles || 25,
        completedDeliveries: data.completedDeliveries || 0,
        totalDeliveries: data.totalDeliveries || 150,
        onTimeRate: data.onTimeRate || 0,
        averageRiskScore: data.fleetRiskScore || data.averageRiskScore || 0,
      });
      setLastUpdated(new Date().toISOString());
    },
    [updateMetrics, setLastUpdated]
  );

  const handleOptimizationProgress = useCallback(
    (data: OptimizationProgress) => {
      updateProgress(data);
    },
    [updateProgress]
  );

  const handleOptimizationComplete = useCallback(
    (data: OptimizationComplete) => {
      completeOptimization(data);
    },
    [completeOptimization]
  );

  const handleRiskAlert = useCallback(
    (data: RiskAlert) => {
      addAlert({
        id: data.id || `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        vehicleId: data.vehicleId,
        riskLevel: data.riskLevel,
        factors: data.factors || [],
        recommendation: data.recommendation,
        timestamp: data.timestamp || new Date().toISOString(),
      });
    },
    [addAlert]
  );

  useEffect(() => {
    const socket = connectSocket();

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);

    // Register event handlers for streaming service events
    onEvent('vehicles:update', handleVehiclesUpdate);
    onEvent('stats:update', handleStatsUpdate);
    onEvent('vehicle:position', handleVehiclePosition);
    onEvent('optimization:progress', handleOptimizationProgress);
    onEvent('optimization:complete', handleOptimizationComplete);
    onEvent('risk:alert', handleRiskAlert);
    onEvent('alert', handleRiskAlert);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);

      offEvent('vehicles:update');
      offEvent('stats:update');
      offEvent('vehicle:position');
      offEvent('optimization:progress');
      offEvent('optimization:complete');
      offEvent('risk:alert');
      offEvent('alert');

      disconnectSocket();
    };
  }, [
    handleConnect,
    handleDisconnect,
    handleError,
    handleVehiclesUpdate,
    handleStatsUpdate,
    handleVehiclePosition,
    handleOptimizationProgress,
    handleOptimizationComplete,
    handleRiskAlert,
  ]);

  return {
    isConnected,
    connectionError,
    socket: getSocket(),
  };
}
