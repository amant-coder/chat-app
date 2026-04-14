import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../index';
import { TypingPayload } from '../../types';
import { emitToUser } from '../utils';
import Conversation from '../../models/Conversation';
import { logger } from '../../utils/logger';

export const setupTypingHandler = (io: Server, socket: AuthenticatedSocket): void => {
  socket.on('typing:start', async ({ conversationId }: TypingPayload) => {
    try {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId,
      });

      if (!conversation) return;

      // Emit to the other participant
      const otherUserId = conversation.participants
        .find((p) => p.toString() !== socket.userId)
        ?.toString();

      if (otherUserId) {
        emitToUser(io, otherUserId, 'typing:update', {
          conversationId,
          userId: socket.userId,
          isTyping: true,
        });
      }
    } catch (error) {
      logger.error('Typing start error:', error);
    }
  });

  socket.on('typing:stop', async ({ conversationId }: TypingPayload) => {
    try {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId,
      });

      if (!conversation) return;

      const otherUserId = conversation.participants
        .find((p) => p.toString() !== socket.userId)
        ?.toString();

      if (otherUserId) {
        emitToUser(io, otherUserId, 'typing:update', {
          conversationId,
          userId: socket.userId,
          isTyping: false,
        });
      }
    } catch (error) {
      logger.error('Typing stop error:', error);
    }
  });
};
