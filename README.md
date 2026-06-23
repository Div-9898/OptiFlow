# OptiFlow — Logistics & Fleet-Operations AI

**A real-time last-mile fleet dashboard that pits three route optimizers against each other on the same problem, scores every route for *risk* and *fairness*, and reasons about delivery trade-offs across four ethical frameworks.**

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![OR--Tools](https://img.shields.io/badge/Google_OR--Tools-4285F4?logo=google)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?logo=pytorch&logoColor=white)
![Neo4j](https://img.shields.io/badge/Neo4j-008CC1?logo=neo4j&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?logo=docker&logoColor=white)

> **What this is:** a full-stack, microservices prototype exploring *responsible AI in logistics*. The optimization, fairness, and ethics engines are real and runnable; the platform runs on a built-in vehicle **simulation** layer, and the neural models ship with demonstration weights rather than models trained on production data. Originally my AI-Optimization capstone.

---

## Why it's interesting

- **VRP Arena — three solvers, side by side.** The same vehicle-routing problem is solved simultaneously by **Google OR-Tools** (guided local search), a **hand-written genetic algorithm** (order crossover + swap mutation), and **simulated annealing** — each streaming its cost/iteration progress live over WebSocket so you can watch them compete and trade off speed vs. quality.
- **Risk *and* fairness on every route.** A multi-factor risk score (weather, traffic, vehicle health, driver fatigue) sits next to an **algorithmic-fairness audit** — demographic parity, disparate-impact ratio, and a Gini coefficient on driver-workload distribution — as first-class screens, not afterthoughts.
- **Multi-framework ethics simulator.** Delivery dilemmas are scored across **utilitarian, deontological, virtue, and care-ethics** lenses with Monte-Carlo outcome simulation.
- **Stakeholder graph.** A Neo4j network with centrality metrics (betweenness / closeness / degree).
- **Live operations view.** Next.js 14 + **Mapbox GL + deck.gl**, sub-second vehicle updates over Socket.IO.

## Architecture

```
Next.js 14 dashboard  ──WebSocket/REST──▶  FastAPI + Socket.IO backend
        │                                        │
   Mapbox/deck.gl                     OR-Tools · GA · SA · PyTorch · fairness/ethics engines
        │                                        │
   vehicle-simulation service ──▶ Redis (pub/sub)  ·  PostgreSQL  ·  Neo4j
```
All services orchestrated with Docker Compose.

## Run it

```bash
git clone https://github.com/Div-9898/OptiFlow.git && cd OptiFlow
./start.sh start      # build + start all services (Docker Compose)
./start.sh status     # health-check;  ./start.sh logs  to follow
```

## Tech stack

**Frontend** Next.js 14 · React 18 · TypeScript · Mapbox GL · deck.gl · Zustand · TanStack Query · Recharts / D3
**Backend** FastAPI · Socket.IO · SQLAlchemy · Google OR-Tools · PyTorch · NumPy / pandas / NetworkX
**Data** PostgreSQL 16 · Redis 7 · Neo4j 5 · Docker Compose

## Honest scope

Vehicle telemetry comes from a simulation engine; the fairness metrics are computed with real formulas over that simulated segment data; the four PyTorch architectures (risk MLP, ETA LSTM, demand temporal-CNN, anomaly autoencoder) are implemented and runnable but ship with demonstration weights, not models trained on real fleets. The engineering — three real VRP solvers, the streaming "arena," the ethics/fairness layers, and the microservices wiring — is the substance here.
