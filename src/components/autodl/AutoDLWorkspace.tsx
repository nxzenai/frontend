"use client";

import {
    ChangeEvent,
    useMemo,
    useState,
} from "react";

import {
    CheckCircle2,
    Cpu,
    FileSpreadsheet,
    Loader2,
    UploadCloud,
} from "lucide-react";

import useAutoDLJob from "@/hooks/useAutoDLJob";

import {
    DLArchitecture,
    Modality,
} from "@/types/autodl";


export default function AutoDLWorkspace() {

    ////////////////////////////////////////////////////////////
    // Hook
    ////////////////////////////////////////////////////////////

    const {
        job,
        prediction,
        loading,
        predicting,
        error,
        startTraining,
        predict,
        clearPrediction,
    } = useAutoDLJob();


    ////////////////////////////////////////////////////////////
    // Training State
    ////////////////////////////////////////////////////////////

    const [
        selectedFile,
        setSelectedFile,
    ] =
        useState<File | null>(
            null
        );


    const [
        modality,
        setModality,
    ] =
        useState<Modality>(
            Modality.IMAGE
        );


    const [
        architecture,
        setArchitecture,
    ] =
        useState<DLArchitecture>(
            DLArchitecture.CNN
        );


    const [
        epochs,
        setEpochs,
    ] =
        useState<number>(
            3
        );


    ////////////////////////////////////////////////////////////
    // Prediction State
    ////////////////////////////////////////////////////////////

    const [
        predictionFile,
        setPredictionFile,
    ] =
        useState<File | null>(
            null
        );


    ////////////////////////////////////////////////////////////
    // Helpers
    ////////////////////////////////////////////////////////////

    const toPercent = (
        value?: number | null,
    ) => {

        if (
            value === undefined
            || value === null
        ) {
            return "N/A";
        }

        return `${(
            value
            * 100
        ).toFixed(2)}%`;
    };


    const formatNumber = (
        value?: number | null,
        digits = 4,
    ) => {

        if (
            value === undefined
            || value === null
        ) {
            return "N/A";
        }

        return Number(
            value
        ).toFixed(
            digits
        );
    };


    const confidenceStyles = (
        level?: string | null,
    ) => {

        if (
            level?.toLowerCase()
            === "high"
        ) {
            return (
                "border-green-500/20 "
                + "bg-green-500/10 "
                + "text-green-300"
            );
        }


        if (
            level?.toLowerCase()
            === "medium"
            || level?.toLowerCase()
            === "moderate"
        ) {
            return (
                "border-yellow-500/20 "
                + "bg-yellow-500/10 "
                + "text-yellow-300"
            );
        }


        return (
            "border-red-500/20 "
            + "bg-red-500/10 "
            + "text-red-300"
        );
    };


    const predictionAccept =
        useMemo(
            () => {

                if (
                    job?.architecture
                    === DLArchitecture.CNN
                ) {
                    return (
                        "image/png,"
                        + "image/jpeg,"
                        + "image/webp,"
                        + "image/bmp"
                    );
                }

                if (
                    job?.architecture
                    === DLArchitecture.RNN
                ) {
                    return (
                        ".csv,text/csv"
                    );
                }

                return "";
            },
            [
                job?.architecture,
            ],
        );


    const predictionHint =
        useMemo(
            () => {

                if (
                    job?.architecture
                    === DLArchitecture.CNN
                ) {
                    return (
                        "Upload one PNG, JPG, WEBP or BMP "
                        + "image for inference."
                    );
                }

                if (
                    job?.architecture
                    === DLArchitecture.RNN
                ) {
                    return (
                        "Upload a CSV containing at least "
                        + "the required sequence rows and "
                        + "the same feature columns used "
                        + "during training."
                    );
                }

                return (
                    "Train a model before testing predictions."
                );
            },
            [
                job?.architecture,
            ],
        );


    ////////////////////////////////////////////////////////////
    // Modality
    ////////////////////////////////////////////////////////////

    function handleModalityChange(
        event:
            ChangeEvent<HTMLSelectElement>,
    ) {

        const nextModality = event.target.value as Modality;


        setModality(nextModality);


        setSelectedFile(null);


        setPredictionFile(null);


        clearPrediction();


        if (nextModality=== Modality.IMAGE
        ) {

            setArchitecture(
                DLArchitecture.CNN
            );

            return;
        }


        if (
            nextModality
            === Modality.TIME_SERIES
        ) {

            setArchitecture(
                DLArchitecture.RNN
            );
        }
    }


    ////////////////////////////////////////////////////////////
    // Training File
    ////////////////////////////////////////////////////////////

    function handleTrainingFileChange(
        event:
            ChangeEvent<HTMLInputElement>,
    ) {

        const file =
            event.target
                .files?.[0]
            ?? null;


        setSelectedFile(
            file
        );
    }


    ////////////////////////////////////////////////////////////
    // Prediction File
    ////////////////////////////////////////////////////////////

    function handlePredictionFileChange(
        event:
            ChangeEvent<HTMLInputElement>,
    ) {

        const file =
            event.target
                .files?.[0]
            ?? null;


        setPredictionFile(
            file
        );


        clearPrediction();
    }


    ////////////////////////////////////////////////////////////
    // Train
    ////////////////////////////////////////////////////////////

    async function handleTrain() {

        if (
            !selectedFile
        ) {

            alert(
                "Please upload a dataset first."
            );

            return;
        }


        if (
            !Number.isFinite(
                epochs
            )
            || epochs < 1
            || epochs > 1000
        ) {

            alert(
                "Max epochs must be between 1 and 1000."
            );

            return;
        }


        try {

            setPredictionFile(
                null
            );

            clearPrediction();


            await startTraining(
                selectedFile,
                modality,
                architecture,
                epochs,
            );

        } catch (err) {

            console.error(
                err
            );
        }
    }


    ////////////////////////////////////////////////////////////
    // Predict
    ////////////////////////////////////////////////////////////

    async function handlePredict() {

        if (
            !job?.job_id
        ) {

            alert(
                "Train a model before running prediction."
            );

            return;
        }


        if (
            !predictionFile
        ) {

            alert(
                "Please upload a prediction file."
            );

            return;
        }


        try {

            await predict(
                job.job_id,
                predictionFile,
            );

        } catch (err) {

            console.error(
                err
            );
        }
    }


    ////////////////////////////////////////////////////////////
    // UI
    ////////////////////////////////////////////////////////////

    return (

        <div className="space-y-8">

            {/* ==================================================
                Header
            ================================================== */}

            <div>

                <h1
                    className="
                        text-3xl
                        font-bold
                        tracking-tight
                        text-white
                    "
                >
                    AutoDL Studio
                </h1>


                <p
                    className="
                        mt-2
                        max-w-3xl
                        text-slate-400
                    "
                >
                    Train and test deep learning models
                    using the NxZenAI AutoDL engine.
                    Image datasets use CNN models and
                    time-series datasets use RNN models.
                </p>

            </div>


            {/* ==================================================
                Configuration
            ================================================== */}

            <div
                className="
                    rounded-2xl
                    border
                    border-slate-700
                    bg-slate-900
                    p-6
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-4
                    "
                >

                    <div
                        className="
                            rounded-xl
                            bg-indigo-600/20
                            p-3
                        "
                    >
                        <Cpu
                            size={28}
                            className="text-indigo-400"
                        />
                    </div>


                    <div>

                        <h2
                            className="
                                text-2xl
                                font-bold
                                text-white
                            "
                        >
                            Configure Deep Learning Job
                        </h2>


                        <p
                            className="
                                mt-1
                                text-slate-400
                            "
                        >
                            Select a supported dataset type,
                            upload the training dataset and
                            configure the number of epochs.
                        </p>

                    </div>

                </div>


                {/* Modality / Architecture */}

                <div
                    className="
                        mt-8
                        grid
                        gap-5
                        md:grid-cols-2
                    "
                >

                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-slate-300
                            "
                        >
                            Data Modality
                        </label>


                        <select
                            value={modality}
                            onChange={
                                handleModalityChange
                            }
                            className="
                                mt-2
                                w-full
                                rounded-xl
                                border
                                border-slate-700
                                bg-slate-950
                                px-4
                                py-3
                                text-white
                                focus:border-indigo-500
                                focus:outline-none
                            "
                        >

                            <option
                                value={
                                    Modality.IMAGE
                                }
                            >
                                Image Classification
                            </option>


                            <option
                                value={
                                    Modality.TIME_SERIES
                                }
                            >
                                Time Series Classification
                            </option>

                        </select>

                    </div>


                    <div>

                        <label
                            className="
                                block
                                text-sm
                                font-medium
                                text-slate-300
                            "
                        >
                            DL Architecture
                        </label>


                        <select
                            value={architecture}
                            disabled
                            className="
                                mt-2
                                w-full
                                cursor-not-allowed
                                rounded-xl
                                border
                                border-slate-700
                                bg-slate-950
                                px-4
                                py-3
                                text-white
                                opacity-80
                            "
                        >

                            <option
                                value={
                                    DLArchitecture.CNN
                                }
                            >
                                CNN
                            </option>


                            <option
                                value={
                                    DLArchitecture.RNN
                                }
                            >
                                RNN
                            </option>

                        </select>


                        <p
                            className="
                                mt-2
                                text-xs
                                text-slate-500
                            "
                        >
                            Architecture is selected
                            automatically for the chosen
                            modality.
                        </p>

                    </div>

                </div>


                {/* Epochs */}

                <div className="mt-6">

                    <label
                        className="
                            block
                            text-sm
                            font-medium
                            text-slate-300
                        "
                    >
                        Max Epochs
                    </label>


                    <input
                        type="number"
                        value={epochs}
                        onChange={
                            (
                                event,
                            ) =>
                                setEpochs(
                                    Number(
                                        event
                                            .target
                                            .value
                                    )
                                )
                        }
                        min={1}
                        max={1000}
                        className="
                            mt-2
                            w-full
                            rounded-xl
                            border
                            border-slate-700
                            bg-slate-950
                            px-4
                            py-3
                            text-white
                            focus:border-indigo-500
                            focus:outline-none
                        "
                    />

                </div>


                {/* Training Dataset */}

                <div className="mt-6">

                    <label
                        className="
                            block
                            text-sm
                            font-medium
                            text-slate-300
                        "
                    >
                        Training Dataset
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

                        <UploadCloud
                            size={40}
                            className="text-indigo-400"
                        />


                        <p
                            className="
                                mt-4
                                text-sm
                                font-medium
                                text-white
                            "
                        >

                            {
                                selectedFile
                                    ? selectedFile.name
                                    : modality
                                        === Modality.IMAGE
                                        ? "Select image classification ZIP"
                                        : "Select time-series CSV"
                            }

                        </p>


                        <p
                            className="
                                mt-2
                                text-xs
                                text-slate-500
                            "
                        >

                            {
                                modality
                                    === Modality.IMAGE
                                    ? (
                                        "ZIP containing one "
                                        + "folder per class."
                                    )
                                    : (
                                        "CSV with numeric "
                                        + "features and target "
                                        + "column as the final column."
                                    )
                            }

                        </p>


                        <input
                            type="file"
                            accept={
                                modality
                                    === Modality.IMAGE
                                    ? ".zip,application/zip"
                                    : ".csv,text/csv"
                            }
                            className="hidden"
                            onChange={
                                handleTrainingFileChange
                            }
                        />

                    </label>


                    {
                        selectedFile
                        && (

                            <div
                                className="
                                    mt-4
                                    flex
                                    items-center
                                    gap-3
                                    rounded-xl
                                    border
                                    border-green-500/20
                                    bg-green-500/10
                                    p-4
                                "
                            >

                                <FileSpreadsheet
                                    size={20}
                                    className="text-green-400"
                                />


                                <span
                                    className="
                                        flex-1
                                        text-sm
                                        text-green-300
                                    "
                                >
                                    {selectedFile.name}
                                </span>


                                <CheckCircle2
                                    size={20}
                                    className="text-green-400"
                                />

                            </div>

                        )
                    }

                </div>


                {/* Train Button */}

                <button
                    onClick={
                        handleTrain
                    }
                    disabled={
                        loading
                        || !selectedFile
                    }
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
                        transition
                        hover:bg-indigo-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >

                    {
                        loading
                            ? (
                                <span
                                    className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-3
                                    "
                                >
                                    <Loader2
                                        size={20}
                                        className="animate-spin"
                                    />

                                    Training Model...
                                </span>
                            )
                            : (
                                `Train ${
                                    architecture
                                        .toUpperCase()
                                } Model`
                            )
                    }

                </button>

            </div>


            {/* ==================================================
                Error
            ================================================== */}

            {
                error
                && (

                    <div
                        className="
                            rounded-xl
                            border
                            border-red-500/20
                            bg-red-500/10
                            p-5
                        "
                    >

                        <h3
                            className="
                                font-semibold
                                text-red-400
                            "
                        >
                            AutoDL Error
                        </h3>


                        <p
                            className="
                                mt-2
                                text-red-300
                            "
                        >
                            {error}
                        </p>

                    </div>

                )
            }


            {/* ==================================================
                Loading
            ================================================== */}

            {
                loading
                && (

                    <div
                        className="
                            flex
                            items-center
                            gap-4
                            rounded-2xl
                            border
                            border-indigo-500/20
                            bg-slate-900
                            p-6
                        "
                    >

                        <Loader2
                            className="
                                animate-spin
                                text-indigo-500
                            "
                            size={30}
                        />


                        <div>

                            <p
                                className="
                                    font-medium
                                    text-white
                                "
                            >
                                Training AutoDL model
                            </p>


                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-slate-400
                                "
                            >
                                The backend is processing
                                the dataset and training the
                                selected neural network.
                            </p>

                        </div>

                    </div>

                )
            }


            {/* ==================================================
                Training Results
            ================================================== */}

            {
                job?.metrics
                && (

                    <div
                        className="
                            space-y-6
                            rounded-2xl
                            border
                            border-slate-700
                            bg-slate-900
                            p-6
                        "
                    >

                        {/* Header */}

                        <div
                            className="
                                flex
                                flex-wrap
                                items-center
                                justify-between
                                gap-4
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-xl
                                        font-bold
                                        text-white
                                    "
                                >
                                    Training Results
                                </h2>


                                <p
                                    className="
                                        mt-1
                                        text-sm
                                        text-slate-400
                                    "
                                >
                                    Job ID: {job.job_id}
                                </p>

                            </div>


                            <span
                                className={`
                                    rounded-full
                                    border
                                    px-3
                                    py-1
                                    text-sm
                                    font-bold
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
                                } Confidence

                            </span>

                        </div>


                        {/* Summary */}

                        {
                            job.metrics.summary
                            && (

                                <div
                                    className="
                                        rounded-xl
                                        border-l-4
                                        border-indigo-500
                                        bg-indigo-500/10
                                        p-4
                                    "
                                >

                                    <p
                                        className="
                                            text-slate-300
                                        "
                                    >
                                        {
                                            job.metrics
                                                .summary
                                        }
                                    </p>

                                </div>

                            )
                        }


                        {/* Main Metrics */}

                        <div
                            className="
                                grid
                                gap-4
                                md:grid-cols-2
                                xl:grid-cols-4
                            "
                        >

                            <MetricCard
                                label="Accuracy"
                                value={
                                    toPercent(
                                        job.metrics
                                            .accuracy
                                    )
                                }
                            />


                            <MetricCard
                                label="Final Loss"
                                value={
                                    formatNumber(
                                        job.metrics
                                            .final_loss
                                    )
                                }
                            />


                            <MetricCard
                                label="Architecture"
                                value={
                                    (
                                        job.metrics
                                            .architecture
                                        ?? job.architecture
                                    ).toUpperCase()
                                }
                            />


                            <MetricCard
                                label="Modality"
                                value={
                                    job.modality
                                        .replace(
                                            "_",
                                            " "
                                        )
                                }
                            />

                        </div>


                        {/* Dataset Summary */}

                        {
                            job.dataset_summary
                            && (

                                <div
                                    className="
                                        border-t
                                        border-slate-700
                                        pt-6
                                    "
                                >

                                    <h3
                                        className="
                                            text-lg
                                            font-semibold
                                            text-white
                                        "
                                    >
                                        Dataset Summary
                                    </h3>


                                    <div
                                        className="
                                            mt-4
                                            grid
                                            gap-4
                                            sm:grid-cols-2
                                            lg:grid-cols-4
                                        "
                                    >

                                        <MetricCard
                                            label="Samples"
                                            value={
                                                String(
                                                    job
                                                        .dataset_summary
                                                        .total_samples
                                                    ?? "N/A"
                                                )
                                            }
                                        />


                                        <MetricCard
                                            label="Training"
                                            value={
                                                String(
                                                    job
                                                        .dataset_summary
                                                        .training_samples
                                                    ?? "N/A"
                                                )
                                            }
                                        />


                                        <MetricCard
                                            label="Validation"
                                            value={
                                                String(
                                                    job
                                                        .dataset_summary
                                                        .validation_samples
                                                    ?? "N/A"
                                                )
                                            }
                                        />


                                        <MetricCard
                                            label="Classes"
                                            value={
                                                String(
                                                    job
                                                        .dataset_summary
                                                        .class_count
                                                    ?? "N/A"
                                                )
                                            }
                                        />

                                    </div>


                                    {
                                        (
                                            job.dataset_summary
                                                .classes
                                            ?.length
                                            ?? 0
                                        ) > 0
                                        && (

                                            <div className="mt-5">

                                                <p
                                                    className="
                                                        text-xs
                                                        font-semibold
                                                        uppercase
                                                        tracking-wide
                                                        text-slate-500
                                                    "
                                                >
                                                    Class Labels
                                                </p>


                                                <div
                                                    className="
                                                        mt-2
                                                        flex
                                                        flex-wrap
                                                        gap-2
                                                    "
                                                >

                                                    {
                                                        job
                                                            .dataset_summary
                                                            ?.classes
                                                            ?.map(
                                                                (
                                                                    label,
                                                                ) => (

                                                                    <span
                                                                        key={
                                                                            label
                                                                        }
                                                                        className="
                                                                            rounded-full
                                                                            border
                                                                            border-slate-700
                                                                            bg-slate-950
                                                                            px-3
                                                                            py-1
                                                                            text-sm
                                                                            text-slate-300
                                                                        "
                                                                    >
                                                                        {
                                                                            label
                                                                        }
                                                                    </span>

                                                                )
                                                            )
                                                    }

                                                </div>

                                            </div>

                                        )
                                    }

                                </div>

                            )
                        }


                        {/* Training Information */}

                        {
                            job.training_info
                            && (

                                <div
                                    className="
                                        border-t
                                        border-slate-700
                                        pt-6
                                    "
                                >

                                    <h3
                                        className="
                                            text-lg
                                            font-semibold
                                            text-white
                                        "
                                    >
                                        Training Information
                                    </h3>


                                    <div
                                        className="
                                            mt-4
                                            grid
                                            gap-4
                                            sm:grid-cols-2
                                            lg:grid-cols-4
                                        "
                                    >

                                        <MetricCard
                                            label="Epochs Trained"
                                            value={
                                                `${
                                                    job
                                                        .training_info
                                                        .epochs_trained
                                                    ?? "N/A"
                                                } / ${
                                                    job
                                                        .training_info
                                                        .epochs_requested
                                                    ?? "N/A"
                                                }`
                                            }
                                        />


                                        <MetricCard
                                            label="Best Epoch"
                                            value={
                                                String(
                                                    job
                                                        .training_info
                                                        .best_epoch
                                                    ?? "N/A"
                                                )
                                            }
                                        />


                                        <MetricCard
                                            label="Training Time"
                                            value={
                                                job
                                                    .training_info
                                                    .training_time
                                                !== undefined
                                                ? `${
                                                    formatNumber(
                                                        job
                                                            .training_info
                                                            .training_time,
                                                        2,
                                                    )
                                                } sec`
                                                : "N/A"
                                            }
                                        />


                                        <MetricCard
                                            label="Early Stopped"
                                            value={
                                                job
                                                    .training_info
                                                    .early_stopped
                                                    ? "Yes"
                                                    : "No"
                                            }
                                        />

                                    </div>

                                </div>

                            )
                        }


                        {/* Artifact */}

                        {
                            job.artifact
                            && (

                                <div
                                    className="
                                        border-t
                                        border-slate-700
                                        pt-6
                                    "
                                >

                                    <h3
                                        className="
                                            text-lg
                                            font-semibold
                                            text-white
                                        "
                                    >
                                        Saved Model Artifact
                                    </h3>


                                    <div
                                        className="
                                            mt-4
                                            rounded-xl
                                            border
                                            border-green-500/20
                                            bg-green-500/10
                                            p-5
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-start
                                                gap-3
                                            "
                                        >

                                            <CheckCircle2
                                                size={22}
                                                className="
                                                    mt-0.5
                                                    shrink-0
                                                    text-green-400
                                                "
                                            />


                                            <div
                                                className="
                                                    min-w-0
                                                    flex-1
                                                "
                                            >

                                                <p
                                                    className="
                                                        font-semibold
                                                        text-green-300
                                                    "
                                                >
                                                    {
                                                        job
                                                            .artifact
                                                            .model_name
                                                        ?? job
                                                            .architecture
                                                            .toUpperCase()
                                                    } artifact ready
                                                </p>


                                                <p
                                                    className="
                                                        mt-1
                                                        break-all
                                                        text-sm
                                                        text-green-200/70
                                                    "
                                                >
                                                    {
                                                        job
                                                            .artifact
                                                            .artifact_path
                                                        ?? "Artifact path unavailable"
                                                    }
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            )
                        }

                    </div>

                )
            }


            {/* ==================================================
                Test Trained Model
            ================================================== */}

            {
                job?.status === "completed"
                && job.artifact
                && (

                    <div
                        className="
                            rounded-2xl
                            border
                            border-slate-700
                            bg-slate-900
                            p-6
                        "
                    >

                        <div>

                            <h2
                                className="
                                    text-xl
                                    font-bold
                                    text-white
                                "
                            >
                                Test Trained Model
                            </h2>


                            <p
                                className="
                                    mt-2
                                    text-sm
                                    text-slate-400
                                "
                            >
                                {predictionHint}
                            </p>

                        </div>


                        {/* Prediction Upload */}

                        <label
                            className="
                                mt-6
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
                                p-8
                                transition
                                hover:border-indigo-500
                                hover:bg-slate-800
                            "
                        >

                            <UploadCloud
                                size={34}
                                className="text-indigo-400"
                            />


                            <p
                                className="
                                    mt-3
                                    text-sm
                                    font-medium
                                    text-white
                                "
                            >

                                {
                                    predictionFile
                                        ? predictionFile.name
                                        : job.architecture
                                            === DLArchitecture.CNN
                                            ? "Select one image"
                                            : "Select prediction CSV"
                                }

                            </p>


                            <input
                                type="file"
                                accept={
                                    predictionAccept
                                }
                                className="hidden"
                                onChange={
                                    handlePredictionFileChange
                                }
                            />

                        </label>


                        {
                            predictionFile
                            && (

                                <div
                                    className="
                                        mt-4
                                        flex
                                        items-center
                                        gap-3
                                        rounded-xl
                                        border
                                        border-indigo-500/20
                                        bg-indigo-500/10
                                        p-4
                                    "
                                >

                                    <FileSpreadsheet
                                        size={20}
                                        className="text-indigo-400"
                                    />


                                    <span
                                        className="
                                            flex-1
                                            text-sm
                                            text-indigo-200
                                        "
                                    >
                                        {predictionFile.name}
                                    </span>

                                </div>

                            )
                        }


                        <button
                            onClick={
                                handlePredict
                            }
                            disabled={
                                predicting
                                || !predictionFile
                            }
                            className="
                                mt-5
                                w-full
                                rounded-xl
                                bg-indigo-600
                                px-6
                                py-3
                                font-semibold
                                text-white
                                transition
                                hover:bg-indigo-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            {
                                predicting
                                    ? (
                                        <span
                                            className="
                                                flex
                                                items-center
                                                justify-center
                                                gap-3
                                            "
                                        >

                                            <Loader2
                                                size={19}
                                                className="animate-spin"
                                            />

                                            Running Prediction...

                                        </span>
                                    )
                                    : "Run Prediction"
                            }

                        </button>


                        {/* Prediction Result */}

                        {
                            prediction
                            && (

                                <div
                                    className="
                                        mt-6
                                        border-t
                                        border-slate-700
                                        pt-6
                                    "
                                >

                                    <div
                                        className="
                                            grid
                                            gap-4
                                            md:grid-cols-2
                                        "
                                    >

                                        <MetricCard
                                            label="Predicted Class"
                                            value={
                                                prediction
                                                    .predicted_label
                                            }
                                        />


                                        <MetricCard
                                            label="Confidence"
                                            value={
                                                toPercent(
                                                    prediction
                                                        .confidence
                                                )
                                            }
                                        />

                                    </div>


                                    <div className="mt-6">

                                        <h3
                                            className="
                                                text-sm
                                                font-semibold
                                                uppercase
                                                tracking-wide
                                                text-slate-400
                                            "
                                        >
                                            Class Probabilities
                                        </h3>


                                        <div
                                            className="
                                                mt-4
                                                space-y-3
                                            "
                                        >

                                            {
                                                prediction
                                                    .probabilities
                                                    .map(
                                                        (
                                                            item,
                                                        ) => (

                                                            <div
                                                                key={
                                                                    item
                                                                        .label
                                                                }
                                                                className="
                                                                    rounded-xl
                                                                    border
                                                                    border-slate-700
                                                                    bg-slate-950
                                                                    p-4
                                                                "
                                                            >

                                                                <div
                                                                    className="
                                                                        flex
                                                                        items-center
                                                                        justify-between
                                                                        gap-4
                                                                    "
                                                                >

                                                                    <span
                                                                        className="
                                                                            font-medium
                                                                            text-slate-300
                                                                        "
                                                                    >
                                                                        {
                                                                            item
                                                                                .label
                                                                        }
                                                                    </span>


                                                                    <span
                                                                        className="
                                                                            font-bold
                                                                            text-indigo-400
                                                                        "
                                                                    >
                                                                        {
                                                                            toPercent(
                                                                                item
                                                                                    .probability
                                                                            )
                                                                        }
                                                                    </span>

                                                                </div>


                                                                <div
                                                                    className="
                                                                        mt-3
                                                                        h-2
                                                                        overflow-hidden
                                                                        rounded-full
                                                                        bg-slate-800
                                                                    "
                                                                >

                                                                    <div
                                                                        className="
                                                                            h-full
                                                                            rounded-full
                                                                            bg-indigo-500
                                                                            transition-all
                                                                        "
                                                                        style={{
                                                                            width:
                                                                                `${
                                                                                    Math.max(
                                                                                        0,
                                                                                        Math.min(
                                                                                            100,
                                                                                            item
                                                                                                .probability
                                                                                            * 100,
                                                                                        ),
                                                                                    )
                                                                                }%`,
                                                                        }}
                                                                    />

                                                                </div>

                                                            </div>

                                                        )
                                                    )
                                            }

                                        </div>

                                    </div>

                                </div>

                            )
                        }

                    </div>

                )
            }

        </div>
    );
}


////////////////////////////////////////////////////////////
// Metric Card
////////////////////////////////////////////////////////////


function MetricCard(
    {
        label,
        value,
    }: {
        label: string;
        value: string;
    },
) {

    return (

        <div
            className="
                rounded-xl
                border
                border-slate-700
                bg-slate-950
                p-4
            "
        >

            <p
                className="
                    text-xs
                    font-semibold
                    uppercase
                    tracking-wide
                    text-slate-500
                "
            >
                {label}
            </p>


            <p
                className="
                    mt-2
                    break-words
                    text-lg
                    font-bold
                    capitalize
                    text-white
                "
            >
                {value}
            </p>

        </div>
    );
}