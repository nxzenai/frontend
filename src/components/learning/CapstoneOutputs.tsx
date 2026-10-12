"use client";

import { useEffect, useState } from "react";
import { learningService } from "@/services/learning.service";
import type { LearningBusinessReport, LearningExperiment, LearningModelCard } from "@/types/learning";

const button = "rounded-lg border border-slate-600 px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-50";
const cardStyle = "rounded-lg border border-slate-700 bg-slate-950/70 p-3";

function explain(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
    if (detail) return detail;
  }
  return error instanceof Error ? error.message : "This output is unavailable.";
}

function readable(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Unavailable";
  if (typeof value === "number") return Number.isFinite(value) ? String(Math.round(value * 1000) / 1000) : "Unavailable";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) return value.map(readable).join(", ");
  if (typeof value === "object") return Object.entries(value).map(([key, item]) => `${key.replaceAll("_", " ")}: ${readable(item)}`).join(" · ");
  return String(value);
}

function DataGrid({ data }: { data: Record<string, unknown> }) {
  return <dl className="mt-2 grid gap-2 sm:grid-cols-2">{Object.entries(data).filter(([, value]) => value !== null && value !== undefined && value !== "" && typeof value !== "object").map(([key, value]) => <div key={key} className={cardStyle}><dt className="text-xs capitalize text-slate-400">{key.replaceAll("_", " ")}</dt><dd className="break-words text-sm text-slate-100">{readable(value)}</dd></div>)}</dl>;
}

function printReport(report: LearningBusinessReport) {
  const popup = window.open("", "_blank");
  if (!popup) return false;
  popup.opener = null;
  popup.document.title = report.title;
  const style = popup.document.createElement("style");
  style.textContent = "body{font:14px/1.5 system-ui,sans-serif;max-width:800px;margin:40px auto;color:#172033;padding:0 18px}h1{font-size:26px}h2{font-size:18px;margin-top:28px;border-bottom:1px solid #ccd;padding-bottom:5px}p{white-space:pre-wrap}small{color:#555}@media print{body{margin:20mm auto}}";
  popup.document.head.append(style);
  const add = (tag: string, value: string) => { const element = popup.document.createElement(tag); element.textContent = value; popup.document.body.append(element); };
  add("h1", report.title);
  add("small", `${report.status} · ${new Date(report.generated_at).toLocaleString()}`);
  add("h2", "Executive Summary"); add("p", report.executive_summary);
  if (report.model_card.intended_use) { add("h2", "Intended Use"); add("p", report.model_card.intended_use); }
  if (report.model_card.baseline) { add("h2", "Baseline"); add("p", report.model_card.baseline); }
  add("h2", "Best Model"); add("p", `${readable(report.model_card.result.model)} · ${readable(report.model_card.result.task)}`);
  if (report.model_card.result.dataset_identity) { add("h2", "Dataset Identity"); add("p", report.model_card.result.dataset_identity); }
  if (report.model_card.result.dataset_summary && Object.keys(report.model_card.result.dataset_summary).length) { add("h2", "Dataset Overview"); add("p", readable(report.model_card.result.dataset_summary)); }
  if (report.model_card.result.features?.length) { add("h2", "Input Features"); add("p", report.model_card.result.features.join(", ")); }
  if (report.model_card.result.configuration && Object.keys(report.model_card.result.configuration).length) { add("h2", "Training Configuration"); add("p", readable(report.model_card.result.configuration)); }
  if (report.model_card.result.cluster_profiles && Object.keys(report.model_card.result.cluster_profiles).length) { add("h2", "Cluster Profiles"); add("p", readable(report.model_card.result.cluster_profiles)); }
  const metrics = report.model_card.result.metrics || {};
  if (Object.keys(metrics).length) { add("h2", "Saved Evaluation Metrics"); for (const [key, value] of Object.entries(metrics)) add("p", `${key.replaceAll("_", " ")}: ${readable(value)}`); }
  if (report.model_comparison?.length) { add("h2", "Model Comparison"); report.model_comparison.forEach((item) => add("p", `${readable(item.model)} · ${readable(item.primary_metric)} ${readable(item.score)}`)); }
  for (const section of report.sections) {
    add("h2", section.title);
    add("p", section.learner_response);
    if (section.choice) add("small", `Learner selection: ${section.choice.replaceAll("_", " ")}`);
    if (section.verified_metric_value !== null && section.verified_metric_value !== undefined) add("small", `Verified saved metric: ${section.metric || "Metric"} ${readable(section.verified_metric_value)}`);
  }
  if (report.model_card.limitations.length) { add("h2", "Limitations"); report.model_card.limitations.forEach((item) => add("p", item)); }
  if (report.future_improvement_areas) { add("h2", "Future Improvement Areas"); add("p", report.future_improvement_areas); }
  popup.focus(); popup.print();
  return true;
}

export function CapstoneOutputs({ topicId, reference, completed }: { topicId: string; reference: string; completed: boolean }) {
  const [view, setView] = useState<"card" | "report" | "experiments" | "">("");
  const [modelCard, setModelCard] = useState<LearningModelCard | null>(null);
  const [report, setReport] = useState<LearningBusinessReport | null>(null);
  const [experiments, setExperiments] = useState<LearningExperiment[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!completed || !reference) return;
    let active = true;
    learningService.modelCard(topicId).then((value) => { if (active) setModelCard(value); }).catch(() => {});
    return () => { active = false; };
  }, [topicId, reference, completed]);

  if (!reference) return null;

  async function open(next: "card" | "report" | "experiments") {
    setBusy(true); setMessage("");
    try {
      if (next === "card") setModelCard(await learningService.modelCard(topicId));
      if (next === "report") setReport(await learningService.businessReport(topicId));
      if (next === "experiments") setExperiments(await learningService.experiments(topicId));
      setView(next);
    } catch (error) { setMessage(explain(error)); }
    finally { setBusy(false); }
  }

  async function download() {
    if (!completed) return;
    setBusy(true); setMessage("");
    try {
      const blob = await learningService.downloadModelPackage(topicId);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${topicId}-model.zip`;
      document.body.append(anchor); anchor.click(); anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (error) { setMessage(explain(error)); }
    finally { setBusy(false); }
  }

  const selectedRuns = compare.map((id) => experiments.find((item) => item.id === id)).filter((item): item is LearningExperiment => Boolean(item));
  const baseline = experiments.find((item) => /logistic regression|linear regression|kmeans/i.test(item.model || "") && item.score !== null && item.score !== undefined);
  const winner = experiments.find((item) => item.id === reference);
  const metricKeys = selectedRuns.length ? Object.keys(selectedRuns[0].metrics).filter((key) => selectedRuns.every((item) => typeof item.metrics[key] === "number")) : [];

  return <section className="mt-4 rounded-xl border border-blue-900/70 bg-blue-950/20 p-4">
    <h3 className="font-semibold text-white">{completed ? "Project complete" : "Capstone outputs"}</h3>
    <p className="mt-1 text-sm text-slate-400">{completed ? "Review your model, reasoning and business decision." : "Model card and experiment history are available now. The final report and model package unlock when the capstone is complete."}</p>
    {completed && modelCard && <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p><strong>Business problem:</strong> {modelCard.business_problem}</p><p><strong>Best model:</strong> {readable(modelCard.result.model)}</p><p><strong>Primary metric:</strong> {readable(modelCard.result.optimization_metric)}</p><p><strong>Recommendation:</strong> {readable(modelCard.recommendation)?.replaceAll("_", " ")}</p></div>}
    <div className="mt-3 flex flex-wrap gap-2"><button className={button} disabled={busy} onClick={() => void open("card")}>View Model Card</button><button className={button} disabled={busy || !completed} onClick={() => void download()}>Download Model Package</button><button className={button} disabled={busy} onClick={() => void open("report")}>View Business Report</button><button className={button} disabled={busy} onClick={() => void open("experiments")}>View Experiments</button></div>
    {message && <p role="status" className="mt-3 text-sm text-amber-300">{message}</p>}
    {view === "card" && modelCard && <div className="mt-4 space-y-3 text-sm"><h4 className="font-semibold">Model Card</h4><p><strong>Problem:</strong> {modelCard.business_problem}</p>{modelCard.intended_use && <p><strong>Intended use:</strong> {modelCard.intended_use}</p>}<DataGrid data={modelCard.result as Record<string, unknown>} />{modelCard.result.dataset_summary && Object.keys(modelCard.result.dataset_summary).length > 0 && <p><strong>Dataset overview:</strong> {readable(modelCard.result.dataset_summary)}</p>}{modelCard.result.configuration && Object.keys(modelCard.result.configuration).length > 0 && <p><strong>Training configuration:</strong> {readable(modelCard.result.configuration)}</p>}{modelCard.result.cluster_profiles && Object.keys(modelCard.result.cluster_profiles).length > 0 && <p><strong>Cluster profiles:</strong> {readable(modelCard.result.cluster_profiles)}</p>}{modelCard.result.features?.length ? <p><strong>Input features:</strong> {modelCard.result.features.join(", ")}</p> : null}{Array.isArray(modelCard.result.classes) && modelCard.result.classes.length > 0 ? <p><strong>Classes:</strong> {modelCard.result.classes.map(readable).join(", ")}</p> : null}{modelCard.baseline && <p><strong>Baseline:</strong> {modelCard.baseline}</p>}{Object.keys(modelCard.result.metrics || {}).length > 0 && <div><h5 className="font-medium">Saved performance</h5><DataGrid data={modelCard.result.metrics || {}} /></div>}{modelCard.learner_interpretation && <p><strong>Learner interpretation:</strong> {modelCard.learner_interpretation}</p>}{modelCard.recommendation && <p><strong>Business recommendation:</strong> {modelCard.recommendation.replaceAll("_", " ")} · {modelCard.recommendation_explanation}</p>}{modelCard.limitations.length > 0 && <div><h5 className="font-medium">Limitations</h5><ul className="mt-1 list-disc pl-5 text-slate-300">{modelCard.limitations.map((item) => <li key={item}>{item}</li>)}</ul></div>}</div>}
    {view === "report" && report && <div className="mt-4 space-y-3 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-semibold">{report.status === "FINAL" ? "Business Case Report" : "Draft Business Case Report"}</h4><button className={button} disabled={report.status !== "FINAL"} onClick={() => { if (!printReport(report)) setMessage("Allow pop-ups to print or save this report as PDF."); }}>Print / Save as PDF</button></div><p className="text-slate-300">{report.executive_summary}</p>{report.model_comparison?.length ? <div className={cardStyle}><h5 className="font-medium">Model comparison</h5>{report.model_comparison.map((item, index) => <p key={index} className="mt-1 text-slate-300">{readable(item.model)} · {readable(item.primary_metric)} {readable(item.score)}</p>)}</div> : null}{report.sections.map((section) => <div key={section.title} className={cardStyle}><h5 className="font-medium">{section.title}</h5><p className="mt-1 whitespace-pre-wrap text-slate-300">{section.learner_response}</p>{section.verified_metric_value !== null && section.verified_metric_value !== undefined && <p className="mt-1 text-xs text-blue-300">Verified saved metric: {section.metric} {readable(section.verified_metric_value)}</p>}</div>)}{report.future_improvement_areas && <div className={cardStyle}><h5 className="font-medium">Future improvement areas</h5><p className="mt-1 whitespace-pre-wrap text-slate-300">{report.future_improvement_areas}</p></div>}</div>}
    {view === "experiments" && <div className="mt-4 text-sm"><h4 className="font-semibold">Saved experiments</h4>{!experiments.length && <p className="mt-2 text-slate-400">No compatible saved experiments are available.</p>}{experiments.length > 0 && <div className="mt-2 space-y-2">{experiments.map((item) => <label key={item.id} className="flex items-start gap-2 rounded-lg border border-slate-700 p-2"><input type="checkbox" className="mt-1" checked={compare.includes(item.id)} onChange={() => setCompare((old) => old.includes(item.id) ? old.filter((id) => id !== item.id) : old.length < 3 ? [...old, item.id] : old)} /><span><strong>{item.model || "Saved model"}</strong> · {item.task} · {item.primary_metric || "Metric unavailable"} {readable(item.score)}<span className="block text-xs text-slate-400">{item.trained_at ? new Date(item.trained_at).toLocaleString() : "Date unavailable"} · {item.status}</span></span></label>)}</div>}{selectedRuns.length >= 2 && <div className="mt-4 overflow-x-auto"><h5 className="font-medium">Compare selected experiments ({selectedRuns.length}/3)</h5><table className="mt-2 min-w-full text-left text-xs"><thead><tr><th className="p-2">Measure</th>{selectedRuns.map((item) => <th className="p-2" key={item.id}>{item.model}</th>)}</tr></thead><tbody>{["task", "primary_metric", "score", "trained_at"].map((key) => <tr key={key} className="border-t border-slate-800"><th className="p-2 capitalize">{key.replaceAll("_", " ")}</th>{selectedRuns.map((item) => <td className="p-2" key={item.id}>{readable(item[key as keyof LearningExperiment])}</td>)}</tr>)}{metricKeys.map((key) => <tr key={key} className="border-t border-slate-800"><th className="p-2 capitalize">{key.replaceAll("_", " ")}</th>{selectedRuns.map((item) => <td className="p-2" key={item.id}>{readable(item.metrics[key])}</td>)}</tr>)}</tbody></table></div>}{baseline && winner && baseline.id !== winner.id && baseline.primary_metric === winner.primary_metric && typeof baseline.score === "number" && typeof winner.score === "number" && <p className="mt-3 text-xs text-slate-400">Simple-model reference: {baseline.model} {readable(baseline.score)} · Selected model: {winner.model} {readable(winner.score)} · {/[Mm][Aa][Ee]|[Rr][Mm][Ss][Ee]|[Mm][Aa][Pp][Ee]|davies/.test(winner.primary_metric || "") ? "Error reduction" : "Score change"}: {readable((/[Mm][Aa][Ee]|[Rr][Mm][Ss][Ee]|[Mm][Aa][Pp][Ee]|davies/.test(winner.primary_metric || "") ? baseline.score - winner.score : winner.score - baseline.score))}. This descriptive difference is not a significance test.</p>}</div>}
  </section>;
}
