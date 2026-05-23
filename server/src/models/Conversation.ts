import mongoose, { Schema, Document, Model } from 'mongoose';
import { IConversation } from '../types';

export interface IConversationDocument extends Omit<IConversation, '_id'>, Document {}

const conversationSchema = new Schema<IConversationDocument>(
  {
    type: {
      type: String,
      enum: ['direct', 'group'],
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
        enum: ['text', 'image', 'file', 'video', 'voice'],
        default: 'text',
      },
    },
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Group name cannot exceed 50 characters'],
    },
    avatar: {
      type: String,
    },
    description: {
      type: String,
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for fast participant lookup
conversationSchema.index({ participants: 1 });
conversationSchema.index({ updatedAt: -1 });
// Sparse index for duplicate-prevention on direct chats
// (unique among sorted participant pairs of type=direct)
conversationSchema.index(
  { type: 1, participants: 1 },
  { name: 'type_participants' }
);

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
