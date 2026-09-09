import type {
  Answers,
  ConditionGroup,
  RequirementConfig,
  RequirementRequest,
} from "./schema";

export function matchesConditions(
  group: ConditionGroup | undefined,
  input: RequirementRequest,
  features: Set<string>,
) {
  if (!group) return true;
  const results = group.rules.map((rule) => {
    const value =
      rule.field === "$project"
        ? input.projectType
        : rule.field === "$features"
          ? [...features]
          : rule.field === "$design"
            ? input.design
            : rule.field === "$timeline"
              ? input.timeline
              : rule.field === "$maintenance"
                ? input.maintenance
                : input.answers[rule.field];
    const answered =
      value !== undefined &&
      value !== "" &&
      (!Array.isArray(value) || value.length > 0);
    if (rule.operator === "answered") return answered;
    if (!answered) return false; // Unanswered/hidden values never satisfy a negative rule.
    switch (rule.operator) {
      case "equals":
        return value === rule.value;
      case "not_equals":
        return value !== rule.value;
      case "includes":
        return Array.isArray(value) && value.includes(String(rule.value));
      case "not_includes":
        return Array.isArray(value) && !value.includes(String(rule.value));
      case "gte":
        return (
          typeof value === "number" &&
          typeof rule.value === "number" &&
          value >= rule.value
        );
      case "lte":
        return (
          typeof value === "number" &&
          typeof rule.value === "number" &&
          value <= rule.value
        );
    }
  });
  return group.match === "all" ? results.every(Boolean) : results.some(Boolean);
}

// Topological order also includes feature producers/dependencies, preventing hidden
// answers or circular feature conditions from influencing subsequent questions.
export function flowOrder(config: RequirementConfig) {
  const edges = new Map<string, Set<string>>();
  for (const q of config.questions) edges.set(`q:${q.id}`, new Set());
  for (const f of config.features) edges.set(`f:${f.id}`, new Set());
  for (const q of config.questions) {
    const dependencies = edges.get(`q:${q.id}`)!;
    if (q.when) dependencies.add(`q:${q.when.field}`);
    if (q.whenFeature) dependencies.add(`f:${q.whenFeature}`);
    for (const rule of q.conditions?.rules ?? []) {
      if (!rule.field.startsWith("$")) dependencies.add(`q:${rule.field}`);
      if (rule.field === "$features") dependencies.add(`f:${rule.value}`);
    }
    if (q.feature) edges.get(`f:${q.feature}`)?.add(`q:${q.id}`);
    for (const o of q.options)
      for (const f of o.features) edges.get(`f:${f}`)?.add(`q:${q.id}`);
  }
  for (const f of config.features)
    for (const dependency of f.dependencies)
      edges.get(`f:${dependency}`)?.add(`f:${f.id}`);
  const result: string[] = [],
    done = new Set<string>(),
    visiting = new Set<string>();
  const visit = (node: string) => {
    if (done.has(node)) return;
    if (visiting.has(node))
      throw Error("Question and feature conditions cannot cycle.");
    visiting.add(node);
    for (const parent of edges.get(node) ?? []) visit(parent);
    visiting.delete(node);
    done.add(node);
    result.push(node);
  };
  for (const node of edges.keys()) visit(node);
  return result;
}
const cachedOrder = new WeakMap<RequirementConfig, string[]>();
export function resolveFlow(
  config: RequirementConfig,
  input: RequirementRequest,
) {
  const project = config.projectTypes.find((p) => p.id === input.projectType);
  if (!project) throw Error("Choose a valid project type.");
  let order = cachedOrder.get(config);
  if (!order) {
    order = flowOrder(config);
    cachedOrder.set(config, order);
  }
  const features = new Set([
    ...project.included,
    ...input.features.filter((f) => project.optional.includes(f)),
  ]);
  const active = new Set<string>(),
    answers: Answers = {};
  for (const node of order) {
    if (node.startsWith("f:")) {
      const id = node.slice(2);
      if (
        config.features.some(
          (f) => features.has(f.id) && f.dependencies.includes(id),
        )
      )
        features.add(id);
      for (const q of config.questions) {
        if (!active.has(q.id)) continue;
        const value = answers[q.id];
        if (q.feature === id && value === true) features.add(id);
        for (const o of q.options)
          if (
            o.features.includes(id) &&
            (Array.isArray(value) ? value.includes(o.id) : value === o.id)
          )
            features.add(id);
      }
      continue;
    }
    const q = config.questions.find((q) => q.id === node.slice(2));
    if (!q || (q.projects.length && !q.projects.includes(project.id))) continue;
    if (q.when) {
      const value = answers[q.when.field];
      if (
        Array.isArray(value)
          ? !value.includes(String(q.when.value))
          : value !== q.when.value
      )
        continue;
    }
    if (q.whenFeature && !features.has(q.whenFeature)) continue;
    if (!matchesConditions(q.conditions, { ...input, answers }, features))
      continue;
    active.add(q.id);
    if (input.answers[q.id] !== undefined) answers[q.id] = input.answers[q.id];
  }
  return { project, features, answers, active };
}
export function recommendationInsights(
  config: RequirementConfig,
  input: RequirementRequest,
) {
  const { answers, features } = resolveFlow(config, input);
  return config.recommendations.filter((rule) =>
    matchesConditions(rule.conditions, { ...input, answers }, features),
  );
}
