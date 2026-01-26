/**
 * Fleet Routes Manager - Uses Mapbox Directions API for real road routes
 * Handles route fetching, caching, and smooth animation along actual roads
 */

export interface RouteCoordinate {
  lng: number;
  lat: number;
}

export interface RouteSegment {
  coordinates: RouteCoordinate[];
  distance: number; // meters
  duration: number; // seconds
}

export interface Stop {
  id: string;
  lat: number;
  lng: number;
  name: string;
  type: 'depot' | 'pickup' | 'delivery' | 'destination';
  address: string;
  scheduledTime: string;
  status: 'completed' | 'current' | 'pending';
  packages?: number;
}

export interface CargoItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
  destination: string;
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  hoursToday: number;
  deliveriesToday: number;
  phone: string;
  email: string;
  licenseExpiry: string;
  certifications: string[];
}

export interface RouteConstraint {
  id: string;
  type: 'traffic' | 'time_window' | 'capacity' | 'road_restriction' | 'weather' | 'regulatory';
  description: string;
  impact: 'low' | 'medium' | 'high';
  affectedSegment?: string;
  active: boolean;
}

export interface OptimizationResult {
  originalDistance: number;
  optimizedDistance: number;
  originalDuration: number;
  optimizedDuration: number;
  savingsPercent: number;
  appliedStrategies: string[];
}

// Driver biometrics from fitness band/wearable device
export interface DriverBiometrics {
  // Heart rate monitoring
  heartRate: number; // bpm (60-100 normal)
  heartRateVariability: number; // ms (20-200 normal, lower = stress)

  // Fatigue indicators
  fatigueScore: number; // 0-100 (0 = alert, 100 = extremely fatigued)
  alertnessLevel: 'high' | 'normal' | 'low' | 'critical';
  eyeBlinkRate: number; // blinks per minute (15-20 normal, higher = fatigue)

  // Stress & wellness
  stressLevel: number; // 0-100
  bodyTemperature: number; // Celsius (36.1-37.2 normal)
  bloodOxygen: number; // SpO2 % (95-100 normal)

  // Activity
  stepCount: number;
  hoursAwake: number;
  lastBreakMinutesAgo: number;

  // Device info
  deviceId: string;
  deviceBattery: number; // %
  lastSync: string; // ISO timestamp
  signalStrength: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface FleetTruck {
  id: string;
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  color: string;
  driver: Driver;

  // Stops
  stops: Stop[];
  currentStopIndex: number;

  // Route geometry from Mapbox
  routeGeometry: RouteCoordinate[];
  totalRouteDistance: number; // meters
  totalRouteDuration: number; // seconds

  // Current position along route
  routeProgress: number; // 0-1 along total route
  currentCoordIndex: number; // index in routeGeometry
  currentLat: number;
  currentLng: number;
  heading: number;
  speed: number; // km/h

  // Cargo
  cargo: CargoItem[];
  capacityKg: number;
  usedCapacityKg: number;
  utilizationPercent: number;

  // Metrics
  completedDistanceKm: number;
  estimatedArrival: string;
  status: 'active' | 'idle' | 'returning' | 'loading';

  // Route-specific constraints
  constraints: RouteConstraint[];
  optimizationResult: OptimizationResult;

  // Driver biometrics from wearable device
  biometrics: DriverBiometrics;
}

// Dubai locations with real coordinates
const DUBAI_LOCATIONS = {
  jebel_ali: { lat: 25.0185, lng: 55.0272, name: 'Jebel Ali Port', address: 'Jebel Ali Free Zone' },
  downtown: { lat: 25.1972, lng: 55.2744, name: 'Downtown Dubai', address: 'Sheikh Mohammed bin Rashid Blvd' },
  marina: { lat: 25.0805, lng: 55.1403, name: 'Dubai Marina', address: 'Marina Walk' },
  deira: { lat: 25.2697, lng: 55.3095, name: 'Deira', address: 'Al Rigga Road' },
  jumeirah: { lat: 25.2048, lng: 55.2538, name: 'Jumeirah', address: 'Jumeirah Beach Road' },
  business_bay: { lat: 25.1860, lng: 55.2674, name: 'Business Bay', address: 'Marasi Drive' },
  al_quoz: { lat: 25.1336, lng: 55.2272, name: 'Al Quoz', address: 'Al Quoz Industrial 3' },
  internet_city: { lat: 25.0953, lng: 55.1530, name: 'Internet City', address: 'Dubai Internet City' },
  dubai_mall: { lat: 25.1985, lng: 55.2796, name: 'Dubai Mall', address: 'Financial Center Road' },
  ibn_battuta: { lat: 25.0441, lng: 55.1174, name: 'Ibn Battuta Mall', address: 'Sheikh Zayed Road' },
  dragon_mart: { lat: 25.1722, lng: 55.4194, name: 'Dragon Mart', address: 'International City' },
  mirdif: { lat: 25.2167, lng: 55.4167, name: 'Mirdif City Centre', address: 'Mirdif' },
  silicon_oasis: { lat: 25.1212, lng: 55.3811, name: 'Silicon Oasis', address: 'Dubai Silicon Oasis' },
  festival_city: { lat: 25.2261, lng: 55.3538, name: 'Festival City', address: 'Dubai Festival City' },
  motor_city: { lat: 25.0481, lng: 55.2358, name: 'Motor City', address: 'Dubai Motor City' },
};

const DRIVER_NAMES = [
  { name: 'Ahmed Hassan', avatar: '👨🏽' },
  { name: 'Raj Patel', avatar: '👨🏾' },
  { name: 'Mohammad Ali', avatar: '👨🏻' },
  { name: 'Carlos Silva', avatar: '👨🏽' },
  { name: 'Wei Chen', avatar: '👨🏻' },
  { name: 'Yusuf Ibrahim', avatar: '👨🏿' },
];

const CARGO_ITEMS = [
  'Electronics', 'Furniture', 'Appliances', 'Medical Supplies',
  'Food & Beverages', 'Construction Materials', 'Textiles', 'Auto Parts',
];

const ROUTE_COLORS = [
  '#00f5ff', // Cyan
  '#39ff14', // Lime
  '#ff6b6b', // Coral
  '#ffd93d', // Yellow
  '#6bcb77', // Green
  '#4d96ff', // Blue
];

const DRIVER_EMAILS = [
  'ahmed.hassan@dubailogistics.ae',
  'raj.patel@dubailogistics.ae',
  'mohammad.ali@dubailogistics.ae',
  'carlos.silva@dubailogistics.ae',
  'wei.chen@dubailogistics.ae',
  'yusuf.ibrahim@dubailogistics.ae',
];

const CERTIFICATIONS = [
  'Heavy Vehicle License',
  'Hazmat Certified',
  'Cold Chain Certified',
  'First Aid Trained',
  'Defensive Driving',
  'GPS Navigation Expert',
];

/**
 * Generate route-specific constraints based on stops and route characteristics
 */
function generateRouteConstraints(stops: Stop[], totalDistance: number): RouteConstraint[] {
  const constraints: RouteConstraint[] = [];
  const stopNames = stops.map(s => s.name);

  // Traffic constraints based on route
  if (stopNames.some(n => n.includes('Downtown') || n.includes('Business Bay'))) {
    constraints.push({
      id: `traffic-${Date.now()}-1`,
      type: 'traffic',
      description: 'Heavy traffic expected on Sheikh Zayed Road during peak hours (7-9 AM, 5-7 PM)',
      impact: 'high',
      affectedSegment: 'Downtown Dubai - Business Bay corridor',
      active: true,
    });
  }

  if (stopNames.some(n => n.includes('Marina') || n.includes('JBR'))) {
    constraints.push({
      id: `traffic-${Date.now()}-2`,
      type: 'traffic',
      description: 'Marina area congestion during weekend evenings',
      impact: 'medium',
      affectedSegment: 'Dubai Marina - JBR area',
      active: true,
    });
  }

  // Time window constraints
  stops.forEach((stop, idx) => {
    if (stop.type === 'delivery' && idx > 0) {
      constraints.push({
        id: `time-${Date.now()}-${idx}`,
        type: 'time_window',
        description: `Delivery window at ${stop.name}: ${stop.scheduledTime} (±30 min)`,
        impact: 'medium',
        affectedSegment: stop.name,
        active: true,
      });
    }
  });

  // Capacity constraint
  constraints.push({
    id: `capacity-${Date.now()}`,
    type: 'capacity',
    description: 'Vehicle weight limit must not exceed rated capacity',
    impact: 'high',
    active: true,
  });

  // Road restrictions based on locations
  if (stopNames.some(n => n.includes('Downtown') || n.includes('Mall'))) {
    constraints.push({
      id: `road-${Date.now()}-1`,
      type: 'road_restriction',
      description: 'Heavy vehicles restricted in Downtown area 6 AM - 10 PM',
      impact: 'high',
      affectedSegment: 'Downtown Dubai',
      active: true,
    });
  }

  if (stopNames.some(n => n.includes('Jebel Ali'))) {
    constraints.push({
      id: `road-${Date.now()}-2`,
      type: 'road_restriction',
      description: 'Port access requires valid gate pass and security clearance',
      impact: 'medium',
      affectedSegment: 'Jebel Ali Port',
      active: true,
    });
  }

  // Weather constraint (random)
  if (Math.random() > 0.7) {
    constraints.push({
      id: `weather-${Date.now()}`,
      type: 'weather',
      description: 'High temperature advisory - AC cargo monitoring required',
      impact: 'low',
      active: true,
    });
  }

  // Regulatory constraint for long routes
  if (totalDistance > 50000) {
    constraints.push({
      id: `regulatory-${Date.now()}`,
      type: 'regulatory',
      description: 'Driver rest required after 4 hours continuous driving (UAE labor law)',
      impact: 'medium',
      active: true,
    });
  }

  return constraints;
}

/**
 * Generate optimization result for a route
 */
function generateOptimizationResult(totalDistance: number, totalDuration: number): OptimizationResult {
  const savingsPercent = 15 + Math.random() * 20; // 15-35% savings
  const originalDistance = totalDistance * (1 + savingsPercent / 100);
  const originalDuration = totalDuration * (1 + savingsPercent / 100);

  const strategies = [
    'Reordered stops for minimal backtracking',
    'Applied traffic-aware routing',
    'Optimized time windows alignment',
    'Consolidated nearby deliveries',
    'Avoided peak hour congestion zones',
    'Selected routes with lower fuel consumption',
  ];

  // Select 2-4 random strategies
  const numStrategies = 2 + Math.floor(Math.random() * 3);
  const appliedStrategies: string[] = [];
  const shuffled = strategies.sort(() => Math.random() - 0.5);
  for (let i = 0; i < numStrategies; i++) {
    appliedStrategies.push(shuffled[i]);
  }

  return {
    originalDistance,
    optimizedDistance: totalDistance,
    originalDuration,
    optimizedDuration: totalDuration,
    savingsPercent,
    appliedStrategies,
  };
}

// Cache for route geometries
const routeCache = new Map<string, RouteCoordinate[]>();

/**
 * Fetch route from Mapbox Directions API
 */
export async function fetchRouteFromMapbox(
  stops: { lng: number; lat: number }[],
  accessToken: string
): Promise<{ coordinates: RouteCoordinate[]; distance: number; duration: number } | null> {
  if (stops.length < 2) return null;

  // Create cache key
  const cacheKey = stops.map(s => `${s.lng.toFixed(4)},${s.lat.toFixed(4)}`).join('|');

  // Check cache first
  if (routeCache.has(cacheKey)) {
    return {
      coordinates: routeCache.get(cacheKey)!,
      distance: 0,
      duration: 0
    };
  }

  // Build coordinates string for API
  const coordsString = stops.map(s => `${s.lng},${s.lat}`).join(';');

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coordsString}?` +
    `geometries=geojson&overview=full&access_token=${accessToken}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coordinates: RouteCoordinate[] = route.geometry.coordinates.map(
        (coord: [number, number]) => ({ lng: coord[0], lat: coord[1] })
      );

      // Cache the result
      routeCache.set(cacheKey, coordinates);

      return {
        coordinates,
        distance: route.distance, // meters
        duration: route.duration, // seconds
      };
    }
  } catch (error) {
    console.error('Failed to fetch route from Mapbox:', error);
  }

  return null;
}

/**
 * Calculate bearing between two points
 */
function calculateBearing(from: RouteCoordinate, to: RouteCoordinate): number {
  const dLng = (to.lng - from.lng) * Math.PI / 180;
  const lat1 = from.lat * Math.PI / 180;
  const lat2 = to.lat * Math.PI / 180;

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

/**
 * Interpolate position along route geometry
 */
export function interpolatePosition(
  geometry: RouteCoordinate[],
  progress: number // 0-1
): { lat: number; lng: number; heading: number; coordIndex: number } {
  if (geometry.length === 0) {
    return { lat: 25.1, lng: 55.2, heading: 0, coordIndex: 0 };
  }

  if (geometry.length === 1) {
    return { lat: geometry[0].lat, lng: geometry[0].lng, heading: 0, coordIndex: 0 };
  }

  // Clamp progress
  const p = Math.max(0, Math.min(1, progress));

  // Find position in geometry
  const totalSegments = geometry.length - 1;
  const exactIndex = p * totalSegments;
  const segmentIndex = Math.floor(exactIndex);
  const segmentProgress = exactIndex - segmentIndex;

  // Handle edge case at end
  if (segmentIndex >= totalSegments) {
    const last = geometry[geometry.length - 1];
    const prev = geometry[geometry.length - 2];
    return {
      lat: last.lat,
      lng: last.lng,
      heading: calculateBearing(prev, last),
      coordIndex: geometry.length - 1
    };
  }

  const from = geometry[segmentIndex];
  const to = geometry[segmentIndex + 1];

  // Linear interpolation
  const lat = from.lat + (to.lat - from.lat) * segmentProgress;
  const lng = from.lng + (to.lng - from.lng) * segmentProgress;
  const heading = calculateBearing(from, to);

  return { lat, lng, heading, coordIndex: segmentIndex };
}

/**
 * Generate predefined routes for demo (fallback if API fails)
 */
function generateFallbackRoute(stops: Stop[]): RouteCoordinate[] {
  // Create a simple route with some intermediate points
  const coords: RouteCoordinate[] = [];

  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i];
    const to = stops[i + 1];

    // Add start point
    coords.push({ lat: from.lat, lng: from.lng });

    // Add intermediate points to simulate road curvature
    const numIntermediate = 10;
    for (let j = 1; j < numIntermediate; j++) {
      const t = j / numIntermediate;
      // Add slight randomization to simulate road paths
      const offset = Math.sin(t * Math.PI) * 0.002 * (Math.random() - 0.5);
      coords.push({
        lat: from.lat + (to.lat - from.lat) * t + offset,
        lng: from.lng + (to.lng - from.lng) * t + offset
      });
    }
  }

  // Add final destination
  const lastStop = stops[stops.length - 1];
  coords.push({ lat: lastStop.lat, lng: lastStop.lng });

  return coords;
}

/**
 * Initialize fleet with routes from Mapbox
 */
export async function initializeFleet(
  count: number,
  accessToken: string,
  onProgress?: (loaded: number, total: number) => void
): Promise<FleetTruck[]> {
  const fleet: FleetTruck[] = [];
  const locationKeys = Object.keys(DUBAI_LOCATIONS);

  for (let i = 0; i < count; i++) {
    // Select random stops
    const numStops = 3 + Math.floor(Math.random() * 3); // 3-5 stops
    const selectedLocations: string[] = [];

    // Always start from Jebel Ali (main logistics hub)
    selectedLocations.push('jebel_ali');

    // Select random intermediate stops
    while (selectedLocations.length < numStops) {
      const key = locationKeys[Math.floor(Math.random() * locationKeys.length)];
      if (!selectedLocations.includes(key) && key !== 'jebel_ali') {
        selectedLocations.push(key);
      }
    }

    // End back at depot or different location
    if (Math.random() > 0.5) {
      selectedLocations.push('jebel_ali');
    }

    // Create stops
    const stops: Stop[] = selectedLocations.map((key, idx) => {
      const loc = DUBAI_LOCATIONS[key as keyof typeof DUBAI_LOCATIONS];
      const isFirst = idx === 0;
      const isLast = idx === selectedLocations.length - 1;

      return {
        id: `stop-${i}-${idx}`,
        lat: loc.lat,
        lng: loc.lng,
        name: loc.name,
        address: loc.address,
        type: isFirst ? 'depot' : isLast ? 'destination' : (Math.random() > 0.3 ? 'delivery' : 'pickup'),
        scheduledTime: `${(8 + idx).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} AM`,
        status: 'pending',
        packages: isFirst || isLast ? 0 : Math.floor(Math.random() * 5) + 1
      };
    });

    // Fetch real route from Mapbox
    const routePoints = stops.map(s => ({ lng: s.lng, lat: s.lat }));
    let routeData = await fetchRouteFromMapbox(routePoints, accessToken);

    // Use fallback if API fails
    let routeGeometry: RouteCoordinate[];
    let totalDistance: number;
    let totalDuration: number;

    if (routeData) {
      routeGeometry = routeData.coordinates;
      totalDistance = routeData.distance;
      totalDuration = routeData.duration;
    } else {
      routeGeometry = generateFallbackRoute(stops);
      totalDistance = 30000 + Math.random() * 50000; // 30-80 km in meters
      totalDuration = 1800 + Math.random() * 3600; // 30-90 minutes
    }

    // Generate cargo
    const cargo: CargoItem[] = [];
    const numCargoItems = 2 + Math.floor(Math.random() * 4);
    for (let c = 0; c < numCargoItems; c++) {
      cargo.push({
        id: `cargo-${i}-${c}`,
        name: CARGO_ITEMS[Math.floor(Math.random() * CARGO_ITEMS.length)],
        quantity: Math.floor(Math.random() * 10) + 1,
        weight: Math.floor(Math.random() * 200) + 10,
        destination: stops[Math.floor(Math.random() * (stops.length - 1)) + 1]?.name || 'Unknown'
      });
    }

    const capacityKg = 2000 + Math.floor(Math.random() * 3000);
    const usedCapacityKg = cargo.reduce((sum, c) => sum + c.weight * c.quantity, 0);

    // Set initial position and progress
    const initialProgress = 0.05 + Math.random() * 0.6; // 5-65% along route
    const initialPosition = interpolatePosition(routeGeometry, initialProgress);

    // Update stop statuses based on progress
    const stopProgressStep = 1 / (stops.length - 1);
    stops.forEach((stop, idx) => {
      const stopProgress = idx * stopProgressStep;
      if (initialProgress > stopProgress + stopProgressStep * 0.5) {
        stop.status = 'completed';
      } else if (initialProgress > stopProgress - stopProgressStep * 0.5) {
        stop.status = 'current';
      }
    });

    const driverInfo = DRIVER_NAMES[i % DRIVER_NAMES.length];
    const driverEmail = DRIVER_EMAILS[i % DRIVER_EMAILS.length];

    // Generate route-specific constraints
    const constraints = generateRouteConstraints(stops, totalDistance);
    const optimizationResult = generateOptimizationResult(totalDistance, totalDuration);

    // Select random certifications (2-4)
    const numCerts = 2 + Math.floor(Math.random() * 3);
    const shuffledCerts = [...CERTIFICATIONS].sort(() => Math.random() - 0.5);
    const driverCerts = shuffledCerts.slice(0, numCerts);

    // Generate license expiry date (6-24 months from now)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6 + Math.floor(Math.random() * 18));
    const licenseExpiry = expiryDate.toLocaleDateString('en-AE', { year: 'numeric', month: 'short', day: 'numeric' });

    fleet.push({
      id: `truck-${i}`,
      vehicleId: `VH-${(1001 + i).toString()}`,
      vehicleName: `Truck ${String.fromCharCode(65 + i)}`,
      licensePlate: `DXB-${Math.floor(Math.random() * 9000) + 1000}`,
      color: ROUTE_COLORS[i % ROUTE_COLORS.length],

      driver: {
        id: `driver-${i}`,
        name: driverInfo.name,
        avatar: driverInfo.avatar,
        rating: 4 + Math.random(),
        hoursToday: Math.floor(Math.random() * 6) + 2,
        deliveriesToday: Math.floor(Math.random() * 15) + 5,
        phone: `+971 50 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`,
        email: driverEmail,
        licenseExpiry,
        certifications: driverCerts,
      },

      stops,
      currentStopIndex: stops.findIndex(s => s.status === 'current') || 0,

      routeGeometry,
      totalRouteDistance: totalDistance,
      totalRouteDuration: totalDuration,

      routeProgress: initialProgress,
      currentCoordIndex: initialPosition.coordIndex,
      currentLat: initialPosition.lat,
      currentLng: initialPosition.lng,
      heading: initialPosition.heading,
      speed: 35 + Math.floor(Math.random() * 30), // 35-65 km/h (more stable range)

      cargo,
      capacityKg,
      usedCapacityKg,
      utilizationPercent: Math.round((usedCapacityKg / capacityKg) * 100),

      completedDistanceKm: Math.round((totalDistance * initialProgress) / 1000),
      estimatedArrival: `${Math.floor((totalDuration * (1 - initialProgress)) / 60)} min`,
      status: Math.random() > 0.15 ? 'active' : 'idle',

      constraints,
      optimizationResult,

      biometrics: generateDriverBiometrics(`driver-${i}`, Math.floor(Math.random() * 6) + 2),
    });

    if (onProgress) {
      onProgress(i + 1, count);
    }
  }

  return fleet;
}

/**
 * Generate initial biometrics for a driver
 */
function generateDriverBiometrics(driverId: string, hoursWorked: number): DriverBiometrics {
  // Fatigue increases with hours worked
  const baseFatigue = Math.min(20 + hoursWorked * 8, 70);
  const fatigueVariation = (Math.random() - 0.5) * 10;
  const fatigueScore = Math.max(0, Math.min(100, baseFatigue + fatigueVariation));

  // Determine alertness level based on fatigue
  let alertnessLevel: DriverBiometrics['alertnessLevel'] = 'high';
  if (fatigueScore > 70) alertnessLevel = 'critical';
  else if (fatigueScore > 50) alertnessLevel = 'low';
  else if (fatigueScore > 30) alertnessLevel = 'normal';

  // Heart rate varies with stress and activity
  const baseHeartRate = 65 + Math.random() * 15;
  const heartRate = Math.round(baseHeartRate + (fatigueScore / 10));

  // HRV decreases under stress
  const hrv = Math.round(80 - (fatigueScore / 2) + (Math.random() - 0.5) * 20);

  // Eye blink rate increases with fatigue
  const eyeBlinkRate = Math.round(15 + (fatigueScore / 5) + (Math.random() - 0.5) * 4);

  // Stress correlates with fatigue but has its own variation
  const stressLevel = Math.round(Math.max(0, Math.min(100, fatigueScore * 0.8 + (Math.random() - 0.5) * 20)));

  const signalStrengths: DriverBiometrics['signalStrength'][] = ['excellent', 'good', 'good', 'fair'];

  return {
    heartRate: Math.round(heartRate),
    heartRateVariability: Math.max(20, Math.min(120, hrv)),
    fatigueScore: Math.round(fatigueScore),
    alertnessLevel,
    eyeBlinkRate,
    stressLevel,
    bodyTemperature: 36.1 + Math.random() * 1.1,
    bloodOxygen: 95 + Math.random() * 5,
    stepCount: Math.floor(Math.random() * 5000) + 2000,
    hoursAwake: 6 + hoursWorked + Math.random() * 4,
    lastBreakMinutesAgo: Math.floor(Math.random() * 90) + 15,
    deviceId: `BAND-${driverId.toUpperCase().slice(-4)}`,
    deviceBattery: 40 + Math.floor(Math.random() * 55),
    lastSync: new Date().toISOString(),
    signalStrength: signalStrengths[Math.floor(Math.random() * signalStrengths.length)],
  };
}

// Track biometrics state for each driver (keyed by deviceId)
const biometricsState: Map<string, {
  targetHeartRate: number;
  targetHRV: number;
  targetStress: number;
  targetBlink: number;
  targetTemp: number;
  targetO2: number;
  lastFastUpdate: number;  // For fast-changing metrics (HR, HRV, stress, blink)
  lastSlowUpdate: number;  // For slow-changing metrics (temp, O2)
}> = new Map();

// Update intervals in milliseconds
const FAST_UPDATE_INTERVAL = 1000;  // 1 second for fluctuating metrics
const SLOW_UPDATE_INTERVAL = 5000;  // 5 seconds for stable metrics

/**
 * Update biometrics data (simulates real-time wearable streaming)
 * Fast-changing metrics update every 1 second (HR, HRV, stress, blink rate)
 * Slow-changing metrics update every 5 seconds (temp, O2)
 */
function updateBiometrics(biometrics: DriverBiometrics, deltaTime: number): DriverBiometrics {
  const now = Date.now();
  const deviceId = biometrics.deviceId;

  // Get or initialize state for this driver
  let state = biometricsState.get(deviceId);
  if (!state) {
    state = {
      targetHeartRate: biometrics.heartRate,
      targetHRV: biometrics.heartRateVariability,
      targetStress: biometrics.stressLevel,
      targetBlink: biometrics.eyeBlinkRate,
      targetTemp: biometrics.bodyTemperature,
      targetO2: biometrics.bloodOxygen,
      lastFastUpdate: now,
      lastSlowUpdate: now
    };
    biometricsState.set(deviceId, state);
  }

  // Check if it's time to update fast-changing metrics (every 1 second)
  const timeSinceFastUpdate = now - state.lastFastUpdate;
  const shouldUpdateFast = timeSinceFastUpdate >= FAST_UPDATE_INTERVAL;

  // Check if it's time to update slow-changing metrics (every 5 seconds)
  const timeSinceSlowUpdate = now - state.lastSlowUpdate;
  const shouldUpdateSlow = timeSinceSlowUpdate >= SLOW_UPDATE_INTERVAL;

  const fatigueInfluence = biometrics.fatigueScore / 100;

  if (shouldUpdateFast) {
    // Update fast-changing metrics every 1 second
    // Heart rate: base 65-75, increases with fatigue, varies ±4 bpm
    const baseHR = 68 + fatigueInfluence * 12;
    state.targetHeartRate = baseHR + (Math.random() - 0.5) * 8;

    // HRV: base 60-80, decreases with fatigue and stress, varies ±5
    const baseHRV = 70 - fatigueInfluence * 15 - (biometrics.stressLevel / 100) * 10;
    state.targetHRV = baseHRV + (Math.random() - 0.5) * 10;

    // Stress: correlates with fatigue, varies ±5
    const baseStress = 20 + fatigueInfluence * 35;
    state.targetStress = baseStress + (Math.random() - 0.5) * 10;

    // Blink rate: 14-20, varies ±2
    const baseBlink = 15 + fatigueInfluence * 4;
    state.targetBlink = baseBlink + (Math.random() - 0.5) * 4;

    state.lastFastUpdate = now;
  }

  if (shouldUpdateSlow) {
    // Update slow-changing metrics every 5 seconds
    // Body temp: very stable 36.3-36.7
    state.targetTemp = 36.5 + (Math.random() - 0.5) * 0.4;

    // Blood oxygen: stable 96-99
    state.targetO2 = 97.5 + (Math.random() - 0.5) * 2;

    state.lastSlowUpdate = now;
  }

  // Faster interpolation for responsive real-time feeling
  const fastLerpFactor = 0.25; // 25% toward target each frame for fast metrics
  const slowLerpFactor = 0.1;  // 10% for slow metrics

  // Fast metrics - more responsive interpolation
  const newHeartRate = biometrics.heartRate + (state.targetHeartRate - biometrics.heartRate) * fastLerpFactor;
  const newHRV = biometrics.heartRateVariability + (state.targetHRV - biometrics.heartRateVariability) * fastLerpFactor;
  const newStress = biometrics.stressLevel + (state.targetStress - biometrics.stressLevel) * fastLerpFactor;
  const newBlinkRate = biometrics.eyeBlinkRate + (state.targetBlink - biometrics.eyeBlinkRate) * fastLerpFactor;

  // Slow metrics - more stable interpolation
  const newTemp = biometrics.bodyTemperature + (state.targetTemp - biometrics.bodyTemperature) * slowLerpFactor;
  const newO2 = biometrics.bloodOxygen + (state.targetO2 - biometrics.bloodOxygen) * slowLerpFactor;

  // Fatigue slowly increases over time
  const fatigueIncrease = deltaTime * 0.008;
  const newFatigue = Math.max(0, Math.min(100, biometrics.fatigueScore + fatigueIncrease));

  // Update alertness based on fatigue
  let alertnessLevel: DriverBiometrics['alertnessLevel'] = 'high';
  if (newFatigue > 70) alertnessLevel = 'critical';
  else if (newFatigue > 50) alertnessLevel = 'low';
  else if (newFatigue > 30) alertnessLevel = 'normal';

  // Increment time since break
  const newBreakTime = biometrics.lastBreakMinutesAgo + deltaTime * 0.08;

  return {
    ...biometrics,
    heartRate: Math.round(Math.max(58, Math.min(105, newHeartRate))),
    heartRateVariability: Math.round(Math.max(25, Math.min(95, newHRV))),
    fatigueScore: Math.round(newFatigue),
    alertnessLevel,
    eyeBlinkRate: Math.round(Math.max(12, Math.min(22, newBlinkRate))),
    stressLevel: Math.round(Math.max(10, Math.min(80, newStress))),
    bodyTemperature: Number(Math.max(36.2, Math.min(37.0, newTemp)).toFixed(1)),
    bloodOxygen: Math.round(Math.max(95, Math.min(99, newO2))),
    lastBreakMinutesAgo: Math.round(newBreakTime),
    lastSync: new Date().toISOString(),
  };
}

/**
 * Update truck positions along their routes (call every animation frame)
 */
export function updateFleetPositions(
  fleet: FleetTruck[],
  deltaProgress: number = 0.0003 // How much to advance per frame
): FleetTruck[] {
  return fleet.map(truck => {
    if (truck.status !== 'active') return truck;

    // Advance progress
    let newProgress = truck.routeProgress + deltaProgress;

    // Loop back to start when complete (for demo)
    if (newProgress >= 1) {
      newProgress = 0;
      // Reset stop statuses
      truck.stops.forEach((stop, idx) => {
        stop.status = idx === 0 ? 'current' : 'pending';
      });
    }

    // Get new position from route geometry
    const newPosition = interpolatePosition(truck.routeGeometry, newProgress);

    // Update stop statuses based on progress
    const stopProgressStep = 1 / (truck.stops.length - 1);
    let currentStopIndex = 0;

    truck.stops.forEach((stop, idx) => {
      const stopProgress = idx * stopProgressStep;
      if (newProgress > stopProgress + stopProgressStep * 0.3) {
        stop.status = 'completed';
        currentStopIndex = idx + 1;
      } else if (newProgress > stopProgress - stopProgressStep * 0.3) {
        stop.status = 'current';
        currentStopIndex = idx;
      } else {
        stop.status = 'pending';
      }
    });

    // Vary speed slightly for realism (reduced fluctuation: -0.5 to +0.5 km/h per frame)
    const speedVariation = (Math.random() - 0.5) * 1;
    const newSpeed = Math.max(25, Math.min(75, truck.speed + speedVariation));

    return {
      ...truck,
      routeProgress: newProgress,
      currentCoordIndex: newPosition.coordIndex,
      currentLat: newPosition.lat,
      currentLng: newPosition.lng,
      heading: newPosition.heading,
      speed: Math.round(newSpeed),
      currentStopIndex: Math.min(currentStopIndex, truck.stops.length - 1),
      completedDistanceKm: Math.round((truck.totalRouteDistance * newProgress) / 1000),
      estimatedArrival: `${Math.floor((truck.totalRouteDuration * (1 - newProgress)) / 60)} min`,
      biometrics: updateBiometrics(truck.biometrics, 1), // Update biometrics each frame
    };
  });
}

/**
 * Get position update for data stream
 */
export function getPositionUpdate(truck: FleetTruck) {
  return {
    vehicleId: truck.vehicleId,
    lat: truck.currentLat,
    lng: truck.currentLng,
    heading: truck.heading,
    speed: truck.speed,
    progress: Math.round(truck.routeProgress * 100),
    currentStop: truck.stops[truck.currentStopIndex]?.name || 'En Route',
    timestamp: new Date().toISOString()
  };
}
