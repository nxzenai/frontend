export type AutoMLTask =
  | "auto"
  | "classification"
  | "regression"
  | "clustering"
  | "anomaly"
  | "dimensionality";

export interface DatasetColumnInfo {
  dtype?: string;
  missing?: number;
  unique?: number;
  [key: string]: any;
}

export interface DatasetSummary {
  rows?: number;
  columns?: number;
  memory_usage_bytes?: number;
  missing_values?: number;
  target_column?: string | null;

  columns_info?: Record<
    string,
    DatasetColumnInfo
  >;

  target?: {
    dtype?: string;
    unique?: number;
    missing?: number;
    [key: string]: any;
  };

  [key: string]: any;
}

export interface DatasetInspectResponse {
  task?: string;
  dataset_summary?: DatasetSummary;

  rows?: number;
  memory_usage_bytes?: number;
  missing_values?: number;
  target_column?: string | null;

  columns?: string[];

  columns_info?: Record<
    string,
    DatasetColumnInfo
  >;

  [key: string]: any;
}

export interface DatasetPreviewResponse {
  preview?: Record<string, any>[];
  rows?: Record<string, any>[];
  data?: Record<string, any>[];

  [key: string]: any;
}

export interface LeaderboardEntry {
  rank?: number;

  model?: string;
  model_name?: string;

  status?: string;
  success?: boolean;

  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1_score?: number | null;
  roc_auc?: number | null;

  r2_score?: number | null;
  mae?: number | null;
  mse?: number | null;
  rmse?: number | null;
  mape?: number | null;

  silhouette_score?: number | null;
  calinski_harabasz_score?: number | null;
  davies_bouldin_score?: number | null;

  explained_variance?: number | null;

  n_clusters?: number | null;

  training_time?: number | null;

  error?: string | null;
  skip_reason?: string | null;

  [key: string]: any;
}

export interface BestModel {
  available?: boolean;

  task?: string;

  model_name: string;

  training_time?: number | null;

  success?: boolean;

  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1_score?: number | null;
  roc_auc?: number | null;

  r2_score?: number | null;
  mae?: number | null;
  mse?: number | null;
  rmse?: number | null;
  mape?: number | null;

  silhouette_score?: number | null;
  calinski_harabasz_score?: number | null;
  davies_bouldin_score?: number | null;

  [key: string]: any;
}

export interface AutoMLStatistics {
  task?: string;

  models_trained?: number;
  successful_models?: number;
  failed_models?: number;

  best_model?: string;

  artifact_available?: boolean;

  [key: string]: any;
}

export interface AutoMLResult {
  task: string;

  dataset_summary?: DatasetSummary;

  leaderboard: LeaderboardEntry[];

  best_model: BestModel | null;

  training_statistics?: AutoMLStatistics;

  statistics?: AutoMLStatistics;

  recommendations?: string[];

  artifact?: {
    available?: boolean;
    model_name?: string;
    artifact_version?: string;
    task?: string;
    [key: string]: any;
  };

  skipped_algorithms?: string[];
  excluded_algorithms?: string[];

  [key: string]: any;
}

export interface AutoMLTrainRequest {
  file: File;

  targetColumn?: string;

  task?: AutoMLTask;
}