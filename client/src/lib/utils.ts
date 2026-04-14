import { format, isToday, isYesterday, parseISO } from 'date-fns';

export const formatMessageTime = (dateString: string): string => {
  const date = parseISO(dateString);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`;
  return format(date, 'dd/MM/yyyy HH:mm');
};

export const formatLastSeen = (dateString: string): string => {
  const date = parseISO(dateString);
  if (isToday(date)) return `Last seen today at ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `Last seen yesterday at ${format(date, 'HH:mm')}`;
  return `Last seen ${format(date, 'dd/MM/yyyy')}`;
};

export const formatConversationTime = (dateString?: string): string => {
  if (!dateString) return '';
  const date = parseISO(dateString);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'dd/MM');
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const getSenderInfo = (sender: any): { _id: string; username: string; avatar: string } => {
  if (typeof sender === 'string') {
    return { _id: sender, username: 'Unknown', avatar: '' };
  }
  return sender;
};
