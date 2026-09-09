import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
test("quotation downloads and email retries reject unauthenticated callers before reading private records", async () => {
  const exports = {},
    calls = [];
  const deps = {
    "next/server": {
      NextResponse: {
        json: (data, options) =>
          new Response(JSON.stringify(data), {
            status: options?.status || 200,
          }),
      },
    },
    "@/lib/auth": { requireAdmin: async () => null },
    "@/lib/supabase/admin": {
      createAdminClient: () => {
        calls.push("database");
        throw Error("Must not access records");
      },
    },
    "@/lib/requirements/record": {},
    "@/lib/requirements/pdf": {},
    "@/lib/requirements/delivery": {},
    "@/lib/requirements/notification-settings": {},
    "@/lib/rate-limit": {},
    "next/cache": {},
  };
  new Function(
    "exports",
    "require",
    ts.transpileModule(
      readFileSync("src/app/api/requirements/[id]/route.ts", "utf8"),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2022,
        },
      },
    ).outputText,
  )(exports, (name) => deps[name] ?? require(name));
  const request = new Request("https://example.com/api/requirements/123");
  const context = { params: Promise.resolve({ id: "123" }) };
  assert.equal((await exports.GET(request, context)).status, 401);
  assert.equal((await exports.POST(request, context)).status, 401);
  assert.equal(calls.length, 0);
});
