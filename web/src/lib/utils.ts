import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function getStatusColor(status: number) {
  if (status < 300) return 'var(--accent3)';
  if (status < 400) return '#facc15';
  if (status < 500) return '#f87171';
  return '#ef4444';
}

export function getMethodColor(method: string) {
  const colors: Record<string, string> = {
    GET: '#34d399',
    POST: '#4f8aff',
    PUT: '#facc15',
    PATCH: '#fb923c',
    DELETE: '#f87171',
  };
  return colors[method] || '#8888aa';
}

export function getMethodBg(method: string) {
  const colors: Record<string, string> = {
    GET: 'rgba(52,211,153,0.1)',
    POST: 'rgba(79,138,255,0.1)',
    PUT: 'rgba(250,204,21,0.1)',
    PATCH: 'rgba(251,146,60,0.1)',
    DELETE: 'rgba(248,113,113,0.1)',
  };
  return colors[method] || 'rgba(136,136,170,0.1)';
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
}

export function saveToken(token: string) {
  localStorage.setItem('axon_token', token);
}

export function getToken() {
  return localStorage.getItem('axon_token');
}

export function removeToken() {
  localStorage.removeItem('axon_token');
  localStorage.removeItem('axon_user');
}

export function saveUser(user: any) {
  localStorage.setItem('axon_user', JSON.stringify(user));
}

export function getUser() {
  const user = localStorage.getItem('axon_user');
  return user ? JSON.parse(user) : null;
}

export function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function generateSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}