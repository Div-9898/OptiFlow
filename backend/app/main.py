from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from contextlib import asynccontextmanager

from app.core.socketio import sio
from app.db.database import init_db
from app.core.config import settings
from app.api.routes import vehicles, optimization, risk, communication, fairness, ethics, stakeholders, policy
from app.services.streaming_service import streaming_service
from app.services.redis_service import redis_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Logistics AI Platform...")
    await init_db()
    await redis_service.connect()
    await streaming_service.start()
    yield
    # Shutdown
    print("👋 Shutting down...")
    await streaming_service.stop()
    await redis_service.disconnect()


# Create FastAPI app
app = FastAPI(
    title="Logistics AI Platform",
    description="AI-Powered Logistics Operations Platform with Real-Time Visualization",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(vehicles.router, prefix="/api/v1", tags=["vehicles"])
app.include_router(optimization.router, prefix="/api/v1", tags=["optimization"])
app.include_router(risk.router, prefix="/api/v1", tags=["risk"])
app.include_router(communication.router, prefix="/api/v1", tags=["communication"])
app.include_router(fairness.router, prefix="/api/v1", tags=["fairness"])
app.include_router(ethics.router, prefix="/api/v1", tags=["ethics"])
app.include_router(stakeholders.router, prefix="/api/v1", tags=["stakeholders"])
app.include_router(policy.router, prefix="/api/v1", tags=["policy"])


@app.get("/")
async def root():
    return {
        "message": "Logistics AI Platform API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


# Socket.IO Event Handlers
@sio.event
async def connect(sid, environ):
    print(f"🔌 Client connected: {sid}")
    await sio.emit('connected', {'sid': sid}, to=sid)


@sio.event
async def disconnect(sid):
    print(f"🔌 Client disconnected: {sid}")


@sio.event
async def join_room(sid, data):
    room = data.get('room', 'default')
    await sio.enter_room(sid, room)
    print(f"📦 Client {sid} joined room: {room}")


@sio.event
async def leave_room(sid, data):
    room = data.get('room', 'default')
    await sio.leave_room(sid, room)
    print(f"📦 Client {sid} left room: {room}")


# Mount Socket.IO app
socket_app = socketio.ASGIApp(sio, app)
