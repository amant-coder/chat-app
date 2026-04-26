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

      // Emit to all other participants
      conversation.participants.forEach((participantId) => {
        const pId = participantId.toString();
        if (pId === socket.userId) return;

        emitToUser(io, pId, 'typing:update', {
          conversationId,
          userId: socket.userId,
          isTyping: true,
        });
      });
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

      // Emit to all other participants
      conversation.participants.forEach((participantId) => {
        const pId = participantId.toString();
        if (pId === socket.userId) return;

        emitToUser(io, pId, 'typing:update', {
          conversationId,
          userId: socket.userId,
          isTyping: false,
        });
      });
    } catch (error) {
      logger.error('Typing stop error:', error);
    }
  });
};
