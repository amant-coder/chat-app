import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { AppError } from '../middleware/errorHandler';
import { sanitizeMessage } from '../utils/sanitize';
import { MessageType } from '../types';
import mongoose from 'mongoose';

class MessageService {
  async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: MessageType = 'text',
    fileData?: { fileUrl: string; fileName: string; fileSize: number },
    e2eData?: { senderEncryptedKey?: string; recipientEncryptedKey?: string; iv?: string }
  ) {
    // Verify conversation exists and user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: senderId,
    });

    if (!conversation) {
      throw new AppError('Conversation not found or access denied.', 404);
    }

    // Sanitize message content (skip for E2EE messages — base64 payloads would be corrupted)
    const sanitizedContent = e2eData?.iv ? content : sanitizeMessage(content);

    if (!sanitizedContent && type === 'text') {
      throw new AppError('Message content cannot be empty.', 400);
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      content: sanitizedContent,
      type,
      ...(fileData && {
        fileUrl: fileData.fileUrl,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
      }),
      ...(e2eData && {
        senderEncryptedKey: e2eData.senderEncryptedKey,
        recipientEncryptedKey: e2eData.recipientEncryptedKey,
        iv: e2eData.iv,
      }),
      readBy: [{ user: senderId, readAt: new Date() }],
    });

    // Update conversation's lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        content: e2eData?.iv ? '[Encrypted Message]' : (type === 'text' ? sanitizedContent : `📎 ${fileData?.fileName || 'File'}`),
        sender: senderId,
        timestamp: new Date(),
        type,
      },
      updatedAt: new Date(),
    });

    // Populate sender info
    await message.populate('sender', 'username email avatar');

    return message;
  }

  async getMessages(conversationId: string, userId: string, cursor?: string, limit: number = 30) {
    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw new AppError('Conversation not found or access denied.', 404);
    }

    const query: any = { conversation: conversationId };

    // Cursor-based pagination: get messages older than cursor
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(limit + 1); // Fetch one extra to check if there are more

    const hasMore = messages.length > limit;
    const result = hasMore ? messages.slice(0, limit) : messages;

    return {
      messages: result.reverse(), // Return in chronological order
      hasMore,
      nextCursor: hasMore ? result[0]?.createdAt?.toISOString() : null,
    };
  }

  async markAsRead(conversationId: string, userId: string, messageIds: string[]) {
    const result = await Message.updateMany(
      {
        _id: { $in: messageIds },
        conversation: conversationId,
        sender: { $ne: userId },
        'readBy.user': { $ne: userId },
      },
      {
        $push: {
          readBy: { user: userId, readAt: new Date() },
        },
        $set: { status: 'read' },
      }
    );

    return result.modifiedCount;
  }

  async markAsDelivered(conversationId: string, userId: string) {
    await Message.updateMany(
      {
        conversation: conversationId,
        sender: { $ne: userId },
        status: 'sent',
      },
      {
        $set: { status: 'delivered' },
      }
    );
  }

  async searchMessages(conversationId: string, userId: string, query: string) {
    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw new AppError('Conversation not found or access denied.', 404);
    }

    // Search messages in this conversation
    // NOTE: For E2EE messages, searching content on the server won't yield results 
    // because the content is encrypted. This search works for plaintext/system messages.
    const messages = await Message.find({
      conversation: conversationId,
      content: { $regex: query, $options: 'i' },
      type: 'text',
    })
      .populate('sender', 'username email avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    return messages;
  }

  async togglePin(conversationId: string, userId: string, messageId: string) {
    // Verify user is participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      throw new AppError('Conversation not found or access denied.', 404);
    }

    const message = await Message.findOne({ _id: messageId, conversation: conversationId });
    if (!message) {
      throw new AppError('Message not found.', 404);
    }

    message.isPinned = !message.isPinned;
    await message.save();

    return message;
  }
}

export default new MessageService();
