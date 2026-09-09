import type { RequirementRecord } from "./record";
import type { RequirementConfig } from "./schema";
// Descriptive frequency and association analysis of submitted requirements only.
// No click tracking, external data transfer, or automatic price manipulation.
export function mineRequirements(
  records: RequirementRecord[],
  config: RequirementConfig,
) {
  const total = records.length;
  const projectCounts = new Map<string, number>(),
    featureCounts = new Map<string, number>();
  const questions = new Map<string, Map<string, number>>();
  const featureSets = records.map(
    (r) => new Set(r.estimate.lines.map((l) => l.id)),
  );
  for (const [index, r] of records.entries()) {
    projectCounts.set(
      r.estimate.project,
      (projectCounts.get(r.estimate.project) ?? 0) + 1,
    );
    for (const id of featureSets[index])
      featureCounts.set(id, (featureCounts.get(id) ?? 0) + 1);
    for (const q of config.questions) {
      if (!["boolean", "single", "multi"].includes(q.type)) continue;
      const value = r.requirements.answers[q.id];
      if (value === undefined || value === "") continue;
      const values = Array.isArray(value) ? [...new Set(value)] : [value];
      for (const v of values) {
        const label =
          typeof v === "boolean"
            ? v
              ? "Yes"
              : "No"
            : q.options.find((o) => o.id === v)?.label;
        if (!label) continue; // Never display free-text or a retired unrecognised option.
        if (!questions.has(q.id)) questions.set(q.id, new Map());
        const counts = questions.get(q.id)!;
        counts.set(label, (counts.get(label) ?? 0) + 1);
      }
    }
  }
  const sorted = (counts: Map<string, number>) =>
    [...counts]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  const label = (id: string) =>
    config.features.find((f) => f.id === id)?.label ?? id;
  const frequent = sorted(featureCounts)
    .filter((x) => x.count >= 3)
    .slice(0, 20);
  const associations: {
    from: string;
    to: string;
    count: number;
    support: number;
    confidence: number;
  }[] = [];
  for (const a of frequent)
    for (const b of frequent) {
      if (a.label === b.label) continue;
      const count = featureSets.filter(
        (set) => set.has(a.label) && set.has(b.label),
      ).length;
      if (count < 3) continue;
      associations.push({
        from: label(a.label),
        to: label(b.label),
        count,
        support: Math.round((count / total) * 100),
        confidence: Math.round((count / a.count) * 100),
      });
    }
  return {
    total,
    projects: sorted(projectCounts),
    features: sorted(featureCounts).map((x) => ({
      ...x,
      label: label(x.label),
    })),
    answers: config.questions
      .filter((q) => questions.has(q.id))
      .map((q) => ({
        id: q.id,
        label: q.label,
        values: sorted(questions.get(q.id)!),
      })),
    associations: associations
      .sort((a, b) => b.count - a.count || b.confidence - a.confidence)
      .slice(0, 10),
    needsReview: records.filter((r) => r.estimate.manual).length,
    notificationPending: records.filter(
      (r) => r.notification?.status !== "accepted",
    ).length,
  };
}
