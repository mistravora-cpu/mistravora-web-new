export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24"
    >
      <div
        aria-hidden
        className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary"
      />
      <p className="text-sm text-muted-foreground">Loading…</p>
      <span className="sr-only">Loading page content</span>
    </div>
  );
}
