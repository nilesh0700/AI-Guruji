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
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isInitializing) {
        console.log('Auth initialization timed out, proceeding anyway');
        setIsInitializing(false);
      }
    }, 5000); // 5 second timeout

    const initialize = async () => {
      try {
        await refreshSession();
      } catch (error) {
        console.error('Error refreshing session:', error);
      } finally {
        setIsInitializing(false);
        clearTimeout(timeoutId); // Clear timeout if initialization completes normally
      }
    };

    initialize();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        console.log('Auth state changed:', event);
        try {
          await refreshSession();
        } catch (error) {
          console.error('Error in auth state change handler:', error);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [refreshSession]);

  // Reduced loading time with simpler UI
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
        <p className="ml-2 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
} 