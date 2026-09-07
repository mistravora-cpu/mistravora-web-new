import Link from "next/link";

export function FormPrivacy({ newsletter = false }: { newsletter?: boolean }) {
  return <div className="space-y-2 text-sm leading-6 text-muted-foreground">
    <label className="flex items-start gap-3">
      <input type="checkbox" name="privacyConsent" value="yes" required className="mt-1 h-5 w-5 shrink-0 accent-primary" />
      <span>{newsletter ? "I want to receive Mistravora’s email updates. I can unsubscribe at any time." : "I ask Mistravora to use these details to respond to this request. This does not subscribe me to marketing emails."}</span>
    </label>
    <p>Read our <Link href="/policies/privacy-policy" className="underline underline-offset-4">Privacy Policy</Link>. Please do not send passwords, payment-card details or sensitive personal information.</p>
  </div>;
}
