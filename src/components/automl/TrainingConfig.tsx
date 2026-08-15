"use client";

import type { AutoMLTask } from "@/types/automl";

interface Props {
  task: AutoMLTask;
  columns: string[];
  targetColumn: string;
  onTargetChange: (
    value: string
  ) => void;
}

export default function TrainingConfig({
  task,
  columns,
  targetColumn,
  onTargetChange,
}: Props) {
  const requiresTarget =
    task === "classification" ||
    task === "regression";

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-950">
          Training Configuration
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Configure the target column before
          training.
        </p>
      </div>

      {requiresTarget ? (
        <div>
          <label
            htmlFor="target-column"
            className="mb-2 block text-sm font-semibold text-slate-800"
          >
            Target Column
          </label>

          <select
            id="target-column"
            value={targetColumn}
            onChange={(event) =>
              onTargetChange(
                event.target.value
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">
              Select target column
            </option>

            {columns.map((column) => (
              <option
                key={column}
                value={column}
              >
                {column}
              </option>
            ))}
          </select>

          <p className="mt-2 text-xs text-slate-500">
            Select the column AutoML should
            predict.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm font-bold text-blue-900">
            No target column required
          </p>

          <p className="mt-1 text-sm text-blue-700">
            Clustering automatically discovers
            groups in your dataset.
          </p>
        </div>
      )}
    </div>
  );
}