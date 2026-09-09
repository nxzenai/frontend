import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Agentic route is protected and uses the Studio dashboard", () => {
  const page = source("src/app/agentic/page.tsx");
  const navigation = source("src/lib/navigation.ts");
  assert.match(page, /<ProtectedRoute>[\s\S]*<DashboardLayout>[\s\S]*<AgenticProjects/);
  assert.match(navigation, /title: "Agentic AI",[\s\S]{0,80}href: "\/agentic"/);
  assert.doesNotMatch(navigation, /title: "Agentic AI",[\s\S]{0,160}comingSoon: true/);
});

test("new project form captures the business problem and supporting files", () => {
  const form = source("src/components/agentic/NewAgenticProject.tsx");
  const projects = source("src/components/agentic/AgenticProjects.tsx");
  assert.match(form, /Project Name/);
  assert.match(form, /Business Problem/);
  assert.match(form, /type="file" multiple/);
  assert.match(form, /Design AI Solution/);
  assert.match(projects, /uploadSupportingFile/);
  assert.match(projects, /createProject/);
  assert.match(projects, /generatePlan/);
});

test("architecture workspace renders every structured section", () => {
  const architecture = source("src/components/agentic/ArchitecturePlan.tsx");
  for (const heading of ["Overview", "Agents", "Workflow", "Tools", "Frontend", "Backend", "Data", "Integrations", "Security Considerations", "Assumptions"]) {
    assert.match(architecture, new RegExp(heading));
  }
  assert.doesNotMatch(architecture, /JSON\.stringify\(plan/);
});

test("workspace supports immutable change requests and approval actions", () => {
  const workspace = source("src/components/agentic/AgenticWorkspace.tsx");
  const service = source("src/services/agentic.service.ts");
  assert.match(workspace, /Request Changes/);
  assert.match(workspace, /Approve Architecture/);
  assert.match(workspace, /agenticService\.revisePlan/);
  assert.match(workspace, /agenticService\.approvePlan/);
  assert.match(service, /\/plan\/revise/);
  assert.match(service, /\/plan\/approve/);
});
