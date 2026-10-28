"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;
const fromIso = (value: string) => { const [y, m, d] = value.split("-").map(Number); return { y, m: m - 1, d }; };
const addDays = (value: string, days: number) => {
  const { y, m, d } = fromIso(value);
  const date = new Date(Date.UTC(y, m, d + days));
  return iso(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

/**
 * Dependency-free, keyboard-accessible month calendar. Dates are plain
 * YYYY-MM-DD strings in Sri Lanka time, so there are no timezone surprises.
 */
export function MeetingCalendar({ name, min, max, labelledBy }: { name: string; min: string; max: string; labelledBy: string }) {
  const [selected, setSelected] = React.useState("");
  const [focus, setFocus] = React.useState(min);
  const [view, setView] = React.useState(() => { const { y, m } = fromIso(min); return { y, m }; });
  const grid = React.useRef<HTMLDivElement>(null);
  const moveFocus = React.useRef(false);

  React.useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    grid.current?.querySelector<HTMLButtonElement>(`[data-date="${focus}"]`)?.focus();
  }, [focus, view]);

  const first = new Date(Date.UTC(view.y, view.m, 1));
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const offset = (first.getUTCDay() + 6) % 7;
  const monthLabel = first.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  const minView = fromIso(min), maxView = fromIso(max);
  const canPrev = view.y > minView.y || (view.y === minView.y && view.m > minView.m);
  const canNext = view.y < maxView.y || (view.y === maxView.y && view.m < maxView.m);
  const shiftMonth = (delta: number) => setView(v => { const d = new Date(Date.UTC(v.y, v.m + delta, 1)); return { y: d.getUTCFullYear(), m: d.getUTCMonth() }; });

  const go = (target: string) => {
    const clamped = target < min ? min : target > max ? max : target;
    const { y, m } = fromIso(clamped);
    moveFocus.current = true;
    setFocus(clamped);
    setView({ y, m });
  };
  const onKeyDown = (event: React.KeyboardEvent) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, PageUp: -30, PageDown: 30 };
    if (event.key in step) { event.preventDefault(); go(addDays(focus, step[event.key])); }
  };

  const cells: React.ReactNode[] = Array.from({ length: offset }, (_, i) => <span key={`blank-${i}`} aria-hidden />);
  // Exactly one enabled day is reachable with Tab; arrow keys move between days.
  const enabled = Array.from({ length: daysInMonth }, (_, i) => iso(view.y, view.m, i + 1)).filter(v => v >= min && v <= max);
  const tabbableDay = enabled.includes(focus) ? focus : enabled.includes(selected) ? selected : enabled[0];
  for (let day = 1; day <= daysInMonth; day++) {
    const value = iso(view.y, view.m, day);
    const disabled = value < min || value > max;
    const isSelected = value === selected;
    const tabbable = value === tabbableDay;
    cells.push(
      <button
        key={value}
        type="button"
        data-date={value}
        disabled={disabled}
        tabIndex={!disabled && tabbable ? 0 : -1}
        aria-pressed={isSelected}
        aria-label={new Date(`${value}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
        onClick={() => { setSelected(value); setFocus(value); }}
        className={`flex h-10 items-center justify-center rounded-lg text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          isSelected ? "bg-primary font-semibold text-primary-foreground" : disabled ? "cursor-not-allowed text-muted-foreground/40" : "hover:bg-primary/10"
        }`}
      >
        {day}
      </button>,
    );
  }

  return (
    <div role="group" aria-labelledby={labelledBy} className="rounded-xl border border-border p-3">
      <input type="hidden" name={name} value={selected} />
      <div className="mb-2 flex items-center justify-between">
        <button type="button" onClick={() => shiftMonth(-1)} disabled={!canPrev} aria-label="Previous month" className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted disabled:opacity-30">
          <ChevronLeft aria-hidden className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold" aria-live="polite">{monthLabel}</p>
        <button type="button" onClick={() => shiftMonth(1)} disabled={!canNext} aria-label="Next month" className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted disabled:opacity-30">
          <ChevronRight aria-hidden className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground" aria-hidden>
        {WEEKDAYS.map(d => <span key={d} className="py-1">{d}</span>)}
      </div>
      <div ref={grid} onKeyDown={onKeyDown} className="mt-1 grid grid-cols-7 gap-1">{cells}</div>
      <p className="mt-2 text-xs text-muted-foreground" aria-live="polite">
        {selected ? `Selected: ${new Date(`${selected}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}` : "Choose a date (Sri Lanka time)"}
      </p>
    </div>
  );
}
