////////////////////////////////////////////////////////////
// Enums
////////////////////////////////////////////////////////////

export enum NLPTask {
    TEXT_CLASSIFICATION = "text_classification",
    SENTIMENT_ANALYSIS = "sentiment_analysis",
}

export enum NLPArchitecture {
    LSTM = "lstm",
    DISTILBERT = "distilbert",
}

export type AutoNLPJobStatus =
    | "queued"
    | "pending"
    | "running"
    | "completed"
    | "failed";


////////////////////////////////////////////////////////////
// Job Create Request
////////////////////////////////////////////////////////////

export interface AutoNLPJobCreateRequest {
    file: File;

    text_column: string;

    target_column: string;

    task: NLPTask;

    max_epochs: number;
    candidate_architectures?: NLPArchitecture[];
}


////////////////////////////////////////////////////////////
// Metrics
////////////////////////////////////////////////////////////

export interface AutoNLPJobMetrics {
    architecture?: string;

    input_tokens?: number;

    accuracy?: number;

    precision?: number;

    recall?: number;

    f1_score?: number;

    final_loss?: number;

    confidence_level?: string;

    summary?: string;
}


////////////////////////////////////////////////////////////
// Dataset Summary
////////////////////////////////////////////////////////////

export interface AutoNLPDatasetSummary {
    total_samples?: number;

    training_samples?: number;

    test_samples?: number;

    vocab_size?: number;

    classes: string[];

    class_count?: number;

    target_column?: string;
}


////////////////////////////////////////////////////////////
// Training Information
////////////////////////////////////////////////////////////

export interface AutoNLPTrainingInfo {
    epochs_requested?: number;

    epochs_trained?: number;

    best_epoch?: number;

    early_stopped: boolean;

    training_time?: number;
}


////////////////////////////////////////////////////////////
// Training History
////////////////////////////////////////////////////////////

export interface AutoNLPTrainingHistory {
    train_loss: number[];

    validation_loss: number[];

    train_accuracy: number[];

    validation_accuracy: number[];
}


export interface AutoNLPTrainingProgress {
    stage: string;
    current_epoch: number;
    total_epochs: number;
    percentage: number;
    latest_train_loss?: number | null;
    latest_validation_loss?: number | null;
    latest_train_accuracy?: number | null;
    latest_validation_accuracy?: number | null;
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
    text_length_summary: Record<string, number>;
}

////////////////////////////////////////////////////////////
// Per-Class Evaluation
////////////////////////////////////////////////////////////

export interface AutoNLPClassMetric {
    class_id: number;

    label: string;

    precision: number;

    recall: number;

    f1_score: number;

    support: number;
}


////////////////////////////////////////////////////////////
// Model Evaluation
////////////////////////////////////////////////////////////

export interface AutoNLPEvaluation {
    labels: string[];

    confusion_matrix: number[][];

    class_metrics: AutoNLPClassMetric[];
    roc_auc?: number | null;
    roc_curve?: {
        false_positive_rate: number[];
        true_positive_rate: number[];
        thresholds: number[];
    } | null;
}


////////////////////////////////////////////////////////////
// Model Artifact
////////////////////////////////////////////////////////////

export interface AutoNLPArtifactInfo {
    artifact_id?: string | null;

    model_name: string;

    status: string;

    artifact_path?: string | null;
    model_version_id?: string | null;
    artifact_integrity_sha256?: string | null;
}


////////////////////////////////////////////////////////////
// Prediction Request
////////////////////////////////////////////////////////////

export interface AutoNLPPredictRequest {
    text: string;
}


////////////////////////////////////////////////////////////
// Prediction Probability
////////////////////////////////////////////////////////////

export interface AutoNLPClassProbability {
    label: string;

    probability: number;
}


////////////////////////////////////////////////////////////
// Prediction Response
////////////////////////////////////////////////////////////

export interface AutoNLPPredictResponse {
    job_id: string;

    model_name: string;

    predicted_label: string;

    confidence: number;

    probabilities: AutoNLPClassProbability[];
    explanation_status: string;
    token_attributions: Array<{ token: string; attribution: number }>;
}


export interface AutoNLPBatchPredictionResponse {
    job_id: string;
    text_column: string;
    total_rows: number;
    valid_rows: number;
    failed_rows: number;
    rows: Array<{
        row_index: number;
        predicted_label?: string | null;
        confidence?: number | null;
        error?: string | null;
    }>;
}

////////////////////////////////////////////////////////////
// Job Response
////////////////////////////////////////////////////////////

export interface AutoNLPJobResponse {
    job_id: string;

    status: AutoNLPJobStatus;

    task: NLPTask;

    architecture: NLPArchitecture;

    best_model_id?: string | null;

    metrics?: AutoNLPJobMetrics | null;

    dataset_summary?: AutoNLPDatasetSummary | null;

    training_info?: AutoNLPTrainingInfo | null;

    training_history?: AutoNLPTrainingHistory | null;

    progress?: AutoNLPTrainingProgress | null;
    leaderboard?: Array<{
        rank?: number | null;
        model_name: string;
        score?: number | null;
        accuracy?: number | null;
        f1_score?: number | null;
        success: boolean;
        error?: string | null;
    }>;

    evaluation?: AutoNLPEvaluation | null;

    artifact?: AutoNLPArtifactInfo | null;

    created_at?: string | null;

    archived_at?: string | null;

    error?: string | null;
}
