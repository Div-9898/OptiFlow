'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Thermometer, 
  Target,
  MapPin,
  Truck,
  Clock,
  TrendingDown,
  Download,
  Plus,
  Trash2,
  Settings,
  Swords,
  Dna,
  Flame,
  Cpu
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useOptimizationStore } from '@/stores/optimizationStore';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { cn } from '@/lib/utils';
import PageLayout from '@/components/dashboard/PageLayout';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Types
interface DeliveryPoint {
  id: string;
  lat: number;
  lng: number;
  name?: string;
}

interface RouteData {
  vehicle_id: string;
  stops: { lat: number; lng: number; id: string }[];
  distance: number;
  num_stops: number;
  color: string;
}

interface AlgorithmParams {
  timeLimit: number;
  numVehicles: number;
  populationSize: number;
  mutationRate: number;
  initialTemp: number;
  coolingRate: number;
}

const DUBAI_CENTER = { lat: 25.2048, lng: 55.2708 };

export default function VRPArenaPage() {
  const { 
    currentRun, 
    isOptimizing, 
    progressHistory,
    selectedAlgorithm,
    setAlgorithm,
    startOptimization,
    updateProgress,
    completeOptimization
  } = useOptimizationStore();
  
  const { isConnected, socket } = useSocketConnection();
  
  // State
  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([]);
  const [optimizedRoutes, setOptimizedRoutes] = useState<RouteData[]>([]);
  const [showParams, setShowParams] = useState(false);
  const [battleMode, setBattleMode] = useState(false);
  const [battleResults, setBattleResults] = useState<Record<string, any>>({});
  const [showNaiveRoutes, setShowNaiveRoutes] = useState(true);
  
  const [params, setParams] = useState<AlgorithmParams>({
    timeLimit: 15,
    numVehicles: 5,
    populationSize: 50,
    mutationRate: 0.1,
    initialTemp: 10000,
    coolingRate: 0.995
  });
  
  // Map refs
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const routeLayersRef = useRef<string[]>([]);
  const naiveRouteLayersRef = useRef<string[]>([]);
  const isOptimizingRef = useRef(isOptimizing);
  
  // Keep ref in sync with state
  useEffect(() => {
    isOptimizingRef.current = isOptimizing;
  }, [isOptimizing]);
  
  // Algorithms config
  const algorithms = [
    { 
      id: 'ortools', 
      name: 'OR-Tools', 
      description: 'Google\'s industrial solver',
      icon: Cpu,
      color: '#00f5ff'
    },
    { 
      id: 'genetic', 
      name: 'Genetic Algorithm', 
      description: 'Evolution-based optimization',
      icon: Dna,
      color: '#39ff14'
    },
    { 
      id: 'simulated_annealing', 
      name: 'Simulated Annealing', 
      description: 'Temperature-based search',
      icon: Flame,
      color: '#ff6b6b'
    },
  ];

  // Generate random delivery points
  const generateRandomPoints = useCallback((count: number = 20) => {
    const points: DeliveryPoint[] = [];
    for (let i = 0; i < count; i++) {
      points.push({
        id: `delivery_${i}`,
        lat: DUBAI_CENTER.lat + (Math.random() - 0.5) * 0.15,
        lng: DUBAI_CENTER.lng + (Math.random() - 0.5) * 0.2,
        name: `Delivery ${i + 1}`
      });
    }
    setDeliveryPoints(points);
    setOptimizedRoutes([]);
    setShowNaiveRoutes(true);  // Reset to show naive routes for new points
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [DUBAI_CENTER.lng, DUBAI_CENTER.lat],
      zoom: 11,
      pitch: 45
    });
    
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Click to add delivery point - use ref to check optimization state
    map.current.on('click', (e) => {
      if (isOptimizingRef.current) return; // Don't add points during optimization
      
      const newPoint: DeliveryPoint = {
        id: `delivery_${Date.now()}`,
        lat: e.lngLat.lat,
        lng: e.lngLat.lng,
        name: `Custom Point`
      };
      setDeliveryPoints(prev => [...prev, newPoint]);
    });
    
    // Generate initial points
    generateRandomPoints(20);
    
    return () => {
      map.current?.remove();
      map.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when delivery points change
  useEffect(() => {
    if (!map.current) return;
    
    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    
    // Add depot marker
    const depotEl = document.createElement('div');
    depotEl.className = 'depot-marker';
    depotEl.innerHTML = `<div style="width: 24px; height: 24px; background: #00f5ff; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px #00f5ff;"></div>`;
    
    const depotMarker = new mapboxgl.Marker({ element: depotEl })
      .setLngLat([DUBAI_CENTER.lng, DUBAI_CENTER.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<strong>Depot</strong>'))
      .addTo(map.current);
    markersRef.current.push(depotMarker);
    
    // Add delivery point markers (white/light color that routes will pass through)
    deliveryPoints.forEach((point, idx) => {
      const el = document.createElement('div');
      el.innerHTML = `<div style="width: 12px; height: 12px; background: #ffffff; border-radius: 50%; border: 3px solid #1f2937; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.4);"></div>`;
      
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([point.lng, point.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`<strong>${point.name || `Point ${idx + 1}`}</strong>`))
        .addTo(map.current!);
      
      markersRef.current.push(marker);
    });
  }, [deliveryPoints]);

  // Generate naive routes (simple round-robin assignment to vehicles)
  const generateNaiveRoutes = useCallback(() => {
    if (deliveryPoints.length === 0) return [];
    
    const numVehicles = params.numVehicles;
    const naiveRoutes: RouteData[] = [];
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9d4edd'];
    
    // Simple round-robin assignment
    const pointsPerVehicle = Math.ceil(deliveryPoints.length / numVehicles);
    
    for (let v = 0; v < numVehicles; v++) {
      const startIdx = v * pointsPerVehicle;
      const endIdx = Math.min(startIdx + pointsPerVehicle, deliveryPoints.length);
      const vehiclePoints = deliveryPoints.slice(startIdx, endIdx);
      
      if (vehiclePoints.length === 0) continue;
      
      // Create route: depot -> points in order -> depot
      const stops = [
        { lat: DUBAI_CENTER.lat, lng: DUBAI_CENTER.lng, id: 'depot' },
        ...vehiclePoints.map(p => ({ lat: p.lat, lng: p.lng, id: p.id })),
        { lat: DUBAI_CENTER.lat, lng: DUBAI_CENTER.lng, id: 'depot' }
      ];
      
      naiveRoutes.push({
        vehicle_id: `vehicle_${v}`,
        stops,
        distance: 0, // Not calculated for naive
        num_stops: vehiclePoints.length,
        color: colors[v % colors.length]
      });
    }
    
    return naiveRoutes;
  }, [deliveryPoints, params.numVehicles]);

  // Draw naive routes (before optimization)
  useEffect(() => {
    if (!map.current) return;
    
    const drawNaiveRoutes = () => {
      if (!map.current) return;
      
      // Remove existing naive route layers
      naiveRouteLayersRef.current.forEach(layerId => {
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
        if (map.current?.getSource(layerId)) {
          map.current.removeSource(layerId);
        }
      });
      naiveRouteLayersRef.current = [];
      
      // Only show naive routes if no optimized routes and showNaiveRoutes is true
      if (optimizedRoutes.length > 0 || !showNaiveRoutes || deliveryPoints.length === 0) return;
      
      const naiveRoutes = generateNaiveRoutes();
      
      naiveRoutes.forEach((route, idx) => {
        const coordinates = route.stops.map(stop => [stop.lng, stop.lat]);
        
        if (coordinates.length < 2) return;
        
        const layerId = `naive-route-${idx}`;
        
        try {
          map.current!.addSource(layerId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates
              }
            }
          });
          
          map.current!.addLayer({
            id: layerId,
            type: 'line',
            source: layerId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': route.color,
              'line-width': 2,
              'line-opacity': 0.4,
              'line-dasharray': [4, 4] // Dashed line to indicate unoptimized
            }
          });
          
          naiveRouteLayersRef.current.push(layerId);
        } catch (error) {
          console.warn('Error adding naive route layer:', error);
        }
      });
    };
    
    // Wait for map style to be loaded
    if (map.current.isStyleLoaded()) {
      drawNaiveRoutes();
    } else {
      map.current.once('style.load', drawNaiveRoutes);
    }
  }, [deliveryPoints, optimizedRoutes, showNaiveRoutes, generateNaiveRoutes]);

  // Draw optimized routes on map
  useEffect(() => {
    if (!map.current || optimizedRoutes.length === 0) return;
    
    const drawRoutes = () => {
      if (!map.current) return;
      
      // Remove existing naive route layers (optimized routes replace them)
      naiveRouteLayersRef.current.forEach(layerId => {
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
        if (map.current?.getSource(layerId)) {
          map.current.removeSource(layerId);
        }
      });
      naiveRouteLayersRef.current = [];
      
      // Remove existing route layers
      routeLayersRef.current.forEach(layerId => {
        if (map.current?.getLayer(layerId)) {
          map.current.removeLayer(layerId);
        }
        if (map.current?.getSource(layerId)) {
          map.current.removeSource(layerId);
        }
      });
      routeLayersRef.current = [];
      
      // Draw new routes - lines pass directly through delivery markers
      optimizedRoutes.forEach((route, idx) => {
        const coordinates = route.stops.map(stop => [stop.lng, stop.lat]);
        
        if (coordinates.length < 2) return;
        
        const lineLayerId = `route-${idx}`;
        const outlineLayerId = `route-outline-${idx}`;
        
        try {
          // Add route source
          map.current!.addSource(lineLayerId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates
              }
            }
          });
          
          // Add dark outline first (for contrast/visibility)
          map.current!.addLayer({
            id: outlineLayerId,
            type: 'line',
            source: lineLayerId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#1a1a2e',
              'line-width': 8,
              'line-opacity': 0.7
            }
          });
          
          // Add main colored route line (thicker for visibility)
          map.current!.addLayer({
            id: lineLayerId,
            type: 'line',
            source: lineLayerId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': route.color,
              'line-width': 5,
              'line-opacity': 1
            }
          });
          
          routeLayersRef.current.push(outlineLayerId);
          routeLayersRef.current.push(lineLayerId);
        } catch (error) {
          console.warn('Error adding route layer:', error);
        }
      });
    };
    
    // Wait for map style to be loaded
    if (map.current.isStyleLoaded()) {
      drawRoutes();
    } else {
      map.current.once('style.load', drawRoutes);
    }
  }, [optimizedRoutes]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;
    
    socket.on('optimization:progress', (data: any) => {
      updateProgress({
        runId: data.runId,
        iteration: data.iteration,
        currentCost: data.currentCost,
        bestCost: data.bestCost,
        temperature: data.temperature,
        currentRoutes: data.currentRoutes || []
      });
    });
    
    socket.on('optimization:complete', (data: any) => {
      console.log('Optimization complete - raw data:', JSON.stringify(data, null, 2));
      
      completeOptimization({
        runId: data.runId,
        routes: data.routes,
        savingsPercent: data.savingsPercent,
        totalIterations: data.totalIterations
      });
      
      // Update routes on map - ensure we have valid routes
      const routes = data.routes;
      console.log('Routes from backend:', routes);
      console.log('Routes type:', typeof routes, Array.isArray(routes));
      
      if (routes && Array.isArray(routes) && routes.length > 0) {
        console.log('Setting optimized routes:', routes.length, 'routes');
        console.log('First route structure:', JSON.stringify(routes[0], null, 2));
        setOptimizedRoutes(routes);
        // Hide naive routes by explicitly triggering a re-render
        setShowNaiveRoutes(false);
      } else {
        console.warn('No valid routes received!', routes);
      }
      
      // Update battle results if in battle mode
      if (battleMode && data.algorithm) {
        setBattleResults(prev => ({
          ...prev,
          [data.algorithm]: {
            cost: data.routes?.reduce((sum: number, r: any) => sum + r.distance, 0) || 0,
            savings: data.savingsPercent,
            iterations: data.totalIterations,
            routes: data.routes
          }
        }));
      }
    });
    
    return () => {
      socket.off('optimization:progress');
      socket.off('optimization:complete');
    };
  }, [socket, updateProgress, completeOptimization, battleMode]);

  // Start optimization
  const handleStartOptimization = async (algorithm?: string) => {
    const algoToUse = algorithm || selectedAlgorithm;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${apiUrl}/api/v1/optimization/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          delivery_locations: deliveryPoints.map(p => ({
            id: p.id,
            lat: p.lat,
            lng: p.lng
          })),
          num_vehicles: params.numVehicles,
          depot_location: { lat: DUBAI_CENTER.lat, lng: DUBAI_CENTER.lng },
          algorithm: algoToUse,
          time_limit_seconds: params.timeLimit,
          population_size: params.populationSize,
          mutation_rate: params.mutationRate,
          initial_temp: params.initialTemp,
          cooling_rate: params.coolingRate
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        startOptimization(data.run_id, algoToUse);
      } else {
        console.error('Optimization start failed:', await response.text());
      }
    } catch (error) {
      console.error('Optimization API error:', error);
    }
  };

  // Battle mode - run all algorithms
  const handleBattleMode = async () => {
    setBattleMode(true);
    setBattleResults({});
    
    for (const algo of algorithms) {
      await handleStartOptimization(algo.id);
      await new Promise(r => setTimeout(r, (params.timeLimit + 2) * 1000));
    }
    
    setBattleMode(false);
  };

  // Export routes
  const handleExportRoutes = () => {
    const exportData = {
      depot: DUBAI_CENTER,
      deliveryPoints,
      routes: optimizedRoutes,
      algorithm: selectedAlgorithm,
      metrics: currentRun ? {
        totalDistance: optimizedRoutes.reduce((sum, r) => sum + r.distance, 0),
        vehiclesUsed: optimizedRoutes.length,
        savings: currentRun.savingsPercent
      } : null,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `routes_${selectedAlgorithm}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Chart data
  const progressData = progressHistory.map((p, i) => ({
    iteration: i,
    currentCost: p.currentCost / 1000,
    bestCost: p.bestCost / 1000,
    temperature: p.temperature,
  }));

  // Metrics calculations
  const totalDistance = optimizedRoutes.reduce((sum, r) => sum + r.distance, 0);
  const totalStops = optimizedRoutes.reduce((sum, r) => sum + r.num_stops, 0);
  const avgDistPerVehicle = optimizedRoutes.length > 0 ? totalDistance / optimizedRoutes.length : 0;
  const estimatedTime = (totalDistance / 1000) / 40 * 60; // Assuming 40km/h average

  // Debug: Log metrics when optimizedRoutes change
  useEffect(() => {
    console.log('optimizedRoutes state updated:', optimizedRoutes.length, 'routes, totalDistance:', totalDistance);
  }, [optimizedRoutes, totalDistance]);

  return (
    <PageLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col bg-dark-900 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-dark-600">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Algorithm <span className="text-accent-cyan">Arena</span>
              </h1>
              <p className="text-sm text-gray-400">
                Real-time VRP optimization with route visualization
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Battle Mode */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBattleMode}
                disabled={isOptimizing || deliveryPoints.length === 0}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all',
                  'bg-gradient-to-r from-orange-500 to-red-500 text-white',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <Swords className="w-4 h-4" />
                Battle Mode
              </motion.button>
              
              {/* Export */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportRoutes}
                disabled={optimizedRoutes.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-600 text-gray-300 hover:text-white disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export
              </motion.button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Controls */}
          <div className="w-80 border-r border-dark-600 flex flex-col overflow-y-auto">
            {/* Algorithm Selection */}
            <div className="p-4 border-b border-dark-600">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-accent-cyan" />
                Algorithm
              </h3>
              <div className="space-y-2">
                {algorithms.map((algo) => {
                  const Icon = algo.icon;
                  return (
                    <button
                      key={algo.id}
                      onClick={() => setAlgorithm(algo.id as any)}
                      disabled={isOptimizing}
                      className={cn(
                        'w-full p-3 rounded-lg text-left transition-all',
                        selectedAlgorithm === algo.id
                          ? 'bg-dark-600 border border-accent-cyan'
                          : 'bg-dark-700 border border-transparent hover:bg-dark-600',
                        isOptimizing && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" style={{ color: algo.color }} />
                        <div>
                          <p className="font-medium text-white text-sm">{algo.name}</p>
                          <p className="text-xs text-gray-400">{algo.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parameters */}
            <div className="p-4 border-b border-dark-600">
              <button
                onClick={() => setShowParams(!showParams)}
                className="w-full flex items-center justify-between text-sm font-semibold text-white mb-3"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-400" />
                  Parameters
                </span>
                <span className="text-xs text-gray-400">{showParams ? '▼' : '▶'}</span>
              </button>
              
              <AnimatePresence>
                {showParams && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    <div>
                      <label className="text-xs text-gray-400">Time Limit (sec)</label>
                      <input
                        type="number"
                        value={params.timeLimit}
                        onChange={(e) => setParams(p => ({ ...p, timeLimit: +e.target.value }))}
                        className="w-full mt-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400">Vehicles</label>
                      <input
                        type="number"
                        value={params.numVehicles}
                        onChange={(e) => setParams(p => ({ ...p, numVehicles: +e.target.value }))}
                        className="w-full mt-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
                      />
                    </div>
                    
                    {selectedAlgorithm === 'genetic' && (
                      <>
                        <div>
                          <label className="text-xs text-gray-400">Population Size</label>
                          <input
                            type="number"
                            value={params.populationSize}
                            onChange={(e) => setParams(p => ({ ...p, populationSize: +e.target.value }))}
                            className="w-full mt-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Mutation Rate</label>
                          <input
                            type="number"
                            step="0.01"
                            value={params.mutationRate}
                            onChange={(e) => setParams(p => ({ ...p, mutationRate: +e.target.value }))}
                            className="w-full mt-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
                          />
                        </div>
                      </>
                    )}
                    
                    {selectedAlgorithm === 'simulated_annealing' && (
                      <>
                        <div>
                          <label className="text-xs text-gray-400">Initial Temperature</label>
                          <input
                            type="number"
                            value={params.initialTemp}
                            onChange={(e) => setParams(p => ({ ...p, initialTemp: +e.target.value }))}
                            className="w-full mt-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-400">Cooling Rate</label>
                          <input
                            type="number"
                            step="0.001"
                            value={params.coolingRate}
                            onChange={(e) => setParams(p => ({ ...p, coolingRate: +e.target.value }))}
                            className="w-full mt-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm"
                          />
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Delivery Points */}
            <div className="p-4 border-b border-dark-600">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  Deliveries ({deliveryPoints.length})
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateRandomPoints(20)}
                    className="p-1.5 rounded bg-dark-600 text-gray-400 hover:text-white"
                    title="Generate random points"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeliveryPoints([])}
                    className="p-1.5 rounded bg-dark-600 text-gray-400 hover:text-red-400"
                    title="Clear all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-2">Click on map to add points</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {deliveryPoints.slice(0, 10).map((point, idx) => (
                  <div key={point.id} className="flex items-center justify-between text-xs py-1 px-2 bg-dark-700 rounded">
                    <span className="text-gray-300">{point.name || `Point ${idx + 1}`}</span>
                    <button
                      onClick={() => setDeliveryPoints(prev => prev.filter(p => p.id !== point.id))}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {deliveryPoints.length > 10 && (
                  <p className="text-xs text-gray-500 text-center">+{deliveryPoints.length - 10} more</p>
                )}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="p-4 border-b border-dark-600">
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStartOptimization()}
                  disabled={isOptimizing || !isConnected || deliveryPoints.length === 0}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all',
                    isOptimizing
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-accent-cyan text-dark-900 hover:shadow-lg hover:shadow-accent-cyan/25'
                  )}
                >
                  {isOptimizing ? (
                    <>
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Zap className="w-5 h-5" />
                      </motion.div>
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Optimize
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Real-time Stats */}
            {currentRun && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Live Progress
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-dark-700 rounded-lg">
                    <p className="text-xs text-gray-400">Iteration</p>
                    <p className="text-lg font-bold text-white">{currentRun.iteration}</p>
                  </div>
                  <div className="p-3 bg-dark-700 rounded-lg">
                    <p className="text-xs text-gray-400">Best Cost</p>
                    <p className="text-lg font-bold text-accent-lime">
                      {(currentRun.bestCost / 1000).toFixed(1)}km
                    </p>
                  </div>
                </div>
                
                {/* Temperature gauge for SA */}
                {selectedAlgorithm === 'simulated_annealing' && currentRun.temperature !== undefined && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Thermometer className="w-4 h-4 text-orange-400" />
                      <span className="text-xs text-gray-400">Temperature</span>
                    </div>
                    <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: 'linear-gradient(90deg, #3b82f6, #f59e0b, #ef4444)',
                        }}
                        animate={{ width: `${(currentRun.temperature || 0) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {/* Diversity for GA */}
                {selectedAlgorithm === 'genetic' && currentRun.temperature !== undefined && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Dna className="w-4 h-4 text-green-400" />
                      <span className="text-xs text-gray-400">Population Diversity</span>
                    </div>
                    <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                        animate={{ width: `${Math.min(100, (currentRun.temperature || 0) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main View - Map */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 relative">
              <div ref={mapContainer} className="absolute inset-0" />
              
              {/* Naive Routes Indicator - only show when no optimized routes */}
              {optimizedRoutes.length === 0 && deliveryPoints.length > 0 && showNaiveRoutes && !isOptimizing && (
                <div className="absolute top-4 left-4 bg-dark-800/90 backdrop-blur-sm rounded-lg p-3 z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                    <h4 className="text-xs font-semibold text-yellow-400">Naive Routes (Unoptimized)</h4>
                  </div>
                  <p className="text-xs text-gray-400 max-w-48">
                    Showing simple round-robin assignment. Run optimization to find better routes.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-0.5 border-t-2 border-dashed border-gray-500" />
                    <span className="text-xs text-gray-500">Dashed = unoptimized</span>
                  </div>
                </div>
              )}
              
              {/* Route Legend */}
              {optimizedRoutes.length > 0 && (
                <div className="absolute top-4 left-4 bg-dark-800/90 backdrop-blur-sm rounded-lg p-3 z-10">
                  <h4 className="text-xs font-semibold text-white mb-2">Optimized Routes</h4>
                  <div className="space-y-1">
                    {optimizedRoutes.map((route, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: route.color }}
                        />
                        <span className="text-gray-300">
                          Vehicle {idx + 1}: {route.num_stops} stops, {(route.distance / 1000).toFixed(1)}km
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Panel - Chart & Metrics */}
            <div className="h-64 border-t border-dark-600 flex">
              {/* Cost Convergence Chart */}
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">Cost Convergence</h3>
                  {currentRun?.savingsPercent !== undefined && currentRun.savingsPercent > 0 && (
                    <span className="px-2 py-1 bg-accent-lime/20 text-accent-lime text-xs font-bold rounded">
                      {currentRun.savingsPercent.toFixed(1)}% Savings
                    </span>
                  )}
                </div>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3a" />
                    <XAxis dataKey="iteration" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1a1a25',
                        border: '1px solid rgba(0, 245, 255, 0.2)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Line
                      type="monotone"
                      dataKey="bestCost"
                      stroke="#39ff14"
                      strokeWidth={2}
                      dot={false}
                      name="Best Cost (km)"
                    />
                    <Line
                      type="monotone"
                      dataKey="currentCost"
                      stroke="#6366f1"
                      strokeWidth={1.5}
                      dot={false}
                      opacity={0.6}
                      name="Current Cost (km)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Metrics Panel */}
              <div className="w-72 border-l border-dark-600 p-4">
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent-cyan" />
                  Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5">
                      <TrendingDown className="w-3 h-3" />
                      Total Distance
                    </span>
                    <span className="text-sm font-bold text-white">
                      {(totalDistance / 1000).toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Truck className="w-3 h-3" />
                      Vehicles Used
                    </span>
                    <span className="text-sm font-bold text-white">
                      {optimizedRoutes.length} / {params.numVehicles}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      Total Stops
                    </span>
                    <span className="text-sm font-bold text-white">{totalStops}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Est. Time
                    </span>
                    <span className="text-sm font-bold text-white">
                      {estimatedTime.toFixed(0)} min
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">Avg/Vehicle</span>
                    <span className="text-sm font-bold text-accent-cyan">
                      {(avgDistPerVehicle / 1000).toFixed(1)} km
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Battle Mode Results Modal */}
        <AnimatePresence>
          {Object.keys(battleResults).length === algorithms.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
              onClick={() => setBattleResults({})}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-dark-800 rounded-2xl p-6 max-w-2xl w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Swords className="w-6 h-6 text-orange-400" />
                  Battle Results
                </h2>
                
                <div className="space-y-4">
                  {algorithms
                    .map(algo => ({
                      ...algo,
                      result: battleResults[algo.id]
                    }))
                    .sort((a, b) => (a.result?.cost || Infinity) - (b.result?.cost || Infinity))
                    .map((algo, idx) => (
                      <div
                        key={algo.id}
                        className={cn(
                          'p-4 rounded-xl border-2',
                          idx === 0 ? 'border-yellow-500 bg-yellow-500/10' : 'border-dark-600 bg-dark-700'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {idx === 0 && <span className="text-2xl">🏆</span>}
                            <div>
                              <p className="font-bold text-white">{algo.name}</p>
                              <p className="text-sm text-gray-400">
                                {algo.result?.iterations} iterations
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold" style={{ color: algo.color }}>
                              {((algo.result?.cost || 0) / 1000).toFixed(1)} km
                            </p>
                            <p className="text-sm text-accent-lime">
                              {algo.result?.savings?.toFixed(1)}% savings
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                
                <button
                  onClick={() => setBattleResults({})}
                  className="mt-6 w-full py-3 bg-dark-600 text-white rounded-xl hover:bg-dark-500 transition-colors"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageLayout>
  );
}
