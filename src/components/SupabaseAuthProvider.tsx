import React, { useEffect, createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from './LoadingSpinner';

interface AuthContextType {
  isInitializing: boolean;
}

const AuthContext = createContext<AuthContextType>({ isInitializing: true });

export const useAuth = () => useContext(AuthContext);

export default function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const { refreshSession } = useAuthStore();

  useEffect(() => {
    const initialize = async () => {
      await refreshSession();
      setIsInitializing(false);
    };

    initialize();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await refreshSession();
        } else if (event === 'SIGNED_OUT') {
          await refreshSession();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [refreshSession]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
} 