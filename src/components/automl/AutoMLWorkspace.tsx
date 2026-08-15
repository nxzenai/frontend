"use client";

import { ChangeEvent, useMemo, useState } from "react";
import useAutoML from "@/hooks/useAutoML";
import type { AutoMLTask } from "@/types/automl";

const TASKS: {
  value: AutoMLTask;
  label: string;
  description: string;
  disabled?: boolean;
}[] = [
  {
    value: "classification",
    label: "Classification",
    description: "Predict a category or class.",
  },
  {
    value: "regression",
    label: "Regression",
    description: "Predict a continuous numeric value.",
  },
  {
    value: "clustering",
    label: "Clustering",
    description: "Discover groups without a target.",
  },
  {
    value: "anomaly",
    label: "Anomaly Detection",
    description: "Coming next.",
    disabled: true,
  },
  {
    value: "dimensionality",
    label: "Dimensionality Reduction",
    description: "Coming next.",
    disabled: true,
  },
];

function pretty(value: any): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toFixed(4) : "—";
  }
  return String(value);
}

function metricForTask(task: AutoMLTask, row: any) {
  if (task === "classification") {
    return (
      row.f1_score ??
      row.accuracy ??
      row.roc_auc
    );
  }

  if (task === "regression") {
    return (
      row.r2_score ??
      row.rmse ??
      row.mae
    );
  }

  return (
    row.silhouette_score ??
    row.calinski_harabasz_score ??
    row.davies_bouldin_score
  );
}

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

  const [file, setFile] = useState<File | null>(null);
  const [task, setTask] =
    useState<AutoMLTask>("classification");
  const [targetColumn, setTargetColumn] =
    useState("");

  const shape = useMemo(() => {
    const summary = datasetInfo?.dataset_summary ?? datasetInfo;

    const rows =
      summary?.rows ??
      summary?.n_rows ??
      datasetInfo?.shape?.[0] ??
      null;

    const columns =
      summary?.columns ??
      summary?.n_columns ??
      datasetInfo?.shape?.[1] ??
      datasetColumns.length ??
      null;

    return { rows, columns };
  }, [datasetInfo, datasetColumns]);

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selected = event.target.files?.[0];

    if (!selected) return;

    setFile(selected);
    setTargetColumn("");
    clear();

    try {
      await inspect(selected);
      await preview(selected);
    } catch {
      // Hook already stores the user-facing error.
    }
  }

  async function handleTrain() {
    if (!file) return;

    try {
      await train(
        file,
        task === "clustering"
          ? undefined
          : targetColumn,
        task
      );
    } catch {
      // Hook already stores the user-facing error.
    }
  }

  const canTrain =
    !!file &&
    !loading &&
    !inspecting &&
    (task === "clustering" || !!targetColumn);

  return (
    <div className="min-h-full pb-12 text-slate-100">
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
              Upload a dataset, choose a task, and let AutoML
              evaluate the best baseline models.
            </p>
          </div>

          {file && (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setTargetColumn("");
                clear();
              }}
              className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <strong className="mr-2">AutoML error:</strong>
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                1. Dataset
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                CSV or another format supported by the backend.
              </p>
            </div>

            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-6 py-10 text-center transition hover:border-blue-500 hover:bg-slate-950">
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.parquet"
                onChange={handleFileChange}
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
                  ? `${(file.size / 1024).toFixed(1)} KB`
                  : "CSV, XLSX, XLS or Parquet"}
              </span>
            </label>

            {(inspecting || datasetColumns.length > 0) && (
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-xs text-slate-500">
                    Rows
                  </div>
                  <div className="mt-1 text-xl font-semibold">
                    {shape.rows ?? "—"}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                  <div className="text-xs text-slate-500">
                    Columns
                  </div>
                  <div className="mt-1 text-xl font-semibold">
                    {shape.columns ?? "—"}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                2. Machine Learning Task
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Basic ML is enabled first. Advanced analysis will be
                added later.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {TASKS.map((item) => {
                const selected =
                  task === item.value;

                return (
                  <button
                    key={item.value}
                    type="button"
                    disabled={item.disabled}
                    onClick={() =>
                      !item.disabled &&
                      setTask(item.value)
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
                      {item.label}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-slate-500">
                      {item.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold">
                3. Training Configuration
              </h2>
            </div>

            {task !== "clustering" ? (
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Target column
                </label>

                <select
                  value={targetColumn}
                  onChange={(e) =>
                    setTargetColumn(e.target.value)
                  }
                  disabled={!file || inspecting}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  <option value="">
                    Select target column
                  </option>

                  {datasetColumns.map((column) => (
                    <option
                      key={column}
                      value={column}
                    >
                      {column}
                    </option>
                  ))}
                </select>

                {!datasetColumns.length &&
                  file &&
                  !inspecting && (
                    <p className="mt-2 text-xs text-amber-400">
                      No columns were detected. Check the
                      backend inspect response.
                    </p>
                  )}
              </div>
            ) : (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-blue-200">
                Clustering does not require a target column.
              </div>
            )}

            <button
              type="button"
              onClick={handleTrain}
              disabled={!canTrain}
              className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              {loading
                ? "Training models..."
                : "Run AutoML"}
            </button>
          </div>

          {datasetPreview.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
              <div className="mb-5">
                <h2 className="text-lg font-semibold">
                  Dataset Preview
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  First {datasetPreview.length} rows returned by
                  the backend.
                </p>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-950">
                    <tr>
                      {datasetColumns.map((column) => (
                        <th
                          key={column}
                          className="whitespace-nowrap px-4 py-3 font-medium text-slate-400"
                        >
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {datasetPreview.map(
                      (row, index) => (
                        <tr
                          key={index}
                          className="border-t border-slate-800"
                        >
                          {datasetColumns.map(
                            (column) => (
                              <td
                                key={column}
                                className="max-w-48 truncate px-4 py-3 text-slate-300"
                              >
                                {String(
                                  row[column] ?? "—"
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

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <h2 className="font-semibold">
              Workspace Status
            </h2>

            <div className="mt-5 space-y-4">
              <Status
                label="Dataset"
                value={file ? "Ready" : "Waiting"}
                active={!!file}
              />
              <Status
                label="Columns"
                value={
                  datasetColumns.length
                    ? `${datasetColumns.length} detected`
                    : "Waiting"
                }
                active={datasetColumns.length > 0}
              />
              <Status
                label="Task"
                value={task}
                active={!!file}
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
                  loading || leaderboard.length > 0
                }
              />
            </div>
          </div>

          {bestModel && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                Best Model
              </p>
              <h2 className="mt-2 text-xl font-bold">
                {bestModel.model_name ??
                  "Best model"}
              </h2>

              {bestModel.training_time !==
                undefined && (
                <p className="mt-2 text-sm text-slate-400">
                  Training time:{" "}
                  {pretty(
                    bestModel.training_time
                  )}
                  s
                </p>
              )}
            </div>
          )}

          {leaderboard.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
              <h2 className="font-semibold">
                Model Leaderboard
              </h2>

              <div className="mt-4 space-y-2">
                {leaderboard.map(
                  (row, index) => (
                    <div
                      key={`${row.model_name}-${index}`}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {row.model_name}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Rank #
                            {row.rank ??
                              index + 1}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold text-blue-400">
                            {pretty(
                              metricForTask(
                                task,
                                row
                              )
                            )}
                          </div>
                          <div className="text-[10px] text-slate-600">
                            primary metric
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
              <h2 className="font-semibold">
                Recommendations
              </h2>

              <ul className="mt-4 space-y-3">
                {recommendations.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="text-sm leading-6 text-slate-400"
                    >
                      <span className="mr-2 text-blue-400">
                        •
                      </span>
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

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
        {label}
      </span>

      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          active
            ? "bg-emerald-500/10 text-emerald-400"
            : "bg-slate-800 text-slate-500"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
