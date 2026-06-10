// Fixed, stable enumerations shared between the schema (check constraints) and
// the UI. Keep these in sync with the Postgres check constraints.

export const STREAMS = [
  { value: 'clinical', label: 'Clinical' },
  { value: 'locum', label: 'Locum' },
  { value: 'uct', label: 'UCT' },
  { value: 'dev', label: 'Dev' },
  { value: 'content', label: 'Content' },
  { value: 'health', label: 'Health' },
  { value: 'life', label: 'Life admin' },
];

export const CONTEXTS = [
  { value: 'at_hospital', label: 'At hospital' },
  { value: 'at_desk', label: 'At desk' },
  { value: 'errand', label: 'Errand' },
  { value: 'low_energy', label: 'Low energy' },
];

export const RECURRENCE = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekly', label: 'Weekly' },
];

const lookup = (list) => Object.fromEntries(list.map((i) => [i.value, i.label]));

export const STREAM_LABELS = lookup(STREAMS);
export const CONTEXT_LABELS = lookup(CONTEXTS);
export const RECURRENCE_LABELS = lookup(RECURRENCE);
