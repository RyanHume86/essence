import React, { useEffect, useMemo, useRef, useState } from "react";
import { Repeat } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  createRecurrenceRule,
  firstOccurrenceOnOrAfter,
  previewOccurrences,
  todayISO,
} from "@/lib/recurrence";

// Sun..Sat. Two share a glyph (S/T); the `v` value is what disambiguates.
const WEEKDAYS = [
  { l: "S", v: 0 },
  { l: "M", v: 1 },
  { l: "T", v: 2 },
  { l: "W", v: 3 },
  { l: "T", v: 4 },
  { l: "F", v: 5 },
  { l: "S", v: 6 },
];

const UNITS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

// Plain-language anchor choice. We deliberately never show the words
// "fixed"/"completion" — the spec calls this out as half the value.
const ANCHORS = [
  { value: "fixed", title: "On a set schedule", hint: "e.g. every Monday, the 1st" },
  { value: "completion", title: "A set time after I finish", hint: "e.g. 4 weeks after each haircut" },
];

const chip = (active) =>
  `px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 select-none ${
    active
      ? "bg-primary/10 text-highlight border-primary/30"
      : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
  }`;

function buildEnd(endType, endDate, endCount) {
  if (endType === "onDate" && endDate) return { type: "onDate", date: endDate };
  if (endType === "afterCount") return { type: "afterCount", count: Math.max(1, Number(endCount) || 1) };
  return { type: "never" };
}

/**
 * Authoring UI for a task's recurrence rule. Emits the built rule (or null when
 * off) via onChange; the host owns persistence and seeds the due date.
 *
 * @param {Object} props
 * @param {import("@/lib/recurrence").RecurrenceRule|null} props.value  initial rule, read only on reset
 * @param {string} props.seedDate   the task's picked due date (YYYY-MM-DD), used to seed the rule and preview
 * @param {number} props.resetToken bump to re-initialise local state from `value` (e.g. when a drawer reopens)
 * @param {(rule: import("@/lib/recurrence").RecurrenceRule|null) => void} props.onChange
 */
export default function RecurrenceEditor({ value, seedDate, resetToken = 0, onChange }) {
  const [enabled, setEnabled] = useState(false);
  const [anchor, setAnchor] = useState("fixed");
  const [unit, setUnit] = useState("week");
  const [every, setEvery] = useState(1);
  const [weekdays, setWeekdays] = useState([]);
  const [endType, setEndType] = useState("never");
  const [endDate, setEndDate] = useState("");
  const [endCount, setEndCount] = useState(5);
  // Preserve the original "the 31st" anchor across edits instead of recomputing
  // it from a drifted current due date.
  const [monthAnchorDay, setMonthAnchorDay] = useState(null);

  // Skip the single emit caused by a (re)seed so an untouched edit leaves the
  // host's recurrence reference unchanged — that is how the host tells a genuine
  // rule change from an unrelated field edit.
  const skipEmit = useRef(false);

  // (Re)initialise from `value` whenever the host bumps resetToken.
  useEffect(() => {
    const v = value;
    setEnabled(!!v);
    setAnchor(v?.anchor ?? "fixed");
    setUnit(v?.unit ?? "week");
    setEvery(v?.interval ?? 1);
    setWeekdays(v?.weekdays ?? []);
    setEndType(v?.end?.type ?? "never");
    setEndDate(v?.end?.date ?? "");
    setEndCount(v?.end?.count ?? 5);
    setMonthAnchorDay(v?.monthAnchorDay ?? null);
    skipEmit.current = true;
  }, [resetToken]);

  // Weekly-by-weekday is the only place weekdays apply, and v1 forces interval 1.
  const usesWeekdays = anchor === "fixed" && unit === "week" && weekdays.length > 0;
  const effectiveSeed = seedDate || todayISO();

  // Build the rule from current controls. Returns null when off or invalid.
  const rule = useMemo(() => {
    if (!enabled) return null;
    try {
      const end = buildEnd(endType, endDate, endCount);
      const opts = { anchor, unit, interval: usesWeekdays ? 1 : Math.max(1, Number(every) || 1), end };
      if (usesWeekdays) opts.weekdays = weekdays;
      const built = createRecurrenceRule(effectiveSeed, opts);
      // Keep the original day-of-month anchor when editing an existing monthly rule.
      if (built.unit === "month" && built.anchor === "fixed" && monthAnchorDay != null) {
        built.monthAnchorDay = monthAnchorDay;
      }
      return built;
    } catch {
      return null;
    }
  }, [enabled, anchor, unit, every, weekdays, usesWeekdays, endType, endDate, endCount, effectiveSeed, monthAnchorDay]);

  // Push rule changes up, skipping the emit that a reseed triggers.
  useEffect(() => {
    if (skipEmit.current) {
      skipEmit.current = false;
      return;
    }
    onChange(rule);
  }, [rule]);

  const preview = useMemo(() => {
    if (!rule) return [];
    try {
      const seed = firstOccurrenceOnOrAfter(rule, effectiveSeed);
      return previewOccurrences(rule, seed, 3).map((s) => format(parseISO(s), "EEE, d MMM"));
    } catch {
      return [];
    }
  }, [rule, effectiveSeed]);

  const toggleWeekday = (v) =>
    setWeekdays((cur) => (cur.includes(v) ? cur.filter((d) => d !== v) : [...cur, v].sort((a, b) => a - b)));

  return (
    <div className="space-y-3">
      {/* On/off */}
      <button
        type="button"
        onClick={() => setEnabled((e) => !e)}
        aria-pressed={enabled}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 select-none ${
          enabled
            ? "bg-primary/10 text-highlight border-primary/30"
            : "border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
        }`}
      >
        <Repeat className="w-3.5 h-3.5" />
        {enabled ? "Repeats" : "Repeat"}
      </button>

      {enabled && (
        <div className="space-y-3 rounded-xl border border-border bg-card/50 p-3">
          {/* Anchor */}
          <div className="grid grid-cols-2 gap-2">
            {ANCHORS.map((a) => {
              const active = anchor === a.value;
              return (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAnchor(a.value)}
                  className={`flex flex-col items-start gap-0.5 px-3 py-2 rounded-lg border text-left transition-all duration-200 select-none ${
                    active ? "bg-primary/10 border-primary/30" : "bg-card border-border hover:border-muted-foreground/40"
                  }`}
                >
                  <span className={`text-xs font-medium ${active ? "text-highlight" : "text-foreground"}`}>{a.title}</span>
                  <span className="text-[10px] text-muted-foreground/80 leading-tight">{a.hint}</span>
                </button>
              );
            })}
          </div>

          {/* Interval + unit */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Every</span>
            <input
              type="number"
              min="1"
              value={every}
              disabled={usesWeekdays}
              onChange={(e) => setEvery(e.target.value)}
              aria-label="Interval"
              className="w-14 px-2 py-1 rounded-lg text-xs font-medium border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-40 [color-scheme:dark]"
            />
            <div className="flex flex-wrap gap-1.5">
              {UNITS.map((u) => (
                <button key={u.value} type="button" onClick={() => setUnit(u.value)} className={chip(unit === u.value)}>
                  {u.label}
                  {Number(every) > 1 && !usesWeekdays ? "s" : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Weekdays — fixed weekly only */}
          {anchor === "fixed" && unit === "week" && (
            <div className="flex items-center gap-1.5">
              {WEEKDAYS.map((d, i) => {
                const active = weekdays.includes(d.v);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleWeekday(d.v)}
                    aria-label={`Weekday ${d.v}`}
                    aria-pressed={active}
                    className={`w-7 h-7 rounded-full text-xs font-medium border transition-all duration-200 select-none ${
                      active
                        ? "bg-primary/10 text-highlight border-primary/30"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d.l}
                  </button>
                );
              })}
            </div>
          )}

          {/* End condition */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs text-muted-foreground">Ends</span>
            <button type="button" onClick={() => setEndType("never")} className={chip(endType === "never")}>
              Never
            </button>
            <button type="button" onClick={() => setEndType("onDate")} className={chip(endType === "onDate")}>
              On date
            </button>
            <button type="button" onClick={() => setEndType("afterCount")} className={chip(endType === "afterCount")}>
              After
            </button>
            {endType === "onDate" && (
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="End date"
                className="px-2 py-1 rounded-full text-xs font-medium border border-border bg-card text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 [color-scheme:dark]"
              />
            )}
            {endType === "afterCount" && (
              <span className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  value={endCount}
                  onChange={(e) => setEndCount(e.target.value)}
                  aria-label="Occurrence count"
                  className="w-14 px-2 py-1 rounded-lg text-xs font-medium border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 [color-scheme:dark]"
                />
                <span className="text-xs text-muted-foreground">times</span>
              </span>
            )}
          </div>

          {/* Live preview */}
          {preview.length > 0 && (
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
              <span className="text-muted-foreground">Next {preview.length}:</span> {preview.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
