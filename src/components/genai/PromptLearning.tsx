"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import genai from "@/services/genai.service";
import type { ProjectDocument, PromptPracticeAttempt, TierStatus } from "@/types/genai";

type Level = "beginner" | "intermediate" | "advanced";
type Exercise = { id: string; level: Level; title: string; concept: string; why: string; weak: string; improved: string; challenge: string; criteria: string[]; checks: string[] };
const lessons: Exercise[] = [
  { id: "explain_concept", level: "beginner", title: "Explain a Concept", concept: "Define the task and the audience.", why: "A clear audience changes the depth and vocabulary of an explanation.", weak: "Explain AI.", improved: "Explain neural networks to first-year engineering students. Include one everyday example and three key takeaways.", challenge: "Explain a technical topic to a defined audience with an example and three takeaways.", criteria: ["Topic", "Audience", "Example", "Three takeaways"], checks: ["topic", "audience", "example", "three"] },
  { id: "summarize_text", level: "beginner", title: "Summarize Text", concept: "Specify what a good summary must preserve.", why: "A length and key-point instruction reduces vague summaries.", weak: "Summarize this.", improved: "Summarize the supplied text for a new employee in at most 150 words. Cover key points and preserve important numbers.", challenge: "Request a summary of at most 150 words for a named audience; preserve key points and numbers.", criteria: ["Length", "Audience", "Key points", "Numbers"], checks: ["length", "audience", "key_points", "numbers"] },
  { id: "format_output", level: "beginner", title: "Format Output", concept: "State the output shape explicitly.", why: "A format instruction makes a response easier to use.", weak: "Give me steps.", improved: "Give exactly three numbered steps for preparing a project brief. Use a short heading for each step.", challenge: "Request a numbered list with a clear number of steps and headings.", criteria: ["Numbered steps", "Item count", "Headings"], checks: ["numbered", "count", "headings"] },
  { id: "few_shot", level: "intermediate", title: "Few-Shot Prompting", concept: "Show the model the input and output pattern.", why: "Consistent examples clarify a task that is hard to describe alone.", weak: "Classify these messages.", improved: "Classify messages as urgent or routine. Input: Server is down. Output: urgent. Input: Weekly notes attached. Output: routine. Now classify the next input in the same format.", challenge: "Write a task instruction, at least two input/output examples, and a matching output pattern.", criteria: ["Task instruction", "Two examples", "Input/output pattern"], checks: ["two_examples", "pattern", "task"] },
  { id: "role_constraints", level: "intermediate", title: "Role + Constraints", concept: "Give a role and explicit boundaries.", why: "Role, audience, and constraints reduce ambiguity.", weak: "Write about machine learning.", improved: "You are an AI instructor. Explain supervised learning to first-year engineering students in under 200 words using one classification example and three bullet points.", challenge: "Improve the weak prompt with a role, context, audience, length constraint, and output format.", criteria: ["Role", "Context", "Audience", "Constraint", "Format"], checks: ["role", "context", "audience", "length", "format"] },
  { id: "structured_extraction", level: "intermediate", title: "Structured Extraction", concept: "Name the fields and output schema.", why: "A schema makes extracted information easier to validate.", weak: "Read this resume.", improved: "Extract candidate_name, years_experience, skills, and education from the supplied resume. Return valid JSON only. Use null when a field is missing.", challenge: "Extract candidate_name, years_experience, skills, and education as valid JSON; handle absent fields.", criteria: ["Four fields", "Valid JSON", "Missing-field rule"], checks: ["fields", "json", "missing"] },
  { id: "document_grounding", level: "intermediate", title: "Document-Grounded Prompting", concept: "Ground claims in selected project documents.", why: "Source limits and citations make answers easier to verify.", weak: "Tell me about these documents.", improved: "Use only the selected documents. Summarize the findings and cite each supporting source. If evidence is missing, say so instead of guessing.", challenge: "Select project documents and request a source-only answer with citations and an insufficient-evidence rule.", criteria: ["Selected documents", "Source-only instruction", "Citations", "Missing-evidence rule"], checks: ["kb", "source_scope", "citations", "missing"] },
  { id: "multi_step", level: "advanced", title: "Multi-Step Prompt", concept: "Split a complex task into visible output stages.", why: "Explicit stages improve completeness without requesting private chain-of-thought.", weak: "Analyze this project.", improved: "First extract the requirements, then compare options, then present a final recommendation in three labeled sections. Give concise conclusions, not hidden reasoning.", challenge: "Ask for extraction, comparison, and a final structured answer without requesting chain-of-thought.", criteria: ["Extract", "Compare", "Final output", "Labeled sections"], checks: ["extract", "compare", "final", "sections"] },
  { id: "model_comparison", level: "advanced", title: "Model Comparison", concept: "Compare the same prompt across models.", why: "Different models can vary in completeness, format, speed, and token use.", weak: "Which model is best?", improved: "Using the same instruction, compare the responses for completeness, formatting, and instruction following. Record latency and token usage; do not declare a winner without criteria.", challenge: "Run the same prompt with at least two configured models and compare outputs, latency, and tokens.", criteria: ["Same prompt", "Two models", "Clear comparison criteria"], checks: ["two_models", "criteria", "format"] },
  { id: "prompt_evaluation", level: "advanced", title: "Prompt Evaluation", concept: "State success criteria before judging an answer.", why: "Explicit criteria make a prompt easier to improve.", weak: "Is this answer good?", improved: "Evaluate the answer for accuracy, completeness, structure, and audience fit. Report each criterion and a short improvement suggestion.", challenge: "Define criteria and ask for a structured evaluation with improvements.", criteria: ["Explicit criteria", "Output structure", "Improvement suggestion"], checks: ["criteria", "format", "improve"] },
  { id: "hallucination_reduction", level: "advanced", title: "Hallucination Reduction", concept: "Require evidence and a safe response when it is absent.", why: "A model should not fill gaps with unsupported claims.", weak: "Answer confidently.", improved: "Answer only from the selected documents. Cite supporting passages. If a claim is unsupported, state the uncertainty and do not invent facts.", challenge: "Select documents and require source restriction, citations, uncertainty, and refusal when evidence is missing.", criteria: ["Source restriction", "Citations", "Uncertainty", "Missing-evidence rule"], checks: ["kb", "source_scope", "citations", "uncertainty", "missing"] },
  { id: "rag_prompting", level: "advanced", title: "RAG Prompting", concept: "Use retrieved passages as bounded context.", why: "A grounded prompt tells the model what to do when retrieval has no answer.", weak: "Use RAG and answer.", improved: "Use only the retrieved passages from selected documents. Answer the question, cite sources, and say when the context is insufficient.", challenge: "Select documents; request an answer only from retrieved context with citations and missing-evidence handling.", criteria: ["Retrieved evidence", "Context-only scope", "Citations", "Missing-evidence rule"], checks: ["kb", "source_scope", "citations", "missing"] },
  { id: "tool_use", level: "advanced", title: "Tool-Use Prompting", concept: "Specify when a tool is appropriate and what it needs.", why: "Clear tool conditions reduce unnecessary or incomplete calls.", weak: "Use tools whenever needed.", improved: "Use the search tool only for current facts. Supply a specific query. If the tool fails, report the failure; do not guess. Do not call it for questions answerable from the supplied text.", challenge: "Describe tool choice, required arguments, success/failure handling, and when not to call a tool.", criteria: ["Tool selection", "Arguments", "Failure handling", "No-call condition"], checks: ["tool", "arguments", "failure", "no_call"] },
];

const rubric = ["Clarity", "Context", "Task Specificity", "Constraints", "Output Format", "Grounding", "Ambiguity Handling", "Completeness"] as const;
const checkLabels: Record<string, string> = {
  topic: "Topic", audience: "Audience", example: "Example", three: "Three takeaways", length: "Length limit",
  key_points: "Key points", numbers: "Important numbers", numbered: "Numbered output", count: "Item count", headings: "Headings",
  two_examples: "At least two examples", pattern: "Input/output pattern", task: "Task instruction", role: "Role", context: "Context",
  format: "Output format", fields: "Required fields", json: "JSON instruction", missing: "Missing-information rule",
  kb: "Selected documents", source_scope: "Source-only scope", citations: "Citation instruction",
  extract: "Extraction stage", compare: "Comparison stage", final: "Final answer stage", sections: "Labeled sections",
  two_models: "At least two model runs", criteria: "Evaluation criteria", improve: "Improvement request",
  uncertainty: "Uncertainty handling", tool: "Tool selection", arguments: "Tool arguments", failure: "Failure handling", no_call: "No-call condition",
};
const matches = (text: string, pattern: RegExp) => pattern.test(text);
function evaluatePrompt(exercise: Exercise, prompt: string, results: PromptPracticeAttempt[], documentIds: string[]) {
  const text = prompt.toLowerCase();
  const output = results[0]?.output ?? "";
  const has = {
    topic: matches(text, /\b(topic|concept|subject|explain)\b/), audience: matches(text, /\b(audience|students?|beginners?|engineers?|employees?|readers?|for a|for an)\b/),
    example: matches(text, /\bexample\b/), three: matches(text, /\b(three|3)\b.*\b(takeaways?|points?)\b/), length: matches(text, /\b(\d+\s*words?|word limit|at most|under)\b/),
    key_points: matches(text, /\b(key|main|important)\s+(points?|findings?|ideas?)\b/), numbers: matches(text, /\b(numbers?|figures?|statistics?|metrics?)\b/),
    numbered: matches(text, /\b(numbered|numbering|steps?)\b/), count: matches(text, /\b(\d+|three|four|five)\s+(steps?|items?|points?)\b/), headings: matches(text, /\b(headings?|sections?)\b/),
    two_examples: (prompt.match(/\b(input|example)\s*:/gi) ?? []).length >= 2, pattern: matches(text, /\b(output|label|result)\s*:/), task: matches(text, /\b(explain|summari[sz]e|extract|classify|write|compare|evaluate|list|create|review|analyze)\b/),
    role: matches(text, /\b(you are|act as|role)\b/), context: matches(text, /\b(context|background|given|supplied|scenario|project)\b/), format: matches(text, /\b(json|table|bullet|numbered|section|schema|format)\b/),
    fields: ["candidate_name", "years_experience", "skills", "education"].every(field => text.includes(field)), json: matches(text, /\bjson\b/),
    missing: matches(text, /\b(if|when)\b.{0,60}\b(missing|unavailable|insufficient|unknown|not found|no evidence)\b/), kb: documentIds.length > 0,
    source_scope: matches(text, /\b(only|solely|exclusively)\b.{0,45}\b(documents?|sources?|context|passages?|evidence)\b|\b(documents?|sources?|context)\b.{0,45}\b(only|solely)\b/),
    citations: matches(text, /\b(cite|citations?|sources?|references?)\b/), extract: matches(text, /\bextract\b/), compare: matches(text, /\bcompare|contrast\b/),
    final: matches(text, /\b(final|conclusion|recommendation)\b/), sections: matches(text, /\b(sections?|headings?|stages?)\b/), two_models: results.length >= 2,
    criteria: matches(text, /\b(criteria|rubric|accuracy|completeness|formatting)\b/), improve: matches(text, /\b(improve|suggest|recommend)\b/),
    uncertainty: matches(text, /\b(uncertain|uncertainty|unsure|not sure|unsupported)\b/), tool: matches(text, /\btool\b/),
    arguments: matches(text, /\b(arguments?|parameters?|query|inputs?)\b/), failure: matches(text, /\b(fail|error|unavailable)\b/), no_call: matches(text, /\b(do not|don't|never|only when)\b.{0,50}\b(call|use|invoke)\b|\b(call|use|invoke)\b.{0,50}\b(only when)\b/),
  };
  const checks = exercise.checks.map(key => ({ label: checkLabels[key] ?? key, passed: Boolean(has[key as keyof typeof has]), detail: Boolean(has[key as keyof typeof has]) ? "Found in this attempt" : "Add this requirement explicitly" }));
  if (exercise.id === "structured_extraction") {
    let valid = false; try { const parsed = JSON.parse(output.trim().replace(/^```(?:json)?\s*|\s*```$/g, "")); valid = parsed && typeof parsed === "object" && !Array.isArray(parsed) && ["candidate_name", "years_experience", "skills", "education"].every(key => key in parsed); } catch { /* invalid JSON */ }
    checks.push({ label: "Run output is valid JSON", passed: valid, detail: valid ? "JSON parsed" : "The run output did not parse as JSON" });
  }
  if (exercise.id === "summarize_text") {
    const words = output.trim().split(/\s+/).filter(Boolean).length;
    checks.push({ label: "Run output stays within 150 words", passed: words > 0 && words <= 150, detail: `${words} words in the run output` });
  }
  if (exercise.id === "format_output") checks.push({ label: "Run output uses numbered steps", passed: /^\s*1[.)]\s/m.test(output), detail: "Checked the run output for a numbered list" });
  if (["document_grounding", "rag_prompting", "hallucination_reduction"].includes(exercise.id)) checks.push({ label: "Run includes source citations", passed: results.some(item => item.citations.length > 0), detail: "Checked native run citation metadata" });
  if (exercise.id === "multi_step") checks.push({ label: "Run output has three sections", passed: (output.match(/^#{1,4}\s+|^\d+[.)]\s+/gm) ?? []).length >= 3, detail: "Checked headings or numbered sections" });
  checks.push({ label: "No unresolved variables", passed: !/{{\s*\w+\s*}}/.test(prompt), detail: "Checked the prompt for unfilled placeholders" });
  const passed = checks.filter(check => check.passed).length;
  const breakdown: Record<string, number> = {
    Clarity: has.task ? 10 : 3, Context: has.context || has.audience ? 10 : 4,
    "Task Specificity": prompt.trim().length >= 60 && has.task ? 10 : has.task ? 7 : 3,
    Constraints: has.length || has.count || has.source_scope || has.missing ? 10 : 4,
    "Output Format": has.format || has.json || has.numbered ? 10 : 4,
    Grounding: documentIds.length ? has.source_scope && has.citations ? 10 : 5 : exercise.checks.includes("kb") ? 0 : 7,
    "Ambiguity Handling": has.missing || has.uncertainty || has.failure ? 10 : 4,
    Completeness: Math.round(10 * passed / Math.max(1, checks.length)),
  };
  return { evaluation_score: Math.round(rubric.reduce((sum, key) => sum + breakdown[key], 0) * 1.25), evaluation_breakdown: breakdown, deterministic_checks: checks };
}

const buttonClass = "rounded border border-slate-600 px-3 py-2 text-sm text-slate-200 disabled:opacity-40";
const inputClass = "w-full rounded border border-slate-700 bg-slate-950 p-2 text-sm text-white";
export default function PromptLearning({ mode, projectId, documents, tiers, exerciseId, onStart }: {
  mode: "learn" | "practice" | "history"; projectId: string | null; documents: ProjectDocument[]; tiers: TierStatus[]; exerciseId?: string;
  onStart: (id: string) => void;
}) {
  const [attempts, setAttempts] = useState<PromptPracticeAttempt[]>([]);
  const [selectedId, setSelectedId] = useState(exerciseId ?? lessons[0].id);
  const [level, setLevel] = useState<Level>("beginner");
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [documentIds, setDocumentIds] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [latest, setLatest] = useState<PromptPracticeAttempt[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const exercise = lessons.find(item => item.id === selectedId) ?? lessons[0];
  useEffect(() => { void genai.practiceAttempts().then(items => setAttempts(items.filter(item => (item.project_id ?? null) === projectId))).catch(reason => setError(reason instanceof Error ? reason.message : "Could not load practice history.")); }, [projectId]);
  useEffect(() => { setDocumentIds(current => current.filter(id => documents.some(item => item.id === id))); }, [documents]);
  useEffect(() => { if (!models.length) { const preferred = tiers.find(item => item.tier === "balanced") ?? tiers[0]; if (preferred) setModels([preferred.model_name]); } }, [tiers, models.length]);
  useEffect(() => { if (exerciseId) { setSelectedId(exerciseId); setLevel(lessons.find(item => item.id === exerciseId)?.level ?? "beginner"); } }, [exerciseId]);
  const progress = useMemo(() => Object.fromEntries((["beginner", "intermediate", "advanced"] as const).map(value => [value, lessons.filter(item => item.level === value && attempts.some(attempt => attempt.exercise_id === item.id && attempt.evaluation_score !== null)).length])), [attempts]);
  function selectExercise(item: Exercise) { setSelectedId(item.id); setLevel(item.level); setPrompt(""); setSystemPrompt(""); setLatest([]); setShowSolution(false); setError(""); const preferred = tiers.find(tier => tier.tier === "balanced") ?? tiers[0]; setModels(preferred ? [preferred.model_name] : []); }
  async function run() {
    if (!prompt.trim() || !models.length || busy) return;
    if (exercise.checks.includes("kb") && !documentIds.length) { setError("Select project documents for this exercise."); return; }
    setBusy(true); setError("");
    const results = await Promise.allSettled(models.map(model => genai.runPractice({ lesson_id: exercise.id, exercise_id: exercise.id,
      difficulty: exercise.level, system_prompt: systemPrompt, prompt_text: prompt.trim(), model, project_id: projectId, document_ids: documentIds })));
    const completed = results.filter((result): result is PromiseFulfilledResult<PromptPracticeAttempt> => result.status === "fulfilled").map(result => result.value);
    const rejected = results.find((result): result is PromiseRejectedResult => result.status === "rejected");
    if (rejected) setError(rejected.reason instanceof Error ? rejected.reason.message : "One model could not run.");
    setLatest(completed); setAttempts(old => [...completed, ...old]); setBusy(false);
  }
  async function evaluate() {
    if (!latest.length || busy) return;
    setBusy(true); setError("");
    const score = evaluatePrompt(exercise, latest[0].prompt_text, latest, latest[0].knowledge_document_ids);
    const results = await Promise.allSettled(latest.map(item => genai.evaluatePractice(item.id, score)));
    const updated = results.filter((result): result is PromiseFulfilledResult<PromptPracticeAttempt> => result.status === "fulfilled").map(result => result.value);
    if (updated.length !== latest.length) setError("Some evaluations could not be saved. You can try again.");
    setLatest(old => old.map(item => updated.find(value => value.id === item.id) ?? item));
    setAttempts(old => old.map(item => updated.find(value => value.id === item.id) ?? item));
    setBusy(false);
  }
  function retry() { setLatest([]); setError(""); setShowSolution(false); }
  const selectedAttempts = attempts.filter(item => item.exercise_id === exercise.id && item.evaluation_score !== null).sort((a, b) => a.created_at.localeCompare(b.created_at));
  const feedback = latest[0]?.evaluation_breakdown;
  const missing = latest[0]?.deterministic_checks.filter(check => !check.passed) ?? [];
  return <div className="space-y-5">
    {error && <p className="rounded border border-red-700 p-3 text-sm text-red-200">{error}</p>}
    <div className="grid gap-3 sm:grid-cols-3">{(["beginner", "intermediate", "advanced"] as const).map(value => <div key={value} className="rounded-xl border border-slate-700 p-3"><strong className="capitalize">{value}</strong><p className="text-sm text-slate-400">{progress[value] ?? 0} / {lessons.filter(item => item.level === value).length} completed</p></div>)}</div>
    {mode === "learn" && <div className="space-y-5">{(["beginner", "intermediate", "advanced"] as const).map(value => <section key={value}><h3 className="mb-2 text-lg font-semibold capitalize">{value}</h3><div className="grid gap-3 md:grid-cols-2">{lessons.filter(item => item.level === value).map(item => <article key={item.id} className="rounded-xl border border-slate-700 bg-slate-950/50 p-4"><h4 className="font-semibold">{item.title}</h4><p className="mt-1 text-sm text-slate-400">{item.concept}</p><p className="mt-1 text-xs uppercase text-blue-300">{item.level}</p><button className="mt-2 text-sm text-blue-300 underline" onClick={() => setOpenLesson(openLesson === item.id ? null : item.id)}>{openLesson === item.id ? "Hide lesson" : "View lesson"}</button>
      {openLesson === item.id && <div className="mt-3 space-y-2 border-t border-slate-700 pt-3 text-sm"><p><strong>Concept:</strong> {item.concept}</p><p><strong>Why it matters:</strong> {item.why}</p><p><strong>Weak prompt:</strong> {item.weak}</p><p><strong>Improved prompt:</strong> {item.improved}</p><p><strong>Student challenge:</strong> {item.challenge}</p><p><strong>Evaluation criteria:</strong> {item.criteria.join(", ")}</p></div>}
      <button className={`${buttonClass} mt-3 block`} onClick={() => onStart(item.id)}>Start Practice</button></article>)}</div></section>)}</div>}
      {mode === "practice" && <div className="grid gap-5 lg:grid-cols-[260px_1fr]"><aside className="space-y-3"><div className="flex gap-1">{(["beginner", "intermediate", "advanced"] as const).map(value => <button key={value} className={`${buttonClass} px-2 capitalize ${level === value ? "bg-blue-600" : ""}`} onClick={() => selectExercise(lessons.find(item => item.level === value) ?? lessons[0])}>{value}</button>)}</div>{lessons.filter(item => item.level === level).map(item => <button key={item.id} className={`block w-full rounded border p-3 text-left text-sm ${item.id === exercise.id ? "border-blue-500 bg-slate-800" : "border-slate-700"}`} onClick={() => selectExercise(item)}>{item.title}</button>)}</aside>
      <div className="space-y-4"><div><p className="text-xs uppercase text-blue-300">{exercise.level} exercise</p><h3 className="text-xl font-semibold">{exercise.title}</h3><p className="mt-2 text-sm text-slate-300">{exercise.challenge}</p><p className="mt-1 text-sm text-slate-400">Start from this weak prompt: “{exercise.weak}”</p></div>
        <div className="rounded-xl border border-slate-700 p-4"><label className="block text-sm font-medium">Your prompt<textarea className={`${inputClass} mt-2 min-h-40`} value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Write your improved prompt here" /></label><details className="mt-3 text-sm text-slate-400"><summary>Optional system instruction</summary><textarea className={`${inputClass} mt-2 min-h-20`} value={systemPrompt} onChange={event => setSystemPrompt(event.target.value)} /></details></div>
        <section className="rounded-xl border border-slate-700 p-4"><h4 className="font-semibold">Project knowledge (optional)</h4>{projectId ? documents.length ? <div className="mt-2 space-y-2"><div className="flex gap-2"><button className={buttonClass} onClick={() => setDocumentIds(documents.map(item => item.id))}>Select all</button><button className={buttonClass} onClick={() => setDocumentIds([])}>Clear</button></div>{documents.map(item => <label key={item.id} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={documentIds.includes(item.id)} onChange={() => setDocumentIds(old => old.includes(item.id) ? old.filter(id => id !== item.id) : [...old, item.id])} />{item.filename}</label>)}</div> : <p className="mt-2 text-sm text-slate-400">No selected project documents. Choose documents in the Documents tab.</p> : <p className="mt-2 text-sm text-slate-400">Choose a project above for document-grounded exercises.</p>}</section>
        <fieldset className="rounded-xl border border-slate-700 p-4"><legend className="px-1 font-semibold">Model{exercise.id === "model_comparison" ? "s (choose at least two)" : ""}</legend><div className="grid gap-2">{tiers.map(tier => <label key={tier.tier} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={models.includes(tier.model_name)} onChange={() => setModels(old => old.includes(tier.model_name) ? old.filter(item => item !== tier.model_name) : exercise.id === "model_comparison" ? [...old, tier.model_name].slice(0, 3) : [tier.model_name])} />{tier.tier.charAt(0).toUpperCase() + tier.tier.slice(1)}</label>)}</div></fieldset>
        <div className="flex flex-wrap gap-2"><button className="rounded bg-blue-600 px-4 py-2 font-semibold disabled:opacity-40" disabled={busy || !prompt.trim() || !models.length || (exercise.id === "model_comparison" && models.length < 2)} onClick={() => void run()}>Run</button><button className={buttonClass} disabled={busy || !latest.length} onClick={() => void evaluate()}>Evaluate</button><button className={buttonClass} onClick={retry}>Retry</button><button className={buttonClass} onClick={() => setShowSolution(value => !value)}>{showSolution ? "Hide example solution" : "View example solution"}</button></div>
        {showSolution && <div className="rounded border border-slate-700 p-3 text-sm"><strong>Example solution</strong><p className="mt-2 whitespace-pre-wrap">{exercise.improved}</p></div>}
        {latest.length > 0 && <section className="space-y-3"><h4 className="font-semibold">Latest run</h4>{latest.map(item => <article key={item.id} className="rounded border border-slate-700 p-3 text-sm"><div className="mb-2 text-slate-400">{item.model} · {item.status} · {item.latency_ms} ms · Tokens: {item.total_tokens ?? "Unavailable"}</div><ReactMarkdown remarkPlugins={[remarkGfm]}>{item.output}</ReactMarkdown>{item.citations.length > 0 && <p className="mt-2 text-xs text-slate-400">Sources: {item.citations.map(source => source.title).join("; ")}</p>}</article>)}</section>}
        {feedback && <section className="rounded-xl border border-blue-700/50 p-4"><h4 className="text-lg font-semibold">Prompt Evaluation: {latest[0].evaluation_score} / 100</h4><p className="text-xs text-slate-400">Heuristic educational feedback, not an objective grade.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{rubric.map(key => <p key={key} className="text-sm">{key}: {feedback[key] ?? 0}/10</p>)}</div><h5 className="mt-3 font-semibold">What you did well</h5><ul className="list-disc pl-5 text-sm">{latest[0].deterministic_checks.filter(check => check.passed).map(check => <li key={check.label}>{check.label}</li>)}</ul><h5 className="mt-3 font-semibold">Needs improvement</h5><ul className="list-disc pl-5 text-sm">{missing.map(check => <li key={check.label}>{check.label}: {check.detail}</li>)}</ul>{missing.length > 0 && <p className="mt-3 text-sm">Suggested improvement: Make “{missing[0].label}” explicit in your prompt.</p>}</section>}
        {selectedAttempts.length > 0 && <section><h4 className="font-semibold">Your attempts</h4><div className="mt-2 flex flex-wrap gap-2">{selectedAttempts.map((item, index) => <span key={item.id} className="rounded border border-slate-700 px-2 py-1 text-sm">Attempt {index + 1}: {item.evaluation_score}</span>)}</div><p className="mt-2 text-xs text-slate-400">Best score: {Math.max(...selectedAttempts.map(item => item.evaluation_score ?? 0))}/100</p></section>}
      </div></div>}
    {mode === "history" && <section><h3 className="text-lg font-semibold">Practice History</h3>{!attempts.length ? <p className="mt-2 text-sm text-slate-400">No practice attempts yet.</p> : <div className="mt-3 grid gap-2">{attempts.map(item => <article key={item.id} className="rounded-xl border border-slate-700 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{lessons.find(lesson => lesson.id === item.exercise_id)?.title ?? item.exercise_id}</strong><span className="text-sm text-slate-400">{item.evaluation_score === null ? "Not evaluated" : `${item.evaluation_score}/100`}</span></div><p className="mt-1 text-xs text-slate-400">{item.difficulty} · {new Date(item.created_at).toLocaleString()} · {item.model}</p><details className="mt-2 text-sm"><summary>View attempt</summary><p className="mt-2 whitespace-pre-wrap">{item.prompt_text}</p><p className="mt-2 whitespace-pre-wrap text-slate-300">{item.output}</p></details></article>)}</div>}</section>}
  </div>;
}
