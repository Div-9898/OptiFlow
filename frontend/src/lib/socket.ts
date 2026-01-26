import { io, Socket } from 'socket.io-client';
import { SocketEvents } from '@/types';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';
    
    socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[Socket] Reconnection attempt:', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('[Socket] Reconnection error:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed');
    });
  }

  return socket;
};

export const connectSocket = (): Socket => {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
  return s;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
  }
};

export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};

// Type-safe event emitter
export const emitEvent = <K extends keyof SocketEvents>(
  event: K,
  data: SocketEvents[K]
): void => {
  const s = getSocket();
  s.emit(event, data);
};

// Type-safe event listener
export const onEvent = <K extends keyof SocketEvents>(
  event: K,
  callback: (data: SocketEvents[K]) => void
): void => {
  const s = getSocket();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  s.on(event as string, callback as any);
};

// Remove event listener
export const offEvent = <K extends keyof SocketEvents>(
  event: K,
  callback?: (data: SocketEvents[K]) => void
): void => {
  const s = getSocket();
  if (callback) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    s.off(event as string, callback as any);
  } else {
    s.off(event as string);
  }
};
