import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
const cli = process.env.LIGHTHOUSE_CLI || "lighthouse";
const base = process.env.AUDIT_URL || "http://127.0.0.1:3100";
const runs = [
  ["mobile", "/", []],
  [
    "slow-mobile",
    "/",
    [
      "--throttling.rttMs=300",
      "--throttling.throughputKbps=800",
      "--throttling.cpuSlowdownMultiplier=4",
    ],
  ],
  ...[
    ["slow-browser", "/"],
    ["slow-browser-2", "/"],
    ["slow-browser-3", "/"],
    ["contact-slow", "/contact"],
    ["pricing-slow", "/pricing"],
  ].map(([name, path]) => [
    name,
    path,
    [
      "--throttling-method=devtools",
      "--throttling.requestLatencyMs=300",
      "--throttling.downloadThroughputKbps=800",
      "--throttling.uploadThroughputKbps=400",
      "--throttling.cpuSlowdownMultiplier=4",
    ],
  ]),
];
mkdirSync("docs/audits", { recursive: true });
const results = [];
for (const [name, path, flags] of runs) {
  const args = [
    base + path,
    "--chrome-flags=--headless --no-sandbox --enable-unsafe-swiftshader",
    ...flags,
    "--output=json",
    "--output=html",
    `--output-path=docs/audits/${name}`,
    "--only-categories=performance,accessibility,best-practices,seo",
    "--quiet",
  ];
  await new Promise((resolve, reject) => {
    const child = spawn(cli, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${name} exited ${code}`)),
    );
  });
  const r = JSON.parse(readFileSync(`docs/audits/${name}.report.json`, "utf8"));
  const result = {
    name,
    path,
    testedAt: r.fetchTime,
    lighthouseVersion: r.lighthouseVersion,
    throttlingMethod: r.configSettings.throttlingMethod,
    throttling: r.configSettings.throttling,
    scores: Object.fromEntries(
      Object.entries(r.categories).map(([k, v]) => [
        k,
        Math.round(v.score * 100),
      ]),
    ),
    lcpMs: r.audits["largest-contentful-paint"].numericValue,
    tbtMs: r.audits["total-blocking-time"].numericValue,
    cls: r.audits["cumulative-layout-shift"].numericValue,
  };
  results.push(result);
  writeFileSync(
    "docs/audits/performance-summary.json",
    JSON.stringify(results, null, 2) + "\n",
  );
  console.log(JSON.stringify(result));
}
