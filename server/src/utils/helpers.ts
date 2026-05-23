import crypto from 'crypto';

export const generateDefaultAvatar = (username: string): string => {
  const hash = crypto.createHash('md5').update(username).digest('hex');
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(username)}&backgroundColor=${hash.substring(0, 6)}`;
};

export const paginationDefaults = (page?: number, limit?: number) => ({
  page: Math.max(1, page || 1),
  limit: Math.min(50, Math.max(1, limit || 30)),
});
