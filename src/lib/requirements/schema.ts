import { z } from "zod";
import { flowOrder } from "./flow";
const id = z.string().regex(/^[a-z][a-z0-9_]{0,60}$/);
const money = z.number().finite().min(0).max(100000000);
export const conditionGroupSchema = z.object({
  match: z.enum(["all", "any"]),
  rules: z
    .array(
      z.object({
        field: z
          .string()
          .regex(
            /^(\$(project|features|design|timeline|maintenance)|[a-z][a-z0-9_]{0,60})$/,
          ),
        operator: z.enum([
          "equals",
          "not_equals",
          "includes",
          "not_includes",
          "gte",
          "lte",
          "answered",
        ]),
        value: z
          .union([z.string().max(2500), z.number().finite(), z.boolean()])
          .optional(),
      }),
    )
    .min(1)
    .max(20),
});
export type ConditionGroup = z.infer<typeof conditionGroupSchema>;
const option = z.object({
  id: z.string().min(1).max(100),
  label: z.string().min(1).max(200),
  score: z.number().min(0).max(20).default(0),
  scale: z.number().min(1).max(2).default(1),
  manual: z.boolean().default(false),
  features: z.array(id).default([]),
});
const question = z.object({
  id,
  label: z.string().min(1).max(250),
  group: z.string().min(1).max(80),
  type: z.enum([
    "text",
    "textarea",
    "number",
    "boolean",
    "single",
    "multi",
    "date",
    "url",
  ]),
  projects: z.array(id).default([]),
  required: z.boolean().default(false),
  options: z.array(option).default([]),
  feature: id.optional(),
  score: z.number().min(0).max(20).default(0),
  scale: z.number().min(1).max(2).default(1),
  manual: z.boolean().default(false),
  when: z
    .object({ field: id, value: z.union([z.string(), z.boolean()]) })
    .optional(),
  whenFeature: id.optional(),
  conditions: conditionGroupSchema.optional(),
  help: z.string().max(500).default(""),
  max: z.number().min(1).max(100000000).default(100000),
  scaleThresholds: z
    .array(
      z.object({
        at: z.number().min(0),
        multiplier: z.number().min(1).max(2),
        manual: z.boolean().default(false),
      }),
    )
    .default([]),
});
const choice = z.object({
  id,
  label: z.string().min(1),
  description: z.string(),
  multiplier: z.number().min(0.5).max(3),
  durationMultiplier: z.number().min(0.5).max(3),
});
export const requirementConfigSchema = z
  .object({
    version: z.string().min(1).max(40),
    minimum: money,
    rounding: z.number().int().min(1000).max(50000),
    rangeLow: z.number().min(0.5).max(1),
    rangeHigh: z.number().min(1).max(2),
    advancePercent: z.literal(30),
    notice: z.string().min(20).max(1500),
    exclusions: z.array(z.string().max(300)).max(20),
    projectTypes: z
      .array(
        z.object({
          id,
          label: z.string().min(1),
          description: z.string(),
          category: z.string(),
          useCases: z.string(),
          base: money,
          included: z.array(id),
          optional: z.array(id),
          weeks: z.tuple([
            z.number().min(1).max(104),
            z.number().min(1).max(104),
          ]),
        }),
      )
      .min(6)
      .max(30),
    features: z
      .array(
        z.object({
          id,
          label: z.string().min(1),
          price: money,
          score: z.number().min(0).max(20),
          weeks: z.number().min(0).max(20),
          dependencies: z.array(id).default([]),
        }),
      )
      .max(100),
    questions: z.array(question).max(400),
    questionsPerStep: z.number().int().min(1).max(5).default(3),
    recommendations: z
      .array(
        z.object({
          id,
          title: z.string().min(1).max(150),
          description: z.string().min(1).max(600),
          conditions: conditionGroupSchema,
          features: z.array(id).max(10).default([]),
        }),
      )
      .max(60)
      .default([]),
    design: z.array(choice).min(1),
    timelines: z.array(choice).min(1),
    maintenance: z
      .array(
        z.object({
          id,
          label: z.string(),
          monthly: money,
          description: z.string(),
        }),
      )
      .min(1),
    complexity: z
      .array(
        z.object({
          max: z.number().min(0).max(10000),
          label: z.string(),
          multiplier: z.number().min(1).max(3),
          manual: z.boolean(),
        }),
      )
      .min(1),
    phases: z
      .array(
        z.object({ label: z.string(), share: z.number().min(0.01).max(1) }),
      )
      .min(1)
      .max(10),
  })
  .superRefine((config, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: "custom", message });
    for (const list of [
      config.projectTypes,
      config.features,
      config.questions,
      config.design,
      config.timelines,
      config.maintenance,
      config.recommendations,
    ])
      if (new Set(list.map((x) => x.id)).size !== list.length)
        fail("IDs must be unique in every list.");
    const features = new Set(config.features.map((x) => x.id)),
      projects = new Set(config.projectTypes.map((x) => x.id)),
      questions = new Set(config.questions.map((x) => x.id));
    for (const p of config.projectTypes) {
      if (p.weeks[0] > p.weeks[1]) fail("Timeline minimum exceeds maximum.");
      for (const f of [...p.included, ...p.optional])
        if (!features.has(f)) fail(`Unknown feature ${f}`);
    }
    for (const q of config.questions) {
      if (q.conditions && (q.when || q.whenFeature))
        fail(
          "Use either combined conditions or legacy when/whenFeature rules on a question, not both.",
        );
      for (const p of q.projects)
        if (!projects.has(p)) fail(`Unknown project ${p}`);
      if (q.feature && !features.has(q.feature))
        fail("Unknown question feature");
      if (q.whenFeature && !features.has(q.whenFeature))
        fail("Unknown conditional feature");
      if (q.when && !questions.has(q.when.field))
        fail("Unknown conditional question");
      if (["single", "multi"].includes(q.type) && !q.options.length)
        fail("Choice questions need options.");
      if (new Set(q.options.map((o) => o.id)).size !== q.options.length)
        fail("Option IDs must be unique.");
      for (const o of q.options)
        for (const f of o.features)
          if (!features.has(f)) fail("Unknown option feature");
    }
    const checkConditions = (conditions: ConditionGroup | undefined) => {
      for (const rule of conditions?.rules ?? []) {
        const q = config.questions.find((q) => q.id === rule.field);
        if (!rule.field.startsWith("$") && !q)
          fail(`Unknown condition field ${rule.field}`);
        if (rule.operator !== "answered" && rule.value === undefined)
          fail("Conditions need a comparison value.");
        const multi = rule.field === "$features" || q?.type === "multi";
        if (["includes", "not_includes"].includes(rule.operator) && !multi)
          fail(
            "Includes conditions require a multiple-choice answer or feature.",
          );
        if (
          multi &&
          ["equals", "not_equals", "gte", "lte"].includes(rule.operator)
        )
          fail("Use includes for multiple-choice answers.");
        if (
          ["gte", "lte"].includes(rule.operator) &&
          (q?.type !== "number" || typeof rule.value !== "number")
        )
          fail("Numeric conditions require a numeric question and value.");
        if (
          q?.type === "boolean" &&
          rule.operator !== "answered" &&
          typeof rule.value !== "boolean"
        )
          fail("Yes/no conditions need a boolean value.");
        if (
          q &&
          ["single", "multi"].includes(q.type) &&
          rule.operator !== "answered" &&
          !q.options.some((o) => o.id === rule.value)
        )
          fail("Condition value must match an available option ID.");
        const special =
          rule.field === "$features"
            ? features
            : rule.field === "$project"
              ? projects
              : rule.field === "$design"
                ? new Set(config.design.map((x) => x.id))
                : rule.field === "$timeline"
                  ? new Set(config.timelines.map((x) => x.id))
                  : rule.field === "$maintenance"
                    ? new Set(config.maintenance.map((x) => x.id))
                    : null;
        if (
          special &&
          rule.operator !== "answered" &&
          !special.has(String(rule.value))
        )
          fail("Unknown condition selection.");
        if (rule.field === "$features" && rule.operator === "answered")
          fail("Feature conditions must name a specific feature.");
      }
    };
    config.questions.forEach((q) => checkConditions(q.conditions));
    for (const rule of config.recommendations) {
      checkConditions(rule.conditions);
      for (const f of rule.features)
        if (!features.has(f)) fail("Unknown recommended feature.");
    }
    try {
      flowOrder(config);
    } catch {
      fail("Question and feature conditions cannot cycle.");
    }
    const checkedQuestions = new Set<string>();
    const checkQuestion = (key: string, path: Set<string>) => {
      if (checkedQuestions.has(key)) return;
      if (path.has(key)) {
        fail("Question conditions cannot cycle.");
        return;
      }
      const q = config.questions.find((q) => q.id === key);
      if (q?.when) checkQuestion(q.when.field, new Set([...path, key]));
      checkedQuestions.add(key);
    };
    config.questions.forEach((q) => checkQuestion(q.id, new Set()));
    const visited = new Set<string>();
    const visit = (key: string, path: Set<string>) => {
      if (visited.has(key)) return;
      if (path.has(key)) {
        fail("Feature dependencies cannot cycle.");
        return;
      }
      const f = config.features.find((x) => x.id === key);
      if (!f) {
        fail("Unknown dependency");
        return;
      }
      for (const child of f.dependencies) visit(child, new Set([...path, key]));
      visited.add(key);
    };
    config.features.forEach((f) => visit(f.id, new Set()));
    if (
      Math.abs(config.phases.reduce((sum, p) => sum + p.share, 0) - 1) > 0.001
    )
      fail("Timeline phase shares must total 1.");
    if (
      config.complexity.some(
        (c, i) => i > 0 && c.max <= config.complexity[i - 1].max,
      )
    )
      fail("Complexity thresholds must increase.");
  });
export type RequirementConfig = z.infer<typeof requirementConfigSchema>;
export type Question = RequirementConfig["questions"][number];
export type Answer = string | number | boolean | string[];
export type Answers = Record<string, Answer>;
export const requestSchema = z.object({
  projectType: id,
  answers: z
    .record(
      id,
      z.union([
        z.string().max(2500),
        z.number().finite(),
        z.boolean(),
        z.array(z.string().max(100)).max(50),
      ]),
    )
    .refine((a) => Object.keys(a).length <= 400),
  features: z.array(id).max(100),
  design: id,
  timeline: id,
  maintenance: id,
});
export type RequirementRequest = z.infer<typeof requestSchema>;
