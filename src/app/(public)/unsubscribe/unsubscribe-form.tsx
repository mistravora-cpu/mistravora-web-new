"use client";
import { useBusinessProfile } from "@/components/business-profile-provider";
import { useState } from "react";
export function UnsubscribeForm({ token }: { token: string }) {
  const profile = useBusinessProfile();
  const [message, setMessage] = useState(""); const [pending, setPending] = useState(false);
  return <form className="mt-8" onSubmit={async e => {
    e.preventDefault(); setPending(true);
    try { const res = await fetch("/api/newsletter/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }); const data = await res.json(); setMessage(res.ok ? "You have been unsubscribed." : data.error); }
    catch { setMessage(`Please try again, or email ${profile.email}.`); } finally { setPending(false); }
  }}><button disabled={pending || !token} className="rounded-lg bg-primary px-5 py-3 text-primary-foreground">{pending ? "Updating…" : "Unsubscribe from marketing emails"}</button><p role="status" className="mt-4">{message}</p></form>;
}
