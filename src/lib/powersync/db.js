// The on-device PowerSync database. The app reads and writes against this local
// SQLite instance; PowerSync streams changes to/from Supabase in the background.
import { PowerSyncDatabase, createBaseLogger, LogLevel } from '@powersync/web';
import { AppSchema } from './AppSchema';
import { SupabaseConnector } from './SupabaseConnector';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';

const logger = createBaseLogger();
logger.useDefaults();
logger.setLevel(import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN);

export const db = new PowerSyncDatabase({
  schema: AppSchema,
  database: { dbFilename: 'task-layer.db' },
});

export const connector = new SupabaseConnector();

let connecting = null;

/** Connect PowerSync once a Supabase session exists. Safe to call repeatedly. */
export async function connectPowerSync() {
  if (!isSupabaseConfigured) return;
  if (connecting) return connecting;
  connecting = db.connect(connector);
  return connecting;
}

export async function disconnectPowerSync() {
  connecting = null;
  await db.disconnect();
}

// Reconnect / disconnect as the Supabase auth state changes, so a fresh login
// (or logout) is reflected without a page reload.
if (isSupabaseConfigured && supabase) {
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      connectPowerSync();
    } else if (event === 'SIGNED_OUT') {
      disconnectPowerSync();
    }
  });
}
