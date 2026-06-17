import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Trash2, X } from "lucide-react";

function SubtaskRow({ subtask, depth = 0, onToggle, onDelete, onAddChild, canNest }) {
  const [addingChild, setAddingChild] = useState(false);
  const [childTitle, setChildTitle] = useState("");

  const submitChild = (e) => {
    e.preventDefault();
    if (!childTitle.trim()) return;
    onAddChild(subtask.id, childTitle.trim());
    setChildTitle("");
    setAddingChild(false);
  };

  return (
    <div className={depth > 0 ? "ml-5 border-l border-border pl-3" : ""}>
      <div className="group flex items-center gap-2 py-1.5">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(subtask.id)}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
            subtask.completed ? "bg-primary border-primary" : "border-border hover:border-primary/50"
          }`}
        >
          {subtask.completed && <Check className="w-3 h-3 text-primary-foreground" />}
        </button>

        {/* Title */}
        <span className={`flex-1 text-sm transition-all duration-200 ${
          subtask.completed ? "line-through text-muted-foreground/50" : "text-foreground"
        }`}>
          {subtask.title}
        </span>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canNest && (
            <button
              onClick={() => setAddingChild((v) => !v)}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title="Add subtask"
            >
              <Plus className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={() => onDelete(subtask.id)}
            className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Inline add-child input */}
      <AnimatePresence>
        {addingChild && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={submitChild}
            className={`flex items-center gap-2 py-1 ${depth > 0 ? "ml-5 pl-3" : "ml-5 border-l border-border pl-3"}`}
          >
            <input
              autoFocus
              value={childTitle}
              onChange={(e) => setChildTitle(e.target.value)}
              placeholder="Subtask title…"
              className="flex-1 text-xs px-2 py-1 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
            <button type="submit" disabled={!childTitle.trim()} className="w-6 h-6 rounded flex items-center justify-center bg-primary text-primary-foreground disabled:opacity-30">
              <Plus className="w-3 h-3" />
            </button>
            <button type="button" onClick={() => setAddingChild(false)} className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Nested children */}
      {subtask.subtasks?.map((child) => (
        <SubtaskRow
          key={child.id}
          subtask={child}
          depth={depth + 1}
          onToggle={(id) => onToggle(id, subtask.id)}
          onDelete={(id) => onDelete(id, subtask.id)}
          onAddChild={onAddChild}
          canNest={false} // only 2 levels deep
        />
      ))}
    </div>
  );
}

export default function SubtaskTree({ subtasks = [], onChange }) {
  const [newTitle, setNewTitle] = useState("");

  // ── Helpers to produce new immutable subtask arrays ─────────────────────
  const toggleSubtask = (id, parentId) => {
    const updated = subtasks.map((s) => {
      if (parentId) {
        if (s.id !== parentId) return s;
        return { ...s, subtasks: (s.subtasks || []).map((c) => c.id === id ? { ...c, completed: !c.completed } : c) };
      }
      return s.id === id ? { ...s, completed: !s.completed } : s;
    });
    onChange(updated);
  };

  const deleteSubtask = (id, parentId) => {
    let updated;
    if (parentId) {
      updated = subtasks.map((s) =>
        s.id === parentId ? { ...s, subtasks: (s.subtasks || []).filter((c) => c.id !== id) } : s
      );
    } else {
      updated = subtasks.filter((s) => s.id !== id);
    }
    onChange(updated);
  };

  const addChildSubtask = (parentId, title) => {
    const updated = subtasks.map((s) =>
      s.id === parentId
        ? { ...s, subtasks: [...(s.subtasks || []), { id: crypto.randomUUID(), title, completed: false }] }
        : s
    );
    onChange(updated);
  };

  const addTopLevel = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onChange([...subtasks, { id: crypto.randomUUID(), title: newTitle.trim(), completed: false, subtasks: [] }]);
    setNewTitle("");
  };

  return (
    <div className="space-y-1">
      <AnimatePresence initial={false}>
        {subtasks.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <SubtaskRow
              subtask={s}
              depth={0}
              onToggle={toggleSubtask}
              onDelete={deleteSubtask}
              onAddChild={addChildSubtask}
              canNest={true}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add top-level subtask */}
      <form onSubmit={addTopLevel} className="flex items-center gap-2 pt-1">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add subtask…"
          className="flex-1 text-xs px-3 py-1.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
        />
        <button
          type="submit"
          disabled={!newTitle.trim()}
          className="w-7 h-7 rounded-lg flex items-center justify-center bg-primary text-primary-foreground disabled:opacity-30 transition-opacity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}