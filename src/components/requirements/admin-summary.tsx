import { AdminDelivery } from "./admin-delivery";
import { parseRequirementRecord } from "@/lib/requirements/record";
import { lkr } from "./estimate";
export function RequirementAdminSummary({
  message,
  id,
}: {
  message: string;
  id: string;
}) {
  const record = parseRequirementRecord(message);
  if (!record) return null;
  const e = record.estimate;
  return (
    <details className="rounded-xl border border-border bg-card p-5">
      <summary className="cursor-pointer font-medium">
        {record.contact.name} — {e.project} — {record.reference}
      </summary>
      <div className="mt-5 space-y-5">
        <AdminDelivery
          id={id}
          accepted={
            record.emailStatus === "accepted" &&
            record.notification?.status === "accepted"
          }
        />
        <p className="text-sm">
          {record.contact.email} · Preferred: {record.contact.preferred} · Email
          receipt: {record.emailStatus}
        </p>
        <p className="text-sm">
          Team notification:{" "}
          {record.notification?.status ?? "Not yet requested"} ·{" "}
          {record.notification?.recipients.join(", ")}
        </p>
        <p>
          {lkr(e.low)} – {lkr(e.high)} · {e.weeksLow}–{e.weeksHigh} weeks
        </p>
        <p className="text-sm">
          30% advance: {lkr(e.advanceLow)} – {lkr(e.advanceHigh)}. Maintenance:{" "}
          {lkr(e.monthly)}/month.
        </p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {Object.entries(record.qualification).map(([key, value]) => (
            <div key={key}>
              <dt className="font-semibold">{key}</dt>
              <dd>{String(value)}</dd>
            </div>
          ))}
        </dl>
        {!!record.insights?.length && (
          <div className="space-y-3">
            <h3 className="font-semibold">
              Matching recommendations for this scope
            </h3>
            {record.insights.map((insight) => (
              <p key={insight.id} className="text-sm">
                <strong>{insight.title}</strong> — {insight.description}
              </p>
            ))}
          </div>
        )}
        <h3 className="font-semibold">Requirement summary</h3>
        <dl className="space-y-3">
          {record.summary.map((row, i) => (
            <div key={i}>
              <dt className="text-sm font-medium">{row.label}</dt>
              <dd className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-muted-foreground">
          Consent recorded {record.submittedAt}. Source: requirement_calculator.
          Configuration: {record.configVersion}. Preliminary figures require
          scope review.
        </p>
      </div>
    </details>
  );
}
