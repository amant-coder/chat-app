'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useChatStore } from '@/stores/chatStore';
import api from '@/lib/api';

export default function GroupCreateModal() {
  const isOpen = useUIStore((s) => s.isGroupCreateOpen);
  const setOpen = useUIStore((s) => s.setGroupCreateOpen);
  const addToast = useUIStore((s) => s.addToast);
  const addConversation = useChatStore((s) => s.addConversation);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) return addToast('Group name is required', 'error');
    
    setIsCreating(true);
    try {
      // In a real app, we'd also pick participants here.
      // For now, let's create a group with just the current user.
      const { data } = await api.post('/conversations/groups', { name, description });
      addConversation(data);
      addToast('Group created successfully', 'success');
      setOpen(false);
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Failed to create group', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-(--bg-secondary) rounded-3xl border border-(--border) shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-(--border) flex items-center justify-between">
          <h2 className="text-xl font-bold text-(--text-primary)">Create Group Chat</h2>
          <button 
            onClick={() => setOpen(false)}
            className="p-2 rounded-xl hover:bg-(--bg-hover) transition-colors"
          >
            <svg className="w-6 h-6 text-(--text-secondary)" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-(--text-secondary)">Group Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pulse Devs, Coffee Club, etc."
                className="w-full px-4 py-3 bg-(--bg-tertiary) border border-(--border) rounded-xl text-(--text-primary) placeholder:text-(--text-muted) focus:ring-2 focus:ring-(--accent) transition-all outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-(--text-secondary)">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this group about?"
                rows={3}
                className="w-full px-4 py-3 bg-(--bg-tertiary) border border-(--border) rounded-xl text-(--text-primary) placeholder:text-(--text-muted) focus:ring-2 focus:ring-(--accent) transition-all outline-none resize-none"
              />
            </div>
          </div>
          
          <div className="p-4 bg-(--bg-tertiary) rounded-2xl border border-(--border) border-dashed">
            <p className="text-xs text-(--text-muted) text-center">
              You can add participants after creating the group.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-(--border) flex gap-3">
          <button
            onClick={() => setOpen(false)}
            className="flex-1 px-4 py-3 rounded-xl border border-(--border) text-(--text-primary) font-medium hover:bg-(--bg-hover) transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="flex-1 px-4 py-3 rounded-xl bg-(--accent) text-white font-bold hover:bg-(--accent-hover) transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}
