import Conversation from '../models/Conversation';
import Message from '../models/Message';
import { AppError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

class ChatService {
  async getOrCreateConversation(userId: string, otherUserId: string) {
    if (userId === otherUserId) {
      throw new AppError('Cannot create a conversation with yourself.', 400);
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      type: 'direct',
      participants: { $all: [userId, otherUserId], $size: 2 },
    }).populate('participants', 'username email avatar status lastSeen');

    if (conversation) {
      return conversation;
    }

    // Create new conversation
    conversation = await Conversation.create({
      type: 'direct',
      participants: [userId, otherUserId],
    });

    // Populate and return
    await conversation.populate('participants', 'username email avatar status lastSeen');
    return conversation;
  }

  async getUserConversations(userId: string) {
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate('participants', 'username email avatar status lastSeen')
      .sort({ updatedAt: -1 });

    // Get unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: userId },
          'readBy.user': { $ne: userId },
        });

        return {
          ...conv.toObject(),
          unreadCount,
        };
      })
    );

    return conversationsWithUnread;
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    }).populate('participants', 'username email avatar status lastSeen');

    if (!conversation) {
      throw new AppError('Conversation not found.', 404);
    }

    return conversation;
  }
}

export default new ChatService();
