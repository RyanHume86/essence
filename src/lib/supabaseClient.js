// Supabase client for the Personal Task Layer.
//
// This points at the SAME Supabase project as the existing Base44 stack
// (NeuroRound, Nidus Recall) so the same login works across apps. PowerSync
// obtains its session token from this client (see SupabaseConnector).
//
// Configure via .env.local:
//   VITE_SUPABASE_URL=...
//   VITE_SUPABASE_ANON_KEY=...
//   VITE_POWERSYNC_URL=...
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const POWERSYNC_URL = import.meta.env.VITE_POWERSYNC_URL;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
