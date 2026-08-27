"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, ChevronDown, Download, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { ConfusionMatrixView, TrainingCurves } from "@/components/ai/TrainingVisuals";
import AutoDLV2Service from "@/services/autodl-v2.service";
import {
  V2AdvancedDetails, V2Capability, V2Inspection, V2ModelSummary, V2Monitoring,
  V2Prediction, V2PredictionHistory, V2Readiness, V2Result, V2TrainingStatus,
} from "@/types/autodl-v2";

const card = "rounded-2xl border border-slate-800 bg-slate-900/70 p-6";

function errorMessage(error: any): string {
  const detail = error?.response?.data?.detail;
  return (typeof detail === "object" ? detail?.message : detail) || "The request could not be completed.";
}

interface ConfirmedTaskSelection {
  runId: string;
  task: string;
  target?: string;
  timestamp?: string;
  rowsAreOrdered: boolean;
  timestampHandling: "strict" | "clean" | "row_order";
}

export default function AutoDLV2Workspace() {
  const [file, setFile] = useState<File | null>(null);
  const [datasetKind, setDatasetKind] = useState("auto");
  const [target, setTarget] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [sequentialConfirmed, setSequentialConfirmed] = useState(false);
  const [inspection, setInspection] = useState<V2Inspection | null>(null);
  const [confirmedSelection, setConfirmedSelection] = useState<ConfirmedTaskSelection | null>(null);
  const [capabilities, setCapabilities] = useState<V2Capability[]>([]);
  const [strategy, setStrategy] = useState<"auto" | "custom">("auto");
  const [models, setModels] = useState<string[]>([]);
  const [epochs, setEpochs] = useState(10);
  const [usePretrainedWeights, setUsePretrainedWeights] = useState(false);
  const [horizontalFlipSafe, setHorizontalFlipSafe] = useState(false);
  const [status, setStatus] = useState<V2TrainingStatus | null>(null);
  const [result, setResult] = useState<V2Result | null>(null);
  const [advanced, setAdvanced] = useState<V2AdvancedDetails | null>(null);
  const [predictionFile, setPredictionFile] = useState<File | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [includeExplanation, setIncludeExplanation] = useState(false);
  const [prediction, setPrediction] = useState<V2Prediction | null>(null);
  const [groundTruth, setGroundTruth] = useState("");
  const [history, setHistory] = useState<V2PredictionHistory[]>([]);
  const [trainedModels, setTrainedModels] = useState<V2ModelSummary[]>([]);
  const [monitoring, setMonitoring] = useState<V2Monitoring | null>(null);
  const [readiness, setReadiness] = useState<V2Readiness | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    AutoDLV2Service.capabilities().then(setCapabilities).catch(() => setCapabilities([]));
    AutoDLV2Service.readiness().then(setReadiness).catch(() => setReadiness(null));
  }, []);

  useEffect(() => {
    if (!inspection?.run_id || !status || !["queued", "running"].includes(status.status)) return;
    const timer = window.setInterval(async () => {
      try {
        const next = await AutoDLV2Service.status(inspection.run_id);
        setStatus(next);
        if (next.status === "completed") {
          setResult(await AutoDLV2Service.result(inspection.run_id));
          await refreshOperationalViews(inspection.run_id);
          window.clearInterval(timer);
        }
        if (next.status === "failed") window.clearInterval(timer);
      } catch (nextError) {
        setError(errorMessage(nextError));
        window.clearInterval(timer);
      }
    }, 1500);
    return () => window.clearInterval(timer);
  }, [inspection?.run_id, status?.status]);

  const compatible = useMemo(() => {
    const task = inspection?.task_intelligence.detected_task;
    return capabilities.filter(item => item.available && task && item.supported_tasks.includes(task));
  }, [capabilities, inspection?.task_intelligence.detected_task]);
  const displayedModels = useMemo(() => {
    const size = inspection?.image?.dataset_size_category;
    if (strategy !== "auto" || !size || !["very_small", "small"].includes(size)) return compatible;
    return compatible.filter(model => model.key === "custom_cnn" || (size === "small" && model.key === "mobilenet_v3"));
  }, [compatible, inspection?.image?.dataset_size_category, strategy]);

  const task = inspection?.task_intelligence.detected_task;
  const imageTask = task === "image_classification";
  const classificationTask = Boolean(task?.endsWith("classification"));
  const timeSeriesTask = Boolean(task?.startsWith("time_series"));
  const inspectedTarget = inspection?.tabular?.target_suitability?.column || target || undefined;
  const inferredTimestamp = inspection?.tabular?.timestamp_candidates?.length === 1
    ? inspection.tabular.timestamp_candidates[0]
    : undefined;
  const inspectedTimestamp = timestamp || inferredTimestamp;
  const timestampQuality = inspection?.tabular?.timestamp_quality;
  const taskSelectionConfirmed = Boolean(
    confirmedSelection
    && confirmedSelection.runId === inspection?.run_id
    && confirmedSelection.task === task
    && confirmedSelection.target === inspectedTarget
    && confirmedSelection.timestamp === inspectedTimestamp
    && confirmedSelection.rowsAreOrdered === sequentialConfirmed
  );
  const completed = status?.status === "completed" && result;

  async function inspect() {
    if (!file) return setError("Choose a ZIP image dataset or CSV dataset first.");
    setBusy("inspect"); setError(null); setResult(null); setStatus(null); setAdvanced(null);
    setConfirmedSelection(null);
    try {
      const next = await AutoDLV2Service.inspect(file, {
        datasetKind, target: target || undefined, timestamp: timestamp || undefined,
        sequentialConfirmed,
      });
      setInspection(next);
      setModels([]);
    } catch (nextError) { setError(errorMessage(nextError)); }
    finally { setBusy(null); }
  }

  async function train() {
    if (!file || !inspection?.run_id) return setError("Inspect and confirm the dataset before training.");
    if (!task) return setError("Choose the target and observation order so NxZenAI can identify the problem.");
    if (timeSeriesTask && !taskSelectionConfirmed) {
      return setError("Review the detected problem, target, and observation order, then select Confirm & Continue.");
    }
    setBusy("train"); setError(null);
    try {
      await AutoDLV2Service.train(inspection.run_id, file, {
        strategy, models, epochs, confirmedTask: task,
        confirmedTarget: inspectedTarget, confirmedTimestamp: inspectedTimestamp,
        rowsAreOrdered: confirmedSelection?.rowsAreOrdered ?? sequentialConfirmed,
        timestampHandling: confirmedSelection?.timestampHandling ?? "strict",
        usePretrainedWeights, horizontalFlipSafe,
      });
      const nextStatus = await AutoDLV2Service.status(inspection.run_id);
      setStatus(nextStatus);
      if (nextStatus.status === "completed") {
        setResult(await AutoDLV2Service.result(inspection.run_id));
        await refreshOperationalViews(inspection.run_id);
      }
    } catch (nextError) { setError(errorMessage(nextError)); }
    finally { setBusy(null); }
  }

  async function loadAdvanced() {
    if (!inspection?.run_id || advanced) return;
    try { setAdvanced(await AutoDLV2Service.advanced(inspection.run_id)); }
    catch (nextError) { setError(errorMessage(nextError)); }
  }

  async function refreshOperationalViews(runId: string) {
    const [nextHistory, nextModels, nextMonitoring] = await Promise.all([
      AutoDLV2Service.history(runId), AutoDLV2Service.models(runId), AutoDLV2Service.monitoring(runId),
    ]);
    setHistory(nextHistory); setTrainedModels(nextModels); setMonitoring(nextMonitoring);
  }

  async function predict() {
    if (!inspection?.run_id) return;
    setBusy("predict"); setError(null); setPrediction(null);
    try {
      const next = await AutoDLV2Service.predict(inspection.run_id, {
        file: predictionFile, manual: predictionFile ? undefined : manualInput,
        explain: includeExplanation,
        groundTruth: serializeActualValue(groundTruth, classificationTask),
      });
      setPrediction(next);
      setResult(await AutoDLV2Service.result(inspection.run_id));
      await refreshOperationalViews(inspection.run_id);
    } catch (nextError) { setError(errorMessage(nextError)); }
    finally { setBusy(null); }
  }

  async function changeStage(model: V2ModelSummary, nextStage: V2ModelSummary["stage"]) {
    setError(null);
    try {
      await AutoDLV2Service.changeStage(model._id, nextStage);
      if (inspection?.run_id) await refreshOperationalViews(inspection.run_id);
    } catch (nextError) { setError(errorMessage(nextError)); }
  }

  async function removeHistory(predictionId: string) {
    try {
      await AutoDLV2Service.deleteHistory(predictionId);
      if (inspection?.run_id) await refreshOperationalViews(inspection.run_id);
    } catch (nextError) { setError(errorMessage(nextError)); }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      <header>
        <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">AutoDL</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Build a deep-learning model step by step</h1>
        <p className="mt-2 max-w-3xl text-slate-400">Upload data, let NxZenAI explain the problem, compare compatible models, and test the best result.</p>
      </header>

      {readiness && <section className={card}>
        <div className="flex items-center gap-3"><ShieldCheck className={readiness.status === "ready" ? "text-emerald-400" : "text-amber-400"} /><div><h2 className="font-bold text-white">AutoDL readiness</h2><p className="text-sm text-slate-400">A safe operational summary with no credentials or internal connection details.</p></div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6"><ReadinessItem label="Module" value={readiness.status} /><ReadinessItem label="Device" value={`${readiness.selected_device} (${readiness.device_policy})`} /><ReadinessItem label="MongoDB" value={readiness.persistence.mongodb} /><ReadinessItem label="GridFS" value={readiness.persistence.gridfs} /><ReadinessItem label="Model registry" value={readiness.persistence.registry} /><ReadinessItem label="Prediction" value={readiness.persistence.prediction_ready ? "ready" : "train a model"} /></div>
        <p className="mt-3 text-xs text-slate-500">Supports {readiness.supported_tasks.length} task types and {readiness.available_models.length} available models. V1 rollback remains available.</p>
        <div className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-2"><p><span className="font-semibold text-slate-300">Supported tasks:</span> {readiness.supported_tasks.map(item => item.replaceAll("_", " ")).join(", ")}</p><p><span className="font-semibold text-slate-300">Available models:</span> {readiness.available_models.join(", ")}</p></div>
      </section>}

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

      <section className={card}>
        <Step number="1" title="Upload your dataset" subtitle="ZIP files for labelled images, or CSV files for tabular and time-series data." />
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_180px]">
          <label className="flex cursor-pointer items-center gap-4 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950 p-5 hover:border-indigo-500">
            <UploadCloud className="text-indigo-400" />
            <span className="text-sm text-slate-300">{file?.name || "Choose a dataset"}</span>
            <input type="file" accept=".zip,.csv" className="hidden" onChange={event => {
              setFile(event.target.files?.[0] || null); setInspection(null); setResult(null); setStatus(null); setConfirmedSelection(null);
            }} />
          </label>
          <select value={datasetKind} onChange={event => setDatasetKind(event.target.value)} className="rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-200">
            <option value="auto">Detect data type</option><option value="image">Image dataset</option><option value="tabular">CSV dataset</option>
          </select>
        </div>
        {file?.name.toLowerCase().endsWith(".csv") && <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Input label="Target to predict" value={target} onChange={value => { setTarget(value); setConfirmedSelection(null); }} placeholder="Select after first inspection" />
          <Input label="Date/time column (optional)" value={timestamp} onChange={value => { setTimestamp(value); setConfirmedSelection(null); }} placeholder="e.g. timestamp" />
          <label className="flex items-end gap-2 pb-3 text-sm text-slate-300"><input type="checkbox" checked={sequentialConfirmed} onChange={e => { setSequentialConfirmed(e.target.checked); setConfirmedSelection(null); }} /> Rows are ordered observations</label>
        </div>}
        <button onClick={inspect} disabled={!file || busy === "inspect"} className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-50">
          {busy === "inspect" ? "Understanding your data…" : inspection ? "Inspect again with selections" : "Understand my data"}
        </button>
      </section>

      {inspection && <section className={card}>
        <Step number="2" title="Understand Data" subtitle={inspection.summary} />
        <div className="mt-5 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Problem detected</p>
          <h2 className="mt-2 text-xl font-bold text-white">{inspection.task_intelligence.display_name}</h2>
          <p className="mt-2 text-sm text-slate-300">{inspection.task_intelligence.explanation}</p>
        </div>
        {inspection.tabular && <div className="mt-5 grid gap-4 md:grid-cols-3">
          <Stat label="Rows" value={inspection.tabular.rows} /><Stat label="Columns" value={inspection.tabular.columns} /><Stat label="Identifiers excluded" value={inspection.tabular.candidate_identifiers.length} />
        </div>}
        {inspection.image && <div className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-4"><Stat label="Readable images" value={inspection.image.valid_images} /><Stat label="Validation images" value={inspection.image.validation_sample_count} /><Stat label="Smallest class" value={inspection.image.minimum_class_count} /><ReadinessItem label="Evaluation reliability" value={inspection.image.evaluation_reliability} /></div>
          <div className="rounded-xl bg-slate-950 p-4"><p className="font-semibold text-white">{inspection.image.dataset_size_category?.replaceAll("_", " ") || "Image"} dataset</p><p className="mt-2 text-sm text-slate-400">{inspection.image.beginner_guidance}</p><p className="mt-2 text-xs text-slate-500">{inspection.image.reliability_reason}</p></div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{inspection.image.class_balance.map(item => <div key={item.class_name} className="rounded-lg bg-slate-950 p-3 text-sm"><p className="truncate font-medium text-white">{item.class_name}</p><p className="mt-1 text-slate-500">{item.image_count} images · {item.percentage.toFixed(1)}%</p></div>)}</div>
        </div>}
        {inspection.tabular?.candidate_targets?.length ? <label className="mt-5 block text-sm text-slate-300">Confirm target
          <select value={target} onChange={event => { setTarget(event.target.value); setConfirmedSelection(null); }} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3">
            <option value="">Choose the outcome to predict</option>{inspection.tabular.candidate_targets.map(column => <option key={column}>{column}</option>)}
          </select>
          <span className="mt-2 block text-xs text-slate-500">Choose a target, then inspect again so NxZenAI can confirm the task.</span>
        </label> : null}
        {timeSeriesTask && <div className="mt-5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-5">
          <p className="text-sm font-semibold text-cyan-300">NxZenAI detected {inspection.task_intelligence.display_name}</p>
          <dl className="mt-3 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
            <div><dt className="text-slate-500">Target</dt><dd className="font-semibold text-white">{inspectedTarget || "Choose a target"}</dd></div>
            <div><dt className="text-slate-500">Observation order</dt><dd className="font-semibold text-white">{confirmedSelection?.timestampHandling === "row_order" ? "Existing row order" : inspectedTimestamp || (sequentialConfirmed ? "Uploaded row order" : "Choose a date/time column")}</dd></div>
          </dl>
          {!inspectedTarget || (!inspectedTimestamp && !sequentialConfirmed) ? <p className="mt-4 text-sm text-amber-200">Choose the missing target or observation order above, then inspect once more.</p> : timestampQuality?.cleaning_blocked ? <div className="mt-4">
            <p className="text-sm text-amber-200">This date column has too many invalid values to use safely for time-series ordering.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button onClick={() => { setTimestamp(""); setSequentialConfirmed(false); setConfirmedSelection(null); setError("Choose another date/time column above, then inspect the current selections."); }} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200">Choose Another Date Column</button>
              {timestampQuality.row_order_allowed && <button onClick={() => { setSequentialConfirmed(true); setConfirmedSelection({ runId: inspection.run_id, task: task!, target: inspectedTarget, timestamp: inspectedTimestamp, rowsAreOrdered: true, timestampHandling: "row_order" }); setError(null); }} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">Use Existing Row Order</button>}
            </div>
          </div> : timestampQuality && timestampQuality.invalid_percentage > 0 ? <div className="mt-4">
            <p className="text-sm text-amber-100">We found {timestampQuality.missing_timestamps + timestampQuality.invalid_timestamps} invalid or missing dates out of {timestampQuality.total_rows.toLocaleString()} rows ({timestampQuality.invalid_percentage.toFixed(2)}%). NxZenAI can remove those rows and continue.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button onClick={() => { setConfirmedSelection({ runId: inspection.run_id, task: task!, target: inspectedTarget, timestamp: inspectedTimestamp, rowsAreOrdered: sequentialConfirmed, timestampHandling: "clean" }); setError(null); }} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">{taskSelectionConfirmed ? "Cleaning Confirmed" : "Clean & Continue"}</button>
              <button onClick={() => { setTimestamp(""); setConfirmedSelection(null); setError("Choose another date/time column above, then inspect the current selections."); }} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200">Change Date Column</button>
            </div>
          </div> : <div className="mt-4 flex gap-3">
            <button onClick={() => { setConfirmedSelection({ runId: inspection.run_id, task: task!, target: inspectedTarget, timestamp: inspectedTimestamp, rowsAreOrdered: sequentialConfirmed, timestampHandling: inspectedTimestamp ? "strict" : "row_order" }); setError(null); }} className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white">{taskSelectionConfirmed ? "Confirmed" : "Confirm & Continue"}</button>
            <button onClick={() => setConfirmedSelection(null)} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-200">Change</button>
          </div>}
        </div>}
      </section>}

      {task && <section className={card}>
        <Step number="3" title="Choose how NxZenAI trains" subtitle="Auto compares all compatible models. Custom lets you choose." />
        <div className="mt-5 flex gap-3">{(["auto", "custom"] as const).map(value => <button key={value} onClick={() => setStrategy(value)} className={`rounded-xl px-5 py-3 font-semibold ${strategy === value ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"}`}>{value === "auto" ? "Auto (recommended)" : "Custom"}</button>)}</div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">{displayedModels.map(model => <label key={model.key} className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 p-4 text-slate-200"><input type="checkbox" disabled={strategy === "auto"} checked={strategy === "auto" || models.includes(model.key)} onChange={event => setModels(current => event.target.checked ? [...current, model.key] : current.filter(key => key !== model.key))} />{model.display_name}</label>)}</div>
        {imageTask && <div className="mt-4 space-y-3 rounded-xl bg-slate-950 p-4 text-sm text-slate-300"><label className="flex gap-2"><input type="checkbox" disabled={strategy === "auto" && inspection?.image?.dataset_size_category === "small"} checked={usePretrainedWeights || (strategy === "auto" && inspection?.image?.dataset_size_category === "small")} onChange={event => setUsePretrainedWeights(event.target.checked)} /> Use pretrained weights for supported torchvision models</label><label className="flex gap-2"><input type="checkbox" checked={horizontalFlipSafe} onChange={event => setHorizontalFlipSafe(event.target.checked)} /> Horizontal flipping is safe for these image classes</label><p className="text-xs text-slate-500">Small datasets use lightweight training augmentation and Auto mode uses pretrained MobileNetV3 Small. Horizontal flipping is applied only when you confirm it is meaningful.</p></div>}
        <div className="mt-5 max-w-xs"><Input label="Maximum epochs" value={String(epochs)} onChange={value => setEpochs(Number(value))} type="number" /></div>
        <button onClick={train} disabled={Boolean(busy) || (strategy === "custom" && !models.length) || (timeSeriesTask && !taskSelectionConfirmed)} className="mt-5 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white disabled:opacity-50">{busy === "train" ? "Starting…" : "Train and compare models"}</button>
      </section>}

      {status && <section className={card}>
        <Step number="4" title="Training progress" subtitle={status.message} />
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full bg-indigo-500 transition-all" style={{ width: `${Math.min(100, status.percentage)}%` }} /></div>
        <p className="mt-2 text-sm text-slate-400">{status.percentage.toFixed(1)}% · {status.stage.replaceAll("_", " ")}{status.current_epoch ? ` · epoch ${status.current_epoch}/${status.total_epochs}` : ""}</p>
      </section>}

      {completed && result && <>
        <section className={card}>
          <Step number="5" title="Best Result" subtitle="NxZenAI ranked models using metrics appropriate for this problem." />
          <div className="mt-5 grid gap-4 lg:grid-cols-3"><ResultCard label="Problem detected" value={result.problem.display_name} detail={result.problem.explanation} /><ResultCard label="What is being predicted" value={result.target.name} detail={result.target.explanation} /><ResultCard label="Training status" value={result.training_status.status === "completed" ? "Training complete" : result.training_status.status} detail={result.training_status.message} /><ResultCard label="Models NxZenAI tried" value={result.models_tried.join(", ")} detail={result.models_tried_explanation} /><ResultCard label="Best model" value={result.best_model.name} detail={result.best_model.explanation} />{imageTask ? <><ResultCard label="Accuracy" value={`${((result.performance.accuracy ?? 0) * 100).toFixed(1)}%`} detail="Accuracy on the held-out validation images." /><ResultCard label="Weighted F1" value={formatMetric(result.performance.value)} detail="Balances correctness across the image classes." /><ResultCard label="Validation images" value={String(result.performance.validation_sample_count ?? "Unavailable")} detail="The number of held-out images used for evaluation." /><ResultCard label="Evaluation reliability" value={result.performance.evaluation_reliability || "Unavailable"} detail={result.performance.reliability_reason || "Reliability context is unavailable."} /></> : classificationTask ? <ResultCard label="Primary performance metric" value={`${result.performance.key_metric.replaceAll("_", " ")}: ${result.performance.value.toFixed(4)}`} detail="This metric was used to compare compatible models for this task." /> : <><ResultCard label="Average error" value={formatMetric(result.performance.mae)} detail="The average absolute difference between predictions and actual values." /><ResultCard label="RMSE" value={formatMetric(result.performance.rmse ?? result.performance.value)} detail="The internal ranking metric; lower values indicate smaller prediction errors." /><ResultCard label="R²" value={formatMetric(result.performance.r2)} detail="A supporting score describing how much variation the model explains." /></>}</div>
          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5"><p className="text-xs font-semibold uppercase text-emerald-300">How well it performed</p><p className="mt-2 text-lg font-semibold text-white">{result.performance.explanation}</p></div>
          {imageTask && <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <ResultCard label="Independent test accuracy" value={result.performance.test_metrics ? `${(Number(result.performance.test_metrics.accuracy) * 100).toFixed(1)}%` : "Unavailable"} detail={result.performance.test_metrics ? `Final evaluation on ${result.performance.test_sample_count} images not used for checkpoint selection.` : "A safe independent test split was not possible."} />
            <ResultCard label="Independent test weighted F1" value={result.performance.test_metrics ? formatMetric(Number(result.performance.test_metrics.f1)) : "Unavailable"} detail="Final class-balanced performance evidence." />
            <ResultCard label="Robustness accuracy" value={result.performance.robustness_accuracy == null ? "Unavailable" : `${(result.performance.robustness_accuracy * 100).toFixed(1)}%`} detail="Performance under mild, shape-preserving image variations." />
            <ResultCard label="Production readiness" value={(result.performance.production_readiness || "not_reliable").replaceAll("_", " ")} detail={result.performance.reliability_reason || "Reliability context is unavailable."} />
          </div>}
        </section>

        <section className={card}>
          <Step number="6" title="Test your model" subtitle={imageTask ? "Upload one image." : task?.startsWith("time_series") ? "Provide an ordered CSV or JSON array with enough sequence rows." : "Enter one JSON row or upload a CSV for batch prediction."} />
          {!result.prediction_ready ? <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-100">This experimental image result did not pass production-readiness checks. Prediction and promotion are disabled; add more representative images and train a new run.</div> : <>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950 p-5 text-sm text-slate-300"><UploadCloud size={20} />{predictionFile?.name || (imageTask ? "Choose an image" : "Choose prediction CSV")}<input className="hidden" type="file" accept={imageTask ? "image/*" : ".csv"} onChange={event => setPredictionFile(event.target.files?.[0] || null)} /></label>
            {!imageTask && <textarea value={manualInput} onChange={event => { setManualInput(event.target.value); setPredictionFile(null); }} rows={5} placeholder={task?.startsWith("time_series") ? '[{"feature": 1}, {"feature": 2}]' : '{"feature": 1, "category": "A"}'} className="rounded-xl border border-slate-700 bg-slate-950 p-4 font-mono text-sm text-slate-200" />}
          </div>
          <div className="mt-4 max-w-xl"><Input label="Actual value (optional)" value={groundTruth} onChange={setGroundTruth} placeholder={task?.includes("classification") ? '"actual category"' : "412.5"} /><p className="mt-2 text-xs text-slate-500">If you already know the real outcome for this prediction, enter it here. NxZenAI can use it to monitor model performance.</p></div>
          {imageTask && <label className="mt-4 flex gap-2 text-sm text-slate-300"><input type="checkbox" checked={includeExplanation} onChange={e => setIncludeExplanation(e.target.checked)} /> Generate Grad-CAM explanation when available</label>}
          <button onClick={predict} disabled={busy === "predict" || (!predictionFile && !manualInput.trim())} className="mt-5 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white disabled:opacity-50">{busy === "predict" ? "Predicting…" : "Make prediction"}</button>
          {prediction && <PredictionView prediction={prediction} />}
          {prediction?.export_available && <button onClick={() => AutoDLV2Service.downloadExport(prediction.prediction_id).catch(nextError => setError(errorMessage(nextError)))} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white"><Download size={16} /> Download batch CSV</button>}
          </>}
        </section>

        <section className={card}>
          <div className="flex items-center gap-3"><Activity className="text-cyan-400" /><div><h2 className="text-xl font-bold text-white">Recent predictions</h2><p className="text-sm text-slate-400">Only prediction history owned by your account is shown.</p></div></div>
          {!history.length ? <p className="mt-4 text-sm text-slate-500">No predictions have been recorded for this run yet.</p> : <div className="mt-4 space-y-3">{history.map(item => <div key={item._id} className="flex flex-col gap-3 rounded-xl bg-slate-950 p-4 md:flex-row md:items-center"><div className="min-w-0 flex-1"><p className="font-medium text-white">{String(item.primary_result?.human_explanation || item.primary_result?.summary || item.row_errors?.[0]?.message || "Prediction recorded")}</p><p className="mt-1 text-xs text-slate-500">{new Date(item.created_at).toLocaleString()} · {item.row_count} row(s) · {item.batch_status} · {item.latency_ms ?? "—"} ms</p></div><div className="flex gap-2">{item.export_available && <button onClick={() => AutoDLV2Service.downloadExport(item._id).catch(nextError => setError(errorMessage(nextError)))} className="rounded-lg bg-slate-800 p-2 text-slate-300" title="Download CSV"><Download size={16} /></button>}<button onClick={() => void removeHistory(item._id)} className="rounded-lg bg-red-500/10 p-2 text-red-300" title="Delete history record"><Trash2 size={16} /></button></div></div>)}</div>}
        </section>

        <section className={card}>
          <h2 className="text-xl font-bold text-white">Model lifecycle</h2><p className="mt-1 text-sm text-slate-400">Stage changes are explicit and audited. Archiving keeps the GridFS artifact.</p>
          <div className="mt-4 space-y-3">{trainedModels.map(model => <div key={model._id} className="flex flex-col gap-3 rounded-xl bg-slate-950 p-4 md:flex-row md:items-center"><div className="flex-1"><p className="font-semibold text-white">{model.display_name}{model.is_winner ? " · Best model" : ""}</p><p className="text-sm capitalize text-slate-400">Current stage: {model.stage}</p></div><LifecycleActions model={model} onChange={changeStage} /></div>)}</div>
        </section>

        {monitoring && <section className={card}>
          <h2 className="text-xl font-bold text-white">Prediction monitoring</h2><p className="mt-1 text-sm text-slate-400">{monitoring.status}. {monitoring.drift.message}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6"><Stat label="Requests" value={monitoring.prediction_requests} /><Stat label="Observations" value={monitoring.prediction_observations} /><Stat label="Input rows" value={monitoring.prediction_rows} /><Stat label="Row errors" value={monitoring.row_errors} /><Stat label="Actual values" value={monitoring.ground_truth_records} /><ReadinessItem label="Average latency" value={monitoring.average_latency_ms == null ? "Unavailable" : `${monitoring.average_latency_ms} ms`} /></div>
          <p className="mt-3 text-sm text-slate-400">Drift status: {monitoring.drift.status}. NxZenAI has not claimed drift.</p>
        </section>}

        <details className={card} onToggle={event => { if ((event.currentTarget as HTMLDetailsElement).open) void loadAdvanced(); }}>
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-white">Advanced Model Details <ChevronDown size={20} /></summary>
          {!advanced ? <p className="mt-4 text-slate-400">Loading advanced details…</p> : <AdvancedView details={advanced} />}
        </details>
      </>}
    </div>
  );
}

function Step({ number, title, subtitle }: { number: string; title: string; subtitle: string }) { return <div className="flex gap-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 font-bold text-indigo-300">{number}</span><div><h2 className="text-xl font-bold text-white">{title}</h2><p className="mt-1 text-sm text-slate-400">{subtitle}</p></div></div>; }
function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) { return <label className="block text-sm text-slate-300">{label}<input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-slate-200" /></label>; }
function Stat({ label, value }: { label: string; value: number }) { return <div className="rounded-xl bg-slate-950 p-4"><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p></div>; }
function ReadinessItem({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-slate-950 p-4"><p className="text-xs uppercase text-slate-500">{label}</p><p className="mt-2 capitalize text-sm font-semibold text-white">{value}</p></div>; }
function ResultCard({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="rounded-xl bg-slate-950 p-5"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-2 font-bold text-white">{value}</p><p className="mt-2 text-sm text-slate-400">{detail}</p></div>; }
function formatMetric(value?: number | null): string { return value == null || !Number.isFinite(value) ? "Unavailable" : value.toFixed(3); }
function serializeActualValue(value: string, classification: boolean): string | undefined { const trimmed = value.trim(); if (!trimmed) return undefined; if (!classification) return trimmed; try { const parsed = JSON.parse(trimmed); if (Array.isArray(parsed) || typeof parsed === "string" || typeof parsed === "number") return trimmed; } catch { /* Plain class names are encoded below. */ } return JSON.stringify(trimmed); }

function LifecycleActions({ model, onChange }: { model: V2ModelSummary; onChange: (model: V2ModelSummary, stage: V2ModelSummary["stage"]) => Promise<void> }) {
  if (model.production_readiness === "not_reliable") return model.stage === "archived" ? <Action label="Restore Model" onClick={() => onChange(model, "draft")} /> : <Action label="Archive Model" onClick={() => onChange(model, "archived")} />;
  if (model.stage === "draft") return <div className="flex gap-2"><Action label="Mark as Validated" onClick={() => onChange(model, "validated")} /><Action label="Archive Model" onClick={() => onChange(model, "archived")} /></div>;
  if (model.stage === "validated") return <div className="flex gap-2">{model.production_readiness !== "experimental" && <Action label="Promote to Production" onClick={() => onChange(model, "production")} />}<Action label="Archive Model" onClick={() => onChange(model, "archived")} /></div>;
  if (model.stage === "production") return <Action label="Archive Model" onClick={() => onChange(model, "archived")} />;
  return <Action label="Restore Model" onClick={() => onChange(model, model.stage_before_archive === "draft" ? "draft" : model.stage_before_archive === "production" ? "production" : "validated")} />;
}
function Action({ label, onClick }: { label: string; onClick: () => Promise<void> }) { return <button onClick={() => void onClick()} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700">{label}</button>; }

function RegressionChart({ points }: { points: Array<{ index: number; actual: number; predicted: number }> }) { if (!points.length) return null; return <div className="mt-6 h-80 rounded-xl bg-slate-950 p-4"><h3 className="mb-3 font-semibold text-white">Actual vs predicted</h3><ResponsiveContainer width="100%" height="90%"><LineChart data={points}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="index" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{ background: "#0f172a", borderColor: "#334155" }} /><Legend /><Line dataKey="actual" stroke="#34d399" dot={false} /><Line dataKey="predicted" stroke="#818cf8" dot={false} /></LineChart></ResponsiveContainer></div>; }

function PredictionView({ prediction }: { prediction: V2Prediction }) {
  const primary = prediction.prediction;
  return <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-5"><p className="text-xs font-semibold uppercase text-indigo-300">Prediction</p><p className="mt-2 text-lg font-semibold text-white">{prediction.human_explanation}</p>
    {primary?.model_score != null && <p className="mt-2 text-sm text-slate-300">Model score: {(primary.model_score * 100).toFixed(1)}% <span className="text-slate-500">(not calibrated certainty)</span></p>}
    {(primary?.top_probabilities || primary?.top_alternatives)?.length ? <div className="mt-4 space-y-2"><p className="text-xs font-semibold uppercase text-slate-500">Model scores by likely class</p>{(primary.top_probabilities || primary.top_alternatives).map((item: any) => <div key={item.label} className="flex justify-between text-sm text-slate-300"><span>{item.label}</span><span>{(item.probability * 100).toFixed(1)}%</span></div>)}</div> : null}
    {(primary?.low_confidence || primary?.low_reliability) && primary?.confidence_guidance && <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{primary.confidence_guidance}</p>}
    {prediction.predictions?.length ? <div className="mt-4 max-h-72 overflow-auto"><pre className="text-xs text-slate-300">{JSON.stringify(prediction.predictions, null, 2)}</pre></div> : null}
    {prediction.errors?.length ? <div className="mt-3 text-sm text-amber-300"><p>{prediction.errors.length} row(s) were skipped.</p><ul className="mt-2 list-disc pl-5">{prediction.errors.slice(0, 20).map(item => <li key={`${item.row}-${item.message}`}>Row {item.row}: {item.message}</li>)}</ul></div> : null}
    {prediction.explainability?.image && <img src={prediction.explainability.image} alt="Grad-CAM explanation" className="mt-5 max-h-96 rounded-xl" />}
    {prediction.explainability?.message && <p className="mt-3 text-sm text-slate-400">{prediction.explainability.message}</p>}
  </div>;
}

function AdvancedView({ details }: { details: V2AdvancedDetails }) {
  const model = details.model;
  if (!model) return <p className="mt-4 text-slate-400">Advanced training details are not available yet.</p>;
  const classification = model.task?.endsWith("classification");
  const residual = model.evaluation_visualization?.residual_summary;
  return <div className="mt-6 space-y-6">
    <TrainingCurves history={model.training_curves} showAccuracy={classification} />
    {classification ? <>
      <MetricTiles values={[{ label: "Precision", value: model.full_metrics.precision }, { label: "Recall", value: model.full_metrics.recall }, { label: "Weighted F1", value: model.full_metrics.f1 }]} />
      <ConfusionMatrixView labels={model.class_mapping} matrix={model.confusion_matrix || undefined} />
    </> : <>
      <MetricTiles values={[{ label: "MAE", value: model.full_metrics.mae }, { label: "RMSE", value: model.full_metrics.rmse }, { label: "R²", value: model.full_metrics.r2 }, { label: "Mean residual", value: residual?.mean }]} />
      {model.evaluation_visualization?.kind === "actual_vs_predicted" && <RegressionChart points={model.evaluation_visualization.points || []} />}
      {residual && <Technical label="Residual/error summary" value={residual} />}
    </>}
    <div className="grid gap-4 lg:grid-cols-2"><Technical label="Full metrics" value={model.full_metrics} /><Technical label="Full leaderboard" value={model.leaderboard} /><Technical label="Architecture and hyperparameters" value={{ architecture: model.architecture, hyperparameters: model.hyperparameters }} /><Technical label="Class mapping and preprocessing" value={{ classes: model.class_mapping, preprocessing: model.preprocessing }} /><Technical label="Experiment metadata" value={{ dataset_hash: model.dataset_hash, artifact_hash: model.artifact_hash, device: model.device, runtime: model.runtime, manifest: model.experiment_metadata }} /></div>
  </div>;
}
function MetricTiles({ values }: { values: Array<{ label: string; value?: number | null }> }) { const available = values.filter(item => item.value != null && Number.isFinite(item.value)); if (!available.length) return null; return <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{available.map(item => <div key={item.label} className="rounded-xl border border-slate-700 bg-slate-950 p-4"><p className="text-xs font-semibold uppercase text-slate-500">{item.label}</p><p className="mt-2 text-xl font-bold text-white">{formatMetric(item.value)}</p></div>)}</div>; }
function Technical({ label, value }: { label: string; value: unknown }) { return <div className="overflow-auto rounded-xl bg-slate-950 p-4"><h3 className="mb-3 font-semibold text-white">{label}</h3><pre className="max-h-80 text-xs text-slate-400">{JSON.stringify(value, null, 2)}</pre></div>; }
