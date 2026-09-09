"use client";
import type {
  ConditionGroup,
  RequirementConfig,
} from "@/lib/requirements/schema";
import { Button } from "@/components/ui/button";
type Rule = ConditionGroup["rules"][number];
const fieldClass =
  "min-h-11 w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm";
export function RuleEditor({
  value,
  config,
  onChange,
  exclude,
}: {
  value?: ConditionGroup;
  config: RequirementConfig;
  onChange: (value?: ConditionGroup) => void;
  exclude?: string;
}) {
  const sources = [
    {
      id: "$project",
      label: "Project type",
      type: "single",
      options: config.projectTypes,
    },
    {
      id: "$features",
      label: "Selected capability",
      type: "multi",
      options: config.features,
    },
    {
      id: "$design",
      label: "Design choice",
      type: "single",
      options: config.design,
    },
    {
      id: "$timeline",
      label: "Delivery choice",
      type: "single",
      options: config.timelines,
    },
    {
      id: "$maintenance",
      label: "Maintenance",
      type: "single",
      options: config.maintenance,
    },
    ...config.questions.filter((q) => q.id !== exclude),
  ];
  const changeRule = (index: number, rule: Rule) =>
    onChange({
      match: value?.match ?? "all",
      rules: (value?.rules ?? []).map((r, i) => (i === index ? rule : r)),
    });
  const fresh = (field: string): Rule => {
    const source = sources.find((s) => s.id === field)!;
    return {
      field,
      operator:
        source.type === "multi"
          ? "includes"
          : source.type === "number"
            ? "gte"
            : "equals",
      value:
        source.type === "boolean"
          ? true
          : source.type === "number"
            ? 1
            : (source.options[0]?.id ?? ""),
    };
  };
  return (
    <fieldset className="min-w-0 space-y-3 rounded-xl border border-border p-4">
      <legend className="px-1 text-sm font-semibold">Show when</legend>
      <p className="text-xs text-muted-foreground">
        No rules means always shown for applicable project types. Hidden or
        unanswered fields do not satisfy negative comparisons.
      </p>
      {!!value?.rules.length && (
        <label className="flex flex-wrap items-center gap-2 text-sm">
          Match
          <select
            className={fieldClass + " sm:!w-auto"}
            value={value.match}
            onChange={(e) =>
              onChange({ ...value, match: e.target.value as "all" | "any" })
            }
          >
            <option value="all">All conditions (AND)</option>
            <option value="any">Any condition (OR)</option>
          </select>
        </label>
      )}
      {value?.rules.map((rule, index) => {
        const source = sources.find((s) => s.id === rule.field);
        const operations =
          source?.type === "multi"
            ? ["includes", "not_includes"]
            : source?.type === "number"
              ? ["gte", "lte", "equals", "not_equals"]
              : ["equals", "not_equals"];
        if (rule.field !== "$features") operations.push("answered");
        return (
          <div
            key={index}
            className="grid items-end gap-3 rounded-lg bg-muted/40 p-3 sm:grid-cols-2"
          >
            <label className="min-w-0 space-y-1 text-xs">
              Answer or choice
              <select
                className={fieldClass}
                value={rule.field}
                onChange={(e) => changeRule(index, fresh(e.target.value))}
              >
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-xs">
              Comparison
              <select
                className={fieldClass}
                value={rule.operator}
                onChange={(e) =>
                  changeRule(index, {
                    ...rule,
                    operator: e.target.value as Rule["operator"],
                  })
                }
              >
                {operations.map((o) => (
                  <option key={o} value={o}>
                    {
                      {
                        equals: "is",
                        not_equals: "is not",
                        includes: "includes",
                        not_includes: "does not include",
                        gte: "at least",
                        lte: "at most",
                        answered: "has an answer",
                      }[o]
                    }
                  </option>
                ))}
              </select>
            </label>
            {rule.operator !== "answered" && (
              <label className="min-w-0 space-y-1 text-xs">
                Value
                {source?.type === "boolean" ? (
                  <select
                    className={fieldClass}
                    value={String(rule.value)}
                    onChange={(e) =>
                      changeRule(index, {
                        ...rule,
                        value: e.target.value === "true",
                      })
                    }
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                ) : source?.options.length ? (
                  <select
                    className={fieldClass}
                    value={String(rule.value ?? "")}
                    onChange={(e) =>
                      changeRule(index, { ...rule, value: e.target.value })
                    }
                  >
                    {source.options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={fieldClass}
                    type={source?.type === "number" ? "number" : "text"}
                    value={String(rule.value ?? "")}
                    onChange={(e) =>
                      changeRule(index, {
                        ...rule,
                        value:
                          source?.type === "number"
                            ? Number(e.target.value)
                            : e.target.value,
                      })
                    }
                  />
                )}
              </label>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                const rules = value.rules.filter((_, i) => i !== index);
                onChange(rules.length ? { ...value, rules } : undefined);
              }}
            >
              Remove condition {index + 1}
            </Button>
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={(value?.rules.length ?? 0) >= 20}
        onClick={() =>
          onChange({
            match: value?.match ?? "all",
            rules: [...(value?.rules ?? []), fresh("$project")],
          })
        }
      >
        Add condition
      </Button>
    </fieldset>
  );
}
