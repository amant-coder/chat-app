// ─── Client Types ───────────────────────────────────────────────

export interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen: string;
  bio?: string;
  statusMessage?: string;
  publicKey?: string;
  encryptedPrivateKey?: string;
  keySalt?: string;
}

export type MessageType = 'text' | 'image' | 'file' | 'video' | 'voice';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface Message {
  _id: string;
  conversation: string;
  sender: User | string;
  content: string; // AES Encrypted Payload
  senderEncryptedKey?: string; // Encrypted AES key for sender
  recipientEncryptedKey?: string; // Encrypted AES key for receiver
  iv?: string; // AES IV
  type: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  status: MessageStatus;
  readBy: Array<{ user: string; readAt: string }>;
  isPinned?: boolean;
  reactions?: Reaction[];
  createdAt: string;
  updatedAt?: string;
  // Optimistic UI
  tempId?: string;
  pending?: boolean;
  failed?: boolean;
}

export interface Conversation {
  _id: string;
  type: 'direct' | 'group';
  participants: User[];
  name?: string;
  avatar?: string;
  description?: string;
  admins?: string[];
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
    type: MessageType;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor: string | null;
}

export interface TypingUpdate {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface UserStatus {
  userId: string;
  status: 'online' | 'offline';
  lastSeen: string;
}

export interface FileUploadResult {
  url: string;
  publicId: string;
  fileName: string;
  fileSize: number;
}
