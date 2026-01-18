"""Socket.IO server instance - separate module to avoid circular imports"""
import socketio

# Create Socket.IO async server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=['http://localhost:3000', 'http://127.0.0.1:3000'],
    logger=True,
    engineio_logger=True
)
