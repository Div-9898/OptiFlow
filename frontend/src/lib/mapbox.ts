import mapboxgl from 'mapbox-gl';

// Initialize Mapbox access token
if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
}

export const MAP_STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  navigation: 'mapbox://styles/mapbox/navigation-night-v1',
} as const;

// Dubai coordinates
export const DUBAI_CENTER: [number, number] = [55.2708, 25.2048];
export const DUBAI_BOUNDS: [[number, number], [number, number]] = [
  [54.9, 24.8], // Southwest
  [55.6, 25.5], // Northeast
];

export const DEFAULT_ZOOM = 12;
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 18;

// Map configuration
export const MAP_CONFIG = {
  center: DUBAI_CENTER,
  zoom: DEFAULT_ZOOM,
  minZoom: MIN_ZOOM,
  maxZoom: MAX_ZOOM,
  pitch: 45,
  bearing: -17.6,
  antialias: true,
};

// Vehicle marker colors by status
export const VEHICLE_COLORS = {
  active: '#39ff14',    // Neon lime
  idle: '#fbbf24',      // Amber
  maintenance: '#f97316', // Orange
  offline: '#6b7280',   // Gray
} as const;

// Risk level colors
export const RISK_COLORS = {
  low: '#10b981',       // Emerald
  medium: '#f59e0b',    // Amber
  high: '#ef4444',      // Red
  critical: '#dc2626',  // Dark red
} as const;

// Route colors for different vehicles
export const ROUTE_COLORS = [
  '#00f5ff', // Cyan
  '#ff00ff', // Magenta
  '#39ff14', // Lime
  '#ff6b35', // Orange
  '#a855f7', // Purple
  '#06b6d4', // Teal
  '#f43f5e', // Rose
  '#84cc16', // Lime
  '#8b5cf6', // Violet
  '#14b8a6', // Teal
];

export const getRouteColor = (index: number): string => {
  return ROUTE_COLORS[index % ROUTE_COLORS.length];
};

export default mapboxgl;
