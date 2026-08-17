"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import useAutoML from "@/hooks/useAutoML";
import BestModelPrediction from "@/components/automl/BestModelPrediction";
import { getAutoMLInfo } from "@/services/automl.service";

import type {
  AutoMLResult,
  AutoMLTask,
  AutoMLOptimizationMetric,
  ClusterCountMode,
  ClusteringLimits,
  LeaderboardEntry,
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
  {
    value: "explained_variance",
    label: "Explained Variance",
    description:
      "Variance explained by the model. Higher is better.",
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
   MODEL NAME
============================================================ */

function formatModelName(
  model?: string
): string {
  if (
    !model ||
    !model.trim()
  ) {
    return "Unknown Model";
  }

  const normalized =
    model
      .trim()
      .toLowerCase();

  const MODEL_NAMES: Record<
    string,
    string
  > = {
    logistic_regression:
      "Logistic Regression",

    extra_trees:
      "Extra Trees",

    passive_aggressive:
      "Passive Aggressive",

    linear_svc:
      "Linear SVC",

    ridge_classifier:
      "Ridge Classifier",

    sgd_classifier:
      "SGD Classifier",

    random_forest:
      "Random Forest",

    gradient_boosting:
      "Gradient Boosting",

    hist_gradient_boosting:
      "Histogram Gradient Boosting",

    decision_tree:
      "Decision Tree",

    knn:
      "K-Nearest Neighbors",

    svc:
      "Support Vector Classifier",

    gaussian_nb:
      "Gaussian Naive Bayes",

    multinomial_nb:
      "Multinomial Naive Bayes",

    bernoulli_nb:
      "Bernoulli Naive Bayes",

    xgboost:
      "XGBoost",

    catboost:
      "CatBoost",

    lightgbm:
      "LightGBM",

    linear_regression:
      "Linear Regression",

    ridge:
      "Ridge Regression",

    lasso:
      "Lasso Regression",

    elastic_net:
      "Elastic Net",

    random_forest_regressor:
      "Random Forest Regressor",

    extra_trees_regressor:
      "Extra Trees Regressor",

    gradient_boosting_regressor:
      "Gradient Boosting Regressor",

    hist_gradient_boosting_regressor:
      "Histogram Gradient Boosting Regressor",

    decision_tree_regressor:
      "Decision Tree Regressor",

    random_forest_classifier:
      "Random Forest Classifier",

    kmeans:
      "K-Means",

    mini_batch_kmeans:
      "Mini-Batch K-Means",

    agglomerative_clustering:
      "Agglomerative Clustering",

    dbscan:
      "DBSCAN",

    birch:
      "BIRCH",

    spectral_clustering:
      "Spectral Clustering",
  };

  if (
    MODEL_NAMES[
      normalized
    ]
  ) {
    return MODEL_NAMES[
      normalized
    ];
  }

  /*
   * Generic fallback for future models.
   *
   * Example:
   *
   * "some_new_model"
   * → "Some New Model"
   */
  return normalized
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}

/* ============================================================
   PRIMARY METRIC VALUE
============================================================ */

function metricValue(
  row: LeaderboardEntry,
  metric: AutoMLOptimizationMetric
): number | null {
  const value =
    row[
      metric
    ];

  return typeof value ===
    "number"
    ? value
    : null;
}

/* ============================================================
   NUMBER FORMAT
============================================================ */

function pretty(
  value: any
): string {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return "—";
  }

  if (
    typeof value ===
    "number"
  ) {
    if (
      !Number.isFinite(
        value
      )
    ) {
      return "—";
    }

    /*
     * Large regression metrics
     * need more readable formatting.
     */
    if (
      Math.abs(value) >=
      1000
    ) {
      return value.toLocaleString(
        "en-US",
        {
          maximumFractionDigits: 2,
        }
      );
    }

    return value.toFixed(
      4
    );
  }

  return String(
    value
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
    bestModel,
    statistics,
    recommendations,
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

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

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

          {/* ==================================================
              BEST MODEL
          ================================================== */}

          {bestModel && (

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">

              <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                Best Model
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {
                  formatModelName(
                    bestModel.model_name
                  )
                }
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                Optimized for{" "}
                <span className="text-slate-300">
                  {
                    metricLabel(
                      optimizationMetric
                    )
                  }
                </span>
              </p>

              {bestModel.training_time !==
                undefined && (

                <p className="mt-2 text-sm text-slate-400">

                  Training time:{" "}

                  {
                    pretty(
                      bestModel.training_time
                    )
                  }

                  s

                </p>

              )}

            </div>

          )}

          {predictionTrainingResult
            ?.task === "clustering" &&
            predictionTrainingResult
              .clustering && (
              <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
                <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                  Clustering Setup
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">
                      Count mode
                    </dt>
                    <dd className="mt-1 capitalize text-slate-200">
                      {
                        predictionTrainingResult
                          .clustering
                          .cluster_count_mode
                      }
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">
                      Requested
                    </dt>
                    <dd className="mt-1 text-slate-200">
                      {predictionTrainingResult
                        .clustering
                        .requested_number_of_clusters ??
                        "Automatic"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">
                      Effective
                    </dt>
                    <dd className="mt-1 text-slate-200">
                      {predictionTrainingResult
                        .clustering
                        .effective_number_of_clusters ??
                        "Model-derived"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">
                      Future prediction
                    </dt>
                    <dd className="mt-1 text-slate-200">
                      {predictionTrainingResult
                        .clustering
                        .prediction_supported
                        ? "Supported"
                        : "Unavailable"}
                    </dd>
                  </div>
                </dl>
              </section>
            )}

          {predictionTrainingResult && (
            <BestModelPrediction
              key={
                predictionTrainingResult
                  .artifact
                  ?.model_filename ??
                "unavailable-artifact"
              }
              trainingResult={
                predictionTrainingResult
              }
            />
          )}

          {/* ==================================================
              LEADERBOARD
          ================================================== */}

          {leaderboard.length >
            0 && (

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">

              <div className="flex items-center justify-between gap-3">

                <div>

                  <h2 className="font-semibold">
                    Model Leaderboard
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Ranked by{" "}
                    {
                      metricLabel(
                        optimizationMetric
                      )
                    }
                  </p>

                </div>

              </div>

              <div className="mt-4 space-y-2">

                {leaderboard.map(
                  (
                    row,
                    index
                  ) => {

                    /*
                     * Backend can provide either
                     * model_name or model.
                     */
                    const rawModel =
                      row.model_name ??
                      row.model;

                    const modelName =
                      formatModelName(
                        rawModel
                      );

                    const value =
                      metricValue(
                        row,
                        optimizationMetric
                      );

                    return (

                      <div
                        key={`${rawModel ?? "model"}-${index}`}
                        className="rounded-xl border border-slate-800 bg-slate-950 p-3"
                      >

                        <div className="flex items-center justify-between gap-3">

                          <div className="min-w-0">

                            <div className="truncate text-sm font-semibold text-slate-100">

                              {
                                modelName
                              }

                            </div>

                            <div className="mt-1 text-xs text-slate-500">

                              Rank #

                              {
                                row.rank ??
                                index +
                                  1
                              }

                            </div>

                          </div>

                          <div className="text-right">

                            <div className="text-sm font-semibold text-blue-400">

                              {
                                pretty(
                                  value
                                )
                              }

                            </div>

                            <div className="text-[10px] text-slate-500">

                              {
                                metricLabel(
                                  optimizationMetric
                                )
                              }

                            </div>

                          </div>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            </div>

          )}

          {/* ==================================================
              RECOMMENDATIONS
          ================================================== */}

          {recommendations.length >
            0 && (

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

              <h2 className="font-semibold">
                Recommendations
              </h2>

              <ul className="mt-4 space-y-3">

                {recommendations.map(
                  (
                    item,
                    index
                  ) => (

                    <li
                      key={
                        index
                      }
                      className="text-sm leading-6 text-slate-400"
                    >

                      <span className="mr-2 text-blue-400">
                        •
                      </span>

                      {
                        item
                      }

                    </li>

                  )
                )}

              </ul>

            </div>

          )}

          {/* ==================================================
              STATISTICS
          ================================================== */}

          {statistics && (

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">

              <h2 className="font-semibold">
                Training Statistics
              </h2>

              <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-400">
                {JSON.stringify(
                  statistics,
                  null,
                  2
                )}
              </pre>

            </div>

          )}

        </aside>

      </div>

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
