import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Generate Application is gated by approved architecture state", () => {
  const workspace = source("src/components/agentic/AgenticWorkspace.tsx");
  assert.match(workspace, /plan\.status === "approved"[\s\S]{0,700}Generate Application/);
  assert.match(workspace, /Approve the architecture before generating application source/);
  assert.match(workspace, /agenticService\.generateApplication/);
});

test("successful generation exposes Source and immutable Versions tabs", () => {
  const workspace = source("src/components/agentic/AgenticWorkspace.tsx");
  assert.match(workspace, /readyVersions\.length[\s\S]{0,100}source/);
  assert.match(workspace, /versions\.length[\s\S]{0,100}versions/);
  assert.match(workspace, /setTab\("source"\)/);
  assert.match(workspace, /<VersionHistory/);
});

test("source browser renders a tree and lazily fetches selected file content", () => {
  const browser = source("src/components/agentic/SourceBrowser.tsx");
  assert.match(browser, /data-source-browser/);
  assert.match(browser, /agenticService\.sourceTree/);
  assert.match(browser, /onSelect=\{path => void selectFile\(path\)\}/);
  assert.match(browser, /agenticService\.sourceFile/);
  assert.match(browser, /readOnly: true/);
  assert.match(browser, /value=\{file\.content\}/);
});

test("ready versions provide authenticated source download", () => {
  const history = source("src/components/agentic/VersionHistory.tsx");
  const service = source("src/services/agentic.service.ts");
  assert.match(history, /version\.status === "ready"/);
  assert.match(history, /Download Source/);
  assert.match(history, /agenticService\.downloadSource/);
  assert.match(service, /responseType: "blob"/);
  assert.match(service, /\/download/);
});

test("failed generation is displayed truthfully", () => {
  const workspace = source("src/components/agentic/AgenticWorkspace.tsx");
  const history = source("src/components/agentic/VersionHistory.tsx");
  const projects = source("src/components/agentic/AgenticProjects.tsx");
  assert.match(workspace, /setTab\("versions"\)/);
  assert.match(history, /version\.status === "failed"/);
  assert.match(history, /version\.error/);
  assert.match(projects, /generation_failed: "Generation failed"/);
});
