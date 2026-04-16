import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { allowedOrigins } from '../config/cors';
import { JwtPayload } from '../types';
import User from '../models/User';
import { logger } from '../utils/logger';
import { setupMessageHandler } from './handlers/messageHandler';
import { setupTypingHandler } from './handlers/typingHandler';
import { setupStatusHandler } from './handlers/statusHandler';
import { setupReadHandler } from './handlers/readHandler';

// Map of userId -> Set of socketIds (user can have multiple tabs)
export const onlineUsers = new Map<string, Set<string>>();

export interface AuthenticatedSocket extends Socket {
  userId: string;
  email: string;
}

export const initializeSocket = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error('User not found'));
      }

      (socket as AuthenticatedSocket).userId = decoded.userId;
      (socket as AuthenticatedSocket).email = decoded.email;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new Error('Token expired'));
      }
      return next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    const userId = authSocket.userId;

    logger.info(`Socket connected: ${userId} (${socket.id})`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Update user status to online
    await User.findByIdAndUpdate(userId, { status: 'online', lastSeen: new Date() });

    // Broadcast online status to all connected clients
    io.emit('user:status', { userId, status: 'online', lastSeen: new Date() });

    // Set up event handlers
    setupMessageHandler(io, authSocket);
    setupTypingHandler(io, authSocket);
    setupStatusHandler(io, authSocket);
    setupReadHandler(io, authSocket);

    // Handle disconnection
    socket.on('disconnect', async (reason) => {
      logger.info(`Socket disconnected: ${userId} (${socket.id}) - ${reason}`);

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);

          // Update user status to offline
          await User.findByIdAndUpdate(userId, {
            status: 'offline',
            lastSeen: new Date(),
          });

          // Broadcast offline status
          io.emit('user:status', {
            userId,
            status: 'offline',
            lastSeen: new Date(),
          });
        }
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for ${userId}:`, error);
    });
  });

  return io;
};
