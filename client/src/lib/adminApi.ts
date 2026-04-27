import api from './api';
import { User } from '@/types';

export const requestAdminAccess = async (email: string, password: string, secretCode: string): Promise<{ message: string }> => {
  const { data } = await api.post('/auth/admin/login', { email, password, secretCode });
  return data;
};

export const verifyAdminAccess = async (email: string, otp: string): Promise<{ adminToken: string }> => {
  const { data } = await api.post('/auth/admin/verify', { email, otp });
  return data;
};

export const getAdminUsers = async (adminToken: string): Promise<User[]> => {
  const { data } = await api.get<User[]>('/auth/admin/users', {
    headers: {
      Authorization: `Bearer ${adminToken}`
    }
  });
  return data;
};
