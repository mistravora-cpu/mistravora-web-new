import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url),
  cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  new Function(
    "exports",
    "require",
    ts.transpileModule(
      readFileSync(`src/lib/requirements/${file}.ts`, "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
  )(exports, (name) =>
    name.startsWith("./") ? load(name.slice(2)) : require(name),
  );
  return exports;
}
const { requirementConfigSchema } = load("schema"),
  { resolveFlow, matchesConditions, recommendationInsights } = load("flow"),
  { requirementSteps } = load("steps"),
  { calculateEstimate, validateRequirements, buildRequirementSummary } =
    load("engine"),
  { mineRequirements } = load("mining");
const config = requirementConfigSchema.parse(
  JSON.parse(readFileSync("src/lib/requirements/defaults.json", "utf8")),
);
const input = (answers = {}, projectType = "website", features = []) => ({
  projectType,
  answers,
  features,
  design: "standard",
  timeline: "standard",
  maintenance: "none",
});
const rule = (field, operator, value) => ({ field, operator, value });
const all = (...rules) => ({ match: "all", rules });
test("all, any, numeric and negative conditions require relevant answered fields", () => {
  assert.equal(
    matchesConditions(
      all(rule("staff", "gte", 5)),
      input({ staff: 5 }),
      new Set(),
    ),
    true,
  );
  assert.equal(
    matchesConditions(
      all(rule("staff", "gte", 5)),
      input({ staff: 4 }),
      new Set(),
    ),
    false,
  );
  assert.equal(
    matchesConditions(
      all(rule("project_state", "not_equals", "New project")),
      input(),
      new Set(),
    ),
    false,
  );
  assert.equal(
    matchesConditions(
      {
        match: "any",
        rules: [
          rule("$project", "equals", "mobile"),
          rule("$features", "includes", "payments"),
        ],
      },
      input(),
      new Set(["payments"]),
    ),
    true,
  );
  assert.equal(
    matchesConditions(
      all(rule("staff", "gte", 5), rule("$features", "includes", "payments")),
      input({ staff: 5 }),
      new Set(),
    ),
    false,
  );
});
test("hidden parent answers cannot activate descendants or inflate the quote", () => {
  const q = (id, patch = {}) => ({
    ...config.questions.find((q) => q.id === "booking_required"),
    id,
    projects: [],
    feature: undefined,
    required: false,
    ...patch,
  });
  const c = requirementConfigSchema.parse({
    ...config,
    questions: [
      ...config.questions,
      q("gate", { type: "boolean" }),
      q("child", { when: { field: "gate", value: true } }),
      q("descendant", { when: { field: "child", value: true }, feature: "ai" }),
    ],
  });
  const req = input({ gate: false, child: true, descendant: true });
  const flow = resolveFlow(c, req);
  assert.equal(flow.active.has("descendant"), false);
  assert.equal(flow.features.has("ai"), false);
  assert.equal(flow.answers.child, undefined);
  assert.equal(calculateEstimate(c, req).subtotal, 120000);
  assert.equal(
    buildRequirementSummary(c, req).some((q) => q.value === "Yes"),
    false,
  );
});
test("required follow-ups appear on client steps and server validation", () => {
  const c = requirementConfigSchema.parse({
    ...config,
    questions: config.questions.map((q) =>
      q.id === "booking_capacity" ? { ...q, required: true } : q,
    ),
  });
  const req = input({
    booking_required: true,
    booking_resources: ["People / appointments"],
  });
  assert.ok(
    requirementSteps(c, req).some((s) =>
      s.questions.some((q) => q.id === "booking_capacity"),
    ),
  );
  assert.ok(validateRequirements(c, req, true).booking_capacity);
  const without = input({
    booking_required: false,
    booking_resources: ["People / appointments"],
  });
  assert.equal(
    validateRequirements(c, without, true).booking_capacity,
    undefined,
  );
  assert.equal(resolveFlow(c, without).answers.booking_resources, undefined);
});
test("step IDs remain stable when earlier conditional questions disappear", () => {
  const a = requirementSteps(config, input({ project_state: "Rebuild" })),
    b = requirementSteps(config, input({ project_state: "New project" }));
  const stepA = a.find((s) => s.questions.some((q) => q.id === "budget")),
    stepB = b.find((s) => s.questions.some((q) => q.id === "budget"));
  assert.equal(stepA.id, stepB.id);
  assert.equal(
    b.some((s) => s.questions.some((q) => q.id === "existing_url")),
    false,
  );
});
test("recommendations explain choices without adding costs or capabilities", () => {
  const req = input({ objective: "Generate leads" });
  assert.ok(
    recommendationInsights(config, req).some((r) => r.id === "lead_generation"),
  );
  assert.equal(resolveFlow(config, req).features.has("seo"), false);
  assert.equal(calculateEstimate(config, req).subtotal, 120000);
});
test("configuration rejects unknown selections and question-feature cycles", () => {
  for (const conditions of [
    all(rule("missing", "equals", true)),
    all(rule("objective", "equals", "invented")),
    all(rule("staff", "gte", "10")),
    all(rule("$features", "includes", "ai")),
  ]) {
    const changed = {
      ...config,
      questions: config.questions.map((q) =>
        q.id === "chatbot" ? { ...q, conditions } : q,
      ),
    };
    assert.equal(requirementConfigSchema.safeParse(changed).success, false);
  }
});
test("mining counts distinct quotes and computes support/confidence without exposing free text", () => {
  const records = Array.from({ length: 4 }, (_, i) => ({
    requirements: input({
      objective: "Generate leads",
      description: "private note",
    }),
    estimate: {
      project: "Website",
      manual: false,
      lines:
        i < 3 ? [{ id: "cms" }, { id: "seo" }, { id: "seo" }] : [{ id: "cms" }],
    },
    notification: { status: "accepted" },
  }));
  const data = mineRequirements(records, config);
  assert.equal(
    data.features.find((f) => f.label === "CMS / admin content management")
      .count,
    4,
  );
  const pair = data.associations.find(
    (a) => a.from === "CMS / admin content management",
  );
  assert.equal(pair.count, 3);
  assert.equal(pair.support, 75);
  assert.equal(pair.confidence, 75);
  assert.equal(JSON.stringify(data).includes("private note"), false);
  assert.equal(
    mineRequirements(records.slice(0, 2), config).associations.length,
    0,
  );
});
