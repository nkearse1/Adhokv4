import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. ' +
    'Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file'
  );
}

// Check if URL is still a placeholder
if (supabaseUrl.includes('your-project-ref') || supabaseUrl === 'your-project-url') {
  throw new Error(
    'Supabase URL is still a placeholder. ' +
    'Please replace VITE_SUPABASE_URL in your .env file with your actual Supabase project URL. ' +
    'You can find this in your Supabase dashboard under Settings > API.'
  );
}

// Check if anon key is still a placeholder
if (supabaseAnonKey.includes('your-anon') || supabaseAnonKey === 'your-anon-key') {
  throw new Error(
    'Supabase Anon Key is still a placeholder. ' +
    'Please replace VITE_SUPABASE_ANON_KEY in your .env file with your actual Supabase anon key. ' +
    'You can find this in your Supabase dashboard under Settings > API.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    `Invalid Supabase URL format: "${supabaseUrl}". ` +
    'Please ensure VITE_SUPABASE_URL is a valid URL (e.g., https://your-project-ref.supabase.co)'
  );
}

// Determine if running in preview/dev (StackBlitz, localhost, etc.)
const isPreview = typeof window !== 'undefined' &&
  (window.location.hostname.includes('webcontainer') ||
   window.location.hostname.includes('stackblitz') ||
   window.location.hostname === 'localhost');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: !isPreview,
    autoRefreshToken: !isPreview,
    detectSessionInUrl: !isPreview,
    storageKey: isPreview ? undefined : 'adhok_auth',
    flowType: 'pkce',
  },
});

// Optional: expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
}

/**
 * Optional helper to make direct Supabase REST requests with logging.
 */
export async function fetchWithSupabase(url: string, options?: RequestInit) {
  const response = await fetch(url, options);
  if (!response.ok) {
    let errorBody = {};
    try {
      errorBody = await response.json();
    } catch (_) {
      errorBody = { message: 'Could not parse error JSON' };
    }

    console.error('Supabase request failed', {
      status: response.status,
      statusText: response.statusText,
      error: errorBody,
    });
  }
  return response;
}
