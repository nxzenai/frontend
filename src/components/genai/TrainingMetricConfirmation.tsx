"use client";
import { useState } from "react";

type Option = { value: string; label?: string; description: string };
type Level = "beginner" | "intermediate" | "advanced";
type Selection = { task: string; target?: string; business_problem?: string; options: Option[]; recommended: string; why: string; selected: string; positive_class_options?: { value: string; label: string }[]; positive_label?: string | null; positive_metric_options?: Option[]; outcome_guidance?: Record<string, { recommended: string; why: string }> };
export default function TrainingMetricConfirmation({ selection, disabled, confirm, initialLevel = "beginner", onLevelChange, askAI }: { selection: Selection; disabled: boolean; confirm: (metric: string, positiveLabel?: string) => void; initialLevel?: Level; onLevelChange?: (level: Level) => void; askAI?: (question: string, preview: { selected_metric: string; positive_label?: string }) => void }) {
  const [metric, setMetric] = useState(selection.selected);
  const [positiveLabel, setPositiveLabel] = useState<string | undefined>(selection.positive_label ?? undefined);
  const [level, setLevel] = useState<Level>(initialLevel);
  const [manuallySelected, setManuallySelected] = useState(false);
  const options = [...selection.options.filter(option => positiveLabel !== undefined || !option.value.endsWith("_positive")), ...(positiveLabel !== undefined ? selection.positive_metric_options ?? [] : [])];
  const guidance = positiveLabel !== undefined ? selection.outcome_guidance?.[positiveLabel] : undefined;
  const recommended = guidance?.recommended ?? selection.recommended;
  const why = guidance?.why ?? selection.why;
  const classification = selection.task === "classification";
  const regression = selection.task === "regression";
  const clustering = selection.task === "clustering";
  const simple = (classification ? [{ value: "weighted_f1", label: "Balanced performance" }, { value: "recall_positive", label: "Catch important cases" }, { value: "precision_positive", label: "Avoid false alarms" }, { value: "accuracy", label: "Overall prediction accuracy" }] : regression ? [{ value: "mae", label: "Minimize typical prediction error" }, { value: "rmse", label: "Penalize large prediction errors more" }, { value: "r2_score", label: "Explain how much variation the model captures" }] : clustering ? [{ value: "silhouette_score", label: "Create well-separated groups" }] : options).filter(goal => options.some(option => option.value === goal.value));
  const common = classification ? (selection.positive_class_options?.length ? ["accuracy", "precision_positive", "recall_positive", "f1_positive"] : ["accuracy", "macro_f1", "weighted_f1"]) : regression ? ["mae", "rmse", "r2_score"] : clustering ? ["silhouette_score"] : options.map(option => option.value);
  const choices = level === "beginner" ? simple : options.filter(option => level === "advanced" || common.includes(option.value));
  const technical = options.find(option => option.value === metric);
  const changeLevel = (next: Level) => { setLevel(next); onLevelChange?.(next); };
  return <div className="flex-1 space-y-2">
    <p>Task: <strong>{selection.task.replaceAll("_", " ")}</strong>{selection.target && <> · Target: <strong>{selection.target}</strong></>}</p>
    <div className="flex gap-2">{(["beginner", "intermediate", "advanced"] as const).map(item => <button key={item} type="button" disabled={disabled} aria-pressed={level === item} onClick={() => changeLevel(item)} className={level === item ? "font-semibold underline" : "opacity-70"}>{item[0].toUpperCase() + item.slice(1)}</button>)}</div>
    {!!selection.positive_class_options?.length && <div><label className="flex flex-wrap items-center gap-2">Which outcome is most important to detect?
      <select value={positiveLabel === undefined ? "" : String(selection.positive_class_options.findIndex(option => option.value === positiveLabel))} disabled={disabled} onChange={event => {
        const next = event.target.value === "" ? undefined : selection.positive_class_options?.[Number(event.target.value)]?.value;
        setPositiveLabel(next);
        const nextRecommended = next === undefined ? selection.recommended : selection.outcome_guidance?.[next]?.recommended ?? selection.recommended;
        if (!manuallySelected) setMetric(next === undefined && nextRecommended.endsWith("_positive") ? "weighted_f1" : nextRecommended);
        else if (next === undefined && metric.endsWith("_positive")) setMetric("weighted_f1");
      }} className="rounded border border-amber-400/40 bg-slate-950 px-2 py-1 text-white">
        <option value="">Choose an outcome</option>
        {selection.positive_class_options.map((option, index) => <option key={option.value} value={index}>{option.value}{option.label !== option.value ? " — " + option.label : ""}</option>)}
      </select></label><p className="text-xs">This tells NxZenAI which outcome should be treated as the important case for precision, recall and F1.</p>{selection.positive_class_options?.some(option => option.label === option.value) && <p className="text-xs">Outcome meanings are unclear. You can confirm them in Dataset Understanding before continuing.</p>}</div>}
    {selection.business_problem && <p className="text-xs">Your objective: {selection.business_problem}</p>}
    <label className="flex flex-wrap items-center gap-2">{level === "beginner" ? clustering ? "What should the clustering prioritize?" : "What should the model prioritize?" : "Optimization metric"}
      <select value={choices.some(option => option.value === metric) ? metric : "__custom"} onChange={event => { if (event.target.value === "__advanced") { changeLevel("advanced"); return; } setMetric(event.target.value); setManuallySelected(true); }} disabled={disabled} className="rounded border border-amber-400/40 bg-slate-950 px-2 py-1 text-white">
        {!choices.some(option => option.value === metric) && <option value="__custom" disabled>Selected technical metric: {technical?.label ?? metric}</option>}
        {choices.map(option => <option key={option.value} value={option.value}>{option.label ?? option.value}</option>)}
        {level !== "advanced" && <option value="__advanced">Advanced metrics</option>}
      </select>
    </label>
    <p className="text-xs">Recommended: <strong>{(level === "beginner" ? simple : options).find(option => option.value === recommended)?.label ?? options.find(option => option.value === recommended)?.label ?? recommended}</strong> · Why: {why}</p>
    <p className="text-xs">Technical metric: {technical?.label ?? metric}. {technical?.description}</p>
    {metric !== recommended && <p className="text-xs">You selected a different metric from the recommendation.</p>}
    {askAI && <button type="button" disabled={disabled} onClick={() => askAI("Why this metric?", { selected_metric: metric, positive_label: positiveLabel })} className="text-xs underline">Why this metric? Ask AI</button>}
    <button type="button" disabled={disabled || !options.some(option => option.value === metric)} onClick={() => confirm(metric, positiveLabel)} className="rounded bg-amber-500 px-3 py-1.5 font-semibold text-slate-950 disabled:opacity-40">Confirm &amp; Train</button>
  </div>;
}
