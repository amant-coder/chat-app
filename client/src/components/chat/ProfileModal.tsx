'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';

export default function ProfileModal() {
  const isOpen = useUIStore((s) => s.isProfileOpen);
  const setOpen = useUIStore((s) => s.setProfileOpen);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const addToast = useUIStore((s) => s.addToast);

  const [bio, setBio] = useState(user?.bio || '');
  const [statusMessage, setStatusMessage] = useState(user?.statusMessage || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await api.put('/auth/profile', { bio, statusMessage });
      setUser(data);
      addToast('Profile updated successfully', 'success');
      setOpen(false);
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-(--bg-secondary) rounded-3xl border border-(--border) shadow-2xl overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-(--border) flex items-center justify-between">
          <h2 className="text-xl font-bold text-(--text-primary)">Profile Settings</h2>
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
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <img
                src={user?.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${user?.username}`}
                alt=""
                className="w-24 h-24 rounded-full border-4 border-(--accent)/20 object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="text-sm font-medium text-(--text-primary)">{user?.username}</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-(--text-secondary)">Status Message</label>
              <input
                type="text"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder="How are you feeling?"
                maxLength={50}
                className="w-full px-4 py-3 bg-(--bg-tertiary) border border-(--border) rounded-xl text-(--text-primary) placeholder:text-(--text-muted) focus:ring-2 focus:ring-(--accent) transition-all outline-none"
              />
              <p className="text-[10px] text-right text-(--text-muted)">{statusMessage.length}/50</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-(--text-secondary)">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={160}
                className="w-full px-4 py-3 bg-(--bg-tertiary) border border-(--border) rounded-xl text-(--text-primary) placeholder:text-(--text-muted) focus:ring-2 focus:ring-(--accent) transition-all outline-none resize-none"
              />
              <p className="text-[10px] text-right text-(--text-muted)">{bio.length}/160</p>
            </div>
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
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-3 rounded-xl bg-(--accent) text-white font-bold hover:bg-(--accent-hover) transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
