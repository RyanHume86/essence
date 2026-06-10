import React from 'react';
import { useQuery } from '@powersync/react';
import { Inbox as InboxIcon } from 'lucide-react';
import TaskRow from './TaskRow';
import { BY_CONTEXT, BY_STREAM, THIS_WEEK, INBOX, ARCHIVE } from '@/lib/tasks/queries';
import {
  STREAMS,
  CONTEXTS,
  STREAM_LABELS,
  CONTEXT_LABELS,
} from '@/lib/tasks/constants';

function GroupHeading({ children }) {
  return (
    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-1 pt-2">
      {children}
    </p>
  );
}

function EmptyState({ children }) {
  return (
    <div className="text-center py-16 space-y-3">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto">
        <InboxIcon className="w-6 h-6 text-muted-foreground/50" />
      </div>
      <p className="text-muted-foreground text-sm">{children}</p>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

// Inbox — the triage queue.
export function InboxView() {
  const { data: tasks = [], isLoading } = useQuery(INBOX);
  if (isLoading) return <Loading />;
  if (!tasks.length) return <EmptyState>Inbox zero. Capture something above.</EmptyState>;
  return (
    <div className="space-y-2">
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} mode="inbox" />
      ))}
    </div>
  );
}

// By context — grouped in the fixed ordering, for batching in fragmented time.
export function ContextView() {
  const { data: tasks = [], isLoading } = useQuery(BY_CONTEXT);
  if (isLoading) return <Loading />;
  if (!tasks.length) return <EmptyState>No active tasks yet.</EmptyState>;

  const groups = [...CONTEXTS, { value: null, label: 'No context' }];
  return (
    <div className="space-y-4">
      {groups.map(({ value, label }) => {
        const rows = tasks.filter((t) => (t.context ?? null) === value);
        if (!rows.length) return null;
        return (
          <div key={value ?? 'none'} className="space-y-2">
            <GroupHeading>{label}</GroupHeading>
            {rows.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// By stream — so no single stream drowns the rest.
export function StreamView() {
  const { data: tasks = [], isLoading } = useQuery(BY_STREAM);
  if (isLoading) return <Loading />;
  if (!tasks.length) return <EmptyState>No active tasks yet.</EmptyState>;

  const groups = [...STREAMS, { value: null, label: 'No stream' }];
  return (
    <div className="space-y-4">
      {groups.map(({ value, label }) => {
        const rows = tasks.filter((t) => (t.stream ?? null) === value);
        if (!rows.length) return null;
        return (
          <div key={value ?? 'none'} className="space-y-2">
            <GroupHeading>{label}</GroupHeading>
            {rows.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

// Today / this week — time-bound commitments through the end of this week.
export function WeekView() {
  const { data: tasks = [], isLoading } = useQuery(THIS_WEEK);
  if (isLoading) return <Loading />;
  if (!tasks.length) return <EmptyState>Nothing due this week.</EmptyState>;
  return (
    <div className="space-y-2">
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} />
      ))}
    </div>
  );
}

// Done / dropped history.
export function ArchiveView() {
  const { data: tasks = [], isLoading } = useQuery(ARCHIVE);
  if (isLoading) return <Loading />;
  if (!tasks.length) return <EmptyState>Nothing completed or dropped yet.</EmptyState>;
  return (
    <div className="space-y-2">
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} mode="archive" />
      ))}
    </div>
  );
}

export { STREAM_LABELS, CONTEXT_LABELS };
