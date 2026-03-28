import { create } from 'zustand';
import { authAPI } from '@/lib/api';
import { saveToken, removeToken, saveUser, getUser, getToken } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  plan: string;
  ai_requests_used: number;
  ai_requests_limit: number;
  is_admin: boolean;
  github_username?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, full_name: string) => Promise<void>;
  signOut: () => Promise<void>;
  getMe: () => Promise<void>;
  initialize: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: false,
  initialized: false,

  initialize: () => {
    const token = getToken();
    const user = getUser();
    if (token && user) {
      set({ token, user, initialized: true });
      // Refresh user data in background
      get().getMe().catch(() => removeToken());
    } else {
      set({ initialized: true });
    }
  },
  
signIn: async (email, password) => {
  set({ loading: true });
  try {
    const { data } = await authAPI.signIn({ email, password });
    const token = data.session?.access_token;
    saveToken(token);
    saveUser(data.user);
    set({ user: data.user, token, loading: false, initialized: true });
  } catch (err) {
    set({ loading: false });
    throw err;
  }
},

  signUp: async (email, password, full_name) => {
    set({ loading: true });
    try {
      await authAPI.signUp({ email, password, full_name });
      set({ loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  signOut: async () => {
    try {
      await authAPI.signOut();
    } finally {
      removeToken();
      set({ user: null, token: null });
      window.location.href = '/auth/login';
    }
  },

  getMe: async () => {
    try {
      const { data } = await authAPI.getMe();
      saveUser(data.user);
      set({ user: data.user });
    } catch (err) {
      removeToken();
      set({ user: null, token: null });
    }
  },

  setUser: (user) => {
    saveUser(user);
    set({ user });
  },
}));
