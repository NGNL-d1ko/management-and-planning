import { createClient } from '@supabase/supabase-js';

export const getSupabaseConfigStatus = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  // Check for local mode flag
  const forceLocal = import.meta.env.VITE_FORCE_LOCAL === 'true';
  
  return {
    hasUrl: Boolean(supabaseUrl) && !forceLocal,
    hasAnonKey: Boolean(supabaseAnonKey) && !forceLocal,
    isLocal: forceLocal || !supabaseUrl || !supabaseAnonKey,
  };
};

const configStatus = getSupabaseConfigStatus();

// Only create client if configured
export const supabase = configStatus.hasUrl && configStatus.hasAnonKey
  ? createClient(configStatus.hasUrl ? import.meta.env.VITE_SUPABASE_URL : '', configStatus.hasAnonKey ? import.meta.env.VITE_SUPABASE_ANON_KEY : '')
  : null;
