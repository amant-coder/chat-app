import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../index';
import { ReadMessagePayload } from '../../types';
import messageService from '../../services/messageService';
import { emitToUser } from '../utils';
import Conversation from '../../models/Conversation';
import { logger } from '../../utils/logger';

export const setupReadHandler = (io: Server, socket: AuthenticatedSocket): void => {
  socket.on('message:read', async ({ conversationId, messageIds }: ReadMessagePayload) => {
    try {
      if (!messageIds || messageIds.length === 0) return;

      const count = await messageService.markAsRead(
        conversationId,
        socket.userId,
        messageIds
      );

      if (count === 0) return;

      // Get the conversation to notify the sender
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      // Emit to all other participants
      conversation.participants.forEach((participantId) => {
        const pId = participantId.toString();
        if (pId === socket.userId) return;

        emitToUser(io, pId, 'message:read:update', {
          conversationId,
          messageIds,
          readBy: {
            user: socket.userId,
            readAt: new Date(),
          },
        });
      });
    } catch (error) {
      logger.error('Read handler error:', error);
    }
  });
};
