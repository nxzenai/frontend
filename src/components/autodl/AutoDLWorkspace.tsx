"use client";

import { useState } from "react";

import {
    Cpu,
    UploadCloud,
    FileSpreadsheet,
    CheckCircle2,
    Loader2,
} from "lucide-react";

import useAutoDLJob from "@/hooks/useAutoDLJob";

import { Modality, DLArchitecture } from "@/types/autodl";

export default function AutoDLWorkspace() {

    //////////////////////////////////////////////////////////
    // State
    //////////////////////////////////////////////////////////

    const { job, loading, error, startTraining } =
        useAutoDLJob();

    const [selectedFile, setSelectedFile] =
        useState<File | null>(null);

    const [modality, setModality] =
        useState<Modality>(Modality.IMAGE);

    const [architecture, setArchitecture] =
        useState<DLArchitecture>(DLArchitecture.CNN);

    const [epochs, setEpochs] =
        useState(50);

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

        if (!selectedFile) {

            alert("Please upload a dataset file first.");

            return;

        }

        try {

            await startTraining(
                selectedFile,
                modality,
                architecture,
                epochs,
            );

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
                    AutoDL Studio
                </h1>

                <p className="mt-2 text-slate-400">
                    Train deep learning models on image, audio and time
                    series data with NxZen AI Studio's Enterprise AutoDL Engine.
                </p>

            </div>

            {/* Configuration */}

            <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

                <div className="flex items-center gap-4">

                    <div className="rounded-xl bg-indigo-600/20 p-3">

                        <Cpu size={28} className="text-indigo-400" />

                    </div>

                    <div>

                        <h2 className="text-2xl font-bold text-white">
                            Configure Deep Learning Job
                        </h2>

                        <p className="mt-1 text-slate-400">
                            Choose a data modality and architecture, then
                            dispatch the job to the training queue.
                        </p>

                    </div>

                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">

                    <div>

                        <label className="block text-sm font-medium text-slate-300">
                            Data Modality
                        </label>

                        <select
                            value={modality}
                            onChange={(e) =>
                                setModality(e.target.value as Modality)
                            }
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                        >
                            <option value={Modality.IMAGE}>
                                Image (Spatial)
                            </option>
                            <option value={Modality.AUDIO}>
                                Audio (Spatial)
                            </option>
                            <option value={Modality.TIME_SERIES}>
                                Time Series (Sequential)
                            </option>
                        </select>

                    </div>

                    <div>

                        <label className="block text-sm font-medium text-slate-300">
                            DL Architecture
                        </label>

                        <select
                            value={architecture}
                            onChange={(e) =>
                                setArchitecture(e.target.value as DLArchitecture)
                            }
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                        >
                            <option value={DLArchitecture.CNN}>CNN</option>
                            <option value={DLArchitecture.RNN}>RNN</option>
                        </select>

                    </div>

                </div>

                <div className="mt-6">

                    <label className="block text-sm font-medium text-slate-300">
                        Max Epochs
                    </label>

                    <input
                        type="number"
                        value={epochs}
                        onChange={(e) => setEpochs(Number(e.target.value))}
                        min={1}
                        max={1000}
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white focus:border-indigo-500 focus:outline-none"
                    />

                </div>

                {/* File Upload */}

                <div className="mt-6">

                    <label className="block text-sm font-medium text-slate-300">
                        Upload Dataset File
                    </label>

                    <label
                        className="
                            mt-2
                            flex
                            cursor-pointer
                            flex-col
                            items-center
                            justify-center
                            rounded-2xl
                            border-2
                            border-dashed
                            border-slate-700
                            bg-slate-950
                            p-10
                            transition
                            hover:border-indigo-500
                            hover:bg-slate-800
                        "
                    >

                        <UploadCloud size={40} className="text-indigo-400" />

                        <p className="mt-4 text-sm font-medium text-white">
                            {selectedFile
                                ? selectedFile.name
                                : "Select a file (image, audio, CSV, etc.)"}
                        </p>

                        <input
                            type="file"
                            className="hidden"
                            onChange={(e) =>
                                setSelectedFile(e.target.files?.[0] ?? null)
                            }
                        />

                    </label>

                    {selectedFile && (

                        <div className="mt-4 flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4">

                            <FileSpreadsheet size={20} className="text-green-400" />

                            <span className="flex-1 text-sm text-green-300">
                                {selectedFile.name}
                            </span>

                            <CheckCircle2 size={20} className="text-green-400" />

                        </div>

                    )}

                </div>

                <button
                    onClick={handleTrain}
                    disabled={loading || !selectedFile}
                    className="
                        mt-8
                        w-full
                        rounded-xl
                        bg-indigo-600
                        px-6
                        py-4
                        text-lg
                        font-semibold
                        text-white
                        transition-all
                        duration-200
                        hover:bg-indigo-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    {loading ? "Dispatching to GPU Queue..." : "Dispatch to GPU Queue"}
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

                <div className="flex items-center gap-4 rounded-2xl border border-indigo-500/20 bg-slate-900 p-6">

                    <Loader2 className="animate-spin text-indigo-500" size={30} />

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

                    <div className="mt-6 rounded-xl border-l-4 border-indigo-500 bg-indigo-500/10 p-4">

                        <p className="italic text-slate-300">
                            "{job.metrics.summary}"
                        </p>

                    </div>

                    <div className="mt-6">

                        <div className="flex justify-between text-sm">

                            <span className="font-medium text-slate-300">
                                Accuracy
                            </span>

                            <span className="font-bold text-indigo-400">
                                {toPercent(job.metrics.accuracy)}
                            </span>

                        </div>

                        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">

                            <div
                                className="h-2.5 rounded-full bg-indigo-500 transition-all duration-500"
                                style={{ width: toPercent(job.metrics.accuracy) }}
                            />

                        </div>

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
                                Data Modality
                            </p>

                            <p className="mt-1 text-lg font-bold capitalize text-white">
                                {job.metrics.modality}
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
