"use client";
import type { Answer, Question } from "@/lib/requirements/schema";
export function QuestionField({
  question: q,
  value,
  onChange,
  error,
}: {
  question: Question;
  value: Answer | undefined;
  onChange: (value: Answer) => void;
  error?: string;
}) {
  const id = `req-${q.id}`,
    hint =
      [q.help ? `${id}-help` : "", error ? `${id}-error` : ""]
        .filter(Boolean)
        .join(" ") || undefined;
  const field =
    "w-full rounded-lg border border-border bg-background p-3 text-sm focus-visible:outline-2 focus-visible:outline-primary";
  return (
    <fieldset className="min-w-0 space-y-3" aria-describedby={hint}>
      <legend className="mb-2 text-sm font-medium">
        {q.label}
        {q.required ? " *" : ""}
      </legend>
      {q.help && (
        <p
          id={`${id}-help`}
          className="text-sm leading-6 text-muted-foreground"
        >
          {q.help}
        </p>
      )}
      {q.type === "boolean" ? (
        <div className="flex gap-3">
          {[true, false].map((option) => (
            <label
              key={String(option)}
              className="flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-xl border border-border px-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5 focus-within:ring-2 focus-within:ring-primary"
            >
              <input
                type="radio"
                className="h-4 w-4 shrink-0 accent-primary"
                aria-describedby={hint}
                name={id}
                checked={value === option}
                onChange={() => onChange(option)}
              />
              {option ? "Yes" : "No"}
            </label>
          ))}
        </div>
      ) : ["single", "multi"].includes(q.type) ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {q.options.map((o) => (
            <label
              key={o.id}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5 focus-within:ring-2 focus-within:ring-primary"
            >
              <input
                type={q.type === "multi" ? "checkbox" : "radio"}
                className="h-4 w-4 shrink-0 accent-primary"
                aria-describedby={hint}
                name={id}
                checked={
                  q.type === "multi"
                    ? Array.isArray(value) && value.includes(o.id)
                    : value === o.id
                }
                onChange={() =>
                  onChange(
                    q.type === "multi"
                      ? Array.isArray(value) && value.includes(o.id)
                        ? value.filter((v) => v !== o.id)
                        : [...(Array.isArray(value) ? value : []), o.id]
                      : o.id,
                  )
                }
              />
              {o.label}
            </label>
          ))}
        </div>
      ) : (
        <>
          <label className="sr-only" htmlFor={id}>
            {q.label}
          </label>
          {q.type === "textarea" ? (
            <textarea
              id={id}
              className={field}
              rows={4}
              maxLength={2500}
              value={String(value ?? "")}
              onChange={(e) => onChange(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={hint}
            />
          ) : (
            <input
              id={id}
              type={
                q.type === "number"
                  ? "number"
                  : q.type === "date"
                    ? "date"
                    : q.type === "url"
                      ? "url"
                      : "text"
              }
              className={field}
              min={q.type === "number" ? 0 : undefined}
              max={q.type === "number" ? q.max : undefined}
              maxLength={2500}
              value={value === undefined ? "" : String(value)}
              onChange={(e) =>
                onChange(
                  q.type === "number" && e.target.value !== ""
                    ? Number(e.target.value)
                    : e.target.value,
                )
              }
              aria-invalid={!!error}
              aria-describedby={hint}
            />
          )}
        </>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
