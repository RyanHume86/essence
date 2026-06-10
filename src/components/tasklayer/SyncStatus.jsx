import React from 'react';
import { useStatus } from '@powersync/react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';

// Small ambient indicator of PowerSync connectivity and last sync time.
export default function SyncStatus() {
  const status = useStatus();

  const connected = status?.connected;
  const syncing = status?.dataFlowStatus?.downloading || status?.dataFlowStatus?.uploading;
  const lastSynced = status?.lastSyncedAt;

  const Icon = syncing ? RefreshCw : connected ? Cloud : CloudOff;
  const text = syncing
    ? 'Syncing…'
    : connected
      ? lastSynced
        ? `Synced ${lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : 'Connected'
      : 'Offline';

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
      title={connected ? 'Connected to PowerSync' : 'Working offline — changes will sync on reconnect'}
    >
      <Icon className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''} ${connected ? '' : 'text-muted-foreground/60'}`} />
      {text}
    </span>
  );
}
