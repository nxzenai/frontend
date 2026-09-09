import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { shouldLoadNotebookCatalog } from "../src/lib/notebookRoute.ts";

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("public and unrelated Studio routes do not activate the root notebook catalog", () => {
  for (const route of ["/", "/platform", "/solutions", "/training", "/industries", "/contact", "/login", "/register", "/python-lab", "/notebooks/id", "/sql", "/eda", "/automl", "/autodl", "/autonlp", "/genai", "/crm"]) {
    assert.equal(shouldLoadNotebookCatalog(route), false, route);
  }
});

test("dashboard retains the existing NotebookProvider catalog load", () => {
  assert.equal(shouldLoadNotebookCatalog("/dashboard"), true);
  const context = source("src/contexts/NotebookContext.tsx");
  assert.match(context, /!loadNotebookCatalog \|\| !AuthService\.isAuthenticated\(\)/);
  assert.match(context, /await NotebookService\.getAll\(\)/);
});

test("Python Lab and notebook editor retain their dedicated notebook loaders", () => {
  assert.match(source("src/components/notebook/NotebookList.tsx"), /notebookService\.getAll\(\)/);
  assert.match(source("src/app/notebooks/[id]/page.tsx"), /NotebookEditorProvider/);
});
