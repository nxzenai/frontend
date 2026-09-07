import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { JSDOM } from "jsdom";

import {
  addComposerAttachment,
  attachmentIdsForMessage,
  preserveComposerAttachmentIds,
  removeComposerAttachment,
  restoreConversationAttachmentIds,
} from "../src/lib/genaiAttachmentLifecycle.ts";

const source = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

class ComposerLifecycle {
  constructor() {
    this.ids = [];
  }

  attach(id) {
    this.ids = addComposerAttachment(this.ids, id);
  }

  send(message) {
    return { message, attachment_ids: attachmentIdsForMessage(this.ids) };
  }

  assistantCompleted() {
    this.ids = preserveComposerAttachmentIds(this.ids);
  }

  cancelCompleted() {
    this.ids = preserveComposerAttachmentIds(this.ids);
  }

  nativeValidationFailed() {
    this.ids = preserveComposerAttachmentIds(this.ids);
  }

  refreshSameConversation(conversation) {
    this.ids = restoreConversationAttachmentIds(conversation.active_attachment_ids);
  }

  remove(id) {
    this.ids = removeComposerAttachment(this.ids, id);
  }

  newConversation() {
    this.ids = [];
  }

  visibleChips(attachments) {
    return attachments.filter(item => this.ids.includes(item.id));
  }
}

test("current GenAI attachment survives send, replies, cancel, errors, and same-chat refresh", () => {
  const hook = source("src/hooks/useGenAIChat.ts");
  const window = source("src/components/genai/ChatWindow.tsx");
  assert.match(hook, /attachmentIdsForMessage\([\s\S]*resolved\?\.attachmentIds \?\? selectedAttachmentIds/);
  assert.match(hook, /restoreConversationAttachmentIds\(conversation\.active_attachment_ids\)/);
  assert.match(hook, /setSelectedAttachmentIds\(current => preserveComposerAttachmentIds\(current\)\)/);
  assert.match(window, /attachments\.filter\(file => chat\.selectedAttachmentIds\.includes\(file\.id\)\)/);
  assert.match(window, /data-attachment-ready[\s\S]{0,180}Upload complete \/ ready/);
  assert.doesNotMatch(window, /chat\.toggleAttachment\(file\.id\)/);

  const attachment = { id: "attachment-1", filename: "Bengaluru_House_Data.csv" };
  const lifecycle = new ComposerLifecycle();
  lifecycle.attach(attachment.id);
  assert.deepEqual(lifecycle.visibleChips([attachment]), [attachment]);
  const readyDom = new JSDOM('<span data-attachment-ready>✓</span>');
  readyDom.window.document.querySelector("[data-attachment-ready]").click();
  assert.deepEqual(lifecycle.ids, [attachment.id]);
  assert.deepEqual(lifecycle.send("Train this dataset.").attachment_ids, [attachment.id]);

  lifecycle.assistantCompleted();
  assert.deepEqual(lifecycle.ids, [attachment.id]);
  lifecycle.cancelCompleted();
  assert.deepEqual(lifecycle.send("Train this dataset!").attachment_ids, [attachment.id]);
  lifecycle.nativeValidationFailed();
  assert.deepEqual(lifecycle.send("Train this.").attachment_ids, [attachment.id]);

  lifecycle.refreshSameConversation({ active_attachment_ids: [attachment.id] });
  assert.deepEqual(lifecycle.visibleChips([attachment]), [attachment]);
  assert.deepEqual(lifecycle.send("Train this dataset").attachment_ids, [attachment.id]);
});

test("explicit removal and new conversation clear the current attachment", () => {
  const window = source("src/components/genai/ChatWindow.tsx");
  assert.match(window, /onClick=\{\(\) => void chat\.deleteAttachment\(file\.id\)\}/);
  assert.match(window, /title="Remove attachment"/);
  const attachment = { id: "attachment-1", filename: "dataset.csv" };
  const lifecycle = new ComposerLifecycle();
  lifecycle.attach(attachment.id);
  const removeDom = new JSDOM('<button data-remove-attachment>×</button>');
  removeDom.window.document.querySelector("[data-remove-attachment]").addEventListener(
    "click", () => lifecycle.remove(attachment.id),
  );
  removeDom.window.document.querySelector("[data-remove-attachment]").click();
  assert.deepEqual(lifecycle.visibleChips([attachment]), []);
  assert.deepEqual(lifecycle.send("Train this dataset").attachment_ids, []);

  lifecycle.attach(attachment.id);
  lifecycle.newConversation();
  assert.deepEqual(lifecycle.ids, []);
  assert.deepEqual(lifecycle.send("Train this dataset").attachment_ids, []);
});

test("native Dataset Preview remains visibly rendered", () => {
  const preview = [
    "Dataset Preview", "Rows: 3", "Columns: 2", "age (int64)",
    "Missing values: 0", "First rows: [{age: 20}]", "Basic observations",
    "Supported compatible tasks: classification",
    "What would you like to train this dataset for?",
  ].join("\n");
  const dom = new JSDOM('<main><article data-role="assistant"></article></main>');
  dom.window.document.querySelector("article").textContent = preview;
  const visible = dom.window.document.querySelector("article").textContent;
  assert.match(visible, /Dataset Preview/);
  assert.ok(visible.indexOf("Dataset Preview") < visible.indexOf("What would you like"));
});

test("sanitized native done SSE event parses and renders JSON null values", () => {
  const payload = JSON.stringify({
    type: "done",
    status: "completed",
    message: {
      id: "assistant-1", role: "assistant",
      content: "Dataset Preview\n\nFirst rows: [{society: null, bath: 2}]\n\nWhat would you like to train this dataset for?",
      metadata: { inspection: { sample_rows: [{ society: null, bath: 2 }] } },
      created_at: "2026-09-07T00:00:00Z",
    },
  });
  let invalid = false;
  let event;
  try {
    event = JSON.parse(payload);
  } catch {
    invalid = true;
  }
  assert.equal(invalid, false);
  assert.equal(event.message.metadata.inspection.sample_rows[0].society, null);
  const dom = new JSDOM('<article data-role="assistant"></article>');
  dom.window.document.querySelector("article").textContent = event.message.content;
  const visible = dom.window.document.querySelector("article").textContent;
  assert.match(visible, /Dataset Preview/);
  assert.match(visible, /What would you like to train this dataset for\?/);
});
