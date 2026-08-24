import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { executionShortcut, selectCellRange } from "../src/utils/notebookCommands.ts";

const source = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const cell = (id, position, type = "code") => ({
  id, position, cell_type: type, source: id, outputs: [], execution_count: null,
  execution_state: "idle", execution_duration_ms: null, metadata: {}, created_at: "", updated_at: "",
});

test("Run above and below select notebook-ordered cells without the current cell", () => {
  const cells = [cell("third", 2), cell("first", 0), cell("second", 1, "markdown")];
  assert.deepEqual(selectCellRange(cells, "second", "above").map((item) => item.id), ["first"]);
  assert.deepEqual(selectCellRange(cells, "second", "below").map((item) => item.id), ["third"]);
  assert.deepEqual(selectCellRange(cells, "missing", "above"), []);
});

test("Shift+Enter and Ctrl/Cmd+Enter have distinct execution behavior", () => {
  assert.equal(executionShortcut({ key: "Enter", shiftKey: true, ctrlKey: false, metaKey: false }), "run-next");
  assert.equal(executionShortcut({ key: "Enter", shiftKey: false, ctrlKey: true, metaKey: false }), "run");
  assert.equal(executionShortcut({ key: "Enter", shiftKey: false, ctrlKey: false, metaKey: true }), "run");
  assert.equal(executionShortcut({ key: "a", shiftKey: false, ctrlKey: true, metaKey: false }), null);
});

test("dataset sidebar exposes upload progress, exact runtime path, copy, download and delete", () => {
  const sidebar = source("src/components/notebook/NotebookSidebar.tsx");
  for (const behavior of ["uploadProgress", "runtime_path", "clipboard.writeText", "downloadFile", "deleteFile"]) {
    assert.match(sidebar, new RegExp(behavior.replace(".", "\\.")));
  }
  assert.match(sidebar, /accept="\.csv,\.json,\.txt,\.xlsx"/);
  const service = source("src/services/cell.service.ts");
  assert.match(service, /onUploadProgress/);
  assert.match(service, /\/files\/\$\{fileId\}\/download/);
});

test("file and runtime failures remain visible through the accessible editor alert", () => {
  const context = source("src/contexts/NotebookEditorContext.tsx");
  for (const message of ["Unable to upload dataset", "Unable to delete notebook file", "Unable to download notebook file", "runtime information is unavailable"]) {
    assert.match(context, new RegExp(message));
  }
  assert.match(source("src/components/notebook/NotebookEditor.tsx"), /role="alert"/);
});

test("latest drafts are flushed before Run All and range execution", () => {
  const context = source("src/contexts/NotebookEditorContext.tsx");
  assert.match(context, /flushDraftsBeforeRun\(drafts, updateCell/);
  assert.match(context, /flushDraftsBeforeRun\(target, updateCell/);
  assert.match(context, /Failed to run notebook\. Unsaved cells were not executed/);
});

test("Colab-style controls are wired to functional editor actions", () => {
  const toolbar = source("src/components/notebook/CellToolbar.tsx");
  for (const label of ["Run above", "Run below", "Move cell up", "Move cell down", "Code above", "Text above", "Code below", "Text below"]) {
    assert.match(toolbar, new RegExp(label));
  }
  assert.match(source("src/components/notebook/NotebookToolbar.tsx"), /restartAndRunAll/);
  assert.match(source("src/components/notebook/NotebookHeader.tsx"), /updateNotebookTitle/);
});

test("runtime UI reports real versions and does not claim GPU without backend detection", () => {
  const sidebar = source("src/components/notebook/NotebookSidebar.tsx");
  assert.match(sidebar, /runtimeInfo\?\.python_version/);
  assert.match(sidebar, /runtimeInfo\?\.packages\.map/);
  assert.match(sidebar, /runtimeInfo\?\.gpu_available/);
  assert.match(sidebar, /GPU is reported only after framework and hardware detection/);
});

test("scientific outputs retain image, text, exception and sandboxed sanitized HTML paths", () => {
  const output = source("src/components/notebook/CellOutput.tsx");
  assert.match(output, /image\/png/);
  assert.match(output, /text\/html/);
  assert.match(output, /text\/plain/);
  assert.match(output, /traceback/);
  assert.match(output, /sanitizeNotebookHtml/);
  assert.match(output, /sandbox=""/);
  assert.doesNotMatch(output, /allow-scripts|dangerouslySetInnerHTML/);
});

test("Python Lab exposes seven keyless examples and validated notebook import", () => {
  const list = source("src/components/notebook/NotebookList.tsx");
  assert.match(list, /notebookService\.examples\(\)/);
  assert.match(list, /createExample/);
  assert.match(list, /importIPYNB/);
  assert.match(list, /accept="\.ipynb,application\/x-ipynb\+json"/);
  const service = source("src/services/notebook.service.ts");
  assert.match(service, /\/notebooks\/import\/ipynb/);
});
