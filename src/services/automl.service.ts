import { api } from "@/lib/api";

import type {
  AutoMLResult,
  DatasetColumnResponse,
  LeaderboardEntry,
  BestModel,
} from "@/types/automl";

export async function getDatasetColumns(
  file: File
): Promise<DatasetColumnResponse> {
  const formData = new FormData();

  formData.append("file", file, file.name);

  const response = await api.post<DatasetColumnResponse>(
    "/api/v1/automl/dataset/columns",
    formData
  );

  return response.data;
}

export async function trainAutoML(
  file: File,
  targetColumn: string
): Promise<AutoMLResult> {
  const formData = new FormData();

  formData.append("file", file, file.name);
  formData.append("target_column", targetColumn);

  const response = await api.post<AutoMLResult>(
    "/api/v1/automl/train",
    formData
  );

  return response.data;
}

export async function getCompleteResponse(
  file: File,
  targetColumn: string
): Promise<AutoMLResult> {
  const formData = new FormData();

  formData.append("file", file, file.name);
  formData.append("target_column", targetColumn);

  const response = await api.post<AutoMLResult>(
    "/api/v1/automl/complete",
    formData
  );

  return response.data;
}

export async function getDatasetInfo(file: File) {
  const formData = new FormData();

  formData.append("file", file, file.name);

  const response = await api.post(
    "/api/v1/automl/dataset/info",
    formData
  );

  return response.data;
}

export async function getDatasetShape(file: File) {
  const formData = new FormData();

  formData.append("file", file, file.name);

  const response = await api.post(
    "/api/v1/automl/dataset/shape",
    formData
  );

  return response.data;
}

export async function getDatasetPreview(file: File) {
  const formData = new FormData();

  formData.append("file", file, file.name);

  const response = await api.post(
    "/api/v1/automl/dataset/preview",
    formData
  );

  return response.data;
}

export async function getLeaderboard(
  file: File,
  targetColumn: string
): Promise<LeaderboardEntry[]> {
  const formData = new FormData();

  formData.append("file", file, file.name);
  formData.append("target_column", targetColumn);

  const response = await api.post(
    "/api/v1/automl/leaderboard",
    formData
  );

  return response.data;
}

export async function getBestModel(
  file: File,
  targetColumn: string
): Promise<BestModel> {
  const formData = new FormData();

  formData.append("file", file, file.name);
  formData.append("target_column", targetColumn);

  const response = await api.post(
    "/api/v1/automl/best-model",
    formData
  );

  return response.data;
}

export async function getSummary(
  file: File,
  targetColumn: string
) {
  const formData = new FormData();

  formData.append("file", file, file.name);
  formData.append("target_column", targetColumn);

  const response = await api.post(
    "/api/v1/automl/summary",
    formData
  );

  return response.data;
}

export async function getStatistics(
  file: File,
  targetColumn: string
) {
  const formData = new FormData();

  formData.append("file", file, file.name);
  formData.append("target_column", targetColumn);

  const response = await api.post(
    "/api/v1/automl/statistics",
    formData
  );

  return response.data;
}

export async function getRecommendations(
  file: File,
  targetColumn: string
) {
  const formData = new FormData();

  formData.append("file", file, file.name);
  formData.append("target_column", targetColumn);

  const response = await api.post(
    "/api/v1/automl/recommendations",
    formData
  );

  return response.data;
}