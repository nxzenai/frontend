import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

import { resolveProtectedRouteState } from "../src/components/auth/protectedRouteState.ts";
import { validateStudioApiUrl } from "../src/lib/studioApiConfig.ts";
import { flushDraftsBeforeRun, persistThenRun } from "../src/utils/notebookExecution.ts";
import { sanitizeNotebookHtml } from "../src/utils/sanitizeNotebookHtml.ts";
import { SerializedSaveQueue } from "../src/utils/serializedSaveQueue.ts";
import { buildHTML, buildIPYNB } from "../src/utils/exportNotebook.ts";
import { kernelControlState } from "../src/utils/kernelControls.ts";
import { notebookLoadError } from "../src/utils/notebookLoadError.ts";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("protected-route state does not expose content before authentication resolves", () => {
  assert.equal(resolveProtectedRouteState(true, false), "loading");
  assert.equal(resolveProtectedRouteState(false, false), "redirect");
  assert.equal(resolveProtectedRouteState(false, true), "content");
});

test("notebook API 401 and non-disclosing 404 states render safe messages", () => {
  assert.match(notebookLoadError(401), /session has expired/i);
  assert.match(notebookLoadError(404), /not found or you do not have access/i);
  assert.doesNotMatch(notebookLoadError(404), /owner|token|stack|database/i);
});

test("serialized autosave preserves request order and the latest draft", async () => {
  const queue = new SerializedSaveQueue();
  const persisted = [];
  let releaseFirst;
  const firstGate = new Promise((resolve) => { releaseFirst = resolve; });

  const first = queue.enqueue("cell-1", async () => {
    await firstGate;
    persisted.push("old");
  });
  const second = queue.enqueue("cell-1", async () => { persisted.push("latest"); });
  assert.equal(queue.pending, true);
  releaseFirst();
  await Promise.all([first, second]);
  assert.deepEqual(persisted, ["old", "latest"]);
});

test("Run All flushes the latest drafts in position order before execution", async () => {
  const events = [];
  await flushDraftsBeforeRun(
    [{ id: "second", source: "new-2", position: 1 }, { id: "first", source: "new-1", position: 0 }],
    async (id, source) => { events.push(`save:${id}:${source}`); },
    async () => { events.push("execute-all"); },
  );
  assert.deepEqual(events, ["save:first:new-1", "save:second:new-2", "execute-all"]);
});

test("failed draft persistence blocks individual and Run All execution", async () => {
  let executions = 0;
  await assert.rejects(() => persistThenRun("cell", "draft", async () => { throw new Error("save failed"); }, async () => { executions += 1; }));
  await assert.rejects(() => flushDraftsBeforeRun(
    [{ id: "cell", source: "draft", position: 0 }],
    async () => { throw new Error("save failed"); },
    async () => { executions += 1; },
  ));
  assert.equal(executions, 0);
});

test("rich HTML sanitizer removes active content and preserves basic output", () => {
  const window = new JSDOM("").window;
  const purifier = createDOMPurify(window);
  const result = sanitizeNotebookHtml(
    '<script>globalThis.pwned=1</script><img src=x onerror="pwn()"><a href="javascript:pwn()">click</a><iframe src="https://attacker.example"></iframe><p style="background:url(javascript:pwn())">safe</p><h2>heading</h2><table><tr><td>value</td></tr></table>',
    purifier,
  );
  assert.doesNotMatch(result, /<script|<iframe|onerror|javascript:|style="/i);
  assert.match(result, /<p>safe<\/p>/);
  assert.match(result, /<table>/);
  assert.match(result, /<h2>heading<\/h2>/);
  assert.match(result, /Content-Security-Policy/);
});

const notebook = {
  id: "notebook-1", owner_id: "owner", title: '<img src=x onerror="pwn()">',
  description: "<script>bad()</script>", visibility: "private", tags: [], execution_count: 1,
  created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z",
};
const cells = [
  {
    id: "code:1", cell_type: "code", source: "print('<unsafe>')", position: 0,
    execution_count: 1, metadata: {}, created_at: "", updated_at: "",
    outputs: [
      { output_type: "stream", content: { text: "out", name: "stderr" }, metadata: { name: "stderr" } },
      { output_type: "execute_result", content: { data: { "text/plain": "42" }, metadata: {}, execution_count: 1 } },
      { output_type: "display_data", content: { data: { "image/png": "aGVsbG8=", "text/html": "<b>42</b>" }, metadata: { isolated: true } } },
      { output_type: "error", content: { ename: "ValueError", evalue: "bad", traceback: ["trace"] } },
    ],
  },
  {
    id: "markdown-1", cell_type: "markdown", source: "# heading", position: 1,
    execution_count: null, metadata: {}, outputs: [], created_at: "", updated_at: "",
  },
];

test("HTML export escapes notebook metadata, source, and outputs", () => {
  const html = buildHTML(notebook, cells);
  assert.doesNotMatch(html, /<img src=x|<script>bad/);
  assert.match(html, /&lt;img src=x onerror=&quot;pwn\(\)&quot;&gt;/);
  assert.match(html, /&lt;script&gt;bad\(\)&lt;\/script&gt;/);
  assert.match(html, /print\(&#39;&lt;unsafe&gt;&#39;\)/);
});

test("Jupyter export maps rich output fields and valid cell identifiers", () => {
  const exported = buildIPYNB(notebook, cells);
  assert.equal(exported.nbformat, 4);
  assert.equal(exported.nbformat_minor, 5);
  assert.equal(exported.cells[0].id, "code-1");
  assert.equal(exported.cells[0].outputs[0].name, "stderr");
  assert.equal(exported.cells[0].outputs[1].execution_count, 1);
  assert.equal(exported.cells[0].outputs[2].data["image/png"], "aGVsbG8=");
  assert.equal(exported.cells[0].outputs[2].data["text/html"], "<b>42</b>");
  assert.deepEqual(exported.cells[0].outputs[3].traceback, ["trace"]);
  assert.equal("outputs" in exported.cells[1], false);
});

test("Studio API URL validation rejects missing, malformed and insecure production URLs", () => {
  assert.throws(() => validateStudioApiUrl(undefined, false), /not configured/);
  assert.throws(() => validateStudioApiUrl("not a URL", false), /valid URL/);
  assert.throws(() => validateStudioApiUrl("ftp://example.com", false), /HTTP or HTTPS/);
  assert.throws(() => validateStudioApiUrl("http://api.example.com", true), /HTTPS/);
  assert.equal(validateStudioApiUrl("https://api.example.com/", true), "https://api.example.com");
});

test("kernel lifecycle states drive the execution controls", () => {
  for (const status of ["busy", "starting", "restarting"]) {
    const controls = kernelControlState(status, false, "saved");
    assert.equal(controls.runDisabled, true);
    assert.equal(controls.interruptDisabled, false);
  }
  assert.equal(kernelControlState("stopped", false, "saved").shutdownDisabled, true);
  assert.equal(kernelControlState("idle", false, "saved").interruptDisabled, true);
  assert.equal(kernelControlState("failed", false, "saved").runDisabled, false);
});

test("editor exposes errors accessibly and cleans up kernel polling", () => {
  const editor = source("src/components/notebook/NotebookEditor.tsx");
  const context = source("src/contexts/NotebookEditorContext.tsx");
  assert.match(editor, /role="alert"/);
  for (const message of [
    "Failed to execute cell", "Failed to run notebook", "Unable to restart",
    "Unable to interrupt", "Unable to shut down", "Unable to clear cell",
    "Unable to clear notebook", "Kernel status refresh failed",
  ]) assert.match(context, new RegExp(message));
  assert.match(context, /clearInterval\(timer\)/);
});

test("every visible notebook toolbar control is functional and cosmetic controls remain absent", () => {
  const toolbar = source("src/components/notebook/NotebookToolbar.tsx");
  for (const action of ["runAllCells", "restartKernel", "interruptKernel", "clearAllOutputs", "shutdownKernel"]) {
    assert.match(toolbar, new RegExp(`onClick=\\{${action}\\}`));
  }
  assert.doesNotMatch(toolbar, />\s*Save\s*</);
  assert.doesNotMatch(toolbar, />\s*More\s*</);
});

test("individual Run and Shift+Enter share persist-before-run behavior", () => {
  assert.match(source("src/components/notebook/CellContainer.tsx"), /persistThenRun/);
  assert.match(source("src/components/notebook/CodeCell.tsx"), /persistThenRun/);
});

test("HTML output remains in a scriptless sandbox", () => {
  const output = source("src/components/notebook/CellOutput.tsx");
  assert.match(output, /sandbox=""/);
  assert.doesNotMatch(output, /allow-scripts|dangerouslySetInnerHTML/);
});
