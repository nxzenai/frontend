import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { JSDOM } from "jsdom";
import { buildTrainingRegistration } from "../src/lib/trainingRegistration.ts";
import { submitMarketingLead } from "../src/lib/marketingApi.ts";
import { canAccess } from "../src/lib/rbac.ts";

const require = createRequire(import.meta.url);
const source = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
function component(path, mocks = {}) {
  const code = ts.transpileModule(source(path), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const module = { exports: {} };
  new Function("require", "module", "exports", code)(name => name in mocks ? mocks[name] : require(name), module, module.exports);
  return module.exports;
}

async function mount(Component, run) {
  const dom = new JSDOM("<div id='root'></div>", { url: "http://localhost" });
  const prior = { window: globalThis.window, document: globalThis.document, FormData: globalThis.FormData };
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.FormData = dom.window.FormData;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () => root.render(React.createElement(Component)));
    await run(dom.window, document.getElementById("root"));
  } finally {
    await act(async () => root.unmount());
    Object.assign(globalThis, prior);
    dom.window.close();
  }
}

function validData() {
  const data = new FormData();
  for (const [key, value] of Object.entries({ name: " Ada ", email: "ada@example.com", phone: "+91 90000 00000", city: "Pune", profession: "Student", program_interest: "AI Engineering", qualification: "BSc", consent: "on" })) data.set(key, value);
  return data;
}

test("registration validates required fields, mobile and consent and posts to the existing endpoint", async () => {
  for (const key of ["name", "email", "phone", "city", "profession", "program_interest", "qualification", "consent"]) {
    const data = validData(); data.delete(key);
    assert.throws(() => buildTrainingRegistration(data));
  }
  for (const phone of ["abc", "123456", "1234567890123456", "1234567890<script>"]) {
    const data = validData(); data.set("phone", phone);
    assert.throws(() => buildTrainingRegistration(data), /mobile/);
  }
  const payload = buildTrainingRegistration(validData());
  assert.equal(payload.name, "Ada");
  assert.equal(payload.source, "training_registration");
  assert.equal(payload.preferred_demo_date, "");
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.match(url, /\/api\/leads\/$/);
    assert.equal(init.method, "POST");
    assert.deepEqual(JSON.parse(init.body), payload);
    return Response.json({ id: "existing-lead" });
  };
  try { assert.equal((await submitMarketingLead(payload)).id, "existing-lead"); }
  finally { globalThis.fetch = originalFetch; }
});

test("candidate form renders, validates, shows API error, and submits with success feedback", async () => {
  let fail = true;
  const sent = [];
  const { default: Form } = component("src/components/marketing/TrainingRegistrationForm.tsx", {
    "@/lib/trainingRegistration": { buildTrainingRegistration, professions: ["Student"], experiences: ["Fresher"], programs: ["AI Engineering"] },
    "@/lib/marketingApi": { submitMarketingLead: async payload => { sent.push(payload); if (fail) throw new Error("Please try again."); return { id: "one" }; } },
  });
  await mount(Form, async (window, container) => {
    const form = container.querySelector("form");
    assert.ok(container.textContent.includes("Mobile Number"));
    assert.equal(form.checkValidity(), false);
    for (const [key, value] of validData()) {
      const input = form.elements.namedItem(key);
      if (key === "consent") input.checked = true; else input.value = value;
    }
    assert.equal(form.checkValidity(), true);
    await act(async () => form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));
    assert.match(container.querySelector('[role="alert"]').textContent, /try again/);
    fail = false;
    await act(async () => form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true })));
    assert.match(container.querySelector('[role="status"]').textContent, /Thank you for registering/);
    assert.equal(sent.length, 2);
    assert.equal(sent[1].source, "training_registration");
  });
});

test("Leads route requires authentication and admin permission before mounting intake", async () => {
  for (const role of [undefined, "user", "instructor", "admin", "super_admin"]) {
    let mounts = 0;
    const { default: Page } = component("src/app/leads/page.tsx", {
      "@/components/auth/ProtectedRoute": { default: ({ children }) => role ? children : null, __esModule: true },
      "@/components/dashboard/DashboardLayout": { default: ({ children }) => children, __esModule: true },
      "@/components/leads/LeadsWorkspace": { default: () => { mounts++; return React.createElement("p", null, "Intake"); }, __esModule: true },
      "@/hooks/useAuth": { default: () => ({ user: role ? { role } : null }), __esModule: true },
      "@/lib/rbac": { canAccess },
      "next/link": { default: ({ children, href }) => React.createElement("a", { href }, children), __esModule: true },
    });
    await mount(Page, async () => assert.equal(mounts > 0, role === "admin" || role === "super_admin"));
  }
});

test("review renders statuses and runs verify, reject, individual and bulk push without enabling duplicates", async () => {
  const rows = ["pending", "verified", "not_verified"].map((status, index) => ({ id: String(index), name: `Candidate ${index}`, email: "ada@example.com", phone: "9000000000", profession: "Student", program_interest: "AI Engineering", source: "training_registration", created_at: "2026-09-10T00:00:00Z", verification_status: status, crm_status: "not_pushed" }));
  const calls = [];
  const api = {
    list: async () => ({ items: structuredClone(rows), total: 3, page: 1, pages: 1, courses: ["AI Engineering"], sources: ["training_registration"], summary: { total: 3, pending: 1, verified: 1, not_verified: 1, ready: rows.filter(row => row.verification_status === "verified" && row.crm_status === "not_pushed").length } }),
    get: async id => structuredClone(rows[Number(id)]),
    verify: async (id, status, notes) => { calls.push(status); Object.assign(rows[Number(id)], { verification_status: status, verification_notes: notes }); return structuredClone(rows[Number(id)]); },
    push: async id => { calls.push("push"); Object.assign(rows[Number(id)], { crm_status: "pushed", crm_lead_id: id }); return { pushed: true, lead: structuredClone(rows[Number(id)]) }; },
    pushVerified: async () => { calls.push("bulk"); for (const row of rows) if (row.verification_status === "verified") row.crm_status = "pushed"; return { pushed: 1, skipped: 0, failed: [] }; },
  };
  const { default: Workspace } = component("src/components/leads/LeadsWorkspace.tsx", { "@/services/leadIntake.service": { leadIntake: api } });
  await mount(Workspace, async (window, container) => {
    await act(async () => { await new Promise(resolve => setTimeout(resolve, 300)); });
    const click = async element => { assert.ok(element); await act(async () => element.click()); };
    for (const status of ["Pending", "Verified", "Not Verified"]) assert.ok(container.querySelector("tbody").textContent.includes(status));
    assert.equal(container.querySelector("tbody tr").querySelectorAll("button")[1].disabled, true);
    await click(container.querySelector("tbody button"));
    const review = () => container.querySelector('[aria-label="Lead review"]');
    const button = label => [...review().querySelectorAll("button")].find(item => item.textContent === label);
    await click(button("Verify"));
    assert.equal(rows[0].verification_status, "verified");
    await click(button("Not Verified"));
    assert.equal(rows[0].verification_status, "not_verified");
    assert.equal(button("Push to CRM").disabled, true);
    await click(button("Verify"));
    await click(button("Push to CRM"));
    assert.equal(button("Already pushed").disabled, true);
    await click(button("Already pushed"));
    assert.equal(calls.filter(call => call === "push").length, 1);
    await click([...container.querySelectorAll("button")].find(item => item.textContent === "Push Verified Leads to CRM"));
    assert.ok(calls.includes("bulk"));
    assert.equal(rows[2].crm_status, "not_pushed");
    assert.match(container.querySelector('[role="status"]').textContent, /pushed to CRM/);
  });
});

test("admin client uses Studio API paths and drops empty date filters", async () => {
  const calls = [];
  const api = Object.fromEntries(["get", "post", "patch"].map(method => [method, async (...args) => { calls.push([method, ...args]); return { data: {} }; }]));
  const { leadIntake } = component("src/services/leadIntake.service.ts", { "@/lib/studioApi": { default: api, __esModule: true } });
  await leadIntake.list({ page: 1, search: "Ada", start: "", end: "" });
  await leadIntake.verify("one", "verified", "Called");
  await leadIntake.push("one");
  await leadIntake.pushVerified();
  assert.deepEqual(calls, [["get", "/leads/", { params: { page: 1, search: "Ada" } }], ["patch", "/leads/one/verification", { verification_status: "verified", verification_notes: "Called" }], ["post", "/leads/one/push-to-crm"], ["post", "/leads/push-verified"]]);
});

test("auth registration, training route and Studio/CRM navigation remain wired", () => {
  assert.match(source("src/app/register/page.tsx"), /<RegisterForm/);
  assert.match(source("src/app/(marketing)/training/register/page.tsx"), /<TrainingRegistrationForm/);
  assert.match(source("src/app/(marketing)/training/page.tsx"), /href="\/training\/register"/);
  const nav = source("src/lib/navigation.ts");
  for (const route of ["/leads", "/crm", "/users", "/platform", "/dashboard"]) assert.ok(nav.includes(`href: "${route}"`));
  assert.match(source("src/app/crm/page.tsx"), /<LeadTable/);
});
