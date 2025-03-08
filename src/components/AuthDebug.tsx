import React from 'react';
import { useAuthStore } from '../store/authStore';
import { testSupabaseConnection } from '../lib/supabase';

export default function AuthDebug() {
  const { user, isAuthenticated, isLoading, session } = useAuthStore();
  const [testResult, setTestResult] = React.useState<{success: boolean; data?: unknown; error?: unknown} | null>(null);
  const [showDebug, setShowDebug] = React.useState(false);

  const runConnectionTest = async () => {
    const result = await testSupabaseConnection();
    setTestResult(result);
  };

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  if (!showDebug) {
    return (
      <button 
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded text-xs"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded text-xs max-w-md max-h-96 overflow-auto">
      <div className="flex justify-between mb-2">
        <h3 className="font-bold">Auth Debug</h3>
        <button onClick={() => setShowDebug(false)}>✕</button>
      </div>
      <div>
        <p>isAuthenticated: {isAuthenticated ? 'true' : 'false'}</p>
        <p>isLoading: {isLoading ? 'true' : 'false'}</p>
        <p>User: {user ? user.email : 'null'}</p>
        <p>Session: {session ? 'present' : 'null'}</p>
        <button 
          onClick={runConnectionTest}
          className="bg-blue-600 text-white p-1 rounded mt-2 text-xs"
        >
          Test Connection
        </button>
        {testResult && (
          <pre className="mt-2 bg-gray-700 p-2 rounded">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
} 