import mongoose, { Schema, Document, Model } from 'mongoose';
import { IConversation } from '../types';

export interface IConversationDocument extends Omit<IConversation, '_id'>, Document {}

const conversationSchema = new Schema<IConversationDocument>(
  {
    type: {
      type: String,
      enum: ['direct'],
      default: 'direct',
    },
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    lastMessage: {
      content: String,
      sender: { type: Schema.Types.ObjectId, ref: 'User' },
      timestamp: Date,
      type: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast participant lookup
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });

// Ensure only 2 participants for direct chats
conversationSchema.pre('save', function (next) {
  if (this.type === 'direct' && this.participants.length !== 2) {
    return next(new Error('Direct conversations must have exactly 2 participants'));
  }
  next();
});

const Conversation: Model<IConversationDocument> = mongoose.model<IConversationDocument>(
  'Conversation',
  conversationSchema
);
export default Conversation;
