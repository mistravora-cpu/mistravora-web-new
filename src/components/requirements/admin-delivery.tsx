"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
export function AdminDelivery({
  id,
  accepted,
}: {
  id: string;
  accepted: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-4">
      <a
        href={`/api/requirements/${id}`}
        className="text-sm text-primary underline"
      >
        Download quotation PDF
      </a>
      {!accepted && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              const response = await fetch(`/api/requirements/${id}`, {
                method: "POST",
              });
              const data = await response.json();
              setMessage(
                data.message || data.error || "Unable to confirm delivery.",
              );
            } catch {
              setMessage("Network error. Please retry.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Sending…" : "Retry unsent emails"}
        </Button>
      )}
      <p role="status" className="text-sm">
        {message}
      </p>
    </div>
  );
}
