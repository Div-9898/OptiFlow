# Logistics AI Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Neo4j](https://img.shields.io/badge/Neo4j-5.18-008CC1?style=for-the-badge&logo=neo4j&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)

### An Enterprise-Grade AI-Powered Logistics Operations Platform

**Real-Time Fleet Visualization | Intelligent Route Optimization | Ethical Decision-Making | Risk Assessment**

[Features](#features) | [Quick Start](#quick-start) | [Modules](#platform-modules) | [Architecture](#architecture) | [API Reference](#api-reference) | [Configuration](#configuration)

</div>

---

## Overview

The **Logistics AI Platform** is a comprehensive, production-ready solution designed for modern logistics operations. It seamlessly combines cutting-edge AI/ML capabilities with real-time visualization to transform how organizations manage their fleets, optimize routes, assess risks, and make ethical decisions.

Built with a microservices architecture, the platform delivers a responsive, beautiful dashboard powered by **Next.js 14** and a robust **FastAPI** backend with real-time **WebSocket** communication. Whether you're managing 10 vehicles or 1,000+, this platform scales to meet your operational demands.

### Key Highlights

- **Real-Time Operations**: Live vehicle tracking with sub-second updates via WebSocket
- **AI-Powered Intelligence**: Route optimization using Google OR-Tools, risk prediction with ML models
- **Ethical Framework**: Industry-first ethical dilemma simulator with multi-framework evaluation
- **Fairness & Bias Auditing**: Built-in Fairlearn integration for demographic parity analysis
- **Graph-Based Insights**: Neo4j-powered stakeholder network analysis
- **Sentiment Analysis**: Real-time customer feedback analysis with NLP

---

## Features

### Real-Time Fleet Visualization
The interactive dashboard provides a bird's-eye view of your entire fleet operation:
- **Interactive Mapbox GL** integration with 3D terrain rendering
- **Live vehicle tracking** with animated position updates every second
- **Route visualization** with color-coded status indicators (on-time, delayed, completed)
- **Deck.gl overlay** for high-performance rendering of 1,000+ vehicles simultaneously
- **Geofencing alerts** for zone entry/exit notifications

### AI-Powered Route Optimization (VRP Arena)
Solve complex Vehicle Routing Problems with enterprise-grade optimization:
- **Google OR-Tools** integration for industry-standard VRP solving
- **Real-time algorithm visualization** showing optimization progress via streaming
- **Multiple optimization strategies**: Path Cheapest Arc, Savings Algorithm, Christofides, and more
- **Constraint handling**: Vehicle capacity, time windows, driver shift limits, and service times
- **Multi-depot support** for distributed operations
- **Export optimized routes** as JSON or integrate directly with navigation systems

### Intelligent Risk Assessment
Proactively identify and mitigate operational risks:
- **Multi-factor risk scoring** combining weather, traffic, driver fatigue, and vehicle health
- **Real-time risk level monitoring** with visual gauges and indicators
- **Predictive risk alerts** using trained ML models for early warning
- **SHAP-based explainability** showing exactly why a risk score was assigned
- **Configurable thresholds** for different alert severity levels

### Ethical Dilemma Simulator
Navigate complex logistics decisions with an AI-powered ethical framework:
- **AI-generated scenarios** using Google Gemini for realistic ethical dilemmas
- **Monte Carlo simulation** for decision outcome probability analysis
- **Multi-framework ethical evaluation**:
  - Utilitarian ethics (greatest good for greatest number)
  - Deontological ethics (duty-based reasoning)
  - Virtue ethics (character-based approach)
- **Interactive decision interface** with stakeholder impact visualization
- **Decision audit trail** for compliance and review

### Bias Audit & Fairness Framework
Ensure equitable operations across all demographics:
- **Fairlearn integration** for demographic parity analysis
- **Geographic equity assessment** across service zones and neighborhoods
- **Workload distribution monitoring** using Gini coefficient metrics
- **Automated bias detection** with specific recommendations for mitigation
- **Historical trend analysis** to track fairness improvements over time

### Stakeholder Network Analysis
Understand and leverage relationship dynamics:
- **Neo4j-powered graph database** for relationship modeling
- **Interactive force-directed visualization** of stakeholder networks
- **Influence and dependency analysis** identifying key relationships
- **Communication pattern insights** showing information flow
- **Centrality metrics** (betweenness, closeness, degree) for network analysis

### AI Policy Advisor
Generate and manage operational policies with AI assistance:
- **Natural language policy generation** using large language models
- **Compliance checking** against industry regulations and best practices
- **Policy impact simulation** before implementation
- **Version-controlled management** with rollback capabilities
- **Template library** for common logistics policies

### Real-Time Communication Hub
Keep everyone connected and informed:
- **WebSocket-based messaging** for instant communication
- **Driver-dispatcher interface** with two-way communication
- **Automated alert broadcasting** based on events and thresholds
- **Message history and analytics** for communication insights
- **Multi-channel support** for in-app, SMS, and email notifications

### Customer Updates & Sentiment Analysis
Maintain customer satisfaction with intelligent communication:
- **Real-time delivery notifications** across SMS, email, push, and WhatsApp
- **AI-powered message generation** for personalized customer updates
- **Live sentiment analysis** using NLP to classify customer feedback
- **Sentiment trend tracking** with visual charts and metrics
- **NPS score monitoring** with automatic alerts for negative trends
- **Customer review management** with rating aggregation

---

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Docker Desktop** | 20.10+ | Container orchestration |
| **Docker Compose** | 2.0+ | Service management |
| **Git** | 2.30+ | Version control |

You'll also need API keys for:
- **Mapbox** - [Get your token](https://mapbox.com) (free tier available)
- **Google AI Studio** - [Get Gemini API key](https://ai.google.dev) (free tier available)

### Installation

**1. Clone the Repository**

```bash
git clone https://github.com/Div-9898/AIO_Final_Project.git
cd AIO_Final_Project
```

**2. Configure Environment Variables**

Create a `.env` file in the project root:

```bash
# Create .env file with your API keys
cat > .env << EOF
# Required API Keys
MAPBOX_TOKEN=your_mapbox_token_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Override default database credentials
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=postgres
# POSTGRES_DB=logistics
# NEO4J_AUTH=neo4j/password
EOF
```

**3. Start the Platform**

```bash
# Make the start script executable (first time only)
chmod +x start.sh

# Start all services
./start.sh start
```

The platform will automatically:
- Pull and build all Docker images
- Initialize PostgreSQL, Redis, and Neo4j databases
- Start the FastAPI backend with hot reload
- Launch the Next.js frontend
- Run the vehicle simulation engine

**4. Access the Application**

Once all services are running, open your browser:

| Service | URL | Description |
|---------|-----|-------------|
| **Dashboard** | http://localhost:3000 | Main application interface |
| **API Docs** | http://localhost:8000/docs | Swagger/OpenAPI documentation |
| **Neo4j Browser** | http://localhost:7474 | Graph database explorer |
| **Backend Health** | http://localhost:8000/health | API health check endpoint |

### Management Commands

The `start.sh` script provides convenient commands for managing the platform:

```bash
# Service Management
./start.sh start      # Start all services in detached mode
./start.sh stop       # Stop all running services
./start.sh restart    # Restart all services
./start.sh status     # Check health status of all services

# Development
./start.sh dev        # Start with live reload and verbose logging
./start.sh logs       # Follow logs from all services
./start.sh logs backend  # Follow logs from specific service

# Maintenance
./start.sh build      # Rebuild all Docker images
./start.sh clean      # Remove containers, volumes, and images

# Database Access
./start.sh db         # Open PostgreSQL CLI
./start.sh redis      # Open Redis CLI
```

---

## Platform Modules

### 1. Dashboard (Home Page)
**URL:** `/`

The central command center for your logistics operations:
- Real-time fleet map with live vehicle positions
- Key performance indicators (KPIs) panel
- Vehicle status list with filtering and search
- WebSocket connection indicator
- Quick actions for common operations

### 2. VRP Arena
**URL:** `/vrp-arena`

Interactive workspace for route optimization:
- Configure delivery locations by clicking on map or importing data
- Set vehicle constraints (capacity, time windows, shifts)
- Watch optimization algorithms work in real-time
- Compare results from different strategies
- Export optimized routes for implementation

### 3. Risk Center
**URL:** `/risk-center`

Comprehensive risk monitoring and management:
- Multi-factor risk heatmaps overlaid on map
- Real-time risk score updates per vehicle
- Predictive alerts with time-to-event estimates
- Detailed risk factor breakdown (weather, traffic, fatigue, maintenance)
- Historical risk trend analysis

### 4. Ethics Simulator
**URL:** `/ethics`

Ethical decision-making training and analysis:
- Generate AI-powered ethical scenarios
- Run Monte Carlo simulations on decisions
- View multi-framework ethical analysis
- Understand stakeholder impacts
- Build organizational ethical guidelines

### 5. Bias Audit
**URL:** `/bias-audit`

Fairness and equity analysis dashboard:
- Demographic parity metrics visualization
- Geographic coverage heatmaps
- Driver workload distribution charts (Gini coefficient)
- Automated recommendations for bias mitigation
- Trend tracking over time

### 6. Stakeholder Network
**URL:** `/stakeholders`

Relationship visualization and analysis:
- Interactive force-directed network graph
- Stakeholder influence scoring
- Communication pathway mapping
- Network centrality metrics
- Relationship strength indicators

### 7. Policy Advisor
**URL:** `/policy`

AI-assisted policy management:
- Generate policies from natural language descriptions
- Check compliance against regulations
- Simulate policy impacts before deployment
- Manage policy versions and history
- Access template library

### 8. Communication Hub
**URL:** `/communication`

Real-time messaging platform:
- Driver-dispatcher chat interface
- Broadcast message capability
- Alert management and acknowledgment
- Message search and filtering
- Communication analytics

### 9. Customer Updates
**URL:** `/customer-updates`

Customer communication and sentiment tracking:
- Live feed of customer interactions
- Real-time sentiment analysis with NLP
- Multi-channel message composition (SMS, Email, Push, WhatsApp)
- AI-powered message generation
- Sentiment trend charts and NPS monitoring
- Customer satisfaction metrics

---

## Architecture

```
                                   Client Layer
    +--------------------------------------------------------------------+
    |                        Next.js 14 Frontend                          |
    |  +------------+  +----------+  +-----------+  +-----------------+  |
    |  |  Mapbox GL |  |  Zustand |  | Socket.IO |  |  React Query    |  |
    |  |  + Deck.gl |  |  Store   |  |  Client   |  |  (TanStack)     |  |
    |  +------------+  +----------+  +-----------+  +-----------------+  |
    +--------------------------------+-----------------------------------+
                                     | HTTP / WebSocket
    +--------------------------------v-----------------------------------+
    |                           API Gateway                              |
    |  +---------------------------------------------------------------+ |
    |  |                   FastAPI + Socket.IO Server                  | |
    |  |  +----------+ +----------+ +--------+ +--------+ +----------+ | |
    |  |  | Vehicles | | Optimize | |  Risk  | | Ethics | |  Policy  | | |
    |  |  |   API    | |   API    | |  API   | |  API   | |   API    | | |
    |  |  +----------+ +----------+ +--------+ +--------+ +----------+ | |
    |  |  +------------+ +------------+ +-------------+                | |
    |  |  | Fairness   | | Stakeholder| | Communication|               | |
    |  |  |   API      | |    API     | |     API      |               | |
    |  |  +------------+ +------------+ +-------------+                | |
    |  +---------------------------------------------------------------+ |
    +--------+---------------+----------------+----------------+---------+
             |               |                |                |
    +--------v------+ +------v------+ +-------v-------+ +------v-------+
    |  PostgreSQL   | |    Redis    | |     Neo4j     | |   Gemini     |
    |  (Primary DB) | |  (Cache &   | | (Graph DB for | |  (LLM for    |
    |               | |   Pub/Sub)  | |  Stakeholders)| |   AI Tasks)  |
    +---------------+ +-------------+ +---------------+ +--------------+
```

### Data Flow

1. **Real-Time Updates**: Vehicle simulation generates position data -> Redis pub/sub -> Socket.IO -> Frontend map
2. **Route Optimization**: User configures constraints -> FastAPI -> OR-Tools solver -> Streaming progress -> Final routes
3. **Risk Assessment**: Sensor data -> ML models -> Risk scores -> Alerts via WebSocket
4. **Sentiment Analysis**: Customer message -> NLP processing -> Sentiment classification -> Dashboard metrics

---

## Tech Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.2 | React framework with App Router |
| TypeScript | 5.7 | Type-safe development |
| Mapbox GL | 3.9 | Interactive mapping |
| Deck.gl | 9.0 | High-performance data visualization |
| Framer Motion | 11.0 | Smooth animations |
| GSAP | 3.12 | Advanced animations |
| Zustand | 4.5 | Lightweight state management |
| TanStack Query | 5.0 | Server state management |
| Recharts | 2.12 | Charts and graphs |
| D3.js | 7.9 | Data visualization |
| React Force Graph | 1.44 | Network visualization |
| Tailwind CSS | 3.4 | Utility-first styling |
| Socket.IO Client | 4.7 | Real-time communication |
| Lucide React | 0.400 | Icon library |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.110 | High-performance async API |
| Python | 3.11+ | Backend runtime |
| Socket.IO | 5.10 | WebSocket server |
| SQLAlchemy | 2.0 | ORM and database toolkit |
| Google OR-Tools | 9.8 | Optimization engine |
| PyTorch | 2.1 | ML model inference |
| Fairlearn | 0.10 | Fairness metrics |
| SHAP | 0.44 | Model explainability |
| LangChain | 0.1 | LLM orchestration |
| Google Generative AI | 0.3 | Gemini integration |
| Pandas | 2.2 | Data manipulation |
| Polars | 0.20 | High-performance DataFrames |

### Infrastructure

| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 16 | Primary relational database |
| Redis | 7 | Caching, pub/sub, sessions |
| Neo4j | 5.18 | Graph database for networks |
| Docker | 24+ | Containerization |
| Docker Compose | 2.24+ | Service orchestration |

---

## Project Structure

```
AIO_Final_Project/
|
+-- frontend/                      # Next.js 14 Application
|   +-- src/
|   |   +-- app/                   # App Router pages
|   |   |   +-- page.tsx           # Dashboard (home)
|   |   |   +-- bias-audit/        # Fairness analysis
|   |   |   +-- communication/     # Messaging hub
|   |   |   +-- customer-updates/  # Sentiment tracking
|   |   |   +-- ethics/            # Ethical simulator
|   |   |   +-- policy/            # Policy advisor
|   |   |   +-- risk-center/       # Risk dashboard
|   |   |   +-- stakeholders/      # Network graph
|   |   |   +-- vrp-arena/         # Route optimization
|   |   +-- components/            # Reusable React components
|   |   |   +-- dashboard/         # Dashboard widgets
|   |   |   +-- map/               # Map components
|   |   +-- hooks/                 # Custom React hooks
|   |   +-- lib/                   # Utility libraries
|   |   +-- stores/                # Zustand state stores
|   |   +-- types/                 # TypeScript definitions
|   +-- Dockerfile
|   +-- package.json
|
+-- backend/                       # FastAPI Application
|   +-- app/
|   |   +-- api/
|   |   |   +-- routes/            # API endpoint handlers
|   |   |       +-- vehicles.py    # Vehicle management
|   |   |       +-- optimization.py # Route optimization
|   |   |       +-- risk.py        # Risk assessment
|   |   |       +-- ethics.py      # Ethical simulation
|   |   |       +-- fairness.py    # Bias auditing
|   |   |       +-- policy.py      # Policy management
|   |   |       +-- stakeholders.py # Network analysis
|   |   |       +-- communication.py # Messaging
|   |   +-- core/                  # Business logic
|   |   |   +-- ethics/            # Ethical evaluation
|   |   |   +-- fairness/          # Bias detection
|   |   |   +-- ml/                # ML models
|   |   |   +-- optimization/      # VRP solver
|   |   |   +-- risk/              # Risk scoring
|   |   |   +-- stakeholders/      # Graph analysis
|   |   +-- db/                    # Database layer
|   |   +-- models/                # Pydantic models
|   |   +-- services/              # External integrations
|   +-- Dockerfile
|   +-- requirements.txt
|
+-- simulation/                    # Vehicle simulation engine
+-- Docs/                          # Technical documentation
+-- docker-compose.yml             # Service orchestration
+-- start.sh                       # Management script
+-- .env                           # Environment configuration
+-- .gitignore
+-- README.md
```

---

## API Reference

### Base URL
```
http://localhost:8000/api/v1
```

### REST Endpoints

#### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/vehicles` | List all vehicles with current status |
| `GET` | `/vehicles/{id}` | Get specific vehicle details |
| `GET` | `/vehicles/{id}/history` | Get vehicle location history |

#### Route Optimization
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/optimization/start` | Start route optimization job |
| `GET` | `/optimization/{run_id}` | Get optimization status/results |
| `POST` | `/optimization/cancel/{run_id}` | Cancel running optimization |

#### Risk Assessment
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/risk/scores` | Get current risk scores for all vehicles |
| `GET` | `/risk/scores/{vehicle_id}` | Get risk breakdown for vehicle |
| `GET` | `/risk/alerts` | Get active risk alerts |
| `POST` | `/risk/acknowledge/{alert_id}` | Acknowledge an alert |

#### Ethics Simulator
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/ethics/scenario` | Generate new ethical scenario |
| `POST` | `/ethics/evaluate` | Evaluate a decision |
| `GET` | `/ethics/frameworks` | List available ethical frameworks |

#### Fairness Audit
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/fairness/audit` | Run comprehensive fairness audit |
| `GET` | `/fairness/metrics` | Get current fairness metrics |
| `GET` | `/fairness/recommendations` | Get bias mitigation recommendations |

#### Stakeholder Network
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/stakeholders/network` | Get full stakeholder graph |
| `GET` | `/stakeholders/{id}` | Get stakeholder details |
| `GET` | `/stakeholders/metrics` | Get network analysis metrics |

#### Policy Advisor
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/policy/generate` | Generate policy from description |
| `GET` | `/policy/{id}` | Get policy details |
| `POST` | `/policy/check-compliance` | Check policy compliance |

#### Communication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/communication/send` | Send message to driver |
| `POST` | `/communication/broadcast` | Broadcast to all drivers |
| `GET` | `/communication/history` | Get message history |

### WebSocket Events

Connect to `ws://localhost:8000/ws` for real-time updates.

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `vehicle:update` | Server -> Client | `{id, lat, lng, status, speed}` | Vehicle position update |
| `vehicle:status` | Server -> Client | `{id, status, details}` | Vehicle status change |
| `optimization:progress` | Server -> Client | `{run_id, iteration, best_cost}` | Optimization iteration |
| `optimization:complete` | Server -> Client | `{run_id, routes, metrics}` | Optimization finished |
| `risk:alert` | Server -> Client | `{vehicle_id, level, factors}` | Risk threshold exceeded |
| `risk:update` | Server -> Client | `{vehicle_id, score, breakdown}` | Risk score updated |
| `message:new` | Bidirectional | `{from, to, content, timestamp}` | New chat message |
| `message:delivered` | Server -> Client | `{message_id, timestamp}` | Message delivery confirmation |

### Full API Documentation

Interactive API documentation with request/response examples is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MAPBOX_TOKEN` | Yes | - | Mapbox GL access token for maps |
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key for AI features |
| `DATABASE_URL` | No | Auto-configured | PostgreSQL connection string |
| `REDIS_URL` | No | Auto-configured | Redis connection string |
| `NEO4J_URL` | No | `bolt://neo4j:7687` | Neo4j bolt protocol URL |
| `NEO4J_USER` | No | `neo4j` | Neo4j username |
| `NEO4J_PASSWORD` | No | `password` | Neo4j password |
| `SIMULATION_VEHICLES` | No | `6` | Number of simulated vehicles |
| `SIMULATION_INTERVAL` | No | `1000` | Position update interval (ms) |

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 8 GB | 16 GB |
| **CPU** | 4 cores | 8 cores |
| **Storage** | 20 GB | 50 GB SSD |
| **Docker Memory** | 4 GB | 8 GB |
| **OS** | Linux / macOS / Windows (WSL2) | Linux / macOS |

---

## Testing

### Backend Tests

```bash
# Run all backend tests
docker-compose exec backend pytest

# Run with coverage report
docker-compose exec backend pytest --cov=app --cov-report=html

# Run specific test file
docker-compose exec backend pytest tests/test_optimization.py -v

# Run tests matching pattern
docker-compose exec backend pytest -k "test_risk" -v
```

### Frontend Tests

```bash
# Run all frontend tests
docker-compose exec frontend npm test

# Run in watch mode
docker-compose exec frontend npm test -- --watch

# Run with coverage
docker-compose exec frontend npm test -- --coverage
```

---

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find and kill process using port 3000
lsof -i :3000
kill -9 <PID>

# Or use different ports in docker-compose.yml
```

**Docker Memory Issues**
```bash
# Increase Docker memory allocation in Docker Desktop settings
# Recommended: 8GB minimum for smooth operation
```

**Database Connection Errors**
```bash
# Reset all databases
./start.sh clean
./start.sh start

# Check individual service logs
./start.sh logs postgres
./start.sh logs neo4j
```

**WebSocket Connection Failed**
- Ensure backend is fully started (check `/health` endpoint)
- Check browser console for CORS errors
- Verify no firewall blocking WebSocket connections

**Mapbox Not Loading**
- Verify `MAPBOX_TOKEN` is set correctly in `.env`
- Check token has required scopes (styles:read, fonts:read)
- Ensure token is not expired

**Gemini API Errors**
- Verify `GEMINI_API_KEY` is valid
- Check API quota limits in Google AI Studio
- Ensure network can reach Google APIs

### Getting Help

1. Check the logs: `./start.sh logs`
2. Review API docs: http://localhost:8000/docs
3. Check service health: `./start.sh status`
4. Open an issue on GitHub

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make** your changes with clear commit messages
4. **Test** your changes thoroughly
5. **Push** to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open** a Pull Request with a clear description

### Development Setup

```bash
# Start in development mode with hot reload
./start.sh dev

# Frontend development (standalone)
cd frontend
npm install
npm run dev

# Backend development (standalone)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Divyansh**

- GitHub: [@Div-9898](https://github.com/Div-9898)

---

<div align="center">

**Built for the Future of Intelligent Logistics**

[Report Bug](https://github.com/Div-9898/AIO_Final_Project/issues) | [Request Feature](https://github.com/Div-9898/AIO_Final_Project/issues)

</div>
