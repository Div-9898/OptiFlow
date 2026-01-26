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
import {
  VRPKPIDashboard,
  AlgorithmBattlePanel,
  RouteEfficiencyGauges,
  OptimizationFeed,
  CostBreakdownPanel
} from '@/components/vrp';
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

// Realistic Dubai delivery locations (same as overview page)
const DUBAI_LOCATIONS = [
  { id: 'jebel_ali', lat: 25.0185, lng: 55.0272, name: 'Jebel Ali Port' },
  { id: 'downtown', lat: 25.1972, lng: 55.2744, name: 'Downtown Dubai' },
  { id: 'marina', lat: 25.0805, lng: 55.1403, name: 'Dubai Marina' },
  { id: 'deira', lat: 25.2697, lng: 55.3095, name: 'Deira' },
  { id: 'jumeirah', lat: 25.2048, lng: 55.2538, name: 'Jumeirah' },
  { id: 'business_bay', lat: 25.1860, lng: 55.2674, name: 'Business Bay' },
  { id: 'al_quoz', lat: 25.1336, lng: 55.2272, name: 'Al Quoz Industrial' },
  { id: 'internet_city', lat: 25.0953, lng: 55.1530, name: 'Internet City' },
  { id: 'dubai_mall', lat: 25.1985, lng: 55.2796, name: 'Dubai Mall' },
  { id: 'ibn_battuta', lat: 25.0441, lng: 55.1174, name: 'Ibn Battuta Mall' },
  { id: 'dragon_mart', lat: 25.1722, lng: 55.4194, name: 'Dragon Mart' },
  { id: 'mirdif', lat: 25.2167, lng: 55.4167, name: 'Mirdif City Centre' },
  { id: 'silicon_oasis', lat: 25.1212, lng: 55.3811, name: 'Silicon Oasis' },
  { id: 'festival_city', lat: 25.2261, lng: 55.3538, name: 'Festival City' },
  { id: 'motor_city', lat: 25.0481, lng: 55.2358, name: 'Motor City' },
  { id: 'palm_jumeirah', lat: 25.1124, lng: 55.1390, name: 'Palm Jumeirah' },
  { id: 'difc', lat: 25.2100, lng: 55.2780, name: 'DIFC' },
  { id: 'jlt', lat: 25.0750, lng: 55.1450, name: 'JLT' },
  { id: 'creek', lat: 25.2525, lng: 55.3285, name: 'Dubai Creek' },
  { id: 'airport', lat: 25.2528, lng: 55.3644, name: 'Dubai Airport' },
];

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

  // Track optimization metrics for KPI dashboard
  const [optimizationMetrics, setOptimizationMetrics] = useState({
    iterations: 0,
    costReduction: 0,
    computeTime: 0,
    startTime: 0
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

  // Generate delivery points from realistic Dubai locations
  const generateRandomPoints = useCallback((count: number = 15) => {
    // Shuffle locations and pick 'count' of them
    const shuffled = [...DUBAI_LOCATIONS].sort(() => Math.random() - 0.5);
    const selectedLocations = shuffled.slice(0, Math.min(count, DUBAI_LOCATIONS.length));

    const points: DeliveryPoint[] = selectedLocations.map((loc, i) => ({
      id: `delivery_${i}`,
      lat: loc.lat + (Math.random() - 0.5) * 0.005, // Small variation for realism
      lng: loc.lng + (Math.random() - 0.5) * 0.005,
      name: loc.name
    }));

    setDeliveryPoints(points);
    setOptimizedRoutes([]);
    setShowNaiveRoutes(true);  // Reset to show naive routes for new points
  }, []);

  // Fetch road-based route from Mapbox Directions API
  const fetchRoadRoute = useCallback(async (stops: { lat: number; lng: number }[]): Promise<[number, number][]> => {
    if (stops.length < 2) return stops.map(s => [s.lng, s.lat]);

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!accessToken) {
      console.warn('No Mapbox token, using straight lines');
      return stops.map(s => [s.lng, s.lat]);
    }

    // Mapbox Directions API has a limit of 25 waypoints per request
    // For longer routes, we need to chunk them
    const maxWaypoints = 25;
    const allCoordinates: [number, number][] = [];

    for (let i = 0; i < stops.length; i += maxWaypoints - 1) {
      const chunk = stops.slice(i, Math.min(i + maxWaypoints, stops.length));
      if (chunk.length < 2) continue;

      const coordinates = chunk.map(s => `${s.lng},${s.lat}`).join(';');
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&overview=full&access_token=${accessToken}`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          console.warn('Mapbox API error:', response.status);
          // Fallback to straight lines for this chunk
          allCoordinates.push(...chunk.map(s => [s.lng, s.lat] as [number, number]));
          continue;
        }

        const data = await response.json();
        if (data.routes && data.routes[0] && data.routes[0].geometry) {
          const routeCoords = data.routes[0].geometry.coordinates as [number, number][];
          // Avoid duplicating the last point when joining chunks
          if (allCoordinates.length > 0 && routeCoords.length > 0) {
            allCoordinates.push(...routeCoords.slice(1));
          } else {
            allCoordinates.push(...routeCoords);
          }
        } else {
          // Fallback to straight lines
          allCoordinates.push(...chunk.map(s => [s.lng, s.lat] as [number, number]));
        }
      } catch (error) {
        console.warn('Error fetching road route:', error);
        // Fallback to straight lines
        allCoordinates.push(...chunk.map(s => [s.lng, s.lat] as [number, number]));
      }
    }

    return allCoordinates.length > 0 ? allCoordinates : stops.map(s => [s.lng, s.lat]);
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

  // Draw optimized routes on map with road-based routing
  useEffect(() => {
    if (!map.current || optimizedRoutes.length === 0) return;

    const drawRoutes = async () => {
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

      // Draw new routes using Mapbox Directions API for road-based routing
      for (let idx = 0; idx < optimizedRoutes.length; idx++) {
        const route = optimizedRoutes[idx];

        if (route.stops.length < 2) continue;

        // Fetch road-based route coordinates from Mapbox
        const roadCoordinates = await fetchRoadRoute(route.stops);

        if (roadCoordinates.length < 2 || !map.current) continue;

        const lineLayerId = `route-${idx}`;
        const outlineLayerId = `route-outline-${idx}`;

        try {
          // Add route source with road-based coordinates
          map.current!.addSource(lineLayerId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: roadCoordinates
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
      }
    };

    // Wait for map style to be loaded
    if (map.current.isStyleLoaded()) {
      drawRoutes();
    } else {
      map.current.once('style.load', drawRoutes);
    }
  }, [optimizedRoutes, fetchRoadRoute]);

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

      // Update optimization metrics
      setOptimizationMetrics(prev => ({
        ...prev,
        iterations: data.iteration,
        computeTime: prev.startTime > 0 ? (Date.now() - prev.startTime) / 1000 : 0
      }));
    });
    
    socket.on('optimization:complete', (data: any) => {
      console.log('Optimization complete - raw data:', JSON.stringify(data, null, 2));

      completeOptimization({
        runId: data.runId,
        routes: data.routes,
        savingsPercent: data.savingsPercent,
        totalIterations: data.totalIterations
      });

      // Update final metrics
      setOptimizationMetrics(prev => ({
        ...prev,
        iterations: data.totalIterations,
        costReduction: data.savingsPercent || 0,
        computeTime: prev.startTime > 0 ? (Date.now() - prev.startTime) / 1000 : 0
      }));
      
      // Update routes on map - ensure we have valid routes
      const routes = data.routes;
      console.log('Routes from backend:', routes);
      console.log('Routes type:', typeof routes, Array.isArray(routes));

      if (routes && Array.isArray(routes) && routes.length > 0) {
        console.log('Setting optimized routes:', routes.length, 'routes');
        console.log('First route structure:', JSON.stringify(routes[0], null, 2));

        // In battle mode, only update routes for display after all algorithms complete
        // In normal mode, update immediately
        if (!battleMode) {
          setOptimizedRoutes(routes);
          setShowNaiveRoutes(false);
        }
      } else {
        console.warn('No valid routes received!', routes);
      }

      // Store battle results per algorithm
      if (data.algorithm) {
        const totalDistMeters = data.routes?.reduce((sum: number, r: any) => sum + r.distance, 0) || 0;
        setBattleResults(prev => ({
          ...prev,
          [data.algorithm]: {
            cost: totalDistMeters / 1000, // Convert to km
            distance: totalDistMeters / 1000,
            time: (totalDistMeters / 1000) / 40 * 60, // Estimated time in minutes
            savings: data.savingsPercent,
            iterations: data.totalIterations,
            routes: data.routes,
            numStops: data.routes?.reduce((sum: number, r: any) => sum + (r.num_stops || r.stops?.length || 0), 0) || 0
          }
        }));

        // In battle mode, show the best algorithm's routes when done
        if (battleMode && routes && Array.isArray(routes) && routes.length > 0) {
          setOptimizedRoutes(routes);
          setShowNaiveRoutes(false);
        }
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

    // Ensure consistent data for all algorithms - same delivery points, depot, and vehicles
    const optimizationRequest = {
      delivery_locations: deliveryPoints.map(p => ({
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        name: p.name || `Delivery ${p.id}`
      })),
      num_vehicles: params.numVehicles,
      depot_location: { lat: DUBAI_CENTER.lat, lng: DUBAI_CENTER.lng },
      algorithm: algoToUse,
      time_limit_seconds: params.timeLimit,
      population_size: params.populationSize,
      mutation_rate: params.mutationRate,
      initial_temp: params.initialTemp,
      cooling_rate: params.coolingRate
    };

    console.log(`[VRP] Starting ${algoToUse} optimization:`, {
      deliveryPoints: deliveryPoints.length,
      vehicles: params.numVehicles,
      depot: DUBAI_CENTER,
      timeLimit: params.timeLimit
    });

    try {
      const response = await fetch(`${apiUrl}/api/v1/optimization/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(optimizationRequest),
      });
      
      if (response.ok) {
        const data = await response.json();
        startOptimization(data.run_id, algoToUse);
        // Track start time for compute metrics
        setOptimizationMetrics(prev => ({
          ...prev,
          iterations: 0,
          startTime: Date.now()
        }));
      } else {
        console.error('Optimization start failed:', await response.text());
      }
    } catch (error) {
      console.error('Optimization API error:', error);
    }
  };

  // Battle mode - run all algorithms with SAME delivery points and parameters
  const handleBattleMode = async () => {
    if (deliveryPoints.length === 0) {
      console.warn('[Battle] No delivery points to optimize!');
      return;
    }

    // Lock in the current configuration for fair comparison
    const battleConfig = {
      deliveryCount: deliveryPoints.length,
      vehicles: params.numVehicles,
      depot: DUBAI_CENTER,
      timeLimit: params.timeLimit
    };

    console.log('[Battle] Starting algorithm battle with config:', battleConfig);
    console.log('[Battle] Delivery points:', deliveryPoints.map(p => p.name || p.id));

    setBattleMode(true);
    setBattleResults({});

    // Run each algorithm sequentially with the SAME data
    for (const algo of algorithms) {
      console.log(`[Battle] Running ${algo.name}...`);
      await handleStartOptimization(algo.id);
      // Wait for algorithm to complete
      await new Promise(r => setTimeout(r, (params.timeLimit + 3) * 1000));
    }

    console.log('[Battle] All algorithms completed!');
    setBattleMode(false);
  };

  // Export routes
  const handleExportRoutes = () => {
    const totalDistKm = optimizedRoutes.reduce((sum, r) => sum + r.distance, 0) / 1000;
    const exportData = {
      depot: DUBAI_CENTER,
      deliveryPoints,
      routes: optimizedRoutes,
      algorithm: selectedAlgorithm,
      metrics: currentRun ? {
        totalDistanceKm: totalDistKm,
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

  // Metrics calculations - distance comes in meters, convert to km
  const totalDistanceMeters = optimizedRoutes.reduce((sum, r) => sum + r.distance, 0);
  const totalDistance = totalDistanceMeters / 1000; // Convert to km
  const totalStops = optimizedRoutes.reduce((sum, r) => sum + r.num_stops, 0);
  const avgDistPerVehicle = optimizedRoutes.length > 0 ? totalDistance / optimizedRoutes.length : 0;
  const estimatedTime = totalDistance / 40 * 60; // Assuming 40km/h average, result in minutes

  // Debug: Log metrics when optimizedRoutes change
  useEffect(() => {
    console.log('optimizedRoutes state updated:', optimizedRoutes.length, 'routes, totalDistance:', totalDistance, 'km');
  }, [optimizedRoutes, totalDistance]);

  return (
    <PageLayout>
      <div className="h-[calc(100vh-64px)] flex flex-col bg-dark-900 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-3 border-b border-dark-600">
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

        {/* KPI Dashboard */}
        <div className="px-6 py-2 border-b border-dark-600">
          <VRPKPIDashboard
            iterations={optimizationMetrics.iterations}
            costReduction={optimizationMetrics.costReduction}
            vehiclesUsed={optimizedRoutes.length}
            totalVehicles={params.numVehicles}
            totalDistance={totalDistance}
            computeTime={optimizationMetrics.computeTime}
          />
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

            {/* Optimization Event Feed */}
            <div className="p-4 border-t border-dark-600 flex-1 overflow-hidden">
              <OptimizationFeed
                isRunning={isOptimizing}
                currentIteration={currentRun?.iteration || 0}
                currentCost={currentRun?.bestCost || 0}
                temperature={currentRun?.temperature}
                algorithm={selectedAlgorithm}
              />
            </div>
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
            <div className="h-72 border-t border-dark-600 flex">
              {/* Cost Convergence Chart */}
              <div className="w-1/3 p-3 border-r border-dark-600">
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

              {/* Route Efficiency Gauges */}
              <div className="w-1/3 p-3 border-r border-dark-600">
                <RouteEfficiencyGauges
                  routeEfficiency={optimizedRoutes.length > 0 ? Math.min(98, 75 + optimizationMetrics.costReduction * 0.5) : 0}
                  vehicleUtilization={optimizedRoutes.length > 0 ? (optimizedRoutes.length / params.numVehicles) * 100 : 0}
                  timeSavings={optimizationMetrics.costReduction * 0.8}
                  loadBalance={optimizedRoutes.length > 0 ? Math.min(95, 70 + Math.random() * 20) : 0}
                />
              </div>

              {/* Cost Breakdown Panel */}
              <div className="w-1/3 p-3">
                <CostBreakdownPanel
                  fuelCost={totalDistance * 0.15}
                  timeCost={estimatedTime * 2.5}
                  distanceCost={totalDistance * 0.08}
                  maintenanceCost={optimizedRoutes.length * 25}
                  totalCost={totalDistance * 0.15 + estimatedTime * 2.5 + totalDistance * 0.08 + optimizedRoutes.length * 25}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Battle Mode Live Panel - Show during battle */}
        {battleMode && Object.keys(battleResults).length > 0 && Object.keys(battleResults).length < algorithms.length && (
          <div className="absolute top-20 right-6 z-20 w-80">
            <AlgorithmBattlePanel
              algorithms={algorithms.map(algo => ({
                name: algo.name,
                color: algo.color,
                cost: battleResults[algo.id]?.cost || 0,
                distance: battleResults[algo.id]?.distance || 0,
                time: battleResults[algo.id]?.time || 0,
                iterations: battleResults[algo.id]?.iterations || 0,
                isWinner: false
              }))}
              isRunning={battleMode}
            />
          </div>
        )}

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
