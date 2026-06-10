import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { captureTask } from '@/lib/tasks/operations';

// The critical path: instant, offline capture to the inbox. No fields, no
// prompts — just a title.
export default function CaptureBar() {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    setTitle(''); // clear immediately; the write is local and instant
    await captureTask(value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Capture anything…"
        autoFocus
        className="w-full px-5 py-3.5 pr-12 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
      >
        <Plus className="w-4 h-4" />
      </button>
    </form>
  );
}
