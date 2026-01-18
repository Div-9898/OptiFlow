# 🚚 Logistics AI Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

**An AI-Powered Logistics Operations Platform with Real-Time Visualization, Ethical Decision-Making, and Intelligent Route Optimization**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-architecture) • [Modules](#-modules) • [API Reference](#-api-reference)

</div>

---

## 🎯 Overview

The **Logistics AI Platform** is a comprehensive, production-ready solution for modern logistics operations. It combines cutting-edge AI/ML capabilities with real-time visualization to optimize fleet management, route planning, risk assessment, and ethical decision-making in logistics operations.

Built with a microservices architecture, the platform provides a beautiful, responsive dashboard powered by Next.js and a robust FastAPI backend with real-time WebSocket communication.

---

## ✨ Features

### 🗺️ Real-Time Fleet Visualization
- Interactive Mapbox GL integration with 3D terrain
- Live vehicle tracking with animated position updates
- Route visualization with color-coded status indicators
- Deck.gl overlay for high-performance rendering of 1000+ vehicles

### 🧠 AI-Powered Route Optimization (VRP Arena)
- Google OR-Tools integration for Vehicle Routing Problem solving
- Real-time algorithm visualization with progress streaming
- Multiple optimization strategies (Path Cheapest Arc, Savings, etc.)
- Constraint handling: capacity, time windows, driver shifts

### ⚠️ Intelligent Risk Assessment
- Multi-factor risk scoring (weather, traffic, driver fatigue, vehicle health)
- Real-time risk level monitoring with visual indicators
- Predictive risk alerts using ML models
- SHAP-based explainability for risk predictions

### ⚖️ Ethical Dilemma Simulator
- AI-generated ethical scenarios using Google Gemini
- Monte Carlo simulation for decision outcome analysis
- Multi-framework ethical evaluation (Utilitarian, Deontological, Virtue Ethics)
- Interactive decision-making interface with stakeholder impact visualization

### 📊 Bias Audit & Fairness Framework
- Fairlearn integration for demographic parity analysis
- Geographic equity assessment across service zones
- Workload distribution monitoring (Gini coefficient)
- Automated bias detection and mitigation recommendations

### 🤝 Stakeholder Network Analysis
- Neo4j-powered relationship graph visualization
- Interactive force-directed stakeholder mapping
- Influence and dependency analysis
- Communication pattern insights

### 📜 AI Policy Advisor
- Natural language policy generation using LLMs
- Compliance checking against industry regulations
- Policy impact simulation and recommendations
- Version-controlled policy management

### 💬 Real-Time Communication Hub
- WebSocket-based real-time messaging
- Driver-dispatcher communication interface
- Automated alert broadcasting
- Message history and analytics

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Mapbox GL** | Interactive mapping |
| **Deck.gl** | High-performance data visualization |
| **Framer Motion** | Smooth animations |
| **Zustand** | State management |
| **TanStack Query** | Server state management |
| **Recharts & D3** | Charts and graphs |
| **Tailwind CSS** | Utility-first styling |
| **Socket.IO Client** | Real-time communication |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance API framework |
| **Python 3.11+** | Backend runtime |
| **Socket.IO** | WebSocket server |
| **SQLAlchemy** | ORM and database toolkit |
| **OR-Tools** | Optimization engine |
| **PyTorch** | ML model inference |
| **Fairlearn** | Fairness metrics |
| **SHAP** | Model explainability |
| **LangChain** | LLM orchestration |
| **Google Generative AI** | Gemini integration |

### Data & Infrastructure
| Technology | Purpose |
|------------|---------|
| **PostgreSQL 16** | Primary database |
| **Redis 7** | Caching and pub/sub |
| **Neo4j 5.18** | Graph database |
| **Docker Compose** | Container orchestration |

---

## 🚀 Getting Started

### Prerequisites

- **Docker Desktop** with Docker Compose
- **Git** for version control
- **Mapbox Account** - [Get API Token](https://mapbox.com)
- **Google AI Studio** - [Get Gemini API Key](https://ai.google.dev)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Div-9898/AIO_Final_Project.git
   cd AIO_Final_Project
   ```

2. **Configure environment variables**
   ```bash
   # Create .env file in project root
   cat > .env << EOF
   MAPBOX_TOKEN=your_mapbox_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   EOF
   ```

3. **Start the platform**
   ```bash
   # Make the start script executable
   chmod +x start.sh
   
   # Start all services
   ./start.sh start
   ```

4. **Access the application**
   - 📱 **Frontend Dashboard**: http://localhost:3000
   - 🔧 **Backend API**: http://localhost:8000
   - 📊 **Neo4j Browser**: http://localhost:7474
   - 📚 **API Documentation**: http://localhost:8000/docs

### Management Commands

```bash
./start.sh start     # Start all services
./start.sh stop      # Stop all services
./start.sh restart   # Restart all services
./start.sh status    # Check service health
./start.sh logs      # View logs (follow mode)
./start.sh build     # Rebuild all images
./start.sh clean     # Clean Docker resources
./start.sh dev       # Development mode with live reload
./start.sh db        # Open PostgreSQL CLI
./start.sh redis     # Open Redis CLI
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Client Layer                               │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                    Next.js 14 Frontend                          ││
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────┐││
│  │  │  Mapbox   │  │  Zustand  │  │ Socket.IO │  │ React Query   │││
│  │  │  GL/Deck  │  │   Store   │  │  Client   │  │               │││
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────────┘││
│  └─────────────────────────────────────────────────────────────────┘│
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP/WebSocket
┌──────────────────────────────▼──────────────────────────────────────┐
│                           API Gateway                                │
│  ┌─────────────────────────────────────────────────────────────────┐│
│  │                     FastAPI + Socket.IO                         ││
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ ││
│  │  │Vehicles │ │Optimize  │ │  Risk   │ │ Ethics   │ │ Policy  │ ││
│  │  │  API    │ │   API    │ │  API    │ │   API    │ │   API   │ ││
│  │  └─────────┘ └──────────┘ └─────────┘ └──────────┘ └─────────┘ ││
│  └─────────────────────────────────────────────────────────────────┘│
└─────────┬────────────────┬────────────────┬────────────────┬────────┘
          │                │                │                │
┌─────────▼────────┐ ┌─────▼─────┐ ┌────────▼────────┐ ┌─────▼──────┐
│   PostgreSQL     │ │   Redis   │ │     Neo4j       │ │  Gemini    │
│  (Operational    │ │ (Caching  │ │ (Stakeholder    │ │  (LLM      │
│   Data)          │ │  Pub/Sub) │ │  Graph)         │ │  Services) │
└──────────────────┘ └───────────┘ └─────────────────┘ └────────────┘
```

---

## 📁 Project Structure

```
AIO_Final_Project/
├── frontend/                    # Next.js Application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   │   ├── bias-audit/      # Fairness analysis
│   │   │   ├── communication/   # Messaging hub
│   │   │   ├── ethics/          # Ethical simulator
│   │   │   ├── policy/          # Policy advisor
│   │   │   ├── risk-center/     # Risk dashboard
│   │   │   ├── stakeholders/    # Network graph
│   │   │   └── vrp-arena/       # Route optimization
│   │   ├── components/          # React components
│   │   │   ├── dashboard/       # Dashboard widgets
│   │   │   └── map/             # Map components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utility libraries
│   │   ├── stores/              # Zustand state stores
│   │   └── types/               # TypeScript definitions
│   ├── Dockerfile
│   └── package.json
│
├── backend/                     # FastAPI Application
│   ├── app/
│   │   ├── api/routes/          # API endpoints
│   │   ├── core/                # Business logic
│   │   │   ├── ethics/          # Ethical simulation
│   │   │   ├── fairness/        # Bias auditing
│   │   │   ├── ml/              # ML models
│   │   │   ├── optimization/    # VRP solver
│   │   │   ├── risk/            # Risk scoring
│   │   │   └── stakeholders/    # Graph analysis
│   │   ├── db/                  # Database layer
│   │   ├── models/              # Data models
│   │   └── services/            # External services
│   ├── Dockerfile
│   └── requirements.txt
│
├── simulation/                  # Vehicle simulation
├── Docs/                        # Documentation
├── docker-compose.yml           # Service orchestration
├── start.sh                     # Management script
└── .gitignore
```

---

## 📦 Modules

### 1. Dashboard (Home)
The main control center featuring:
- Real-time fleet map with vehicle markers
- Key performance metrics panel
- Vehicle list with status indicators
- WebSocket connection status

### 2. VRP Arena (`/vrp-arena`)
Interactive route optimization workspace:
- Configure delivery locations and constraints
- Visualize optimization algorithm progress
- Compare multiple optimization strategies
- Export optimized routes

### 3. Risk Center (`/risk-center`)
Comprehensive risk monitoring:
- Multi-factor risk heatmaps
- Real-time risk score updates
- Predictive alerts and notifications
- Risk factor breakdown and analysis

### 4. Ethics Simulator (`/ethics`)
Ethical decision-making framework:
- Generate realistic ethical dilemmas
- Monte Carlo outcome simulation
- Multi-framework ethical evaluation
- Decision impact visualization

### 5. Bias Audit (`/bias-audit`)
Fairness and equity analysis:
- Demographic parity metrics
- Geographic coverage assessment
- Driver workload distribution
- Automated recommendations

### 6. Stakeholder Network (`/stakeholders`)
Relationship visualization:
- Interactive force-directed graph
- Stakeholder influence analysis
- Communication pattern mapping
- Network metrics and insights

### 7. Policy Advisor (`/policy`)
AI-powered policy management:
- Natural language policy generation
- Compliance checking
- Impact simulation
- Version history

### 8. Communication Hub (`/communication`)
Real-time messaging platform:
- Driver-dispatcher chat
- Broadcast announcements
- Message history
- Alert management

---

## 🔌 API Reference

### Base URL
```
http://localhost:8000/api/v1
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/vehicles` | List all vehicles |
| `GET` | `/vehicles/{id}` | Get vehicle details |
| `POST` | `/optimization/start` | Start route optimization |
| `GET` | `/optimization/{run_id}` | Get optimization status |
| `GET` | `/risk/scores` | Get current risk scores |
| `POST` | `/ethics/scenario` | Generate ethical scenario |
| `POST` | `/ethics/evaluate` | Evaluate decision |
| `GET` | `/fairness/audit` | Run fairness audit |
| `GET` | `/stakeholders/network` | Get stakeholder graph |
| `POST` | `/policy/generate` | Generate policy |
| `POST` | `/communication/send` | Send message |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `vehicle:update` | Server → Client | Vehicle position update |
| `optimization:progress` | Server → Client | Optimization iteration |
| `optimization:complete` | Server → Client | Optimization finished |
| `risk:alert` | Server → Client | Risk threshold exceeded |
| `message:new` | Bidirectional | New chat message |

Full API documentation available at http://localhost:8000/docs (Swagger UI)

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MAPBOX_TOKEN` | Mapbox GL access token | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Auto |
| `REDIS_URL` | Redis connection string | Auto |
| `NEO4J_URL` | Neo4j bolt URL | Auto |
| `NEO4J_USER` | Neo4j username | Auto |
| `NEO4J_PASSWORD` | Neo4j password | Auto |

---

## 📊 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 8 GB | 16 GB |
| **CPU** | 4 cores | 8 cores |
| **Storage** | 20 GB | 50 GB SSD |
| **Docker** | 20.10+ | Latest |
| **OS** | Linux/macOS/Windows | Linux/macOS |

---

## 🧪 Testing

### Backend Tests
```bash
# Run all tests
docker-compose exec backend pytest

# With coverage
docker-compose exec backend pytest --cov=app

# Specific test file
docker-compose exec backend pytest tests/test_optimization.py
```

### Frontend Tests
```bash
# Run tests
docker-compose exec frontend npm test

# Watch mode
docker-compose exec frontend npm test -- --watch
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Divyansh**

- GitHub: [@Div-9898](https://github.com/Div-9898)

---

<div align="center">

**Built with ❤️ for the future of intelligent logistics**

</div>
