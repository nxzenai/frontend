import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  buildMarketingLeadPayload,
  submitMarketingLead,
} from "../src/lib/marketingApi.ts";

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("marketing routes, navigation, contact fields, and legacy redirects are present", () => {
  const navbar = source("src/components/Navbar.tsx");
  const contact = source("src/components/marketing/ContactForm.tsx");

  for (const [label, route] of [["Home", "/"], ["Platform", "/platform"], ["Solutions", "/solutions"], ["Training", "/training"], ["Industries", "/industries"], ["Contact", "/contact"]]) {
    assert.ok(navbar.includes(`[\"${label}\", \"${route}\"]`), `${route} is linked`);
  }
  for (const label of ["Full Name", "Email Address", "Mobile Number", "What are you exploring?", "Message"]) {
    assert.ok(contact.includes(label), `${label} is visible`);
  }
  assert.ok(contact.includes("AI Foundations"));
  assert.ok(contact.includes("AI Engineering"));
  assert.ok(contact.includes("AI Consultation"));

  assert.match(source("src/app/(marketing)/programs/page.tsx"), /redirect\("\/training"\)/);
  assert.match(source("src/app/(marketing)/curriculum/page.tsx"), /redirect\("\/training"\)/);
  assert.match(source("src/app/(marketing)/projects/page.tsx"), /redirect\("\/industries"\)/);
  assert.match(source("src/app/(marketing)/demo/page.tsx"), /redirect\("\/contact"\)/);
});

test("contact form maps to the existing lead contract and endpoint", async () => {
  const payload = buildMarketingLeadPayload({
    name: "  Ada Lovelace  ",
    email: "  ada@example.com ",
    phone: " +91 90000 00000 ",
    interest: "AI Engineering",
    message: "  Team training  ",
  }, new Date("2026-09-08T00:00:00.000Z"));

  assert.deepEqual(payload, {
    name: "Ada Lovelace",
    email: "ada@example.com",
    phone: "+91 90000 00000",
    profession: "Website enquiry",
    program_interest: "AI Engineering",
    preferred_demo_date: "2026-09-12",
    message: "Team training",
  });

  let request;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    request = { url, init };
    return new Response(JSON.stringify({ id: "lead-1", message: "Lead created successfully" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  try {
    const response = await submitMarketingLead(payload);
    assert.equal(response.id, "lead-1");
    assert.match(String(request.url), /\/api\/leads\/$/);
    assert.equal(request.init.method, "POST");
    assert.deepEqual(JSON.parse(request.init.body), payload);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("marketing replacement does not point Studio CTA at an external domain", () => {
  const navbar = source("src/components/Navbar.tsx");
  const primitives = source("src/components/marketing/MarketingPrimitives.tsx");
  assert.match(navbar, /href="\/login"/);
  assert.match(primitives, /href="\/login"/);
  assert.doesNotMatch(`${navbar}\n${primitives}`, /https?:\/\//);
});
