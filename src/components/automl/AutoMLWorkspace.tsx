"use client";

import { useState } from "react";

import useAutoML from "@/hooks/useAutoML";

import DatasetUploader from "./DatasetUploader";
import TaskSelector from "./TaskSelector";
import TrainingConfig from "./TrainingConfig";
import TrainingProgress from "./TrainingProgress";
import Leaderboard from "./Leaderboard";
import BestModelCard from "./BestModelCard";

import type { AutoMLTask } from "@/types/automl";

export default function AutoMLWorkspace() {

  const {

    loading,

    error,

    result,

    datasetInfo,

    datasetColumns,

    leaderboard,

    bestModel,

    summary,

    statistics,

    recommendations,

    loadDatasetColumns,

    loadCompleteResponse,

  } = useAutoML();

  ////////////////////////////////////////////////////////

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [task, setTask] =
    useState<AutoMLTask>("auto");

  const [targetColumn, setTargetColumn] =
    useState("");

  const [randomState, setRandomState] =
    useState(42);

  const [testSize, setTestSize] =
    useState(0.2);

  const [rankingMetric, setRankingMetric] =
    useState("");

  ////////////////////////////////////////////////////////
  // Upload Dataset
  ////////////////////////////////////////////////////////

  async function handleUpload() {

  if (!selectedFile) {
    alert("Please select a dataset.");
    return;
  }

  try {

    const columns = await loadDatasetColumns(selectedFile);

    console.log("Loaded Columns:", columns);

    if (columns.includes("Survived")) {
      setTargetColumn("Survived");
      console.log("Target auto-selected: Survived");
    }

    alert("Dataset uploaded successfully.");

  } catch (err) {

    console.error(err);
    alert("Failed to read dataset.");

  }

}
  ////////////////////////////////////////////////////////
  // Train AutoML
  ////////////////////////////////////////////////////////
console.log("Selected Target:", targetColumn);
console.log("Available Columns:", datasetColumns);
  async function handleTraining() {

    if (!selectedFile) {

      alert("Please upload a dataset.");

      return;

    }

    if (!targetColumn) {

      alert("Please select the target column.");

      return;

    }
    console.log("targetColumn =", targetColumn);

    try {

      await loadCompleteResponse(

        selectedFile,

        targetColumn,

      );

    }

    catch (err) {

      console.error(err);

    }

  }
    ////////////////////////////////////////////////////////
  // UI
  ////////////////////////////////////////////////////////

  return (

  <div className="space-y-8">

    {/* Page Header */}

    <div>

      <h1 className="text-3xl font-bold tracking-tight text-white">

        AutoML Studio

      </h1>

      <p className="mt-2 text-slate-400">

        Train, evaluate and compare Machine Learning models using
        NxZen AI Studio's Enterprise AutoML Engine.

      </p>

    </div>

    {/* Upload */}

    <DatasetUploader
      selectedFile={selectedFile}
      onFileChange={setSelectedFile}
      onUpload={handleUpload}
      loading={loading}
    />

      {/* Task */}

      <TaskSelector
        value={task}
        onChange={setTask}
      />

      {/* Config */}

      <TrainingConfig
        targetColumn={targetColumn}
        setTargetColumn={setTargetColumn}
        availableColumns={datasetColumns}
        randomState={randomState}
        setRandomState={setRandomState}
        testSize={testSize}
        setTestSize={setTestSize}
        rankingMetric={rankingMetric}
        setRankingMetric={setRankingMetric}
      />

      {/* Train */}

      <div className="flex justify-end">

        <button
          onClick={handleTraining}
          disabled={
            loading ||
            !selectedFile ||
            !targetColumn
          }
          className="
            rounded-xl
            bg-blue-600
            px-8
            py-3
            font-semibold
            text-white
            hover:bg-blue-700
            disabled:opacity-50
          "
        >

          {loading
            ? "Training..."
            : "Start AutoML"}

        </button>

      </div>

      {/* Error */}

      {error && (

        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5">

          <h3 className="font-semibold text-red-400">

            Error

          </h3>

          <p className="mt-2 text-red-300">

            {error}

          </p>

        </div>

      )}

      {/* Progress */}

      <TrainingProgress
        loading={loading}
      />

      {/* Best Model */}

      {bestModel && (

        <BestModelCard
          model={bestModel}
        />

      )}

      {/* Leaderboard */}

      {leaderboard.length > 0 && (

        <Leaderboard
          leaderboard={leaderboard}
        />

      )}

      {/* Dataset Summary */}

      {datasetInfo && (

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

          <h2 className="mb-6 text-2xl font-bold text-white">

            Dataset Summary

          </h2>

          <pre className="overflow-auto rounded-xl bg-slate-950 p-5 text-sm text-green-300">

            {JSON.stringify(
              datasetInfo,
              null,
              2
            )}

          </pre>

        </div>

      )}

      {/* Executive Summary */}

      {summary && (

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

          <h2 className="mb-6 text-2xl font-bold text-white">

            Executive Summary

          </h2>

          <pre className="overflow-auto rounded-xl bg-slate-950 p-5 text-sm text-blue-300">

            {JSON.stringify(
              summary,
              null,
              2
            )}

          </pre>

        </div>

      )}

      {/* Statistics */}

      {statistics && (

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

          <h2 className="mb-6 text-2xl font-bold text-white">

            Training Statistics

          </h2>

          <pre className="overflow-auto rounded-xl bg-slate-950 p-5 text-sm text-cyan-300">

            {JSON.stringify(
              statistics,
              null,
              2
            )}

          </pre>

        </div>

      )}

      {/* Recommendations */}

      {recommendations && (

        <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

          <h2 className="mb-6 text-2xl font-bold text-white">

            Recommendations

          </h2>

          <ul className="space-y-3">

            {recommendations.map?.(

              (
                item: string,
                index: number,
              ) => (

                <li
                  key={index}
                  className="rounded-lg bg-slate-950 p-4 text-slate-300"
                >

                  • {item}

                </li>

              ),

            )}

          </ul>

        </div>

      )}

      {/* Raw Response */}

      {result && (

        <details className="rounded-2xl border border-slate-700 bg-slate-900 p-6">

          <summary className="cursor-pointer text-lg font-semibold text-white">

            Complete AutoML Response

          </summary>

          <pre className="mt-6 overflow-auto rounded-xl bg-slate-950 p-5 text-sm text-green-300">

            {JSON.stringify(
              result,
              null,
              2
            )}

          </pre>

        </details>

      )}

    </div>

  );

}