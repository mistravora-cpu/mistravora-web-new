"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown, Layers3 } from "lucide-react";

export function ArticleCategoryPicker({ id, category, categories }: { id: string; category: string; categories: string[] }) {
  const [value, setValue] = useState(category);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  const typeahead = useRef({ text: "", time: 0 });
  const values = ["", ...new Set([...(category && !categories.includes(category) ? [category] : []), ...categories])];
  const selected = Math.max(0, values.indexOf(value));

  useEffect(() => {
    if (!open) return;
    options.current[selected]?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open, selected]);

  function onKeyDown(event: KeyboardEvent, index: number) {
    let next = index;
    if (event.key === "Escape") {
      event.preventDefault(); setOpen(false); trigger.current?.focus(); return;
    }
    if (event.key === "Tab") { setOpen(false); return; }
    if (event.key === "ArrowDown") next = (index + 1) % values.length;
    else if (event.key === "ArrowUp") next = (index - 1 + values.length) % values.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = values.length - 1;
    else if (event.key.length === 1 && event.key !== " " && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = event.timeStamp;
      typeahead.current.text = (now - typeahead.current.time < 700 ? typeahead.current.text : "") + event.key.toLowerCase();
      typeahead.current.time = now;
      const match = values.findIndex(item => (item || "All categories").toLowerCase().startsWith(typeahead.current.text));
      if (match >= 0) next = match;
    } else return;
    event.preventDefault(); options.current[next]?.focus();
  }

  return <div ref={root} className="relative min-w-0" onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }}>
    <input type="hidden" name="category" value={value} />
    <button ref={trigger} id={id} type="button" aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-options`} aria-labelledby={`${id}-label ${id}-value`}
      onClick={() => setOpen(!open)} onKeyDown={event => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setOpen(true); }
      }}
      className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-border bg-background px-4 text-left text-sm transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
      <Layers3 aria-hidden className="h-4 w-4 shrink-0 text-primary" />
      <span id={`${id}-value`} className="min-w-0 flex-1 truncate">{value || "All categories"}</span>
      <ChevronDown aria-hidden className={`h-4 w-4 shrink-0 text-muted-foreground motion-safe:transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div id={`${id}-options`} role="listbox" aria-labelledby={`${id}-label`} className="absolute inset-x-0 top-full z-40 mt-2 max-h-64 overflow-y-auto overscroll-contain rounded-xl border border-border bg-card p-1.5 text-foreground shadow-xl">
      {values.map((item, index) => <button key={item} ref={node => { options.current[index] = node; }} role="option" aria-selected={item === value} tabIndex={-1} type="button"
        onKeyDown={event => onKeyDown(event, index)} onClick={() => { setValue(item); setOpen(false); trigger.current?.focus(); }}
        className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-muted focus:bg-muted focus:outline-2 focus:-outline-offset-2 focus:outline-primary aria-selected:bg-primary/10 aria-selected:font-medium aria-selected:text-primary">
        <span className="min-w-0 flex-1 break-words">{item || "All categories"}</span>{item === value && <Check aria-hidden className="h-4 w-4 shrink-0" />}
      </button>)}
    </div>}
  </div>;
}
