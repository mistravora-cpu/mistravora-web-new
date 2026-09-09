import type { Question, RequirementConfig, RequirementRequest } from "./schema";
import { resolveFlow } from "./flow";
export type RequirementStep = {
  id: string;
  title: string;
  questions: Question[];
};
export function requirementSteps(
  config: RequirementConfig,
  input: RequirementRequest,
): RequirementStep[] {
  const { active } = resolveFlow(config, input);
  const applicable = config.questions.filter(
    (q) => !q.projects.length || q.projects.includes(input.projectType),
  );
  const groups = [...new Set(applicable.map((q) => q.group))].flatMap(
    (group) => {
      const questions = applicable.filter((q) => q.group === group),
        chunks = [];
      // Allocate stable slots before filtering; revealing a conditional question cannot
      // shift a visitor past unanswered questions on a different page.
      for (let i = 0; i < questions.length; i += config.questionsPerStep) {
        const shown = questions
          .slice(i, i + config.questionsPerStep)
          .filter((q) => active.has(q.id));
        if (shown.length)
          chunks.push({ id: `${group}-${i}`, title: group, questions: shown });
      }
      return chunks;
    },
  );
  const late = new Set([
    "Integration and specialist details",
    "Priorities and references",
  ]);
  return [
    { id: "project", title: "Project", questions: [] },
    ...groups.filter((g) => !late.has(g.title)),
    { id: "features", title: "Optional capabilities", questions: [] },
    ...groups.filter((g) => late.has(g.title)),
    { id: "design", title: "Design", questions: [] },
    { id: "timeline", title: "Delivery and maintenance", questions: [] },
    { id: "review", title: "Review your estimate", questions: [] },
    { id: "contact", title: "Send your requirements", questions: [] },
  ];
}
