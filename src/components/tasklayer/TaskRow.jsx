import React, { useState } from 'react';
import { Check, X, Pencil, Repeat, Calendar, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TaskForm from './TaskForm';
import { completeTask, dropTask, updateTask, triageTask, reactivateTask } from '@/lib/tasks/operations';
import { STREAM_LABELS, CONTEXT_LABELS, RECURRENCE_LABELS } from '@/lib/tasks/constants';

// A single task row. `mode` controls the available actions:
//   'inbox'   -> triage button
//   'active'  -> complete / edit / drop
//   'archive' -> reactivate
export default function TaskRow({ task, mode = 'active' }) {
  const [editing, setEditing] = useState(false);

  const dueLabel = task.due_date
    ? new Date(task.due_date + 'T00:00:00').toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <>
      <div className="group flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl hover:border-primary/20 transition-colors">
        {mode === 'active' && (
          <button
            onClick={() => completeTask(task)}
            title="Complete"
            className="flex-shrink-0 w-5 h-5 rounded-md border-2 border-border hover:border-primary/60 flex items-center justify-center transition-colors"
          >
            <Check className="w-3 h-3 text-transparent" />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm truncate ${
              task.status === 'done'
                ? 'line-through text-muted-foreground/60'
                : task.status === 'dropped'
                  ? 'text-muted-foreground/60'
                  : 'text-foreground'
            }`}
          >
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {task.stream && (
              <span className="text-[10px] font-medium uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                {STREAM_LABELS[task.stream]}
              </span>
            )}
            {task.context && (
              <span className="text-[10px] text-muted-foreground">{CONTEXT_LABELS[task.context]}</span>
            )}
            {dueLabel && (
              <span className="text-[10px] text-muted-foreground inline-flex items-center gap-0.5">
                <Calendar className="w-2.5 h-2.5" />
                {dueLabel}
              </span>
            )}
            {task.recurrence && (
              <span className="text-[10px] text-muted-foreground inline-flex items-center gap-0.5">
                <Repeat className="w-2.5 h-2.5" />
                {RECURRENCE_LABELS[task.recurrence]}
              </span>
            )}
            {task.status === 'dropped' && (
              <span className="text-[10px] text-muted-foreground/70 italic">dropped</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {mode === 'inbox' && (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Triage
            </button>
          )}

          {mode === 'active' && (
            <>
              <button
                onClick={() => setEditing(true)}
                title="Edit"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-foreground hover:bg-muted transition-all"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => dropTask(task.id)}
                title="Drop"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive hover:bg-destructive/10 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {mode === 'archive' && (
            <button
              onClick={() => reactivateTask(task.id)}
              title="Reactivate"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{mode === 'inbox' ? 'Triage task' : 'Edit task'}</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={task}
            requireStream
            submitLabel={mode === 'inbox' ? 'Move to active' : 'Save'}
            onCancel={() => setEditing(false)}
            onSubmit={async (values) => {
              if (mode === 'inbox') {
                await triageTask(task.id, values);
              } else {
                await updateTask(task.id, values);
              }
              setEditing(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
