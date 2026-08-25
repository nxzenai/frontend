export type AutoMLTask =
  | "auto"
  | "classification"
  | "regression"
  | "clustering"
  | "anomaly"
  | "dimensionality";

/* ============================================================
   OPTIMIZATION METRICS
============================================================ */

export type ClassificationMetric =
  | "f1_score"
  | "accuracy"
  | "precision"
  | "recall"
  | "roc_auc";

export type RegressionMetric =
  | "r2_score"
  | "mae"
  | "mse"
  | "rmse"
  | "mape"
  | "explained_variance";

export type ClusteringMetric =
  | "silhouette_score"
  | "calinski_harabasz_score"
  | "davies_bouldin_score";

export type AutoMLOptimizationMetric =
  | ClassificationMetric
  | RegressionMetric
  | ClusteringMetric;

export type ClusterCountMode =
  | "automatic"
  | "custom";

export interface ClusteringTrainingConfig {
  cluster_count_mode: ClusterCountMode;
  number_of_clusters: number | null;
  require_prediction_support: boolean;
}

export interface ClusteringTrainingResult {
  cluster_count_mode: ClusterCountMode;
  requested_number_of_clusters: number | null;
  effective_number_of_clusters: number | null;
  require_prediction_support: boolean;
  prediction_supported: boolean;
}

export interface ClusteringLimits {
  minimum_number_of_clusters: number;
  maximum_number_of_clusters: number;
  default_cluster_count_mode: ClusterCountMode;
  default_require_prediction_support: boolean;
}

export interface AutoMLInformation {
  metadata?: {
    clustering?: ClusteringLimits;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/* ============================================================
   DATASET
============================================================ */

export interface DatasetColumnInfo {
  dtype?: string;
  missing?: number;
  unique?: number;
  nullable?: boolean;
  required?: boolean;
  categories?: PredictionValue[];
  allowed_values?: PredictionValue[];
  values?: PredictionValue[];
  description?: string;
  role?: "feature" | "target" | "identifier" | "ignored";
  missing_percentage?: number;

  [key: string]: any;
}

export interface DatasetSummary {
  /*
   * IMPORTANT:
   *
   * This is the dataset summary returned by AutoML.
   *
   * columns = NUMBER of columns.
   *
   * Do NOT change this to string[].
   */
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

/* ============================================================
   DATASET INSPECTION
============================================================ */

export interface DatasetInspectResponse {
  task?: string;

  dataset_summary?: DatasetSummary;

  rows?: number;

  memory_usage_bytes?: number;

  missing_values?: number;

  target_column?: string | null;

  /*
   * IMPORTANT:
   *
   * Inspect response columns = actual column names.
   */
  columns?: string[];

  columns_info?: Record<
    string,
    DatasetColumnInfo
  >;

  [key: string]: any;
}

/* ============================================================
   DATASET PREVIEW
============================================================ */

export interface DatasetPreviewResponse {
  preview?: Record<string, any>[];

  rows?: Record<string, any>[];

  data?: Record<string, any>[];

  [key: string]: any;
}

/* ============================================================
   LEADERBOARD
============================================================ */

export interface LeaderboardEntry {
  rank?: number;

  /*
   * Backend currently may send either.
   */
  model?: string;

  model_name?: string;

  status?: string;

  success?: boolean;

  /* Classification */
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1_score?: number | null;
  roc_auc?: number | null;

  /* Regression */
  r2_score?: number | null;
  mae?: number | null;
  mse?: number | null;
  rmse?: number | null;
  mape?: number | null;

  /* Clustering */
  silhouette_score?: number | null;
  calinski_harabasz_score?: number | null;
  davies_bouldin_score?: number | null;

  explained_variance?: number | null;

  n_clusters?: number | null;

  requested_number_of_clusters?: number | null;
  effective_number_of_clusters?: number | null;
  supports_custom_cluster_count?: boolean;
  prediction_supported?: boolean;

  training_time?: number | null;

  error?: string | null;

  skip_reason?: string | null;

  [key: string]: any;
}

/* ============================================================
   BEST MODEL
============================================================ */

export interface BestModel {
  available?: boolean;

  task?: string;

  model_name: string;

  training_time?: number | null;

  success?: boolean;

  /* Classification */
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1_score?: number | null;
  roc_auc?: number | null;

  /* Regression */
  r2_score?: number | null;
  mae?: number | null;
  mse?: number | null;
  rmse?: number | null;
  mape?: number | null;

  /* Clustering */
  silhouette_score?: number | null;
  calinski_harabasz_score?: number | null;
  davies_bouldin_score?: number | null;

  requested_number_of_clusters?: number | null;
  effective_number_of_clusters?: number | null;
  supports_custom_cluster_count?: boolean;
  prediction_supported?: boolean;

  explained_variance?: number | null;

  [key: string]: any;
}

/* ============================================================
   STATISTICS
============================================================ */

export interface AutoMLStatistics {
  task?: string;

  models_trained?: number;

  successful_models?: number;

  failed_models?: number;

  best_model?: string;

  artifact_available?: boolean;

  /*
   * Future backend support.
   */
  optimization_metric?: AutoMLOptimizationMetric | string;

  [key: string]: any;
}

/* ============================================================
   RESULT
============================================================ */

export interface AutoMLResult {
  task: string;

  dataset_summary?: DatasetSummary;

  leaderboard: LeaderboardEntry[];

  best_model: BestModel | null;

  training_statistics?: AutoMLStatistics;

  statistics?: AutoMLStatistics;

  recommendations?: string[];

  artifact?: AutoMLArtifact;

  clustering?: ClusteringTrainingResult;

  visual_results?: AutoMLVisualResults;

  skipped_algorithms?: string[];

  excluded_algorithms?: string[];

  /*
   * Future/backend metric support.
   */
  optimization_metric?: AutoMLOptimizationMetric | string;

  selected_metric?: AutoMLOptimizationMetric | string;

  [key: string]: any;
}

/* ============================================================
   TRAIN REQUEST
============================================================ */

export interface AutoMLTrainRequest {
  file: File;

  targetColumn?: string;

  task?: AutoMLTask;

  optimizationMetric?: AutoMLOptimizationMetric;

  clusteringConfig?: ClusteringTrainingConfig;
}

/* ============================================================
   SAVED ARTIFACT AND MANUAL PREDICTION
============================================================ */

export type PredictionValue =
  | string
  | number
  | boolean
  | null;

export type PredictionRow = Record<
  string,
  PredictionValue
>;

export interface AutoMLArtifact {
  available?: boolean;
  model_name?: string;
  artifact_version?: string;
  task?: string;
  model_filename?: string;
  prediction_supported?: boolean;
  prediction_unavailable_reason?: string | null;
  required_features?: string[];
  feature_importance?: FeatureImportance[];
  prediction_schema?: AutoMLPredictionSchema;
  ignored_identifiers?: string[];

  [key: string]: unknown;
}

export interface AutoMLPredictionRequest {
  model_filename: string;
  rows: PredictionRow[];
}

export interface AutoMLPredictionResponse {
  task: string;
  model_name: string;
  model_filename: string;
  rows: number;
  predictions: PredictionValue[];
  classes?: PredictionValue[];
  probabilities?: number[][];
  number_of_clusters?: number | null;
  prediction_meanings?: string[];
  prediction_labels?: string[];
  segment_labels?: string[];
  technical_clusters?: string[];
  prediction_profiles?: string[];
  cluster_profiles?: Record<string, {
    segment_label: string;
    profile: string;
    characteristics?: string[];
  }>;
  encoded_predictions?: Array<number | null>;
  prediction_confidences?: Array<number | null>;
  target_metadata?: DatasetColumnInfo & {
    name?: string;
    unit?: string | null;
  };

  [key: string]: unknown;
}

export interface AutoMLPredictionSchema {
  expected_features?: string[];
  required_fields?: string[];
  datatypes?: Record<string, string | null>;
  columns?: Record<string, DatasetColumnInfo>;
  ignored_identifiers?: string[];
  target?: DatasetColumnInfo & {
    name?: string;
    unit?: string | null;
  };
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  source: "feature_importances_" | "coef_" | string;
}

export interface AutoMLVisualResults {
  roc_curves?: Array<{
    class_name: PredictionValue;
    auc: number;
    points: Array<{ fpr: number; tpr: number }>;
  }>;
  regression_points?: Array<{
    actual: number;
    predicted: number;
    residual: number;
  }>;
  cluster_points?: Array<{
    x: number;
    y: number;
    cluster: PredictionValue;
  }>;
  reduced_with_pca?: boolean;
}

export interface AutoMLPredictionUnsupportedDetail {
  code: "PREDICTION_NOT_SUPPORTED";
  message: string;
  model_name: string;
  task: string;
}

export interface AutoMLPredictionErrorResponse {
  detail?:
    | string
    | AutoMLPredictionUnsupportedDetail
    | Array<{
        msg?: string;
        loc?: Array<string | number>;
      }>;
  message?: string;
  error?: string;
}
