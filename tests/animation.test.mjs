import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const context = { exports: {} };
vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/animation.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, context);
const { smoothTowards } = context.exports;

test('robot movement converges without overshoot at low frame rates', () => {
  for (const speed of [12, 30, 40]) {
    for (const delta of [1 / 120, 1 / 60, 1 / 30, 1 / 10, 1]) {
      const next = smoothTowards(-0.8, 0.4, speed, delta);
      assert.ok(next >= -0.8 - 1e-12 && next <= 0.4 + 1e-12);
      assert.ok(Math.abs(0.4 - next) < 1.2);
    }
  }
});

test('robot smoothing preserves its 60 Hz response across frame rates', () => {
  assert.ok(Math.abs(smoothTowards(0, 1, 40, 1 / 60) - 40 / 60) < 1e-12);
  const oneFrame = smoothTowards(0, 1, 12, 1 / 30);
  const twoFrames = smoothTowards(smoothTowards(0, 1, 12, 1 / 60), 1, 12, 1 / 60);
  assert.ok(Math.abs(oneFrame - twoFrames) < 1e-12);
});
