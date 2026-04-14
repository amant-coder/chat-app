import { Server } from 'socket.io';
import { AuthenticatedSocket, onlineUsers } from '../index';
import User from '../../models/User';
import { logger } from '../../utils/logger';

export const setupStatusHandler = (io: Server, socket: AuthenticatedSocket): void => {
  // Client requests online status of specific users
  socket.on('user:check-online', async ({ userIds }: { userIds: string[] }) => {
    try {
      const statuses = userIds.map((userId) => ({
        userId,
        isOnline: onlineUsers.has(userId) && (onlineUsers.get(userId)?.size ?? 0) > 0,
      }));

      socket.emit('user:online-status', statuses);
    } catch (error) {
      logger.error('Check online error:', error);
    }
  });

  // Explicit online announcement
  socket.on('user:online', async () => {
    try {
      await User.findByIdAndUpdate(socket.userId, {
        status: 'online',
        lastSeen: new Date(),
      });
      io.emit('user:status', {
        userId: socket.userId,
        status: 'online',
        lastSeen: new Date(),
      });
    } catch (error) {
      logger.error('User online error:', error);
    }
  });
};
