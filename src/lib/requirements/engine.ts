import { matchesConditions, resolveFlow } from "./flow";
import type {
  Answer,
  Answers,
  Question,
  RequirementConfig,
  RequirementRequest,
} from "./schema";
export function visible(
  q: Question,
  project: string,
  answers: Answers,
  features: Set<string> = new Set(),
  input?: RequirementRequest,
): boolean {
  if (q.projects.length && !q.projects.includes(project)) return false;
  if (q.when) {
    const value = answers[q.when.field];
    if (
      Array.isArray(value)
        ? !value.includes(String(q.when.value))
        : value !== q.when.value
    )
      return false;
  }
  return (
    (!q.whenFeature || features.has(q.whenFeature)) &&
    matchesConditions(
      q.conditions,
      input ?? {
        projectType: project,
        answers,
        features: [],
        design: "",
        timeline: "",
        maintenance: "",
      },
      features,
    )
  );
}
const present = (value: Answer | undefined) =>
  value !== undefined &&
  (typeof value !== "string" || value.trim() !== "") &&
  (!Array.isArray(value) || value.length > 0);
export function resolveFeatures(
  config: RequirementConfig,
  input: RequirementRequest,
) {
  return resolveFlow(config, input);
}

export function validateRequirements(
  config: RequirementConfig,
  input: RequirementRequest,
  required = false,
) {
  const errors: Record<string, string> = {};
  const { active, project } = resolveFeatures(config, input);
  if (input.features.some((f) => !project.optional.includes(f)))
    errors.features = "Choose only applicable features.";
  for (const [field, value] of Object.entries(input.answers)) {
    const q = config.questions.find((q) => q.id === field);
    if (!q) {
      errors[field] = "Unknown question.";
      continue;
    }
    if (!active.has(q.id)) continue;
    if (value === "" && !q.required) continue;
    if (
      q.type === "number" &&
      (typeof value !== "number" ||
        value < 0 ||
        value > q.max ||
        !Number.isInteger(value))
    )
      errors[field] = `Enter a whole number from 0 to ${q.max}.`;
    if (q.type === "boolean" && typeof value !== "boolean")
      errors[field] = "Choose yes or no.";
    if (
      q.type === "single" &&
      !q.options.some((o) => o.id === value) &&
      value !== ""
    )
      errors[field] = "Choose one of the available options.";
    if (
      q.type === "multi" &&
      (!Array.isArray(value) ||
        value.some((v) => !q.options.some((o) => o.id === v)) ||
        new Set(value).size !== value.length)
    )
      errors[field] = "Choose available options only.";
    if (
      ["text", "textarea", "date", "url"].includes(q.type) &&
      typeof value !== "string"
    )
      errors[field] = "Enter text.";
    if (
      q.type === "date" &&
      value &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(String(value)) ||
        !Number.isFinite(Date.parse(String(value))))
    )
      errors[field] = "Enter a valid date.";
    if (q.type === "url" && value) {
      try {
        const u = new URL(String(value));
        if (u.protocol !== "https:" && u.protocol !== "http:") throw Error();
        if (u.username || u.password) throw Error();
      } catch {
        errors[field] = "Use a public HTTP or HTTPS URL.";
      }
    }
  }
  if (required)
    for (const q of config.questions)
      if (q.required && active.has(q.id) && !present(input.answers[q.id]))
        errors[q.id] = "Please complete this required question.";
  if (!config.design.some((d) => d.id === input.design))
    errors.design = "Choose a design level.";
  if (!config.timelines.some((t) => t.id === input.timeline))
    errors.timeline = "Choose a timeline.";
  if (!config.maintenance.some((m) => m.id === input.maintenance))
    errors.maintenance = "Choose maintenance.";
  return errors;
}
export function calculateEstimate(
  config: RequirementConfig,
  input: RequirementRequest,
) {
  const {
    project,
    features,
    active: activeIds,
  } = resolveFeatures(config, input);
  const selected = config.features.filter((f) => features.has(f.id));
  const lines = selected.map((f) => ({
    id: f.id,
    label: f.label,
    included: project.included.includes(f.id),
    price: project.included.includes(f.id) ? 0 : f.price,
  }));
  let score = selected.reduce((sum, f) => sum + f.score, 0),
    scale = 1,
    manual = false;
  const active = config.questions.filter((q) => activeIds.has(q.id));
  for (const q of active) {
    const value = input.answers[q.id];
    if (!present(value)) continue;
    if (value === true) {
      if (!q.feature) score += q.score;
      scale = Math.max(scale, q.scale);
      manual ||= q.manual;
    }
    for (const o of q.options)
      if (Array.isArray(value) ? value.includes(o.id) : value === o.id) {
        score += o.score;
        scale = Math.max(scale, o.scale);
        manual ||= o.manual;
      }
    const size =
      typeof value === "number"
        ? value
        : Array.isArray(value)
          ? value.length
          : 0;
    for (const threshold of q.scaleThresholds)
      if (size >= threshold.at) {
        scale = Math.max(scale, threshold.multiplier);
        manual ||= threshold.manual;
      }
  }
  const complexity =
    config.complexity.find((c) => score <= c.max) ?? config.complexity.at(-1)!;
  manual ||= complexity.manual;
  const design =
      config.design.find((d) => d.id === input.design) ?? config.design[0],
    timeline =
      config.timelines.find((t) => t.id === input.timeline) ??
      config.timelines[0],
    maintenance =
      config.maintenance.find((m) => m.id === input.maintenance) ??
      config.maintenance[0];
  const subtotal = project.base + lines.reduce((sum, l) => sum + l.price, 0);
  const amount = Math.max(
    config.minimum,
    subtotal *
      design.multiplier *
      complexity.multiplier *
      scale *
      timeline.multiplier,
  );
  const round = (n: number) =>
    Math.round(n / config.rounding) * config.rounding;
  const low = Math.max(config.minimum, round(amount * config.rangeLow)),
    high = Math.max(low, round(amount * config.rangeHigh));
  const addedWeeks = selected
    .filter((f) => !project.included.includes(f.id))
    .reduce((sum, f) => sum + f.weeks, 0);
  const duration =
    design.durationMultiplier *
    timeline.durationMultiplier *
    Math.max(1, scale);
  const weeksLow = Math.ceil((project.weeks[0] + addedWeeks) * duration),
    weeksHigh = Math.max(
      weeksLow,
      Math.ceil((project.weeks[1] + addedWeeks) * duration),
    );
  let elapsed = 0;
  const phases = config.phases.map((phase) => {
    const start = elapsed;
    elapsed += phase.share;
    return {
      label: phase.label,
      startWeek: Math.floor(start * weeksHigh) + 1,
      endWeek: Math.max(
        Math.floor(start * weeksHigh) + 1,
        Math.ceil(elapsed * weeksHigh),
      ),
    };
  });
  const required = active.filter((q) => q.required);
  const completeness = Math.round(
    (active.filter((q) => present(input.answers[q.id])).length /
      Math.max(1, active.length)) *
      100,
  );
  const warnings: string[] = [];
  if (manual)
    warnings.push(
      "Your project includes advanced requirements. This estimate is preliminary and requires a manual scope review.",
    );
  if (input.answers.launch_date) {
    const days =
      (Date.parse(String(input.answers.launch_date)) - Date.now()) / 86400000;
    if (days < weeksLow * 7)
      warnings.push(
        "Your requested launch date is earlier than the estimated build duration. Phased delivery or a revised date will need review.",
      );
  }
  return {
    project: project.label,
    lines,
    subtotal,
    low,
    high,
    advanceLow: low * 0.3,
    advanceHigh: high * 0.3,
    score,
    complexity: complexity.label,
    manual,
    scale,
    design: design.label,
    timeline: timeline.label,
    maintenance: maintenance.label,
    monthly: maintenance.monthly,
    weeksLow,
    weeksHigh,
    phases,
    warnings,
    completeness,
    requiredCompleted: required.filter((q) => present(input.answers[q.id]))
      .length,
    requiredTotal: required.length,
  };
}
export type Estimate = ReturnType<typeof calculateEstimate>;
export function buildRequirementSummary(
  config: RequirementConfig,
  input: RequirementRequest,
) {
  const { active } = resolveFeatures(config, input);
  return config.questions
    .filter((q) => active.has(q.id) && present(input.answers[q.id]))
    .map((q) => {
      const value = input.answers[q.id];
      const label = (v: string) =>
        q.options.find((o) => o.id === v)?.label ?? v;
      return {
        group: q.group,
        label: q.label,
        value: Array.isArray(value)
          ? value.map(label).join(", ")
          : typeof value === "boolean"
            ? value
              ? "Yes"
              : "No"
            : label(String(value)),
      };
    });
}
export function qualify(input: RequirementRequest, estimate: Estimate) {
  const bands: Record<string, [number, number]> = {
    "Under LKR 200K": [0, 200000],
    "LKR 200K–500K": [200000, 500000],
    "LKR 500K–1M": [500000, 1000000],
    "LKR 1M–2M": [1000000, 2000000],
    "LKR 2M+": [2000000, Infinity],
  };
  const band = bands[String(input.answers.budget)];
  return {
    projectSize:
      estimate.high < 500000
        ? "Small"
        : estimate.high < 1500000
          ? "Medium"
          : "Large",
    complexity: estimate.complexity,
    budgetAlignment: !band
      ? "Not supplied"
      : band[1] < estimate.low
        ? "Below estimated scope"
        : band[0] > estimate.high
          ? "Above estimated scope"
          : "Potentially aligned",
    timeline: estimate.timeline,
    completeness: estimate.completeness,
  };
}
