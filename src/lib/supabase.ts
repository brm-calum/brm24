import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { retryWithBackoff } from './utils/retry';
import { handleError } from './utils/errors';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Handle auth state changes
const handleAuthStateChange = (event: string, session: any) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    // Clear any cached data
    localStorage.removeItem('supabase-auth-token');
    
    // Force reload to clear all state
    window.location.reload();
  }
};
// Create custom fetch with timeout
const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 5000) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]) as Promise<Response>;
};

// Create Supabase client with auto refresh and persistent sessions
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'brm-warehouse-auth',
    detectSessionInUrl: true,
    storage: {
      getItem: key => {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          console.warn('Storage access error:', e);
          return null;
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
        } catch (e) {
          console.warn('Storage write error:', e);
        }
      },
      removeItem: key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('Storage remove error:', e);
        }
      }
    }
  },
  global: {
    headers: {
      'x-application-name': 'brm-warehouse',
    },
    fetch: (url, options) => retryWithBackoff(() => fetchWithTimeout(url, options))
  },
});

// Set up auth state change listener
supabase.auth.onAuthStateChange(handleAuthStateChange);

// Handle auth errors globally
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED' && !session) {
    handleError(new Error('Session expired'), 'auth');
  }
});