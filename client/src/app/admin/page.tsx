'use client';

import { useEffect, useState } from 'react';
// removed unused imports
import { getAdminUsers, requestAdminAccess, verifyAdminAccess, deleteAdminUser } from '@/lib/adminApi';
import { User } from '@/types';
import { 
  Users, 
  ShieldCheck, 
  Clock, 
  Mail, 
  Search, 
  RefreshCcw,
  UserCheck,
  UserX,
  ChevronLeft,
  Lock,
  KeyRound,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminPage() {
  
  
  const [step, setStep] = useState<'login' | 'otp' | 'dashboard'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [otp, setOtp] = useState('');
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: string; username: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Check if we already have an admin token stored
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setStep('dashboard');
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await requestAdminAccess(email, password, secretCode);
      setStep('otp');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const { adminToken } = await verifyAdminAccess(email, otp);
      localStorage.setItem('adminToken', adminToken);
      setStep('dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setStep('login');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminUsers(token);
      setUsers(data);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { error?: string } } };
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('adminToken');
        setStep('login');
      } else {
        setError(error.response?.data?.error || 'Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === 'dashboard') {
      fetchUsers();
    }
  }, [step]);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDeleteUser = async () => {
    if (!deleteConfirm) return;
    const token = localStorage.getItem('adminToken');
    if (!token) { setStep('login'); return; }

    try {
      setDeleting(true);
      setError(null);
      await deleteAdminUser(token, deleteConfirm.userId);
      setUsers((prev) => prev.filter((u) => u._id !== deleteConfirm.userId));
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { error?: string } } };
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('adminToken');
        setStep('login');
      } else {
        setError(error.response?.data?.error || 'Failed to delete user');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setStep('login');
    setEmail('');
    setPassword('');
    setSecretCode('');
    setOtp('');
  };

  if (step === 'login' || step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B141A] p-4">
        <div className="w-full max-w-md bg-[#111B21] border border-gray-800 rounded-2xl p-8 shadow-2xl animate-fade-in">
          <div className="flex flex-col items-center mb-8">
            <div className="h-16 w-16 bg-gradient-to-br from-[#00A884] to-[#008f6f] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#00A884]/20">
              <ShieldCheck className="text-[#0B141A]" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-100">Secure Admin Access</h1>
            <p className="text-gray-400 text-sm mt-2 text-center">
              {step === 'login' ? 'Enter your credentials to request an access code.' : `Enter the 5-digit code sent to ${email}`}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <UserX size={16} />
              {error}
            </div>
          )}

          {step === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#202C33] border border-gray-700/50 rounded-xl py-3 pl-10 pr-4 text-gray-100 focus:outline-none focus:border-[#00A884] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#202C33] border border-gray-700/50 rounded-xl py-3 pl-10 pr-4 text-gray-100 focus:outline-none focus:border-[#00A884] transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Secret Code</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="password" 
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    required
                    placeholder="Enter the Secret code"
                    className="w-full bg-[#202C33] border border-gray-700/50 rounded-xl py-3 pl-10 pr-4 text-gray-100 focus:outline-none focus:border-[#00A884] transition-colors"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#00A884] hover:bg-[#008f6f] text-[#0B141A] font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? 'Verifying...' : 'Request Access Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">5-Digit OTP</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    required
                    maxLength={5}
                    placeholder="12345"
                    className="w-full bg-[#202C33] border border-gray-700/50 rounded-xl py-3 pl-10 pr-4 text-gray-100 focus:outline-none focus:border-[#00A884] transition-colors text-center text-2xl tracking-[0.5em] font-mono"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading || otp.length < 5}
                className="w-full bg-[#00A884] hover:bg-[#008f6f] text-[#0B141A] font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
              >
                {loading && <RefreshCcw size={18} className="animate-spin" />}
                {loading ? 'Verifying...' : 'Verify & Access Dashboard'}
              </button>
              <button 
                type="button"
                onClick={() => setStep('login')}
                className="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors mt-2"
              >
                Back to Login
              </button>
            </form>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
             <Link href="/" className="text-[#00A884] hover:underline text-sm font-medium">
               Return to Chat App
             </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B141A] text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/" className="flex items-center text-[#00A884] hover:underline mb-2 gap-1 group">
              <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              Back to Chat
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <ShieldCheck className="text-[#00A884]" size={32} />
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">Manage and view all registered users in your application.</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20 font-medium text-sm"
            >
              Secure Logout
            </button>
            <button 
              onClick={fetchUsers}
              className="p-2 bg-[#202C33] hover:bg-[#2A3942] rounded-lg transition-colors border border-gray-700/50"
              title="Refresh users"
            >
              <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
            </button>
            <div className="bg-[#202C33] px-4 py-2 rounded-lg border border-gray-700/50 flex items-center gap-2">
              <Users size={20} className="text-[#00A884]" />
              <span className="font-semibold">{users.length}</span>
              <span className="text-gray-400 text-sm">Users</span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#111B21] border border-gray-800 p-5 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <UserCheck size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Online Now</h3>
            <p className="text-2xl font-bold">{users.filter(u => u.status === 'online').length}</p>
          </div>
          <div className="bg-[#111B21] border border-gray-800 p-5 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Clock size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Recently Active (24h)</h3>
            <p className="text-2xl font-bold">
              {users.filter(u => {
                if (!u.lastSeen) return false;
                const lastSeen = new Date(u.lastSeen).getTime();
                return Date.now() - lastSeen < 24 * 60 * 60 * 1000;
              }).length}
            </p>
          </div>
          <div className="bg-[#111B21] border border-gray-800 p-5 rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Mail size={24} />
              </div>
            </div>
            <h3 className="text-gray-400 text-sm font-medium">New Users (7d)</h3>
            <p className="text-2xl font-bold">
              {users.filter(u => {
                if (!u.createdAt) return false;
                const created = new Date(u.createdAt).getTime();
                return Date.now() - created < 7 * 24 * 60 * 60 * 1000;
              }).length}
            </p>
          </div>
        </div>

        {/* Search and Table */}
        <div className="bg-[#111B21] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search by username or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#202C33] border border-gray-700/50 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-[#00A884] transition-colors"
              />
            </div>
            {error && (
              <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-red-500/20">
                <UserX size={16} />
                {error}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#111B21] border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User / Full Name</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">E2EE Recovery PIN</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Seen</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider sticky right-0 bg-[#111B21] shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.3)] z-10">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {loading && users.length === 0 ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-10 w-10 bg-gray-800 rounded-full"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-800 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-800 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-12 bg-gray-800 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-800 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-gray-800 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-800 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-800 rounded"></div></td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-[#1C272E] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Image
                            src={u.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${u.username}`} 
                            alt={u.username}
                            width={40}
                            height={40}
                            unoptimized
                            className="h-10 w-10 rounded-full border border-gray-700 group-hover:border-[#00A884] transition-colors"
                          />
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-100">{u.username}</span>
                            {u.fullName && (
                              <span className="text-xs text-gray-400 font-normal mt-0.5">{u.fullName}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.authProvider === 'google' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20 shadow-sm shadow-[#4285F4]/5">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.52z" fill="#EA4335" />
                            </svg>
                            Google
                          </span>
                        ) : u.authProvider === 'github' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/10 text-gray-300 border border-gray-500/20 shadow-sm">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                            GitHub
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                            <Lock size={12} />
                            Password
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                          u.status === 'online' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.isAdmin ? (
                          <span className="bg-[#00A884]/10 text-[#00A884] px-2 py-1 rounded-lg text-xs font-bold border border-[#00A884]/20 uppercase">
                            Admin
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs uppercase font-medium">User</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {u.backupPin ? (
                          <span className="font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-1 rounded-md text-xs font-bold tracking-wider">
                            {u.backupPin}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs italic">
                            Standard Password
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {u.status === 'online' ? 'Currently active' : u.lastSeen ? formatDistanceToNow(new Date(u.lastSeen)) + ' ago' : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap sticky right-0 bg-[#111B21] group-hover:bg-[#1C272E] shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.3)] z-10 transition-colors">
                        <button
                          onClick={() => setDeleteConfirm({ userId: u._id, username: u.username })}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                          title={`Delete ${u.username}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <Search size={48} className="opacity-20" />
                        <p>No users found matching your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-[#111B21] border border-gray-800 rounded-2xl p-6 shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/10 mb-4">
                  <Trash2 size={28} className="text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-100">Delete User</h3>
                <p className="text-gray-400 text-sm mt-2">
                  Are you sure you want to permanently delete <span className="text-red-400 font-semibold">{deleteConfirm.username}</span>? This will also remove all their messages and conversations.
                </p>
              </div>

              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setDeleteConfirm(null); setError(null); }}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-[#202C33] transition-colors font-medium text-sm disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <RefreshCcw size={14} className="animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
