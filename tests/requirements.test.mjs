import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
const require = createRequire(import.meta.url);
function load(path) {
  const context = {
    exports: {},
    URL,
    Date,
    require: (name) =>
      name.startsWith("./")
        ? load("src/lib/requirements/" + name.slice(2) + ".ts")
        : require(name),
  };
  vm.runInNewContext(
    ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    context,
  );
  return context.exports;
}
const { requirementConfigSchema } = load("src/lib/requirements/schema.ts");
const config = requirementConfigSchema.parse(
  JSON.parse(readFileSync("src/lib/requirements/defaults.json", "utf8")),
);
const {
  calculateEstimate,
  resolveFeatures,
  visible,
  validateRequirements,
  buildRequirementSummary,
} = load("src/lib/requirements/engine.ts");
const input = (type, answers = {}, features = []) => ({
  projectType: type,
  answers,
  features,
  design: "standard",
  timeline: "standard",
  maintenance: "none",
});
const scenarios = [
  ["Simple website", "website", { pages: "1–5" }, []],
  [
    "Corporate website",
    "website",
    { pages: "20+", multilingual_required: true, cms_required: true },
    ["seo"],
  ],
  ["Basic store", "ecommerce", { products: "Under 50" }, []],
  [
    "Inventory store",
    "ecommerce",
    { products: "250–1,000", inventory_required: true },
    [],
  ],
  ["Marketplace", "ecommerce", { marketplace_required: true }, []],
  ["Simple portal", "webapp", {}, ["portal"]],
  [
    "Advanced SaaS",
    "webapp",
    {
      users: "10,000+",
      subscriptions: true,
      approvals: true,
      realtime_required: true,
    },
    ["ai", "rbac"],
  ],
  ["Single POS", "pos", { branches: "1", pos_inventory: true }, []],
  [
    "Multi-branch POS",
    "pos",
    { branches: "6+", branch_sync: true, pos_offline: true },
    [],
  ],
  [
    "Mobile customer app",
    "mobile",
    { platform: "Android", mobile_auth: true },
    [],
  ],
  [
    "Location app",
    "mobile",
    { platform: "Both", gps: true, tracking: true },
    [],
  ],
  [
    "Custom ERP",
    "custom",
    {
      modules: ["inventory", "crm", "hr", "finance", "projects"],
      custom_approvals: true,
    },
    [],
  ],
  ["AI project", "webapp", {}, ["ai"]],
  [
    "Integrations",
    "custom",
    {
      custom_integrations: true,
      integration_systems: ["Accounting", "ERP", "Email"],
    },
    [],
  ],
  ["Minimum", "website", {}, []],
  [
    "Enterprise",
    "custom",
    {
      modules: [
        "inventory",
        "crm",
        "hr",
        "finance",
        "payroll",
        "projects",
        "tasks",
        "documents",
        "portal",
        "workflow",
        "pos",
      ],
      staff: 2000,
    },
    ["ai", "offline", "realtime", "migration"],
  ],
];
for (const [name, type, answers, features] of scenarios)
  test(`requirement estimate: ${name}`, () => {
    const e = calculateEstimate(config, input(type, answers, features));
    assert.ok(e.low >= 120000);
    assert.ok(e.high >= e.low);
    assert.equal(e.low % 5000, 0);
    assert.equal(e.high % 5000, 0);
    assert.equal(e.advanceLow, e.low * 0.3);
    assert.ok(e.weeksHigh >= e.weeksLow);
    assert.equal(e.phases.at(-1).endWeek, e.weeksHigh);
    assert.equal(e.monthly, 0);
  });
test("base capabilities, inferred dependencies and overlapping features charge once", () => {
  const pos = calculateEstimate(
    config,
    input("pos", { pos_inventory: true }, []),
  );
  assert.equal(pos.subtotal, 300000);
  assert.equal(pos.lines.find((l) => l.id === "pos").price, 0);
  assert.equal(pos.lines.find((l) => l.id === "inventory").price, 0);
  const store = calculateEstimate(
    config,
    input(
      "ecommerce",
      {
        marketplace_required: true,
        accounts: true,
        store_roles: true,
        store_admin: true,
      },
      ["marketplace", "rbac"],
    ),
  );
  assert.equal(store.lines.filter((l) => l.id === "auth").length, 1);
  assert.equal(store.lines.find((l) => l.id === "admin").price, 0);
  assert.equal(
    calculateEstimate(
      config,
      input("mobile", { gps: true, mobile_maps: true }, ["maps"]),
    ).lines.filter((l) => l.id === "maps").length,
    1,
  );
});
test("budget and maintenance do not change project cost", () => {
  const a = input("website", { budget: "Under LKR 200K" });
  const b = { ...a, answers: { budget: "LKR 2M+" }, maintenance: "priority" };
  const x = calculateEstimate(config, a),
    y = calculateEstimate(config, b);
  assert.equal(x.low, y.low);
  assert.equal(y.monthly, 45000);
});
test("irrelevant answers do not charge or appear in summaries", () => {
  const a = input("website", {
    marketplace_required: true,
    pos_offline: true,
    module_crm: "hidden",
  });
  assert.equal(calculateEstimate(config, a).subtotal, 120000);
  assert.equal(buildRequirementSummary(config, a).length, 0);
});
test("specialist questions follow selected and dependent capabilities", () => {
  const a = input("webapp", {}, ["payments"]);
  const { features } = resolveFeatures(config, a);
  assert.equal(
    visible(
      config.questions.find((q) => q.id === "gateway"),
      "webapp",
      {},
      features,
    ),
    true,
  );
  assert.equal(
    visible(
      config.questions.find((q) => q.id === "languages"),
      "webapp",
      {},
      features,
    ),
    false,
  );
});
test("validation rejects forged choices, invalid types and missing required fields", () => {
  assert.ok(
    validateRequirements(config, input("website", { pages: "fake" })).pages,
  );
  assert.ok(
    validateRequirements(config, input("pos", { terminals: -1 })).terminals,
  );
  assert.ok(validateRequirements(config, input("website"), true).project_name);
  assert.ok(
    validateRequirements(config, input("website", {}, ["pos"])).features,
  );
});
test("config rejects a non-30% advance, duplicate IDs and cyclic dependencies", () => {
  for (const change of [
    { advancePercent: 20 },
    { projectTypes: [...config.projectTypes, config.projectTypes[0]] },
    {
      features: config.features.map((f) =>
        f.id === "auth" ? { ...f, dependencies: ["rbac"] } : f,
      ),
    },
  ])
    assert.equal(
      requirementConfigSchema.safeParse({ ...config, ...change }).success,
      false,
    );
});
