"use client";

import { Children, isValidElement, type ComponentProps, type FormEvent, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AlertCircle, Bot, Check, Copy, ExternalLink, FileText, FolderPlus, Paperclip, Pencil,
  Plus, RotateCcw, Send, Settings2, Sparkles, Square, Trash2, User, Wrench, X,
} from "lucide-react";

import useGenAIChat from "@/hooks/useGenAIChat";
import type { Citation, ModelTier, ProjectInput, ReasoningLevel } from "@/types/genai";

function CopyButton({ text, code = false }: { text: string; code?: boolean }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);
  async function copy() {
    try { await navigator.clipboard.writeText(text); } catch { return; }
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  }
  return <button
    type="button" onClick={() => void copy()}
    className={code
      ? "absolute right-2 top-2 rounded bg-slate-800 p-1.5 text-slate-300 opacity-0 transition group-hover:opacity-100"
      : "mt-2 flex items-center gap-1 text-xs text-slate-500 opacity-0 group-hover:opacity-100"}
    title={copied ? "Copied" : code ? "Copy code" : "Copy response"}
  >{copied ? <Check size={code ? 14 : 12} /> : <Copy size={code ? 14 : 12} />}{!code && (copied ? "Copied" : "Copy")}</button>;
}


function CodePre({ children }: ComponentProps<"pre">) {
  const text = Children.toArray(children).map(child => {
    if (isValidElement<{ children?: ReactNode }>(child)) return String(child.props.children ?? "");
    return String(child);
  }).join("").replace(/\n$/, "");
  return <div className="group relative my-3 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
    <CopyButton text={text} code />
    <pre className="overflow-x-auto p-4 text-sm text-slate-200">{children}</pre>
  </div>;
}


export default function ChatWindow() {
  const chat = useGenAIChat();
  const [input, setInput] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [showProject, setShowProject] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [memoryInput, setMemoryInput] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chat.messages]);

  function submit(event?: FormEvent) {
    event?.preventDefault();
    if (!input.trim() || chat.isLoading) return;
    const value = input; setInput(""); void chat.sendMessage(value);
  }

  function inputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit(); }
  }

  function tierAvailable(tier: ModelTier) {
    if (tier === "auto") return true;
    return chat.health?.tiers.find(item => item.tier === tier)?.available ?? tier === "fast";
  }

  async function saveContext(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await chat.savePreferences({
      display_name: String(data.get("display_name") ?? ""),
      response_style: String(data.get("response_style") ?? ""),
      language: String(data.get("language") ?? ""),
      custom_preferences: chat.preferences.custom_preferences ?? {},
    });
    setShowContext(false);
  }

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const split = (name: string) => String(data.get(name) ?? "").split(",").map(item => item.trim()).filter(Boolean);
    const values: ProjectInput = {
      name: String(data.get("name") ?? "").trim(), description: String(data.get("description") ?? "").trim(),
      domain: String(data.get("domain") ?? "").trim(), tech_stack: split("tech_stack"),
      goals: split("goals"), instructions: String(data.get("instructions") ?? "").trim(),
    };
    if (!values.name) return;
    await chat.createProject(values); setShowProject(false);
  }

  return <div className="flex h-[calc(100vh-7rem)] min-h-[620px] flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 md:flex-row">
    <aside className="flex max-h-52 w-full flex-col border-b border-slate-700 bg-slate-950 p-3 md:max-h-none md:w-72 md:border-b-0 md:border-r">
      <button type="button" onClick={chat.newChat} className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 font-semibold text-white hover:bg-slate-800"><Plus size={17} /> New Chat</button>
      <div className="mt-3 flex-1 space-y-1 overflow-y-auto">
        {chat.conversations.map(conversation => <div key={conversation.id} className={`group flex items-center rounded-lg ${chat.activeConversationId === conversation.id ? "bg-slate-800" : "hover:bg-slate-900"}`}>
          <button type="button" onClick={() => void chat.openConversation(conversation.id)} className="min-w-0 flex-1 truncate px-3 py-2.5 text-left text-sm text-slate-300">{conversation.title}</button>
          <button type="button" onClick={() => { const title = window.prompt("Rename chat", conversation.title); if (title?.trim()) void chat.renameConversation(conversation.id, title.trim()); }} className="p-1.5 text-slate-500 opacity-0 group-hover:opacity-100" title="Rename"><Pencil size={13} /></button>
          <button type="button" onClick={() => { if (window.confirm("Delete this chat?")) void chat.deleteConversation(conversation.id); }} className="mr-1 p-1.5 text-slate-500 opacity-0 group-hover:text-red-300 group-hover:opacity-100" title="Delete"><Trash2 size={13} /></button>
        </div>)}
      </div>
      <button type="button" onClick={() => setShowContext(true)} className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-900 hover:text-white"><Settings2 size={16} /> Personal context</button>
      <button type="button" onClick={() => setShowTools(value => !value)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-900 hover:text-white"><Wrench size={16} /> Tools</button>
      {showTools && <div className="mt-2 max-h-44 space-y-2 overflow-y-auto rounded-lg border border-slate-800 p-2">{chat.tools.map(tool => <div key={tool.name} className="text-xs"><div className="flex items-center gap-2 text-slate-300"><span className={`h-1.5 w-1.5 rounded-full ${tool.available ? "bg-emerald-400" : "bg-slate-600"}`} />{tool.name.replaceAll("_", " ")}</div><p className="pl-3.5 text-slate-600">{tool.available ? tool.description : tool.message}</p></div>)}</div>}
    </aside>

    <main className="flex min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 px-4 py-3">
        <div><div className="flex items-center gap-2"><h1 className="font-bold text-white">GenAI Assistant</h1><span className={`h-2 w-2 rounded-full ${chat.health?.tiers.find(item => item.tier === "fast")?.available ? "bg-emerald-400" : "bg-amber-400"}`} title={chat.health?.tiers.find(item => item.tier === "fast")?.available ? "Fast model available" : "Fast model unavailable"} /></div><p className="text-xs text-slate-500">General-purpose, private conversation context</p></div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <select value={chat.activeProjectId ?? ""} onChange={event => void chat.selectProject(event.target.value || null)} className="max-w-40 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white" title="Project workspace">
              <option value="">No project</option>{chat.projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
            <button type="button" onClick={() => setShowProject(true)} className="rounded-lg border border-slate-700 p-2 text-slate-300" title="New project"><FolderPlus size={16} /></button>
            {chat.activeProjectId && <button type="button" onClick={() => { if (window.confirm("Delete this project? Chats will be kept without a project.")) void chat.deleteProject(chat.activeProjectId!); }} className="rounded-lg border border-slate-700 p-2 text-slate-500 hover:text-red-300" title="Delete project"><Trash2 size={15} /></button>}
          </div>
          <select value={chat.tier} onChange={event => chat.setTier(event.target.value as ModelTier)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white">
            <option value="auto">Auto</option>
            <option value="fast" disabled={!tierAvailable("fast")}>Fast{tierAvailable("fast") ? "" : " — unavailable"}</option>
            <option value="balanced" disabled={!tierAvailable("balanced")}>Balanced{tierAvailable("balanced") ? "" : " — unavailable"}</option>
            <option value="deep" disabled={!tierAvailable("deep")}>Deep{tierAvailable("deep") ? "" : " — unavailable"}</option>
          </select>
          <select value={chat.reasoning} onChange={event => chat.setReasoning(event.target.value as ReasoningLevel)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white">
            <option value="quick">Quick</option><option value="standard">Standard</option><option value="deep">Deep</option>
          </select>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        {chat.messages.length === 0 && <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="rounded-2xl bg-pink-500/15 p-4"><Sparkles className="text-pink-400" size={30} /></div>
          <h2 className="mt-4 text-xl font-semibold text-white">How can I help?</h2>
          <p className="mt-2 max-w-md text-sm text-slate-400">Ask about coding, learning, business, writing, science, data, AI, or anything else.</p>
        </div>}
        <div className="mx-auto max-w-4xl space-y-6">
          {chat.messages.map(message => <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.role === "user" ? "bg-blue-600" : "bg-pink-500/15"}`}>{message.role === "user" ? <User size={16} /> : <Bot className="text-pink-400" size={16} />}</div>
            <div className={`group min-w-0 max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === "user" ? "bg-blue-600 text-white" : "border border-slate-700 bg-slate-950 text-slate-200"}`}>
              {message.role === "assistant" ? <>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ pre: CodePre }}>{message.content || "…"}</ReactMarkdown>
                {message.content && <CopyButton text={message.content} />}
                {Array.isArray(message.metadata?.citations) && (message.metadata.citations as Citation[]).length > 0 && <div className="mt-3 border-t border-slate-800 pt-2"><p className="mb-1 text-xs font-semibold text-slate-500">Sources</p>{(message.metadata.citations as Citation[]).map((citation, index) => citation.url.startsWith("http") ? <a key={`${citation.url}-${index}`} href={citation.url} target="_blank" rel="noreferrer" className="mr-3 inline-flex items-center gap-1 text-xs text-blue-300 hover:underline">{citation.title || `Source ${index + 1}`}{citation.date ? ` (${citation.date})` : ""} <ExternalLink size={10} /></a> : <span key={`${citation.url}-${index}`} className="mr-3 inline-flex items-center gap-1 text-xs text-slate-400"><FileText size={10} />{citation.title}</span>)}</div>}
              </> : <p className="whitespace-pre-wrap">{message.content}</p>}
            </div>
          </div>)}
          <div ref={bottomRef} />
        </div>
      </div>

      {chat.routeInfo && <div className="border-t border-slate-800 px-5 py-2 text-xs text-slate-500">{chat.routeInfo}</div>}
      {chat.toolActivity && <div className="border-t border-slate-800 px-5 py-2 text-xs text-slate-400"><Wrench className="mr-1 inline" size={12} />{chat.toolActivity}</div>}
      {chat.pendingResolution && <div className="border-t border-blue-500/20 bg-blue-500/10 px-5 py-3 text-sm text-blue-100">
        {chat.pendingResolution.candidates.length > 0 ? <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1">{chat.pendingResolution.candidates.some(candidate => candidate.attachment_id)
            ? "Choose an image:"
            : chat.pendingResolution.action === "predict" ? "Choose a trained model:" : "Choose a resource:"}</span>
          {chat.pendingResolution.candidates.map((candidate, index) => {
            const label = String(candidate.name ?? candidate.model_type ?? candidate.filename ?? `Model ${index + 1}`);
            return <button key={`${label}-${index}`} type="button" onClick={() => void chat.choosePredictionResource(candidate)} className="rounded border border-blue-300/40 px-3 py-1.5 hover:bg-blue-400/10">{label}</button>;
          })}
          <button type="button" onClick={chat.dismissResolution} className="ml-auto text-blue-200/70">Cancel</button>
        </div> : <div className="flex items-center gap-2"><span className="flex-1">Provide: {chat.pendingResolution.missingFields.join(", ")}</span><button type="button" onClick={chat.dismissResolution} className="text-blue-200/70">Cancel</button></div>}
      </div>}
      {chat.pendingConfirmation && <div className="flex items-center gap-3 border-t border-amber-500/20 bg-amber-500/10 px-5 py-3 text-sm text-amber-100"><AlertCircle size={16} /><span className="flex-1">{chat.pendingConfirmation.message}</span><button type="button" onClick={() => void chat.confirmTool()} className="rounded bg-amber-500 px-3 py-1.5 font-semibold text-slate-950">Confirm</button><button type="button" onClick={chat.dismissConfirmation} className="rounded border border-amber-400/40 px-3 py-1.5">Cancel</button></div>}
      {chat.error && <div className="border-t border-red-500/20 bg-red-500/10 px-5 py-2 text-sm text-red-300">{chat.error}</div>}
      <div className="border-t border-slate-700 p-4">
        {chat.attachments.length > 0 && <div className="mx-auto mb-2 flex max-w-4xl flex-wrap gap-2">{chat.attachments.map(file => {
          const selected = chat.selectedAttachmentIds.includes(file.id);
          return <span key={file.id} className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${selected ? "border-pink-500 bg-pink-500/10 text-pink-100" : "border-slate-700 bg-slate-950 text-slate-400"}`}>
            <button type="button" onClick={() => chat.toggleAttachment(file.id)} className="inline-flex items-center gap-1" title={selected ? "Selected for the next message" : "Select for the next message"}><FileText size={12} />{file.filename}{selected && <Check size={11} />}</button>
            <button type="button" onClick={() => void chat.deleteAttachment(file.id)} className="ml-1 text-slate-500 hover:text-red-300" title="Delete attachment"><X size={12} /></button>
          </span>;
        })}</div>}
        <form onSubmit={submit} className="mx-auto flex max-w-4xl items-end gap-2 rounded-2xl border border-slate-700 bg-slate-950 p-2 focus-within:border-pink-500">
          <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.txt,.csv,.xlsx,.py,.sql,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff" className="hidden" onChange={event => { Array.from(event.target.files ?? []).forEach(file => void chat.uploadAttachment(file)); event.currentTarget.value = ""; }} />
          <button type="button" onClick={() => fileRef.current?.click()} className="rounded-xl p-3 text-slate-400 hover:bg-slate-800 hover:text-white" title="Attach a document, dataset, source file, or image"><Paperclip size={16} /></button>
          <textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={inputKeyDown} rows={1} placeholder="Message the assistant" className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-white outline-none" />
          {chat.isLoading ? <button type="button" onClick={() => void chat.stopGeneration()} className="rounded-xl bg-slate-700 p-3 text-white" title="Stop generation"><Square size={16} /></button> : <button type="submit" disabled={!input.trim()} className="rounded-xl bg-pink-600 p-3 text-white disabled:opacity-40" title="Send"><Send size={16} /></button>}
        </form>
        <div className="mx-auto mt-2 flex max-w-4xl justify-between text-xs text-slate-600"><span>Enter to send · Shift+Enter for a new line</span>{chat.messages.some(message => message.role === "assistant") && !chat.isLoading && <button type="button" onClick={() => void chat.regenerate()} className="flex items-center gap-1 hover:text-slate-300"><RotateCcw size={12} /> Regenerate</button>}</div>
      </div>
    </main>

    {showContext && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <div className="flex justify-between"><div><h2 className="text-xl font-bold text-white">Personal context</h2><p className="mt-1 text-sm text-slate-400">Saved context is retrieved only when relevant.</p></div><button type="button" onClick={() => setShowContext(false)} className="text-slate-400"><X /></button></div>
        <form onSubmit={saveContext} className="mt-5 grid gap-3">
          <input name="display_name" defaultValue={chat.preferences.display_name ?? ""} placeholder="Preferred name" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
          <input name="language" defaultValue={chat.preferences.language ?? ""} placeholder="Preferred language" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
          <input name="response_style" defaultValue={chat.preferences.response_style ?? ""} placeholder="Response style, e.g. concise" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
          <button className="rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white">Save preferences</button>
        </form>
        <div className="mt-6 border-t border-slate-700 pt-5"><h3 className="font-semibold text-white">Useful memories</h3>
          <div className="mt-3 flex gap-2"><input value={memoryInput} onChange={event => setMemoryInput(event.target.value)} placeholder="Something useful to remember" className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /><button type="button" onClick={() => { if (memoryInput.trim()) { void chat.addMemory(memoryInput.trim()); setMemoryInput(""); } }} className="rounded-lg border border-pink-500 px-3 text-pink-200">Add</button></div>
          <div className="mt-3 space-y-2">{chat.memories.map(memory => <div key={memory.id} className="flex gap-2 rounded-lg bg-slate-950 p-3 text-sm text-slate-300"><span className="flex-1">{memory.content}</span><button type="button" onClick={() => void chat.deleteMemory(memory.id)} className="text-slate-500 hover:text-red-300"><Trash2 size={14} /></button></div>)}</div>
        </div>
      </div>
    </div>}
    {showProject && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"><div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6"><div className="flex justify-between"><div><h2 className="text-xl font-bold text-white">New project</h2><p className="mt-1 text-sm text-slate-400">Give related chats shared, owner-only context.</p></div><button type="button" onClick={() => setShowProject(false)} className="text-slate-400"><X /></button></div><form onSubmit={createProject} className="mt-5 grid gap-3"><input name="name" required placeholder="Project name" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /><input name="domain" placeholder="Domain" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /><textarea name="description" placeholder="Description" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /><input name="tech_stack" placeholder="Tech stack, comma separated" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /><input name="goals" placeholder="Goals, comma separated" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /><textarea name="instructions" placeholder="Project instructions" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /><button className="rounded-lg bg-pink-600 px-4 py-2 font-semibold text-white">Create project</button></form></div></div>}
  </div>;
}
