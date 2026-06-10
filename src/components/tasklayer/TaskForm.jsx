import React, { useState } from 'react';
import { useQuery } from '@powersync/react';
import { STREAMS, CONTEXTS, RECURRENCE } from '@/lib/tasks/constants';
import { ACTIVE_PROJECTS } from '@/lib/tasks/queries';

const selectClass =
  'w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30';
const labelClass = 'text-xs font-medium text-muted-foreground uppercase tracking-wide';

// Shared form for triage (assign facets to an inbox item) and edit (adjust an
// active task). `requireStream` enforces a stream when triaging into 'active'.
export default function TaskForm({ task, onSubmit, onCancel, submitLabel = 'Save', requireStream = true }) {
  const [stream, setStream] = useState(task?.stream ?? '');
  const [context, setContext] = useState(task?.context ?? '');
  const [projectId, setProjectId] = useState(task?.project_id ?? '');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [recurrence, setRecurrence] = useState(task?.recurrence ?? '');

  const { data: projects = [] } = useQuery(ACTIVE_PROJECTS);
  const streamProjects = projects.filter((p) => !stream || p.stream === stream);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (requireStream && !stream) return;
    onSubmit({
      stream: stream || null,
      context: context || null,
      project_id: projectId || null,
      due_date: dueDate || null,
      recurrence: recurrence || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {task?.title && (
        <p className="text-base font-medium text-foreground">{task.title}</p>
      )}

      <div className="space-y-1.5">
        <label className={labelClass}>
          Stream{requireStream ? ' *' : ''}
        </label>
        <select className={selectClass} value={stream} onChange={(e) => setStream(e.target.value)}>
          <option value="">—</option>
          {STREAMS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Context</label>
        <select className={selectClass} value={context} onChange={(e) => setContext(e.target.value)}>
          <option value="">—</option>
          {CONTEXTS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Project</label>
        <select className={selectClass} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
          <option value="">—</option>
          {streamProjects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className={labelClass}>Due date</label>
          <input
            type="date"
            className={selectClass}
            value={dueDate || ''}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Recurrence</label>
          <select className={selectClass} value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
            <option value="">None</option>
            {RECURRENCE.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={requireStream && !stream}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
