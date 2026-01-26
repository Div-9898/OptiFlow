'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Truck, Package, Clock, X,
  Box, Phone, Star, Play, Pause,
  RotateCcw, Brain, Zap, TrendingDown, Activity, Loader2,
  Mail, Shield, Award, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  Eye, EyeOff, Navigation2, MapPin, Settings, BarChart3, Bell, Gauge, DollarSign, Calendar
} from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import TopBar from '@/components/dashboard/TopBar';
import KPIDashboard from '@/components/dashboard/KPIDashboard';
import DeliveryNotifications from '@/components/dashboard/DeliveryNotifications';
import FleetGauges from '@/components/dashboard/FleetGauges';
import EventTimeline from '@/components/dashboard/EventTimeline';
import CostSavings from '@/components/dashboard/CostSavings';
import MapControls from '@/components/dashboard/MapControls';
import DriverBiometrics from '@/components/dashboard/DriverBiometrics';
import {
  FleetTruck,
  Stop,
  initializeFleet,
  updateFleetPositions,
} from '@/lib/fleetRoutes';
import { cn } from '@/lib/utils';
import { useSocketConnection } from '@/hooks/useSocketConnection';
import { useShowcaseStore } from '@/stores/showcaseStore';

// Showcase components
import {
  DataStreamVisualizer,
  DockerStatusPanel,
  TechStackShowcase,
  ShowcaseControlPanel,
} from '@/components/showcase';

const DUBAI_CENTER: [number, number] = [55.18, 25.10]; // [lng, lat]

// Create truck marker HTML element
function createTruckMarkerElement(truck: FleetTruck, isSelected: boolean): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'truck-marker';
  el.style.cssText = `
    width: 44px;
    height: 44px;
    cursor: pointer;
    transform-origin: center center;
  `;

  // Rotate based on heading (Mapbox uses degrees from north)
  const rotation = truck.heading || 0;

  el.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      position: relative;
      transform: rotate(${rotation}deg);
      transition: transform 0.5s ease-out;
    ">
      <div style="
        width: 36px;
        height: 36px;
        margin: 4px;
        background: linear-gradient(135deg, ${truck.color} 0%, ${truck.color}cc 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 ${isSelected ? '25px' : '15px'} ${truck.color},
                    0 4px 8px rgba(0,0,0,0.4);
        border: 3px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.5)'};
        transition: all 0.3s ease;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="transform: rotate(-90deg);">
          <path d="M5 17H3v-6l2-5h10l2 5v6h-2"/>
          <circle cx="7" cy="17" r="2"/>
          <circle cx="17" cy="17" r="2"/>
        </svg>
      </div>
      ${truck.status === 'active' ? `
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${truck.color};
          opacity: 0.3;
          animation: truckPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>
      ` : ''}
    </div>
    <div style="
      position: absolute;
      top: -24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.85);
      color: white;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: bold;
      white-space: nowrap;
      border: 1px solid ${truck.color}50;
    ">${truck.vehicleId}</div>
  `;

  return el;
}

// Create stop marker HTML element
function createStopMarkerElement(stop: Stop, index: number, color: string): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cssText = 'cursor: pointer;';

  const bgColor = stop.type === 'depot' ? '#00f5ff' :
                  stop.type === 'destination' ? '#ff6b6b' :
                  stop.status === 'completed' ? '#39ff14' :
                  stop.status === 'current' ? '#ffd93d' : '#6b7280';

  const icon = stop.type === 'depot' ? '🏭' :
               stop.type === 'destination' ? '🏁' :
               stop.type === 'pickup' ? '📦' : '📍';

  const size = stop.type === 'depot' || stop.type === 'destination' ? 36 : 28;

  el.innerHTML = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: ${bgColor};
      border-radius: ${stop.type === 'depot' || stop.type === 'destination' ? '10px' : '50%'};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${stop.type === 'depot' || stop.type === 'destination' ? '18px' : '14px'};
      box-shadow: 0 0 15px ${bgColor}80, 0 2px 8px rgba(0,0,0,0.3);
      border: 2px solid white;
      position: relative;
    ">
      ${icon}
      ${stop.type !== 'depot' && stop.type !== 'destination' ? `
        <div style="
          position: absolute;
          top: -6px;
          right: -6px;
          background: ${color};
          color: white;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          font-size: 10px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
        ">${index}</div>
      ` : ''}
    </div>
  `;

  return el;
}

export default function Dashboard() {
  const { isConnected } = useSocketConnection();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const stopMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const routeSourcesRef = useRef<string[]>([]);
  const fleetRef = useRef<FleetTruck[]>([]);
  const lastSelectedTruckIdRef = useRef<string | null>(null);

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoadingFleet, setIsLoadingFleet] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState({ loaded: 0, total: 6 });
  const [fleet, setFleet] = useState<FleetTruck[]>([]);
  const [selectedTruck, setSelectedTruck] = useState<FleetTruck | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);

  // Per-truck optimization state
  const [truckOptimization, setTruckOptimization] = useState<Record<string, {
    iteration: number;
    currentCost: number;
    bestCost: number;
    initialCost: number;
    temperature: number;
    improvements: number;
    converged: boolean;
    history: Array<{ iteration: number; cost: number; event?: string }>;
    constraints: string[];
  }>>({});

  const animationRef = useRef<number | null>(null);
  const lastFrameTime = useRef<number>(0);

  // Map controls state
  const [mapBearing, setMapBearing] = useState(-10);
  const [showConstraints, setShowConstraints] = useState(true);

  // Panel visibility states (for collapsible menus)
  const [showOverlaysMenu, setShowOverlaysMenu] = useState(true);
  const [showFleetPanel, setShowFleetPanel] = useState(true);

  // Individual overlay visibility states
  const [overlayVisibility, setOverlayVisibility] = useState({
    kpiDashboard: true,
    eventTimeline: true,
    fleetGauges: true,
    costSavings: true,
    notifications: true,
  });

  // Heatmap state
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);

  // Toggle individual overlay
  const toggleOverlay = (key: keyof typeof overlayVisibility) => {
    setOverlayVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle all overlays
  const toggleAllOverlays = (show: boolean) => {
    setOverlayVisibility({
      kpiDashboard: show,
      eventTimeline: show,
      fleetGauges: show,
      costSavings: show,
      notifications: show,
    });
  };

  const allOverlaysVisible = Object.values(overlayVisibility).every(v => v);
  const someOverlaysVisible = Object.values(overlayVisibility).some(v => v);

  // KPI state - updated based on fleet data
  const [kpis, setKpis] = useState({
    totalDistanceSaved: 0,
    fuelSaved: 0,
    co2Reduced: 0,
    onTimeRate: 94.5,
    deliveriesCompleted: 0,
    routeEfficiency: 0,
  });

  // Get showcase store for data stream
  const { showDataStream } = useShowcaseStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: DUBAI_CENTER,
      zoom: 11,
      pitch: 45,
      bearing: -10,
      antialias: true
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsMapLoaded(true);

      // Add 3D buildings layer
      map.current?.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 13,
        paint: {
          'fill-extrusion-color': '#1a1a2e',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'min_height'],
          'fill-extrusion-opacity': 0.8
        }
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Initialize fleet with real routes when map is loaded
  useEffect(() => {
    if (!isMapLoaded) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

    setIsLoadingFleet(true);
    initializeFleet(6, token, (loaded, total) => {
      setLoadingProgress({ loaded, total });
    }).then(initialFleet => {
      setFleet(initialFleet);
      setIsLoadingFleet(false);
    });
  }, [isMapLoaded]);

  // Keep fleet ref in sync for click handlers
  useEffect(() => {
    fleetRef.current = fleet;
  }, [fleet]);

  // Draw routes on map
  const drawRoutes = useCallback(() => {
    if (!map.current || !isMapLoaded || fleet.length === 0) return;

    const mapInstance = map.current;

    // Get the actual selected truck from the current fleet (ensures we have latest data)
    const currentSelectedTruck = selectedTruck
      ? fleet.find(t => t.id === selectedTruck.id) || selectedTruck
      : null;

    // Clear existing route sources
    routeSourcesRef.current.forEach(sourceId => {
      try {
        if (mapInstance.getLayer(`${sourceId}-line`)) {
          mapInstance.removeLayer(`${sourceId}-line`);
        }
        if (mapInstance.getLayer(`${sourceId}-outline`)) {
          mapInstance.removeLayer(`${sourceId}-outline`);
        }
        if (mapInstance.getSource(sourceId)) {
          mapInstance.removeSource(sourceId);
        }
      } catch (e) {
        // Ignore errors during cleanup
      }
    });
    routeSourcesRef.current = [];

    // Clear stop markers
    stopMarkersRef.current.forEach(m => m.remove());
    stopMarkersRef.current = [];

    // Draw routes
    const trucksToShow = currentSelectedTruck ? [currentSelectedTruck] : fleet;

    trucksToShow.forEach(truck => {
      if (truck.routeGeometry.length < 2) return;

      const sourceId = `route-${truck.id}`;

      // Add route source
      map.current!.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: truck.routeGeometry.map(c => [c.lng, c.lat])
          }
        }
      });

      // Route outline
      map.current!.addLayer({
        id: `${sourceId}-outline`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#000',
          'line-width': 10,
          'line-opacity': 0.4
        }
      });

      // Route line
      map.current!.addLayer({
        id: `${sourceId}-line`,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': truck.color,
          'line-width': 5,
          'line-opacity': currentSelectedTruck ? 1 : 0.8
        }
      });

      routeSourcesRef.current.push(sourceId);

      // Add stop markers for selected truck
      if (currentSelectedTruck || fleet.length <= 3) {
        truck.stops.forEach((stop, idx) => {
          const el = createStopMarkerElement(stop, idx, truck.color);

          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            className: 'stop-popup'
          }).setHTML(`
            <div style="padding: 10px; background: #1a1a2e; border-radius: 8px; color: white;">
              <strong style="color: ${truck.color};">${stop.name}</strong><br/>
              <span style="color: #888; font-size: 12px;">${stop.address}</span><br/>
              <div style="margin-top: 6px; display: flex; align-items: center; gap: 4px;">
                <span style="
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background: ${stop.status === 'completed' ? '#39ff14' : stop.status === 'current' ? '#ffd93d' : '#888'};
                "></span>
                <span style="color: ${stop.status === 'completed' ? '#39ff14' : stop.status === 'current' ? '#ffd93d' : '#888'}; text-transform: uppercase; font-size: 11px;">
                  ${stop.status}
                </span>
              </div>
              ${stop.packages ? `<div style="margin-top: 4px; color: #aaa; font-size: 12px;">📦 ${stop.packages} packages</div>` : ''}
            </div>
          `);

          const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'center'
          })
            .setLngLat([stop.lng, stop.lat])
            .setPopup(popup)
            .addTo(map.current!);

          stopMarkersRef.current.push(marker);
        });
      }
    });
  }, [fleet, selectedTruck, isMapLoaded]);

  // Update routes when selection changes or fleet is first loaded
  useEffect(() => {
    const currentSelectedId = selectedTruck?.id || null;

    // Only redraw if selection actually changed or fleet just loaded
    if (lastSelectedTruckIdRef.current !== currentSelectedId || (fleet.length > 0 && routeSourcesRef.current.length === 0)) {
      lastSelectedTruckIdRef.current = currentSelectedId;
      drawRoutes();
    }
  }, [selectedTruck?.id, fleet.length, drawRoutes, isMapLoaded]);

  // Update truck markers
  useEffect(() => {
    if (!map.current || !isMapLoaded || fleet.length === 0) return;

    fleet.forEach(truck => {
      const markerId = truck.id;
      let marker = markersRef.current.get(markerId);
      const isSelected = selectedTruck?.id === truck.id;

      if (marker) {
        // Update position smoothly
        marker.setLngLat([truck.currentLng, truck.currentLat]);

        // Update marker element (for rotation and selection state)
        const newEl = createTruckMarkerElement(truck, isSelected);
        const oldEl = marker.getElement();
        oldEl.innerHTML = newEl.innerHTML;
      } else {
        // Create new marker
        const el = createTruckMarkerElement(truck, isSelected);

        // Store truck ID in element for click handler
        const truckId = truck.id;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          // Use fleetRef to get current truck data (avoids stale closure)
          const currentTruck = fleetRef.current.find(t => t.id === truckId);
          if (currentTruck) {
            setSelectedTruck(prev => prev?.id === truckId ? null : currentTruck);
          }
        });

        marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center',
          rotationAlignment: 'map',
          pitchAlignment: 'map'
        })
          .setLngLat([truck.currentLng, truck.currentLat])
          .addTo(map.current!);

        markersRef.current.set(markerId, marker);
      }
    });
  }, [fleet, selectedTruck, isMapLoaded]);

  // Animation loop with smooth interpolation
  useEffect(() => {
    if (!isAnimating || isLoadingFleet) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      // Calculate delta time for smooth animation
      const deltaTime = lastFrameTime.current ? timestamp - lastFrameTime.current : 16;
      lastFrameTime.current = timestamp;

      // Adjust progress based on frame rate (target 60fps)
      // Slower speed for more realistic movement
      const progressPerFrame = 0.00003 * (deltaTime / 16);

      setFleet(prev => updateFleetPositions(prev, progressPerFrame));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isAnimating, isLoadingFleet]);

  // Initialize optimization for selected truck
  useEffect(() => {
    if (!selectedTruck) return;

    const truckId = selectedTruck.id;

    // Initialize optimization if not exists
    if (!truckOptimization[truckId]) {
      const initialCost = 1800 + Math.random() * 800;
      setTruckOptimization(prev => ({
        ...prev,
        [truckId]: {
          iteration: 0,
          currentCost: initialCost,
          bestCost: initialCost,
          initialCost: initialCost,
          temperature: 1000,
          improvements: 0,
          converged: false,
          history: [{ iteration: 0, cost: initialCost, event: 'Initial route calculation' }],
          constraints: [
            'Traffic conditions on Sheikh Zayed Road',
            'Time windows for deliveries',
            'Vehicle capacity: ' + selectedTruck.capacityKg + 'kg',
            'Driver work hours limit',
            'Road restrictions in Downtown Dubai',
          ],
        }
      }));
    }
  }, [selectedTruck?.id]);

  // Optimization simulation for selected truck
  useEffect(() => {
    if (!selectedTruck || !isAnimating) return;

    const truckId = selectedTruck.id;
    const opt = truckOptimization[truckId];

    // Don't run if converged
    if (opt?.converged) return;

    const interval = setInterval(() => {
      setTruckOptimization(prev => {
        const current = prev[truckId];
        if (!current || current.converged) return prev;

        const newIteration = current.iteration + 1;
        const newTemp = Math.max(1, current.temperature * 0.97);

        // Convergence logic - converge after ~150 iterations
        const isConverged = newIteration > 150 || newTemp < 5;

        // Calculate improvement with decreasing probability as temp drops
        const improvementChance = 0.3 * (current.temperature / 1000);
        const improvement = Math.random() < improvementChance ? Math.random() * (current.temperature / 50) : 0;

        const minCost = current.initialCost * 0.65; // Max 35% savings
        const newCurrentCost = Math.max(minCost, current.currentCost - improvement);
        const newBestCost = Math.min(current.bestCost, newCurrentCost);

        // Add history events
        const newHistory = [...current.history];
        if (improvement > 10) {
          newHistory.push({
            iteration: newIteration,
            cost: newBestCost,
            event: improvement > 20 ? 'Major route improvement found' : 'Minor optimization applied'
          });
        }
        if (isConverged && !current.converged) {
          newHistory.push({
            iteration: newIteration,
            cost: newBestCost,
            event: 'Optimization converged - optimal route found'
          });
        }

        return {
          ...prev,
          [truckId]: {
            ...current,
            iteration: newIteration,
            currentCost: newCurrentCost,
            bestCost: newBestCost,
            temperature: newTemp,
            improvements: improvement > 0 ? current.improvements + 1 : current.improvements,
            converged: isConverged,
            history: newHistory.slice(-10), // Keep last 10 events
          }
        };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [selectedTruck?.id, isAnimating, truckOptimization]);

  // Fly to selected truck
  useEffect(() => {
    if (selectedTruck && map.current) {
      map.current.flyTo({
        center: [selectedTruck.currentLng, selectedTruck.currentLat],
        zoom: 14,
        pitch: 60,
        bearing: selectedTruck.heading,
        duration: 1500
      });
    }
  }, [selectedTruck?.id]);

  // Update selected truck reference when fleet updates
  useEffect(() => {
    if (selectedTruck) {
      const updated = fleet.find(t => t.id === selectedTruck.id);
      if (updated && updated !== selectedTruck) {
        setSelectedTruck(updated);
      }
    }
  }, [fleet, selectedTruck]);

  // Update KPIs based on fleet data
  useEffect(() => {
    if (fleet.length === 0) return;

    const totalSavings = fleet.reduce((sum, t) => {
      return sum + (t.optimizationResult?.savingsPercent || 0);
    }, 0);

    const avgEfficiency = totalSavings / fleet.length;
    const totalDistanceSaved = fleet.reduce((sum, t) => {
      const savings = t.optimizationResult?.originalDistance - t.optimizationResult?.optimizedDistance || 0;
      return sum + (savings / 1000); // Convert to km
    }, 0);

    const completedDeliveries = fleet.reduce((sum, t) => {
      return sum + t.stops.filter(s => s.status === 'completed' && s.type === 'delivery').length;
    }, 0);

    setKpis({
      totalDistanceSaved: Math.round(totalDistanceSaved),
      fuelSaved: Math.round(totalDistanceSaved * 0.25), // ~0.25L per km
      co2Reduced: Math.round(totalDistanceSaved * 2.68 * 0.25), // 2.68kg CO2 per liter diesel
      onTimeRate: 94.5 + Math.random() * 3,
      deliveriesCompleted: completedDeliveries,
      routeEfficiency: avgEfficiency,
    });
  }, [fleet]);

  // Map control handlers
  const handleMapRotate = useCallback((bearing: number) => {
    setMapBearing(bearing);
    map.current?.easeTo({ bearing, duration: 500 });
  }, []);

  const handleToggleHeatmap = useCallback((enabled: boolean) => {
    if (!map.current) return;

    setHeatmapEnabled(enabled);

    const mapInstance = map.current;

    if (enabled) {
      // Add traffic heatmap layer
      if (!mapInstance.getSource('traffic-heatmap-source')) {
        // Create heatmap data from fleet positions and route congestion
        const heatmapFeatures: Array<{
          type: 'Feature';
          properties: { intensity: number };
          geometry: { type: 'Point'; coordinates: [number, number] };
        }> = [];

        fleet.forEach((truck: FleetTruck) => {
          // Add points along the route with varying intensity
          const numPoints = Math.min(50, truck.routeGeometry.length);
          const step = Math.max(1, Math.floor(truck.routeGeometry.length / numPoints));

          for (let i = 0; i < truck.routeGeometry.length; i += step) {
            const coord = truck.routeGeometry[i];
            // Higher intensity near current position and downtown areas
            const distanceFromTruck = Math.sqrt(
              Math.pow(coord.lat - truck.currentLat, 2) +
              Math.pow(coord.lng - truck.currentLng, 2)
            );
            const intensity = Math.max(0.3, 1 - distanceFromTruck * 20);

            heatmapFeatures.push({
              type: 'Feature',
              properties: { intensity },
              geometry: { type: 'Point', coordinates: [coord.lng, coord.lat] }
            });
          }
        });

        const heatmapData = {
          type: 'FeatureCollection' as const,
          features: heatmapFeatures
        };

        mapInstance.addSource('traffic-heatmap-source', {
          type: 'geojson',
          data: heatmapData
        });

        mapInstance.addLayer({
          id: 'traffic-heatmap',
          type: 'heatmap',
          source: 'traffic-heatmap-source',
          paint: {
            'heatmap-weight': ['get', 'intensity'],
            'heatmap-intensity': 0.8,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 0, 255, 0)',
              0.2, 'rgba(0, 255, 255, 0.4)',
              0.4, 'rgba(0, 255, 0, 0.5)',
              0.6, 'rgba(255, 255, 0, 0.6)',
              0.8, 'rgba(255, 128, 0, 0.7)',
              1, 'rgba(255, 0, 0, 0.8)'
            ],
            'heatmap-radius': 30,
            'heatmap-opacity': 0.7
          }
        }, '3d-buildings');
      }
    } else {
      // Remove heatmap layer
      if (mapInstance.getLayer('traffic-heatmap')) {
        mapInstance.removeLayer('traffic-heatmap');
      }
      if (mapInstance.getSource('traffic-heatmap-source')) {
        mapInstance.removeSource('traffic-heatmap-source');
      }
    }
  }, [fleet]);

  const handleToggle3DBuildings = useCallback((enabled: boolean) => {
    if (!map.current) return;
    const layer = map.current.getLayer('3d-buildings');
    if (layer) {
      map.current.setLayoutProperty('3d-buildings', 'visibility', enabled ? 'visible' : 'none');
    }
  }, []);

  const handleToggleTraffic = useCallback((enabled: boolean) => {
    // Toggle traffic visualization
  }, []);

  const handleResetView = useCallback(() => {
    setMapBearing(-10);
    setSelectedTruck(null);
    map.current?.flyTo({
      center: DUBAI_CENTER,
      zoom: 11,
      pitch: 45,
      bearing: -10,
      duration: 1500
    });
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar */}
        <TopBar isConnected={isConnected} />

        {/* Full-screen Map */}
        <div className="flex-1 relative">
          <div ref={mapContainer} className="absolute inset-0" />

          {/* Loading Overlay */}
          <AnimatePresence>
            {isLoadingFleet && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-30 bg-dark-900/90 backdrop-blur-sm flex items-center justify-center"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="mb-4"
                  >
                    <Loader2 className="w-12 h-12 text-cyan-400 mx-auto" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white mb-2">Loading Fleet Routes</h3>
                  <p className="text-gray-400 mb-4">Fetching real road data from Mapbox...</p>
                  <div className="w-64 h-2 bg-dark-700 rounded-full overflow-hidden mx-auto">
                    <motion.div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                      animate={{ width: `${(loadingProgress.loaded / loadingProgress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {loadingProgress.loaded} / {loadingProgress.total} trucks loaded
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* KPI Dashboard - Top Center */}
          {!isLoadingFleet && overlayVisibility.kpiDashboard && (
            <KPIDashboard
              totalDistanceSaved={kpis.totalDistanceSaved}
              fuelSaved={kpis.fuelSaved}
              co2Reduced={kpis.co2Reduced}
              onTimeRate={kpis.onTimeRate}
              deliveriesCompleted={kpis.deliveriesCompleted}
              routeEfficiency={kpis.routeEfficiency}
            />
          )}

          {/* Event Timeline - Top Right */}
          {!isLoadingFleet && overlayVisibility.eventTimeline && <EventTimeline />}

          {/* Map Controls - Always visible */}
          {!isLoadingFleet && (
            <MapControls
              currentBearing={mapBearing}
              onRotate={handleMapRotate}
              onToggleHeatmap={handleToggleHeatmap}
              onToggle3DBuildings={handleToggle3DBuildings}
              onToggleTraffic={handleToggleTraffic}
              onResetView={handleResetView}
            />
          )}

          {/* Fleet Gauges - Bottom Left */}
          {!isLoadingFleet && overlayVisibility.fleetGauges && (
            <FleetGauges
              fleetUtilization={fleet.length > 0 ? Math.round(fleet.reduce((sum: number, t: FleetTruck) => sum + t.utilizationPercent, 0) / fleet.length) : 0}
              routeEfficiency={Math.round(kpis.routeEfficiency)}
              timeAdherence={Math.round(kpis.onTimeRate)}
            />
          )}

          {/* Cost Savings - Bottom Right */}
          {!isLoadingFleet && overlayVisibility.costSavings && (
            <CostSavings
              distanceSavedKm={kpis.totalDistanceSaved}
              fuelPricePerLiter={3.2}
              avgFuelConsumption={25}
              hourlyOperatingCost={150}
              timeSavedMinutes={Math.round(kpis.totalDistanceSaved * 1.2)}
            />
          )}

          {/* Overlay Controls Panel - Below KPI Dashboard */}
          <div className="absolute top-4 right-28 z-20">
            {/* Collapsed Toggle Button */}
            {!showOverlaysMenu && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowOverlaysMenu(true)}
                className="p-2.5 rounded-xl bg-dark-800/95 backdrop-blur-md border border-dark-600 text-gray-400 hover:text-white hover:bg-dark-700 transition-all"
                title="Show Overlays Menu"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            )}

            {/* Full Panel */}
            <AnimatePresence>
              {showOverlaysMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(180deg, rgba(10,15,25,0.95) 0%, rgba(5,10,20,0.98) 100%)',
                    border: '1px solid rgba(100, 150, 255, 0.15)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                  }}
                >
              {/* Header with Live/Pause */}
              <div className="px-3 py-2 border-b border-gray-800/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-300">Overlays</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Hide/Show All */}
                  <button
                    onClick={() => toggleAllOverlays(!allOverlaysVisible)}
                    className={cn(
                      'p-1.5 rounded-md transition-all',
                      allOverlaysVisible ? 'bg-blue-500/20 text-blue-400' : 'bg-dark-700 text-gray-500'
                    )}
                    title={allOverlaysVisible ? 'Hide all' : 'Show all'}
                  >
                    {allOverlaysVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {/* Live/Pause */}
                  <button
                    onClick={() => setIsAnimating(!isAnimating)}
                    className={cn(
                      'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all',
                      isAnimating ? 'bg-green-500/20 text-green-400' : 'bg-dark-700 text-gray-400'
                    )}
                  >
                    {isAnimating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {isAnimating ? 'Live' : 'Paused'}
                  </button>
                  {/* Collapse Button */}
                  <button
                    onClick={() => setShowOverlaysMenu(false)}
                    className="p-1.5 rounded-md bg-dark-700 text-gray-500 hover:text-white transition-all"
                    title="Hide menu"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Individual Toggles */}
              <div className="p-2 space-y-1">
                {/* KPI Dashboard Toggle */}
                <button
                  onClick={() => toggleOverlay('kpiDashboard')}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all text-xs',
                    overlayVisibility.kpiDashboard
                      ? 'bg-cyan-500/10 text-cyan-400'
                      : 'text-gray-500 hover:bg-dark-700 hover:text-gray-300'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>KPI Dashboard</span>
                  </div>
                  <div className={cn(
                    'w-6 h-3.5 rounded-full p-0.5 transition-colors',
                    overlayVisibility.kpiDashboard ? 'bg-cyan-500' : 'bg-gray-600'
                  )}>
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full bg-white"
                      animate={{ x: overlayVisibility.kpiDashboard ? 10 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </button>

                {/* Event Timeline Toggle */}
                <button
                  onClick={() => toggleOverlay('eventTimeline')}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all text-xs',
                    overlayVisibility.eventTimeline
                      ? 'bg-purple-500/10 text-purple-400'
                      : 'text-gray-500 hover:bg-dark-700 hover:text-gray-300'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Event Timeline</span>
                  </div>
                  <div className={cn(
                    'w-6 h-3.5 rounded-full p-0.5 transition-colors',
                    overlayVisibility.eventTimeline ? 'bg-purple-500' : 'bg-gray-600'
                  )}>
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full bg-white"
                      animate={{ x: overlayVisibility.eventTimeline ? 10 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </button>

                {/* Fleet Gauges Toggle */}
                <button
                  onClick={() => toggleOverlay('fleetGauges')}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all text-xs',
                    overlayVisibility.fleetGauges
                      ? 'bg-green-500/10 text-green-400'
                      : 'text-gray-500 hover:bg-dark-700 hover:text-gray-300'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Gauge className="w-3.5 h-3.5" />
                    <span>Fleet Gauges</span>
                  </div>
                  <div className={cn(
                    'w-6 h-3.5 rounded-full p-0.5 transition-colors',
                    overlayVisibility.fleetGauges ? 'bg-green-500' : 'bg-gray-600'
                  )}>
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full bg-white"
                      animate={{ x: overlayVisibility.fleetGauges ? 10 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </button>

                {/* Cost Savings Toggle */}
                <button
                  onClick={() => toggleOverlay('costSavings')}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all text-xs',
                    overlayVisibility.costSavings
                      ? 'bg-yellow-500/10 text-yellow-400'
                      : 'text-gray-500 hover:bg-dark-700 hover:text-gray-300'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Cost Savings</span>
                  </div>
                  <div className={cn(
                    'w-6 h-3.5 rounded-full p-0.5 transition-colors',
                    overlayVisibility.costSavings ? 'bg-yellow-500' : 'bg-gray-600'
                  )}>
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full bg-white"
                      animate={{ x: overlayVisibility.costSavings ? 10 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </button>

                {/* Notifications Toggle */}
                <button
                  onClick={() => toggleOverlay('notifications')}
                  className={cn(
                    'w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-all text-xs',
                    overlayVisibility.notifications
                      ? 'bg-orange-500/10 text-orange-400'
                      : 'text-gray-500 hover:bg-dark-700 hover:text-gray-300'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notifications</span>
                  </div>
                  <div className={cn(
                    'w-6 h-3.5 rounded-full p-0.5 transition-colors',
                    overlayVisibility.notifications ? 'bg-orange-500' : 'bg-gray-600'
                  )}>
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full bg-white"
                      animate={{ x: overlayVisibility.notifications ? 10 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </div>
                </button>
              </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fleet List Panel - Left */}
          <div className="absolute left-4 top-4 bottom-20 z-10">
            {/* Collapsed Toggle Button */}
            {!showFleetPanel && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowFleetPanel(true)}
                className="p-2.5 rounded-xl bg-dark-800/95 backdrop-blur-md border border-dark-600 text-gray-400 hover:text-cyan-400 hover:bg-dark-700 transition-all flex items-center gap-2"
                title="Show Fleet Panel"
              >
                <Truck className="w-5 h-5" />
                <span className="text-xs font-medium">{fleet.length}</span>
              </motion.button>
            )}

            {/* Full Panel */}
            <AnimatePresence>
              {showFleetPanel && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-80 h-full"
                >
            <div className="h-full bg-dark-900/90 backdrop-blur-md rounded-2xl border border-dark-600 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-dark-600 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Truck className="w-5 h-5 text-cyan-400" />
                  Fleet ({fleet.length})
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-yellow-400">LIVE</span>
                  </div>
                  <button
                    onClick={() => setShowFleetPanel(false)}
                    className="p-1.5 rounded-md bg-dark-700 text-gray-500 hover:text-white transition-all"
                    title="Hide Fleet Panel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {fleet.map(truck => (
                  <motion.div
                    key={truck.id}
                    onClick={() => {
                      const truckId = truck.id;
                      const currentTruck = fleetRef.current.find(t => t.id === truckId);
                      if (currentTruck) {
                        setSelectedTruck(prev => prev?.id === truckId ? null : currentTruck);
                      }
                    }}
                    className={cn(
                      'p-3 rounded-xl cursor-pointer transition-all',
                      selectedTruck?.id === truck.id
                        ? 'bg-dark-600 border-2'
                        : 'bg-dark-800 hover:bg-dark-700 border-2 border-transparent'
                    )}
                    style={{ borderColor: selectedTruck?.id === truck.id ? truck.color : 'transparent' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${truck.color}30` }}
                      >
                        <Truck className="w-5 h-5" style={{ color: truck.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{truck.vehicleId}</span>
                          <span className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            truck.status === 'active' ? 'bg-green-500/20 text-green-400' :
                            truck.status === 'loading' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          )}>
                            {truck.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {truck.driver.name} • {truck.speed} km/h
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Route Progress</span>
                        <span>{Math.round(truck.routeProgress * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: truck.color }}
                          initial={false}
                          animate={{ width: `${truck.routeProgress * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {truck.completedDistanceKm} / {Math.round(truck.totalRouteDistance / 1000)} km
                      </span>
                      <span style={{ color: truck.color }}>ETA: {truck.estimatedArrival}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Selected Truck Detail Panel - Right */}
          <AnimatePresence>
            {selectedTruck && (
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                className="absolute right-4 top-16 bottom-20 w-96 z-10"
              >
                <div className="h-full bg-dark-900/95 backdrop-blur-md rounded-2xl border border-dark-600 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-dark-600" style={{ borderBottomColor: selectedTruck.color }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${selectedTruck.color}30` }}
                        >
                          <Truck className="w-6 h-6" style={{ color: selectedTruck.color }} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{selectedTruck.vehicleId}</h3>
                          <p className="text-sm text-gray-400">{selectedTruck.licensePlate}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedTruck(null)}
                        className="p-2 rounded-lg hover:bg-dark-700 text-gray-400"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    {/* Position Data */}
                    <div className="p-4 border-b border-dark-700 bg-dark-800/50">
                      <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Current Position</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                        <div>
                          <span className="text-gray-500">Lat: </span>
                          <span className="text-cyan-400">{selectedTruck.currentLat.toFixed(6)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Lng: </span>
                          <span className="text-cyan-400">{selectedTruck.currentLng.toFixed(6)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Heading: </span>
                          <span className="text-orange-400">{selectedTruck.heading.toFixed(1)}°</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Speed: </span>
                          <span className="text-green-400">{selectedTruck.speed} km/h</span>
                        </div>
                      </div>
                    </div>

                    {/* Driver Info */}
                    <div className="p-4 border-b border-dark-700">
                      <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Driver</h4>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-dark-700 rounded-full flex items-center justify-center text-2xl">
                          {selectedTruck.driver.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{selectedTruck.driver.name}</p>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Star className="w-3 h-3 text-yellow-400" />
                            <span>{selectedTruck.driver.rating.toFixed(1)}</span>
                            <span>•</span>
                            <span>{selectedTruck.driver.deliveriesToday} deliveries</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <a href={`tel:${selectedTruck.driver.phone}`} className="p-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors">
                            <Phone className="w-4 h-4" />
                          </a>
                          <a href={`mailto:${selectedTruck.driver.email}`} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors">
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Phone className="w-3 h-3" />
                          <span>{selectedTruck.driver.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Mail className="w-3 h-3" />
                          <span>{selectedTruck.driver.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Shield className="w-3 h-3" />
                          <span>License expires: {selectedTruck.driver.licenseExpiry}</span>
                        </div>
                      </div>

                      {/* Certifications */}
                      <div className="mt-3">
                        <p className="text-[10px] text-gray-500 mb-1.5">Certifications</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedTruck.driver.certifications.map((cert, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            >
                              <Award className="w-2.5 h-2.5" />
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Driver Biometrics - Live Fitness Band Data */}
                    <div className="p-4 border-b border-dark-700">
                      <DriverBiometrics
                        biometrics={selectedTruck.biometrics}
                        driverName={selectedTruck.driver.name}
                        color={selectedTruck.color}
                      />
                    </div>

                    {/* Next Stop - Highlighted */}
                    {(() => {
                      const nextStop = selectedTruck.stops.find((s: Stop) => s.status === 'pending' || s.status === 'current');
                      const nextStopIndex = selectedTruck.stops.findIndex((s: Stop) => s.status === 'pending' || s.status === 'current');

                      if (nextStop) {
                        return (
                          <div className="p-4 border-b border-dark-700">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Navigation2 className="w-4 h-4 text-cyan-400" />
                                Next Stop
                              </h4>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                                Stop {nextStopIndex + 1} of {selectedTruck.stops.length}
                              </span>
                            </div>

                            <motion.div
                              className="p-4 rounded-xl border-2"
                              style={{
                                background: `linear-gradient(135deg, ${selectedTruck.color}15 0%, ${selectedTruck.color}05 100%)`,
                                borderColor: `${selectedTruck.color}50`
                              }}
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                  style={{ backgroundColor: `${selectedTruck.color}30` }}
                                >
                                  {nextStop.type === 'depot' ? '🏭' :
                                   nextStop.type === 'destination' ? '🏁' :
                                   nextStop.type === 'pickup' ? '📦' : '📍'}
                                </div>
                                <div className="flex-1">
                                  <p className="text-lg font-bold text-white">{nextStop.name}</p>
                                  <p className="text-sm text-gray-400">{nextStop.address}</p>

                                  <div className="flex items-center gap-4 mt-3">
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="w-4 h-4" style={{ color: selectedTruck.color }} />
                                      <span className="text-sm font-medium" style={{ color: selectedTruck.color }}>
                                        {nextStop.scheduledTime}
                                      </span>
                                    </div>
                                    {nextStop.packages && nextStop.packages > 0 && (
                                      <div className="flex items-center gap-1.5">
                                        <Package className="w-4 h-4 text-orange-400" />
                                        <span className="text-sm font-medium text-orange-400">
                                          {nextStop.packages} packages
                                        </span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Route indicator */}
                                  <div className="mt-3 pt-3 border-t border-dark-600">
                                    <div className="flex items-center gap-2 text-xs">
                                      <MapPin className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-500">
                                        {nextStop.lat.toFixed(4)}, {nextStop.lng.toFixed(4)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Action hint */}
                              <motion.p
                                className="text-center text-xs text-gray-500 mt-3"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                🚚 En route • ETA: {selectedTruck.estimatedArrival}
                              </motion.p>
                            </motion.div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {/* Route Progress */}
                    <div className="p-4 border-b border-dark-700">
                      <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">All Stops</h4>
                      <div className="space-y-3">
                        {selectedTruck.stops.map((stop: Stop, idx: number) => (
                          <div key={stop.id} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className={cn(
                                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                                stop.status === 'completed' ? 'bg-green-500 text-white' :
                                stop.status === 'current' ? 'bg-yellow-500 text-black' :
                                'bg-dark-600 text-gray-400'
                              )}>
                                {stop.type === 'depot' ? '🏭' : stop.type === 'destination' ? '🏁' : idx}
                              </div>
                              {idx < selectedTruck.stops.length - 1 && (
                                <div className={cn(
                                  'w-0.5 h-8 mt-1',
                                  stop.status === 'completed' ? 'bg-green-500' : 'bg-dark-600'
                                )} />
                              )}
                            </div>
                            <div className="flex-1 pb-2">
                              <p className="text-sm font-medium text-white">{stop.name}</p>
                              <p className="text-xs text-gray-500">{stop.address}</p>
                              <div className="flex items-center gap-2 mt-1 text-xs">
                                <Clock className="w-3 h-3 text-gray-500" />
                                <span className="text-gray-400">{stop.scheduledTime}</span>
                                {stop.packages ? (
                                  <>
                                    <Package className="w-3 h-3 text-gray-500 ml-2" />
                                    <span className="text-gray-400">{stop.packages} pkg</span>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cargo */}
                    <div className="p-4 border-b border-dark-700">
                      <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Cargo</h4>
                      <div className="space-y-2">
                        {selectedTruck.cargo.slice(0, 4).map(item => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Box className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-300">{item.name}</span>
                            </div>
                            <span className="text-gray-500">{item.quantity}x ({item.weight}kg)</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Capacity Utilization</span>
                          <span style={{ color: selectedTruck.color }}>
                            {selectedTruck.usedCapacityKg}kg / {selectedTruck.capacityKg}kg
                          </span>
                        </div>
                        <div className="h-3 bg-dark-600 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: selectedTruck.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedTruck.utilizationPercent}%` }}
                          />
                        </div>
                        <p className="text-center text-lg font-bold mt-2" style={{ color: selectedTruck.color }}>
                          {selectedTruck.utilizationPercent}% Utilized
                        </p>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="p-4 border-b border-dark-700">
                      <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Metrics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-dark-700 rounded-lg">
                          <p className="text-xs text-gray-500">Distance</p>
                          <p className="text-lg font-bold text-white">
                            {selectedTruck.completedDistanceKm}/{Math.round(selectedTruck.totalRouteDistance / 1000)} km
                          </p>
                        </div>
                        <div className="p-3 bg-dark-700 rounded-lg">
                          <p className="text-xs text-gray-500">ETA</p>
                          <p className="text-lg font-bold text-cyan-400">{selectedTruck.estimatedArrival}</p>
                        </div>
                        <div className="p-3 bg-dark-700 rounded-lg">
                          <p className="text-xs text-gray-500">Speed</p>
                          <p className="text-lg font-bold text-white">{selectedTruck.speed} km/h</p>
                        </div>
                        <div className="p-3 bg-dark-700 rounded-lg">
                          <p className="text-xs text-gray-500">Stops Done</p>
                          <p className="text-lg font-bold text-green-400">
                            {selectedTruck.currentStopIndex}/{selectedTruck.stops.length - 2}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Route Optimization */}
                    {truckOptimization[selectedTruck.id] && (
                      <div className="p-4 border-b border-dark-700">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Brain className="w-4 h-4 text-purple-400" />
                            Route Optimization
                          </h4>
                          <motion.span
                            className={cn(
                              'text-[10px] px-2 py-0.5 rounded font-bold',
                              truckOptimization[selectedTruck.id].converged
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            )}
                            animate={!truckOptimization[selectedTruck.id].converged ? { opacity: [1, 0.5, 1] } : {}}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          >
                            {truckOptimization[selectedTruck.id].converged ? 'CONVERGED' : 'OPTIMIZING'}
                          </motion.span>
                        </div>

                        {/* Optimization Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="p-2 bg-dark-800 rounded-lg">
                            <p className="text-[10px] text-gray-500">Iteration</p>
                            <p className="text-sm font-bold text-cyan-400 font-mono">
                              {truckOptimization[selectedTruck.id].iteration}
                            </p>
                          </div>
                          <div className="p-2 bg-dark-800 rounded-lg">
                            <p className="text-[10px] text-gray-500">Temperature</p>
                            <p className="text-sm font-bold text-orange-400 font-mono">
                              {truckOptimization[selectedTruck.id].temperature.toFixed(0)}
                            </p>
                          </div>
                          <div className="p-2 bg-dark-800 rounded-lg">
                            <p className="text-[10px] text-gray-500">Best Cost</p>
                            <p className="text-sm font-bold text-green-400 font-mono">
                              {truckOptimization[selectedTruck.id].bestCost.toFixed(0)} km
                            </p>
                          </div>
                          <div className="p-2 bg-dark-800 rounded-lg">
                            <p className="text-[10px] text-gray-500">Savings</p>
                            <div className="flex items-center gap-1">
                              <TrendingDown className="w-3 h-3 text-green-400" />
                              <span className="text-sm font-bold text-green-400 font-mono">
                                {((truckOptimization[selectedTruck.id].initialCost - truckOptimization[selectedTruck.id].bestCost) / truckOptimization[selectedTruck.id].initialCost * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        {!truckOptimization[selectedTruck.id].converged && (
                          <div className="h-1 bg-dark-700 rounded-full overflow-hidden mb-3">
                            <motion.div
                              className="h-full bg-gradient-to-r from-purple-500 via-cyan-500 to-green-500"
                              animate={{ x: ['-100%', '100%'] }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                              style={{ width: '50%' }}
                            />
                          </div>
                        )}

                        {/* Applied Strategies */}
                        <div className="mb-3">
                          <p className="text-[10px] text-gray-500 mb-2">Applied Strategies</p>
                          <div className="space-y-1">
                            {selectedTruck.optimizationResult?.appliedStrategies.slice(0, 3).map((strategy, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-[10px]">
                                <CheckCircle2 className="w-3 h-3 text-green-400" />
                                <span className="text-gray-400">{strategy}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Optimization History */}
                        <div>
                          <p className="text-[10px] text-gray-500 mb-2">Optimization History</p>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {truckOptimization[selectedTruck.id].history.slice().reverse().map((event, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-[10px]">
                                <div className={cn(
                                  'w-1.5 h-1.5 rounded-full mt-1',
                                  event.event?.includes('converged') ? 'bg-green-400' :
                                  event.event?.includes('Major') ? 'bg-cyan-400' : 'bg-gray-500'
                                )} />
                                <div>
                                  <span className="text-gray-400">{event.event || `Iteration ${event.iteration}`}</span>
                                  <span className="text-gray-600 ml-2">({event.cost.toFixed(0)} km)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Route Constraints - Dynamic */}
                    {selectedTruck.constraints && selectedTruck.constraints.length > 0 && (
                      <div className="p-4 border-b border-dark-700">
                        <button
                          onClick={() => setShowConstraints(!showConstraints)}
                          className="w-full flex items-center justify-between mb-3"
                        >
                          <h4 className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                            Route Constraints ({selectedTruck.constraints.filter(c => c.active).length})
                          </h4>
                          {showConstraints ? (
                            <ChevronUp className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          )}
                        </button>

                        <AnimatePresence>
                          {showConstraints && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="space-y-2 overflow-hidden"
                            >
                              {selectedTruck.constraints.filter(c => c.active).map((constraint) => {
                                const impactColors = {
                                  low: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
                                  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
                                  high: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
                                };
                                const colors = impactColors[constraint.impact];

                                return (
                                  <div
                                    key={constraint.id}
                                    className={`p-2 rounded-lg ${colors.bg} border ${colors.border}`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={`text-[10px] font-semibold uppercase ${colors.text}`}>
                                        {constraint.type.replace('_', ' ')}
                                      </span>
                                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                                        {constraint.impact}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-gray-300">{constraint.description}</p>
                                    {constraint.affectedSegment && (
                                      <p className="text-[9px] text-gray-500 mt-1">
                                        Affects: {constraint.affectedSegment}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Stats Bar */}
          <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-dark-900 via-dark-900/95 to-transparent pt-8">
            <div className="flex items-center justify-center gap-8 px-6 py-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-cyan-400">{fleet.filter(t => t.status === 'active').length}</p>
                <p className="text-xs text-gray-400">Active Trucks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {fleet.reduce((sum, t) => sum + t.stops.filter(s => s.status === 'completed').length, 0)}
                </p>
                <p className="text-xs text-gray-400">Stops Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {fleet.reduce((sum, t) => sum + t.stops.filter(s => s.status === 'pending').length, 0)}
                </p>
                <p className="text-xs text-gray-400">Stops Remaining</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {fleet.length > 0 ? Math.round(fleet.reduce((sum, t) => sum + t.utilizationPercent, 0) / fleet.length) : 0}%
                </p>
                <p className="text-xs text-gray-400">Avg Utilization</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {Math.round(fleet.reduce((sum, t) => sum + t.totalRouteDistance, 0) / 1000)} km
                </p>
                <p className="text-xs text-gray-400">Total Route Distance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Showcase Components */}
      <ShowcaseControlPanel />
      <DataStreamVisualizer />
      <DockerStatusPanel />
      <TechStackShowcase />

      {/* Live Notifications */}
      {overlayVisibility.notifications && <DeliveryNotifications />}

      {/* Global CSS for animations */}
      <style jsx global>{`
        @keyframes truckPing {
          0% { transform: scale(1); opacity: 0.4; }
          75%, 100% { transform: scale(1.8); opacity: 0; }
        }

        .mapboxgl-popup-content {
          background: transparent !important;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .mapboxgl-popup-tip {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
