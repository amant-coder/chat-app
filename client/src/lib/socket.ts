import { io, Socket } from 'socket.io-client';
import axios from 'axios';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

let socket: Socket | null = null;
let isRefreshing = false;

export const getSocket = (): Socket | null => socket;

export const updateSocketToken = (token: string): void => {
  if (!socket) return;

  socket.auth = { token };

  // If socket dropped due to auth/network issues, reconnect with fresh token.
  if (!socket.connected) {
    socket.connect();
  }
};

/**
 * Attempt to refresh the access token using the stored refresh token,
 * then reconnect the socket with the new token.
 */
const refreshAndReconnect = async (): Promise<void> => {
  if (isRefreshing) return;
  isRefreshing = true;

  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      // No refresh token — user must re-login
      disconnectSocket();
      return;
    }

    const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
      refreshToken,
    });

    // Persist the new tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    // Reconnect socket with fresh token
    if (socket) {
      socket.auth = { token: data.accessToken };
      socket.connect();
    }
  } catch (error) {
    console.error('Token refresh failed — user must re-login');
    // Clear everything and redirect to login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    disconnectSocket();
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  } finally {
    isRefreshing = false;
  }
};

export const connectSocket = (token: string): Socket => {
  if (socket) {
    updateSocketToken(token);
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    if (error.message === 'Token expired' || error.message === 'Invalid token') {
      // Don't let socket.io keep retrying with a stale token — pause reconnection,
      // refresh the token, then manually reconnect.
      socket?.disconnect();
      refreshAndReconnect();
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.io.on('reconnect', (attemptNumber) => {
    console.log('🔌 Socket reconnected after', attemptNumber, 'attempts');
  });

  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
