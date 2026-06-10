import React from "react";
import { motion } from "framer-motion";
import { Check, Trash2 } from "lucide-react";

export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group flex items-center gap-4 px-5 py-4 bg-card border border-border rounded-2xl hover:border-primary/20 hover:shadow-sm transition-all duration-300"
    >
      <button
        onClick={() => onToggle(task)}
        className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
          task.completed
            ? "bg-primary border-primary"
            : "border-border hover:border-primary/50"
        }`}
      >
        {task.completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <Check className="w-3.5 h-3.5 text-primary-foreground" />
          </motion.div>
        )}
      </button>

      <span
        className={`flex-1 text-base transition-all duration-300 ${
          task.completed
            ? "line-through text-muted-foreground/50"
            : "text-foreground"
        }`}
      >
        {task.title}
      </span>

      <button
        onClick={() => onDelete(task)}
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-destructive hover:bg-destructive/10 transition-all duration-200"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}