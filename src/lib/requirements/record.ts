import type { Submission } from "./submission";
import type { Estimate } from "./engine";
import type { RequirementConfig } from "./schema";
export type RequirementRecord = {
  source: "requirement_calculator";
  reference: string;
  submittedAt: string;
  requestHash: string;
  requirements: Submission["requirements"];
  contact: Submission["contact"];
  consent: { accepted: true; version: string };
  configVersion: string;
  estimate: Estimate;
  summary: { group: string; label: string; value: string }[];
  qualification: {
    projectSize: string;
    complexity: string;
    budgetAlignment: string;
    timeline: string;
    completeness: number;
  };
  terms: Pick<RequirementConfig, "notice" | "exclusions" | "advancePercent">;
  business: { name: string; email: string; phone: string; url: string };
  emailStatus: "pending" | "accepted" | "failed" | "not_configured";
  emailId?: string;
};
export function parseRequirementRecord(
  message: string,
): RequirementRecord | null {
  try {
    const value = JSON.parse(message);
    return value?.source === "requirement_calculator" &&
      typeof value.reference === "string" &&
      typeof value.requestHash === "string" &&
      value.estimate &&
      Array.isArray(value.summary) &&
      value.contact &&
      value.terms
      ? value
      : null;
  } catch {
    return null;
  }
}
