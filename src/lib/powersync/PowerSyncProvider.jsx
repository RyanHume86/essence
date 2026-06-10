import React, { useEffect } from 'react';
import { PowerSyncContext } from '@powersync/react';
import { db, connectPowerSync } from './db';

// Wraps the app subtree that uses the local task database. Initialises the
// connection to Supabase on mount (which no-ops until a session exists).
export function PowerSyncProvider({ children }) {
  useEffect(() => {
    connectPowerSync();
  }, []);

  return <PowerSyncContext.Provider value={db}>{children}</PowerSyncContext.Provider>;
}
