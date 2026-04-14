import { create } from 'zustand';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Conversation, Message, MessagesResponse, TypingUpdate, UserStatus } from '@/types';
import { encryptMessage, decryptMessage } from '@/lib/crypto';

// Helper to decrypt a batch of messages
const decryptMessagesBatch = async (messages: Message[]) => {
  const privateKeyStr = localStorage.getItem('e2e_private_key');
  if (!privateKeyStr) return messages;

  let myPrivateKey: CryptoKey | null = null;
  try {
    const jwk = JSON.parse(privateKeyStr);
    myPrivateKey = await window.crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['decrypt']
    );
  } catch (err) {
    console.error("Failed to parse local private key setup", err);
  }

  if (!myPrivateKey) return messages;

  const decryptedMessages = await Promise.all(messages.map(async (m) => {
    if (!m.iv || (!m.recipientEncryptedKey && !m.senderEncryptedKey)) {
       return m; // Unencrypted message 
    }
    
    // Find my encrypted key (are we sender or receiver?)
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    
    let targetKeyStr = m.recipientEncryptedKey;
    const senderId = typeof m.sender === 'string' ? m.sender : m.sender._id;
    if (currentUser && senderId === currentUser._id) {
       targetKeyStr = m.senderEncryptedKey;
    }

    if (!targetKeyStr) return m;

    const decryptedContent = await decryptMessage(m.content, targetKeyStr, m.iv, myPrivateKey);
    return { ...m, content: decryptedContent };
  }));

  return decryptedMessages;
};

interface ChatState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Record<string, Message[]>;
  typingUsers: Record<string, boolean>;
  onlineUsers: Record<string, boolean>;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  hasMoreMessages: Record<string, boolean>;
  messageCursors: Record<string, string | null>;

  // Actions
  fetchConversations: () => Promise<void>;
  setActiveConversation: (conversation: Conversation | null) => void;
  fetchMessages: (conversationId: string, initial?: boolean) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, type?: string, fileData?: any) => Promise<void>;
  addMessage: (message: Message, tempId?: string | null) => void;
  updateMessageStatus: (messageId: string, conversationId: string, status: string) => void;
  updateReadReceipt: (conversationId: string, messageIds: string[]) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  updateUserStatus: (userId: string, status: string) => void;
  startConversation: (userId: string) => Promise<Conversation>;
  markAsRead: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: {},
  typingUsers: {},
  onlineUsers: {},
  isLoadingConversations: false,
  isLoadingMessages: false,
  hasMoreMessages: {},
  messageCursors: {},

  fetchConversations: async () => {
    try {
      set({ isLoadingConversations: true });
      const { data } = await api.get<Conversation[]>('/conversations');
      set({ conversations: data, isLoadingConversations: false });
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      set({ isLoadingConversations: false });
    }
  },

  setActiveConversation: (conversation) => {
    const socket = getSocket();
    const prev = get().activeConversation;

    // Leave previous conversation room
    if (prev && socket) {
      socket.emit('conversation:leave', { conversationId: prev._id });
    }

    set({ activeConversation: conversation });

    // Join new conversation room
    if (conversation && socket) {
      socket.emit('conversation:join', { conversationId: conversation._id });
    }
  },

  fetchMessages: async (conversationId, initial = true) => {
    try {
      set({ isLoadingMessages: true });
      const { data } = await api.get<MessagesResponse>(`/messages/${conversationId}`, {
        params: { limit: 30 },
      });

      const decryptedMessages = await decryptMessagesBatch(data.messages);

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: decryptedMessages,
        },
        hasMoreMessages: {
          ...state.hasMoreMessages,
          [conversationId]: data.hasMore,
        },
        messageCursors: {
          ...state.messageCursors,
          [conversationId]: data.nextCursor,
        },
        isLoadingMessages: false,
      }));
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      set({ isLoadingMessages: false });
    }
  },

  loadMoreMessages: async (conversationId) => {
    const cursor = get().messageCursors[conversationId];
    if (!cursor || !get().hasMoreMessages[conversationId]) return;

    try {
      const { data } = await api.get<MessagesResponse>(`/messages/${conversationId}`, {
        params: { cursor, limit: 30 },
      });

      const decryptedMessages = await decryptMessagesBatch(data.messages);

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: [...decryptedMessages, ...(state.messages[conversationId] || [])],
        },
        hasMoreMessages: {
          ...state.hasMoreMessages,
          [conversationId]: data.hasMore,
        },
        messageCursors: {
          ...state.messageCursors,
          [conversationId]: data.nextCursor,
        },
      }));
    } catch (error) {
      console.error('Failed to load more messages:', error);
    }
  },

  sendMessage: async (conversationId, content, type = 'text', fileData) => {
    const socket = getSocket();
    if (!socket) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const currentUser = userStr ? JSON.parse(userStr) : null;

    // Optimistic update — add plaintext message immediately
    if (currentUser) {
      const optimisticMessage: Message = {
        _id: tempId,
        conversation: conversationId,
        sender: currentUser,
        content,
        type: type as any,
        status: 'sent',
        readBy: [],
        createdAt: new Date().toISOString(),
        tempId,
        pending: true,
        ...(fileData && {
          fileUrl: fileData.fileUrl || fileData.url,
          fileName: fileData.fileName,
          fileSize: fileData.fileSize,
        }),
      };

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: [...(state.messages[conversationId] || []), optimisticMessage],
        },
      }));
    }

    // Prepare E2EE
    let finalContent = content;
    let senderEncryptedKey = undefined;
    let recipientEncryptedKey = undefined;
    let iv = undefined;

    const activeConv = get().activeConversation;
    if (activeConv && currentUser && currentUser.publicKey) {
      const recipient = activeConv.participants.find(p => p._id !== currentUser._id);
      if (recipient && recipient.publicKey) {
        try {
          const encryptedPayload = await encryptMessage(content, recipient.publicKey, currentUser.publicKey);
          finalContent = encryptedPayload.content;
          senderEncryptedKey = encryptedPayload.senderEncryptedKey;
          recipientEncryptedKey = encryptedPayload.recipientEncryptedKey;
          iv = encryptedPayload.iv;
        } catch (err) {
          console.error("Encryption failed, falling back to plain", err);
        }
      }
    }

    socket.emit('message:send', {
      conversationId,
      content: finalContent,
      senderEncryptedKey,
      recipientEncryptedKey,
      iv,
      type,
      tempId,
      ...(fileData && {
        fileUrl: fileData.fileUrl || fileData.url,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize,
      }),
    });
  },

  addMessage: (message, tempId) => {
    // Decrypt if necessary. Usually `addMessage` is called from socket handler when receiving
    // but the socket handler won't easily be async. 
    // We should allow the component or a dedicated effect to decrypt, or we make addMessage async?
    // Let's just handle decryption directly here in a fire-and-forget promise if needed.
    
    const applyDecryptedMessage = (decryptedMsg: Message) => {
      set((state) => {
        const convId = decryptedMsg.conversation;
        const existing = state.messages[convId] || [];

        let updated: Message[];
        if (tempId) {
        // Replace optimistic message with server-confirmed one
        updated = existing.map((m) =>
          m.tempId === tempId ? { ...message, pending: false } : m
        );
        // If no match found, append (shouldn't happen usually)
        if (!updated.find((m) => m._id === message._id)) {
          updated = [...existing.filter((m) => m.tempId !== tempId), message];
        }
      } else {
        // Check for duplicates
        if (existing.find((m) => m._id === message._id)) {
          return state;
        }
        updated = [...existing, message];
      }

      // Update conversation's lastMessage and reorder
      const updatedConversations = state.conversations.map((conv) => {
        if (conv._id === convId) {
          const senderInfo = typeof message.sender === 'string'
            ? message.sender
            : message.sender._id;
          return {
            ...conv,
            lastMessage: {
              content: message.content,
              sender: senderInfo,
              timestamp: message.createdAt,
              type: message.type,
            },
            updatedAt: message.createdAt,
            unreadCount: state.activeConversation?._id === convId
              ? conv.unreadCount
              : conv.unreadCount + 1,
          };
        }
        return conv;
      }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      return {
        messages: { ...state.messages, [convId]: updated },
        conversations: updatedConversations,
      };
      });
    };

    if (message.iv && !tempId) { 
      // Need to decrypt incoming message (not our own optimistic temp one)
      decryptMessagesBatch([message]).then(res => {
         applyDecryptedMessage(res[0]);
      });
    } else {
      applyDecryptedMessage(message);
    }
  },

  updateMessageStatus: (messageId, conversationId, status) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((m) =>
          m._id === messageId ? { ...m, status: status as any } : m
        ),
      },
    }));
  },

  updateReadReceipt: (conversationId, messageIds) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((m) =>
          messageIds.includes(m._id) ? { ...m, status: 'read' as any } : m
        ),
      },
    }));
  },

  setTyping: (conversationId, userId, isTyping) => {
    const key = `${conversationId}:${userId}`;
    set((state) => ({
      typingUsers: { ...state.typingUsers, [key]: isTyping },
    }));
  },

  updateUserStatus: (userId, status) => {
    set((state) => {
      const updatedConversations = state.conversations.map((conv) => ({
        ...conv,
        participants: conv.participants.map((p) =>
          p._id === userId ? { ...p, status: status as any } : p
        ),
      }));

      return {
        onlineUsers: { ...state.onlineUsers, [userId]: status === 'online' },
        conversations: updatedConversations,
        activeConversation: state.activeConversation
          ? {
              ...state.activeConversation,
              participants: state.activeConversation.participants.map((p) =>
                p._id === userId ? { ...p, status: status as any } : p
              ),
            }
          : null,
      };
    });
  },

  startConversation: async (userId) => {
    const { data } = await api.post<Conversation>('/conversations', { userId });
    
    set((state) => {
      const exists = state.conversations.find((c) => c._id === data._id);
      if (exists) return state;
      return { conversations: [data, ...state.conversations] };
    });

    return data;
  },

  markAsRead: (conversationId) => {
    const socket = getSocket();
    const messages = get().messages[conversationId] || [];
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const currentUser = userStr ? JSON.parse(userStr) : null;

    if (!currentUser || !socket) return;

    const unreadIds = messages
      .filter((m) => {
        const senderId = typeof m.sender === 'string' ? m.sender : m.sender._id;
        return senderId !== currentUser._id && m.status !== 'read';
      })
      .map((m) => m._id);

    if (unreadIds.length > 0) {
      socket.emit('message:read', { conversationId, messageIds: unreadIds });

      // Update local state
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: (state.messages[conversationId] || []).map((m) =>
            unreadIds.includes(m._id) ? { ...m, status: 'read' as any } : m
          ),
        },
        conversations: state.conversations.map((conv) =>
          conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ),
      }));
    }
  },
}));
