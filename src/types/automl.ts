export type AutoMLTask =
  | "auto"
  | "classification"
  | "regression"
  | "clustering"
  | "anomaly"
  | "dimensionality";

export interface DatasetInfo {
  rows: number;
  columns: number;
}

export interface DatasetPreviewRow {
  [key: string]: any;
}

export interface DatasetColumnResponse {
  columns: string[];
}

export interface AutoMLTrainRequest {
  file: File;
  targetColumn: string;
}

export interface LeaderboardEntry {
  rank: number;

  model_name: string;

  accuracy?: number;

  precision?: number;

  recall?: number;

  f1_score?: number;

  roc_auc?: number;

  r2_score?: number;

  mae?: number;

  mse?: number;

  rmse?: number;

  silhouette_score?: number;

  calinski_harabasz_score?: number;

  davies_bouldin_score?: number;

  explained_variance?: number;

  training_time: number;

  success: boolean;

  error?: string;
}

export interface BestModel {
  model_name: string;

  training_time: number;

  success: boolean;

  [key: string]: any;
}

export interface AutoMLSummary {
  [key: string]: any;
}

export interface AutoMLStatistics {
  [key: string]: any;
}

export interface RecommendationResponse {
  recommendations: string[];
}

export interface AutoMLResult {
  task: string;

  leaderboard: LeaderboardEntry[];

  best_model: BestModel;

  dataset_summary: AutoMLSummary;

  statistics: AutoMLStatistics;

  recommendations: string[];

  [key: string]: any;
}