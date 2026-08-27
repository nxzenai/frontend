"use client";

import { useEffect, useMemo, useState } from "react";

import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    FileText,
    Languages,
    Loader2,
    Upload,
} from "lucide-react";

import useAutoNLPJob from "@/hooks/useAutoNLPJob";
import AutoNLPService from "@/services/autonlp.service";
import AIModelRegistryPanel from "@/components/ai-registry/AIModelRegistryPanel";
import {
    ClassMetricsChart,
    ConfusionMatrixView,
    TrainingCurves,
    RocCurveView,
} from "@/components/ai/TrainingVisuals";

import {
    AutoNLPPredictResponse,
    AutoNLPBatchPredictionResponse,
    AutoNLPDatasetInspection,
    AutoNLPJobResponse,
    NLPTask,
    NLPArchitecture,
} from "@/types/autonlp";


export default function AutoNLPWorkspace() {

    ////////////////////////////////////////////////////////////
    // Backend State
    ////////////////////////////////////////////////////////////

    const {
        job,
        loading,
        error,
        startTraining,
        resetJob,
    } = useAutoNLPJob();


    ////////////////////////////////////////////////////////////
    // Training Form State
    ////////////////////////////////////////////////////////////

    const [file, setFile] =
        useState<File | null>(null);

    const [textColumn, setTextColumn] =
        useState("text");

    const [targetColumn, setTargetColumn] =
        useState("sentiment");

    const [task, setTask] =
        useState<NLPTask>(
            NLPTask.SENTIMENT_ANALYSIS
        );

    const [maxEpochs, setMaxEpochs] =
        useState(10);
    const [compareTransformer, setCompareTransformer] = useState(false);

    const [inspection, setInspection] =
        useState<AutoNLPDatasetInspection | null>(null);
    const [inspectionError, setInspectionError] = useState<string | null>(null);
    const [managedJobs, setManagedJobs] =
        useState<AutoNLPJobResponse[]>([]);
    const [batchFile, setBatchFile] = useState<File | null>(null);
    const [batchResult, setBatchResult] =
        useState<AutoNLPBatchPredictionResponse | null>(null);
    const [batching, setBatching] = useState(false);


    ////////////////////////////////////////////////////////////
    // Prediction State
    ////////////////////////////////////////////////////////////

    const [predictionText, setPredictionText] =
        useState("");

    const [prediction, setPrediction] =
        useState<AutoNLPPredictResponse | null>(
            null
        );

    const [predicting, setPredicting] =
        useState(false);

    const [
        predictionError,
        setPredictionError,
    ] = useState<string | null>(null);


    ////////////////////////////////////////////////////////////
    // Helpers
    ////////////////////////////////////////////////////////////

    async function refreshJobs() {
        try {
            setManagedJobs(await AutoNLPService.listJobs());
        } catch {
            setManagedJobs([]);
        }
    }

    useEffect(() => {
        void refreshJobs();
    }, []);

    async function inspectFile(selected: File | null) {
        setInspection(null);
        setInspectionError(null);
        if (!selected) return;
        try {
            setInspection(await AutoNLPService.inspect(
                selected,
                textColumn.trim(),
                targetColumn.trim(),
            ));
        } catch (err: any) {
            setInspection(null);
            const detail = err?.response?.data?.detail;
            setInspectionError(
                (typeof detail === "object" ? detail?.message : detail)
                ?? "Unable to inspect this dataset."
            );
        }
    }

    function toPercent(
        value?: number | null,
    ) {
        if (
            value === undefined ||
            value === null
        ) {
            return "0%";
        }

        return `${(
            value * 100
        ).toFixed(1)}%`;
    }


    function confidenceStyles(
        level?: string | null,
    ) {
        if (level === "Excellent") {
            return (
                "border-emerald-500/30 " +
                "bg-emerald-500/10 " +
                "text-emerald-300"
            );
        }

        if (level === "Good") {
            return (
                "border-green-500/30 " +
                "bg-green-500/10 " +
                "text-green-300"
            );
        }

        if (level === "Moderate") {
            return (
                "border-yellow-500/30 " +
                "bg-yellow-500/10 " +
                "text-yellow-300"
            );
        }

        return (
            "border-red-500/30 " +
            "bg-red-500/10 " +
            "text-red-300"
        );
    }


    function predictionConfidenceLabel(
        confidence: number,
    ) {
        if (confidence >= 0.75) {
            return "High confidence";
        }

        if (confidence >= 0.50) {
            return "Moderate confidence";
        }

        return "Low confidence";
    }


    function predictionConfidenceClass(
        confidence: number,
    ) {
        if (confidence >= 0.75) {
            return (
                "border-emerald-500/30 " +
                "bg-emerald-500/10 " +
                "text-emerald-300"
            );
        }

        if (confidence >= 0.50) {
            return (
                "border-yellow-500/30 " +
                "bg-yellow-500/10 " +
                "text-yellow-300"
            );
        }

        return (
            "border-orange-500/30 " +
            "bg-orange-500/10 " +
            "text-orange-300"
        );
    }


    ////////////////////////////////////////////////////////////
    // Model Health
    ////////////////////////////////////////////////////////////

    const modelHealth =
        useMemo(() => {

            const trainAccuracy =
                job?.training_history
                    ?.train_accuracy ?? [];

            const validationAccuracy =
                job?.training_history
                    ?.validation_accuracy ?? [];

            const trainLoss =
                job?.training_history
                    ?.train_loss ?? [];

            const validationLoss =
                job?.training_history
                    ?.validation_loss ?? [];

            if (
                !trainAccuracy.length ||
                !validationAccuracy.length
            ) {
                return {
                    status: "Unknown",
                    title:
                        "Not enough training data",
                    message:
                        "Model health will appear after training completes.",
                    className:
                        "border-slate-700 bg-slate-800/40 text-slate-300",
                };
            }

            const finalTrainAccuracy =
                trainAccuracy[
                    trainAccuracy.length - 1
                ];

            const finalValidationAccuracy =
                validationAccuracy[
                    validationAccuracy.length - 1
                ];

            const accuracyGap =
                finalTrainAccuracy -
                finalValidationAccuracy;

            const validationLossIncreasing =
                validationLoss.length >= 3 &&
                validationLoss[
                    validationLoss.length - 1
                ] >
                validationLoss[
                    validationLoss.length - 3
                ];

            const trainLossDecreasing =
                trainLoss.length >= 3 &&
                trainLoss[
                    trainLoss.length - 1
                ] <
                trainLoss[
                    trainLoss.length - 3
                ];

            if (
                accuracyGap > 0.15 ||
                (
                    validationLossIncreasing &&
                    trainLossDecreasing
                )
            ) {
                return {
                    status: "Warning",
                    title:
                        "Possible overfitting detected",
                    message:
                        "The model performs noticeably better on training data than validation data. It may be memorizing training examples too closely.",
                    className:
                        "border-amber-500/30 bg-amber-500/10 text-amber-200",
                };
            }

            if (
                finalValidationAccuracy >= 0.90 &&
                Math.abs(
                    accuracyGap
                ) <= 0.10
            ) {
                return {
                    status: "Healthy",
                    title:
                        "Strong generalization",
                    message:
                        "Training and validation performance are closely aligned, with no obvious overfitting signal.",
                    className:
                        "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
                };
            }

            if (
                finalValidationAccuracy >= 0.70
            ) {
                return {
                    status: "Moderate",
                    title:
                        "Model is learning",
                    message:
                        "The model learned useful patterns, but additional data or tuning may improve validation performance.",
                    className:
                        "border-blue-500/30 bg-blue-500/10 text-blue-200",
                };
            }

            return {
                status:
                    "Needs Improvement",
                title:
                    "Weak validation performance",
                message:
                    "The model is not yet generalizing reliably. Consider more training data, cleaner labels, or additional tuning.",
                className:
                    "border-red-500/30 bg-red-500/10 text-red-200",
            };

        }, [job]);


    ////////////////////////////////////////////////////////////
    // Model Verdict
    ////////////////////////////////////////////////////////////

    const modelVerdict =
        useMemo(() => {

            if (!job?.metrics) {
                return null;
            }

            const accuracy =
                job.metrics.accuracy ?? 0;

            const testSamples =
                job.dataset_summary
                    ?.test_samples ?? 0;

            const correctPredictions =
                Math.round(
                    accuracy *
                    testSamples
                );

            let title =
                "Model Needs Improvement";

            let message =
                "The model is not yet performing reliably on unseen validation data.";

            let className =
                "border-red-500/30 bg-red-500/10";

            let badgeClass =
                "border-red-400/30 bg-red-400/10 text-red-300";

            if (
                accuracy >= 0.90
            ) {
                title =
                    "Strong Validation Result";

                message =
                    "The model performed very well on the validation examples used in this training run.";

                className =
                    "border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-slate-900";

                badgeClass =
                    "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";

            } else if (
                accuracy >= 0.75
            ) {
                title =
                    "Promising Validation Result";

                message =
                    "The model learned useful patterns, but more data or tuning may improve reliability.";

                className =
                    "border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-slate-900";

                badgeClass =
                    "border-blue-400/30 bg-blue-400/10 text-blue-300";
            }

            return {
                title,
                message,
                className,
                badgeClass,
                testSamples,
                correctPredictions,
            };

        }, [job]);


    ////////////////////////////////////////////////////////////
    // Train
    ////////////////////////////////////////////////////////////

    async function handleTrain() {

        if (!file) {
            return;
        }

        if (
            !textColumn.trim() ||
            !targetColumn.trim()
        ) {
            return;
        }

        setPrediction(null);
        setPredictionText("");
        setPredictionError(null);

        try {

            await startTraining({
                file,
                text_column:
                    textColumn.trim(),
                target_column:
                    targetColumn.trim(),
                task,
                max_epochs:
                    maxEpochs,
                candidate_architectures: compareTransformer
                    ? [NLPArchitecture.LSTM, NLPArchitecture.DISTILBERT]
                    : [NLPArchitecture.LSTM],
            });

            await refreshJobs();

        } catch (err: any) {

            console.error(err);
        }
    }


    ////////////////////////////////////////////////////////////
    // Predict
    ////////////////////////////////////////////////////////////

    async function handlePredict() {

        if (!job?.job_id) {
            return;
        }

        const text =
            predictionText.trim();

        if (!text) {
            setPredictionError(
                "Enter some text to test the trained model."
            );

            return;
        }

        setPredicting(true);
        setPredictionError(null);
        setPrediction(null);

        try {

            const result =
                await AutoNLPService.predict(
                    job.job_id,
                    {
                        text,
                    },
                );

            setPrediction(
                result
            );

        } catch (err: any) {

            console.error(
                "AutoNLP prediction failed:",
                err
            );

            const detail = err?.response?.data?.detail;
            setPredictionError(
                (typeof detail === "object" ? detail?.message : detail)
                ?? "Prediction failed. Please confirm the prediction input and try again."
            );

        } finally {

            setPredicting(false);
        }
    }

    async function handleBatchPredict() {
        if (!job?.job_id || !batchFile || !textColumn.trim()) return;
        setBatching(true);
        setBatchResult(null);
        try {
            setBatchResult(await AutoNLPService.predictBatch(
                job.job_id,
                batchFile,
                textColumn.trim(),
            ));
        } catch (err: any) {
            const detail = err?.response?.data?.detail;
            setPredictionError(
                (typeof detail === "object" ? detail?.message : detail)
                ?? "CSV prediction failed."
            );
        } finally {
            setBatching(false);
        }
    }

    function downloadBatchResults() {
        if (!batchResult) return;
        const escape = (value: unknown) => {
            const raw = String(value ?? "");
            const safe = /^[=+\-@]/.test(raw) ? `'${raw}` : raw;
            return `"${safe.replaceAll('"', '""')}"`;
        };
        const lines = ["row_index,predicted_label,confidence,error", ...batchResult.rows.map(row =>
            [row.row_index, row.predicted_label, row.confidence, row.error].map(escape).join(",")
        )];
        const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `autonlp-${batchResult.job_id}-predictions.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
    }


    ////////////////////////////////////////////////////////////
    // Reset
    ////////////////////////////////////////////////////////////

    function handleReset() {

        setFile(null);
        setPredictionText("");
        setPrediction(null);
        setPredictionError(null);

        resetJob();
    }


    ////////////////////////////////////////////////////////////
    // UI
    ////////////////////////////////////////////////////////////

    return (

        <div className="space-y-8">

            {/* Page Header */}

            <div>

                <h1 className="text-3xl font-bold tracking-tight text-white">
                    AutoNLP Studio
                </h1>

                <p className="mt-2 max-w-3xl text-slate-400">
                    Upload labelled text data, run AutoNLP,
                    compare supported text models, and test
                    the saved model on new text.
                </p>

            </div>


            {/* Workflow */}

            <div className="grid gap-4 md:grid-cols-4">

                <StepCard
                    number="1"
                    title="Upload Data"
                    text="Choose labelled text data."
                />

                <StepCard
                    number="2"
                    title="Run AutoNLP"
                    text="Train one model or compare valid candidates."
                />

                <StepCard
                    number="3"
                    title="Review Model"
                    text="Inspect validation results."
                />

                <StepCard
                    number="4"
                    title="Test Model"
                    text="Try new unseen text."
                />

            </div>


            {managedJobs.length > 0 && (
                <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
                    <h2 className="text-lg font-bold text-white">My AutoNLP Models</h2>
                    <div className="mt-4 space-y-2">
                        {managedJobs.map(item => (
                            <div key={item.job_id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-950 p-3 text-sm">
                                <span className="text-slate-300">{item.task.replaceAll("_", " ")} · {item.status}{item.metrics?.accuracy == null ? "" : ` · ${(item.metrics.accuracy * 100).toFixed(1)}% accuracy`} · {item.job_id}</span>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        await AutoNLPService.archiveJob(item.job_id);
                                        await refreshJobs();
                                    }}
                                    className="text-amber-300"
                                >Archive</button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <AIModelRegistryPanel module="autonlp" />

            {/* Configuration */}

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

                <div className="flex items-center gap-4">

                    <div className="rounded-xl bg-purple-600/20 p-3">

                        <Languages
                            size={28}
                            className="text-purple-400"
                        />

                    </div>

                    <div>

                        <h2 className="text-2xl font-bold text-white">
                            Configure AutoNLP Job
                        </h2>

                        <p className="mt-1 text-slate-400">
                            Upload CSV, XLS, or XLSX data
                            containing text and the correct
                            label for each row.
                        </p>

                    </div>

                </div>


                {/* Dataset */}

                <div className="mt-8">

                    <label className="block text-sm font-medium text-slate-300">
                        Dataset
                    </label>

                    <label className="mt-2 flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-600 bg-slate-950 px-5 py-5 transition hover:border-purple-500">

                        <div className="flex items-center gap-3">

                            <Upload
                                size={24}
                                className="text-purple-400"
                            />

                            <div>

                                <p className="font-medium text-white">
                                    {file
                                        ? file.name
                                        : "Choose dataset file"}
                                </p>

                                <p className="mt-1 text-sm text-slate-500">
                                    CSV, XLS, or XLSX
                                </p>

                            </div>

                        </div>

                        <input
                            type="file"
                            accept=".csv,.xls,.xlsx"
                            className="hidden"
                            onChange={(e) => {

                                const selected =
                                    e.target.files?.[0]
                                    ?? null;

                                setFile(
                                    selected
                                );

                                void inspectFile(selected);

                                setPrediction(
                                    null
                                );

                                setPredictionText(
                                    ""
                                );

                                resetJob();
                            }}
                        />

                    </label>

                    {file && (
                        <button
                            type="button"
                            onClick={() => void inspectFile(file)}
                            className="mt-3 rounded-lg border border-purple-500/30 px-4 py-2 text-sm text-purple-300"
                        >
                            Refresh Dataset Inspection
                        </button>
                    )}

                    {inspection && (
                        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
                            <p><strong>Rows:</strong> {inspection.row_count}</p>
                            <p className="mt-1"><strong>Columns:</strong> {inspection.columns.join(", ")}</p>
                            <p className="mt-1"><strong>Detected text candidates:</strong> {inspection.text_candidates.join(", ") || "None"}</p>
                            <p className="mt-1"><strong>Detected target candidates:</strong> {inspection.target_candidates.join(", ") || "None"}</p>
                            <p className="mt-1"><strong>Missing values:</strong> {Object.entries(inspection.missing_values).map(([name, count]) => `${name}: ${count}`).join(", ")}</p>
                            {Object.keys(inspection.class_balance).length > 0 && <p className="mt-1"><strong>Class balance:</strong> {Object.entries(inspection.class_balance).map(([name, count]) => `${name}: ${count}`).join(", ")}</p>}
                            {Object.keys(inspection.text_length_summary).length > 0 && <p className="mt-1"><strong>Text lengths:</strong> min {inspection.text_length_summary.min}, mean {inspection.text_length_summary.mean}, median {inspection.text_length_summary.median}, max {inspection.text_length_summary.max}</p>}
                        </div>
                    )}

                    {inspectionError && (
                        <p className="mt-3 text-sm text-red-300">{inspectionError}</p>
                    )}

                </div>


                {/* Columns */}

                <div className="mt-6 grid gap-5 md:grid-cols-2">

                    <div>

                        <label className="block text-sm font-medium text-slate-300">
                            Text Column
                        </label>

                        <input
                            value={textColumn}
                            onChange={(e) =>
                                setTextColumn(
                                    e.target.value
                                )
                            }
                            placeholder="text"
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        />

                    </div>


                    <div>

                        <label className="block text-sm font-medium text-slate-300">
                            Target Column
                        </label>

                        <input
                            value={targetColumn}
                            onChange={(e) =>
                                setTargetColumn(
                                    e.target.value
                                )
                            }
                            placeholder="sentiment"
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        />

                    </div>

                </div>


                {/* Task + Epochs */}

                <div className="mt-6 grid gap-5 md:grid-cols-2">

                    <div>

                        <label className="block text-sm font-medium text-slate-300">
                            NLP Task
                        </label>

                        <select
                            value={task}
                            onChange={(e) => {
                                setTask(
                                    e.target.value as NLPTask
                                );
                            }}
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        >

                            <option
                                value={
                                    NLPTask.SENTIMENT_ANALYSIS
                                }
                            >
                                Sentiment Analysis
                            </option>

                            <option
                                value={
                                    NLPTask.TEXT_CLASSIFICATION
                                }
                            >
                                Text Classification
                            </option>

                        </select>

                    </div>


                    <div>

                        <label className="block text-sm font-medium text-slate-300">
                            Maximum Epochs
                        </label>

                        <input
                            type="number"
                            min={1}
                            max={100}
                            value={maxEpochs}
                            onChange={(e) => {

                                const value =
                                    Number(
                                        e.target.value
                                    );

                                if (
                                    Number.isFinite(
                                        value
                                    )
                                ) {
                                    setMaxEpochs(
                                        value
                                    );
                                }
                            }}
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        />

                    </div>

                </div>


                {/* Automatic Architecture */}

                <div className="mt-6 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">

                    <p className="text-sm font-semibold text-purple-200">
                        Model Selection
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-300">
                        LSTM remains the default. Optionally compare it with a pretrained DistilBERT classifier.
                    </p>
                    <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
                        <input type="checkbox" checked={compareTransformer} onChange={(event) => setCompareTransformer(event.target.checked)} />
                        Compare LSTM with pretrained DistilBERT
                    </label>

                </div>


                {/* Run */}

                <button
                    onClick={
                        handleTrain
                    }
                    disabled={
                        loading ||
                        !file ||
                        !textColumn.trim() ||
                        !targetColumn.trim()
                    }
                    className="
                        mt-8
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-3
                        rounded-xl
                        bg-purple-600
                        px-6
                        py-4
                        text-lg
                        font-semibold
                        text-white
                        transition
                        hover:bg-purple-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >

                    {loading ? (

                        <>
                            <Loader2
                                size={22}
                                className="animate-spin"
                            />

                            Running AutoNLP...
                        </>

                    ) : (

                        <>
                            <BarChart3
                                size={22}
                            />

                            Run AutoNLP
                        </>

                    )}

                </button>

            </div>


            {/* Training Error */}

            {error && (

                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5">

                    <div className="flex items-start gap-3">

                        <AlertTriangle
                            size={22}
                            className="mt-0.5 text-red-400"
                        />

                        <div>

                            <h3 className="font-semibold text-red-300">
                                Training Error
                            </h3>

                            <p className="mt-1 text-red-200">
                                {error}
                            </p>

                        </div>

                    </div>

                </div>

            )}


            {/* Loading */}

            {loading && (

                <div className="flex items-center gap-4 rounded-2xl border border-purple-500/20 bg-slate-900 p-6">

                    <Loader2
                        className="animate-spin text-purple-500"
                        size={30}
                    />

                    <div>

                        <p className="font-semibold text-white">
                            AutoNLP is training your model
                        </p>

                        {job?.progress && (
                            <div className="mt-4 w-full max-w-xl">
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>{job.progress.stage.replaceAll("_", " ")}</span>
                                    <span>{job.progress.current_epoch}/{job.progress.total_epochs} epochs · {job.progress.percentage.toFixed(0)}%</span>
                                </div>
                                <div className="mt-2 h-2 overflow-hidden rounded bg-slate-800">
                                    <div className="h-full bg-purple-500" style={{ width: `${Math.min(job.progress.percentage, 100)}%` }} />
                                </div>
                            </div>
                        )}

                        <p className="mt-1 text-slate-400">
                            The text is being prepared and
                            the selected model candidates are learning from
                            your dataset.
                        </p>

                    </div>

                </div>

            )}


            {/* Results */}

            {job?.metrics && (

                <div className="space-y-8">


                    {/* Model Verdict */}

                    {modelVerdict && (

                        <div
                            className={`
                                rounded-2xl
                                border
                                p-6
                                ${modelVerdict.className}
                            `}
                        >

                            <div className="flex flex-wrap items-start justify-between gap-4">

                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                                        AutoNLP Result
                                    </p>

                                    <h2 className="mt-2 text-2xl font-bold text-white">
                                        {modelVerdict.title}
                                    </h2>

                                    <p className="mt-2 max-w-3xl leading-7 text-slate-300">
                                        {modelVerdict.message}
                                    </p>

                                </div>

                                <span
                                    className={`
                                        rounded-full
                                        border
                                        px-4
                                        py-2
                                        text-sm
                                        font-semibold
                                        ${modelVerdict.badgeClass}
                                    `}
                                >
                                    Validation Result
                                </span>

                            </div>


                            <div className="mt-6 grid gap-4 md:grid-cols-2">

                                <InfoCard
                                    label="Correct Validation Predictions"
                                    value={
                                        `${modelVerdict.correctPredictions} / ${modelVerdict.testSamples}`
                                    }
                                    help="Validation examples classified correctly."
                                />

                                <InfoCard
                                    label="Next Step"
                                    value="Test Model"
                                    help="Try realistic unseen text below."
                                />

                            </div>

                        </div>

                    )}


                    {/* Artifact Ready */}

                    {job.artifact && (

                        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">

                            <div className="flex items-start gap-4">

                                <CheckCircle2
                                    size={28}
                                    className="mt-1 text-emerald-400"
                                />

                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                                        Model Artifact Ready
                                    </p>

                                    <h3 className="mt-2 text-xl font-bold text-white">
                                        {job.artifact?.model_name ?? "Model"} saved successfully
                                    </h3>

                                    <p className="mt-2 max-w-3xl leading-7 text-slate-300">
                                        AutoNLP saved the trained
                                        model, vocabulary, labels,
                                        and preprocessing metadata.
                                        The trained model is ready
                                        for testing.
                                    </p>

                                    <div className="mt-4 flex flex-wrap gap-3">

                                        <span className="rounded-full border border-emerald-500/30 bg-slate-950/50 px-3 py-1.5 text-sm text-emerald-200">
                                            Model: {
                                                job.artifact
                                                    .model_name
                                            }
                                        </span>

                                        <span className="rounded-full border border-emerald-500/30 bg-slate-950/50 px-3 py-1.5 text-sm text-emerald-200">
                                            Status: {
                                                job.artifact
                                                    .status
                                            }
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}


                    {/* Technical Result */}

                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

                        <div className="flex flex-wrap items-center justify-between gap-4">

                            <div>

                                <p className="text-sm uppercase tracking-wide text-slate-500">
                                    Trained Model
                                </p>

                                <h2 className="mt-1 text-2xl font-bold text-white">
                                    {
                                        job.metrics
                                            .architecture
                                        ?? "LSTM"
                                    }
                                </h2>

                            </div>

                            <span
                                className={`
                                    rounded-full
                                    border
                                    px-4
                                    py-2
                                    text-sm
                                    font-semibold
                                    ${confidenceStyles(
                                        job.metrics
                                            .confidence_level
                                    )}
                                `}
                            >
                                {
                                    job.metrics
                                        .confidence_level
                                    ?? "N/A"
                                }
                                {" validation performance"}
                            </span>

                        </div>


                        <div className="mt-6 rounded-xl border-l-4 border-purple-500 bg-purple-500/10 p-4">

                            <p className="text-slate-300">
                                {
                                    job.metrics
                                        .summary
                                }
                            </p>

                        </div>


                        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                            <MetricCard
                                label="Accuracy"
                                value={toPercent(
                                    job.metrics
                                        .accuracy
                                )}
                                help="How often validation examples were classified correctly."
                            />

                            <MetricCard
                                label="Precision"
                                value={toPercent(
                                    job.metrics
                                        .precision
                                )}
                                help="How often predicted labels were correct."
                            />

                            <MetricCard
                                label="Recall"
                                value={toPercent(
                                    job.metrics
                                        .recall
                                )}
                                help="How many real examples the model successfully identified."
                            />

                            <MetricCard
                                label="F1 Score"
                                value={toPercent(
                                    job.metrics
                                        .f1_score
                                )}
                                help="Balanced measure of precision and recall."
                            />

                        </div>


                        <div className="mt-6 grid gap-4 sm:grid-cols-2">

                            <InfoCard
                                label="Prediction Error"
                                value={
                                    (
                                        job.metrics
                                            .final_loss
                                        ?? 0
                                    ).toFixed(
                                        4
                                    )
                                }
                                help="Lower validation loss is generally better."
                            />

                            <InfoCard
                                label="Words Learned"
                                value={
                                    job.metrics
                                        .input_tokens
                                    ?? 0
                                }
                                help="Vocabulary size learned from the uploaded dataset."
                            />

                        </div>

                    </div>


                    {/* Dataset + Training */}

                    <div className="grid gap-6 xl:grid-cols-2">

                        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

                            <div className="flex items-center gap-3">

                                <FileText
                                    className="text-purple-400"
                                    size={22}
                                />

                                <h3 className="text-lg font-bold text-white">
                                    Dataset Overview
                                </h3>

                            </div>


                            <div className="mt-5 grid grid-cols-2 gap-4">

                                <InfoCard
                                    label="Total Samples"
                                    value={
                                        job.dataset_summary
                                            ?.total_samples
                                        ?? 0
                                    }
                                />

                                <InfoCard
                                    label="Training Samples"
                                    value={
                                        job.dataset_summary
                                            ?.training_samples
                                        ?? 0
                                    }
                                />

                                <InfoCard
                                    label="Validation Samples"
                                    value={
                                        job.dataset_summary
                                            ?.test_samples
                                        ?? 0
                                    }
                                />

                                <InfoCard
                                    label="Words Learned"
                                    value={
                                        job.dataset_summary
                                            ?.vocab_size
                                        ?? 0
                                    }
                                />

                            </div>


                            <div className="mt-5">

                                <p className="text-sm text-slate-500">
                                    Labels learned
                                </p>

                                <div className="mt-2 flex flex-wrap gap-2">

                                    {job.dataset_summary
                                        ?.classes
                                        ?.map(
                                            (label) => (

                                                <span
                                                    key={
                                                        label
                                                    }
                                                    className="rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300"
                                                >
                                                    {label}
                                                </span>

                                            )
                                        )}

                                </div>

                            </div>

                        </div>


                        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

                            <div className="flex items-center gap-3">

                                <CheckCircle2
                                    className="text-emerald-400"
                                    size={22}
                                />

                                <h3 className="text-lg font-bold text-white">
                                    Training Details
                                </h3>

                            </div>


                            <div className="mt-5 grid grid-cols-2 gap-4">

                                <InfoCard
                                    label="Requested Epochs"
                                    value={
                                        job.training_info
                                            ?.epochs_requested
                                        ?? 0
                                    }
                                />

                                <InfoCard
                                    label="Epochs Trained"
                                    value={
                                        job.training_info
                                            ?.epochs_trained
                                        ?? 0
                                    }
                                />

                                <InfoCard
                                    label="Best Epoch"
                                    value={
                                        job.training_info
                                            ?.best_epoch
                                        ?? 0
                                    }
                                />

                                <InfoCard
                                    label="Training Time"
                                    value={`${(
                                        job.training_info
                                            ?.training_time
                                        ?? 0
                                    ).toFixed(
                                        2
                                    )}s`}
                                />

                            </div>


                            <div className="mt-5 rounded-xl bg-slate-950 p-4">

                                <p className="text-sm text-slate-400">
                                    Early Stopping
                                </p>

                                <p className="mt-1 font-semibold text-white">

                                    {job.training_info
                                        ?.early_stopped
                                        ? "Yes — training stopped when validation performance stopped improving."
                                        : "No — training completed the requested epochs."}

                                </p>

                            </div>

                        </div>

                    </div>


                    {/* Model Health */}

                    <div
                        className={`
                            rounded-2xl
                            border
                            p-6
                            ${modelHealth.className}
                        `}
                    >

                        <div className="flex flex-wrap items-center justify-between gap-3">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
                                    Model Health
                                </p>

                                <h3 className="mt-1 text-xl font-bold">
                                    {
                                        modelHealth.title
                                    }
                                </h3>

                            </div>

                            <span className="rounded-full border border-current/20 px-3 py-1 text-sm font-semibold">
                                {
                                    modelHealth.status
                                }
                            </span>

                        </div>

                        <p className="mt-3 max-w-4xl leading-7 opacity-90">
                            {
                                modelHealth.message
                            }
                        </p>

                    </div>


                    <TrainingCurves history={job.training_history} />

                    <ConfusionMatrixView
                        labels={job.evaluation?.labels}
                        matrix={job.evaluation?.confusion_matrix}
                    />
                    <RocCurveView curve={job.evaluation?.roc_curve} auc={job.evaluation?.roc_auc} />

                    {!!job.leaderboard?.length && (
                        <div className="rounded-xl border border-slate-700 bg-slate-950 p-4">
                            <h3 className="mb-3 font-semibold text-white">Model Comparison</h3>
                            {job.leaderboard.map((item, index) => (
                                <div key={`${item.model_name}-${index}`} className="flex justify-between py-1 text-sm text-slate-300">
                                    <span>{item.rank ? `#${item.rank} ` : ""}{item.model_name}</span>
                                    <span>{item.success ? `${toPercent(item.f1_score)} F1` : item.error ?? "Failed"}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <ClassMetricsChart metrics={job.evaluation?.class_metrics} />

                    {/* Performance by Class */}

                    {job.evaluation
                        ?.class_metrics
                        ?.length ? (

                        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

                            <h3 className="text-lg font-bold text-white">
                                Performance by Class
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                                See how well the model
                                performed for each label.
                            </p>

                            <div className="mt-6 overflow-x-auto">

                                <table className="w-full text-left">

                                    <thead>

                                        <tr className="border-b border-slate-700 text-sm text-slate-500">

                                            <th className="pb-3">
                                                Label
                                            </th>

                                            <th className="pb-3">
                                                Precision
                                            </th>

                                            <th className="pb-3">
                                                Recall
                                            </th>

                                            <th className="pb-3">
                                                F1
                                            </th>

                                            <th className="pb-3">
                                                Samples
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {job.evaluation
                                            .class_metrics
                                            .map(
                                                (
                                                    metric
                                                ) => (

                                                    <tr
                                                        key={
                                                            metric.class_id
                                                        }
                                                        className="border-b border-slate-800"
                                                    >

                                                        <td className="py-4 font-semibold text-white">
                                                            {
                                                                metric.label
                                                            }
                                                        </td>

                                                        <td className="py-4 text-slate-300">
                                                            {toPercent(
                                                                metric.precision
                                                            )}
                                                        </td>

                                                        <td className="py-4 text-slate-300">
                                                            {toPercent(
                                                                metric.recall
                                                            )}
                                                        </td>

                                                        <td className="py-4 text-slate-300">
                                                            {toPercent(
                                                                metric.f1_score
                                                            )}
                                                        </td>

                                                        <td className="py-4 text-slate-300">
                                                            {
                                                                metric.support
                                                            }
                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    ) : null}


                    {/* Test Trained Model */}

                    {job.artifact &&
                        job.artifact.status ===
                            "ready" && (

                        <div className="rounded-2xl border border-purple-500/30 bg-slate-900 p-6">

                            <div className="flex flex-wrap items-start justify-between gap-4">

                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300">
                                        Step 4
                                    </p>

                                    <h3 className="mt-2 text-2xl font-bold text-white">
                                        Test Trained Model
                                    </h3>

                                    <p className="mt-2 max-w-3xl leading-7 text-slate-400">
                                        Enter new text below.
                                        AutoNLP will use the
                                        saved LSTM artifact from
                                        this training run.
                                    </p>

                                </div>

                                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">
                                    Artifact Ready
                                </span>

                            </div>


                            <div className="mt-6">

                                <label className="block text-sm font-medium text-slate-300">
                                    New Text
                                </label>

                                <textarea
                                    value={
                                        predictionText
                                    }
                                    onChange={(e) => {

                                        setPredictionText(
                                            e.target.value
                                        );

                                        setPrediction(
                                            null
                                        );

                                        setPredictionError(
                                            null
                                        );
                                    }}
                                    rows={5}
                                    placeholder="Example: I am unhappy with the product because I kept running into errors."
                                    className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 leading-7 text-white placeholder:text-slate-600 focus:border-purple-500 focus:outline-none"
                                />

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handlePredict
                                }
                                disabled={
                                    predicting ||
                                    !predictionText.trim()
                                }
                                className="
                                    mt-4
                                    flex
                                    w-full
                                    items-center
                                    justify-center
                                    gap-3
                                    rounded-xl
                                    bg-purple-600
                                    px-6
                                    py-3.5
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-purple-700
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >

                                {predicting ? (

                                    <>
                                        <Loader2
                                            size={20}
                                            className="animate-spin"
                                        />

                                        Testing Model...
                                    </>

                                ) : (

                                    "Predict With Trained Model"

                                )}

                            </button>


                            {predictionError && (

                                <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">

                                    <div className="flex items-start gap-3">

                                        <AlertTriangle
                                            size={20}
                                            className="mt-0.5"
                                        />

                                        <p>
                                            {
                                                predictionError
                                            }
                                        </p>

                                    </div>

                                </div>

                            )}


                            {prediction && (

                                <div className="mt-6 space-y-5">

                                    <div className="grid gap-4 md:grid-cols-3">

                                        <InfoCard
                                            label="Prediction"
                                            value={
                                                prediction
                                                    .predicted_label
                                            }
                                        />

                                        <InfoCard
                                            label="Confidence"
                                            value={toPercent(
                                                prediction
                                                    .confidence
                                            )}
                                        />

                                        <InfoCard
                                            label="Model"
                                            value={
                                                prediction
                                                    .model_name
                                            }
                                        />

                                    </div>


                                    <div
                                        className={`
                                            rounded-xl
                                            border
                                            p-4
                                            ${predictionConfidenceClass(
                                                prediction.confidence
                                            )}
                                        `}
                                    >

                                        <p className="font-semibold">
                                            {
                                                predictionConfidenceLabel(
                                                    prediction
                                                        .confidence
                                                )
                                            }
                                        </p>

                                        <p className="mt-1 text-sm leading-6 opacity-90">

                                            {prediction.confidence <
                                            0.50
                                                ? "The model is uncertain about this prediction. Consider more representative training data before relying on the result."
                                                : "The model has a clearer preference for this prediction, but it should still be validated on realistic unseen data."}

                                        </p>

                                    </div>


                                    <div className="rounded-xl border border-slate-700 bg-slate-950 p-5">

                                        <h4 className="font-semibold text-white">
                                            Class Probabilities
                                        </h4>

                                        <div className="mt-5 space-y-4">

                                            {prediction
                                                .probabilities
                                                .map(
                                                    (
                                                        item
                                                    ) => {

                                                        const width =
                                                            Math.max(
                                                                0,
                                                                Math.min(
                                                                    100,
                                                                    item.probability *
                                                                        100
                                                                )
                                                            );

                                                        return (

                                                            <div
                                                                key={
                                                                    item.label
                                                                }
                                                            >

                                                                <div className="flex items-center justify-between gap-4">

                                                                    <span className="font-medium text-slate-300">
                                                                        {
                                                                            item.label
                                                                        }
                                                                    </span>

                                                                    <span className="font-semibold text-white">
                                                                        {toPercent(
                                                                            item.probability
                                                                        )}
                                                                    </span>

                                                                </div>

                                                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">

                                                                    <div
                                                                        className="h-full rounded-full bg-purple-500 transition-all"
                                                                        style={{
                                                                            width:
                                                                                `${width}%`,
                                                                        }}
                                                                    />

                                                                </div>

                                                            </div>

                                                        );
                                                    }
                                                )}

                                        </div>

                                    </div>

                                </div>

                            )}

                            {!!prediction?.token_attributions?.length && (
                                <div className="mt-6 rounded-xl border border-slate-700 bg-slate-950 p-4">
                                    <h4 className="font-semibold text-white">Token Attribution</h4>
                                    <div className="mt-3 flex flex-wrap gap-2">{prediction.token_attributions.map((item, index) => (
                                        <span key={`${item.token}-${index}`} className={`rounded px-2 py-1 text-sm ${item.attribution >= 0 ? "bg-emerald-500/20 text-emerald-200" : "bg-red-500/20 text-red-200"}`}>
                                            {item.token} {item.attribution.toFixed(2)}
                                        </span>
                                    ))}</div>
                                </div>
                            )}

                            <div className="mt-8 border-t border-slate-700 pt-6">
                                <h4 className="font-semibold text-white">CSV Batch Prediction</h4>
                                <p className="mt-1 text-sm text-slate-400">Upload a CSV containing the configured text column. Every row returns a label, confidence, or validation error.</p>
                                <input
                                    type="file"
                                    accept=".csv,text/csv"
                                    onChange={(event) => {
                                        setBatchFile(event.target.files?.[0] ?? null);
                                        setBatchResult(null);
                                    }}
                                    className="mt-4 block w-full text-sm text-slate-300"
                                />
                                <button
                                    type="button"
                                    onClick={handleBatchPredict}
                                    disabled={!batchFile || batching}
                                    className="mt-4 rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                                >{batching ? "Predicting CSV..." : "Predict CSV"}</button>
                                {batchResult && (
                                    <div className="mt-4 overflow-x-auto">
                                        <p className="mb-3 text-sm text-slate-300">{batchResult.valid_rows} valid · {batchResult.failed_rows} failed</p>
                                        <button type="button" onClick={downloadBatchResults} className="mb-3 rounded-lg border border-purple-500 px-3 py-1.5 text-sm text-purple-200">Download CSV results</button>
                                        <table className="min-w-full text-left text-sm">
                                            <thead><tr className="text-slate-500"><th className="p-2">Row</th><th className="p-2">Label</th><th className="p-2">Confidence</th><th className="p-2">Error</th></tr></thead>
                                            <tbody>{batchResult.rows.map(row => (
                                                <tr key={row.row_index} className="border-t border-slate-800 text-slate-300">
                                                    <td className="p-2">{row.row_index}</td>
                                                    <td className="p-2">{row.predicted_label ?? "—"}</td>
                                                    <td className="p-2">{row.confidence == null ? "—" : toPercent(row.confidence)}</td>
                                                    <td className="p-2 text-red-300">{row.error ?? "—"}</td>
                                                </tr>
                                            ))}</tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                        </div>

                    )}


                    {/* Plain English */}

                    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-6">

                        <h3 className="text-lg font-bold text-white">
                            What does this mean?
                        </h3>

                        <p className="mt-3 max-w-4xl leading-7 text-slate-300">

                            AutoNLP trained {job.metrics?.architecture ?? "a text model"}
                            using your uploaded data. It was
                            evaluated on{" "}

                            <strong className="text-white">
                                {
                                    job.dataset_summary
                                        ?.test_samples
                                    ?? 0
                                }
                            </strong>

                            {" "}validation examples and
                            correctly classified
                            approximately{" "}

                            <strong className="text-white">
                                {
                                    Math.round(
                                        (
                                            job.metrics
                                                .accuracy
                                            ?? 0
                                        ) *
                                        (
                                            job.dataset_summary
                                                ?.test_samples
                                            ?? 0
                                        )
                                    )
                                }
                            </strong>

                            {". "}

                            The trained model has also been
                            saved and is ready for testing.

                        </p>

                    </div>


                    {/* Reset */}

                    <button
                        onClick={
                            handleReset
                        }
                        className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:border-purple-500 hover:text-white"
                    >
                        Start New AutoNLP Run
                    </button>

                </div>

            )}

        </div>
    );
}


////////////////////////////////////////////////////////////
// Workflow Step
////////////////////////////////////////////////////////////

function StepCard({
    number,
    title,
    text,
}: {
    number: string;
    title: string;
    text: string;
}) {

    return (

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-5">

            <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-600 font-bold text-white">
                    {number}
                </div>

                <div>

                    <p className="font-semibold text-white">
                        {title}
                    </p>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                        {text}
                    </p>

                </div>

            </div>

        </div>

    );
}


////////////////////////////////////////////////////////////
// Metric Card
////////////////////////////////////////////////////////////

function MetricCard({
    label,
    value,
    help,
}: {
    label: string;
    value: string;
    help?: string;
}) {

    return (

        <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">

            <p className="text-sm text-slate-500">
                {label}
            </p>

            <p className="mt-2 text-3xl font-bold text-white">
                {value}
            </p>

            {help && (

                <p className="mt-3 text-xs leading-5 text-slate-500">
                    {help}
                </p>

            )}

        </div>

    );
}


////////////////////////////////////////////////////////////
// Info Card
////////////////////////////////////////////////////////////

function InfoCard({
    label,
    value,
    help,
}: {
    label: string;
    value: string | number;
    help?: string;
}) {

    return (

        <div className="rounded-xl bg-slate-950 p-4">

            <p className="text-xs uppercase tracking-wide text-slate-500">
                {label}
            </p>

            <p className="mt-2 break-words text-xl font-bold text-white">
                {value}
            </p>

            {help && (

                <p className="mt-2 text-xs leading-5 text-slate-500">
                    {help}
                </p>

            )}

        </div>

    );
}
