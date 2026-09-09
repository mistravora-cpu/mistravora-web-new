"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import {
  requirementConfigSchema,
  type RequirementConfig,
  type Question,
  type ConditionGroup,
} from "@/lib/requirements/schema";
import { quoteRecipientsSchema } from "@/lib/requirements/notification-config";
import { saveSettings } from "@/app/dashboard/crud-actions";
import { RuleEditor } from "./rule-editor";
import { Button } from "@/components/ui/button";
const Preview = dynamic(
  () => import("./calculator").then((m) => m.RequirementCalculator),
  { ssr: false },
);
const field =
  "min-h-11 w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm";
function questionConditions(q: Question): ConditionGroup | undefined {
  if (q.conditions && !q.when && !q.whenFeature) return q.conditions;
  const rules: ConditionGroup["rules"] = [...(q.conditions?.rules ?? [])];
  if (q.when)
    rules.push({
      field: q.when.field,
      operator: "equals",
      value: q.when.value,
    });
  if (q.whenFeature)
    rules.push({
      field: "$features",
      operator: "includes",
      value: q.whenFeature,
    });
  return rules.length ? { match: "all", rules } : undefined;
}
export function RequirementConfigEditor({
  initial,
  recipients,
}: {
  initial: RequirementConfig;
  recipients: string[];
}) {
  const [config, setConfig] = useState(initial),
    [emails, setEmails] = useState(recipients.join(", ")),
    [selected, setSelected] = useState(initial.questions[0]?.id ?? ""),
    [search, setSearch] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState(false),
    [raw, setRaw] = useState<string | null>(null);
  const q = config.questions.find((q) => q.id === selected);
  const patchQuestion = (change: Partial<Question>) =>
    setConfig((c) => ({
      ...c,
      questions: c.questions.map((q) =>
        q.id === selected ? { ...q, ...change } : q,
      ),
    }));
  const conditions = q ? questionConditions(q) : undefined;
  // Legacy equality on a multi-select is membership, matching the original engine.
  if (
    conditions &&
    q?.when &&
    config.questions.find((x) => x.id === q.when?.field)?.type === "multi"
  ) {
    const legacy = conditions.rules.find((r) => r.field === q.when?.field);
    if (legacy) legacy.operator = "includes";
  }
  async function save() {
    const parsed = requirementConfigSchema.safeParse({
      ...config,
      version: `v-${Date.now()}`,
    });
    const list = quoteRecipientsSchema.safeParse(
      emails
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
    );
    if (!parsed.success) {
      setMessage(parsed.error.issues[0]?.message ?? "Check configuration.");
      return;
    }
    if (!list.success) {
      setMessage(
        "Provide one to five valid notification emails, separated by commas.",
      );
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = await saveSettings({
        requirement_calculator_config: JSON.stringify(parsed.data),
        quote_notification_recipients: JSON.stringify(list.data),
      });
      if (result.error) setMessage(result.error);
      else {
        setConfig(parsed.data);
        setMessage(
          "Saved. The public calculator will use these rules and notification recipients.",
        );
      }
    } catch {
      setMessage("Could not save. Please retry.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-6">
      <div className="grid gap-5 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        <label className="space-y-2 text-sm">
          Team notification recipients
          <input
            className={field}
            aria-label="Team notification recipients"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
          />
          <span className="block text-xs text-muted-foreground">
            Comma-separated. Used for new quotes; existing quotes retain their
            saved recipients.
          </span>
        </label>
        <label className="space-y-2 text-sm">
          Questions per step
          <select
            className={field}
            aria-label="Questions per step"
            value={config.questionsPerStep}
            onChange={(e) =>
              setConfig({ ...config, questionsPerStep: Number(e.target.value) })
            }
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
      <section
        className="space-y-5 rounded-2xl border border-border bg-card p-5"
        aria-labelledby="question-editor-heading"
      >
        <h2 id="question-editor-heading" className="text-xl font-semibold">
          Questions and next-step rules
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            Find a question
            <input
              type="search"
              className={field}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search question or group"
            />
          </label>
          <label className="min-w-0 text-sm">
            Edit question
            <select
              className={field}
              aria-label="Edit question"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {config.questions
                .filter(
                  (q) =>
                    q.id === selected ||
                    `${q.label} ${q.group}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                )
                .map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.group} · {q.label}
                  </option>
                ))}
            </select>
          </label>
        </div>
        {q && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm">
                Question label
                <input
                  className={field}
                  aria-label="Question label"
                value={q.label}
                  onChange={(e) => patchQuestion({ label: e.target.value })}
                />
              </label>
              <label className="text-sm">
                Step group
                <input
                  className={field}
                  aria-label="Step group"
                value={q.group}
                  onChange={(e) => patchQuestion({ group: e.target.value })}
                />
              </label>
            </div>
            <label className="block text-sm">
              Helpful explanation
              <textarea
                className={field}
                rows={2}
                aria-label="Helpful explanation"
              value={q.help}
                onChange={(e) => patchQuestion({ help: e.target.value })}
              />
            </label>
            <label className="flex min-h-11 items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={q.required}
                onChange={(e) => patchQuestion({ required: e.target.checked })}
              />
              Required answer
            </label>
            <fieldset className="flex flex-wrap gap-3">
              <legend className="mb-2 text-sm">
                Project types (none selected means all)
              </legend>
              {config.projectTypes.map((p) => (
                <label
                  key={p.id}
                  className="flex min-h-11 items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={q.projects.includes(p.id)}
                    onChange={(e) =>
                      patchQuestion({
                        projects: e.target.checked
                          ? [...q.projects, p.id]
                          : q.projects.filter((id) => id !== p.id),
                      })
                    }
                  />
                  {p.label}
                </label>
              ))}
            </fieldset>
            {!!q.options.length && (
              <details>
                <summary className="cursor-pointer text-sm font-medium">
                  Edit {q.options.length} answer labels
                </summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {q.options.map((o, i) => (
                    <label key={o.id} className="text-xs">
                      Option: {o.id}
                      <input
                        className={field}
                        value={o.label}
                        onChange={(e) =>
                          patchQuestion({
                            options: q.options.map((x, j) =>
                              j === i ? { ...x, label: e.target.value } : x,
                            ),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              </details>
            )}
            <RuleEditor
              config={config}
              value={conditions}
              exclude={q.id}
              onChange={(conditions) =>
                patchQuestion({
                  conditions,
                  when: undefined,
                  whenFeature: undefined,
                })
              }
            />
          </>
        )}
      </section>
      <section
        className="space-y-4 rounded-2xl border border-border bg-card p-5"
        aria-labelledby="recommendation-editor-heading"
      >
        <h2
          id="recommendation-editor-heading"
          className="text-xl font-semibold"
        >
          Answer-based recommendations
        </h2>
        <p className="text-sm text-muted-foreground">
          Explain what a selection means and suggest useful capabilities.
          Suggestions never change prices until the visitor adds a capability.
        </p>
        {config.recommendations.map((r, index) => {
          const update = (patch: Partial<typeof r>) =>
            setConfig((c) => ({
              ...c,
              recommendations: c.recommendations.map((item, i) =>
                i === index ? { ...item, ...patch } : item,
              ),
            }));
          return (
            <details key={r.id} className="rounded-xl border border-border p-4">
              <summary className="cursor-pointer font-medium">
                {r.title}
              </summary>
              <div className="mt-4 space-y-4">
                <label className="block text-sm">
                  Title
                  <input
                    className={field}
                    value={r.title}
                    onChange={(e) => update({ title: e.target.value })}
                  />
                </label>
                <label className="block text-sm">
                  Explanation
                  <textarea
                    className={field}
                    value={r.description}
                    onChange={(e) => update({ description: e.target.value })}
                  />
                </label>
                <RuleEditor
                  config={config}
                  value={r.conditions}
                  onChange={(conditions) => {
                    if (conditions) update({ conditions });
                    else
                      setMessage(
                        "A recommendation needs at least one condition. Remove the recommendation to disable it.",
                      );
                  }}
                />
                <fieldset className="grid gap-2 sm:grid-cols-2">
                  <legend className="mb-2 text-sm">
                    Suggested capabilities (optional)
                  </legend>
                  {config.features.map((f) => (
                    <label
                      key={f.id}
                      className="flex min-h-10 items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={r.features.includes(f.id)}
                        onChange={(e) =>
                          update({
                            features: e.target.checked
                              ? [...r.features, f.id]
                              : r.features.filter((id) => id !== f.id),
                          })
                        }
                      />
                      {f.label}
                    </label>
                  ))}
                </fieldset>
                <Button
                  variant="outline"
                  onClick={() =>
                    setConfig((c) => ({
                      ...c,
                      recommendations: c.recommendations.filter(
                        (x) => x.id !== r.id,
                      ),
                    }))
                  }
                >
                  Remove recommendation
                </Button>
              </div>
            </details>
          );
        })}
        <Button
          variant="outline"
          disabled={config.recommendations.length >= 60}
          onClick={() =>
            setConfig((c) => ({
              ...c,
              recommendations: [
                ...c.recommendations,
                {
                  id: `rule_${Date.now()}`,
                  title: "New recommendation",
                  description: "Explain why this suggestion is relevant.",
                  features: [],
                  conditions: {
                    match: "all",
                    rules: [
                      {
                        field: "$project",
                        operator: "equals",
                        value: c.projectTypes[0].id,
                      },
                    ],
                  },
                },
              ],
            }))
          }
        >
          Add recommendation
        </Button>
      </section>
      <details className="rounded-2xl border border-border p-5">
        <summary className="cursor-pointer font-semibold">
          Advanced configuration: pricing, options and all rules
        </summary>
        <p className="my-3 text-sm text-muted-foreground">
          Use this for adding questions/options or adjusting prices and
          dependencies. Apply the JSON before saving. Cyclic or invalid rules
          are rejected.
        </p>
        <label className="text-sm">
          Complete configuration
          <textarea
            spellCheck={false}
            className={field + " font-mono"}
            rows={16}
            aria-label="Complete configuration"
            value={raw ?? JSON.stringify(config, null, 2)}
            onChange={(e) => setRaw(e.target.value)}
          />
        </label>
        <Button
          variant="outline"
          onClick={() => {
            try {
              const parsed = requirementConfigSchema.parse(
                JSON.parse(raw ?? JSON.stringify(config)),
              );
              setConfig(parsed);
              setSelected(parsed.questions[0]?.id ?? "");
              setRaw(null);
              setMessage(
                "Configuration applied to the editor. Save to publish.",
              );
            } catch (e) {
              setMessage(
                e instanceof Error ? e.message : "Invalid configuration.",
              );
            }
          }}
        >
          Apply JSON to editor
        </Button>
      </details>
      <div className="sticky bottom-3 z-10 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background p-4 shadow-lg">
        <Button disabled={busy || raw !== null} onClick={save}>
          {busy ? "Saving…" : "Save calculator and notifications"}
        </Button>
        <Button variant="outline" onClick={() => setPreview(!preview)}>
          {preview ? "Close preview" : "Preview flow"}
        </Button>
        <p role="status" className="break-words text-sm">
          {raw !== null ? "Apply the edited JSON before saving. " : ""}
          {message}
        </p>
      </div>
      {preview && (
        <div className="space-y-4 border-t border-border pt-6">
          <h2 className="text-xl font-semibold">
            Preview with your current rules
          </h2>
          <p className="text-sm text-muted-foreground">
            This preview does not save a draft or send enquiries.
          </p>
          {requirementConfigSchema.safeParse(config).success ? (
            <Preview key={JSON.stringify(config)} config={config} preview />
          ) : (
            <p role="alert">Fix the configuration before previewing.</p>
          )}
        </div>
      )}
    </div>
  );
}
