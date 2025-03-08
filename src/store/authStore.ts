import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  register: (email: string, password: string, name: string) => Promise<{ error: Error | null, user: User | null }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// Helper to convert Supabase user to our User type
const formatUser = (user: SupabaseUser): User => {
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.email?.split('@')[0] || '',
    avatar: user.user_metadata?.avatar_url || '',
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  session: null,

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data?.user) {
      set({
        user: formatUser(data.user),
        isAuthenticated: true,
        session: data.session,
      });
    }

    return { error };
  },

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return { error };
  },

  register: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    let user = null;
    if (!error && data?.user) {
      user = formatUser(data.user);
      set({
        user,
        isAuthenticated: true,
        session: data.session,
      });
    }

    return { error, user };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false, session: null });
  },

  refreshSession: async () => {
    set({ isLoading: true });
    
    const { data } = await supabase.auth.getSession();
    
    if (data?.session) {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        set({
          user: formatUser(userData.user),
          isAuthenticated: true,
          session: data.session,
        });
      }
    }
    
    set({ isLoading: false });
  },
}));

// Initialize auth state on app load
supabase.auth.onAuthStateChange((event, session) => {
  if (session && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
    const user = session.user;
    useAuthStore.setState({
      user: formatUser(user),
      isAuthenticated: true,
      session,
    });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      session: null,
    });
  }
});