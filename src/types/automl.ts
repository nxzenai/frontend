// frontend-main/src/types/automl.ts

/* ============================================================
   AUTOML TASKS
============================================================ */

export type AutoMLTask =
  | "auto"
  | "classification"
  | "regression"
  | "clustering"
  | "anomaly"
  | "dimensionality";


/* ============================================================
   DATASET COLUMN INFORMATION
============================================================ */

export interface DatasetColumnInfo {
  dtype?: string;

  missing?: number;

  unique?: number;

  [key: string]: any;
}


/* ============================================================
   TARGET INFORMATION
============================================================ */

export interface DatasetTargetInfo {
  dtype?: string;

  unique?: number;

  missing?: number;

  [key: string]: any;
}


/* ============================================================
   DATASET SUMMARY
===============================================================
   IMPORTANT:

   DatasetSummary.columns is a NUMBER.

   Example:

   {
     rows: 1460,
     columns: 81
   }

   Do NOT use DatasetSummary.columns.length.
============================================================ */

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

  target?: DatasetTargetInfo;

  [key: string]: any;
}


/* ============================================================
   DATASET INSPECTION RESPONSE
===============================================================
   IMPORTANT:

   DatasetInspectResponse.columns is an ARRAY containing
   actual column names.

   Example:

   {
     columns: [
       "Id",
       "MSSubClass",
       "MSZoning",
       "SalePrice"
     ]
   }

   This is intentionally different from:

   DatasetSummary.columns -> number
============================================================ */

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


/* ============================================================
   DATASET PREVIEW
============================================================ */

export type DatasetPreviewRow =
  Record<string, any>;


export interface DatasetPreviewResponse {
  preview?: DatasetPreviewRow[];

  rows?: DatasetPreviewRow[];

  data?: DatasetPreviewRow[];

  count?: number;

  [key: string]: any;
}


/* ============================================================
   DATASET COLUMNS RESPONSE
============================================================ */

export interface DatasetColumnResponse {
  columns: string[];
}


/* ============================================================
   DATASET INFO
============================================================ */

export interface DatasetInfo {
  rows: number;

  columns: number;
}


/* ============================================================
   LEADERBOARD ENTRY
===============================================================
   Supports:

   Classification
   Regression
   Clustering
   Anomaly
   Dimensionality Reduction
============================================================ */

export interface LeaderboardEntry {
  rank?: number;

  /*
   * Backend may use either:
   *
   * model
   *
   * or:
   *
   * model_name
   */

  model?: string;

  model_name?: string;


  /* ----------------------------------------------------------
     General
  ---------------------------------------------------------- */

  status?: string;

  success?: boolean;

  training_time?: number | null;

  error?: string | null;

  skip_reason?: string | null;


  /* ----------------------------------------------------------
     Classification Metrics
  ---------------------------------------------------------- */

  accuracy?: number | null;

  precision?: number | null;

  recall?: number | null;

  f1_score?: number | null;

  roc_auc?: number | null;


  /* ----------------------------------------------------------
     Regression Metrics
  ---------------------------------------------------------- */

  r2_score?: number | null;

  mae?: number | null;

  mse?: number | null;

  rmse?: number | null;

  mape?: number | null;


  /* ----------------------------------------------------------
     Clustering Metrics
  ---------------------------------------------------------- */

  silhouette_score?: number | null;

  calinski_harabasz_score?: number | null;

  davies_bouldin_score?: number | null;

  n_clusters?: number | null;


  /* ----------------------------------------------------------
     Dimensionality Reduction
  ---------------------------------------------------------- */

  explained_variance?: number | null;


  /* ----------------------------------------------------------
     Future / Additional Metrics
  ---------------------------------------------------------- */

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


  /* ----------------------------------------------------------
     Classification
  ---------------------------------------------------------- */

  accuracy?: number | null;

  precision?: number | null;

  recall?: number | null;

  f1_score?: number | null;

  roc_auc?: number | null;


  /* ----------------------------------------------------------
     Regression
  ---------------------------------------------------------- */

  r2_score?: number | null;

  mae?: number | null;

  mse?: number | null;

  rmse?: number | null;

  mape?: number | null;


  /* ----------------------------------------------------------
     Clustering
  ---------------------------------------------------------- */

  silhouette_score?: number | null;

  calinski_harabasz_score?: number | null;

  davies_bouldin_score?: number | null;


  /* ----------------------------------------------------------
     Future / Additional Data
  ---------------------------------------------------------- */

  [key: string]: any;
}


/* ============================================================
   AUTOML STATISTICS
============================================================ */

export interface AutoMLStatistics {
  task?: string;

  models_trained?: number;

  successful_models?: number;

  failed_models?: number;

  best_model?: string;

  artifact_available?: boolean;

  [key: string]: any;
}


/* ============================================================
   RECOMMENDATIONS
============================================================ */

export interface RecommendationResponse {
  recommendations: string[];
}


/* ============================================================
   MODEL ARTIFACT
============================================================ */

export interface AutoMLArtifact {
  available?: boolean;

  model_name?: string;

  artifact_version?: string;

  task?: string;

  [key: string]: any;
}


/* ============================================================
   COMPLETE AUTOML RESULT
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

  skipped_algorithms?: string[];

  excluded_algorithms?: string[];

  /*
   * Some backend responses may contain additional analysis
   * information. Keep this optional so the frontend remains
   * compatible with those responses.
   */

  analysis?: {
    summary?: Record<string, any>;

    recommendations?: string[];

    [key: string]: any;
  };

  summary?: Record<string, any>;

  [key: string]: any;
}


/* ============================================================
   AUTOML TRAIN REQUEST
============================================================ */

export interface AutoMLTrainRequest {
  file: File;

  targetColumn?: string;

  task?: AutoMLTask;
}


/* ============================================================
   DATASET UPLOAD RESPONSE
============================================================ */

export interface DatasetUploadResponse {
  id: string;

  filename: string;

  original_filename: string;

  extension: string;

  size: number;

  uploaded_at: string;
}