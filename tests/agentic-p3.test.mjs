import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("ready source versions expose the Build section and Build & Test action", () => {
  const workspace = source("src/components/agentic/AgenticWorkspace.tsx");
  const panel = source("src/components/agentic/BuildPanel.tsx");
  assert.match(workspace, /readyVersions\.length[\s\S]{0,120}label: "Build"/);
  assert.match(workspace, /<BuildPanel/);
  assert.match(panel, /Build & Test/);
});

test("build action calls the Agentic version build endpoint", () => {
  const panel = source("src/components/agentic/BuildPanel.tsx");
  const service = source("src/services/agentic.service.ts");
  assert.match(panel, /agenticService\.createBuild\(projectId, version\.id\)/);
  assert.match(service, /versions\/\$\{versionId\}\/builds/);
});

test("active build state and truthful persisted stages are displayed", () => {
  const panel = source("src/components/agentic/BuildPanel.tsx");
  assert.match(panel, /\["queued", "running"\]\.includes\(selected\.status\)/);
  assert.match(panel, /Current stage:/);
  assert.match(panel, /stage\.completed/);
  assert.match(panel, /backend_validation/);
  assert.match(panel, /frontend_build/);
});

test("failure, bounded logs, and cancellation controls are rendered", () => {
  const panel = source("src/components/agentic/BuildPanel.tsx");
  assert.match(panel, /selected\.error/);
  assert.match(panel, /events\.filter\(event => event\.type === "log"\)/);
  assert.match(panel, /<pre/);
  assert.match(panel, /Cancel build/);
  assert.match(panel, /agenticService\.cancelBuild/);
});

test("P3 introduces no live preview functionality", () => {
  const workspace = source("src/components/agentic/AgenticWorkspace.tsx");
  const panel = source("src/components/agentic/BuildPanel.tsx");
  const service = source("src/services/agentic.service.ts");
  assert.doesNotMatch(`${workspace}\n${panel}\n${service}`, /preview/i);
});
