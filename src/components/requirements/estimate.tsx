import type { Estimate } from "@/lib/requirements/engine";
import type { RequirementConfig } from "@/lib/requirements/schema";
export const lkr = (amount: number) =>
  `LKR ${Math.round(amount).toLocaleString("en-LK")}`;
export function EstimateSummary({
  estimate: e,
  config,
  full = false,
}: {
  estimate: Estimate;
  config: RequirementConfig;
  full?: boolean;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Estimated investment</p>
      <p className="text-2xl font-semibold">
        {lkr(e.low)} – {lkr(e.high)}
      </p>
      <p className="text-sm">{e.project}</p>
      <p className="text-xs text-muted-foreground">
        Requirements completed: {e.completeness}%
      </p>
      <p className="text-sm">
        Estimated build: {e.weeksLow}–{e.weeksHigh} weeks
      </p>
      <p className="text-sm">
        30% advance: {lkr(e.advanceLow)} – {lkr(e.advanceHigh)}
        <br />
        <span className="text-muted-foreground">
          Calculated on the planning range; payable against the agreed price.
        </span>
      </p>
      <p className="text-sm">Maintenance: {lkr(e.monthly)}/month, separate</p>
      {e.warnings.map((w) => (
        <p key={w} className="rounded-lg border border-border p-3 text-sm">
          {w}
        </p>
      ))}
      <p className="text-xs leading-5 text-muted-foreground">{config.notice}</p>
      {full && (
        <>
          <h3 className="font-semibold">Selected capabilities</h3>
          <ul className="space-y-2">
            {e.lines.map((line) => (
              <li key={line.id} className="flex justify-between gap-4 text-sm">
                <span>{line.label}</span>
                <span>{line.included ? "Included" : lkr(line.price)}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Feature amounts are before design, scale, complexity and timeline
            adjustments.
          </p>
          <h3 className="font-semibold">Indicative delivery plan</h3>
          <ol className="space-y-2">
            {e.phases.map((p) => (
              <li key={p.label} className="text-sm">
                Weeks {p.startWeek}–{p.endWeek}: {p.label}
              </li>
            ))}
          </ol>
          <p className="text-sm">
            {e.design} · {e.timeline} · {e.maintenance}
          </p>
          <ul className="list-disc space-y-2 pl-5 text-xs text-muted-foreground">
            {config.exclusions.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
