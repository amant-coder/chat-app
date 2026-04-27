'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { getAdminUsers, requestAdminAccess, verifyAdminAccess } from '@/lib/adminApi';
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
  KeyRound
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function AdminPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const router = useRouter();
  
  const [step, setStep] = useState<'login' | 'otp' | 'dashboard'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [otp, setOtp] = useState('');
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
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
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('adminToken');
        setStep('login');
      } else {
        setError(err.response?.data?.error || 'Failed to fetch users');
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
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Seen</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
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
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-800 rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-800 rounded"></div></td>
                    </tr>
                  ))
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-[#1C272E] transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img 
                            src={u.avatar || `https://api.dicebear.com/9.x/initials/svg?seed=${u.username}`} 
                            alt={u.username}
                            className="h-10 w-10 rounded-full border border-gray-700 group-hover:border-[#00A884] transition-colors"
                          />
                          <span className="font-medium">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-400">{u.email}</td>
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {u.status === 'online' ? 'Currently active' : u.lastSeen ? formatDistanceToNow(new Date(u.lastSeen)) + ' ago' : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
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
      </div>
    </div>
  );
}
