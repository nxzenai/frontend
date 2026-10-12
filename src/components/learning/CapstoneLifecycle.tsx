"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { learningService } from "@/services/learning.service";
import type { CapstoneLifecycle as Lifecycle } from "@/types/learning";
import { CapstoneOutputs } from "@/components/learning/CapstoneOutputs";

const box = "rounded-xl border border-slate-800 bg-slate-900/70 p-4";
const field = "w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100";
const action = "rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50";

function message(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const detail = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail;
    if (detail) return detail;
  }
  return error instanceof Error ? error.message : "The stage could not be saved.";
}

export function CapstoneLifecycle({ topicId, module, startedAt, labHref, onProgress }: {
  topicId: string; module: string; startedAt?: string; labHref: (url: string) => string; onProgress: () => void;
}) {
  const [data, setData] = useState<Lifecycle | null>(null);
  const [active, setActive] = useState("");
  const [choice, setChoice] = useState("");
  const [metric, setMetric] = useState("");
  const [response, setResponse] = useState("");
  const [reference, setReference] = useState("");
  const [options, setOptions] = useState<Array<{ id: string; label: string; task?: string }>>([]);
  const [edaOptions, setEdaOptions] = useState<Array<{ id: string; label: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let mounted = true;
    learningService.capstone(topicId).then((value) => {
      if (mounted) {
        setData(value);
        const visible = value.stages.filter(stage => value.expected_task !== "clustering" || stage.id !== "PREDICTION" || value.prediction_supported === true);
        setActive(visible.find(stage => stage.status === "NOT_STARTED")?.id || visible[0]?.id || "");
      }
    }).catch((error) => { if (mounted) setFeedback(message(error)); });
    return () => { mounted = false; };
  }, [topicId, startedAt]);

  useEffect(() => {
    if (active !== "MODEL_DEVELOPMENT" && active !== "VERIFICATION") return;
    learningService.evidenceOptions(module, topicId).then(setOptions).catch((error) => setFeedback(message(error)));
  }, [active, module, topicId]);

  useEffect(() => {
    if (active === "EDA" && module === "automl") {
      learningService.evidenceOptions("eda").then(setEdaOptions).catch(() => setEdaOptions([]));
    }
  }, [active, module]);

  const stage = data?.stages.find((item) => item.id === active && (data.expected_task !== "clustering" || item.id !== "PREDICTION" || data.prediction_supported === true));
  const selectedResult = data?.stages.find((item) => item.id === "MODEL_DEVELOPMENT")?.reference || "";
  const chooseStage = (id: string) => {
    const item = data?.stages.find((entry) => entry.id === id);
    setActive(id);
    setChoice(item?.choice || "");
    setResponse(item?.response || "");
    setReference(item?.reference || "");
    setMetric(item?.metric || "");
    setFeedback("");
  };
  const save = async (draft = false) => {
    if (!stage || busy) return;
    setBusy(true);
    setFeedback("");
    try {
      if (stage.id === "VERIFICATION") {
        await learningService.verifyEvidence(topicId, selectedResult);
        setData(await learningService.capstone(topicId));
      } else {
        setData(await learningService.completeCapstoneStage(topicId, stage.id, { draft, choice, metric, response, reference }));
      }
      onProgress();
      setFeedback(draft ? "Draft saved. This stage is not complete yet." : "Stage saved.");
    } catch (error) {
      setFeedback(message(error));
    } finally {
      setBusy(false);
    }
  };

  if (!data) return <section className={box}><h3 className="font-semibold">Capstone lifecycle</h3><p className="mt-2 text-sm text-slate-400">{feedback || "Loading capstone stages…"}</p></section>;
  return <section className={box}>
    <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold">Capstone lifecycle</h3><p className="mt-1 text-sm text-slate-400">{data.completed ? "Capstone completed" : `${data.completed_stages} / ${data.stages.length} stages recorded`}</p></div><Link className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800" href={labHref(data.lab_url)}>Open {module.toUpperCase()} lab</Link></div>
    <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/60 p-3 text-sm"><p className="font-medium text-white">Business problem</p><p className="mt-1 text-slate-300">{data.business_problem}</p><p className="mt-2 text-slate-400">Stakeholder: {data.stakeholder}</p><p className="text-slate-400">If wrong: {data.wrong_prediction_consequence}</p></div>
    {data.missing_prerequisites.length > 0 && <p className="mt-3 text-sm text-amber-300">Master the listed foundation prerequisites before starting this workflow.</p>}
    {!!data.learner_lifecycle?.length && <details className="mt-4 rounded-lg border border-slate-700 p-3"><summary className="cursor-pointer font-medium">The wider {data.expected_task.replaceAll("_", " ")} lifecycle</summary><p className="mt-2 text-xs text-slate-400">These concepts describe an iterative process. The evidence workflow below groups related concepts and retains existing capstone progress; one saved stage does not prove mastery of every concept.</p><ol className="mt-3 list-inside list-decimal space-y-2">{data.learner_lifecycle.map(item => <li key={item.id} className="text-sm"><strong>{item.title}</strong><p className="ml-4 text-xs text-slate-400">{item.description}</p></li>)}</ol></details>}
    <p className="mt-4 text-xs font-semibold text-slate-400">Capstone evidence workflow · existing stage records</p>
    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{data.stages.filter(item => data.expected_task !== "clustering" || item.id !== "PREDICTION" || data.prediction_supported === true).map((item) => <button type="button" key={item.id} onClick={() => chooseStage(item.id)} className={`rounded-lg border p-2 text-left text-sm ${active === item.id ? "border-blue-400 bg-blue-500/10" : "border-slate-700 hover:bg-slate-800"}`}><span className="block font-medium">{item.status === "COMPLETED" ? "✓" : item.status === "BLOCKED" ? "○" : "→"} {item.learner_stage || item.title}</span><span className="text-xs text-slate-400">{item.status.replaceAll("_", " ")}{item.required ? " · Required" : " · Optional"}</span></button>)}</div>
    <CapstoneOutputs topicId={topicId} reference={selectedResult} completed={data.completed} />
    {stage && <div className="mt-4 rounded-lg border border-slate-700 p-3"><h4 className="font-medium">{stage.learner_stage || stage.title}</h4>{stage.description && <p className="mt-1 text-xs text-slate-400">{stage.description}</p>}<p className="mt-1 text-sm text-slate-400">{stage.instruction}</p>
      {stage.lab_url && <Link className="mt-2 inline-block text-sm text-blue-300 underline" href={labHref(stage.lab_url)}>Open related lab</Link>}
      {stage.id === "EDA" && module === "automl" && <Link className="ml-3 mt-2 inline-block text-sm text-blue-300 underline" href={labHref("/eda")}>Open in EDA Hub</Link>}
      {stage.id === "PROBLEM_FORMULATION" && <div className="mt-3 grid gap-2 sm:grid-cols-2"><label className="text-xs text-slate-400">Task<select className={`${field} mt-1`} value={choice} onChange={(event) => setChoice(event.target.value)}><option value="">Choose task</option><option value={data.expected_task}>{data.expected_task.replaceAll("_", " ")}</option></select></label><label className="text-xs text-slate-400">Primary metric<select className={`${field} mt-1`} value={metric} onChange={(event) => setMetric(event.target.value)}><option value="">Choose metric</option>{data.metrics.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label></div>}
      {stage.id === "EVALUATION" && <label className="mt-3 block text-xs text-slate-400">Metric observed in lab<select className={`${field} mt-1`} value={choice} onChange={(event) => setChoice(event.target.value)}><option value="">Choose metric</option>{data.metrics.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>}
      {stage.id === "EVALUATION" && <p className="mt-2 text-xs text-slate-400">{data.historical_metrics_unavailable ? "Detailed metrics unavailable for this older artifact. Continue with an interpretation; no metric value will be invented." : Object.keys(data.result_metrics).length ? `Saved result metrics: ${Object.entries(data.result_metrics).map(([key, value]) => `${key.replaceAll("_", " ")} ${value}`).join(" · ")}` : "No evaluation metric is available for this saved result. Review the lab result before continuing."}</p>}
      {stage.id === "BUSINESS_RECOMMENDATION" && <label className="mt-3 block text-xs text-slate-400">Your recommendation<select className={`${field} mt-1`} value={choice} onChange={(event) => setChoice(event.target.value)}><option value="">Choose a decision</option><option value="DEPLOY">Deploy</option><option value="IMPROVE">Improve</option><option value="NOT_READY">Not ready</option></select></label>}
      {stage.id === "ERROR_ANALYSIS" && <label className="mt-3 block text-xs text-slate-400">Pattern to investigate<select className={`${field} mt-1`} value={choice} onChange={(event) => setChoice(event.target.value)}><option value="">Choose a pattern</option>{data.error_choices.map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select></label>}
      {stage.id === "INTERPRETATION" && <label className="mt-3 block text-xs text-slate-400">Your interpretation<select className={`${field} mt-1`} value={choice} onChange={(event) => setChoice(event.target.value)}><option value="">Choose an interpretation</option><option value="SUITABLE_WITH_REVIEW">Suitable with human review</option><option value="NEEDS_IMPROVEMENT">Needs improvement</option><option value="INSUFFICIENT_EVIDENCE">Insufficient evidence</option></select></label>}
      {stage.id === "MODEL_DEVELOPMENT" && <label className="mt-3 block text-xs text-slate-400">Compatible saved result<select className={`${field} mt-1`} value={reference} onChange={(event) => setReference(event.target.value)}><option value="">Select completed result</option>{options.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>{!options.length && <span className="mt-1 block text-amber-300">No compatible saved result yet. Train a new result after starting this capstone, or review the optional EDA dataset binding.</span>}</label>}
      {stage.id === "MODEL_DEVELOPMENT" && selectedResult && <p className="mt-2 text-xs text-slate-400">{data.dataset_identity_verified ? "This capstone is bound to the selected result's stored dataset identity." : "This saved result has no stable dataset identity; ownership, task and timing are checked, but exact dataset matching is unverified."}</p>}
      {module === "automl" && stage.id === "MODEL_DEVELOPMENT" && data.selected_result_available === false && <p className="mt-2 text-xs text-amber-300">The previously selected artifact is no longer available. Its evidence cannot be verified.</p>}
      {stage.id === "EDA" && module === "automl" && <label className="mt-3 block text-xs text-slate-400">Owned EDA report (optional)<select className={`${field} mt-1`} value={reference} onChange={(event) => setReference(event.target.value)}><option value="">No report selected</option>{edaOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><span className="mt-1 block">{!stage.reference && !reference ? "Select a report to check its dataset after choosing a saved AutoML result." : data.eda_dataset_match === "matched" ? "Dataset matched ✓" : data.eda_dataset_match === "mismatch" ? "Dataset mismatch: this report does not verify the capstone dataset." : data.eda_dataset_match === "pending" ? "Dataset match pending until a saved AutoML result is selected." : "Dataset match cannot be verified for this older report or artifact."}</span></label>}
      {stage.id === "VERIFICATION" && <p className="mt-3 text-sm text-slate-300">Selected result: {options.find((item) => item.id === selectedResult)?.label || (selectedResult ? "Saved result selected earlier" : "No result selected")}. Ownership, task, timing and prior use are checked again on verification.</p>}
      {stage.id !== "MODEL_DEVELOPMENT" && stage.id !== "VERIFICATION" && <label className="mt-3 block text-xs text-slate-400">Your observation or reasoning<textarea className={`${field} mt-1`} rows={3} value={response} onChange={(event) => setResponse(event.target.value)} placeholder={stage.id === "EVALUATION" ? "Interpret the saved metric and compare it with your baseline where possible." : "Write a specific observation from your work."} /></label>}
      {stage.id === "BASELINE" && <p className="mt-2 text-xs text-slate-400">Use an existing simple model where available. Otherwise describe a conceptual baseline; no extra model is trained here.</p>}
      {stage.id === "DATA_PREPARATION" && <p className="mt-2 text-xs text-slate-400">What NxZenAI will do: {data.preparation_summary}</p>}
      {stage.id === "PREDICTION" && module === "automl" && <p className="mt-2 text-xs text-slate-400">{stage.required ? data.prediction_verified ? "Verified inference ✓" : "No verified prediction yet. Run a manual or CSV prediction with the selected saved model." : "This model does not support prediction for new rows; this stage is optional."}</p>}
      {stage.id === "EVALUATION" && <p className="mt-2 text-xs text-slate-400">{stage.metric_verified ? `Verified saved metric: ${stage.choice?.replaceAll("_", " ")} ${stage.metric_value}` : "Your interpretation is recorded separately from verified saved-result metrics."}</p>}
      <div className="mt-3 flex flex-wrap gap-2"><button className={action} disabled={busy || stage.status === "BLOCKED" || stage.status === "COMPLETED" && !(stage.id === "EDA" && !selectedResult) || stage.id === "VERIFICATION" && !selectedResult} onClick={() => void save()}>{stage.id === "VERIFICATION" ? "Verify saved result" : stage.id === "EDA" && stage.status === "COMPLETED" ? "Update EDA stage" : "Complete stage"}</button>{stage.id !== "VERIFICATION" && <button className="rounded-lg border border-slate-700 px-3 py-2 text-sm disabled:opacity-50" disabled={busy || stage.status === "BLOCKED" || stage.status === "COMPLETED"} onClick={() => void save(true)}>Save draft</button>}</div>
      {feedback && <p className="mt-2 text-sm text-blue-200" role="status">{feedback}</p>}
    </div>}
  </section>;
}
