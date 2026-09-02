"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveSettings } from "../crud-actions";

type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  type?: "text" | "password" | "textarea" | "boolean";
};

type GroupDef = {
  label: string;
  fields: FieldDef[];
};

type Props = {
  groups: GroupDef[];
  initialData: Record<string, string>;
};

export function SettingsEditor({ groups, initialData }: Props) {
  const [values, setValues] = React.useState<Record<string, string>>(initialData);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);

  function update(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const result = await saveSettings(values);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {groups.map((group) => (
          <div
            key={group.label}
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
          >
            <h2 className="text-sm font-semibold">{group.label}</h2>
            <div className="flex flex-col gap-3">
              {group.fields.map((field) => {
                const value = values[field.key] ?? "";
                const isSet = value.length > 0;
                return (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor={field.key} className="text-xs font-medium text-muted-foreground">
                        {field.label}
                      </label>
                      <span
                        className={
                          isSet
                            ? "rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                            : "rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                        }
                      >
                        {isSet ? "Active" : "Not set"}
                      </span>
                    </div>
                    {field.type === "textarea" ? (
                      <textarea
                        id={field.key}
                        value={value}
                        onChange={(e) => update(field.key, e.target.value)}
                        placeholder={field.placeholder ?? ""}
                        rows={3}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    ) : field.type === "boolean" ? (
                      <button
                        type="button"
                        onClick={() => update(field.key, value === "true" ? "false" : "true")}
                        className={
                          value === "true"
                            ? "h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                            : "h-9 rounded-lg border border-border bg-background px-4 text-sm text-muted-foreground"
                        }
                      >
                        {value === "true" ? "Enabled" : "Disabled"}
                      </button>
                    ) : (
                      <input
                        id={field.key}
                        type={field.type ?? "text"}
                        value={value}
                        onChange={(e) => update(field.key, e.target.value)}
                        placeholder={field.placeholder ?? ""}
                        className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          <Check aria-hidden className="h-4 w-4" />
          {saving ? "Saving…" : "Save All Settings"}
        </Button>
        {saved ? (
          <span className="text-sm text-primary">Saved successfully!</span>
        ) : null}
      </div>
    </div>
  );
}
