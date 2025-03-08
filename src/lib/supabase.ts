import { createClient } from '@supabase/supabase-js';
import { debugLog } from './debug';

// Replace with your Supabase URL and anon key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

debugLog('Initializing Supabase client with URL', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'ai-guruji-auth',
  },
});

// Add a simple test function to check if Supabase is working
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1);
    
    if (error) {
      debugLog('Supabase connection test failed', error);
      return { success: false, error };
    }
    
    debugLog('Supabase connection test succeeded', data);
    return { success: true, data };
  } catch (error) {
    debugLog('Unexpected error in Supabase connection test', error);
    return { success: false, error };
  }
};