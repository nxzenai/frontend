import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { JSDOM } from "jsdom";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import ts from "typescript";

const require = createRequire(import.meta.url);
const deferred = () => {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
};

test("concurrent uploads merge latest selection and serialize persisted snapshots", async () => {
  const dom = new JSDOM("<div id='root'></div>");
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const uploads = { a: deferred(), b: deferred() };
  const firstSave = deferred();
  const saves = [];
  globalThis.__genaiService = {
    listConversations: async () => [], health: async () => ({ tiers: [] }),
    preferences: async () => ({}), memories: async () => [], projects: async () => [], tools: async () => [],
    getConversation: async () => ({ messages: [], selected_tier: "auto", reasoning_level: "standard", active_attachment_ids: ["existing"] }),
    attachments: async () => [],
    uploadAttachment: file => uploads[file.name].promise,
    setActiveAttachments: async (_id, ids) => {
      saves.push([...ids]);
      if (saves.length === 1) await firstSave.promise;
      return ids;
    },
  };
  const source = readFileSync(new URL("../src/hooks/useGenAIChat.ts", import.meta.url), "utf8")
    .replace('import GenAIService from "@/services/genai.service";', 'const GenAIService = globalThis.__genaiService;')
    .replace('"@/lib/genaiAttachmentLifecycle"', JSON.stringify(new URL("../src/lib/genaiAttachmentLifecycle.ts", import.meta.url).href))
    .replace('"react"', JSON.stringify(pathToFileURL(require.resolve("react")).href));
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
  const { default: useChat } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
  let chat;
  function Harness() { chat = useChat(); return null; }
  const root = createRoot(document.getElementById("root"));
  try {
    await act(async () => { root.render(React.createElement(Harness)); });
    await act(async () => { await chat.openConversation("conversation-1"); });
    let a, b;
    await act(async () => {
      a = chat.uploadAttachment({ name: "a" });
      b = chat.uploadAttachment({ name: "b" });
      uploads.b.resolve({ id: "b", filename: "b" });
    });
    await act(async () => { uploads.a.resolve({ id: "a", filename: "a" }); });
    assert.deepEqual(chat.selectedAttachmentIds, ["existing", "b", "a"]);
    assert.equal(saves.length, 1);
    await act(async () => { firstSave.resolve(); await Promise.all([a, b]); });
    assert.deepEqual(saves.at(-1), ["existing", "b", "a"]);
    assert.deepEqual(chat.attachments.map(item => item.id), ["b", "a"]);
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
    delete globalThis.__genaiService;
    delete globalThis.window;
    delete globalThis.document;
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});
