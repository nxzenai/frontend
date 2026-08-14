import { api } from "@/lib/api";

import type {
  AutoMLResult,
  DatasetColumnResponse,
  LeaderboardEntry,
  BestModel,
} from "@/types/automl";

/**
 * ============================================================
 * DATASET COLUMNS
 * ============================================================
 *
 * Backend:
 * POST /api/v1/automl/dataset/columns
 */
export async function getDatasetColumns(
  file: File
): Promise<DatasetColumnResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response =
    await api.post<DatasetColumnResponse>(
      "/api/v1/automl/dataset/columns",
      formData
    );

  return response.data;
}

/**
 * ============================================================
 * TRAIN AUTOML
 * ============================================================
 *
 * Backend:
 * POST /api/v1/automl/train
 *
 * Use this when only the standard training response
 * is required.
 */
export async function trainAutoML(
  file: File,
  targetColumn: string
): Promise<AutoMLResult> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("target_column", targetColumn);

  const response =
    await api.post<AutoMLResult>(
      "/api/v1/automl/train",
      formData
    );

  return response.data;
}

/**
 * ============================================================
 * COMPLETE AUTOML RESPONSE
 * ============================================================
 *
 * Backend:
 * POST /api/v1/automl/complete
 *
 * This is the endpoint used by:
 *
 * AutoMLWorkspace
 *      ↓
 * useAutoML
 *      ↓
 * getCompleteResponse
 *      ↓
 * /api/v1/automl/complete
 *
 * DO NOT change this to /jobs.
 */
export async function getCompleteResponse(
  file: File,
  targetColumn: string
): Promise<AutoMLResult> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("target_column", targetColumn);

  const response =
    await api.post<AutoMLResult>(
      "/api/v1/automl/complete",
      formData
    );

  return response.data;
}

/**
 * ============================================================
 * DATASET INFORMATION
 * ============================================================
 *
 * Backend:
 * POST /api/v1/automl/dataset/info
 */
export async function getDatasetInfo(
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const response =
    await api.post(
      "/api/v1/automl/dataset/info",
      formData
    );

  return response.data;
}

/**
 * ============================================================
 * DATASET SHAPE
 * ============================================================
 *
 * Backend:
 * POST /api/v1/automl/dataset/shape
 */
export async function getDatasetShape(
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const response =
    await api.post(
      "/api/v1/automl/dataset/shape",
      formData
    );

  return response.data;
}

/**
 * ============================================================
 * DATASET PREVIEW
 * ============================================================
 *
 * Backend:
 * POST /api/v1/automl/dataset/preview
 */
export async function getDatasetPreview(
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const response =
    await api.post(
      "/api/v1/automl/dataset/preview",
      formData
    );

  return response.data;
}

/**
 * ============================================================
 * LEADERBOARD
 * ============================================================
 *
 * Backend:
 * POST /api/v1/automl/leaderboard
 */
export async function getLeaderboard(
  file: File,
  targetColumn: string
): Promise<LeaderboardEntry[]> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("target_column", targetColumn);

  const response =
    await api.post<LeaderboardEntry[]>(
      "/api/v1/automl/leaderboard",
      formData
    );

  return response.data;
}

/**
 * ============================================================
 * BEST MODEL
 * ============================================================
 *
 * Backend:
 * POST /api/v1/automl/best-model
 */
export async function getBestModel(
  file: File,
  targetColumn: string
): Promise<BestModel> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("target_column", targetColumn);

  const response =
    await api.post<BestModel>(
      "/api/v1/automl/best-model",
      formData
    );

  return response.data;
}

/**
 * ============================================================
 * EXECUTIVE SUMMARY
 * ============================================================
 *
 * Backend:
 * POST /api/v1/automl/summary
 */
export async function getSummary(
  file: File,
  targetColumn: string
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("target_column", targetColumn);

  const response =
    await api.post(
      "/api/v1/automl/summary",
      formData
    );

  return response.data;
}

/**
 * ============================================================
 * TRAINING STATISTICS
 * ============================================================
 *
 * Backend:
 * POST /api/v1/automl/statistics
 */
export async function getStatistics(
  file: File,
  targetColumn: string
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("target_column", targetColumn);

  const response =
    await api.post(
      "/api/v1/automl/statistics",
      formData
    );

  return response.data;
}

/**
 * ============================================================
 * RECOMMENDATIONS
 * ============================================================
 *
 * Backend:
 * POST /api/v1/automl/recommendations
 */
export async function getRecommendations(
  file: File,
  targetColumn: string
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("target_column", targetColumn);

  const response =
    await api.post(
      "/api/v1/automl/recommendations",
      formData
    );

  return response.data;
}