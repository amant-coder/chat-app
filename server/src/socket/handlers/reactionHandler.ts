import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../index';
import { ReactMessagePayload } from '../../types';
import Message from '../../models/Message';
import Conversation from '../../models/Conversation';
import { getConversationRoom } from '../utils';
import { logger } from '../../utils/logger';

export const setupReactionHandler = (io: Server, socket: AuthenticatedSocket): void => {
  socket.on('message:react', async (payload: ReactMessagePayload) => {
    try {
      const { messageId, conversationId, emoji } = payload;
      const userId = socket.userId;

      // Verify user is a participant of the conversation
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found', code: 'CONV_NOT_FOUND' });
        return;
      }

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit('error', { message: 'Message not found', code: 'MSG_NOT_FOUND' });
        return;
      }

      // Find existing reaction for this emoji
      const existingReaction = message.reactions?.find((r: any) => r.emoji === emoji);

      if (existingReaction) {
        const userIndex = existingReaction.users.findIndex(
          (u: any) => u.toString() === userId
        );

        if (userIndex > -1) {
          // Toggle OFF — user already reacted, remove them
          existingReaction.users.splice(userIndex, 1);
          // Remove emoji group if no users remain
          if (existingReaction.users.length === 0) {
            message.reactions = message.reactions.filter((r: any) => r.emoji !== emoji);
          }
        } else {
          // Toggle ON — add user to existing emoji group
          existingReaction.users.push(userId as any);
        }
      } else {
        // New emoji — create a new reaction group
        message.reactions = message.reactions || [];
        message.reactions.push({ emoji, users: [userId as any] } as any);
      }

      await message.save();

      // Broadcast updated reactions to the whole conversation room
      const room = getConversationRoom(conversationId);
      io.to(room).emit('message:reaction:update', {
        messageId,
        conversationId,
        reactions: message.reactions,
      });

      logger.debug(`User ${userId} reacted ${emoji} on message ${messageId}`);
    } catch (error) {
      logger.error('Error handling reaction:', error);
      socket.emit('error', { message: 'Failed to process reaction', code: 'REACT_ERROR' });
    }
  });
};
