import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Preview tab is gated by a successful build for the selected version", () => {
  const workspace = source("src/components/agentic/AgenticWorkspace.tsx");
  assert.match(workspace, /item\.status === "succeeded"/);
  assert.match(workspace, /previewAvailable[\s\S]{0,180}label: "Preview"/);
  assert.match(workspace, /<PreviewPanel/);
});

test("Start Preview calls the version-pinned preview endpoint", () => {
  const panel = source("src/components/agentic/PreviewPanel.tsx");
  const service = source("src/services/agentic.service.ts");
  assert.match(panel, /Start Preview/);
  assert.match(panel, /agenticService\.startPreview\(projectId, version\.id\)/);
  assert.match(service, /versions\/\$\{versionId\}\/preview/);
});

test("truthful starting and running states are displayed", () => {
  const panel = source("src/components/agentic/PreviewPanel.tsx");
  assert.match(panel, /Starting preview\.\.\./);
  assert.match(panel, /Preview Running/);
  assert.match(panel, /Expires in/);
});

test("running preview exposes backend URL, iframe, and Open Preview", () => {
  const panel = source("src/components/agentic/PreviewPanel.tsx");
  assert.match(panel, /Open Preview/);
  assert.match(panel, /current\.preview_url/);
  assert.match(panel, /current\.backend_url/);
  assert.match(panel, /<iframe/);
});

test("stop and restart controls use preview lifecycle APIs", () => {
  const panel = source("src/components/agentic/PreviewPanel.tsx");
  assert.match(panel, /agenticService\.stopPreview/);
  assert.match(panel, /agenticService\.restartPreview/);
  assert.match(panel, /> Restart</);
  assert.match(panel, /> Stop</);
});

test("failed and expired preview states are truthful", () => {
  const panel = source("src/components/agentic/PreviewPanel.tsx");
  assert.match(panel, /current\?\.last_error/);
  assert.match(panel, /current\?\.status === "expired"/);
  assert.match(panel, /container was removed/);
});

test("preview UI contains no source modification or repair action", () => {
  const panel = source("src/components/agentic/PreviewPanel.tsx");
  assert.doesNotMatch(panel, /modify source|repair code|regenerate|request changes/i);
});
