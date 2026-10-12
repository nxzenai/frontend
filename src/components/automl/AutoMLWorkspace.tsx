"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import useAutoML from "@/hooks/useAutoML";
import BestModelPrediction from "@/components/automl/BestModelPrediction";
import AutoMLResults from "@/components/automl/AutoMLResults";
import { getAutoMLInfo } from "@/services/automl.service";

import type {
  AutoMLResult,
  AutoMLTask,
  AutoMLOptimizationMetric,
  ClusterCountMode,
  ClusteringLimits,
} from "@/types/automl";

/* ============================================================
   TASKS
============================================================ */

type SelectableAutoMLTask = Extract<
  AutoMLTask,
  "classification" | "regression" | "clustering"
>;

function normalizeSelectableTask(
  task: AutoMLTask
): SelectableAutoMLTask {
  if (
    task === "regression" ||
    task === "clustering"
  ) {
    return task;
  }

  return "classification";
}

const TASKS: {
  value: SelectableAutoMLTask;
  label: string;
  description: string;
  disabled?: boolean;
}[] = [
  {
    value: "classification",
    label: "Classification",
    description:
      "Predict a category or class.",
  },
  {
    value: "regression",
    label: "Regression",
    description:
      "Predict a continuous numeric value.",
  },
  {
    value: "clustering",
    label: "Clustering",
    description:
      "Discover groups without a target.",
  },
];

/* ============================================================
   METRICS
============================================================ */

const CLASSIFICATION_METRICS: {
  value: AutoMLOptimizationMetric;
  label: string;
  description: string;
}[] = [
  {
    value: "f1_score",
    label: "F1 Score",
    description:
      "Balanced precision and recall.",
  },
  {
    value: "accuracy",
    label: "Accuracy",
    description:
      "Overall percentage of correct predictions.",
  },
  {
    value: "precision",
    label: "Precision",
    description:
      "How many predicted positives were correct.",
  },
  {
    value: "recall",
    label: "Recall",
    description:
      "How many actual positives were detected.",
  },
  {
    value: "roc_auc",
    label: "ROC-AUC",
    description:
      "Ranking quality across classification thresholds.",
  },
];

const REGRESSION_METRICS: {
  value: AutoMLOptimizationMetric;
  label: string;
  description: string;
}[] = [
  {
    value: "r2_score",
    label: "R² Score",
    description:
      "Explained variance. Higher is better.",
  },
  {
    value: "mae",
    label: "MAE",
    description:
      "Mean absolute error. Lower is better.",
  },
  {
    value: "mse",
    label: "MSE",
    description:
      "Mean squared error. Lower is better.",
  },
  {
    value: "rmse",
    label: "RMSE",
    description:
      "Root mean squared error. Lower is better.",
  },
  {
    value: "mape",
    label: "MAPE",
    description:
      "Mean absolute percentage error. Lower is better.",
  },
];

const CLUSTERING_METRICS: {
  value: AutoMLOptimizationMetric;
  label: string;
  description: string;
}[] = [
  {
    value: "silhouette_score",
    label: "Silhouette Score",
    description:
      "Cluster separation and cohesion. Higher is better.",
  },
  {
    value:
      "calinski_harabasz_score",
    label: "Calinski-Harabasz",
    description:
      "Between-cluster vs within-cluster dispersion. Higher is better.",
  },
  {
    value:
      "davies_bouldin_score",
    label: "Davies-Bouldin",
    description:
      "Cluster similarity. Lower is better.",
  },
];

/* ============================================================
   DEFAULT METRIC
============================================================ */

function defaultMetricForTask(
  task: AutoMLTask
): AutoMLOptimizationMetric {
  if (
    task ===
    "regression"
  ) {
    return "r2_score";
  }

  if (
    task ===
    "clustering"
  ) {
    return "silhouette_score";
  }

  return "f1_score";
}

/* ============================================================
   METRIC OPTIONS
============================================================ */

function metricsForTask(
  task: AutoMLTask
) {
  if (
    task ===
    "regression"
  ) {
    return REGRESSION_METRICS;
  }

  if (
    task ===
    "clustering"
  ) {
    return CLUSTERING_METRICS;
  }

  return CLASSIFICATION_METRICS;
}

/* ============================================================
   METRIC LABEL
============================================================ */

function metricLabel(
  metric?: string
): string {
  const all = [
    ...CLASSIFICATION_METRICS,
    ...REGRESSION_METRICS,
    ...CLUSTERING_METRICS,
  ];

  return (
    all.find(
      (item) =>
        item.value ===
        metric
    )?.label ??
    "Primary Metric"
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function AutoMLWorkspace() {
  const {
    loading,
    inspecting,
    error,
    datasetInfo,
    datasetPreview,
    datasetColumns,
    leaderboard,
    inspect,
    preview,
    train,
    clear,
  } = useAutoML();

  const [
    file,
    setFile,
  ] =
    useState<File | null>(
      null
    );

  const [
    task,
    setTask,
  ] =
    useState<SelectableAutoMLTask>(
      normalizeSelectableTask(
        "classification"
      )
    );

  const [
    targetColumn,
    setTargetColumn,
  ] =
    useState("");

  const [
    predictionTrainingResult,
    setPredictionTrainingResult,
  ] = useState<AutoMLResult | null>(
    null
  );
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [trainedConfiguration, setTrainedConfiguration] = useState<{
    filename: string; rows: number | null; columns: number | null;
    task: SelectableAutoMLTask; target: string; metric: AutoMLOptimizationMetric;
  } | null>(null);

  const [
    clusterCountMode,
    setClusterCountMode,
  ] = useState<ClusterCountMode>(
    "automatic"
  );

  const [
    numberOfClusters,
    setNumberOfClusters,
  ] = useState("");

  const [
    requirePredictionSupport,
    setRequirePredictionSupport,
  ] = useState(false);

  const [
    clusteringLimits,
    setClusteringLimits,
  ] = useState<ClusteringLimits | null>(
    null
  );

  /*
   * User-selectable optimization metric.
   */
  const [
    optimizationMetric,
    setOptimizationMetric,
  ] =
    useState<AutoMLOptimizationMetric>(
      "f1_score"
    );

  /* ==========================================================
     CURRENT METRICS
  ========================================================== */

  const metricOptions =
    useMemo(
      () =>
        metricsForTask(
          task
        ),
      [task]
    );

  useEffect(() => {
    if (
      task !== "clustering" ||
      clusteringLimits
    ) {
      return;
    }

    let active = true;

    getAutoMLInfo()
      .then((information) => {
        const limits =
          information.metadata
            ?.clustering;

        if (active && limits) {
          setClusteringLimits(
            limits
          );
        }
      })
      .catch(() => {
        /* Optional limits do not block training. */
      });

    return () => {
      active = false;
    };
  }, [task, clusteringLimits]);

  /* ==========================================================
     DATASET SHAPE
  ========================================================== */

  const shape =
    useMemo(() => {
      const summary =
        datasetInfo?.dataset_summary ??
        datasetInfo;

      const rows =
        summary?.rows ??
        datasetInfo?.rows ??
        null;

      /*
       * DatasetSummary.columns is numeric.
       */
      const columns =
        summary?.columns ??
        datasetColumns.length ??
        null;

      return {
        rows,
        columns,
      };
    }, [
      datasetInfo,
      datasetColumns,
    ]);

  const activeDatasetSummary =
    datasetInfo?.dataset_summary ??
    datasetInfo;
  const describedColumns =
    activeDatasetSummary?.columns_info ??
    {};

  const maximumCustomClusters =
    useMemo(() => {
      const configuredMaximum =
        clusteringLimits
          ?.maximum_number_of_clusters;
      const rowMaximum =
        typeof shape.rows === "number"
          ? shape.rows - 1
          : null;

      if (
        configuredMaximum !==
          undefined &&
        rowMaximum !== null
      ) {
        return Math.min(
          configuredMaximum,
          rowMaximum
        );
      }

      return (
        configuredMaximum ??
        rowMaximum
      );
    }, [
      clusteringLimits,
      shape.rows,
    ]);

  const clusteringValidationError =
    useMemo(() => {
      if (
        task !== "clustering" ||
        clusterCountMode !== "custom"
      ) {
        return null;
      }

      if (!numberOfClusters.trim()) {
        return "Enter the number of clusters.";
      }

      const count = Number(
        numberOfClusters
      );
      const minimum =
        clusteringLimits
          ?.minimum_number_of_clusters ??
        2;

      if (!Number.isInteger(count)) {
        return "Number of clusters must be an integer.";
      }

      if (count < minimum) {
        return `Number of clusters must be at least ${minimum}.`;
      }

      if (
        maximumCustomClusters !==
          null &&
        count > maximumCustomClusters
      ) {
        return `Number of clusters must not exceed ${maximumCustomClusters}.`;
      }

      return null;
    }, [
      task,
      clusterCountMode,
      numberOfClusters,
      clusteringLimits,
      maximumCustomClusters,
    ]);

  /* ==========================================================
     FILE CHANGE
  ========================================================== */

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      event.target.files?.[0];

    if (!selected) {
      return;
    }

    setFile(
      selected
    );

    setTargetColumn("");

    setPredictionTrainingResult(
      null
    );
    setShowConfiguration(false);

    setClusterCountMode(
      "automatic"
    );
    setNumberOfClusters("");
    setRequirePredictionSupport(
      false
    );

    /*
     * Reset metric to the correct
     * default for the current task.
     */
    setOptimizationMetric(
      defaultMetricForTask(
        task
      )
    );

    clear();

    try {
      await inspect(
        selected
      );

      await preview(
        selected
      );
    } catch {
      /*
       * Hook already stores
       * user-facing error.
       */
    }
  }

  /* ==========================================================
     TASK CHANGE
  ========================================================== */

  function handleTaskChange(
    nextTask: AutoMLTask
  ) {
    const selectableTask =
      normalizeSelectableTask(
        nextTask
      );

    setTask(
      selectableTask
    );

    /*
     * Automatically choose the
     * default metric for the new task.
     */
    setOptimizationMetric(
      defaultMetricForTask(
        selectableTask
      )
    );

    /*
     * Clustering doesn't use
     * target columns.
     */
    if (
      selectableTask ===
      "clustering"
    ) {
      setTargetColumn("");
    } else {
      setClusterCountMode(
        "automatic"
      );
      setNumberOfClusters("");
      setRequirePredictionSupport(
        false
      );
    }
  }

  /* ==========================================================
     TRAIN
  ========================================================== */

  async function handleTrain() {
    if (!file) {
      return;
    }

    setPredictionTrainingResult(
      null
    );

    try {
      const trainingResult =
        await train(
        file,

        task ===
          "clustering"
          ? undefined
          : targetColumn,

        task,

        optimizationMetric,

        task === "clustering"
          ? {
              cluster_count_mode:
                clusterCountMode,
              number_of_clusters:
                clusterCountMode ===
                "custom"
                  ? Number(
                      numberOfClusters
                    )
                  : null,
              require_prediction_support:
                requirePredictionSupport,
            }
          : undefined
      );

      setPredictionTrainingResult(
        trainingResult
      );
      setTrainedConfiguration({
        filename: file.name,
        rows: typeof shape.rows === "number" ? shape.rows : null,
        columns: typeof shape.columns === "number" ? shape.columns : null,
        task,
        target: targetColumn,
        metric: optimizationMetric,
      });
      setShowConfiguration(false);
    } catch {
      /*
       * Hook already stores
       * user-facing error.
       */
    }
  }

  /* ==========================================================
     CAN TRAIN
  ========================================================== */

  const canTrain =
    !!file &&
    !loading &&
    !inspecting &&
    (
      task ===
        "clustering" ||
      !!targetColumn
    ) &&
    !!optimizationMetric &&
    !clusteringValidationError;
  const hasSuccessfulResult = predictionTrainingResult?.best_model?.success === true;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-full pb-12 text-slate-100">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-8">

        <div className="flex items-center justify-between gap-4">

          <div>

            <p className="mb-2 text-sm font-medium text-blue-400">
              AI STUDIO / AUTOML
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              AutoML Workspace
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Upload a dataset, choose a machine learning task,
              select an optimization metric, and let AutoML
              evaluate baseline models.
            </p>

          </div>

          {file && (
            <button
              type="button"
              onClick={() => {
                setFile(null);

                setTargetColumn("");

                setPredictionTrainingResult(
                  null
                );
                setShowConfiguration(false);
                setTrainedConfiguration(null);

                setClusterCountMode(
                  "automatic"
                );
                setNumberOfClusters("");
                setRequirePredictionSupport(
                  false
                );

                setOptimizationMetric(
                  defaultMetricForTask(
                    task
                  )
                );

                clear();
              }}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Reset
            </button>
          )}

        </div>

      </div>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">

          <strong className="mr-2">
            AutoML error:
          </strong>

          {error}

        </div>
      )}

      {(!hasSuccessfulResult || showConfiguration) ? <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

        {/* ====================================================
            MAIN
        ==================================================== */}

        <section className="space-y-6">

          {/* ==================================================
              DATASET
          ================================================== */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">

            <div className="mb-5">

              <h2 className="text-lg font-semibold">
                1. Dataset
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Upload a CSV or Excel dataset.
              </p>

            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-6 py-10 text-center transition hover:border-blue-500 hover:bg-slate-950">

              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={
                  handleFileChange
                }
                className="hidden"
              />

              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-xl text-blue-400">
                ↑
              </div>

              <span className="font-medium">
                {file
                  ? file.name
                  : "Click to upload your dataset"}
              </span>

              <span className="mt-2 text-xs text-slate-500">
                {file
                  ? `${(
                      file.size /
                      1024
                    ).toFixed(
                      1
                    )} KB`
                  : "CSV, XLSX or XLS"}
              </span>

            </label>

            {(inspecting ||
              datasetColumns.length >
                0) && (

              <div className="mt-5 grid grid-cols-2 gap-3">

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                  <div className="text-xs text-slate-500">
                    Rows
                  </div>

                  <div className="mt-1 text-xl font-semibold">
                    {shape.rows ??
                      "—"}
                  </div>

                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                  <div className="text-xs text-slate-500">
                    Columns
                  </div>

                  <div className="mt-1 text-xl font-semibold">
                    {shape.columns ??
                      "—"}
                  </div>

                </div>

              </div>

            )}

          </div>

          {/* ==================================================
              TASK
          ================================================== */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">

            <div className="mb-5">

              <h2 className="text-lg font-semibold">
                2. Machine Learning Task
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Select the type of machine learning problem.
              </p>

            </div>

            <div className="grid gap-3 md:grid-cols-3">

              {TASKS.map(
                (item) => {

                  const selected =
                    task ===
                    item.value;

                  return (
                    <button
                      key={
                        item.value
                      }
                      type="button"
                      disabled={
                        item.disabled
                      }
                      onClick={() =>
                        !item.disabled &&
                        handleTaskChange(
                          item.value
                        )
                      }
                      className={`rounded-xl border p-4 text-left transition ${
                        item.disabled
                          ? "cursor-not-allowed border-slate-800 bg-slate-950/40 opacity-45"
                          : selected
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-800 bg-slate-950 hover:border-slate-600"
                      }`}
                    >

                      <div className="font-medium">
                        {
                          item.label
                        }
                      </div>

                      <div className="mt-1 text-xs leading-5 text-slate-500">
                        {
                          item.description
                        }
                      </div>

                    </button>
                  );
                }
              )}

            </div>

          </div>

          {/* ==================================================
              CONFIGURATION
          ================================================== */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">

            <div className="mb-5">

              <h2 className="text-lg font-semibold">
                3. Training Configuration
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Configure the target and optimization metric.
              </p>

            </div>

            {/* =================================================
                TARGET
            ================================================= */}

            {task !==
              "clustering" ? (

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Target column
                </label>

                <select
                  value={
                    targetColumn
                  }
                  onChange={(
                    e
                  ) =>
                    setTargetColumn(
                      e.target.value
                    )
                  }
                  disabled={
                    !file ||
                    inspecting
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500 disabled:opacity-50"
                >

                  <option value="">
                    Select target column
                  </option>

                  {datasetColumns.map(
                    (
                      column
                    ) => (
                      <option
                        key={
                          column
                        }
                        value={
                          column
                        }
                      >
                        {
                          column
                        }
                      </option>
                    )
                  )}

                </select>

                {!datasetColumns.length &&
                  file &&
                  !inspecting && (

                    <p className="mt-2 text-xs text-amber-400">
                      No columns were detected.
                      Check the backend inspect
                      response.
                    </p>

                  )}

              </div>

            ) : (

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-200">
                Clustering does not require a target column.
              </div>

            )}

            {task === "clustering" && (
              <div className="mt-6 space-y-5 rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Clustering configuration
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Automatic mode lets AutoML determine a suitable cluster count. Custom mode uses your requested count for compatible models.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="cluster-count-mode"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Cluster count mode
                  </label>
                  <select
                    id="cluster-count-mode"
                    value={clusterCountMode}
                    onChange={(event) => {
                      const nextMode =
                        event.target
                          .value as ClusterCountMode;
                      setClusterCountMode(
                        nextMode
                      );

                      if (
                        nextMode ===
                        "automatic"
                      ) {
                        setNumberOfClusters(
                          ""
                        );
                      }
                    }}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="automatic">
                      Automatic
                    </option>
                    <option value="custom">
                      Custom
                    </option>
                  </select>
                </div>

                {clusterCountMode ===
                  "custom" && (
                  <div>
                    <label
                      htmlFor="number-of-clusters"
                      className="mb-2 block text-sm font-medium text-slate-300"
                    >
                      Number of clusters
                    </label>
                    <input
                      id="number-of-clusters"
                      type="number"
                      inputMode="numeric"
                      step="1"
                      min={
                        clusteringLimits
                          ?.minimum_number_of_clusters ??
                        2
                      }
                      max={
                        maximumCustomClusters ??
                        undefined
                      }
                      value={numberOfClusters}
                      onChange={(event) =>
                        setNumberOfClusters(
                          event.target.value
                        )
                      }
                      disabled={loading}
                      aria-invalid={
                        !!clusteringValidationError
                      }
                      aria-describedby={
                        clusteringValidationError
                          ? "number-of-clusters-error"
                          : "number-of-clusters-help"
                      }
                      className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500 disabled:opacity-50 ${
                        clusteringValidationError
                          ? "border-red-500"
                          : "border-slate-700"
                      }`}
                    />
                    <p
                      id="number-of-clusters-help"
                      className="mt-2 text-xs text-slate-500"
                    >
                      {maximumCustomClusters !==
                      null
                        ? `Allowed range: ${
                            clusteringLimits
                              ?.minimum_number_of_clusters ??
                            2
                          } to ${maximumCustomClusters}.`
                        : "Enter an integer of at least 2."}
                    </p>
                    {clusteringValidationError && (
                      <p
                        id="number-of-clusters-error"
                        className="mt-2 text-xs text-red-300"
                      >
                        {clusteringValidationError}
                      </p>
                    )}
                  </div>
                )}

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <input
                    type="checkbox"
                    checked={
                      requirePredictionSupport
                    }
                    onChange={(event) =>
                      setRequirePredictionSupport(
                        event.target.checked
                      )
                    }
                    disabled={loading}
                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-300">
                      I want to assign new data to clusters after training
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Limits best-model selection to fitted models that can assign unseen rows.
                    </span>
                  </span>
                </label>
              </div>
            )}

            {/* =================================================
                METRIC
            ================================================= */}

            <div className="mt-6">

              <div className="mb-2 flex items-center justify-between gap-3">

                <label className="block text-sm font-medium text-slate-300">
                  Optimization metric
                </label>

                <span className="text-xs text-slate-500">
                  {task ===
                    "classification" &&
                    "Classification"}

                  {task ===
                    "regression" &&
                    "Regression"}

                  {task ===
                    "clustering" &&
                    "Clustering"}
                </span>

              </div>

              <select
                value={
                  optimizationMetric
                }
                onChange={(
                  e
                ) =>
                  setOptimizationMetric(
                    e.target
                      .value as AutoMLOptimizationMetric
                  )
                }
                disabled={
                  loading
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500 disabled:opacity-50"
              >

                {metricOptions.map(
                  (
                    metric
                  ) => (
                    <option
                      key={
                        metric.value
                      }
                      value={
                        metric.value
                      }
                    >
                      {
                        metric.label
                      }
                    </option>
                  )
                )}

              </select>


              {metricOptions.find(
                (item) =>
                  item.value ===
                  optimizationMetric
              ) && (

                <p className="mt-2 text-xs text-slate-500">
                  {
                    metricOptions.find(
                      (
                        item
                      ) =>
                        item.value ===
                        optimizationMetric
                    )?.description
                  }
                </p>

              )}

            </div>

            {/* =================================================
                RUN
            ================================================= */}

            <button
              type="button"
              onClick={
                handleTrain
              }
              disabled={
                !canTrain
              }
              className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >

              {loading
                ? "Training models..."
                : "Run AutoML"}

            </button>

          </div>

          {/* ==================================================
              PREVIEW
          ================================================== */}

          {datasetPreview.length >
            0 && (

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">

              <div className="mb-5">

                <h2 className="text-lg font-semibold">
                  Dataset Preview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  First{" "}
                  {
                    datasetPreview.length
                  }{" "}
                  rows returned by the backend.
                </p>

              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">

                <table className="min-w-full text-left text-xs">

                  <thead className="bg-slate-950">

                    <tr>

                      {datasetColumns.map(
                        (
                          column
                        ) => (

                          <th
                            key={
                              column
                            }
                            className="whitespace-nowrap px-4 py-3 font-medium text-slate-400"
                          >
                            {
                              column
                            }
                          </th>

                        )
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {datasetPreview.map(
                      (
                        row,
                        index
                      ) => (

                        <tr
                          key={
                            index
                          }
                          className="border-t border-slate-800"
                        >

                          {datasetColumns.map(
                            (
                              column
                            ) => (

                              <td
                                key={
                                  column
                                }
                                className="max-w-48 truncate px-4 py-3 text-slate-300"
                              >
                                {String(
                                  row[
                                    column
                                  ] ??
                                    "—"
                                )}
                              </td>

                            )
                          )}

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

              <div className="mt-6 border-t border-slate-800 pt-6">
                <h3 className="font-semibold text-slate-200">
                  Dataset Summary
                </h3>
                <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-slate-950 p-3">
                    <dt className="text-xs text-slate-500">Rows</dt>
                    <dd className="mt-1 font-semibold text-slate-200">{activeDatasetSummary?.rows ?? datasetPreview.length}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-3">
                    <dt className="text-xs text-slate-500">Columns</dt>
                    <dd className="mt-1 font-semibold text-slate-200">{activeDatasetSummary?.columns ?? datasetColumns.length}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-3">
                    <dt className="text-xs text-slate-500">Missing values</dt>
                    <dd className="mt-1 font-semibold text-slate-200">{activeDatasetSummary?.missing_values ?? 0}</dd>
                  </div>
                  <div className="rounded-xl bg-slate-950 p-3">
                    <dt className="text-xs text-slate-500">Target</dt>
                    <dd className="mt-1 break-words font-semibold text-slate-200">
                      {task === "clustering" ? "Not applicable" : targetColumn || "Not selected"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400">
                      <tr>
                        <th className="px-4 py-3 font-medium">Column</th>
                        <th className="px-4 py-3 font-medium">Description</th>
                        <th className="px-4 py-3 font-medium">Datatype</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Missing</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datasetColumns.map((column) => {
                        const metadata = describedColumns[column] ?? {};
                        const role =
                          task !== "clustering" && column === targetColumn
                            ? "target"
                            : metadata.role ?? "feature";
                        const description =
                          role === "target"
                            ? "Selected prediction target."
                            : metadata.description ?? "Description unavailable";
                        return (
                          <tr key={column} className="border-t border-slate-800">
                            <td className="px-4 py-3 font-medium text-slate-200">{column}</td>
                            <td className="max-w-72 px-4 py-3 text-slate-400">{description}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-slate-300">{metadata.dtype ?? "Unknown"}</td>
                            <td className="px-4 py-3 capitalize text-slate-300">{role}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-slate-300">
                              {metadata.missing ?? 0}
                              {typeof metadata.missing_percentage === "number"
                                ? ` (${metadata.missing_percentage.toFixed(1)}%)`
                                : ""}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

          )}

        </section>

        {/* ====================================================
            SIDEBAR
        ==================================================== */}

        <aside className="space-y-6">

          {/* ==================================================
              STATUS
          ================================================== */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">

            <h2 className="font-semibold">
              Workspace Status
            </h2>

            <div className="mt-5 space-y-4">

              <Status
                label="Dataset"
                value={
                  file
                    ? "Ready"
                    : "Waiting"
                }
                active={
                  !!file
                }
              />

              <Status
                label="Columns"
                value={
                  datasetColumns.length
                    ? `${datasetColumns.length} detected`
                    : "Waiting"
                }
                active={
                  datasetColumns.length >
                  0
                }
              />

              <Status
                label="Task"
                value={
                  task
                }
                active={
                  !!file
                }
              />

              <Status
                label="Metric"
                value={
                  metricLabel(
                    optimizationMetric
                  )
                }
                active={
                  !!optimizationMetric
                }
              />

              <Status
                label="Training"
                value={
                  loading
                    ? "Running"
                    : leaderboard.length
                    ? "Complete"
                    : "Not started"
                }
                active={
                  loading ||
                  leaderboard.length >
                    0
                }
              />

            </div>

          </div>

        </aside>

      </div> : <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-slate-100">{trainedConfiguration?.filename ?? file?.name}</h2>
          <p className="mt-1 text-sm text-slate-400">{trainedConfiguration?.rows ?? "—"} rows · {trainedConfiguration?.columns ?? "—"} columns · <span className="capitalize">{trainedConfiguration?.task ?? task}</span>{trainedConfiguration?.task !== "clustering" && trainedConfiguration?.target ? ` · Target: ${trainedConfiguration.target}` : ""}</p>
          <p className="text-xs text-slate-500">Optimization metric: {metricLabel(trainedConfiguration?.metric ?? optimizationMetric)}</p>
        </div>
        <div className="flex gap-2"><button type="button" onClick={() => setShowConfiguration(true)} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">Edit configuration</button><button type="button" disabled={loading || !canTrain} onClick={handleTrain} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50">Run again</button></div>
      </section>}

      {predictionTrainingResult && <div className="space-y-5">
        <AutoMLResults result={predictionTrainingResult} />
        <BestModelPrediction key={predictionTrainingResult.artifact?.model_filename ?? "unavailable-artifact"} trainingResult={predictionTrainingResult} />
      </div>}

    </div>
  );
}

/* ============================================================
   STATUS
============================================================ */

function Status({
  label,
  value,
  active,
}: {
  label: string;
  value: string;
  active: boolean;
}) {
  return (

    <div className="flex items-center justify-between gap-3">

      <span className="text-sm text-slate-400">
        {
          label
        }
      </span>

      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          active
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-slate-800 text-slate-500"
        }`}
      >
        {
          value
        }
      </span>

    </div>

  );
}
