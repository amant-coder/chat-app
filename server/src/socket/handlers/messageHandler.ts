import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../index';
import { SendMessagePayload } from '../../types';
import messageService from '../../services/messageService';
import { emitToUser, getConversationRoom, isUserOnline } from '../utils';
import Conversation from '../../models/Conversation';
import { logger } from '../../utils/logger';
import { sanitizeMessage } from '../../utils/sanitize';

export const setupMessageHandler = (io: Server, socket: AuthenticatedSocket): void => {
  // Join conversation rooms for all user's conversations
  socket.on('conversation:join', async ({ conversationId }: { conversationId: string }) => {
    try {
      // Verify user is participant
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId,
      });

      if (!conversation) {
        socket.emit('error', { message: 'Conversation not found', code: 'CONV_NOT_FOUND' });
        return;
      }

      const room = getConversationRoom(conversationId);
      socket.join(room);

      // Mark messages as delivered when user joins
      await messageService.markAsDelivered(conversationId, socket.userId);

      logger.debug(`User ${socket.userId} joined room ${room}`);
    } catch (error) {
      logger.error('Error joining conversation:', error);
      socket.emit('error', { message: 'Failed to join conversation', code: 'JOIN_ERROR' });
    }
  });

  // Leave conversation room
  socket.on('conversation:leave', ({ conversationId }: { conversationId: string }) => {
    const room = getConversationRoom(conversationId);
    socket.leave(room);
    logger.debug(`User ${socket.userId} left room ${room}`);
  });

  // Send message
  socket.on('message:send', async (payload: SendMessagePayload) => {
    try {
      const { conversationId, content, type, tempId, fileUrl, fileName, fileSize, senderEncryptedKey, recipientEncryptedKey, iv } = payload;

      // Create message in DB
      const message = await messageService.createMessage(
        conversationId,
        socket.userId,
        content,
        type,
        fileUrl ? { fileUrl, fileName: fileName || 'file', fileSize: fileSize || 0 } : undefined,
        { senderEncryptedKey, recipientEncryptedKey, iv }
      );

      // Get the conversation to find participants
      const conversation = await Conversation.findById(conversationId).populate('participants', 'username email avatar status lastSeen');
      if (!conversation) return;

      // Prepare conversation object for sidebar update (with unread count)
      const convData = conversation.toObject();

      // Emit to the sender (confirmation with tempId for optimistic UI)
      socket.emit('message:received', {
        message: message.toObject(),
        tempId,
      });

      // Emit to all participants
      conversation.participants.forEach((participant: any) => {
        const participantId = participant._id.toString();
        if (participantId === socket.userId) return;

        // Emit message
        emitToUser(io, participantId, 'message:received', {
          message: message.toObject(),
          tempId: null,
        });

        // Emit conversation update for sidebar (important for new conversations)
        emitToUser(io, participantId, 'conversation:update', {
          ...convData,
          unreadCount: 1, // At least this message is unread
        });

        // Send delivery confirmation to sender if participant is online
        if (isUserOnline(participantId)) {
          socket.emit('message:delivered', {
            messageId: message._id.toString(),
            conversationId,
          });
        }
      });

      logger.debug(`Message sent in ${conversationId} by ${socket.userId}`);
    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('error', {
        message: 'Failed to send message',
        code: 'SEND_ERROR',
        tempId: payload.tempId,
      });
    }
  });
};
