import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
function load(path, overrides = {}) {
  const context = {
    exports: {},
    Buffer,
    process,
    AbortSignal,
    URL,
    Date,
    require: (name) =>
      name in overrides
        ? overrides[name]
        : name === "server-only"
          ? {}
          : name.startsWith("./")
            ? load("src/lib/requirements/" + name.slice(2) + ".ts", overrides)
            : require(name),
  };
  new Function(
    "exports",
    "require",
    "Buffer",
    "process",
    "AbortSignal",
    ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
  )(context.exports, context.require, Buffer, process, AbortSignal);
  return context.exports;
}
const config = load(
  "src/lib/requirements/schema.ts",
).requirementConfigSchema.parse(
  JSON.parse(readFileSync("src/lib/requirements/defaults.json", "utf8")),
);
const engine = load("src/lib/requirements/engine.ts");
const req = {
  projectType: "website",
  answers: {
    project_name: "Sample business",
    description:
      "Website for a local business with services and booking enquiries.",
  },
  features: ["cms", "booking"],
  design: "standard",
  timeline: "standard",
  maintenance: "basic",
};
const record = {
  source: "requirement_calculator",
  reference: "MST-REQ-2026-test",
  submittedAt: "2026-09-08T00:00:00.000Z",
  contact: {
    name: "Sample Client",
    email: "client@example.com",
    company: "Sample Business",
  },
  estimate: engine.calculateEstimate(config, req),
  terms: config,
  summary: engine.buildRequirementSummary(config, req),
  business: {
    name: "Mistravora",
    email: "info@mistravora.com",
    phone: "+94 77 330 6063",
  },
};
test("quotation PDF is valid and includes multiple pages for long requirements", async () => {
  const { buildQuotationPdf } = load("src/lib/requirements/pdf.ts");
  const pdf = await buildQuotationPdf({
    ...record,
    summary: [
      ...record.summary,
      ...Array.from({ length: 65 }, (_, i) => ({
        group: "Proof and scope",
        label: `Requirement ${i + 1}`,
        value: "Detailed implementation requirements and acceptance criteria.",
      })),
    ],
  });
  assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
  const { PDFDocument } = require("pdf-lib");
  const doc = await PDFDocument.load(pdf);
  assert.ok(doc.getPageCount() > 2);
  writeFileSync("/private/tmp/mistravora-sample-quotation.pdf", pdf);
});
test("submission requires consent, email and the chosen contact channel", () => {
  const { submissionSchema } = load("src/lib/requirements/submission.ts");
  const payload = {
    id: "12345678-1234-4234-8234-123456789012",
    configVersion: "v1",
    requirements: req,
    contact: {
      name: "Test Client",
      email: "test@example.com",
      preferred: "Email",
    },
    consent: true,
  };
  assert.equal(submissionSchema.safeParse(payload).success, true);
  assert.equal(
    submissionSchema.safeParse({ ...payload, consent: false }).success,
    false,
  );
  assert.equal(
    submissionSchema.safeParse({
      ...payload,
      contact: { ...payload.contact, preferred: "Phone" },
    }).success,
    false,
  );
});
test("email adapter attaches the PDF, uses stable idempotency, and checks provider responses", async () => {
  const code = ts.transpileModule(
    readFileSync("src/lib/requirements/email.ts", "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  const calls = [];
  const adapter = (env, ok = true) => {
    const exports = {};
    new Function("exports", "require", "process", "fetch", "AbortSignal", code)(
      exports,
      () => ({}),
      { env },
      async (url, options) => {
        calls.push({ url, options });
        return {
          ok,
          status: ok ? 200 : 403,
          json: async () => ({ id: "email-receipt" }),
        };
      },
      AbortSignal,
    );
    return exports;
  };
  assert.equal(
    (await adapter({}).emailQuotation(record, Buffer.from("pdf"))).status,
    "not_configured",
  );
  assert.equal(calls.length, 0);
  const sender = adapter({
    RESEND_API_KEY: "test-key",
    EMAIL_FROM: "Mistravora <info@example.com>",
  });
  assert.equal(
    (await sender.emailQuotation(record, Buffer.from("pdf"))).status,
    "accepted",
  );
  const body = JSON.parse(calls[0].options.body);
  assert.deepEqual(body.to, ["client@example.com"]);
  assert.equal(
    body.attachments[0].content,
    Buffer.from("pdf").toString("base64"),
  );
  assert.equal(
    calls[0].options.headers["Idempotency-Key"],
    "requirement-MST-REQ-2026-test",
  );
  await assert.rejects(() =>
    adapter(
      { RESEND_API_KEY: "test-key", EMAIL_FROM: "info@example.com" },
      false,
    ).emailQuotation(record, Buffer.from("pdf")),
  );
});
