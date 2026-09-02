"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: forward to Sentry once monitoring is wired.
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 animate-fade-in-up flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <h1 className="text-3xl font-bold tracking-tight">
        Something went wrong
      </h1>
      <p className="max-w-md text-muted-foreground">
        An unexpected error occurred. You can try again — if it keeps
        happening, reach us on WhatsApp and we&apos;ll fix it.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
