"use client";

import { useMemo, useState } from "react";

import {
    AlertTriangle,
    BarChart3,
    CheckCircle2,
    FileText,
    Languages,
    Loader2,
    Upload,
} from "lucide-react";

import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import useAutoNLPJob from "@/hooks/useAutoNLPJob";

import {
    NLPArchitecture,
    NLPTask,
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
    // Form State
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

    const [architecture, setArchitecture] =
        useState<NLPArchitecture>(
            NLPArchitecture.LSTM
        );

    const [maxEpochs, setMaxEpochs] =
        useState(50);


    ////////////////////////////////////////////////////////////
    // Helpers
    ////////////////////////////////////////////////////////////

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


    function handleTaskChange(
        value: string,
    ) {
        setTask(
            value as NLPTask
        );
    }


    function handleArchitectureChange(
        value: string,
    ) {
        setArchitecture(
            value as NLPArchitecture
        );
    }


    ////////////////////////////////////////////////////////////
    // Chart Data
    ////////////////////////////////////////////////////////////

    const accuracyChartData =
        useMemo(() => {

            const train =
                job?.training_history
                    ?.train_accuracy ?? [];

            const validation =
                job?.training_history
                    ?.validation_accuracy ?? [];

            const length = Math.max(
                train.length,
                validation.length,
            );

            return Array.from(
                { length },
                (_, index) => ({
                    epoch: index + 1,

                    training:
                        train[index] ?? null,

                    validation:
                        validation[index] ?? null,
                }),
            );

        }, [job]);


    const lossChartData =
        useMemo(() => {

            const train =
                job?.training_history
                    ?.train_loss ?? [];

            const validation =
                job?.training_history
                    ?.validation_loss ?? [];

            const length = Math.max(
                train.length,
                validation.length,
            );

            return Array.from(
                { length },
                (_, index) => ({
                    epoch: index + 1,

                    training:
                        train[index] ?? null,

                    validation:
                        validation[index] ?? null,
                }),
            );

        }, [job]);


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
                        "The model performs noticeably better on training data than validation data. It may be memorizing the training examples too closely.",
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
                        "Training and validation performance are closely aligned, with no obvious overfitting signal in this run.",
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
                        "The model has learned useful patterns, but more training data or tuning may improve validation performance.",
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

            const hasConfusion =
                job.evaluation
                    ?.confusion_matrix
                    ?.some(
                        (
                            row,
                            rowIndex,
                        ) =>
                            row.some(
                                (
                                    value,
                                    columnIndex,
                                ) =>
                                    rowIndex !==
                                        columnIndex &&
                                    value > 0
                            )
                    ) ?? false;

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
                hasConfusion,
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

        try {

            await startTraining({
                file,

                text_column:
                    textColumn.trim(),

                target_column:
                    targetColumn.trim(),

                task,

                architecture,

                max_epochs:
                    maxEpochs,
            });

        } catch (err) {

            console.error(err);
        }
    }


    ////////////////////////////////////////////////////////////
    // Reset
    ////////////////////////////////////////////////////////////

    function handleReset() {

        setFile(null);

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
                    Upload labelled text data,
                    train a language model,
                    and understand how well it learned
                    using simple explanations and
                    technical metrics.
                </p>

            </div>


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
                            containing the text you want
                            the model to learn from and
                            the correct label for each row.
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

                                resetJob();
                            }}
                        />

                    </label>

                </div>


                {/* Column Selection */}

                <div className="mt-6 grid gap-5 md:grid-cols-2">

                    <div>

                        <label className="block text-sm font-medium text-slate-300">
                            Text Column
                        </label>

                        <input
                            value={textColumn}
                            onChange={(e) => {
                                setTextColumn(
                                    e.target.value
                                );
                            }}
                            placeholder="text"
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            The column containing the
                            sentences or text the model
                            should analyze.
                        </p>

                    </div>


                    <div>

                        <label className="block text-sm font-medium text-slate-300">
                            Target Column
                        </label>

                        <input
                            value={targetColumn}
                            onChange={(e) => {
                                setTargetColumn(
                                    e.target.value
                                );
                            }}
                            placeholder="sentiment"
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        />

                        <p className="mt-2 text-xs text-slate-500">
                            The column containing the
                            correct label, such as
                            positive, neutral, or negative.
                        </p>

                    </div>

                </div>


                {/* Task / Architecture / Epochs */}

                <div className="mt-6 grid gap-5 md:grid-cols-3">

                    <div>

                        <label className="block text-sm font-medium text-slate-300">
                            NLP Task
                        </label>

                        <select
                            value={task}
                            onChange={(e) => {
                                handleTaskChange(
                                    e.target.value
                                );
                            }}
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        >

                            <option value={NLPTask.SENTIMENT_ANALYSIS}>
                                Sentiment Analysis
                            </option>

                            <option value={NLPTask.TEXT_CLASSIFICATION}>
                                Text Classification
                            </option>

                        </select>

                    </div>


                    <div>

                        <label className="block text-sm font-medium text-slate-300">
                            Architecture
                        </label>

                        <select
                            value={
                                architecture
                            }
                            onChange={(e) => {
                                handleArchitectureChange(
                                    e.target.value
                                );
                            }}
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        >

                            <option value={NLPArchitecture.LSTM}>
                                LSTM
                            </option>

                            <option value={NLPArchitecture.RNN}>
                                RNN
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
                            max={500}
                            value={
                                maxEpochs
                            }
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


                {/* Train */}

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

                            Training NLP Model...
                        </>

                    ) : (

                        <>
                            <BarChart3
                                size={22}
                            />

                            Train NLP Model
                        </>

                    )}

                </button>

            </div>


            {/* Error */}

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
                            Training in progress
                        </p>

                        <p className="mt-1 text-slate-400">
                            AutoNLP is preparing your
                            text, learning patterns,
                            and checking performance on
                            unseen validation examples.
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
                                        Model Verdict
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


                            <div className="mt-6 grid gap-4 md:grid-cols-3">

                                <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-5">

                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Correct Validation Predictions
                                    </p>

                                    <p className="mt-2 text-3xl font-bold text-white">

                                        {
                                            modelVerdict.correctPredictions
                                        }

                                        {" / "}

                                        {
                                            modelVerdict.testSamples
                                        }

                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Validation examples
                                        classified correctly.
                                    </p>

                                </div>


                                <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-5">

                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Label Confusion
                                    </p>

                                    <p className="mt-2 text-xl font-bold text-white">

                                        {modelVerdict.hasConfusion
                                            ? "Some mistakes detected"
                                            : "No confusion detected"}

                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-400">

                                        {modelVerdict.hasConfusion
                                            ? "The model mixed up some labels during validation."
                                            : "No labels were mixed up in this validation run."}

                                    </p>

                                </div>


                                <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-5">

                                    <p className="text-xs uppercase tracking-wide text-slate-500">
                                        Recommended Next Step
                                    </p>

                                    <p className="mt-2 text-xl font-bold text-white">
                                        Test on real unseen text
                                    </p>

                                    <p className="mt-2 text-sm leading-6 text-slate-400">
                                        Confirm the result on
                                        realistic data before
                                        production use.
                                    </p>

                                </div>

                            </div>

                        </div>

                    )}


                    {/* Technical Model Result */}

                    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

                        <div className="flex flex-wrap items-center justify-between gap-4">

                            <div>

                                <p className="text-sm uppercase tracking-wide text-slate-500">
                                    Technical Model Result
                                </p>

                                <h2 className="mt-1 text-2xl font-bold text-white">
                                    {
                                        job.metrics.architecture
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
                                    job.metrics.summary
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
                                help="How often the model gave the correct answer."
                            />

                            <MetricCard
                                label="Precision"
                                value={toPercent(
                                    job.metrics
                                        .precision
                                )}
                                help="When the model predicted a label, how often that prediction was correct."
                            />

                            <MetricCard
                                label="Recall"
                                value={toPercent(
                                    job.metrics
                                        .recall
                                )}
                                help="How many of the real examples for each label the model successfully found."
                            />

                            <MetricCard
                                label="F1 Score"
                                value={toPercent(
                                    job.metrics
                                        .f1_score
                                )}
                                help="A balanced measure combining precision and recall."
                            />

                        </div>


                        <div className="mt-6 grid gap-4 sm:grid-cols-2">

                            <InfoCard
                                label="Prediction Error"
                                value={
                                    job.metrics
                                        .final_loss
                                    ?? 0
                                }
                                help="Lower is better. This represents how far the model's predictions were from the correct answers."
                            />

                            <InfoCard
                                label="Words Learned"
                                value={
                                    job.metrics
                                        .input_tokens
                                    ?? 0
                                }
                                help="The size of the vocabulary created from the uploaded text."
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
                                    Labels the model learned
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
                                                    {
                                                        label
                                                    }
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
                                    How Training Went
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
                                        ? (
                                            "Yes — training stopped automatically when validation performance stopped improving."
                                        )
                                        : (
                                            "No — validation performance continued improving, so all requested epochs were completed."
                                        )}

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


                    {/* Accuracy Chart */}

                    {accuracyChartData.length > 0 && (

                        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

                            <h3 className="text-lg font-bold text-white">
                                How Accuracy Improved
                            </h3>

                            <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
                                Purple shows how well the
                                model learned the training
                                examples. Green shows how
                                well it performed on unseen
                                validation examples. When
                                both lines stay close, the
                                model is usually learning
                                patterns rather than simply
                                memorizing the training data.
                            </p>


                            <div className="mt-6 h-80">

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <LineChart
                                        data={
                                            accuracyChartData
                                        }
                                        margin={{
                                            top: 10,
                                            right: 20,
                                            left: 0,
                                            bottom: 5,
                                        }}
                                    >

                                        <CartesianGrid
                                            stroke="#334155"
                                            strokeDasharray="3 6"
                                            vertical={
                                                false
                                            }
                                        />

                                        <XAxis
                                            dataKey="epoch"
                                            stroke="#94a3b8"
                                            tickLine={
                                                false
                                            }
                                            axisLine={
                                                false
                                            }
                                            minTickGap={
                                                28
                                            }
                                        />

                                        <YAxis
                                            domain={[
                                                0,
                                                1,
                                            ]}
                                            stroke="#94a3b8"
                                            tickLine={
                                                false
                                            }
                                            axisLine={
                                                false
                                            }
                                            width={
                                                48
                                            }
                                            tickFormatter={(
                                                value
                                            ) =>
                                                `${Math.round(
                                                    Number(
                                                        value
                                                    ) *
                                                    100
                                                )}%`
                                            }
                                        />

                                        <Tooltip
                                            formatter={(
                                                value
                                            ) => {

                                                const numericValue =
                                                    Number(
                                                        value ??
                                                        0
                                                    );

                                                return `${(
                                                    numericValue *
                                                    100
                                                ).toFixed(
                                                    1
                                                )}%`;
                                            }}
                                            labelFormatter={(
                                                epoch
                                            ) =>
                                                `Epoch ${epoch}`
                                            }
                                            contentStyle={{
                                                backgroundColor:
                                                    "#0f172a",
                                                border:
                                                    "1px solid #334155",
                                                borderRadius:
                                                    "12px",
                                            }}
                                        />

                                        <Legend
                                            verticalAlign="top"
                                            height={
                                                36
                                            }
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="training"
                                            name="Training Accuracy"
                                            stroke="#a855f7"
                                            strokeWidth={
                                                2.5
                                            }
                                            dot={
                                                false
                                            }
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="validation"
                                            name="Validation Accuracy"
                                            stroke="#22c55e"
                                            strokeWidth={
                                                2.5
                                            }
                                            dot={
                                                false
                                            }
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            </div>

                        </div>

                    )}


                    {/* Loss Chart */}

                    {lossChartData.length > 0 && (

                        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

                            <h3 className="text-lg font-bold text-white">
                                How Prediction Error Changed
                            </h3>

                            <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
                                Loss represents prediction
                                error, so lower is better.
                                When both training and
                                validation loss decrease
                                together, the model is
                                usually learning in a
                                healthy way.
                            </p>


                            <div className="mt-6 h-80">

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <LineChart
                                        data={
                                            lossChartData
                                        }
                                        margin={{
                                            top: 10,
                                            right: 20,
                                            left: 0,
                                            bottom: 5,
                                        }}
                                    >

                                        <CartesianGrid
                                            stroke="#334155"
                                            strokeDasharray="3 6"
                                            vertical={
                                                false
                                            }
                                        />

                                        <XAxis
                                            dataKey="epoch"
                                            stroke="#94a3b8"
                                            tickLine={
                                                false
                                            }
                                            axisLine={
                                                false
                                            }
                                            minTickGap={
                                                28
                                            }
                                        />

                                        <YAxis
                                            stroke="#94a3b8"
                                            tickLine={
                                                false
                                            }
                                            axisLine={
                                                false
                                            }
                                            width={
                                                48
                                            }
                                        />

                                        <Tooltip
                                            formatter={(
                                                value
                                            ) => {

                                                const numericValue =
                                                    Number(
                                                        value ??
                                                        0
                                                    );

                                                return numericValue.toFixed(
                                                    4
                                                );
                                            }}
                                            labelFormatter={(
                                                epoch
                                            ) =>
                                                `Epoch ${epoch}`
                                            }
                                            contentStyle={{
                                                backgroundColor:
                                                    "#0f172a",
                                                border:
                                                    "1px solid #334155",
                                                borderRadius:
                                                    "12px",
                                            }}
                                        />

                                        <Legend
                                            verticalAlign="top"
                                            height={
                                                36
                                            }
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="training"
                                            name="Training Error"
                                            stroke="#a855f7"
                                            strokeWidth={
                                                2.5
                                            }
                                            dot={
                                                false
                                            }
                                        />

                                        <Line
                                            type="monotone"
                                            dataKey="validation"
                                            name="Validation Error"
                                            stroke="#38bdf8"
                                            strokeWidth={
                                                2.5
                                            }
                                            dot={
                                                false
                                            }
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            </div>

                        </div>

                    )}


                    {/* Confusion Matrix */}

                    {job.evaluation && (

                        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

                            <h3 className="text-lg font-bold text-white">
                                Where the Model Got Confused
                            </h3>

                            <p className="mt-1 max-w-4xl text-sm leading-6 text-slate-400">
                                Green diagonal cells are
                                correct predictions.
                                Off-diagonal cells show
                                mistakes where one label was
                                predicted as another.
                            </p>


                            <div className="mt-6 overflow-x-auto">

                                <table className="w-full border-collapse text-center">

                                    <thead>

                                        <tr>

                                            <th className="p-3 text-left text-sm text-slate-500">
                                                Actual ↓ /
                                                Predicted →
                                            </th>

                                            {job.evaluation
                                                .labels
                                                .map(
                                                    (
                                                        label
                                                    ) => (

                                                        <th
                                                            key={
                                                                label
                                                            }
                                                            className="p-3 text-sm font-semibold text-slate-300"
                                                        >
                                                            {
                                                                label
                                                            }
                                                        </th>

                                                    )
                                                )}

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {job.evaluation
                                            .confusion_matrix
                                            .map(
                                                (
                                                    row,
                                                    rowIndex,
                                                ) => (

                                                    <tr
                                                        key={
                                                            rowIndex
                                                        }
                                                    >

                                                        <td className="p-3 text-left font-medium text-slate-300">

                                                            {
                                                                job.evaluation
                                                                    ?.labels[
                                                                    rowIndex
                                                                ]
                                                            }

                                                        </td>

                                                        {row.map(
                                                            (
                                                                cell,
                                                                columnIndex,
                                                            ) => (

                                                                <td
                                                                    key={
                                                                        columnIndex
                                                                    }
                                                                    className={`
                                                                        border
                                                                        border-slate-800
                                                                        p-5
                                                                        text-lg
                                                                        font-bold
                                                                        ${
                                                                            rowIndex ===
                                                                            columnIndex
                                                                                ? "bg-emerald-500/15 text-emerald-300"
                                                                                : cell >
                                                                                  0
                                                                                    ? "bg-red-500/15 text-red-300"
                                                                                    : "bg-slate-950/40 text-slate-500"
                                                                        }
                                                                    `}
                                                                >
                                                                    {
                                                                        cell
                                                                    }
                                                                </td>

                                                            )
                                                        )}

                                                    </tr>

                                                )
                                            )}

                                    </tbody>

                                </table>

                            </div>


                            {!modelVerdict?.hasConfusion && (

                                <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                                    No label mix-ups were
                                    found in this validation
                                    run.
                                </div>

                            )}

                        </div>

                    )}


                    {/* Per-Class */}

                    {job.evaluation
                        ?.class_metrics
                        ?.length ? (

                        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

                            <h3 className="text-lg font-bold text-white">
                                Performance for Each Label
                            </h3>

                            <p className="mt-1 text-sm text-slate-400">
                                This shows whether the model
                                performs equally well for all
                                labels or struggles with a
                                particular class.
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
                                                Validation Samples
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


                    {/* Plain English */}

                    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-6">

                        <h3 className="text-lg font-bold text-white">
                            What does this mean?
                        </h3>

                        <p className="mt-3 max-w-4xl leading-7 text-slate-300">

                            Out of{" "}

                            <strong className="text-white">
                                {
                                    job.dataset_summary
                                        ?.test_samples
                                    ?? 0
                                }
                            </strong>

                            {" "}validation examples,
                            the model correctly classified
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

                            {modelVerdict?.hasConfusion
                                ? (
                                    "Some labels were confused with one another. Check the matrix above to see where those mistakes happened."
                                )
                                : (
                                    "No label mix-ups were detected in this validation run."
                                )}

                            {" "}

                            {job.training_info
                                ?.early_stopped
                                ? (
                                    "Training stopped automatically once validation performance stopped improving."
                                )
                                : (
                                    "Training completed the requested epochs because validation performance continued improving."
                                )}

                        </p>


                        {(
                            job.metrics.accuracy
                            ?? 0
                        ) >= 0.95 && (

                            <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">

                                <p className="text-sm font-semibold text-amber-200">
                                    Important
                                </p>

                                <p className="mt-1 text-sm leading-6 text-amber-100/80">
                                    A near-perfect validation
                                    score is encouraging, but
                                    it does not automatically
                                    mean the model is ready for
                                    production. Test it on
                                    realistic unseen text
                                    before deployment.
                                </p>

                            </div>

                        )}

                    </div>


                    {/* Reset */}

                    <button
                        onClick={
                            handleReset
                        }
                        className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 transition hover:border-purple-500 hover:text-white"
                    >
                        Train Another Model
                    </button>

                </div>

            )}

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

            <p className="mt-2 text-xl font-bold text-white">
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