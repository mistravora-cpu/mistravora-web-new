"use client";

import * as React from "react";
import { Pencil, Plus, Trash2, X, Check, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { upsertRow, deleteRow } from "./crud-actions";
import { trackButtonClick } from "@/lib/track-event";

export type FieldDef = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "boolean" | "select" | "list" | "image" | "icon";
  options?: string[];
  required?: boolean;
  placeholder?: string;
};

const BOOLEAN_FIELDS = ["published", "active", "popular", "featured", "archived"];

const LUCIDE_ICONS = [
  "Target", "Shield", "Lightbulb", "Users", "Globe", "Heart", "Award", "Zap",
  "Code2", "PenTool", "Rocket", "Search", "ShoppingBag", "Hotel", "Factory",
  "Star", "CheckCircle", "GraduationCap", "Coffee", "Briefcase",
  "Mail", "Phone", "MapPin", "MessageCircle", "Clock", "DollarSign",
  "LayoutDashboard", "ShoppingCart", "Smartphone", "Bot", "HeartHandshake",
  "Gauge", "TrendingUp", "Calculator", "ArrowRight", "Sparkles", "Compass",
  "Cloud", "Database", "Server", "Cpu", "Lock", "Key", "Eye", "Settings",
  "FileText", "Image", "Video", "Music", "Camera", "Mic", "Headphones",
  "Wrench", "Hammer", "Building2", "Home", "Store", "Truck", "Plane",
  "Anchor", "Battery", "Wifi", "Bluetooth", "Printer", "Scan",
  "BarChart", "PieChart", "Activity", "TrendingDown", "Filter", "Sort",
  "Plus", "Minus", "X", "Check", "Edit", "Trash", "Save", "Download",
  "Upload", "ExternalLink", "Link", "Unlink", "Share", "Bookmark",
];

export type ColumnDef = {
  name: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode;
};

type Props = {
  table: string;
  title?: string;
  columns: ColumnDef[];
  fields: FieldDef[];
  rows: Record<string, unknown>[];
  orderColumn?: string;
  filterColumn?: string;
  filterValue?: string;
};

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

function ImageField({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (name: string, value: unknown) => void;
}) {
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string; error?: string };

      if (!res.ok || !data.url) {
        setUploadError(data.error ?? "Upload failed");
        return;
      }

      onChange(name, data.url);
    } catch {
      setUploadError("Network error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder="https://... or upload below"
          className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          <span className="sr-only">Upload {label}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="sr-only"
          />
        </label>
      </div>

      {uploadError ? (
        <p className="text-xs text-red-500">{uploadError}</p>
      ) : null}

      {value ? (
        <div className="relative h-32 w-full overflow-hidden rounded-lg border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={label} className="h-full w-full object-cover" />
        </div>
      ) : null}
    </div>
  );
}

export function CrudManager({
  table,
  title,
  columns,
  fields,
  rows,
  filterColumn,
  filterValue,
}: Props) {
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<Record<string, unknown>>({});
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

  function startCreate() {
    trackButtonClick("add_new", table);
    setEditingId(null);
    setFormData({});
    setError(null);
    setShowForm(true);
  }

  function startEdit(row: Record<string, unknown>) {
    trackButtonClick("edit_row", table);
    setEditingId(row.id as string);
    const editable: Record<string, unknown> = {};
    for (const f of fields) {
      editable[f.name] = row[f.name] ?? (f.type === "boolean" ? false : f.type === "list" ? [] : "");
    }
    setFormData(editable);
    setError(null);
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData({});
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    trackButtonClick(editingId ? "update_row" : "create_row", table);

    const data: Record<string, unknown> = { ...formData };
    if (filterColumn && filterValue) {
      data[filterColumn] = filterValue;
    }

    for (const f of fields) {
      if (f.type === "list" && typeof data[f.name] === "string") {
        data[f.name] = (data[f.name] as string)
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (f.type === "number" && typeof data[f.name] === "string") {
        data[f.name] = data[f.name] === "" ? 0 : Number(data[f.name]);
      }
      if (f.type === "boolean") {
        data[f.name] = Boolean(data[f.name]);
      }
    }

    const result = await upsertRow(table, data, editingId ?? undefined);
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      cancelForm();
    }
  }

  async function handleDelete(id: string) {
    setSaving(true);
    setError(null);
    trackButtonClick("delete_row", table);
    const result = await deleteRow(table, id);
    setSaving(false);
    setConfirmDelete(null);
    if (result.error) {
      setError(result.error);
    }
  }

  function setField(name: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function quickToggle(id: string, field: string, currentValue: boolean) {
    trackButtonClick("toggle_" + field, table);
    const result = await upsertRow(table, { [field]: !currentValue }, id);
    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        {title ? <h3 className="text-sm font-semibold">{title}</h3> : <span />}
        {!showForm ? (
          <Button size="sm" onClick={startCreate}>
            <Plus aria-hidden className="h-4 w-4" />
            Add
          </Button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
          {error}
        </p>
      ) : null}

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">
              {editingId ? "Edit" : "Add New"}
            </h4>
            <Button type="button" size="icon" variant="ghost" onClick={cancelForm}>
              <X aria-hidden className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div
                key={f.name}
                className={
                  f.type === "textarea" || f.type === "list" || f.type === "image"
                    ? "flex flex-col gap-1.5 sm:col-span-2"
                    : "flex flex-col gap-1.5"
                }
              >
                <label htmlFor={f.name} className="text-xs font-medium text-muted-foreground">
                  {f.label}
                  {f.required ? " *" : ""}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    id={f.name}
                    required={f.required}
                    value={String(formData[f.name] ?? "")}
                    onChange={(e) => setField(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    rows={4}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                ) : f.type === "boolean" ? (
                  <button
                    type="button"
                    onClick={() => setField(f.name, !formData[f.name])}
                    className={
                      formData[f.name]
                        ? "h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                        : "h-9 rounded-lg border border-border bg-background px-4 text-sm text-muted-foreground"
                    }
                  >
                    {formData[f.name] ? "Yes" : "No"}
                  </button>
                ) : f.type === "select" ? (
                  <select
                    id={f.name}
                    required={f.required}
                    value={String(formData[f.name] ?? "")}
                    onChange={(e) => setField(f.name, e.target.value)}
                    className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select…</option>
                    {f.options?.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : f.type === "list" ? (
                  <textarea
                    id={f.name}
                    value={Array.isArray(formData[f.name]) ? (formData[f.name] as string[]).join("\n") : String(formData[f.name] ?? "")}
                    onChange={(e) => setField(f.name, e.target.value)}
                    placeholder={f.placeholder ?? "One item per line"}
                    rows={4}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                ) : f.type === "image" ? (
                  <ImageField
                    name={f.name}
                    label={f.label}
                    value={String(formData[f.name] ?? "")}
                    onChange={setField}
                  />
                ) : f.type === "icon" ? (
                  <select
                    id={f.name}
                    required={f.required}
                    aria-label={`Select ${f.label}`}
                    value={String(formData[f.name] ?? "")}
                    onChange={(e) => setField(f.name, e.target.value)}
                    className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select icon…</option>
                    {LUCIDE_ICONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={f.name}
                    type={f.type === "number" ? "number" : "text"}
                    required={f.required}
                    value={String(formData[f.name] ?? "")}
                    onChange={(e) => setField(f.name, e.target.value)}
                    placeholder={f.placeholder}
                    className="h-9 rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={saving}>
              <Check aria-hidden className="h-4 w-4" />
              {saving ? "Saving…" : editingId ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" onClick={cancelForm}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {rows.length > 0 ? (
        <div className="grid gap-3">
          {rows.map((row) => {
            const boolField = BOOLEAN_FIELDS.find((f) => f in row);
            const boolValue = boolField ? Boolean(row[boolField]) : false;
            return (
            <div
              key={row.id as string}
              className={`flex items-start justify-between gap-3 rounded-xl border bg-card p-4 transition-colors ${
                boolField && !boolValue ? "border-border/50 opacity-60" : "border-border"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {columns.map((col) => {
                    const isBool = BOOLEAN_FIELDS.includes(col.name);
                    const isImage = col.name === "image" || col.name === "cover_image" || col.name === "photo" || col.name === "logo" || col.name === "avatar" || col.name === "screenshot";

                    if (isBool) {
                      return null;
                    }

                    if (isImage && row[col.name]) {
                      return (
                        <div key={col.name} className="flex items-center gap-1.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={row[col.name] as string}
                            alt={col.label}
                            className="h-8 w-8 rounded object-cover"
                          />
                          <span className="text-xs text-muted-foreground">{col.label}</span>
                        </div>
                      );
                    }

                    return (
                      <div key={col.name} className="min-w-0">
                        {col.render ? (
                          col.render(row[col.name], row)
                        ) : (
                          <>
                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              {col.label}:{" "}
                            </span>
                            <span className="text-sm">
                              {formatValue(row[col.name])}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {boolField && (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={boolValue}
                    aria-label={`Toggle ${boolField}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      quickToggle(row.id as string, boolField, boolValue);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      boolValue ? "bg-primary" : "bg-muted"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition-transform ${
                        boolValue ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => startEdit(row)}
                  aria-label="Edit"
                >
                  <Pencil aria-hidden className="h-4 w-4" />
                </Button>
                {confirmDelete === row.id ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={saving}
                    onClick={() => handleDelete(row.id as string)}
                    className="text-red-500"
                  >
                    Confirm?
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setConfirmDelete(row.id as string)}
                    aria-label="Delete"
                  >
                    <Trash2 aria-hidden className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            );
          })}
        </div>
      ) : !showForm ? (
        <p className="text-sm text-muted-foreground">No items yet. Click Add to create one.</p>
      ) : null}
    </div>
  );
}
