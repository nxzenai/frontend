export enum NLPTask {
  TEXT_CLASSIFICATION = "text_classification",
  SENTIMENT_ANALYSIS = "sentiment_analysis",
  INTENT_CLASSIFICATION = "intent_classification",
  SPAM_CLASSIFICATION = "spam_classification",
}

export enum NLPArchitecture {
  LOGISTIC_REGRESSION = "logistic_regression",
  LINEAR_SVM = "linear_svm",
  NAIVE_BAYES = "naive_bayes",
  SGD_CLASSIFIER = "sgd_classifier",
  LSTM = "lstm",
  BILSTM = "bilstm",
  GRU = "gru",
  MINILM = "minilm",
  DISTILBERT = "distilbert",
}

export interface AutoNLPTrainRequest {
  file: File;
  text_column: string;
  target_column: string;
  task: NLPTask;
  max_epochs: number;
  strategy: "auto" | "custom";
  candidate_architectures?: NLPArchitecture[];
  confirmed: boolean;
  label_display_mapping: Record<string, string>;
}

export interface AutoNLPDatasetInspection {
  filename: string;
  columns: string[];
  row_count: number;
  missing_values: Record<string, number>;
  text_candidates: string[];
  target_candidates: string[];
  text_column?: string | null;
  text_column_valid: boolean;
  target_column?: string | null;
  target_column_valid: boolean;
  class_balance: Record<string, number>;
  class_count: number;
  class_distribution: Record<string, number>;
  imbalance_ratio?: number | null;
  missing_text_count: number;
  blank_text_count: number;
  exact_duplicate_text_count: number;
  conflicting_duplicate_labels: number;
  approximate_vocabulary_size: number;
  recommended_sequence_length?: number | null;
  supported_task_candidates: string[];
  detected_task?: string | null;
  task_explanation?: string | null;
  text_length_summary: Record<string, number>;
  auto_candidate_architectures: NLPArchitecture[];
  label_display_mapping: Record<string, string>;
  label_mapping_reliable: boolean;
}

export interface AutoNLPMetrics {
  architecture?: string;
  input_tokens?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  macro_f1?: number;
  final_loss?: number;
  summary?: string;
  validation_metrics: Record<string, any>;
  test_metrics?: Record<string, any> | null;
  readiness?: "reliable" | "experimental" | "not_reliable";
  reliability_reason?: string;
}

export interface AutoNLPDatasetSummary {
  total_samples?: number;
  training_samples?: number;
  validation_samples?: number;
  test_samples?: number;
  independent_test_available: boolean;
  split_reason?: string;
  vocab_size?: number;
  max_sequence_length?: number;
  classes: string[];
  class_count?: number;
  text_column?: string;
  target_column?: string;
  cleaning_summary: Record<string, number>;
  embedding?: Record<string, any>;
  vectorizer?: Record<string, any> | null;
  label_display_mapping: Record<string, string>;
  readiness?: string;
  reliability_reason?: string;
}

export interface AutoNLPTrainingInfo {
  epochs_requested?: number;
  epochs_trained?: number;
  best_epoch?: number;
  early_stopped: boolean;
  training_time?: number;
  device?: string;
}

export interface AutoNLPTrainingHistory {
  train_loss: number[];
  validation_loss: number[];
  train_accuracy: number[];
  validation_accuracy: number[];
}

export interface AutoNLPClassMetric {
  class_id: number;
  label?: string;
  precision: number;
  recall: number;
  f1_score: number;
  support: number;
}

export interface AutoNLPEvaluation {
  labels: string[];
  confusion_matrix: number[][];
  class_metrics: AutoNLPClassMetric[];
  roc_auc?: number | null;
  roc_curve?: { false_positive_rate: number[]; true_positive_rate: number[]; thresholds: number[] } | null;
}

export interface AutoNLPArtifactInfo {
  model_name: string;
  status: string;
  artifact_path?: string | null;
  model_version_id?: string | null;
  artifact_integrity_sha256?: string | null;
}

export interface AutoNLPTrainResponse {
  model_id: string;
  status: "completed";
  task: NLPTask;
  architecture: NLPArchitecture;
  metrics: AutoNLPMetrics;
  dataset_summary: AutoNLPDatasetSummary;
  training_info: AutoNLPTrainingInfo;
  training_history: AutoNLPTrainingHistory;
  leaderboard: Array<{ rank?: number; model_name: string; score?: number; accuracy?: number; f1_score?: number; macro_f1?: number; success: boolean; error?: string; eligible_for_selection?: boolean; rejection_reason?: string }>;
  evaluation: AutoNLPEvaluation;
  artifact: AutoNLPArtifactInfo;
  requested_architectures: string[];
  attempted_architectures: string[];
  succeeded_architectures: string[];
  failed_architectures: Array<{ architecture: string; reason: string }>;
  rejected_architectures: Array<{ architecture: string; reason: string }>;
  winner_architecture: NLPArchitecture;
  created_at?: string;
}

export interface AutoNLPPredictResponse {
  model_id: string;
  model_name: string;
  predicted_label: string;
  technical_label?: string | null;
  model_score: number;
  score_is_calibrated: boolean;
  probabilities: Array<{ label: string; technical_label?: string | null; probability: number }>;
  readiness?: string;
  readiness_message?: string;
  vocabulary_coverage?: number | null;
  vocabulary_warning?: string | null;
  explanation_status: string;
}

export interface AutoNLPBatchPredictionResponse {
  model_id: string;
  text_column: string;
  total_rows: number;
  valid_rows: number;
  failed_rows: number;
  rows: Array<{ row_index: number; predicted_label?: string | null; technical_label?: string | null; model_score?: number | null; vocabulary_coverage?: number | null; error?: string | null }>;
}

export interface AutoNLPModelSummary {
  model_id: string;
  version: number;
  model_version_id: string;
  task: string;
  model_type: string;
  lifecycle_stage: string;
  artifact_available: boolean;
  readiness?: string;
  created_at: string;
}
