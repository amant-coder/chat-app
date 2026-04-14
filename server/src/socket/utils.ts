import { Server } from 'socket.io';
import { onlineUsers } from './index';

/**
 * Get all socket IDs for a given user
 */
export const getUserSockets = (userId: string): Set<string> | undefined => {
  return onlineUsers.get(userId);
};

/**
 * Check if a user is online
 */
export const isUserOnline = (userId: string): boolean => {
  const sockets = onlineUsers.get(userId);
  return !!sockets && sockets.size > 0;
};

/**
 * Emit to all sockets of a specific user
 */
export const emitToUser = (io: Server, userId: string, event: string, data: any): void => {
  const sockets = onlineUsers.get(userId);
  if (sockets) {
    sockets.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
};

/**
 * Get the room name for a conversation
 */
export const getConversationRoom = (conversationId: string): string => {
  return `conversation:${conversationId}`;
};
