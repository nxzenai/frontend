export type AutoDLV2Task =
  | "image_classification"
  | "time_series_classification"
  | "time_series_regression"
  | "tabular_classification"
  | "tabular_regression";

export interface V2Capability {
  key: string;
  display_name: string;
  supported_tasks: AutoDLV2Task[];
  available: boolean;
}

export interface V2Inspection {
  run_id: string;
  dataset_kind: "image" | "tabular";
  filename: string;
  summary: string;
  image?: {
    total_images: number;
    valid_images: number;
    invalid_images: number;
    classes: string[];
    class_balance: Array<{ class_name: string; image_count: number; percentage: number }>;
    dataset_size_category?: "very_small" | "small" | "medium" | "large" | null;
    images_per_class: Record<string, number>;
    validation_sample_count: number;
    minimum_class_count: number;
    minimum_validation_samples_per_class: number;
    class_balance_ratio: number;
    evaluation_reliability: "low" | "moderate" | "high";
    reliability_reason: string;
    beginner_guidance: string;
  } | null;
  tabular?: {
    rows: number;
    columns: number;
    column_names: string[];
    candidate_identifiers: string[];
    candidate_targets: string[];
    timestamp_candidates: string[];
    missing_values: Record<string, number>;
    target_suitability?: {
      column: string;
      suitable: boolean;
      likely_problem_type: string;
      explanation: string;
    } | null;
    timestamp_quality?: {
      column: string;
      total_rows: number;
      valid_timestamps: number;
      missing_timestamps: number;
      invalid_timestamps: number;
      invalid_percentage: number;
      parsing_mode: string;
      usable_for_ordering: boolean;
      safe_automatic_cleaning: boolean;
      cleaning_requires_confirmation: boolean;
      cleaning_blocked: boolean;
      row_order_allowed: boolean;
    } | null;
  } | null;
  task_intelligence: {
    detected_task?: AutoDLV2Task | null;
    display_name: string;
    confidence: number;
    explanation: string;
    requires_confirmation: boolean;
  };
}

export interface V2TrainingStatus {
  run_id: string;
  status: string;
  stage: string;
  percentage: number;
  message: string;
  selected_models: string[];
  current_model?: string | null;
  current_epoch?: number | null;
  total_epochs?: number | null;
}

export interface V2Result {
  run_id: string;
  problem: { task: AutoDLV2Task; display_name: string; explanation: string };
  target: { name: string; kind: string; explanation: string };
  training_status: { status: string; stage: string; message: string };
  models_tried: string[];
  models_tried_explanation: string;
  best_model: { model_id: string; name: string; version: string; explanation: string };
  performance: {
    key_metric: string;
    value: number;
    accuracy?: number;
    mae?: number;
    rmse?: number;
    r2?: number;
    validation_metrics?: Record<string, any> | null;
    test_metrics?: Record<string, any> | null;
    validation_sample_count?: number | null;
    test_sample_count?: number | null;
    evaluation_reliability?: "low" | "moderate" | "high" | null;
    reliability_reason?: string | null;
    robustness_accuracy?: number | null;
    production_readiness?: "verified" | "experimental" | "not_reliable" | null;
    explanation: string;
  };
  leaderboard: Array<{
    rank: number;
    model: string;
    key_metric_name: string;
    key_metric_value: number;
    accuracy?: number;
    mae?: number;
    r2?: number;
    selected_winner: boolean;
  }>;
  visual_output?: {
    kind: string;
    points?: Array<{ index: number; actual: number; predicted: number; residual: number }>;
  };
  latest_prediction?: Record<string, unknown> | null;
  prediction_ready: boolean;
}

export interface V2AdvancedDetails {
  run_id: string;
  advanced_details: Record<string, unknown>;
  model?: {
    task: AutoDLV2Task;
    architecture: Record<string, unknown>;
    hyperparameters: Record<string, unknown>;
    full_metrics: Record<string, any>;
    validation_metrics?: Record<string, any> | null;
    independent_test_metrics?: Record<string, any> | null;
    leaderboard?: Array<Record<string, any>>;
    evaluation_visualization?: {
      kind: string;
      points?: Array<{ index: number; actual: number; predicted: number; residual: number }>;
      residual_summary?: { mean: number; mean_absolute: number; rmse: number };
    } | null;
    training_curves: {
      train_loss?: number[];
      validation_loss?: number[];
      train_accuracy?: number[];
      validation_accuracy?: number[];
    };
    confusion_matrix?: number[][] | null;
    class_mapping?: string[];
    preprocessing: Record<string, unknown>;
    experiment_metadata: Record<string, unknown>;
    dataset_hash: string;
    artifact_hash: string;
    device: string;
    runtime: Record<string, unknown>;
  };
}

export interface V2Prediction {
  prediction_id: string;
  input_mode: string;
  prediction?: Record<string, any> | null;
  predictions?: Array<Record<string, any>>;
  errors?: Array<{ row: number; message: string }>;
  summary?: string;
  human_explanation: string;
  latency_ms?: number;
  batch_status?: "completed" | "partial" | "failed";
  export_available?: boolean;
  explainability?: { status: string; method?: string; image?: string | null; message?: string };
}

export interface V2PredictionHistory {
  _id: string;
  run_id: string;
  model_id: string;
  task: AutoDLV2Task;
  created_at: string;
  input_mode: string;
  row_count: number;
  observation_count?: number;
  batch_status: string;
  latency_ms?: number | null;
  error_count: number;
  row_errors?: Array<{ row?: number; message: string }>;
  primary_result: Record<string, any>;
  output_preview?: Array<Record<string, any>>;
  input_metadata?: Record<string, any>;
  output_summary?: Record<string, any>;
  ground_truth_summary?: Record<string, any> | null;
  export_available?: boolean;
}

export interface V2ModelSummary {
  _id: string;
  display_name: string;
  model_version_id: string;
  stage: "draft" | "validated" | "production" | "archived";
  stage_before_archive?: "draft" | "validated" | "production" | null;
  is_winner: boolean;
  task: AutoDLV2Task;
  production_readiness?: "verified" | "experimental" | "not_reliable" | null;
  eligible_for_winner?: boolean;
}

export interface V2Readiness {
  status: string;
  supported_tasks: AutoDLV2Task[];
  available_models: string[];
  device_policy: string;
  selected_device: string;
  persistence: {
    mongodb: string;
    gridfs: string;
    registry: string;
    owner_model_count: number;
    prediction_ready: boolean;
  };
  default_version: string;
  v1_rollback_available: boolean;
}

export interface V2Monitoring {
  status: string;
  prediction_requests: number;
  prediction_rows: number;
  prediction_observations: number;
  row_errors: number;
  average_latency_ms?: number | null;
  ground_truth_records: number;
  comparison_hooks?: {
    training_profiles_available: number;
    prediction_profiles_available: number;
    status: string;
  };
  drift: { status: string; evaluated: boolean; message: string };
}
