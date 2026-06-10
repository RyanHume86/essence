// Local SQLite schema for the PowerSync client.
//
// PowerSync SQLite supports only text, integer and real. Dates and timestamps
// are stored as ISO 8601 text; booleans as integer 0/1.
import { Schema, Table, column } from '@powersync/web';

const tasks = new Table({
  user_id: column.text,
  title: column.text,
  stream: column.text,
  context: column.text,
  project_id: column.text,
  due_date: column.text, // ISO date string
  status: column.text,
  recurrence: column.text,
  sort_order: column.real,
  created_at: column.text,
  updated_at: column.text,
  completed_at: column.text,
});

const projects = new Table({
  user_id: column.text,
  name: column.text,
  stream: column.text,
  archived: column.integer, // 0 / 1
  created_at: column.text,
});

export const AppSchema = new Schema({ tasks, projects });
