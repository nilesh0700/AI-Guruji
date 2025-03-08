import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Add a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Auth callback timed out, redirecting to dashboard');
      navigate('/dashboard');
    }, 5000); // 5 second timeout

    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error during auth callback:', error);
          setError(error.message);
          navigate('/login');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError('An unexpected error occurred');
        navigate('/login');
      } finally {
        clearTimeout(timeoutId);
      }
    };

    handleAuthCallback();

    return () => clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {error ? (
        <div className="text-red-600 mb-4">{error}</div>
      ) : (
        <>
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Completing authentication...</p>
        </>
      )}
    </div>
  );
} 