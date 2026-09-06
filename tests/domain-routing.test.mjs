import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const { NextRequest, NextResponse } = require("next/server");
const context = {
  exports: {},
  URL,
  process: { env: { VERCEL_ENV: "production" } },
  require: (name) => {
    if (name === "@/lib/supabase/middleware") {
      return { updateSession: async () => NextResponse.next() };
    }
    return require(name);
  },
};
vm.runInNewContext(
  ts.transpileModule(readFileSync("src/proxy.ts", "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText,
  context,
);

test("public host routing cannot reverse Vercel's primary-domain redirect", async () => {
  for (const host of ["mistravora.com", "www.mistravora.com"]) {
    for (const path of ["/", "/services?source=domain-check", "/contact"]) {
      const response = await context.exports.proxy(
        new NextRequest(`https://${host}${path}`),
      );
      assert.equal(response.status, 200, `${host}${path}`);
      assert.equal(response.headers.get("location"), null);
      assert.equal(response.headers.get("x-middleware-next"), "1");
    }
  }
});
