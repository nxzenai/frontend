"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import genai from "@/services/genai.service";
import PromptLearning from "@/components/genai/PromptLearning";
import type { GenAIHealth, Project, ProjectDocument, PromptRun, PromptTemplate, PromptVersion, TierStatus } from "@/types/genai";

const inputClass = "w-full rounded border border-slate-700 bg-slate-950 p-2 text-sm text-white";
const buttonClass = "rounded border border-slate-600 px-3 py-2 text-sm text-slate-200 disabled:opacity-40";
const message = (error: unknown) => error instanceof Error ? error.message : "The request could not be completed.";
const tokens = (value: number | null | undefined) => value == null ? "Unavailable" : String(value);
const friendly = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
const when = (value: string) => new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

function PromptOutput({ content }: { content: string }) {
  return <div className="min-w-0 break-words leading-normal">
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={{
      h1: ({ children }) => <h1 className="my-2 text-xl font-bold">{children}</h1>,
      h2: ({ children }) => <h2 className="my-2 text-lg font-semibold">{children}</h2>,
      h3: ({ children }) => <h3 className="my-1 font-semibold">{children}</h3>,
      h4: ({ children }) => <h4 className="my-1 font-semibold">{children}</h4>,
      p: ({ children }) => <p className="my-1.5 whitespace-pre-line">{children}</p>,
      ul: ({ children }) => <ul className="my-1.5 list-disc space-y-1 pl-5">{children}</ul>,
      ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-1 pl-5">{children}</ol>,
      li: ({ children }) => <li className="my-0.5 pl-0.5 [&>p]:my-0 [&>ul]:my-1 [&>ol]:my-1 [&>h1]:my-1 [&>h2]:my-1 [&>h3]:my-1 [&>h4]:my-1">{children}</li>,
      strong: ({ children }) => <strong className="font-semibold text-slate-100">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      blockquote: ({ children }) => <blockquote className="my-2 border-l-2 border-slate-600 pl-3 text-slate-300">{children}</blockquote>,
      table: ({ children }) => <table className="my-2 w-full border-collapse text-left text-sm">{children}</table>,
      th: ({ children }) => <th className="border border-slate-600 bg-slate-800 p-2">{children}</th>,
      td: ({ children }) => <td className="border border-slate-700 p-2">{typeof children === "string"
        ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({ children: inline }) => <>{inline}</> }}>{children}</ReactMarkdown>
        : children}</td>,
      pre: ({ children }) => <pre className="my-2 overflow-x-auto whitespace-pre rounded bg-slate-900 p-3">{children}</pre>,
      code: ({ children, className }) => <code className={`${className ?? ""} rounded bg-slate-800 px-1 font-mono text-xs`}>{children}</code>,
    }}>{content || "No output returned."}</ReactMarkdown>
  </div>;
}

const starters = [
  { name: "Explain a Topic", purpose: "Make a subject easier to understand.", system: "You are a helpful expert tutor. Explain concepts clearly.", user: "Explain {{topic}} for a {{audience}}. Include one example and three key takeaways." },
  { name: "Summarize Documents", purpose: "Pull out findings and conclusions.", system: "You are a concise research assistant. Use the selected documents as evidence.", user: "Summarize the selected documents with key findings, important numbers, and conclusions." },
  { name: "Compare Documents", purpose: "See similarities and differences.", system: "You are an analytical research assistant. Compare only the selected documents.", user: "Compare the selected documents across purpose, methodology, findings, limitations, and key differences." },
  { name: "Research Assistant", purpose: "Explore a topic using project sources.", system: "You are an academic research assistant. Use selected documents as evidence.", user: "Analyze {{research_topic}} using the selected documents. Return key findings, methods, limitations, and open questions." },
  { name: "Resume Analyzer", purpose: "Review a candidate for a role.", system: "You are a recruiter evaluating candidates objectively.", user: "Analyze {{candidate_name}} against {{job_role}}. Return strengths, gaps, relevant experience, and five interview questions." },
  { name: "Interview Question Generator", purpose: "Prepare focused interview questions.", system: "You are an interview coach. Write clear, fair questions.", user: "Create interview questions for {{job_role}}. Cover practical skills, experience, and follow-up probes." },
  { name: "Extract Key Facts", purpose: "Find important facts in your sources.", system: "You extract structured facts from source material.", user: "Extract the most important facts about {{topic}} from the selected documents." },
  { name: "Business Writer", purpose: "Draft a clear business message.", system: "You write clear, concise business communication.", user: "Write a {{document_type}} about {{topic}} for {{audience}}." },
  { name: "Code Reviewer", purpose: "Get feedback on a code sample.", system: "You review code for correctness, clarity, and maintainability.", user: "Review this code and suggest concrete improvements:\n{{code}}" },
  { name: "Custom Prompt", purpose: "Start with a blank prompt.", system: "", user: "" },
] as const;

export default function GenAIExtras({ mode }: { mode: "documents" | "prompts" }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { void genai.projects().then(setProjects).catch(reason => setError(message(reason))); }, []);
  return <div className="min-h-[620px] rounded-2xl border border-slate-700 bg-slate-900 p-5 text-slate-100">
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <h2 className="text-xl font-semibold">{mode === "documents" ? "Project Documents" : "Prompt Lab"}</h2>
      <select className="rounded border border-slate-700 bg-slate-950 p-2 text-sm" value={projectId ?? ""} onChange={event => setProjectId(event.target.value || null)}>
        <option value="">{mode === "documents" ? "Choose a project" : "Personal prompts"}</option>
        {projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
      </select>
    </div>
    {error && <p className="mb-4 text-sm text-red-300">{error}</p>}
    {mode === "documents" ? projectId ? <Documents key={projectId} projectId={projectId} /> : <p>Select or create a project in Chat to manage its documents.</p> : <Prompts projectId={projectId} projectName={projects.find(project => project.id === projectId)?.name ?? "Project"} />}
  </div>;
}

function Documents({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ProjectDocument[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { void genai.projectDocuments(projectId).then(setItems).catch(reason => setError(message(reason))); }, [projectId]);
  async function select(ids: string[]) {
    setBusy(true); setError("");
    try { await genai.selectProjectDocuments(projectId, ids); setItems(old => old.map(item => ({ ...item, selected: ids.includes(item.id) }))); }
    catch (reason) { setError(message(reason)); } finally { setBusy(false); }
  }
  async function upload(files: FileList | null) {
    if (!files) return;
    setBusy(true); setError("");
    try { for (const file of Array.from(files)) await genai.uploadProjectDocument(projectId, file); setItems(await genai.projectDocuments(projectId)); }
    catch (reason) { setError(message(reason)); setItems(await genai.projectDocuments(projectId).catch(() => items)); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    setBusy(true); setError("");
    try { await genai.removeProjectDocument(projectId, id); setItems(old => old.filter(item => item.id !== id)); }
    catch (reason) { setError(message(reason)); } finally { setBusy(false); }
  }
  const selected = items.filter(item => item.selected).map(item => item.id);
  return <div className="space-y-4">
    <p className="text-sm text-slate-400">Selected documents are searchable across conversations in this project. Upload PDF, DOCX, TXT, CSV, or XLSX.</p>
    <div className="flex flex-wrap gap-2">
      <label className={buttonClass}>Upload<input type="file" multiple accept=".pdf,.docx,.txt,.csv,.xlsx" disabled={busy} className="hidden" onChange={event => { void upload(event.target.files); event.currentTarget.value = ""; }} /></label>
      <button className={buttonClass} disabled={busy || !items.length} onClick={() => void select(items.map(item => item.id))}>Select all</button>
      <button className={buttonClass} disabled={busy || !selected.length} onClick={() => void select([])}>Deselect all</button>
    </div>
    {error && <p className="text-sm text-red-300">{error}</p>}
    {!items.length ? <p className="text-sm text-slate-500">No project documents yet.</p> : items.map(item => <div key={item.id} className="flex items-center gap-3 rounded border border-slate-700 p-3 text-sm">
      <input type="checkbox" checked={item.selected} disabled={busy} onChange={() => void select(item.selected ? selected.filter(id => id !== item.id) : [...selected, item.id])} />
      <span className="min-w-0 flex-1 truncate">{item.filename}</span><span className="text-slate-400">{item.content_type.split("/").at(-1)} · {item.status}</span>
      <button className="text-red-300" disabled={busy} onClick={() => void remove(item.id)}>Remove</button>
    </div>)}
  </div>;
}

function Prompts({ projectId, projectName }: { projectId: string | null; projectName: string }) {
  const knowledgeSection = useRef<HTMLElement>(null);
  const [view, setView] = useState<"learn" | "practice" | "templates" | "playground" | "history">("learn");
  const [learningExerciseId, setLearningExerciseId] = useState<string | undefined>();
  const [simple, setSimple] = useState(true);
  const [advancedModelsOpen, setAdvancedModelsOpen] = useState(false);
  const [tiers, setTiers] = useState<TierStatus[]>([]);
  const [openedRun, setOpenedRun] = useState<PromptRun | null>(null);
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [models, setModels] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [useKnowledge, setUseKnowledge] = useState(false);
  const [documents, setDocuments] = useState<ProjectDocument[]>([]);
  const [documentIds, setDocumentIds] = useState<string[]>([]);
  const [runs, setRuns] = useState<PromptRun[]>([]);
  const [latest, setLatest] = useState<PromptRun[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [temperature, setTemperature] = useState("");
  const [maxTokens, setMaxTokens] = useState("");
  const [reasoning, setReasoning] = useState<"quick" | "standard" | "deep">("standard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const foundVariables = useMemo(() => Array.from(new Set(Array.from((systemPrompt + "\n" + userPrompt).matchAll(/{{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*}}/g), match => match[1]))), [systemPrompt, userPrompt]);
  const missingVariables = foundVariables.filter(key => !values[key]?.trim());
  const savedTemplate = templates.find(item => item.id === selectedId);
  const hasUnsavedChanges = Boolean(savedTemplate && (savedTemplate.name !== name || savedTemplate.system_prompt !== systemPrompt || savedTemplate.user_prompt !== userPrompt));
  function runKnowledgeNames(item: PromptRun) {
    const ids = [...new Set(item.knowledge_document_ids ?? [])];
    // Use saved selection first; validated source metadata fills gaps in older run records.
    for (const citation of item.citations ?? []) if (citation.document_id && !ids.includes(citation.document_id)) ids.push(citation.document_id);
    return ids.map(id => documents.find(document => document.id === id)?.filename ?? item.citations?.find(citation => citation.document_id === id)?.filename ?? id);
  }
  function reviewKnowledge() {
    setView("playground");
    window.requestAnimationFrame(() => knowledgeSection.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }
  useEffect(() => {
    setSelectedId(null); setName(""); setSystemPrompt(""); setUserPrompt(""); setValues({}); setRuns([]); setLatest([]); setVersions([]); setUseKnowledge(false); setView("learn"); setOpenedRun(null);
    void genai.promptTemplates(projectId).then(setTemplates).catch(reason => setError(message(reason)));
    if (projectId) void genai.projectDocuments(projectId).then(items => {
      const selected = items.filter(item => item.selected); setDocuments(selected); setDocumentIds(selected.map(item => item.id));
    }).catch(reason => setError(message(reason)));
    else { setDocuments([]); setDocumentIds([]); }
  }, [projectId]);
  useEffect(() => { void genai.health().then((health: GenAIHealth) => {
    setTiers(health.tiers.filter(tier => tier.configured && tier.available));
    const names = [...new Set(health.tiers.filter(tier => tier.configured && tier.available).map(tier => tier.model_name))];
    const balanced = health.tiers.find(tier => tier.tier === "balanced" && tier.configured && tier.available)?.model_name;
    setAvailable(names); setModels(current => current.length ? current.filter(item => names.includes(item)) : balanced ? [balanced] : names.slice(0, 1));
  }).catch(reason => setError(message(reason))); }, []);
  function choose(item: PromptTemplate) {
    setSelectedId(item.id); setName(item.name); setSystemPrompt(item.system_prompt); setUserPrompt(item.user_prompt);
    const balanced = tiers.find(tier => tier.tier === "balanced")?.model_name;
    setValues({}); setCompare([]); setLatest([]); setOpenedRun(null); setView("playground"); setModels(item.default_model && available.includes(item.default_model) ? [item.default_model] : balanced ? [balanced] : available.slice(0, 1));
    void Promise.all([genai.promptRuns(item.id), genai.promptVersions(item.id)]).then(([history, revisions]) => { setRuns(history); setVersions(revisions); }).catch(reason => setError(message(reason)));
  }
  function startNew() { setSelectedId(null); setName(""); setSystemPrompt(""); setUserPrompt(""); setValues({}); setRuns([]); setLatest([]); setVersions([]); setCompare([]); setOpenedRun(null); setUseKnowledge(false); setView("playground"); }
  function useStarter(starter: typeof starters[number]) {
    startNew(); setName(starter.name === "Custom Prompt" ? "" : starter.name); setSystemPrompt(starter.system); setUserPrompt(starter.user);
    if (projectId && ["Summarize Documents", "Compare Documents", "Research Assistant", "Extract Key Facts"].includes(starter.name)) setUseKnowledge(true);
  }
  function chooseTier(tier: TierStatus) { setModels([tier.model_name]); setAdvancedModelsOpen(false); }
  async function save() {
    if (!name.trim() || !userPrompt.trim()) return;
    setBusy(true); setError("");
    const data = { name: name.trim(), system_prompt: systemPrompt, user_prompt: userPrompt, default_model: models[0] ?? "", project_id: projectId };
    try { const item = selectedId ? await genai.updatePromptTemplate(selectedId, data) : await genai.createPromptTemplate(data); setTemplates(await genai.promptTemplates(projectId)); choose(item); }
    catch (reason) { setError(message(reason)); } finally { setBusy(false); }
  }
  async function restore(version: PromptVersion) {
    if (!selectedId || hasUnsavedChanges) return;
    setBusy(true); setError("");
    try { const item = await genai.restorePromptVersion(selectedId, version.id); setTemplates(await genai.promptTemplates(projectId)); choose(item); }
    catch (reason) { setError(message(reason)); } finally { setBusy(false); }
  }
  async function duplicate() { if (!selectedId) return; try { const item = await genai.duplicatePromptTemplate(selectedId); setTemplates(await genai.promptTemplates(projectId)); choose(item); } catch (reason) { setError(message(reason)); } }
  async function remove() { if (!selectedId) return; try { await genai.deletePromptTemplate(selectedId); setTemplates(old => old.filter(item => item.id !== selectedId)); startNew(); } catch (reason) { setError(message(reason)); } }
  async function duplicateTemplate(item: PromptTemplate) {
    try { const copy = await genai.duplicatePromptTemplate(item.id); setTemplates(await genai.promptTemplates(projectId)); choose(copy); }
    catch (reason) { setError(message(reason)); }
  }
  async function deleteTemplate(item: PromptTemplate) {
    try { await genai.deletePromptTemplate(item.id); setTemplates(old => old.filter(value => value.id !== item.id)); if (selectedId === item.id) startNew(); }
    catch (reason) { setError(message(reason)); }
  }
  async function run() {
    if (!selectedId || !models.length || missingVariables.length) return;
    const selectedTemperature = temperature.trim() ? Number(temperature) : null;
    const selectedMaxTokens = maxTokens.trim() ? Number(maxTokens) : null;
    if ((selectedTemperature !== null && (!Number.isFinite(selectedTemperature) || selectedTemperature < 0 || selectedTemperature > 2))
        || (selectedMaxTokens !== null && (!Number.isInteger(selectedMaxTokens) || selectedMaxTokens < 64))) {
      setError("Enter a temperature from 0 to 2 and at least 64 whole-number output tokens."); return;
    }
    setBusy(true); setError("");
    try {
      const results = await genai.runPrompt(selectedId, Object.fromEntries(foundVariables.map(key => [key, values[key]])), models, useKnowledge,
        { document_ids: useKnowledge ? documentIds : [], temperature: selectedTemperature, max_tokens: selectedMaxTokens, reasoning });
      setLatest(results); setRuns(await genai.promptRuns(selectedId));
    } catch (reason) { setError(message(reason)); } finally { setBusy(false); }
  }
  function exportRun(item: PromptRun) {
    const settings = item.generation_settings ?? {};
    const knowledgeNames = runKnowledgeNames(item);
    const content = ["# Prompt Run", `Template: ${savedTemplate?.name ?? item.template_id}`, `Version: ${item.version_number ?? "Unavailable"}`,
      `Model: ${item.model}`, `Status: ${item.status}`, `Timestamp: ${item.created_at}`,
      `Generation settings: ${JSON.stringify(settings)}`, `Variables: ${JSON.stringify(item.variable_values ?? {})}`,
      `Latency: ${item.latency_ms} ms`, `Input tokens: ${tokens(item.input_tokens)}`, `Output tokens: ${tokens(item.output_tokens)}`,
      `Total tokens: ${tokens(item.total_tokens)}`, `Knowledge documents: ${knowledgeNames.join(", ") || "None"}`,
      "## System Prompt", item.resolved_system_prompt ?? "", "## User Prompt", item.resolved_user_prompt ?? "",
      "## Output", item.output, "## Sources", ...(item.citations ?? []).map(citation => `- ${citation.title}`)].join("\n\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = `prompt-run-${item.id}.md`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function renderRun(item: PromptRun, selectable: boolean) {
    const settings = item.generation_settings;
    const knowledgeNames = runKnowledgeNames(item);
    const tier = settings?.tier ?? tiers.find(value => value.model_name === item.model)?.tier;
    return <article key={item.id} className="rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        {selectable && <input type="checkbox" aria-label={`Compare run ${item.id}`} checked={compare.includes(item.id)} onChange={() => setCompare(old => old.includes(item.id) ? old.filter(id => id !== item.id) : old.length < 2 ? [...old, item.id] : old)} />}
        <strong>{tier ? friendly(tier) : item.model}</strong><span className="text-slate-400">{item.status === "completed" ? "Completed" : friendly(item.status)}</span>
        <span className="text-slate-400">Version {item.version_number ?? versions.find(version => version.id === item.version_id)?.version_number ?? "Unavailable"}</span>
        <button className={`${buttonClass} ml-auto py-1`} onClick={() => exportRun(item)}>Export</button>
      </div>
      {!simple && <p className="mt-1 text-xs text-slate-400">{item.model}</p>}
      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Output</p>
      {item.status === "insufficient_evidence" ? <div className="mt-2 rounded-lg border border-amber-700/50 bg-amber-950/30 p-3">
        <strong>Insufficient evidence</strong><p className="mt-1">I couldn&apos;t find enough information in the selected documents for this prompt.</p>
        <p className="mt-1 text-slate-300">Check that all required source documents are selected, then try again.</p>
        <button className={`${buttonClass} mt-3 py-1`} onClick={reviewKnowledge}>Review selected documents</button>
      </div> : <PromptOutput content={item.output} />}
      {item.status !== "insufficient_evidence" && Boolean(item.citations?.length) && <div className="mt-3 text-xs text-slate-300"><strong>Sources</strong>{item.citations?.map((citation, index) => <div key={`${citation.url}-${index}`}>{citation.title}</div>)}</div>}
      <details className="mt-3 border-t border-slate-700 pt-2 text-xs text-slate-400"><summary className="cursor-pointer">Run details</summary>
        <div className="mt-2 space-y-1"><p>Model: {item.model}</p><p>{when(item.created_at)} · {item.latency_ms} ms</p><p>Input tokens: {tokens(item.input_tokens)} · Output tokens: {tokens(item.output_tokens)} · Total tokens: {tokens(item.total_tokens)}</p>
          <p>Temperature: {settings?.temperature ?? "Unavailable"} · Max tokens: {settings?.max_tokens ?? "Unavailable"} · Reasoning: {settings?.reasoning ?? "Unavailable"} · Tier: {tier ?? "Unavailable"}</p>
          <p>Knowledge documents: {knowledgeNames.length ? knowledgeNames.join(", ") : "None"}</p></div>
      </details>
    </article>;
  }
  const compared = compare.map(id => runs.find(item => item.id === id)).filter((item): item is PromptRun => Boolean(item));
  const groupedRuns = Array.from(runs.reduce((groups, item) => {
    const key = item.comparison_run_id ?? item.id;
    groups.set(key, [...(groups.get(key) ?? []), item]); return groups;
  }, new Map<string, PromptRun[]>()).values());
  const runBlocker = !selectedId ? "Save this prompt before running it." : hasUnsavedChanges ? "Save your changes before running this prompt." :
    missingVariables.length ? `Enter a value for ${friendly(missingVariables[0])} to run this prompt.` : !models.length ? "Choose a model to run this prompt." : "";
  return <div className="space-y-5">
    <nav className="flex flex-wrap gap-2 border-b border-slate-700 pb-3" aria-label="Prompt Lab views">
      {(["learn", "practice", "playground", "history"] as const).map(tab => <button key={tab} className={`${buttonClass} ${view === tab ? "border-blue-500 bg-blue-600 text-white" : ""}`} onClick={() => setView(tab)}>{friendly(tab)}</button>)}
    </nav>
    {error && <p className="rounded border border-red-700 bg-red-950/30 p-3 text-sm text-red-200">{error}</p>}

    {(view === "learn" || view === "practice") && <PromptLearning mode={view} projectId={projectId} documents={documents} tiers={tiers} exerciseId={learningExerciseId} onStart={id => { setLearningExerciseId(id); setView("practice"); }} />}

    {view === "templates" && <div className="space-y-6">
      <section><h3 className="text-lg font-semibold">Starter Templates</h3><p className="mb-3 text-sm text-slate-400">Pick a starting point. Nothing is saved until you choose Save Prompt.</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{starters.map(starter => <article key={starter.name} className="flex flex-col rounded-xl border border-slate-700 bg-slate-950/60 p-4">
          <h4 className="font-semibold">{starter.name}</h4><p className="mt-1 flex-1 text-sm text-slate-400">{starter.purpose}</p>
          <button className={`${buttonClass} mt-4 self-start`} onClick={() => useStarter(starter)}>Use Template</button>
        </article>)}</div>
      </section>
      <section><h3 className="text-lg font-semibold">My Templates</h3>
        {!templates.length ? <p className="mt-2 text-sm text-slate-400">No saved prompts yet. Start with a template or create your own.</p> :
          <div className="mt-3 grid gap-2 sm:grid-cols-2">{templates.map(item => <div key={item.id} className="rounded-xl border border-slate-700 p-3">
            <div className="font-medium">{item.name}</div><div className="text-xs text-slate-400">Version {item.version_number} · Updated {when(item.updated_at)}</div>
            <div className="mt-3 flex flex-wrap gap-2"><button className={buttonClass} onClick={() => choose(item)}>Open</button>
              <button className={buttonClass} onClick={() => void duplicateTemplate(item)}>Duplicate</button>
              <button className={buttonClass} onClick={() => void deleteTemplate(item)}>Delete</button></div>
          </div>)}</div>}
      </section>
    </div>}

    {view === "playground" && <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-semibold">Playground</h3><p className="text-sm text-slate-400">Describe the task, fill in any fields, then run your prompt.</p></div>
        <div className="flex gap-2"><button className={buttonClass} onClick={() => setView("templates")}>Browse templates</button><button className={buttonClass} onClick={startNew}>New prompt</button></div>
      </div>
      <div className="flex gap-2" role="group" aria-label="Editor mode"><button className={`${buttonClass} ${simple ? "bg-blue-600 text-white" : ""}`} onClick={() => setSimple(true)}>Simple</button><button className={`${buttonClass} ${!simple ? "bg-blue-600 text-white" : ""}`} onClick={() => setSimple(false)}>Advanced</button></div>
      <section className="space-y-3 rounded-xl border border-slate-700 p-4"><h4 className="font-semibold">Your Prompt</h4>
        <label className="block text-sm">Prompt name<input className={`${inputClass} mt-1`} placeholder="Give this prompt a name" value={name} onChange={event => setName(event.target.value)} /></label>
        {!simple && <label className="block text-sm">System prompt<textarea className={`${inputClass} mt-1 min-h-24`} value={systemPrompt} onChange={event => setSystemPrompt(event.target.value)} /></label>}
        <label className="block text-sm">{simple ? "What do you want the AI to do?" : "User prompt"}<textarea className={`${inputClass} mt-1 min-h-32`} value={userPrompt} onChange={event => setUserPrompt(event.target.value)} placeholder="Describe the task. You can use {{topic}} as a fill-in field." /></label>
        <div className="flex flex-wrap gap-2"><button className={buttonClass} disabled={busy || !name.trim() || !userPrompt.trim()} onClick={() => void save()}>{selectedId ? "Save Changes" : "Save Prompt"}</button>
          {selectedId && <><button className={buttonClass} onClick={() => void duplicate()}>Duplicate</button><button className={buttonClass} onClick={() => void remove()}>Delete</button></>}</div>
      </section>
      {foundVariables.length > 0 && <section className="space-y-2 rounded-xl border border-slate-700 p-4"><h4 className="font-semibold">Fill in the details</h4>
        <div className="grid gap-3 sm:grid-cols-2">{foundVariables.map(key => <label key={key} className="block text-sm">{friendly(key)}<input className={`${inputClass} mt-1`} value={values[key] ?? ""} onChange={event => setValues(old => ({ ...old, [key]: event.target.value }))} maxLength={2000} /><span className="text-xs text-slate-400">Used in the prompt as {`{{${key}}}`}</span></label>)}</div>
      </section>}
      <section ref={knowledgeSection} tabIndex={-1} className="space-y-3 rounded-xl border border-slate-700 p-4"><h4 className="font-semibold">Use Project Knowledge</h4>
        {projectId ? <><p className="text-xs text-slate-400">Project: {projectName}</p><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={useKnowledge} onChange={event => setUseKnowledge(event.target.checked)} />Use project documents</label></> : <p className="text-sm text-slate-400">Choose a project above to use its documents.</p>}
        {useKnowledge && <div className="space-y-2"><div className="flex gap-2"><button className={`${buttonClass} py-1`} onClick={() => setDocumentIds(documents.map(item => item.id))}>Select all</button><button className={`${buttonClass} py-1`} onClick={() => setDocumentIds([])}>Clear</button></div>
          {!documents.length ? <p className="text-sm text-slate-400">No project documents selected.</p> : documents.map(item => <label key={item.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={documentIds.includes(item.id)} onChange={() => setDocumentIds(old => old.includes(item.id) ? old.filter(id => id !== item.id) : [...old, item.id])} />{item.filename}</label>)}
          <p className="text-xs text-slate-400">Only checked documents are used for this run. If none are checked, all project-selected documents are used.</p></div>}
      </section>
      <section className="space-y-3 rounded-xl border border-slate-700 p-4"><h4 className="font-semibold">Models</h4>
        {simple && <fieldset><legend className="mb-2 text-sm text-slate-400">Run quality</legend><div className="flex flex-wrap gap-4">{(["fast", "balanced", "deep"] as const).map(label => {
          const tier = tiers.find(item => item.tier === label); return <label key={label} className="flex items-center gap-2 text-sm"><input type="radio" name="prompt-quality" checked={Boolean(tier && models.length === 1 && models[0] === tier.model_name)} disabled={!tier} onChange={() => { if (tier) chooseTier(tier); }} />{friendly(label)}{!tier && <span className="text-xs text-slate-500">Unavailable</span>}</label>;
        })}</div></fieldset>}
        {(!simple || advancedModelsOpen) && <fieldset><legend className="mb-2 text-sm text-slate-400">Choose up to three models</legend><div className="grid gap-2">{available.map(model => <label key={model} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={models.includes(model)} onChange={() => setModels(current => current.includes(model) ? current.filter(value => value !== model) : current.length < 3 ? [...current, model] : current)} />{model}</label>)}</div></fieldset>}
        {simple && <><button className="text-xs text-blue-300 underline" onClick={() => setAdvancedModelsOpen(open => !open)}>{advancedModelsOpen ? "Hide advanced model selection" : "Advanced model selection"}</button>{models.length > 1 && <p className="text-xs text-slate-400">Comparing {models.length} models in this run.</p>}</>}
        {!available.length && <p className="text-sm text-amber-300">No configured models are available right now.</p>}
      </section>
      {!simple && <section className="grid gap-3 rounded-xl border border-slate-700 p-4 text-sm sm:grid-cols-3"><h4 className="font-semibold sm:col-span-3">Advanced Settings</h4>
        <label>Temperature<input className={`${inputClass} mt-1`} type="number" min="0" max="2" step="0.05" placeholder="Model default" value={temperature} onChange={event => setTemperature(event.target.value)} /></label>
        <label>Max output tokens<input className={`${inputClass} mt-1`} type="number" min="64" step="1" placeholder="Tier default" value={maxTokens} onChange={event => setMaxTokens(event.target.value)} /></label>
        <label>Reasoning<select className={`${inputClass} mt-1`} value={reasoning} onChange={event => setReasoning(event.target.value as typeof reasoning)}><option value="quick">Quick</option><option value="standard">Standard</option><option value="deep">Deep</option></select></label>
      </section>}
      {!simple && versions.length > 0 && <section className="rounded-xl border border-slate-700 p-4"><h4 className="font-semibold">Version History</h4><div className="mt-2 space-y-2">{versions.map(item => <div key={item.id} className="rounded border border-slate-700 p-3 text-sm"><div className="flex flex-wrap items-center gap-2"><strong>v{item.version_number}{item.version_number === savedTemplate?.version_number ? " — Current" : ""}</strong><span className="text-slate-400">{when(item.created_at)}</span><button className={`${buttonClass} ml-auto py-1`} disabled={busy || hasUnsavedChanges || (item.system_prompt === systemPrompt && item.user_prompt === userPrompt)} onClick={() => void restore(item)}>Restore</button></div><details className="mt-2 text-xs text-slate-400"><summary>View prompt</summary><p className="mt-2 whitespace-pre-wrap">System: {item.system_prompt}</p><p className="mt-2 whitespace-pre-wrap">User: {item.user_prompt}</p></details></div>)}</div></section>}
      <div><button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-40" disabled={busy || Boolean(runBlocker)} onClick={() => void run()}>{busy ? "Running..." : "Run Prompt"}</button>{runBlocker && <p className="mt-2 text-sm text-amber-300">{runBlocker}</p>}</div>
      {latest.length > 0 && <section className="space-y-3"><div className="flex items-center justify-between"><h4 className="text-lg font-semibold">{latest.length > 1 ? "Latest Comparison" : "Latest Result"}</h4><button className="text-sm text-blue-300 underline" onClick={() => setView("history")}>View Run History</button></div><div className="grid gap-3 lg:grid-cols-2">{latest.map(item => renderRun(item, false))}</div></section>}
    </div>}

    {view === "history" && <div className="space-y-4"><div><h3 className="text-lg font-semibold">Run History</h3><p className="text-sm text-slate-400">{selectedId ? `Saved results for ${name}` : "Open a saved prompt in Templates to see its runs."}</p></div>
      <PromptLearning mode="history" projectId={projectId} documents={documents} tiers={tiers} onStart={id => { setLearningExerciseId(id); setView("practice"); }} />
      {selectedId && !runs.length && <p className="rounded-xl border border-slate-700 p-5 text-sm text-slate-400">No runs yet. Run a prompt to see results here.</p>}
      {groupedRuns.map(group => <article key={group[0].comparison_run_id ?? group[0].id} className="rounded-xl border border-slate-700 bg-slate-950/50 p-4"><p className="text-xs text-slate-400">{when(group[0].created_at)}</p><h4 className="mt-1 font-semibold">{group.length > 1 ? "Multi-model comparison" : name}</h4>
        <p className="mt-1 text-sm text-slate-400">{group.length > 1 ? `${group.length} models · ${group.filter(item => item.status === "completed").length} completed · ${group.filter(item => item.status !== "completed").length} other` : `${group[0].generation_settings?.tier ? friendly(group[0].generation_settings.tier) : group[0].model} · ${friendly(group[0].status)}`}</p>
        {group.length === 1 && Object.keys(group[0].variable_values ?? {}).length > 0 && <p className="mt-1 text-xs text-slate-400">{Object.entries(group[0].variable_values ?? {}).map(([key, value]) => `${friendly(key)}: ${value}`).join(" · ")}</p>}
        <div className="mt-3 flex flex-wrap gap-2">{group.length > 1 ? <button className={buttonClass} onClick={() => setOpenedRun(openedRun?.id === group[0].id ? null : group[0])}>Open comparison</button> : <button className={buttonClass} onClick={() => setOpenedRun(openedRun?.id === group[0].id ? null : group[0])}>Open</button>}
          {group.length === 1 && <><button className={buttonClass} onClick={() => setCompare(old => old.includes(group[0].id) ? old.filter(id => id !== group[0].id) : old.length < 2 ? [...old, group[0].id] : old)}>{compare.includes(group[0].id) ? "Remove comparison" : "Compare"}</button><button className={buttonClass} onClick={() => exportRun(group[0])}>Export</button></>}</div>
        {openedRun?.id === group[0].id && <div className="mt-4 grid gap-3 lg:grid-cols-2">{group.map(item => renderRun(item, group.length > 1))}</div>}
      </article>)}
      {compared.length === 2 && <section className="space-y-3"><h4 className="text-lg font-semibold">Run A | Run B</h4><div className="grid gap-3 lg:grid-cols-2">{compared.map(item => renderRun(item, false))}</div></section>}
    </div>}
  </div>;
}
