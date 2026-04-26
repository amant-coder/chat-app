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
    }).populate('participants', 'username email avatar status lastSeen bio statusMessage');

    if (!conversation) {
      throw new AppError('Conversation not found.', 404);
    }

    return conversation;
  }

  async createGroupConversation(
    creatorId: string,
    name: string,
    participantIds: string[],
    description?: string
  ) {
    if (!name || name.trim().length === 0) {
      throw new AppError('Group name is required.', 400);
    }

    // Always include creator in participants
    const allParticipants = [...new Set([creatorId, ...participantIds])];

    const conversation = await Conversation.create({
      type: 'group',
      participants: allParticipants,
      name: name.trim(),
      description: description?.trim() || '',
      admins: [creatorId],
    });

    await conversation.populate('participants', 'username email avatar status lastSeen bio statusMessage');
    return conversation;
  }

  async addGroupParticipant(conversationId: string, adminId: string, newParticipantId: string) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      type: 'group',
    });

    if (!conversation) {
      throw new AppError('Group conversation not found.', 404);
    }

    if (!conversation.admins?.map((id: any) => id.toString()).includes(adminId)) {
      throw new AppError('Only group admins can add participants.', 403);
    }

    if (conversation.participants.map((id: any) => id.toString()).includes(newParticipantId)) {
      throw new AppError('User is already a participant in this group.', 400);
    }

    conversation.participants.push(new mongoose.Types.ObjectId(newParticipantId));
    await conversation.save();

    await conversation.populate('participants', 'username email avatar status lastSeen bio statusMessage');
    return conversation;
  }
}

export default new ChatService();
