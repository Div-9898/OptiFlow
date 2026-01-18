'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from '@/lib/mapbox';
import { MAP_CONFIG, MAP_STYLES } from '@/lib/mapbox';

interface UseMapInstanceOptions {
  container: HTMLDivElement | null;
  darkMode?: boolean;
  onLoad?: (map: mapboxgl.Map) => void;
}

export function useMapInstance({ container, darkMode = true, onLoad }: UseMapInstanceOptions) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!container || mapRef.current) return;

    try {
      const map = new mapboxgl.Map({
        container,
        style: darkMode ? MAP_STYLES.dark : MAP_STYLES.light,
        ...MAP_CONFIG,
      });

      map.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      map.on('load', () => {
        setIsLoaded(true);
        
        // Add 3D building layer
        const layers = map.getStyle()?.layers;
        if (layers) {
          const labelLayerId = layers.find(
            (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
          )?.id;

          map.addLayer(
            {
              id: 'add-3d-buildings',
              source: 'composite',
              'source-layer': 'building',
              filter: ['==', 'extrude', 'true'],
              type: 'fill-extrusion',
              minzoom: 15,
              paint: {
                'fill-extrusion-color': darkMode ? '#1a1a2e' : '#aaa',
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'height'],
                ],
                'fill-extrusion-base': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  15,
                  0,
                  15.05,
                  ['get', 'min_height'],
                ],
                'fill-extrusion-opacity': 0.6,
              },
            },
            labelLayerId
          );
        }

        onLoad?.(map);
      });

      map.on('error', (e) => {
        console.error('Map error:', e);
        setError(e.error?.message || 'Map error occurred');
      });

      mapRef.current = map;

      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize map');
    }
  }, [container, darkMode, onLoad]);

  // Update style when dark mode changes
  useEffect(() => {
    if (mapRef.current && isLoaded) {
      mapRef.current.setStyle(darkMode ? MAP_STYLES.dark : MAP_STYLES.light);
    }
  }, [darkMode, isLoaded]);

  const flyTo = useCallback((center: [number, number], zoom?: number) => {
    mapRef.current?.flyTo({
      center,
      zoom: zoom || mapRef.current.getZoom(),
      duration: 1500,
      essential: true,
    });
  }, []);

  const fitBounds = useCallback(
    (bounds: [[number, number], [number, number]], padding?: number) => {
      mapRef.current?.fitBounds(bounds, {
        padding: padding || 50,
        duration: 1500,
      });
    },
    []
  );

  return {
    map: mapRef.current,
    isLoaded,
    error,
    flyTo,
    fitBounds,
  };
}
