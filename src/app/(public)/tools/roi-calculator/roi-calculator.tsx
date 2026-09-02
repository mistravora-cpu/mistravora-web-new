"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function RoiCalculator() {
  const [monthlyRevenue, setMonthlyRevenue] = React.useState(500_000);
  const [lift, setLift] = React.useState(25);
  const [projectCost, setProjectCost] = React.useState(400_000);

  const extraMonthly = Math.round(monthlyRevenue * (lift / 100));
  const yearlyGain = extraMonthly * 12;
  const netYear = yearlyGain - projectCost;
  const paybackMonths =
    extraMonthly > 0 ? Math.max(projectCost / extraMonthly, 0) : 0;

  const format = (amount: number) => `LKR ${Math.round(amount).toLocaleString()}`;

  const maxBar = Math.max(projectCost, yearlyGain, 1);
  const costWidth = Math.max((projectCost / maxBar) * 100, 4);
  const gainWidth = Math.max((yearlyGain / maxBar) * 100, 4);

  const message = encodeURIComponent(
    `Hi Mistravora! I used your ROI calculator:\n\nMonthly revenue: ${format(
      monthlyRevenue
    )}\nExpected lift: ${lift}%\nProject cost: ${format(
      projectCost
    )}\nPayback: ~${paybackMonths.toFixed(
      1
    )} months\n\nI'd like to discuss a project.`
  );

  return (
    <div className="scroll-reveal grid gap-6 lg:grid-cols-2">
      <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="revenue" className="text-sm font-medium">
            Average monthly revenue (LKR)
          </label>
          <input
            id="revenue"
            type="number"
            min={0}
            step={10_000}
            value={monthlyRevenue}
            onChange={(event) =>
              setMonthlyRevenue(Math.max(Number(event.target.value) || 0, 0))
            }
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="lift" className="text-sm font-medium">
            Expected revenue lift from a faster, better site —{" "}
            <span className="text-primary">{lift}%</span>
          </label>
          <input
            id="lift"
            type="range"
            min={5}
            max={100}
            step={5}
            value={lift}
            onChange={(event) => setLift(Number(event.target.value))}
            className="w-full accent-[var(--primary)]"
          />
          <p className="text-xs text-muted-foreground">
            Typical uplifts from speed + conversion work range 15–40%.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="cost" className="text-sm font-medium">
            Estimated project cost (LKR)
          </label>
          <input
            id="cost"
            type="number"
            min={0}
            step={10_000}
            value={projectCost}
            onChange={(event) =>
              setProjectCost(Math.max(Number(event.target.value) || 0, 0))
            }
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex h-fit flex-col gap-5 rounded-xl border border-border bg-card p-6 lg:sticky lg:top-24">
        <h2 className="font-semibold">Your projection</h2>

        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-xs text-muted-foreground">
              Extra monthly revenue
            </dt>
            <dd className="text-xl font-bold text-primary">
              {format(extraMonthly)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Payback period</dt>
            <dd className="text-xl font-bold text-primary">
              {paybackMonths > 0 ? `~${paybackMonths.toFixed(1)} mo` : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">12-month gain</dt>
            <dd className="text-xl font-bold">{format(yearlyGain)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">
              Net after project cost
            </dt>
            <dd
              className={
                netYear >= 0
                  ? "text-xl font-bold text-primary"
                  : "text-xl font-bold text-red-500"
              }
            >
              {format(netYear)}
            </dd>
          </div>
        </dl>

        <div className="flex flex-col gap-3">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              Project cost — {format(projectCost)}
            </p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-muted-foreground/50"
                style={{ width: `${costWidth}%` }}
              />
            </div>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">
              12-month gain — {format(yearlyGain)}
            </p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${gainWidth}%` }}
              />
            </div>
          </div>
        </div>

        <Button asChild className="mt-2">
          <a
            href={`https://wa.me/${site.whatsapp}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle aria-hidden className="h-4 w-4" />
            Discuss these numbers
          </a>
        </Button>

        <p className="text-xs leading-5 text-muted-foreground">
          Projections are illustrative and depend on your traffic, offer, and
          market — we&apos;ll model your real numbers together on a call.
        </p>
      </div>
    </div>
  );
}
