"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import genaiService from "@/services/genai.service";
import type { EvidenceRecord, ResearchStatus } from "@/types/evidence";

import { classLabel, featureLabel, metricAliases, metricLabel, metricValue, readableWords, savedResearchStatus } from "@/lib/genaiEvidenceDisplay";

const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
function Bars({ data, label }: { data: Array<{ name: string; value: number; raw_name?: string }>; label: string }) {
  if (!data.length) return null;
  return <div aria-label={label} className="mt-2 w-full" style={{ height: Math.max(160, data.length * 25) }}>
    <ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={data} margin={{ left: 10, right: 20 }}>
      <CartesianGrid stroke="#334155" horizontal={false} /><XAxis type="number" stroke="#94a3b8" /><YAxis dataKey="name" type="category" width={140} stroke="#94a3b8" tick={{ fontSize: 11 }} />
      <Tooltip labelFormatter={(label, payload) => payload[0]?.payload?.raw_name ?? label} /><Bar dataKey="value" fill="#60a5fa" /></BarChart></ResponsiveContainer>
  </div>;
}
function SavedDetails({ title, value }: { title: string; value: unknown }) {
  if (value === null || value === undefined || (typeof value === "object" && !Object.keys(value).length)) return null;
  return <details className="mt-3"><summary>{title}</summary><pre className="max-h-52 overflow-auto whitespace-pre-wrap rounded bg-slate-950 p-2 text-xs">{JSON.stringify(value, null, 2)}</pre></details>;
}

function SampleTable({ title, rows }: { title: string; rows?: Array<Record<string, unknown>> }) {
  if (!rows?.length) return null;
  const columns = [...new Set(rows.flatMap(row => Object.keys(row)))].slice(0, 8);
  return <details className="mt-3"><summary>{title}</summary><p className="text-xs">Persisted native samples only; up to 30 available rows.</p><div className="max-h-64 overflow-auto"><table className="text-left text-xs"><thead><tr>{columns.map(column => <th className="p-2" key={column}>{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{columns.map(column => <td className="max-w-64 break-words p-2" key={column}>{row[column] === undefined ? "—" : (typeof row[column] === "object" ? JSON.stringify(row[column]) : String(row[column])).slice(0, 400)}</td>)}</tr>)}</tbody></table></div></details>;
}

export default function EvidenceIntelligence({ conversationId, evidenceId }: { conversationId: string; evidenceId: string }) {
  const [record, setRecord] = useState<EvidenceRecord | null>(null);
  const [error, setError] = useState("");
  const [researchStatus, setResearchStatus] = useState<ResearchStatus>("NOT_REQUESTED");
  const researchInFlight = useRef(false);
  const requestGeneration = useRef(0);
  const busy = researchStatus === "LOADING";
  const [confirmResearch, setConfirmResearch] = useState(false);
  const [retryComparison, setRetryComparison] = useState(false);
  const [limit, setLimit] = useState(10);
  const [textClass, setTextClass] = useState("");
  const [feature, setFeature] = useState("");
  useEffect(() => {
    let active = true;
    const generation = ++requestGeneration.current;
    researchInFlight.current = false;
    setResearchStatus("NOT_REQUESTED");
    setRecord(null); setError(""); setConfirmResearch(false); setRetryComparison(false);
    // Loading saved evidence never triggers training, prediction, or research.
    void genaiService.evidence(conversationId, evidenceId).then(value => {
      if (active && generation === requestGeneration.current) { setRecord(value); setResearchStatus(savedResearchStatus(value)); setFeature(Object.keys(value.native_evidence.data_views ?? {})[0] ?? ""); }
    }).catch(() => { if (active) setError("Saved evidence is unavailable."); });
    return () => { active = false; };
  }, [conversationId, evidenceId]);
  async function research() {
    if (!record || busy || researchInFlight.current) return;
    const generation = requestGeneration.current;
    researchInFlight.current = true;
    setResearchStatus("LOADING"); setError(""); setConfirmResearch(false);
    try {
      const value = await genaiService.validateEvidence(conversationId, evidenceId, record.research_evidence != null && !retryComparison);
      if (generation === requestGeneration.current) {
        setRecord(value); setResearchStatus(savedResearchStatus(value));
      }
    } catch {
      if (generation === requestGeneration.current) {
        setResearchStatus(record.research_evidence != null ? "AVAILABLE" : "FAILED");
        setError("Research validation is temporarily unavailable.");
      }
    } finally {
      if (generation === requestGeneration.current) researchInFlight.current = false;
    }
  }
  if (!record) return <div className="mt-4 rounded border border-slate-700 p-3 text-xs text-slate-400">{error || "Loading Evidence Intelligence…"}</div>;
  const native = record.native_evidence;
  const clustering = record.native_module === "automl" && record.task === "clustering";
  const classification = record.native_module === "automl" && record.task === "classification";
  const selection = native.model_selection;
  const displayFeature = (raw: string) => record.native_module === "automl" ? featureLabel(raw, native.original_features ?? []) : raw;
  const displayClass = (raw: unknown) => classLabel(raw, native.class_label_mapping ?? {});
  const items = native.ranked_items.filter(item => finite(item.value) && (!textClass || item.class_label === textClass));
  const shown = limit ? items.slice(0, limit) : items;
  const view = native.data_views?.[feature];
  const classes = [...new Set(native.ranked_items.map(item => item.class_label).filter((value): value is string => !!value))];
  const classMetrics = (native.class_metrics ?? []).map(item => ({ name: displayClass(item.label ?? item.class_name ?? item.class_id ?? "Class"), value: Number(item.f1_score ?? item.f1) })).filter(item => finite(item.value));
  const classRecall = (native.class_metrics ?? []).map(item => ({ name: displayClass(item.label ?? item.class_name ?? item.class_id ?? "Class"), value: Number(item.recall) })).filter(item => finite(item.value));
  const centroids = native.cluster_centroids ?? {};
  const centroidFeatures = [...new Set(Object.values(centroids).flatMap(row => Object.keys(row)))].slice(0, 10);
  const history = native.training_history ?? {};
  const curveKeys = Object.keys(history).filter(key => Array.isArray(history[key]) && history[key].some(finite));
  const curves = Array.from({ length: Math.max(0, ...curveKeys.map(key => history[key].length)) }, (_, index) => Object.fromEntries([["epoch", index + 1], ...curveKeys.map(key => [key, history[key][index] ?? null])]));
  const researchEvidence = record.research_evidence;
  const comparisonFailed = researchEvidence?.comparison_status === "FAILED";
  return <section className="mt-4 space-y-4 rounded-xl border border-blue-500/30 bg-slate-900 p-4 text-sm text-slate-300">
    <h3 className="font-semibold text-white">Evidence Intelligence</h3>
    <div className="border-b border-slate-700 pb-3">
      <p className="font-semibold">Native Training Result</p>
      <p>Task: {record.task ?? "Unavailable"}{record.target && <> · Target: {record.target}</>}</p>
      <p className="mt-2 font-semibold text-white">Optimization Result</p>
      <p className="text-lg font-semibold text-blue-300">{metricLabel(native.optimization_metric, record.native_module)} · {metricValue(native.optimization_metric, native.optimization_score)}</p>
      {native.optimization_metric?.endsWith("_positive") && <p className="text-xs">Positive class: {native.positive_label != null ? <>{displayClass(native.positive_label)} (native label {String(native.positive_label)})</> : "Unavailable for this historical run"}</p>}
      <p>{classification ? "Optimization Winner" : "Best model"}: {native.best_model ? readableWords(native.best_model) : "Unavailable"}</p>
      <p>Prediction support: {native.prediction_supported === true ? "Available" : native.prediction_supported === false ? "Unavailable" : "Not recorded"}</p>
      <p className="break-all text-xs">Result reference: {record.native_reference}</p>
      <p className="mt-2 text-xs">Secondary Evaluation Metrics</p>
      <div className="mt-1 flex flex-wrap gap-2">{Object.entries(native.metrics_used).filter(([key, value]) => finite(value) && !metricAliases(native.optimization_metric, record.native_module).includes(key) && !(record.native_module === "automl" && ["precision", "recall", "f1_score"].includes(key) && ({ precision: "weighted_precision", recall: "weighted_recall", f1_score: "weighted_f1" } as Record<string, string>)[key] in native.metrics_used)).map(([key, value]) => <span key={key} className="rounded bg-slate-950 px-2 py-1 text-xs">{metricLabel(key, record.native_module)}: {metricValue(key, value)}</span>)}</div>
    </div>
    {classification && <div className="border-b border-slate-700 pb-3">
      <h4 className="font-semibold text-white">Quality Assessment</h4>
      {selection ? <>
        <div className="mt-1 flex flex-wrap gap-2">{["precision_positive", "f1_positive", "accuracy", "roc_auc"].map(key => {
          const value = selection.winner_quality?.metrics?.[key];
          return finite(value) ? <span key={key} className="rounded bg-slate-950 px-2 py-1 text-xs">{metricLabel(key, "automl")}: {metricValue(key, value)}</span> : null;
        })}</div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-amber-200">{selection.quality_warnings.map((warning, index) => <li key={warning.code + index}>{warning.message}</li>)}</ul>
        <h4 className="mt-3 font-semibold text-white">Recommended Model</h4>
        <p>{selection.recommended_model ? readableWords(selection.recommended_model) : "None"}</p>
        {selection.recommended_model && <p className="text-xs">{metricLabel(selection.optimization_metric, "automl")}: {metricValue(selection.optimization_metric, selection.recommended_optimization_score)}</p>}
        <p className="mt-1 text-xs text-slate-400">{selection.recommendation_reason}</p>
      </> : <p className="text-xs text-slate-400">Recommendation analysis unavailable for this historical run.</p>}
    </div>}
    <div>
      <p className="text-xs font-semibold uppercase text-blue-300">Data / Model Evidence</p>
      <h4 className="mt-1 font-semibold">{native.label}</h4>
      <p className="text-xs">Method: {native.method}</p>
      {native.limitations.map((message, index) => <p key={index} className="mt-1 text-xs text-slate-400">{message}</p>)}
      {clustering && !!native.cluster_patterns?.length && <details className="mt-3" open><summary className="font-semibold">Cluster Pattern</summary>{native.cluster_patterns.map(pattern => <article key={pattern.cluster_id} className="mt-2 rounded border border-slate-700 p-3"><p className="font-medium">Cluster {pattern.cluster_id} · {pattern.cluster_name}</p><p className="text-xs">{pattern.profile_summary}</p>{pattern.cluster_size != null && <p className="text-xs">Native cluster size: {pattern.cluster_size}</p>}<p className="mt-2 text-xs font-semibold">Cluster Differentiators</p><ul className="list-disc pl-4 text-xs">{pattern.differentiators.map(trait => <li key={trait.feature}>{trait.native_statement}</li>)}</ul><p className="mt-2 text-xs text-slate-400">Native profile statistics; research cannot rename or prove this cluster.</p></article>)}</details>}
      {items.length > 0 && <>
        <div className="mt-2 flex flex-wrap items-center gap-2"><span>{record.native_module === "autonlp" ? "Influential text patterns" : "Model-derived feature influence"}</span>
          <select aria-label="Number of influential items" value={limit} onChange={event => setLimit(Number(event.target.value))} className="rounded bg-slate-950 p-1"><option value={5}>Top 5</option><option value={10}>Top 10</option><option value={0}>All available</option></select>
          {classes.length > 0 && <select aria-label="Text class" value={textClass} onChange={event => setTextClass(event.target.value)} className="rounded bg-slate-950 p-1"><option value="">All classes</option>{classes.map(value => <option key={value} value={value}>{displayClass(value)}</option>)}</select>}
        </div>
        <Bars label="Native influence ranking" data={shown.map(item => ({ name: item.class_label ? displayFeature(item.feature) + " · " + displayClass(item.class_label) : displayFeature(item.feature), raw_name: item.feature, value: item.value }))} />
        <details><summary className="text-xs">Raw values, methods and directions</summary><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr>{["Rank", "Feature / term", "Class", "Raw value", "Direction", "Method", "Source"].map(label => <th key={label} className="p-1">{label}</th>)}</tr></thead><tbody>{shown.map((item, index) => <tr key={index}><td className="p-1">{item.rank}</td><td>{item.feature}</td><td>{item.class_label ?? "—"}</td><td>{JSON.stringify(item.raw_value)}</td><td>{item.direction ?? "Unavailable"}{item.opposing_class && <> (opposes {item.opposing_class} when positive)</>}</td><td>{item.method}</td><td>{item.source}</td></tr>)}</tbody></table></div></details>
        {record.native_module === "autonlp" && <details><summary>Top n-grams</summary><Bars label="Native n-gram influence" data={shown.filter(item => item.feature.includes(" ")).map(item => ({ name: item.feature, value: item.value }))} /></details>}
      </>}
      {native.data_views && Object.keys(native.data_views).length > 0 && <details className="mt-3"><summary>Dataset feature distribution</summary><select aria-label="Dataset feature" value={feature} onChange={event => setFeature(event.target.value)} className="mt-2 rounded bg-slate-950 p-1">{Object.keys(native.data_views).map(value => <option key={value} value={value} title={value}>{displayFeature(value)}</option>)}</select>{view && <><p className="text-xs">DATA · First {view.sample_count} of {view.dataset_count} rows; aggregates only.</p><Bars label="Feature distribution" data={view.distribution} />{view.class_comparison.length > 0 && <><p className="text-xs">{view.class_comparison_method}; association does not establish causation.</p><Bars label="Class-wise feature comparison" data={view.class_comparison.map(item => ({ ...item, name: displayClass(item.name), raw_name: item.name }))} /></>}</>}</details>}
      {native.cluster_profiles && <details className="mt-3" open><summary>Cluster Differentiators</summary><p className="text-xs">Features that differentiate the discovered segments.</p>{Object.entries(native.cluster_profiles).map(([key, profile]) => <p key={key} className="mt-1 text-xs">Cluster {key} · {profile.segment_label}: {profile.profile}</p>)}
        {centroidFeatures.length > 0 && <><div className="mt-2 overflow-x-auto"><table className="text-xs"><thead><tr><th>Feature</th>{Object.keys(centroids).map(key => <th className="px-2" key={key}>Cluster {key}</th>)}</tr></thead><tbody>{centroidFeatures.map(name => <tr key={name}><td title={name}>{displayFeature(name)}</td>{Object.keys(centroids).map(key => <td className="px-2" key={key}>{finite(centroids[key][name]) ? centroids[key][name].toPrecision(3) : "—"}</td>)}</tr>)}</tbody></table></div><select aria-label="Cluster-profile feature" value={centroidFeatures.includes(feature) ? feature : centroidFeatures[0]} onChange={event => setFeature(event.target.value)} className="mt-2 rounded bg-slate-950 p-1">{centroidFeatures.map(name => <option key={name} value={name} title={name}>{displayFeature(name)}</option>)}</select><Bars label="Native cluster centroids" data={Object.entries(centroids).map(([key, values]) => ({ name: "Cluster " + key, value: values[centroidFeatures.includes(feature) ? feature : centroidFeatures[0]] })).filter(item => finite(item.value))} /></>}
      </details>}
      {classMetrics.length > 0 && <details className="mt-3"><summary>Per-class F1 / Recall</summary>{native.class_metrics_method && <p className="text-xs">{native.class_metrics_method}</p>}<Bars label="Per-class F1" data={classMetrics} /><Bars label="Per-class recall" data={classRecall} /></details>}
      {native.class_distribution && Object.keys(native.class_distribution).length > 0 && <details className="mt-3"><summary>Class distribution</summary><Bars label="Class distribution" data={Object.entries(native.class_distribution).map(([name, value]) => ({ name: displayClass(name), raw_name: name, value }))} /></details>}
      {!!native.confusion_matrix?.length && <details className="mt-3"><summary>Confusion matrix</summary><p className="text-xs">Rows: actual · Columns: predicted</p><div className="overflow-x-auto"><table className="mt-2 text-xs"><thead><tr><th />{native.confusion_matrix[0].map((_, index) => <th key={index} className="p-2">{displayClass(native.labels?.[index] ?? index)}</th>)}</tr></thead><tbody>{native.confusion_matrix.map((row, index) => <tr key={index}><th className="p-2">{displayClass(native.labels?.[index] ?? index)}</th>{row.map((value, column) => <td key={column} className={index === column ? "bg-blue-500/20 p-2" : "bg-slate-950 p-2"}>{value}</td>)}</tr>)}</tbody></table></div></details>}
      {curves.length > 0 && <details className="mt-3"><summary>Persisted training / validation curves</summary><div className="h-52"><ResponsiveContainer width="100%" height="100%"><LineChart data={curves}><XAxis dataKey="epoch" /><YAxis /><Tooltip /><Legend />{curveKeys.map((key, index) => <Line key={key} dataKey={key} stroke={["#60a5fa", "#34d399", "#fbbf24", "#f472b6"][index % 4]} dot={false} connectNulls={false} />)}</LineChart></ResponsiveContainer></div></details>}
      {native.confidence_distribution?.length ? <details><summary>Persisted prediction-confidence distribution</summary><p className="text-xs">Native model scores; calibration is not implied.</p><Bars label="Prediction-confidence distribution" data={native.confidence_distribution} /></details> : null}
      <SampleTable title="Misclassified samples" rows={native.misclassified_samples} />
      <SampleTable title="Low-confidence samples" rows={native.low_confidence_samples} />
      <SavedDetails title="Persisted prediction evidence" value={native.latest_prediction} />
      <SavedDetails title="Persisted evaluation samples" value={native.evaluation_visualization} />
      {record.native_module === "autodl" && <p className="mt-2 text-xs">{native.spatial_explanation?.message ?? (native.spatial_explanation?.status === "available" ? "Native spatial explanation available." : "Spatial explanation is not available for this model.")}</p>}
      {native.spatial_explanation?.image?.startsWith("data:image/png;base64,") && <Image src={native.spatial_explanation.image} alt="Persisted native spatial explanation" width={512} height={512} unoptimized className="max-h-72 object-contain" />}
    </div>
    <div className="border-t border-slate-700 pt-3">
      <h4 className="font-semibold text-emerald-300">{clustering ? "External Context" : "Research Evidence"}</h4>
      <p className="text-xs text-slate-400">{clustering ? "Sources are deduplicated and ordered by evidence-type indicators. Related news provides context; it does not verify cluster correctness." : "Sources are screened by institutional domain or research metadata. Comparisons use retrieved excerpts and do not verify model ranks."}</p>
      {researchEvidence && <><p className="text-xs">Research evidence generated: {new Date(researchEvidence.generated_at).toLocaleString()}</p><p className="text-xs text-slate-400">{researchEvidence.recency}</p>
        <details className="mt-2"><summary>{clustering ? "Sources" : "Retrieved sources"}</summary>{(researchEvidence.sources ?? []).map(source => <div key={source.id} className="mt-2"><a href={source.url} target="_blank" rel="noreferrer" className="text-blue-300 underline">{source.title}</a><p className="text-xs">{source.source} · {source.publication_date ?? "Publication date unavailable"}</p><p className="text-xs">{source.evidence_statement}</p>{clustering && <p className="text-xs text-slate-400">{source.quality_category?.replaceAll("_", " ")} · {source.quality_note}{!(researchEvidence.feature_theme_mappings ?? []).some(row => row.citations.some(citation => citation.source_id === source.id)) && " · No accepted cluster match recorded."}</p>}</div>)}</details>
        {clustering ? <div className="mt-3"><h4 className="font-semibold">Evidence Match</h4>{(researchEvidence.feature_theme_mappings ?? []).map(item => <article key={item.finding_id} className="mt-2 rounded border border-slate-700 p-3"><p className="font-medium">{item.cluster_id ? "Cluster " + item.cluster_id + " · " : ""}{item.feature}</p><p className="text-xs text-emerald-200">{item.agreement}</p><p className="mt-1 text-xs">{item.evidence_statement}</p>{item.source_matches?.map(match => <div key={match.source_id} className="mt-2 border-t border-slate-800 pt-2 text-xs"><p>Attributes referenced: {match.matched_differentiators.join(", ") || "Related context only"} · {match.match_status}</p><p>{match.rationale}</p><p className="mt-1">“{match.citation.quote}”</p><a href={match.citation.url} target="_blank" rel="noreferrer" className="text-blue-300 underline">{match.citation.title}</a></div>)}{!item.source_matches?.length && item.citations.map(citation => <a key={citation.source_id} href={citation.url} target="_blank" rel="noreferrer" className="mr-2 text-xs text-blue-300 underline">{citation.title}</a>)}<h5 className="mt-2 text-xs font-semibold">Business Interpretation</h5><p className="text-xs">{item.business_interpretation || "Interpret the native profile separately; historical external context has not verified this cluster."}</p></article>)}</div> : <><h4 className="mt-3 font-semibold">Evidence Comparison</h4><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr><th className="p-2">Feature / theme</th><th>Model rank</th><th>Research evidence</th><th>Agreement</th></tr></thead><tbody>{(researchEvidence.feature_theme_mappings ?? []).map(item => <tr key={item.finding_id}><td className="p-2">{item.feature}</td><td>{item.model_rank ? "#" + item.model_rank : "—"}</td><td className="p-2">{item.evidence_statement}{(item.citations ?? []).map(citation => <a key={citation.source_id} href={citation.url} target="_blank" rel="noreferrer" className="ml-2 text-blue-300 underline">{citation.title}{citation.date ? " (" + citation.date + ")" : ""}</a>)}</td><td>{item.agreement}</td></tr>)}</tbody></table></div></> }</>}
      {(researchStatus === "NOT_REQUESTED" || researchStatus === "READY") && <p className="mt-2 text-xs text-slate-400">{clustering ? "Find external patterns or related context for measured cluster profiles. This cannot prove the clusters are correct." : "Validate the model findings against recent external research and credible sources. Research is optional and is not used to train this model."}</p>}
      {researchStatus === "LOADING" && <p role="status" className="mt-2 text-xs text-slate-400">Searching credible external evidence...</p>}
      {comparisonFailed && <p role="alert" className="mt-2 text-xs text-amber-300">Research sources were retrieved, but automated comparison is temporarily unavailable.</p>}
      {(researchStatus === "FAILED" || (!comparisonFailed && researchStatus === "AVAILABLE" && (record.research_error === "Research validation is temporarily unavailable." || error))) && <p role="alert" className="mt-2 text-xs text-amber-300">Research validation is temporarily unavailable.</p>}
      {!confirmResearch ? <button type="button" disabled={busy || !(native.research_findings?.length)} onClick={() => { setRetryComparison(comparisonFailed); setConfirmResearch(true); }} className="mt-3 rounded border border-emerald-400/40 px-3 py-1.5 text-emerald-200 disabled:opacity-40">{busy ? "Searching…" : researchStatus === "FAILED" ? "Try Again" : comparisonFailed ? "Retry Comparison" : researchEvidence ? "Refresh Research" : "Validate with Research"}</button>
        : <div className="mt-3 rounded border border-emerald-400/30 p-3"><p className="text-xs">{retryComparison ? "Confirm automated comparison using saved research sources? This uses AI without repeating the external search." : clustering ? "Confirm external context search? This sends measured cluster patterns and business context, not dataset rows. External sources cannot prove cluster correctness." : "Confirm external research validation? This sends the task context, target and top feature/theme names to the configured search service and uses AI to compare retrieved excerpts. It does not send dataset rows."}</p><div className="mt-2 flex gap-2"><button type="button" disabled={busy} onClick={() => void research()} className="rounded bg-emerald-600 px-3 py-1.5 text-white">Confirm Research</button><button type="button" onClick={() => setConfirmResearch(false)} className="px-3 py-1.5">Cancel</button></div></div>}
      {comparisonFailed && !confirmResearch && <button type="button" disabled={busy} onClick={() => { setRetryComparison(false); setConfirmResearch(true); }} className="ml-2 rounded border border-emerald-400/40 px-3 py-1.5 text-emerald-200 disabled:opacity-40">Refresh Research</button>}
    </div>
    <p className="border-t border-slate-700 pt-3 text-xs text-slate-400">{record.disclaimer}</p>
  </section>;
}
