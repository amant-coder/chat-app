import mongoose, { Schema, Document, Model } from 'mongoose';
import { IMessage } from '../types';

export interface IMessageDocument extends Omit<IMessage, '_id'>, Document {}

const messageSchema = new Schema<IMessageDocument>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [10000, 'Message cannot exceed 10000 characters'], // Increased because encrypted payloads are larger
    },
    senderEncryptedKey: {
      type: String,
    },
    recipientEncryptedKey: {
      type: String,
    },
    iv: {
      type: String,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'video', 'voice'],
      default: 'text',
    },
    fileUrl: String,
    fileName: String,
    fileSize: Number,
    isPinned: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
    },
    readBy: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],
    reactions: [
      {
        emoji: { type: String, required: true },
        users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for paginated conversation messages
messageSchema.index({ conversation: 1, createdAt: -1 });

const Message: Model<IMessageDocument> = mongoose.model<IMessageDocument>('Message', messageSchema);
export default Message;
