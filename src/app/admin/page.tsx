import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <section className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8">
        <h1 className="text-xl font-bold">Mistravora Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in to manage site content.
        </p>
        <LoginForm />
      </div>
    </section>
  );
}
