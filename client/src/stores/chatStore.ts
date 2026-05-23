import { create } from 'zustand';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Conversation, Message, MessagesResponse, MessageType, MessageStatus } from '@/types';
import { encryptMessage, decryptMessage } from '@/lib/crypto';

// Helper to decrypt a batch of messages
const decryptMessagesBatch = async (messages: Message[]): Promise<Message[]> => {
  const privateKeyStr = localStorage.getItem('e2e_private_key');
  if (!privateKeyStr) return messages;

  let myPrivateKey: CryptoKey | null = null;
  try {
    const jwk = JSON.parse(privateKeyStr);
    myPrivateKey = await window.crypto.subtle.importKey(
      'jwk',
      jwk,
      { name: 'RSA-OAEP', hash: 'SHA-512' },
      true,
      ['decrypt']
    );
  } catch (err) {
    console.error("Failed to parse local private key setup", err);
  }

  if (!myPrivateKey) return messages;

  const decryptedMessages = await Promise.all(messages.map(async (m) => {
    const decryptedMsg = { ...m };
    if (m.replyTo) {
      if (m.replyTo.iv) {
        const dec = await decryptMessagesBatch([m.replyTo]);
        decryptedMsg.replyTo = dec[0];
      }
    }

    if (!decryptedMsg.iv || (!decryptedMsg.recipientEncryptedKey && !decryptedMsg.senderEncryptedKey)) {
       return decryptedMsg; // Unencrypted message 
    }
    
    // Find my encrypted key (are we sender or receiver?)
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    
    let targetKeyStr = decryptedMsg.recipientEncryptedKey;
    const senderId = typeof decryptedMsg.sender === 'string' ? decryptedMsg.sender : decryptedMsg.sender._id;
    if (currentUser && senderId === currentUser._id) {
       targetKeyStr = decryptedMsg.senderEncryptedKey;
    }

    if (!targetKeyStr) return decryptedMsg;

    try {
      const decryptedContent = await decryptMessage(decryptedMsg.content, targetKeyStr, decryptedMsg.iv, myPrivateKey);
      decryptedMsg.content = decryptedContent;
    } catch (err) {
      console.error("Failed to decrypt individual message", err);
    }
    
    return decryptedMsg;
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
  replyingToMessage: Message | null;

  // Actions
  fetchConversations: () => Promise<void>;
  setActiveConversation: (conversation: Conversation | null) => void;
  fetchMessages: (conversationId: string) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, type?: string, fileData?: { fileUrl: string; fileName: string; fileSize: number; url?: string }, replyToId?: string) => Promise<void>;
  addMessage: (message: Message, tempId?: string | null) => void;
  updateMessageStatus: (messageId: string, conversationId: string, status: string) => void;
  updateReadReceipt: (conversationId: string, messageIds: string[]) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  updateUserStatus: (userId: string, status: string) => void;
  startConversation: (userId: string) => Promise<Conversation>;
  markAsRead: (conversationId: string) => void;
  toggleReaction: (messageId: string, conversationId: string, emoji: string) => void;
  updateMessageReaction: (messageId: string, conversationId: string, reactions: { emoji: string; users: string[] }[]) => void;
  upsertConversation: (conversation: Conversation) => void;
  addConversation: (conversation: Conversation) => void;
  searchMessages: (query: string) => Promise<Message[]>;
  addGroupParticipant: (conversationId: string, userId: string) => Promise<void>;
  setReplyingToMessage: (message: Message | null) => void;
  deleteMessage: (messageId: string, conversationId: string) => Promise<void>;
  deleteMessageLocal: (messageId: string, conversationId: string) => void;
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
  replyingToMessage: null,

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

  fetchMessages: async (conversationId) => {
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

  sendMessage: async (conversationId, content, type = 'text', fileData, replyToId) => {
    const socket = getSocket();
    if (!socket) return;

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const replyingTo = get().replyingToMessage;

    // Optimistic update — add plaintext message immediately
    if (currentUser) {
      const optimisticMessage: Message = {
        _id: tempId,
        conversation: conversationId,
        sender: currentUser,
        content,
        type: type as MessageType,
        status: 'sent',
        readBy: [],
        createdAt: new Date().toISOString(),
        tempId,
        pending: true,
        replyTo: replyingTo,
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
        replyingToMessage: null,
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
      replyToId,
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
            m.tempId === tempId ? { ...decryptedMsg, pending: false } : m
          );
          // If no match found, append (shouldn't happen usually)
          if (!updated.find((m) => m._id === decryptedMsg._id)) {
            updated = [...existing.filter((m) => m.tempId !== tempId), decryptedMsg];
          }
        } else {
          // Check for duplicates
          if (existing.find((m) => m._id === decryptedMsg._id)) {
            return state;
          }
          updated = [...existing, decryptedMsg];
        }

        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const currentUserId = currentUser?._id;

        const updatedConversations = state.conversations.map((conv) => {
          if (conv._id === convId) {
            const senderId = typeof decryptedMsg.sender === 'string'
              ? decryptedMsg.sender
              : decryptedMsg.sender._id;
            
            const isMe = senderId === currentUserId;

            return {
              ...conv,
              lastMessage: {
                content: decryptedMsg.content,
                sender: senderId,
                timestamp: decryptedMsg.createdAt,
                type: decryptedMsg.type,
              },
              updatedAt: decryptedMsg.createdAt,
              unreadCount: (state.activeConversation?._id === convId || isMe)
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

      // Browser push/chrome notifications for this site
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const state = get();
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const currentUserId = currentUser?._id;
        const senderId = typeof decryptedMsg.sender === 'string'
          ? decryptedMsg.sender
          : decryptedMsg.sender._id;

        const isMe = senderId === currentUserId;
        const activeConv = state.activeConversation;
        const isCurrentConv = activeConv && activeConv._id === decryptedMsg.conversation;
        const isWindowFocused = document.hasFocus();

        if (!isMe && (!isCurrentConv || !isWindowFocused)) {
          const senderName = typeof decryptedMsg.sender === 'object' && decryptedMsg.sender.username
            ? decryptedMsg.sender.username
            : 'New Message';

          let bodyText = decryptedMsg.content;
          if (decryptedMsg.type === 'image') {
            bodyText = '📷 Image';
          } else if (decryptedMsg.type === 'file') {
            bodyText = '📁 File';
          } else if (decryptedMsg.type === 'video') {
            bodyText = '🎥 Video';
          } else if (decryptedMsg.type === 'voice') {
            bodyText = '🎤 Voice message';
          }

          try {
            const notif = new Notification(senderName, {
              body: bodyText,
              icon: '/favicon.ico',
              tag: decryptedMsg.conversation,
              renotify: true,
            } as NotificationOptions);

            notif.onclick = () => {
              window.focus();
              const convs = get().conversations;
              const targetConv = convs.find(c => c._id === decryptedMsg.conversation);
              if (targetConv) {
                get().setActiveConversation(targetConv);
              }
            };
          } catch (e) {
            console.error('Failed to show notification', e);
          }
        }
      }
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
          m._id === messageId ? { ...m, status: status as MessageStatus } : m
        ),
      },
    }));
  },

  updateReadReceipt: (conversationId, messageIds) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((m) =>
          messageIds.includes(m._id) ? { ...m, status: 'read' as MessageStatus } : m
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
          p._id === userId ? { ...p, status: status as 'online' | 'offline' } : p
        ),
      }));

      return {
        onlineUsers: { ...state.onlineUsers, [userId]: status === 'online' },
        conversations: updatedConversations,
        activeConversation: state.activeConversation
          ? {
              ...state.activeConversation,
              participants: state.activeConversation.participants.map((p) =>
                p._id === userId ? { ...p, status: status as 'online' | 'offline' } : p
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
            unreadIds.includes(m._id) ? { ...m, status: 'read' as MessageStatus } : m
          ),
        },
        conversations: state.conversations.map((conv) =>
          conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv
        ),
      }));
    }
  },

  toggleReaction: (messageId, conversationId, emoji) => {
    const socket = getSocket();
    if (!socket) return;
    
    // Optimistic UI could be implemented here, but for simplicity we rely on the server broadcast
    socket.emit('message:react', { messageId, conversationId, emoji });
  },

  updateMessageReaction: (messageId: string, conversationId: string, reactions) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map((m) =>
          m._id === messageId ? { ...m, reactions } : m
        ),
      },
    }));
  },

  upsertConversation: (conversation) => {
    set((state) => {
      const exists = state.conversations.find((c) => c._id === conversation._id);
      let updatedConversations: Conversation[];

      if (exists) {
        // Update existing conversation (e.g. last message, unread count)
        updatedConversations = state.conversations.map((c) =>
          c._id === conversation._id ? { ...c, ...conversation } : c
        );
      } else {
        // Add new conversation to the list
        updatedConversations = [conversation, ...state.conversations];
      }

      // Re-sort by updatedAt
      updatedConversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      return { conversations: updatedConversations };
    });
  },

  searchMessages: async (query) => {
    if (!query.trim()) return [];
    try {
      const activeConv = get().activeConversation;
      if (!activeConv) return [];
      
      const { data } = await api.get<{ messages: Message[] }>(`/messages/${activeConv._id}/search`, {
        params: { q: query },
      });
      return data.messages;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  },

  addConversation: (conversation) => {
    set((state) => {
      // Prevent duplicate conversations
      const exists = state.conversations.find((c) => c._id === conversation._id);
      if (exists) return state;
      return { conversations: [conversation, ...state.conversations] };
    });
  },

  addGroupParticipant: async (conversationId, userId) => {
    try {
      const { data } = await api.post<Conversation>(`/conversations/groups/${conversationId}/participants`, { userId });
      set((state) => ({
        activeConversation: state.activeConversation?._id === data._id ? data : state.activeConversation,
        conversations: state.conversations.map((c) => (c._id === data._id ? data : c)),
      }));
    } catch (error) {
      console.error('Failed to add group participant:', error);
      throw error;
    }
  },

  setReplyingToMessage: (message) => {
    set({ replyingToMessage: message });
  },

  deleteMessage: async (messageId, conversationId) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('message:delete', { messageId, conversationId });
  },

  deleteMessageLocal: (messageId, conversationId) => {
    set((state) => {
      const existing = state.messages[conversationId] || [];
      const updated = existing.map((m) => {
        if (m._id === messageId) {
          return {
            ...m,
            isDeleted: true,
            content: '🚫 This message was deleted',
            fileUrl: undefined,
            fileName: undefined,
            fileSize: undefined,
            type: 'text' as MessageType,
            reactions: [],
            replyTo: null,
          };
        }
        return m;
      });

      // Update lastMessage if this was the last message of the conversation
      const updatedConversations = state.conversations.map((conv) => {
        if (conv._id === conversationId) {
          const latest = updated[updated.length - 1];
          if (latest && latest._id === messageId) {
            return {
              ...conv,
              lastMessage: {
                content: '🚫 This message was deleted',
                sender: typeof latest.sender === 'string' ? latest.sender : latest.sender._id,
                timestamp: latest.createdAt,
                type: 'text' as MessageType,
              },
            };
          }
        }
        return conv;
      });

      return {
        messages: { ...state.messages, [conversationId]: updated },
        conversations: updatedConversations,
      };
    });
  },
}));
