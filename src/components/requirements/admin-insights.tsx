import { parseRequirementRecord } from "@/lib/requirements/record";
import { mineRequirements } from "@/lib/requirements/mining";
import type { RequirementConfig } from "@/lib/requirements/schema";
export function RequirementInsights({
  messages,
  config,
}: {
  messages: string[];
  config: RequirementConfig;
}) {
  const records = messages
    .map(parseRequirementRecord)
    .filter((r) => r !== null);
  const data = mineRequirements(records, config);
  return (
    <section
      className="space-y-5 rounded-2xl border border-border bg-card p-5"
      aria-labelledby="quote-insights-title"
    >
      <h2 id="quote-insights-title" className="text-xl font-semibold">
        Requirement insights
      </h2>
      <p className="text-sm text-muted-foreground">
        Analysis of the {data.total} saved quotations in this view. Counts
        describe submitted scope, including base capabilities; they do not
        represent all visitors or predict purchases.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Saved quotations", data.total],
          ["Manual scope reviews", data.needsReview],
          ["Team notifications awaiting acceptance", data.notificationPending],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-muted/50 p-4">
            <p className="text-2xl font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
      {data.total > 0 ? (
        <>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              ["Project demand", data.projects],
              ["Most requested capabilities", data.features.slice(0, 10)],
            ].map(([title, rows]) => (
              <div key={String(title)}>
                <h3 className="mb-3 font-semibold">{String(title)}</h3>
                <ul className="space-y-3">
                  {(rows as typeof data.projects).map((row) => (
                    <li key={row.label} className="text-sm">
                      <div className="flex justify-between gap-2">
                        <span>{row.label}</span>
                        <span>{row.count}</span>
                      </div>
                      <progress
                        aria-label={`${row.label}: ${row.count} of ${data.total} quotes`}
                        value={row.count}
                        max={data.total}
                        className="h-1.5 w-full accent-primary"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <details>
            <summary className="cursor-pointer font-medium">
              Explore selected answers by question
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {data.answers.map((q) => (
                <div key={q.id} className="rounded-xl border border-border p-4">
                  <h3 className="text-sm font-semibold">{q.label}</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {q.values.map((v) => (
                      <li key={v.label}>
                        {v.label}: {v.count}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </details>
          <details>
            <summary className="cursor-pointer font-medium">
              Capabilities selected together
            </summary>
            <p className="my-3 text-sm text-muted-foreground">
              Association rules require at least three matching quotations.
              Support is the share of all saved quotes containing both;
              confidence is the share with the first capability that also
              includes the second. Base packages and dependencies can explain
              these patterns. Review them before adding recommendation rules.
            </p>
            {data.associations.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">
                    Feature associations in saved quotations
                  </caption>
                  <thead>
                    <tr>
                      {[
                        "If scope includes",
                        "Also includes",
                        "Quotes",
                        "Support",
                        "Confidence",
                      ].map((x) => (
                        <th key={x} scope="col" className="p-2">
                          {x}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.associations.map((r) => (
                      <tr
                        key={`${r.from}-${r.to}`}
                        className="border-t border-border"
                      >
                        <td className="p-2">{r.from}</td>
                        <td className="p-2">{r.to}</td>
                        <td className="p-2">{r.count}</td>
                        <td className="p-2">{r.support}%</td>
                        <td className="p-2">{r.confidence}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm">
                There are not enough matching quotations for an association
                report yet.
              </p>
            )}
          </details>
        </>
      ) : (
        <p className="text-sm">
          Insights will appear as real visitors submit quotations.
        </p>
      )}
    </section>
  );
}
