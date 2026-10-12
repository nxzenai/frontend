"use client";
import { useState } from "react";
import type { DatasetUnderstanding as Understanding } from "@/types/genai";
export type TutorRequest = { dataset_reference: string; target?: string; confirmed_mapping?: Record<string, string>; refresh_interpretation?: boolean; metric_preview?: { selected_metric: string; positive_label?: string } };
export default function DatasetUnderstanding({ value, disabled, ask }: { value: Understanding; disabled: boolean; ask: (question: string, context: TutorRequest) => void }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [count, setCount] = useState(8);
  const [target, setTarget] = useState(value.selected_target ?? value.target_candidates[0]?.column ?? "");
  const [mapping, setMapping] = useState<Record<string, string>>(value.learner_confirmed_mappings[target] ?? {});
  const [showWarnings, setShowWarnings] = useState(false);
  const reference = { dataset_reference: value.dataset_reference, target: target || undefined };
  const columns = value.columns.filter(column => (!search || (column.native_name + " " + (column.likely_meaning ?? "")).toLowerCase().includes(search.toLowerCase())) && (role === "all" || column.role === role));
  const candidate = value.target_candidates.find(item => item.column === target);
  const outcomes = candidate?.class_distribution ?? [];
  return <details className="rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm" open>
    <summary className="cursor-pointer font-semibold text-blue-200">Dataset Understanding · {value.filename}</summary>
    <p className="mt-2">{value.row_count} rows · {value.column_count} columns{value.selected_target ? " · Profiled target: " + value.selected_target : ""}</p>
    {candidate && <p>Schema-compatible task candidate: {candidate.likely_task} · Needs confirmation</p>}
    <p>Likely purpose: {value.dataset_summary.likely_purpose || "Needs confirmation"} · Confidence: {value.dataset_summary.confidence ?? "LOW"}</p>
    <p>What one row may represent: {value.dataset_summary.row_meaning || "Needs confirmation"}</p>
    <p className="text-xs text-amber-200">AI meanings are interpretations. Confirm ambiguous labels and units; no data changes are applied.</p>
    <div className="mt-2 flex flex-wrap gap-2">{["Ask AI about this dataset", "Explain all features", "Explain the target", "Explain outcome labels", "Why this task?"].map(label => <button key={label} type="button" disabled={disabled} onClick={() => ask(label === "Ask AI about this dataset" ? "Explain this dataset simply." : label, reference)} className="rounded border border-blue-400/40 px-2 py-1 text-xs disabled:opacity-40">{label}</button>)}
      <button type="button" disabled={disabled} onClick={() => ask("Explain the dataset again with a fresh interpretation.", { ...reference, refresh_interpretation: true })} className="rounded border border-blue-400/40 px-2 py-1 text-xs disabled:opacity-40">Reinterpret dataset</button>
    </div>
    <details className="mt-3"><summary className="cursor-pointer">Key Features / View all features</summary>
      <div className="my-2 flex flex-wrap gap-2"><input aria-label="Search features" placeholder="Search features" value={search} onChange={event => { setSearch(event.target.value); setCount(8); }} className="rounded border border-slate-600 bg-slate-900 px-2 py-1" />
        <select aria-label="Filter feature role" value={role} onChange={event => { setRole(event.target.value); setCount(8); }} className="rounded border border-slate-600 bg-slate-900 px-2 py-1"><option value="all">All roles</option>{["identifier", "feature", "target_candidate", "metadata", "unknown"].map(item => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</select></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr>{["Feature", "Meaning", "Type / Role", "Missing %", "Example", "Confidence", "Ask"].map(label => <th key={label} className="p-2">{label}</th>)}</tr></thead><tbody>
        {columns.slice(0, count).map(column => <tr key={column.native_name} className="border-t border-slate-800"><td className="p-2">{column.native_name}</td><td className="p-2">{column.likely_meaning || "Needs confirmation"}{column.likely_unit && <span> · likely unit: {column.likely_unit}</span>}{column.ambiguity && <p className="text-amber-200">{column.ambiguity}</p>}</td><td className="p-2">{column.data_type} / {column.role ?? "unknown"}</td><td className="p-2">{column.missing_percentage}%</td><td className="p-2">{column.sample_values.map(String).join(", ") || "Not shown"}</td><td className="p-2">{column.confidence ?? "LOW"}</td><td className="p-2"><button type="button" disabled={disabled} onClick={() => ask("Explain the feature " + column.native_name + " simply, with an explicitly hypothetical example.", reference)} className="text-blue-300 disabled:opacity-40">Explain</button></td></tr>)}
      </tbody></table></div>
      <p>{Math.min(count, columns.length)} of {columns.length} profiled features shown.</p>{count < columns.length && <button type="button" onClick={() => setCount(current => current + 15)} className="text-blue-300">Show more</button>}
    </details>
    <details className="mt-3"><summary className="cursor-pointer">Target candidates and outcome meanings</summary>
      <p className="text-xs">Candidates are schema suggestions; this selector views meanings and does not change the training target.</p>
      <select aria-label="View target candidate" value={target} onChange={event => { setTarget(event.target.value); setMapping(value.learner_confirmed_mappings[event.target.value] ?? {}); }} className="my-2 rounded border border-slate-600 bg-slate-900 px-2 py-1">{value.target_candidates.map(item => <option key={item.column} value={item.column}>{item.column} · {item.likely_task} candidate ({item.confidence})</option>)}</select>
      {outcomes.map(outcome => { const label = outcome.native_label; const meaning = value.class_meanings.find(item => item.target === target && item.native_value === label); return <div key={label} className="my-2 flex flex-wrap items-center gap-2"><span>{label} — {meaning?.confirmed ? meaning.interpreted_meaning : "Meaning unclear"} · {outcome.count} rows ({outcome.percentage}%)</span>
        {meaning && !meaning.confirmed && <span className="text-xs text-amber-200">AI hypothesis: {meaning.interpreted_meaning || "Unknown"} ({meaning.confidence})</span>}
        <input aria-label={"Meaning of " + label} placeholder={"What does " + label + " represent?"} value={mapping[label] ?? ""} onChange={event => setMapping(current => ({ ...current, [label]: event.target.value }))} disabled={disabled} className="rounded border border-slate-600 bg-slate-900 px-2 py-1" /></div>; })}
      {!!outcomes.length && <button type="button" disabled={disabled || outcomes.some(outcome => !mapping[outcome.native_label]?.trim())} onClick={() => ask("Confirm outcome meanings for " + target, { ...reference, confirmed_mapping: Object.fromEntries(outcomes.map(outcome => [outcome.native_label, mapping[outcome.native_label].trim()])) })} className="rounded border border-green-400/40 px-2 py-1 text-xs disabled:opacity-40">Confirm / correct meanings</button>}
    </details>
    <details className="mt-3"><summary className="cursor-pointer">Data Quality Coach · {value.quality_warnings.length} observations</summary>
      <ul className="ml-4 list-disc">{value.quality_warnings.slice(0, showWarnings ? undefined : 8).map((warning, index) => <li key={index}>{warning.message}</li>)}</ul>
      {value.quality_warnings.length > 8 && <button type="button" onClick={() => setShowWarnings(current => !current)} className="text-blue-300">{showWarnings ? "Show fewer" : "Show more"}</button>}
      <button type="button" disabled={disabled} onClick={() => ask("Explain these dataset quality warnings simply.", reference)} className="ml-2 text-blue-300 disabled:opacity-40">Ask AI</button>
    </details>
  </details>;
}
