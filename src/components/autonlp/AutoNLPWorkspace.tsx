"use client";

import { useState } from "react";

import { Languages, Loader2 } from "lucide-react";

import useAutoNLPJob from "@/hooks/useAutoNLPJob";

import { NLPTask, NLPArchitecture } from "@/types/autonlp";

export default function AutoNLPWorkspace() {

    //////////////////////////////////////////////////////////
    // State
    //////////////////////////////////////////////////////////

    const { job, loading, error, startTraining } =
        useAutoNLPJob();

    const [task, setTask] =
        useState<NLPTask>(NLPTask.TEXT_CLASSIFICATION);

    const [architecture, setArchitecture] =
        useState<NLPArchitecture>(NLPArchitecture.LSTM);

    const [textInput, setTextInput] = useState(
        "Artificial intelligence is transforming how we interact with technology every day."
    );

    //////////////////////////////////////////////////////////
    // Helpers
    //////////////////////////////////////////////////////////

    const toPercent = (val?: number) =>
        val ? `${Math.round(val * 100)}%` : "0%";

    const confidenceStyles = (level?: string) => {

        if (level === "High")
            return "border-green-500/20 bg-green-500/10 text-green-300";

        if (level === "Medium")
            return "border-yellow-500/20 bg-yellow-500/10 text-yellow-300";

        return "border-red-500/20 bg-red-500/10 text-red-300";

    };

    //////////////////////////////////////////////////////////
    // Train
    //////////////////////////////////////////////////////////

    async function handleTrain() {

        try {

            await startTraining({
                dataset_id: "ds_12345",
                text_column: textInput,
                target_column: "sentiment_label",
                task,
                architecture,
                max_epochs: 30,
            });

        } catch (err) {

            console.error(err);

        }

    }

    //////////////////////////////////////////////////////////
    // UI
    //////////////////////////////////////////////////////////

    return (

        <div className="space-y-8">

            {/* Page Header */}

            <div>

                <h1 className="text-3xl font-bold tracking-tight text-white">
                    AutoNLP Studio
                </h1>

                <p className="mt-2 text-slate-400">
                    Train text classification and NER models with NxZen AI
                    Studio's Enterprise AutoNLP Engine.
                </p>

            </div>

            {/* Configuration */}

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

                <div className="flex items-center gap-4">

                    <div className="rounded-xl bg-purple-600/20 p-3">

                        <Languages size={28} className="text-purple-400" />

                    </div>

                    <div>

                        <h2 className="text-2xl font-bold text-white">
                            Configure NLP Job
                        </h2>

                        <p className="mt-1 text-slate-400">
                            Select a task and architecture, then provide sample
                            text to train against.
                        </p>

                    </div>

                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">

                    <div>

                        <label className="block text-sm font-medium text-slate-300">
                            NLP Task
                        </label>

                        <select
                            value={task}
                            onChange={(e) =>
                                setTask(e.target.value as NLPTask)
                            }
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        >
                            <option value={NLPTask.TEXT_CLASSIFICATION}>
                                Text Classification
                            </option>
                            <option value={NLPTask.NAMED_ENTITY_RECOGNITION}>
                                Named Entity Recognition
                            </option>
                        </select>

                    </div>

                    <div>

                        <label className="block text-sm font-medium text-slate-300">
                            Architecture
                        </label>

                        <select
                            value={architecture}
                            onChange={(e) =>
                                setArchitecture(e.target.value as NLPArchitecture)
                            }
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                        >
                            <option value={NLPArchitecture.LSTM}>LSTM</option>
                            <option value={NLPArchitecture.RNN}>RNN</option>
                        </select>

                    </div>

                </div>

                <div className="mt-6">

                    <label className="block text-sm font-medium text-slate-300">
                        Input Text for Model
                    </label>

                    <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        rows={4}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    />

                </div>

                <button
                    onClick={handleTrain}
                    disabled={loading || !textInput.trim()}
                    className="
                        mt-8
                        w-full
                        rounded-xl
                        bg-purple-600
                        px-6
                        py-4
                        text-lg
                        font-semibold
                        text-white
                        transition-all
                        duration-200
                        hover:bg-purple-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    {loading ? "Training NLP Model..." : "Train NLP Model"}
                </button>

            </div>

            {/* Error */}

            {error && (

                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">

                    <h3 className="font-semibold text-red-400">Error</h3>

                    <p className="mt-2 text-red-300">{error}</p>

                </div>

            )}

            {/* Loading */}

            {loading && (

                <div className="flex items-center gap-4 rounded-2xl border border-purple-500/20 bg-slate-900 p-6">

                    <Loader2 className="animate-spin text-purple-500" size={30} />

                    <p className="text-slate-300">
                        Training job dispatched, waiting for results...
                    </p>

                </div>

            )}

            {/* Results */}

            {job?.metrics && (

                <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

                    <div className="flex items-center justify-between">

                        <h2 className="text-xl font-bold text-white">
                            Training Results
                        </h2>

                        <span
                            className={`rounded-full border px-3 py-1 text-sm font-bold ${confidenceStyles(
                                job.metrics.confidence_level
                            )}`}
                        >
                            {job.metrics.confidence_level ?? "N/A"} Confidence
                        </span>

                    </div>

                    <div className="mt-6 rounded-xl border-l-4 border-purple-500 bg-purple-500/10 p-4">

                        <p className="italic text-slate-300">
                            "{job.metrics.summary}"
                        </p>

                    </div>

                    <div className="mt-6 space-y-5">

                        <MetricBar
                            label="Accuracy"
                            value={job.metrics.accuracy}
                            colorClass="bg-purple-500"
                            valueClass="text-purple-400"
                            toPercent={toPercent}
                        />

                        <MetricBar
                            label="Precision"
                            value={job.metrics.precision}
                            colorClass="bg-indigo-500"
                            valueClass="text-indigo-400"
                            toPercent={toPercent}
                        />

                        <MetricBar
                            label="Recall"
                            value={job.metrics.recall}
                            colorClass="bg-blue-500"
                            valueClass="text-blue-400"
                            toPercent={toPercent}
                        />

                    </div>

                    <div className="mt-8 grid grid-cols-3 gap-4 border-t border-slate-700 pt-6 text-center">

                        <div>

                            <p className="text-xs uppercase text-slate-500">
                                Architecture
                            </p>

                            <p className="mt-1 text-lg font-bold text-white">
                                {job.metrics.architecture}
                            </p>

                        </div>

                        <div>

                            <p className="text-xs uppercase text-slate-500">
                                Tokens Processed
                            </p>

                            <p className="mt-1 text-lg font-bold text-white">
                                {job.metrics.input_tokens}
                            </p>

                        </div>

                        <div>

                            <p className="text-xs uppercase text-slate-500">
                                Final Loss
                            </p>

                            <p className="mt-1 text-lg font-bold text-red-400">
                                {job.metrics.final_loss}
                            </p>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}

////////////////////////////////////////////////////////////
// Metric Bar
////////////////////////////////////////////////////////////

interface MetricBarProps {

    label: string;

    value?: number;

    colorClass: string;

    valueClass: string;

    toPercent: (val?: number) => string;

}

function MetricBar({
    label,
    value,
    colorClass,
    valueClass,
    toPercent,
}: MetricBarProps) {

    return (

        <div>

            <div className="flex justify-between text-sm">

                <span className="font-medium text-slate-300">{label}</span>

                <span className={`font-bold ${valueClass}`}>
                    {toPercent(value)}
                </span>

            </div>

            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">

                <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`}
                    style={{ width: toPercent(value) }}
                />

            </div>

        </div>

    );

}
