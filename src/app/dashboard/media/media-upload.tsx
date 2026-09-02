"use client";

import * as React from "react";
import { Check, Copy, Upload, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaItem } from "@/lib/types";

type MediaUploadProps = {
  initialItems: MediaItem[];
};

export function MediaUpload({ initialItems }: MediaUploadProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [name, setName] = React.useState("");
  const [altText, setAltText] = React.useState("");
  const [note, setNote] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<MediaItem[]>(initialItems);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || loading) return;

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (altText) formData.append("alt_text", altText);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        url?: string;
        key?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        setError(data.error ?? "Upload failed — please try again.");
        return;
      }

      const saveResponse = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || file.name,
          alt_text: altText,
          note,
          url: data.url,
          file_key: data.key ?? "",
          file_type: file.type || null,
          file_size: file.size,
        }),
      });
      const saved = (await saveResponse.json()) as {
        item?: MediaItem;
        error?: string;
      };

      if (!saveResponse.ok || !saved.item) {
        setError(saved.error ?? "Failed to save media record.");
        return;
      }

      setItems((prev) => [saved.item!, ...prev]);
      setFile(null);
      setName("");
      setAltText("");
      setNote("");
      (event.target as HTMLFormElement).reset();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyUrl(url: string, id: string) {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function deleteItem(id: string) {
    setDeletingId(id);
    try {
      await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError("Failed to delete media record.");
    } finally {
      setDeletingId(null);
    }
  }

  function formatSize(bytes: number | null): string {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function isImage(url: string): boolean {
    return /\.(jpg|jpeg|png|gif|webp|svg|avif|bmp|ico)$/i.test(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={handleSubmit}
        className="flex max-w-lg flex-col gap-4 rounded-xl border border-border bg-card p-6"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-name" className="text-sm font-medium">
            Name <span className="text-muted-foreground">(what is this for?)</span>
          </label>
          <input
            id="media-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Homepage hero background"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-alt" className="text-sm font-medium">
            Alt text <span className="text-muted-foreground">(SEO & accessibility — describe the image)</span>
          </label>
          <input
            id="media-alt"
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="e.g. Team collaborating on a web design project"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-note" className="text-sm font-medium">
            Note <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="media-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Any context or reminder about this file…"
            rows={2}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="media-file" className="text-sm font-medium">
            File (image, video, audio, or PDF — max 10 MB)
          </label>
          <input
            id="media-file"
            type="file"
            required
            accept="image/*,.pdf,.mp4,.webm,.mp3,.ogg,.wav"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>

        {error ? (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={!file || loading}>
          {loading ? (
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <Upload aria-hidden className="h-4 w-4" />
          )}
          {loading ? "Uploading…" : "Upload to R2"}
        </Button>
      </form>

      {items.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Media Library ({items.length})</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    {item.alt_text ? (
                      <p className="mt-0.5 line-clamp-1 text-xs text-primary/70" title={item.alt_text}>
                        alt: {item.alt_text}
                      </p>
                    ) : null}
                    {item.note ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.note}</p>
                    ) : null}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteItem(item.id)}
                    disabled={deletingId === item.id}
                    aria-label="Delete"
                    className="h-7 w-7 shrink-0 text-red-500 hover:text-red-600"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>

                {isImage(item.url) ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.url}
                    alt={item.alt_text || item.name}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                    {item.file_type || "File"}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <code className="flex-1 truncate text-xs text-muted-foreground">{item.url}</code>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => copyUrl(item.url, item.id)}
                    aria-label="Copy URL"
                    className="h-7 w-7 shrink-0"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatSize(item.file_size)}</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No media uploaded yet.</p>
      )}
    </div>
  );
}
