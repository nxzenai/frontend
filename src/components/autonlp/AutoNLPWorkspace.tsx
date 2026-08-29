"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Upload } from "lucide-react";

import AIModelRegistryPanel from "@/components/ai-registry/AIModelRegistryPanel";
import { ClassMetricsChart, ConfusionMatrixView, RocCurveView, TrainingCurves } from "@/components/ai/TrainingVisuals";
import AutoNLPService from "@/services/autonlp.service";
import type { AutoNLPBatchPredictionResponse, AutoNLPDatasetInspection, AutoNLPModelSummary, AutoNLPPredictResponse, AutoNLPTrainResponse } from "@/types/autonlp";
import { NLPArchitecture, NLPTask } from "@/types/autonlp";


const MODEL_LABELS: Record<string, string> = {
  logistic_regression: "TF-IDF + Logistic Regression",
  linear_svm: "TF-IDF + Linear SVM",
  naive_bayes: "TF-IDF + Naive Bayes",
  sgd_classifier: "TF-IDF + SGD Classifier",
  lstm: "LSTM", bilstm: "BiLSTM", gru: "GRU", minilm: "MiniLM", distilbert: "DistilBERT",
};
const ADVANCED_CPU_MODELS = new Set<NLPArchitecture>([
  NLPArchitecture.LSTM, NLPArchitecture.BILSTM, NLPArchitecture.GRU,
  NLPArchitecture.MINILM, NLPArchitecture.DISTILBERT,
]);
const SEMANTIC_TASKS = new Set<NLPTask>([
  NLPTask.SENTIMENT_ANALYSIS, NLPTask.SPAM_CLASSIFICATION,
]);

function percent(value?: number | null) {
  return value == null ? "—" : `${(value * 100).toFixed(1)}%`;
}

function errorMessage(error: any, fallback: string) {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail.message === "string") return detail.message;
  return error?.message ?? fallback;
}

export default function AutoNLPWorkspace() {
  const [file, setFile] = useState<File | null>(null);
  const [inspection, setInspection] = useState<AutoNLPDatasetInspection | null>(null);
  const [textColumn, setTextColumn] = useState("");
  const [targetColumn, setTargetColumn] = useState("");
  const [task, setTask] = useState<NLPTask>(NLPTask.TEXT_CLASSIFICATION);
  const [strategy, setStrategy] = useState<"auto" | "custom">("auto");
  const [models, setModels] = useState<NLPArchitecture[]>([]);
  const [labelMeanings, setLabelMeanings] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [maxEpochs, setMaxEpochs] = useState(10);
  const [result, setResult] = useState<AutoNLPTrainResponse | null>(null);
  const [savedModels, setSavedModels] = useState<AutoNLPModelSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [predictionText, setPredictionText] = useState("");
  const [prediction, setPrediction] = useState<AutoNLPPredictResponse | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchResult, setBatchResult] = useState<AutoNLPBatchPredictionResponse | null>(null);

  const requestedCandidates = useMemo(
    () => strategy === "custom" ? models : (inspection?.auto_candidate_architectures ?? []),
    [strategy, models, inspection],
  );
  const labelMeaningsConfirmed = Object.entries(labelMeanings).every(([, value]) => value.trim()) && (
    !SEMANTIC_TASKS.has(task) ||
    (inspection?.label_mapping_reliable === true && inspection.detected_task === task) ||
    Object.entries(labelMeanings).some(([technical, meaning]) => technical.toLowerCase() !== meaning.trim().toLowerCase())
  );

  function clearActiveModel() {
    setResult(null); setPrediction(null); setPredictionText(""); setBatchFile(null); setBatchResult(null);
  }

  useEffect(() => { void AutoNLPService.listModels().then(setSavedModels).catch(() => setSavedModels([])); }, []);

  async function inspect(selected: File, selectedText = textColumn, selectedTarget = targetColumn) {
    setError("");
    try {
      const value = await AutoNLPService.inspect(selected, selectedText || undefined, selectedTarget || undefined);
      setInspection(value);
      if (!selectedText && value.text_candidates[0]) setTextColumn(value.text_candidates[0]);
      if (!selectedTarget && value.target_candidates[0]) setTargetColumn(value.target_candidates[0]);
      if (value.detected_task && Object.values(NLPTask).includes(value.detected_task as NLPTask)) {
        setTask(value.detected_task as NLPTask);
      }
      setLabelMeanings(value.label_display_mapping ?? {});
    } catch (reason) {
      setError(errorMessage(reason, "NxZenAI could not inspect this dataset."));
    }
  }

  useEffect(() => {
    if (file && textColumn && targetColumn) void inspect(file, textColumn, targetColumn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textColumn, targetColumn]);

  async function train() {
    if (!file || !textColumn || !targetColumn) return;
    setLoading(true); setError(""); setResult(null); setPrediction(null); setBatchResult(null);
    try {
      const value = await AutoNLPService.train({
        file, text_column: textColumn, target_column: targetColumn, task, max_epochs: maxEpochs,
        strategy, candidate_architectures: strategy === "custom" ? models : undefined,
        confirmed, label_display_mapping: labelMeanings,
      });
      setResult(value);
      setSavedModels(await AutoNLPService.listModels());
    } catch (reason) {
      setError(errorMessage(reason, "AutoNLP could not train a model from this dataset."));
    } finally { setLoading(false); }
  }

  async function predict() {
    if (!result || !predictionText.trim()) return;
    setPredicting(true); setError(""); setPrediction(null);
    try { setPrediction(await AutoNLPService.predict(result.model_id, predictionText.trim())); }
    catch (reason) { setError(errorMessage(reason, "The text could not be predicted.")); }
    finally { setPredicting(false); }
  }

  async function predictCsv() {
    if (!result || !batchFile) return;
    setError(""); setBatchResult(null);
    try { setBatchResult(await AutoNLPService.predictBatch(result.model_id, batchFile, textColumn)); }
    catch (reason) { setError(errorMessage(reason, "The CSV could not be predicted.")); }
  }

  function exportCsv() {
    if (!batchResult) return;
    const escape = (value: unknown) => {
      const raw = String(value ?? ""); const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
      return `"${safe.replaceAll('"', '""')}"`;
    };
    const lines = ["row_index,predicted_label,technical_label,model_score,vocabulary_coverage,error", ...batchResult.rows.map(row =>
      [row.row_index, row.predicted_label, row.technical_label, row.model_score, row.vocabulary_coverage, row.error].map(escape).join(","))];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `autonlp-${batchResult.model_id}-predictions.csv`; anchor.click(); URL.revokeObjectURL(url);
  }

  return <div className="space-y-8">
    <header>
      <h1 className="text-3xl font-bold text-white">AutoNLP</h1>
      <p className="mt-2 max-w-3xl text-slate-400">Upload labelled text, understand its quality, compare suitable language models, and test the saved winner.</p>
    </header>

    <div className="grid gap-3 md:grid-cols-4">
      {["Upload dataset", "Understand data", "Confirm text + target", "Confirm task", "Auto / Custom", "Train & Compare", "Best Result", "Test Your Model"].map((label, index) =>
        <div key={label} className="rounded-xl border border-slate-700 bg-slate-900 p-4"><span className="text-xs font-bold text-purple-400">{index + 1}</span><p className="mt-1 font-semibold text-white">{label}</p></div>)}
    </div>

    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="text-xl font-bold text-white">Upload and understand your data</h2>
      <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-600 bg-slate-950 p-5 text-slate-300">
        <Upload className="text-purple-400" /> {file?.name ?? "Choose CSV, XLS, or XLSX"}
        <input type="file" accept=".csv,.xls,.xlsx" className="hidden" onChange={event => {
          const selected = event.target.files?.[0] ?? null; setFile(selected); setInspection(null);
          setTextColumn(""); setTargetColumn(""); setConfirmed(false); clearActiveModel();
          setLabelMeanings({});
          if (selected) void inspect(selected, "", "");
        }} />
      </label>
      {inspection && <div className="mt-5 grid gap-3 text-sm text-slate-300 md:grid-cols-3">
        <Info label="Rows" value={inspection.row_count} />
        <Info label="Classes" value={inspection.class_count || "Choose target"} />
        <Info label="Class balance" value={inspection.imbalance_ratio == null ? "Choose target" : inspection.imbalance_ratio.toFixed(2)} />
        <Info label="Missing / blank text" value={`${inspection.missing_text_count} / ${inspection.blank_text_count}`} />
        <Info label="Exact duplicates" value={inspection.exact_duplicate_text_count} />
        <Info label="Conflicting labels" value={inspection.conflicting_duplicate_labels} />
        <Info label="Average text length" value={inspection.text_length_summary.mean ?? "—"} />
        <Info label="Approx. vocabulary" value={inspection.approximate_vocabulary_size} />
        <Info label="Recommended sequence" value={inspection.recommended_sequence_length ?? "—"} />
      </div>}
      {inspection && <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Select label="Text column" value={textColumn} values={inspection.text_candidates} onChange={value => { setTextColumn(value); setConfirmed(false); clearActiveModel(); }} />
        <Select label="Target column" value={targetColumn} values={inspection.target_candidates} onChange={value => { setTargetColumn(value); setConfirmed(false); clearActiveModel(); }} />
      </div>}
      {inspection?.detected_task && <div className="mt-5 rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-slate-300"><strong className="text-white">Problem detected:</strong> {inspection.detected_task.replaceAll("_", " ")}<p className="mt-1 text-sm text-slate-400">{inspection.task_explanation}</p></div>}
      {inspection && textColumn && targetColumn && <div className="mt-5 rounded-xl border border-slate-700 bg-slate-950 p-4">
        <label className="text-sm text-slate-300">Confirmed task
          <select value={task} onChange={event => { setTask(event.target.value as NLPTask); setConfirmed(false); clearActiveModel(); }} className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white">
            <option value={NLPTask.TEXT_CLASSIFICATION}>Text classification</option>
            <option value={NLPTask.SENTIMENT_ANALYSIS}>Sentiment analysis</option>
            <option value={NLPTask.INTENT_CLASSIFICATION}>Intent classification</option>
            <option value={NLPTask.SPAM_CLASSIFICATION}>Spam classification</option>
          </select>
        </label>
        {Object.keys(labelMeanings).length > 0 && <div className="mt-4">
          <p className="font-semibold text-white">Detected label meanings</p>
          <p className="mt-1 text-xs text-slate-500">Confirm or edit meanings. Technical labels remain available in Advanced Details.</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold uppercase text-slate-500"><span>Technical Label</span><span>Meaning</span></div>
          <div className="mt-2 space-y-2">{Object.entries(labelMeanings).map(([technical, meaning]) => <label key={technical} className="grid grid-cols-2 items-center gap-2 text-sm text-slate-300">
            <span>{technical}</span><input value={meaning} onChange={event => { setLabelMeanings(current => ({ ...current, [technical]: event.target.value })); setConfirmed(false); clearActiveModel(); }} className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white" aria-label={`Meaning for ${technical}`} />
          </label>)}</div>
        </div>}
        <p className="mt-3 text-sm text-slate-400">Text: <strong>{textColumn}</strong> · Target: <strong>{targetColumn}</strong> · Task: <strong>{task.replaceAll("_", " ")}</strong></p>
        <button onClick={() => setConfirmed(true)} disabled={!labelMeaningsConfirmed} className={`mt-4 rounded-lg px-4 py-2 font-semibold disabled:opacity-50 ${confirmed ? "bg-emerald-600 text-white" : "bg-purple-600 text-white"}`}>{confirmed ? "Confirmed" : "Confirm & Continue"}</button>
      </div>}
    </section>

    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <h2 className="text-xl font-bold text-white">Choose how NxZenAI trains</h2>
      <div className="mt-4 flex gap-3">{(["auto", "custom"] as const).map(value => <button key={value} onClick={() => { if (strategy !== value) { setStrategy(value); setModels([]); clearActiveModel(); } }} className={`rounded-lg px-4 py-2 ${strategy === value ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-300"}`}>{value === "auto" ? "Auto" : "Custom"}</button>)}</div>
      {strategy === "auto" && <p className="mt-3 text-sm text-slate-400">CPU Auto compares fast TF-IDF classification models. Safe CUDA environments may also include neural language models.</p>}
      {strategy === "custom" && <div className="mt-4 grid gap-2 md:grid-cols-2">{Object.values(NLPArchitecture).map(model => <label key={model} className="flex gap-2 text-slate-300"><input type="checkbox" checked={models.includes(model)} onChange={() => { setModels(current => current.includes(model) ? current.filter(item => item !== model) : [...current, model]); clearActiveModel(); }} />{MODEL_LABELS[model]}{ADVANCED_CPU_MODELS.has(model) ? " (Advanced on CPU)" : ""}</label>)}</div>}
      <label className="mt-5 block text-sm text-slate-300">Maximum epochs<input type="number" min={1} max={100} value={maxEpochs} onChange={event => { setMaxEpochs(Number(event.target.value)); clearActiveModel(); }} className="mt-2 block w-40 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" /></label>
      <button onClick={train} disabled={loading || !confirmed || !file || !textColumn || !targetColumn || (strategy === "custom" && !models.length)} className="mt-6 w-full rounded-xl bg-purple-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Training models…" : "Train & Compare"}</button>
    </section>

    {loading && <section className="rounded-2xl border border-purple-500/30 bg-slate-900 p-6">
      <div className="flex items-center gap-3"><Loader2 className="animate-spin text-purple-400" /><strong className="text-white">Training selected models...</strong></div>
      <p className="mt-3 text-sm text-slate-400">Requested: {requestedCandidates.map(item => MODEL_LABELS[item] ?? item).join(", ") || "NxZenAI is choosing safe Auto candidates"}</p>
      <p className="mt-2 text-sm text-slate-500">Candidate outcomes are shown only after the synchronous training response confirms them. Keep this page open until training completes.</p>
    </section>}

    {error && <div className="flex gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200"><AlertTriangle />{error}</div>}

    {result && <>
      <section className="rounded-2xl border border-emerald-500/30 bg-slate-900 p-6">
        <div className="flex items-center gap-3"><CheckCircle2 className="text-emerald-400" /><h2 className="text-2xl font-bold text-white">Best Result</h2></div>
        <p className="mt-4 text-slate-300">NxZenAI identified <strong>{result.task.replaceAll("_", " ")}</strong> and selected <strong>{MODEL_LABELS[result.winner_architecture] ?? result.metrics.architecture}</strong>.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <Info label="Dataset summary" value={`${result.dataset_summary.cleaning_summary.final_samples ?? result.dataset_summary.total_samples ?? inspection?.row_count ?? 0} cleaned rows · ${result.dataset_summary.class_count ?? 0} classes · target ${result.dataset_summary.target_column ?? targetColumn}`} />
          <Info label="Winning model" value={MODEL_LABELS[result.winner_architecture] ?? result.winner_architecture} />
          <Info label="Models requested" value={result.requested_architectures.map(item => MODEL_LABELS[item] ?? item).join(", ")} />
          <Info label="Models trained successfully" value={result.succeeded_architectures.map(item => MODEL_LABELS[item] ?? item).join(", ") || "None"} />
          <Info label="Models failed" value={result.failed_architectures.map(item => `${MODEL_LABELS[item.architecture] ?? item.architecture}: ${item.reason}`).join(" · ") || "None"} />
          <Info label="Rejected by quality gate" value={result.rejected_architectures.map(item => `${MODEL_LABELS[item.architecture] ?? item.architecture}: ${item.reason}`).join(" · ") || "None"} />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Info label="Validation Macro F1" value={percent(Number(result.metrics.validation_metrics.macro_f1))} />
          <Info label="Validation Weighted F1" value={percent(Number(result.metrics.validation_metrics.f1_score))} />
          <Info label="Independent Test Macro F1" value={result.metrics.test_metrics ? percent(Number(result.metrics.test_metrics.macro_f1)) : "Not available"} />
          <Info label="Independent Test Weighted F1" value={result.metrics.test_metrics ? percent(Number(result.metrics.test_metrics.f1_score)) : "Not available"} />
          <Info label="Readiness" value={(result.metrics.readiness ?? "experimental").replaceAll("_", " ")} />
        </div>
        <p className="mt-4 rounded-lg bg-slate-950 p-4 text-slate-300">The winner was ranked using validation metrics only. Independent test evidence determined readiness and did not influence selection. {result.metrics.reliability_reason}</p>
      </section>

      <section className="rounded-2xl border border-purple-500/30 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">Test Your Model</h2>
        <textarea value={predictionText} onChange={event => setPredictionText(event.target.value)} rows={4} placeholder="Enter new text" className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white" />
        <button onClick={predict} disabled={predicting || !predictionText.trim()} className="mt-3 rounded-lg bg-purple-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50">{predicting ? "Predicting…" : "Predict"}</button>
        {prediction && <div className="mt-5 rounded-xl bg-slate-950 p-5 text-slate-300">
          <p><strong className="text-white">Prediction:</strong> {prediction.predicted_label}</p>
          <p className="mt-1"><strong className="text-white">Model score:</strong> {percent(prediction.model_score)}</p>
          <p className="mt-1 text-sm text-slate-500">{prediction.score_is_calibrated
            ? "This model score was temperature-calibrated using held-out validation data; it is not a probability of correctness."
            : "Model scores are not calibrated probabilities of correctness."}</p>
          {prediction.vocabulary_coverage != null && <p className="mt-2">Vocabulary coverage: {percent(prediction.vocabulary_coverage)}</p>}
          {prediction.vocabulary_warning && <p className="mt-2 text-amber-300">{prediction.vocabulary_warning}</p>}
          {prediction.readiness !== "reliable" && <p className="mt-2 text-amber-300">{prediction.readiness_message}</p>}
          <div className="mt-3 flex flex-wrap gap-2">{prediction.probabilities.map(item => <span key={item.technical_label ?? item.label} className="rounded bg-slate-800 px-3 py-1 text-sm">{item.label}: {percent(item.probability)}</span>)}</div>
        </div>}
        <div className="mt-6 border-t border-slate-700 pt-5">
          <h3 className="font-semibold text-white">CSV batch prediction</h3>
          <input type="file" accept=".csv" onChange={event => setBatchFile(event.target.files?.[0] ?? null)} className="mt-3 text-sm text-slate-300" />
          <button onClick={predictCsv} disabled={!batchFile} className="ml-3 rounded-lg border border-purple-500 px-4 py-2 text-purple-200 disabled:opacity-50">Predict CSV</button>
          {batchResult && <div className="mt-4"><p className="text-sm text-slate-300">{batchResult.valid_rows} successful · {batchResult.failed_rows} failed</p><button onClick={exportCsv} className="mt-2 text-sm text-purple-300">Download safe CSV results</button></div>}
        </div>
      </section>

      <details className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <summary className="cursor-pointer text-lg font-bold text-white">Advanced Details</summary>
        <div className="mt-6 space-y-6">
          <p className="text-sm text-slate-400">Evaluation charts use the independent test split when available; otherwise they use validation data.</p>
          <TrainingCurves history={result.training_history} />
          <ConfusionMatrixView labels={result.evaluation.labels} matrix={result.evaluation.confusion_matrix} />
          <RocCurveView curve={result.evaluation.roc_curve} auc={result.evaluation.roc_auc} />
          <ClassMetricsChart metrics={result.evaluation.class_metrics} />
          <div className="rounded-xl bg-slate-950 p-4 text-sm text-slate-400">Model ID: {result.model_id} · Architecture: {result.architecture} · Vocabulary: {result.dataset_summary.vocab_size} · Sequence: {result.dataset_summary.max_sequence_length} · Device: {result.training_info.device}<p className="mt-2">Embedding: {String(result.dataset_summary.embedding?.type ?? "not applicable")} · {String(result.dataset_summary.embedding?.dimension ?? "not applicable")} dimensions · {String(result.dataset_summary.embedding?.freeze_policy ?? "not applicable")}</p>{result.dataset_summary.vectorizer && <p className="mt-2">Vectorizer: TF-IDF word unigrams + bigrams · {String(result.dataset_summary.vectorizer.fitted_feature_count ?? "unknown")} fitted features</p>}<p className="mt-2">Class mapping: {Object.entries(result.dataset_summary.label_display_mapping ?? {}).map(([label, meaning]) => `${label} → ${meaning}`).join(" · ")}</p>{prediction?.technical_label && prediction.technical_label !== prediction.predicted_label && <p className="mt-2">Technical prediction label: {prediction.technical_label}</p>}<p className="mt-2 break-all">Artifact integrity: {result.artifact.artifact_integrity_sha256}</p></div>
        </div>
      </details>
    </>}

    {savedModels.length > 0 && <details className="rounded-2xl border border-slate-700 bg-slate-900 p-5"><summary className="cursor-pointer font-semibold text-white">Saved AutoNLP models</summary><div className="mt-4 space-y-2">{savedModels.map(model => <div key={model.model_id} className="rounded-lg bg-slate-950 p-3 text-sm text-slate-300">{model.model_type} · v{model.version} · {model.lifecycle_stage} · {model.readiness ?? "experimental"}</div>)}</div></details>}
    <details className="rounded-2xl border border-slate-700 bg-slate-900 p-5"><summary className="cursor-pointer font-semibold text-white">Model lifecycle and monitoring</summary><div className="mt-4"><AIModelRegistryPanel module="autonlp" showQueue={false} /></div></details>
  </div>;
}

function Info({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-xl border border-slate-700 bg-slate-950 p-4"><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-1 font-semibold capitalize text-white">{value}</p></div>;
}

function Select({ label, value, values, onChange }: { label: string; value: string; values: string[]; onChange: (value: string) => void }) {
  return <label className="text-sm text-slate-300">{label}<select value={value} onChange={event => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white"><option value="">Choose a column</option>{values.map(item => <option key={item} value={item}>{item}</option>)}</select></label>;
}
