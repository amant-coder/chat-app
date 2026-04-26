// ─── Server Types ───────────────────────────────────────────────
import { Types } from 'mongoose';

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen: Date;
  publicKey?: string;
  encryptedPrivateKey?: string;
  keySalt?: string;
  bio?: string;
  statusMessage?: string;
  passwordResetOTP?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IConversation {
  _id: Types.ObjectId;
  type: 'direct' | 'group';
  participants: Types.ObjectId[];
  name?: string;
  avatar?: string;
  description?: string;
  admins?: Types.ObjectId[];
  lastMessage?: {
    content: string;
    sender: Types.ObjectId;
    timestamp: Date;
    type: MessageType;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type MessageType = 'text' | 'image' | 'file' | 'video' | 'voice';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface IReaction {
  emoji: string;
  users: Types.ObjectId[];
}

export interface IMessage {
  _id: Types.ObjectId;
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  content: string; // Now holds AES-encrypted payload
  senderEncryptedKey?: string; // AES key encrypted with sender's public key
  recipientEncryptedKey?: string; // AES key encrypted with recipient's public key
  iv?: string; // AES Initialization Vector
  type: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  status: MessageStatus;
  readBy: Array<{
    user: Types.ObjectId;
    readAt: Date;
  }>;
  isPinned: boolean;
  reactions: IReaction[];
  createdAt: Date;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface SocketUser {
  userId: string;
  socketId: string;
}

// Socket event payloads
export interface SendMessagePayload {
  conversationId: string;
  content: string;
  senderEncryptedKey?: string;
  recipientEncryptedKey?: string;
  iv?: string;
  type: MessageType;
  tempId: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface TypingPayload {
  conversationId: string;
}

export interface ReadMessagePayload {
  conversationId: string;
  messageIds: string[];
}

export interface JoinConversationPayload {
  conversationId: string;
}

export interface ReactMessagePayload {
  messageId: string;
  conversationId: string;
  emoji: string;
}
