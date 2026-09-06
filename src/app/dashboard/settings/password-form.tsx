"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { changePassword } from "./password-actions";

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setError(undefined);
    setSuccess(false);
    if (data.get("newPassword") !== data.get("confirmPassword")) {
      setError("The new passwords do not match.");
      return;
    }
    setPending(true);
    try {
      const result = await changePassword(data);
      if (result.error) setError(result.error);
      else if (result.success) {
        formRef.current?.reset();
        setSuccess(true);
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-6" aria-labelledby="password-heading">
      <h2 id="password-heading" className="text-lg font-semibold">Change password</h2>
      <p id="password-help" className="mt-1 text-sm text-muted-foreground">
        Update the password for your admin account. Choose a unique password of 12–128 characters.
      </p>
      <form ref={formRef} onSubmit={submit} className="mt-5 max-w-md space-y-4" aria-describedby="password-help" aria-busy={pending}>
        <fieldset disabled={pending} className="space-y-4">
          {[
            { name: "currentPassword", label: "Current password", autoComplete: "current-password", min: 1, max: 1024 },
            { name: "newPassword", label: "New password", autoComplete: "new-password", min: 12, max: 128 },
            { name: "confirmPassword", label: "Confirm new password", autoComplete: "new-password", min: 12, max: 128 },
          ].map((field) => (
            <div key={field.name} className="space-y-1.5">
              <label htmlFor={field.name} className="block text-sm font-medium">{field.label}</label>
              <input
                id={field.name} name={field.name} type="password" required
                autoComplete={field.autoComplete} minLength={field.min} maxLength={field.max}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary"
              />
            </div>
          ))}
          <Button type="submit" disabled={pending}>{pending ? "Updating password…" : "Update password"}</Button>
        </fieldset>
        {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        {success && <p role="status" className="text-sm text-emerald-500">Your password has been updated. Use your new password the next time you sign in.</p>}
      </form>
    </section>
  );
}
