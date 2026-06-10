import React, { useState } from 'react';
import { useQuery } from '@powersync/react';
import { Layers } from 'lucide-react';
import CaptureBar from '@/components/tasklayer/CaptureBar';
import SyncStatus from '@/components/tasklayer/SyncStatus';
import {
  InboxView,
  WeekView,
  ContextView,
  StreamView,
  ArchiveView,
} from '@/components/tasklayer/TaskViews';
import { INBOX } from '@/lib/tasks/queries';
import { isSupabaseConfigured } from '@/lib/supabaseClient';

const TABS = [
  { id: 'inbox', label: 'Inbox', Component: InboxView },
  { id: 'week', label: 'This Week', Component: WeekView },
  { id: 'context', label: 'By Context', Component: ContextView },
  { id: 'stream', label: 'By Stream', Component: StreamView },
  { id: 'archive', label: 'Archive', Component: ArchiveView },
];

function ConfigNotice() {
  return (
    <div className="max-w-lg mx-auto mt-20 p-6 bg-card border border-border rounded-2xl text-sm text-muted-foreground space-y-2">
      <p className="font-medium text-foreground">Supabase / PowerSync not configured</p>
      <p>
        Set <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code> and{' '}
        <code>VITE_POWERSYNC_URL</code> in <code>.env.local</code> to enable the task layer.
        See the README for setup.
      </p>
    </div>
  );
}

function InboxBadge() {
  const { data: inbox = [] } = useQuery(INBOX);
  if (!inbox.length) return null;
  return (
    <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary/15 text-primary text-[10px] font-semibold">
      {inbox.length}
    </span>
  );
}

export default function TaskLayer() {
  const [active, setActive] = useState('inbox');

  if (!isSupabaseConfigured) return <ConfigNotice />;

  const ActiveView = TABS.find((t) => t.id === active).Component;

  return (
    <div className="min-h-screen bg-background px-4 py-10 md:py-14">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
              <Layers className="w-4.5 h-4.5 text-primary" />
            </div>
            <h1 className="text-xl font-heading font-semibold text-foreground tracking-tight">
              Task Layer
            </h1>
          </div>
          <SyncStatus />
        </div>

        {/* Capture (always available) */}
        <CaptureBar />

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                active === tab.id
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.id === 'inbox' && <InboxBadge />}
            </button>
          ))}
        </div>

        {/* Active view */}
        <ActiveView />
      </div>
    </div>
  );
}
