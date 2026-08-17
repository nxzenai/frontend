import { api } from "@/lib/api";

import type {
  AutoMLResult,
  AutoMLTask,
  AutoMLOptimizationMetric,
  DatasetInspectResponse,
  DatasetPreviewResponse,
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