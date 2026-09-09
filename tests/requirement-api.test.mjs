import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
const modules = new Map();
function local(file) {
  if (modules.has(file)) return modules.get(file);
  const exports = {};
  const req = (name) =>
    name.startsWith("./")
      ? local("src/lib/requirements/" + name.slice(2) + ".ts")
      : require(name);
  new Function(
    "exports",
    "require",
    ts.transpileModule(readFileSync(file, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
  )(exports, req);
  modules.set(file, exports);
  return exports;
}
const config = local(
  "src/lib/requirements/schema.ts",
).requirementConfigSchema.parse(
  JSON.parse(readFileSync("src/lib/requirements/defaults.json", "utf8")),
);
function setup({
  mailFailure = false,
  dbFailure = false,
  teamFailure = false,
} = {}) {
  const rows = new Map();
  let sent = 0,
    notified = 0;
  const db = {
    from(table) {
      assert.equal(table, "inquiries");
      let id, operation, payload;
      const query = {
        select: () => query,
        eq: (_, v) => {
          id = v;
          return query;
        },
        maybeSingle: async () => ({
          data: rows.has(id) ? { message: rows.get(id).message } : null,
          error: null,
        }),
        insert: (data) => {
          id = data.id;
          payload = data;
          operation = "insert";
          return query;
        },
        update: (data) => {
          payload = data;
          operation = "update";
          return query;
        },
        then: (resolve) => {
          if (dbFailure)
            return Promise.resolve({ error: { code: "failed" } }).then(resolve);
          if (operation === "insert" && rows.has(id))
            return Promise.resolve({ error: { code: "23505" } }).then(resolve);
          rows.set(id, { ...rows.get(id), ...payload });
          return Promise.resolve({ error: null }).then(resolve);
        },
      };
      return query;
    },
  };
  const exports = {};
  const overrides = {
    "next/server": {
      NextResponse: {
        json: (data, options) =>
          new Response(JSON.stringify(data), {
            status: options?.status || 200,
            headers: options?.headers,
          }),
      },
    },
    "next/cache": { revalidatePath: () => {} },
    "@/lib/supabase/admin": { createAdminClient: () => db },
    "@/lib/business-profile": {
      getBusinessProfile: async () => ({
        name: "Mistravora",
        email: "info@example.com",
        phone: "123",
        url: "https://example.com",
      }),
    },
    "@/lib/requirements/settings": { getRequirementConfig: async () => config },
    "@/lib/requirements/pdf": {
      buildQuotationPdf: async () => Buffer.from("%PDF fixture"),
    },
    "@/lib/requirements/email": {
      emailQuoteNotification: async () => {
        notified++;
        if (teamFailure) throw Error("team provider failure");
        return { status: "accepted", id: "team-receipt" };
      },
      emailQuotation: async () => {
        sent++;
        if (mailFailure) throw Error("provider unavailable");
        return { status: "accepted", id: "receipt" };
      },
    },
    "@/lib/requirements/notification-settings": {
      getQuoteRecipients: async () => [
        "mistravora@gmail.com",
        "info@mistravora.com",
      ],
    },
    "@/lib/rate-limit": {
      checkRateLimit: () => null,
      RATE_LIMITS: { contact: {} },
    },
  };
  const delivery = {};
  new Function(
    "exports",
    "require",
    ts.transpileModule(
      readFileSync("src/lib/requirements/delivery.ts", "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
  )(delivery, (name) =>
    name === "server-only" ? {} : overrides["@/lib/requirements/email"],
  );
  overrides["@/lib/requirements/delivery"] = delivery;
  new Function(
    "exports",
    "require",
    ts.transpileModule(
      readFileSync("src/app/api/requirements/route.ts", "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
          esModuleInterop: true,
        },
      },
    ).outputText,
  )(
    exports,
    (name) =>
      overrides[name] ??
      (name.startsWith("@/lib/requirements/")
        ? local("src/lib/requirements/" + name.split("/").at(-1) + ".ts")
        : require(name)),
  );
  return {
    post: exports.POST,
    rows,
    sent: () => sent,
    notified: () => notified,
    recoverTeam: () => {
      teamFailure = false;
    },
  };
}
function payload() {
  return {
    id: "12345678-1234-4234-8234-123456789012",
    configVersion: config.version,
    requirements: {
      projectType: "website",
      answers: {
        project_name: "Client project",
        industry: "Retail",
        country: "Sri Lanka",
        description: "A useful company website",
        problem: "Need online enquiries",
        audience: "Customers",
        objective: "Generate leads",
        marketplace_required: true,
      },
      features: [],
      design: "standard",
      timeline: "standard",
      maintenance: "none",
    },
    contact: {
      name: "Sample Client",
      email: "sample@example.com",
      preferred: "Email",
    },
    consent: true,
  };
}
const request = (data) =>
  new Request("https://example.com/api/requirements", {
    method: "POST",
    headers: {
      Origin: "https://example.com",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
test("submission recalculates prices, drops irrelevant answers and retries without duplicate email", async () => {
  const env = setup(),
    data = payload();
  const first = await env.post(request(data));
  assert.equal(first.status, 200);
  const receipt = await first.json();
  assert.equal(receipt.emailStatus, "accepted");
  const saved = JSON.parse(env.rows.get(data.id).message);
  assert.equal(saved.estimate.subtotal, 120000);
  assert.equal(saved.requirements.answers.marketplace_required, undefined);
  assert.equal(saved.terms.advancePercent, 30);
  assert.equal((await env.post(request(data))).status, 200);
  assert.equal(env.rows.size, 1);
  assert.equal(env.sent(), 1);
  assert.equal(env.notified(), 1);
});
test("email failure keeps the inquiry and PDF and never claims successful delivery", async () => {
  const env = setup({ mailFailure: true });
  const response = await env.post(request(payload()));
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.emailStatus, "failed");
  assert.ok(result.pdf);
  assert.equal(env.rows.size, 1);
});
test("validation and database failure cannot send email", async () => {
  for (const patch of [
    { consent: false },
    { requirements: { ...payload().requirements, projectType: "fake" } },
    { requirements: { ...payload().requirements, answers: {} } },
  ]) {
    const env = setup();
    assert.equal(
      (await env.post(request({ ...payload(), ...patch }))).status,
      400,
    );
    assert.equal(env.sent(), 0);
  }
  const env = setup({ dbFailure: true });
  assert.equal((await env.post(request(payload()))).status, 503);
  assert.equal(env.sent(), 0);
});
test("a reused ID cannot retrieve a different enquiry", async () => {
  const env = setup(),
    data = payload();
  await env.post(request(data));
  const result = await env.post(
    request({
      ...data,
      contact: { ...data.contact, email: "someoneelse@example.com" },
    }),
  );
  assert.equal(result.status, 409);
  assert.equal(env.sent(), 1);
});

test("team notification failures retry independently without duplicating customer email", async () => {
  const env = setup({ teamFailure: true }),
    data = payload();
  assert.equal((await env.post(request(data))).status, 200);
  let record = JSON.parse(env.rows.get(data.id).message);
  assert.equal(record.emailStatus, "accepted");
  assert.equal(record.notification.status, "failed");
  assert.deepEqual(record.notification.recipients, [
    "mistravora@gmail.com",
    "info@mistravora.com",
  ]);
  env.recoverTeam();
  assert.equal((await env.post(request(data))).status, 200);
  record = JSON.parse(env.rows.get(data.id).message);
  assert.equal(record.notification.status, "accepted");
  assert.equal(env.sent(), 1);
  assert.equal(env.notified(), 2);
});
