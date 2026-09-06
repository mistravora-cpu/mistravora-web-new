module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start -- --hostname 127.0.0.1 --port 3100",
      url: [
        "http://127.0.0.1:3100/",
        "http://127.0.0.1:3100/contact",
        "http://127.0.0.1:3100/pricing",
      ],
      numberOfRuns: 3,
      settings: {
        formFactor: "mobile",
        throttlingMethod: "devtools",
        throttling: {
          requestLatencyMs: 300,
          downloadThroughputKbps: 800,
          uploadThroughputKbps: 400,
          cpuSlowdownMultiplier: 4,
        },
        chromeFlags: "--headless --no-sandbox --enable-unsafe-swiftshader",
      },
    },
    assert: {
      assertions: {
        "categories:performance": [
          "error",
          { minScore: 0.86, aggregationMethod: "median-run" },
        ],
        "categories:accessibility": ["warn", { minScore: 0.95 }],
        "categories:seo": ["warn", { minScore: 0.95 }],
      },
    },
    upload: { target: "filesystem", outputDir: "docs/audits/ci" },
  },
};
