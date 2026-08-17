import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the legacy datasets page is redirect-only", () => {
  const page = read("src/app/datasets/page.tsx");
  assert.match(page, /redirect\("\/eda"\)/);
  assert.doesNotMatch(page, /DatasetWorkspace|Dataset Manager/);
});

test("EDA Hub is the canonical navigation route and permission", () => {
  const navigation = read("src/lib/navigation.ts");
  const rbac = read("src/lib/rbac.ts");
  assert.match(navigation, /title: "EDA Hub"/);
  assert.match(navigation, /href: "\/eda"/);
  assert.match(navigation, /permission: "eda"/);
  assert.match(rbac, /eda: \[/);
});

test("the EDA API service never calls the legacy prefix", () => {
  const service = read("src/services/eda.service.ts");
  assert.match(service, /"\/eda"/);
  assert.doesNotMatch(service, /\/datasets/);
  for (const route of ["overview", "preview", "profile", "quality", "visualizations", "relationships", "transformations\/preview", "transformations\/apply", "reports"]) {
    assert.match(service, new RegExp(route));
  }
});

test("workspace exposes every required workflow section", () => {
  const workspace = read("src/components/eda/EDAWorkspace.tsx");
  for (const label of ["Overview", "Columns", "Data Quality", "Visualize", "Relationships", "Transform", "Report"]) assert.match(workspace, new RegExp(label));
});
