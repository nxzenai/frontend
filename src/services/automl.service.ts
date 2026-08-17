import axios from "axios";

import { api } from "@/lib/api";

import type {
  AutoMLResult,
  AutoMLTask,
  AutoMLOptimizationMetric,
  DatasetInspectResponse,
  DatasetPreviewResponse,
  AutoMLPredictionErrorResponse,
  AutoMLPredictionRequest,
  AutoMLPredictionResponse,
} from "@/types/automl";

/* ============================================================
   FORM DATA
============================================================ */

function createFormData(
  file: File,
  targetColumn?: string,
  task?: AutoMLTask,
  optimizationMetric?: AutoMLOptimizationMetric
): FormData {
  const formData = new FormData();

  formData.append(
    "file",
    file,
    file.name
  );

  if (
    targetColumn &&
    targetColumn.trim()
  ) {
    formData.append(
      "target_column",
      targetColumn.trim()
    );
  }

  if (
    task &&
    task !== "auto"
  ) {
    formData.append(
      "task",
      task
    );
  }

  /*
   * Backend can start consuming this field.
   *
   * Older backend versions that do not explicitly
   * declare the field will simply ignore it.
   */
  if (
    optimizationMetric
  ) {
    formData.append(
      "optimization_metric",
      optimizationMetric
    );
  }

  return formData;
}

/* ============================================================
   INSPECT
============================================================ */

export async function inspectDataset(
  file: File
): Promise<DatasetInspectResponse> {
  const formData = new FormData();

  formData.append(
    "file",
    file,
    file.name
  );

  const response =
    await api.post<DatasetInspectResponse>(
      "/api/v1/automl/inspect",
      formData
    );

  return response.data;
}

/* ============================================================
   PREVIEW
============================================================ */

export async function previewDataset(
  file: File
): Promise<DatasetPreviewResponse> {
  const formData = new FormData();

  formData.append(
    "file",
    file,
    file.name
  );

  const response =
    await api.post<DatasetPreviewResponse>(
      "/api/v1/automl/preview",
      formData
    );

  return response.data;
}

/* ============================================================
   TRAIN
============================================================ */

/*
 * Browser uploads MUST use:
 *
 * POST /api/v1/automl/train
 *
 * /train/file expects a server-side filepath.
 */

export async function trainFromFile(
  file: File,
  targetColumn?: string,
  task?: AutoMLTask,
  optimizationMetric?: AutoMLOptimizationMetric
): Promise<AutoMLResult> {
  const formData =
    createFormData(
      file,
      targetColumn,
      task,
      optimizationMetric
    );

  const response =
    await api.post<AutoMLResult>(
      "/api/v1/automl/train",
      formData
    );

  return response.data;
}

/* ============================================================
   COMPLETE RESPONSE
============================================================ */

export async function getCompleteResponse(
  file: File,
  targetColumn?: string,
  task?: AutoMLTask,
  optimizationMetric?: AutoMLOptimizationMetric
): Promise<AutoMLResult> {
  return trainFromFile(
    file,
    targetColumn,
    task,
    optimizationMetric
  );
}

/* ============================================================
   DATASET INFO
============================================================ */

export async function getDatasetInfo(
  file: File
): Promise<DatasetInspectResponse> {
  return inspectDataset(file);
}

/* ============================================================
   DATASET COLUMNS
============================================================ */

export async function getDatasetColumns(
  file: File
): Promise<{
  columns: string[];
}> {
  const data =
    await inspectDataset(file);

  if (
    Array.isArray(
      data.columns
    )
  ) {
    return {
      columns: data.columns,
    };
  }

  if (
    data.columns_info &&
    typeof data.columns_info ===
      "object"
  ) {
    return {
      columns: Object.keys(
        data.columns_info
      ),
    };
  }

  if (
    data.dataset_summary
      ?.columns_info
  ) {
    return {
      columns: Object.keys(
        data.dataset_summary
          .columns_info
      ),
    };
  }

  return {
    columns: [],
  };
}

/* ============================================================
   LEGACY / COMPATIBILITY
============================================================ */

export async function getLeaderboard(
  file: File,
  targetColumn?: string,
  task?: AutoMLTask,
  optimizationMetric?: AutoMLOptimizationMetric
) {
  const result =
    await trainFromFile(
      file,
      targetColumn,
      task,
      optimizationMetric
    );

  return result.leaderboard ?? [];
}

export async function getBestModel(
  file: File,
  targetColumn?: string,
  task?: AutoMLTask,
  optimizationMetric?: AutoMLOptimizationMetric
) {
  const result =
    await trainFromFile(
      file,
      targetColumn,
      task,
      optimizationMetric
    );

  return result.best_model;
}

export async function getSummary(
  file: File,
  targetColumn?: string,
  task?: AutoMLTask,
  optimizationMetric?: AutoMLOptimizationMetric
) {
  const result =
    await trainFromFile(
      file,
      targetColumn,
      task,
      optimizationMetric
    );

  return {
    task: result.task,

    dataset_summary:
      result.dataset_summary,

    best_model:
      result.best_model,

    optimization_metric:
      result.optimization_metric ??
      result.selected_metric,
  };
}

export async function getStatistics(
  file: File,
  targetColumn?: string,
  task?: AutoMLTask,
  optimizationMetric?: AutoMLOptimizationMetric
) {
  const result =
    await trainFromFile(
      file,
      targetColumn,
      task,
      optimizationMetric
    );

  return (
    result.training_statistics ??
    result.statistics ??
    null
  );
}

export async function getRecommendations(
  file: File,
  targetColumn?: string,
  task?: AutoMLTask,
  optimizationMetric?: AutoMLOptimizationMetric
) {
  const result =
    await trainFromFile(
      file,
      targetColumn,
      task,
      optimizationMetric
    );

  return (
    result.recommendations ?? []
  );
}

/* ============================================================
   AUTOML INFO
============================================================ */

export async function getAutoMLInfo() {
  const response =
    await api.get(
      "/api/v1/automl/info"
    );

  return response.data;
}

/* ============================================================
   MODELS
============================================================ */

export async function getAutoMLModels() {
  const response =
    await api.get(
      "/api/v1/automl/models"
    );

  return response.data;
}

/* ============================================================
   HEALTH
============================================================ */

export async function getAutoMLHealth() {
  const response =
    await api.get(
      "/api/v1/automl/health"
    );

  return response.data;
}

/* ============================================================
   MANUAL PREDICTION
============================================================ */

function isPredictionResponse(
  value: unknown
): value is AutoMLPredictionResponse {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const response = value as Record<
    string,
    unknown
  >;

  return (
    typeof response.task === "string" &&
    typeof response.model_name === "string" &&
    typeof response.model_filename === "string" &&
    typeof response.rows === "number" &&
    Array.isArray(response.predictions)
  );
}

export async function predictValues(
  request: AutoMLPredictionRequest
): Promise<AutoMLPredictionResponse> {
  const response =
    await api.post<unknown>(
      "/api/v1/automl/predict/values",
      request
    );

  if (!isPredictionResponse(response.data)) {
    throw new Error(
      "The prediction service returned an invalid response."
    );
  }

  return response.data;
}

export function getPredictionErrorMessage(
  error: unknown
): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : "Prediction could not be completed.";
  }

  if (
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT"
  ) {
    return "The prediction request timed out. Please try again.";
  }

  if (!error.response) {
    return "Unable to reach the prediction service. Please check your connection and try again.";
  }

  const data = error.response
    .data as AutoMLPredictionErrorResponse | undefined;
  const detail = data?.detail;

  if (
    typeof detail === "object" &&
    detail !== null &&
    !Array.isArray(detail) &&
    detail.code === "PREDICTION_NOT_SUPPORTED"
  ) {
    return detail.message;
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => item.msg)
      .filter(
        (message): message is string =>
          typeof message === "string"
      );

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  switch (error.response.status) {
    case 400:
      return "The prediction request was invalid.";
    case 401:
      return "Your session is not authorized to make this prediction.";
    case 403:
      return "You do not have permission to make this prediction.";
    case 404:
      return "The saved model could not be found.";
    case 409:
      return "This saved model cannot process the prediction request.";
    case 422:
      return "The prediction values are invalid.";
    default:
      return "Prediction could not be completed. Please try again.";
  }
}
