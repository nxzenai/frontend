"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getPredictionErrorMessage,
  predictValues,
} from "@/services/automl.service";

import type {
  AutoMLPredictionResponse,
  AutoMLResult,
  DatasetColumnInfo,
  PredictionRow,
  PredictionValue,
} from "@/types/automl";

interface Props {
  trainingResult: AutoMLResult;
}

type PredictionFieldKind =
  | "number"
  | "boolean"
  | "date"
  | "datetime-local"
  | "category"
  | "text";

interface PredictionField {
  name: string;
  metadata: DatasetColumnInfo;
  kind: PredictionFieldKind;
  options: PredictionValue[];
  nullable: boolean;
}

function getCategoryOptions(
  metadata: DatasetColumnInfo
): PredictionValue[] {
  return (
    metadata.categories ??
    metadata.allowed_values ??
    metadata.values ??
    []
  );
}

function getFieldKind(
  metadata: DatasetColumnInfo
): PredictionFieldKind {
  const dtype = (
    metadata.dtype ?? ""
  ).toLowerCase();

  if (/bool/.test(dtype)) {
    return "boolean";
  }

  if (
    /datetime|timestamp/.test(dtype)
  ) {
    return "datetime-local";
  }

  if (
    /(^|[^a-z])date([^a-z]|$)/.test(
      dtype
    )
  ) {
    return "date";
  }

  if (
    /int|float|double|decimal|number|uint/.test(
      dtype
    )
  ) {
    return "number";
  }

  if (
    getCategoryOptions(metadata).length >
    0
  ) {
    return "category";
  }

  return "text";
}

function createEmptyValues(
  fields: PredictionField[]
): Record<string, string> {
  return Object.fromEntries(
    fields.map((field) => [
      field.name,
      "",
    ])
  );
}

function displayValue(
  value: PredictionValue | undefined
): string {
  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "Unavailable";
  }

  return String(value);
}

function PredictionResult({
  result,
}: {
  result: AutoMLPredictionResponse;
}) {
  const prediction =
    result.predictions[0];

  if (
    result.task === "classification"
  ) {
    const probabilities =
      result.probabilities?.[0];
    const hasAlignedProbabilities =
      probabilities !== undefined &&
      result.classes !== undefined &&
      probabilities.length ===
        result.classes.length;

    return (
      <div className="space-y-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
            Predicted class
          </p>
          <p className="mt-2 break-words text-xl font-bold text-white">
            {displayValue(prediction)}
          </p>
        </div>

        {hasAlignedProbabilities && (
          <div className="overflow-hidden rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-3 py-2 font-medium">
                    Class
                  </th>
                  <th className="px-3 py-2 text-right font-medium">
                    Probability
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.classes?.map(
                  (className, index) => (
                    <tr
                      key={`${displayValue(className)}-${index}`}
                      className="border-t border-slate-800"
                    >
                      <td className="break-words px-3 py-2 text-slate-300">
                        {displayValue(
                          className
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-300">
                        {(
                          probabilities[
                            index
                          ] * 100
                        ).toFixed(2)}
                        %
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (result.task === "regression") {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
          Predicted value
        </p>
        <p className="mt-2 break-words text-xl font-bold text-white">
          {displayValue(prediction)}
        </p>
      </div>
    );
  }

  if (result.task === "clustering") {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
          Assigned cluster
        </p>
        <p className="mt-2 break-words text-xl font-bold text-white">
          {displayValue(prediction)}
        </p>
      </div>
    );
  }

  return (
    <pre className="max-h-72 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">
      {JSON.stringify(result, null, 2)}
    </pre>
  );
}

export default function BestModelPrediction({
  trainingResult,
}: Props) {
  const artifact =
    trainingResult.artifact;
  const summary =
    trainingResult.dataset_summary;
  const targetColumn =
    summary?.target_column ?? null;

  const fields = useMemo(
    () =>
      Object.entries(
        summary?.columns_info ?? {}
      )
        .filter(
          ([name]) =>
            name !== targetColumn
        )
        .map(
          ([name, metadata]) => ({
            name,
            metadata,
            kind: getFieldKind(
              metadata
            ),
            options:
              getCategoryOptions(
                metadata
              ),
            nullable:
              metadata.nullable ===
                true ||
              metadata.required ===
                false ||
              (metadata.missing ?? 0) >
                0,
          })
        ),
    [summary?.columns_info, targetColumn]
  );

  const [expanded, setExpanded] =
    useState(false);
  const [values, setValues] =
    useState<Record<string, string>>(
      () => createEmptyValues(fields)
    );
  const [validationErrors, setValidationErrors] =
    useState<Record<string, string>>(
      {}
    );
  const [predicting, setPredicting] =
    useState(false);
  const [predictionError, setPredictionError] =
    useState<string | null>(null);
  const [predictionResult, setPredictionResult] =
    useState<AutoMLPredictionResponse | null>(
      null
    );
  const requestVersion = useRef(0);

  useEffect(
    () => () => {
      requestVersion.current += 1;
    },
    []
  );

  const modelFilename =
    artifact?.model_filename;
  const predictionAvailable =
    artifact?.available === true &&
    artifact.prediction_supported ===
      true &&
    typeof modelFilename === "string" &&
    modelFilename.length > 0;

  function updateValue(
    name: string,
    value: string
  ) {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
    setValidationErrors(
      (current) => {
        if (!(name in current)) {
          return current;
        }

        const next = {
          ...current,
        };
        delete next[name];
        return next;
      }
    );
  }

  function buildPredictionRow(): {
    row: PredictionRow;
    errors: Record<string, string>;
  } {
    const row: PredictionRow = {};
    const errors: Record<
      string,
      string
    > = {};

    fields.forEach((field) => {
      const rawValue =
        values[field.name] ?? "";

      if (rawValue === "") {
        if (field.nullable) {
          row[field.name] = null;
        } else {
          errors[field.name] =
            `${field.name} is required.`;
        }
        return;
      }

      if (field.kind === "number") {
        const numericValue =
          Number(rawValue);

        if (
          !Number.isFinite(
            numericValue
          )
        ) {
          errors[field.name] =
            `${field.name} must be a valid number.`;
          return;
        }

        row[field.name] =
          numericValue;
        return;
      }

      if (field.kind === "boolean") {
        row[field.name] =
          rawValue === "true";
        return;
      }

      if (field.kind === "category") {
        const selectedIndex =
          Number(rawValue);
        const selectedValue =
          field.options[
            selectedIndex
          ];

        if (
          selectedValue === undefined
        ) {
          errors[field.name] =
            `Select a valid value for ${field.name}.`;
          return;
        }

        row[field.name] =
          selectedValue;
        return;
      }

      row[field.name] = rawValue;
    });

    return {
      row,
      errors,
    };
  }

  async function handlePredict(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      predicting ||
      !predictionAvailable ||
      !modelFilename
    ) {
      return;
    }

    const { row, errors } =
      buildPredictionRow();

    setValidationErrors(errors);

    if (
      Object.keys(errors).length > 0
    ) {
      return;
    }

    const currentRequest =
      requestVersion.current + 1;
    requestVersion.current =
      currentRequest;
    setPredicting(true);
    setPredictionError(null);
    setPredictionResult(null);

    try {
      const result = await predictValues({
        model_filename:
          modelFilename,
        rows: [row],
      });

      if (
        requestVersion.current ===
        currentRequest
      ) {
        setPredictionResult(result);
      }
    } catch (error) {
      if (
        requestVersion.current ===
        currentRequest
      ) {
        setPredictionError(
          getPredictionErrorMessage(
            error
          )
        );
      }
    } finally {
      if (
        requestVersion.current ===
        currentRequest
      ) {
        setPredicting(false);
      }
    }
  }

  function resetPrediction() {
    requestVersion.current += 1;
    setValues(
      createEmptyValues(fields)
    );
    setValidationErrors({});
    setPredictionError(null);
    setPredictionResult(null);
    setPredicting(false);
  }

  let unavailableMessage =
    "A saved best-model artifact is not available for prediction.";

  if (
    artifact?.prediction_supported ===
    false
  ) {
    unavailableMessage =
      artifact.prediction_unavailable_reason ??
      "This model does not support prediction for unseen rows.";
  } else if (
    artifact?.available === true &&
    !modelFilename
  ) {
    unavailableMessage =
      "The saved model identifier is unavailable.";
  } else if (
    predictionAvailable &&
    fields.length === 0
  ) {
    unavailableMessage =
      "Feature metadata is unavailable for this saved model.";
  }

  const canOpenPrediction =
    predictionAvailable &&
    fields.length > 0;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
          Saved Best Model
        </p>
        <h2 className="mt-2 font-semibold text-slate-100">
          Test Best Model
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Enter one row of feature values to test the saved model without retraining.
        </p>
      </div>

      {!canOpenPrediction && (
        <div
          className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-200"
          role="status"
        >
          {unavailableMessage}
        </div>
      )}

      {!expanded && (
        <button
          type="button"
          onClick={() =>
            setExpanded(true)
          }
          disabled={!canOpenPrediction}
          className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
        >
          Test Prediction
        </button>
      )}

      {expanded &&
        canOpenPrediction && (
          <form
            className="mt-5 space-y-4"
            onSubmit={handlePredict}
            noValidate
            aria-busy={predicting}
          >
            {fields.map(
              (field, index) => {
                const inputId =
                  `automl-prediction-${index}`;
                const errorId =
                  `${inputId}-error`;
                const error =
                  validationErrors[
                    field.name
                  ];
                const commonClassName =
                  "mt-2 w-full rounded-xl border bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-blue-500 disabled:opacity-50";
                const borderClassName =
                  error
                    ? "border-red-500"
                    : "border-slate-700";

                return (
                  <div key={field.name}>
                    <label
                      htmlFor={inputId}
                      className="block break-words text-sm font-medium text-slate-300"
                    >
                      {field.name}
                      {!field.nullable && (
                        <span
                          className="ml-1 text-red-400"
                          aria-hidden="true"
                        >
                          *
                        </span>
                      )}
                    </label>

                    {field.kind ===
                    "boolean" ? (
                      <select
                        id={inputId}
                        value={
                          values[
                            field.name
                          ] ?? ""
                        }
                        onChange={(event) =>
                          updateValue(
                            field.name,
                            event.target.value
                          )
                        }
                        disabled={predicting}
                        aria-invalid={
                          !!error
                        }
                        aria-describedby={
                          error
                            ? errorId
                            : undefined
                        }
                        className={`${commonClassName} ${borderClassName}`}
                      >
                        <option value="">
                          {field.nullable
                            ? "No value"
                            : "Select true or false"}
                        </option>
                        <option value="true">
                          True
                        </option>
                        <option value="false">
                          False
                        </option>
                      </select>
                    ) : field.kind ===
                      "category" ? (
                      <select
                        id={inputId}
                        value={
                          values[
                            field.name
                          ] ?? ""
                        }
                        onChange={(event) =>
                          updateValue(
                            field.name,
                            event.target.value
                          )
                        }
                        disabled={predicting}
                        aria-invalid={
                          !!error
                        }
                        aria-describedby={
                          error
                            ? errorId
                            : undefined
                        }
                        className={`${commonClassName} ${borderClassName}`}
                      >
                        <option value="">
                          {field.nullable
                            ? "No value"
                            : "Select a value"}
                        </option>
                        {field.options.map(
                          (
                            option,
                            optionIndex
                          ) => (
                            <option
                              key={`${displayValue(option)}-${optionIndex}`}
                              value={
                                optionIndex
                              }
                            >
                              {displayValue(
                                option
                              )}
                            </option>
                          )
                        )}
                      </select>
                    ) : (
                      <input
                        id={inputId}
                        type={field.kind}
                        step={
                          field.kind ===
                          "number"
                            ? "any"
                            : undefined
                        }
                        value={
                          values[
                            field.name
                          ] ?? ""
                        }
                        onChange={(event) =>
                          updateValue(
                            field.name,
                            event.target.value
                          )
                        }
                        disabled={predicting}
                        aria-invalid={
                          !!error
                        }
                        aria-describedby={
                          error
                            ? errorId
                            : undefined
                        }
                        className={`${commonClassName} ${borderClassName}`}
                      />
                    )}

                    {error && (
                      <p
                        id={errorId}
                        className="mt-1 text-xs text-red-300"
                      >
                        {error}
                      </p>
                    )}
                  </div>
                );
              }
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={predicting}
                className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
              >
                {predicting
                  ? "Predicting..."
                  : "Predict"}
              </button>
              <button
                type="button"
                onClick={resetPrediction}
                disabled={predicting}
                className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reset
              </button>
            </div>

            <div aria-live="polite">
              {predicting && (
                <p className="text-sm text-blue-300">
                  Running prediction...
                </p>
              )}

              {predictionError && (
                <div
                  className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-300"
                  role="alert"
                >
                  {predictionError}
                </div>
              )}

              {predictionResult && (
                <div className="space-y-3">
                  <PredictionResult
                    result={
                      predictionResult
                    }
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPredictionResult(
                        null
                      )
                    }
                    className="text-xs font-medium text-slate-400 underline decoration-slate-600 underline-offset-4 hover:text-slate-200"
                  >
                    Clear result
                  </button>
                </div>
              )}
            </div>
          </form>
        )}
    </section>
  );
}
