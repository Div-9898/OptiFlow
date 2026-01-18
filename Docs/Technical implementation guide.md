
TECHNICAL IMPLEMENTATION GUIDE
Logistics AI Platform
Step-by-Step Developer Guide for Building an AI-Powered
Logistics Operations Platform with Real-Time Visualization
Version 1.0 | January 2026
 
Table of Contents
Table of Contents	1
1. Introduction	1
1.1 Prerequisites	1
1.2 System Requirements	1
2. Project Initialization	1
2.1 Repository Structure	1
2.2 Environment Configuration	1
3. Frontend Implementation	1
3.1 Next.js Project Setup	1
3.2 Install Dependencies	1
3.3 Mapbox Integration	1
3.3.1 Configuration File	1
3.3.2 Map Container Component	1
3.4 State Management with Zustand	1
3.5 WebSocket Integration	1
3.6 Animation Components	1
3.6.1 Animated Counter	1
4. Backend Implementation	1
4.1 Python Environment Setup	1
4.2 FastAPI Application Structure	1
4.2.1 Main Application	1
4.3 VRP Optimization Engine	1
4.3.1 OR-Tools Implementation	1
4.3.2 Optimization API Route	1
5. Algorithm Visualization	1
5.1 Streaming Optimization Progress	1
5.2 Frontend Visualization Component	1
6. Risk Scoring System	1
6.1 Risk Model Architecture	1
6.2 Risk Scorer Implementation	1
7. Bias Audit Framework	1
7.1 Fairness Metrics	1
7.2 Fairlearn Integration	1
8. Ethical Dilemma Simulator	1
8.1 Scenario Generator	1
8.2 Monte Carlo Simulation	1
9. Docker Deployment	1
9.1 Docker Compose Configuration	1
9.2 Running the Application	1
10. Testing Strategy	1
10.1 Frontend Testing	1
10.2 Backend Testing	1
Appendix A: Troubleshooting	1
A.1 Common Issues	1
A.2 Performance Optimization Tips	1
A.3 Useful Commands Reference	1

 
1. Introduction
This Technical Implementation Guide provides comprehensive, step-by-step instructions for building the Logistics AI Platform. The guide covers all aspects from initial project setup through deployment, with detailed code examples and best practices.
1.1 Prerequisites
Before starting, ensure you have the following installed on your development machine:
•	Node.js 18+ and npm 9+ (check with node -v and npm -v)
•	Python 3.11+ with pip (check with python --version)
•	Docker Desktop with Docker Compose
•	Git for version control
•	Visual Studio Code or preferred IDE
•	Mapbox account with API access token
•	OpenAI or Anthropic API key for LLM features
1.2 System Requirements
Component	Minimum	Recommended
RAM	8 GB	16 GB
CPU	4 cores	8 cores
Storage	20 GB free	50 GB SSD
OS	Windows 10/macOS 12/Ubuntu 20	Latest stable

 
2. Project Initialization
2.1 Repository Structure
Create the project directory structure as follows:
logistics-ai-spectacle/
├── frontend/                # Next.js application
│   ├── src/
│   │   ├── app/            # App router pages
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   ├── stores/         # Zustand state stores
│   │   └── types/          # TypeScript definitions
│   └── public/             # Static assets
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Business logic
│   │   ├── db/             # Database connections
│   │   ├── models/         # Data models
│   │   └── services/       # Service layer
│   └── tests/              # Unit tests
├── data/                    # Sample data files
├── docker-compose.yml
├── .env.example
└── README.md

2.2 Environment Configuration
Create a .env file in the project root with the following variables:
# Frontend
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VybmFtZSI...
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
 
# Backend
DATABASE_URL=postgresql://postgres:password@localhost:5432/logistics
REDIS_URL=redis://localhost:6379
NEO4J_URL=bolt://localhost:7687
 
# AI APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
 
# External Services
OPENWEATHERMAP_API_KEY=...

WARNING: Never commit actual API keys to version control. Add .env to your .gitignore file.
 
3. Frontend Implementation
3.1 Next.js Project Setup
Initialize the Next.js application with TypeScript and Tailwind CSS:
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app
 
# When prompted, select:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - src/ directory: Yes
# - App Router: Yes

3.2 Install Dependencies
Install all required npm packages for the frontend:
# Mapping and Visualization
npm install mapbox-gl @deck.gl/core @deck.gl/layers @deck.gl/mapbox
npm install @turf/turf @mapbox/polyline
 
# Animation Libraries
npm install framer-motion gsap @react-spring/web
npm install @tsparticles/react @tsparticles/slim lottie-react
 
# Charts and Graphs
npm install recharts d3 react-force-graph-2d reactflow
 
# State Management and Real-time
npm install socket.io-client zustand @tanstack/react-query
 
# UI Components
npm install lucide-react react-countup react-hot-toast howler
 
# Shadcn/UI Setup
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog tabs tooltip

3.3 Mapbox Integration
Create the Mapbox configuration file at src/lib/mapbox.ts:
3.3.1 Configuration File
// src/lib/mapbox.ts
import mapboxgl from 'mapbox-gl';
 
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
 
export const MAP_STYLES = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  streets: 'mapbox://styles/mapbox/streets-v12',
};
 
export const DEFAULT_CENTER: [number, number] = [55.2708, 25.2048];
export const DEFAULT_ZOOM = 12;
 
export default mapboxgl;

3.3.2 Map Container Component
Create the main map component at src/components/map/MapContainer.tsx:
'use client';
 
import { useEffect, useRef, useState } from 'react';
import mapboxgl from '@/lib/mapbox';
import { MAP_STYLES, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
 
export default function MapContainer({ darkMode = false }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
 
  useEffect(() => {
    if (!mapContainer.current || map.current) return;
 
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: darkMode ? MAP_STYLES.dark : MAP_STYLES.light,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: 45,
      bearing: -17.6,
    });
 
    map.current.addControl(new mapboxgl.NavigationControl());
 
    return () => { map.current?.remove(); };
  }, [darkMode]);
 
  return <div ref={mapContainer} className="w-full h-full" />;
}

3.4 State Management with Zustand
Create the vehicle store for managing real-time vehicle data:
// src/stores/vehicleStore.ts
import { create } from 'zustand';
 
interface Vehicle {
  id: string;
  name: string;
  lat: number;
  lng: number;
  heading: number;
  status: 'active' | 'idle' | 'maintenance';
}
 
interface VehicleStore {
  vehicles: Map<string, Vehicle>;
  selectedId: string | null;
  updatePosition: (id: string, lat: number, lng: number) => void;
  selectVehicle: (id: string | null) => void;
}
 
export const useVehicleStore = create<VehicleStore>((set) => ({
  vehicles: new Map(),
  selectedId: null,
  updatePosition: (id, lat, lng) =>
    set((state) => {
      const vehicles = new Map(state.vehicles);
      const v = vehicles.get(id);
      if (v) vehicles.set(id, { ...v, lat, lng });
      return { vehicles };
    }),
  selectVehicle: (id) => set({ selectedId: id }),
}));

3.5 WebSocket Integration
Create the Socket.io client configuration:
// src/lib/socket.ts
import { io, Socket } from 'socket.io-client';
 
let socket: Socket | null = null;
 
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
};
 
export const connectSocket = () => getSocket().connect();
export const disconnectSocket = () => socket?.disconnect();

3.6 Animation Components
3.6.1 Animated Counter
Create a reusable animated counter component:
// src/components/shared/AnimatedCounter.tsx
'use client';
 
import CountUp from 'react-countup';
 
interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
}
 
export default function AnimatedCounter({
  value, prefix = '', suffix = '', decimals = 0, duration = 2
}: AnimatedCounterProps) {
  return (
    <CountUp
      end={value}
      prefix={prefix}
      suffix={suffix}
      decimals={decimals}
      duration={duration}
      separator=","
      enableScrollSpy
      scrollSpyOnce
    />
  );
}

 
4. Backend Implementation
4.1 Python Environment Setup
Set up the Python virtual environment and install dependencies:
cd backend
python -m venv venv
 
# Activate (Windows)
venv\Scripts\activate
 
# Activate (macOS/Linux)
source venv/bin/activate
 
# Install dependencies
pip install fastapi uvicorn python-socketio pydantic
pip install ortools numpy scipy networkx
pip install langchain openai anthropic
pip install shap fairlearn scikit-learn pandas
pip install sqlalchemy asyncpg redis neo4j

4.2 FastAPI Application Structure
4.2.1 Main Application
Create the main FastAPI entry point at app/main.py:
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
 
# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=['http://localhost:3000']
)
 
# Create FastAPI app
app = FastAPI(
    title='Logistics AI Platform',
    version='1.0.0'
)
 
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_methods=['*'],
    allow_headers=['*'],
)
 
# Mount Socket.IO
socket_app = socketio.ASGIApp(sio, app)
 
# Include routers
from app.api.routes import vehicles, optimization
app.include_router(vehicles.router, prefix='/api/v1')
app.include_router(optimization.router, prefix='/api/v1')

4.3 VRP Optimization Engine
4.3.1 OR-Tools Implementation
Create the VRP solver at app/core/optimization/vrp_solver.py:
# app/core/optimization/vrp_solver.py
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import numpy as np
 
class VRPSolver:
    def __init__(self, distance_matrix, num_vehicles, depot=0):
        self.distance_matrix = distance_matrix
        self.num_vehicles = num_vehicles
        self.depot = depot
 
    def solve(self, time_limit_seconds=30):
        manager = pywrapcp.RoutingIndexManager(
            len(self.distance_matrix),
            self.num_vehicles,
            self.depot
        )
        routing = pywrapcp.RoutingModel(manager)
 
        def distance_callback(from_idx, to_idx):
            from_node = manager.IndexToNode(from_idx)
            to_node = manager.IndexToNode(to_idx)
            return int(self.distance_matrix[from_node][to_node])
 
        transit_callback_index = routing.RegisterTransitCallback(
            distance_callback
        )
        routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
 
        search_params = pywrapcp.DefaultRoutingSearchParameters()
        search_params.first_solution_strategy = (
            routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
        )
        search_params.time_limit.seconds = time_limit_seconds
 
        solution = routing.SolveWithParameters(search_params)
        return self._extract_routes(manager, routing, solution)
 
    def _extract_routes(self, manager, routing, solution):
        routes = []
        for vehicle_id in range(self.num_vehicles):
            route = []
            index = routing.Start(vehicle_id)
            while not routing.IsEnd(index):
                route.append(manager.IndexToNode(index))
                index = solution.Value(routing.NextVar(index))
            route.append(manager.IndexToNode(index))
            routes.append(route)
        return routes

4.3.2 Optimization API Route
Create the optimization endpoint at app/api/routes/optimization.py:
# app/api/routes/optimization.py
from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import List
from app.core.optimization.vrp_solver import VRPSolver
 
router = APIRouter(tags=['optimization'])
 
class OptimizationRequest(BaseModel):
    delivery_locations: List[dict]  # [{lat, lng, id}]
    num_vehicles: int
    depot_location: dict
 
class OptimizationResponse(BaseModel):
    run_id: str
    status: str
    routes: List[dict] = []
 
@router.post('/optimization/start')
async def start_optimization(
    request: OptimizationRequest,
    background_tasks: BackgroundTasks
) -> OptimizationResponse:
    run_id = generate_run_id()
    background_tasks.add_task(
        run_optimization_async,
        run_id,
        request
    )
    return OptimizationResponse(
        run_id=run_id,
        status='started'
    )

 
5. Algorithm Visualization
5.1 Streaming Optimization Progress
Implement WebSocket events for real-time algorithm visualization:
# app/core/optimization/visualizer.py
import asyncio
from app.main import sio
 
class OptimizationVisualizer:
    def __init__(self, run_id: str):
        self.run_id = run_id
        self.iteration = 0
 
    async def emit_progress(self, data: dict):
        await sio.emit('optimization:progress', {
            'runId': self.run_id,
            'iteration': self.iteration,
            **data
        })
        self.iteration += 1
 
    async def emit_complete(self, routes: list, savings: float):
        await sio.emit('optimization:complete', {
            'runId': self.run_id,
            'routes': routes,
            'savingsPercent': savings
        })

5.2 Frontend Visualization Component
Create the Algorithm Arena component:
// src/components/optimization/AlgorithmArena.tsx
'use client';
 
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSocket } from '@/lib/socket';
import { LineChart, Line, XAxis, YAxis } from 'recharts';
 
interface ProgressData {
  iteration: number;
  currentCost: number;
  bestCost: number;
  temperature?: number;
}
 
export default function AlgorithmArena({ runId }: { runId: string }) {
  const [progress, setProgress] = useState<ProgressData[]>([]);
  const [isComplete, setIsComplete] = useState(false);
 
  useEffect(() => {
    const socket = getSocket();
 
    socket.on('optimization:progress', (data) => {
      if (data.runId === runId) {
        setProgress(prev => [...prev, data]);
      }
    });
 
    socket.on('optimization:complete', (data) => {
      if (data.runId === runId) {
        setIsComplete(true);
      }
    });
 
    return () => {
      socket.off('optimization:progress');
      socket.off('optimization:complete');
    };
  }, [runId]);
 
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 bg-slate-900 rounded-xl"
    >
      <h2 className="text-xl font-bold text-white mb-4">
        Optimization Progress
      </h2>
      <LineChart width={600} height={300} data={progress}>
        <XAxis dataKey="iteration" stroke="#888" />
        <YAxis stroke="#888" />
        <Line type="monotone" dataKey="bestCost" stroke="#10B981" />
        <Line type="monotone" dataKey="currentCost" stroke="#6366F1" />
      </LineChart>
    </motion.div>
  );
}

 
6. Risk Scoring System
6.1 Risk Model Architecture
The risk scoring system evaluates multiple factors to produce a composite risk score for each vehicle and route.
Factor	Weight	Data Source	Update Freq
Weather	0.25	OpenWeatherMap API	15 minutes
Driver Fatigue	0.30	Shift logs, telematics	Real-time
Traffic	0.25	Mapbox Traffic API	5 minutes
Vehicle Health	0.20	IoT sensors, maintenance	Real-time

6.2 Risk Scorer Implementation
# app/core/risk/scorer.py
from dataclasses import dataclass
from typing import Dict
import numpy as np
 
@dataclass
class RiskFactors:
    weather: float      # 0-1
    driver_fatigue: float
    traffic: float
    vehicle_health: float
 
class RiskScorer:
    WEIGHTS = {
        'weather': 0.25,
        'driver_fatigue': 0.30,
        'traffic': 0.25,
        'vehicle_health': 0.20
    }
 
    def calculate_score(self, factors: RiskFactors) -> float:
        score = (
            factors.weather * self.WEIGHTS['weather'] +
            factors.driver_fatigue * self.WEIGHTS['driver_fatigue'] +
            factors.traffic * self.WEIGHTS['traffic'] +
            factors.vehicle_health * self.WEIGHTS['vehicle_health']
        )
        return round(score, 2)
 
    def get_risk_level(self, score: float) -> str:
        if score < 0.3:
            return 'low'
        elif score < 0.6:
            return 'medium'
        elif score < 0.8:
            return 'high'
        return 'critical'

 
7. Bias Audit Framework
7.1 Fairness Metrics
The bias audit framework implements multiple fairness metrics to ensure equitable service distribution:
•	Demographic Parity: Equal service rates across customer segments
•	Geographic Equity: Uniform coverage across all service zones
•	Temporal Fairness: Consistent delivery times regardless of location
•	Workload Distribution: Balanced assignments among drivers (Gini coefficient)
7.2 Fairlearn Integration
# app/core/fairness/auditor.py
from fairlearn.metrics import MetricFrame
from fairlearn.metrics import demographic_parity_difference
import pandas as pd
import numpy as np
 
class FairnessAuditor:
    def __init__(self, data: pd.DataFrame):
        self.data = data
 
    def calculate_demographic_parity(self,
                                      predictions: np.ndarray,
                                      sensitive_feature: str) -> float:
        return demographic_parity_difference(
            y_true=self.data['actual_priority'],
            y_pred=predictions,
            sensitive_features=self.data[sensitive_feature]
        )
 
    def calculate_gini_coefficient(self,
                                    workloads: np.ndarray) -> float:
        sorted_workloads = np.sort(workloads)
        n = len(workloads)
        cumulative = np.cumsum(sorted_workloads)
        gini = (2 * np.sum((np.arange(1, n+1) * sorted_workloads))) /
               (n * np.sum(workloads)) - (n + 1) / n
        return round(gini, 4)
 
    def generate_audit_report(self) -> dict:
        return {
            'demographic_parity': self.calculate_demographic_parity(...),
            'gini_coefficient': self.calculate_gini_coefficient(...),
            'geographic_coverage': self._analyze_coverage(),
            'recommendations': self._generate_recommendations()
        }

 
8. Ethical Dilemma Simulator
8.1 Scenario Generator
The ethical dilemma simulator generates realistic scenarios using LLM and evaluates decisions across multiple ethical frameworks.
# app/core/ethics/simulator.py
from typing import List, Dict
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
 
class EthicalSimulator:
    DILEMMA_TYPES = [
        'resource_allocation',
        'safety_vs_deadline',
        'privacy_vs_optimization',
        'fairness_vs_profit',
        'transparency_vs_efficiency'
    ]
 
    def __init__(self):
        self.llm = ChatOpenAI(model='gpt-4')
 
    async def generate_scenario(self, dilemma_type: str) -> dict:
        prompt = ChatPromptTemplate.from_template(
            '''Generate a realistic logistics ethical dilemma.
            Type: {dilemma_type}
            Include: situation, stakeholders, 3 options with tradeoffs.
            Format as JSON.'''
        )
        response = await self.llm.ainvoke(
            prompt.format(dilemma_type=dilemma_type)
        )
        return parse_scenario(response.content)
 
    def evaluate_decision(self,
                          decision: str,
                          scenario: dict) -> Dict[str, float]:
        return {
            'utilitarian': self._utilitarian_score(decision, scenario),
            'deontological': self._deontological_score(decision, scenario),
            'virtue_ethics': self._virtue_score(decision, scenario),
            'care_ethics': self._care_score(decision, scenario)
        }

8.2 Monte Carlo Simulation
# app/core/ethics/monte_carlo.py
import numpy as np
from typing import List, Dict
 
class MonteCarloSimulator:
    def __init__(self, num_simulations: int = 1000):
        self.num_simulations = num_simulations
 
    def run_simulation(self,
                       scenario: dict,
                       decision: str) -> Dict[str, any]:
        outcomes = []
 
        for _ in range(self.num_simulations):
            # Randomize environmental factors
            weather_factor = np.random.beta(2, 5)
            traffic_factor = np.random.beta(3, 4)
            driver_factor = np.random.beta(4, 2)
 
            outcome = self._simulate_outcome(
                scenario, decision,
                weather_factor, traffic_factor, driver_factor
            )
            outcomes.append(outcome)
 
        return {
            'success_rate': np.mean([o['success'] for o in outcomes]),
            'avg_cost': np.mean([o['cost'] for o in outcomes]),
            'risk_distribution': self._calculate_distribution(outcomes),
            'confidence_interval': self._calculate_ci(outcomes)
        }

 
9. Docker Deployment
9.1 Docker Compose Configuration
Create the docker-compose.yml file in the project root:
# docker-compose.yml
version: '3.8'
 
services:
  frontend:
    build: ./frontend
    ports:
      - '3000:3000'
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      - backend
 
  backend:
    build: ./backend
    ports:
      - '8000:8000'
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/logistics
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis
 
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: logistics
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
 
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
 
  neo4j:
    image: neo4j:5.18-community
    ports:
      - '7474:7474'
      - '7687:7687'
    environment:
      NEO4J_AUTH: neo4j/password123
 
volumes:
  postgres_data:

9.2 Running the Application
Start all services with Docker Compose:
# Build and start all services
docker-compose up --build
 
# Run in detached mode
docker-compose up -d
 
# View logs
docker-compose logs -f
 
# Stop all services
docker-compose down

INFO: The first build may take several minutes to download all dependencies.
 
10. Testing Strategy
10.1 Frontend Testing
Set up Jest and React Testing Library for component testing:
// __tests__/components/MapContainer.test.tsx
import { render, screen } from '@testing-library/react';
import MapContainer from '@/components/map/MapContainer';
 
// Mock mapbox-gl
jest.mock('mapbox-gl', () => ({
  Map: jest.fn(() => ({
    addControl: jest.fn(),
    on: jest.fn(),
    remove: jest.fn(),
  })),
  NavigationControl: jest.fn(),
}));
 
describe('MapContainer', () => {
  it('renders without crashing', () => {
    render(<MapContainer />);
    expect(document.querySelector('.mapboxgl-map')).toBeTruthy();
  });
});

10.2 Backend Testing
Use pytest for API endpoint testing:
# tests/test_optimization.py
import pytest
from fastapi.testclient import TestClient
from app.main import app
 
client = TestClient(app)
 
def test_start_optimization():
    response = client.post('/api/v1/optimization/start', json={
        'delivery_locations': [
            {'lat': 25.2048, 'lng': 55.2708, 'id': '1'},
            {'lat': 25.2100, 'lng': 55.2800, 'id': '2'},
        ],
        'num_vehicles': 2,
        'depot_location': {'lat': 25.2000, 'lng': 55.2700}
    })
    assert response.status_code == 200
    assert 'run_id' in response.json()
    assert response.json()['status'] == 'started'

 
Appendix A: Troubleshooting
A.1 Common Issues
Issue	Solution
Mapbox token invalid	Verify token in .env file, check Mapbox dashboard for active token
WebSocket connection failed	Ensure backend is running, check CORS settings, verify WS_URL
Docker build fails	Clear Docker cache: docker system prune -a, rebuild
OR-Tools import error	Reinstall: pip uninstall ortools && pip install ortools
Database connection refused	Check if PostgreSQL container is running, verify connection string

A.2 Performance Optimization Tips
•	Use React.memo() for components that receive stable props
•	Implement virtual scrolling for long lists using react-window
•	Debounce WebSocket updates to reduce re-renders
•	Use Deck.gl for rendering 1000+ map elements
•	Enable Redis caching for frequently accessed data
•	Use database connection pooling for better throughput

A.3 Useful Commands Reference
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run test         # Run tests
 
# Backend
uvicorn app.main:socket_app --reload    # Start with hot reload
pytest                                  # Run all tests
pytest --cov=app                        # With coverage
 
# Docker
docker-compose up --build   # Build and start
docker-compose logs -f      # Follow logs
docker-compose down -v      # Stop and remove volumes
