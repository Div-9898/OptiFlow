'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from '@/lib/mapbox';
import { MAP_CONFIG, MAP_STYLES, VEHICLE_COLORS, DUBAI_CENTER } from '@/lib/mapbox';
import { useVehicleStore } from '@/stores/vehicleStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import VehiclePopup from './VehiclePopup';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MapContainer() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [popupVehicle, setPopupVehicle] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const { vehicles, selectedVehicleId, selectVehicle, vehicleTrails } = useVehicleStore();
  const { isDarkMode } = useDashboardStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: isDarkMode ? MAP_STYLES.dark : MAP_STYLES.light,
      ...MAP_CONFIG,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    map.current.on('load', () => {
      setIsLoaded(true);

      // Add 3D buildings
      const layers = map.current?.getStyle()?.layers;
      if (layers) {
        const labelLayerId = layers.find(
          (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
        )?.id;

        map.current?.addLayer(
          {
            id: '3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 14,
            paint: {
              'fill-extrusion-color': isDarkMode ? '#1a1a2e' : '#ddd',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.6,
            },
          },
          labelLayerId
        );
      }

      // Add route source
      map.current?.addSource('routes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.current?.addLayer({
        id: 'route-lines',
        type: 'line',
        source: 'routes',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });

      // Add trail source
      map.current?.addSource('trails', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });

      map.current?.addLayer({
        id: 'trail-lines',
        type: 'line',
        source: 'trails',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#00f5ff',
          'line-width': 2,
          'line-opacity': 0.4,
        },
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update style when dark mode changes
  useEffect(() => {
    if (map.current && isLoaded) {
      map.current.setStyle(isDarkMode ? MAP_STYLES.dark : MAP_STYLES.light);
    }
  }, [isDarkMode, isLoaded]);

  // Update vehicle markers
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const currentMarkers = markersRef.current;
    const vehicleIds = new Set(vehicles.keys());

    // Remove old markers
    currentMarkers.forEach((marker, id) => {
      if (!vehicleIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    // Update or create markers
    vehicles.forEach((vehicle, id) => {
      let marker = currentMarkers.get(id);

      if (marker) {
        // Update position with animation
        marker.setLngLat([vehicle.lng, vehicle.lat]);
        
        // Update rotation
        const el = marker.getElement();
        el.style.transform = `${el.style.transform.replace(/rotate\([^)]*\)/, '')} rotate(${vehicle.heading}deg)`;
      } else {
        // Create new marker
        const el = document.createElement('div');
        el.className = 'vehicle-marker';
        el.innerHTML = `
          <div class="relative">
            <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
                 style="background: ${VEHICLE_COLORS[vehicle.status]}; box-shadow: 0 0 10px ${VEHICLE_COLORS[vehicle.status]};">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M5 17h-2v-6l2-5h10l2 5v6h-2m-6 0h-4m14 0a2 2 0 100-4 2 2 0 000 4zm-14 0a2 2 0 100-4 2 2 0 000 4z"/>
              </svg>
            </div>
            ${vehicle.status === 'active' ? `
              <div class="absolute -inset-1 rounded-full opacity-50 animate-ping"
                   style="background: ${VEHICLE_COLORS[vehicle.status]};"></div>
            ` : ''}
          </div>
        `;

        el.style.cursor = 'pointer';
        el.style.transform = `rotate(${vehicle.heading}deg)`;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          selectVehicle(id);
        });

        el.addEventListener('mouseenter', (e) => {
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          setPopupPosition({ x: rect.left + rect.width / 2, y: rect.top });
          setPopupVehicle(id);
        });

        el.addEventListener('mouseleave', () => {
          setPopupVehicle(null);
        });

        marker = new mapboxgl.Marker({ element: el })
          .setLngLat([vehicle.lng, vehicle.lat])
          .addTo(map.current!);

        currentMarkers.set(id, marker);
      }
    });
  }, [vehicles, isLoaded, selectVehicle]);

  // Update trails
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const features = Array.from(vehicleTrails.entries()).map(([vehicleId, trail]) => ({
      type: 'Feature' as const,
      properties: { vehicleId },
      geometry: {
        type: 'LineString' as const,
        coordinates: trail.map((p) => [p.lng, p.lat]),
      },
    }));

    const source = map.current.getSource('trails') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData({ type: 'FeatureCollection', features });
    }
  }, [vehicleTrails, isLoaded]);

  // Fly to selected vehicle
  useEffect(() => {
    if (!map.current || !selectedVehicleId) return;

    const vehicle = vehicles.get(selectedVehicleId);
    if (vehicle) {
      map.current.flyTo({
        center: [vehicle.lng, vehicle.lat],
        zoom: 15,
        duration: 1500,
      });
    }
  }, [selectedVehicleId, vehicles]);

  const hoveredVehicle = popupVehicle ? vehicles.get(popupVehicle) : null;

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" style={{ minHeight: '400px' }} />

      {/* Loading overlay */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark-900 flex items-center justify-center"
          >
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-accent-cyan border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-gray-400">Loading map...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vehicle Popup */}
      <AnimatePresence>
        {hoveredVehicle && (
          <VehiclePopup
            vehicle={hoveredVehicle}
            position={popupPosition}
          />
        )}
      </AnimatePresence>

      {/* Map Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => map.current?.flyTo({ center: DUBAI_CENTER, zoom: 12, duration: 1500 })}
          className="p-2 bg-dark-800/90 backdrop-blur-sm rounded-lg text-gray-400 hover:text-white transition-colors"
          title="Reset View"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
