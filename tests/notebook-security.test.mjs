import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the dynamic notebook editor route is explicitly protected", () => {
  const page = read("src/app/notebooks/[id]/page.tsx");
  assert.match(page, /<ProtectedRoute>/);
  assert.match(page, /<NotebookEditorProvider/);
});

test("rich HTML output is sanitized and isolated in a sandboxed iframe", () => {
  const output = read("src/components/notebook/CellOutput.tsx");
  assert.match(output, /DOMPurify\.sanitize/);
  assert.match(output, /sandbox=""/);
  assert.match(output, /Content-Security-Policy/);
  assert.doesNotMatch(output, /dangerouslySetInnerHTML/);
});

test("Jupyter export maps internal outputs onto nbformat fields", () => {
  const exporter = read("src/utils/exportNotebook.ts");
  for (const field of ["output_type", "execution_count", "traceback", "kernelspec", "nbformat_minor"]) {
    assert.match(exporter, new RegExp(field));
  }
  assert.match(exporter, /escapeHtml\(cell\.source\)/);
});

test("editing updates the shared draft and Run All flushes drafts before execution", () => {
  const codeCell = read("src/components/notebook/CodeCell.tsx");
  const context = read("src/contexts/NotebookEditorContext.tsx");
  assert.match(codeCell, /setCells\(\(cells\) => cells\.map/);
  assert.match(context, /saveQueues/);
  assert.match(context, /Promise\.all\(drafts\.map/);
  assert.ok(context.indexOf("Promise.all(drafts.map") < context.indexOf("const latestCells = await refreshCells", context.indexOf("Promise.all(drafts.map")));
});
