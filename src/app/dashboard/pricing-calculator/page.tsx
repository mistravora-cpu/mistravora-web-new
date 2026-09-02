import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, ExternalLink, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pricing Calculator",
  robots: { index: false, follow: false },
};

export default function PricingCalculatorPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Pricing Calculator</h1>
        <p className="text-sm text-muted-foreground">
          Estimate project costs, configure pricing tiers, and model quotes for clients.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Calculator aria-hidden className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Interactive Estimator</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Use the same wizard your customers see to model project estimates based on type, features, and timeline.
          </p>
          <Button asChild className="mt-4">
            <Link href="/pricing">
              Open Calculator
              <ExternalLink aria-hidden className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <TrendingUp aria-hidden className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Manage Pricing Tiers</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Update your published pricing tiers, features, and descriptions.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/pricing">
              Manage Tiers
              <ExternalLink aria-hidden className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick reference pricing table */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Quick Reference — Base Pricing</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Internal reference for base project costs. Actual quotes vary based on scope.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Project Type</th>
                <th className="pb-2 pr-4 font-medium">Base Price (LKR)</th>
                <th className="pb-2 pr-4 font-medium">Timeline</th>
                <th className="pb-2 pr-4 font-medium">Key Deliverables</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="py-3 pr-4 font-medium">Business Website</td>
                <td className="py-3 pr-4">150,000+</td>
                <td className="py-3 pr-4">2–4 weeks</td>
                <td className="py-3 pr-4 text-muted-foreground">Responsive design, SEO, Contact form, Analytics</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">E-Commerce Store</td>
                <td className="py-3 pr-4">350,000+</td>
                <td className="py-3 pr-4">4–8 weeks</td>
                <td className="py-3 pr-4 text-muted-foreground">Product catalog, Cart & checkout, Payments, Orders</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Web Application</td>
                <td className="py-3 pr-4">500,000+</td>
                <td className="py-3 pr-4">6–12 weeks</td>
                <td className="py-3 pr-4 text-muted-foreground">User auth, Dashboard, API integration, Admin panel</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium">Custom Build</td>
                <td className="py-3 pr-4">250,000+</td>
                <td className="py-3 pr-4">Varies</td>
                <td className="py-3 pr-4 text-muted-foreground">Discovery, Custom architecture, Dedicated team</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold">Add-on Pricing</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Admin CMS", price: "50,000" },
              { name: "Blog System", price: "30,000" },
              { name: "Advanced SEO", price: "25,000" },
              { name: "Analytics Setup", price: "15,000" },
              { name: "Multilingual", price: "60,000" },
              { name: "AI Chat Assistant", price: "75,000" },
              { name: "Booking System", price: "80,000" },
              { name: "Client Portal", price: "120,000" },
              { name: "Payment Gateway", price: "40,000" },
              { name: "Offline PWA", price: "55,000" },
            ].map((addon) => (
              <div
                key={addon.name}
                className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
              >
                <span className="text-sm">{addon.name}</span>
                <span className="text-sm font-medium text-primary">LKR {addon.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold">Timeline Multipliers</h3>
          <div className="mt-3 flex gap-3">
            <div className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-center">
              <p className="text-sm font-medium">Flexible</p>
              <p className="text-xs text-muted-foreground">Best price</p>
              <p className="mt-1 text-lg font-bold text-primary">×0.95</p>
            </div>
            <div className="flex-1 rounded-lg border border-primary bg-primary/5 px-4 py-3 text-center">
              <p className="text-sm font-medium">Standard</p>
              <p className="text-xs text-muted-foreground">Balanced</p>
              <p className="mt-1 text-lg font-bold text-primary">×1.00</p>
            </div>
            <div className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-center">
              <p className="text-sm font-medium">Fast-track</p>
              <p className="text-xs text-muted-foreground">Priority</p>
              <p className="mt-1 text-lg font-bold text-primary">×1.25</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
