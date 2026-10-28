import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
function compile(file) {
  return ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
}
function loadAction(inserted) {
  const meeting = {};
  new Function("exports", "require", compile("src/lib/meeting.ts"))(meeting, require);
  const mocks = {
    "next/headers": { headers: async () => new Headers() },
    "@/lib/rate-limit": { checkRateLimit: () => null, RATE_LIMITS: { contact: {} } },
    "@/lib/supabase/server": { createClient: async () => ({ from: (table) => ({ insert: async (row) => { inserted.push({ table, row }); return { error: null }; } }) }) },
    "@/lib/business-profile": { getBusinessProfile: async () => ({ email: "info@example.com" }) },
    "@/lib/env": { serverEnv: { RESEND_API_KEY: "" } },
    "@/lib/site": { site: { url: "https://example.com" } },
    "@/lib/meeting": meeting,
  };
  const exports = {};
  new Function("exports", "require", compile("src/app/(public)/book/actions.ts"))(exports, (name) => mocks[name] ?? require(name));
  return { requestMeeting: exports.requestMeeting, meeting };
}
const colombo = (days) => new Date(Date.now() + days * 86_400_000).toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
function form(overrides = {}, meeting) {
  const data = new FormData();
  const values = { name: "Test Person", email: "test@example.com", phone: "+94 77 000 0000", company: "", date: colombo(3), time: meeting.meetingTimes[0], format: meeting.meetingFormats[0], topic: "We need a booking website for our hotel.", privacyConsent: "yes", website: "", ...overrides };
  for (const [k, v] of Object.entries(values)) if (v !== undefined) data.set(k, v);
  return data;
}

test("meeting requests are saved as inquiries in the existing table", async () => {
  const inserted = [];
  const { requestMeeting, meeting } = loadAction(inserted);
  const result = await requestMeeting(null, form({}, meeting));
  assert.equal(result.ok, true);
  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].table, "inquiries");
  assert.deepEqual(Object.keys(inserted[0].row).sort(), ["company", "email", "message", "name", "phone"]);
  assert.match(inserted[0].row.message, /^\[Meeting request\]/);
});

test("meeting requests are validated before any database write", async () => {
  const inserted = [];
  const { requestMeeting, meeting } = loadAction(inserted);
  for (const overrides of [{ privacyConsent: undefined }, { date: colombo(0) }, { date: colombo(-2) }, { date: colombo(200) }, { email: "nope" }, { topic: "short" }, { time: "Midnight" }, { phone: "<script>" }]) {
    const result = await requestMeeting(null, form(overrides, meeting));
    assert.equal(result.ok, false, JSON.stringify(overrides));
  }
  assert.equal((await requestMeeting(null, form({ website: "spam" }, meeting))).ok, true);
  assert.equal(inserted.length, 0);
});
