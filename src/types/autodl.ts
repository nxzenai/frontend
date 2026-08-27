////////////////////////////////////////////////////////////
// Enums
////////////////////////////////////////////////////////////

export enum Modality {
    IMAGE = "image",
    TIME_SERIES = "time_series",
}

export enum DLArchitecture {
    CNN = "cnn",
    RESNET18 = "resnet18",
    RNN = "rnn",
}

////////////////////////////////////////////////////////////
// Job Create Request
////////////////////////////////////////////////////////////

export interface AutoDLJobCreateRequest {
    dataset_id: string;
    modality: Modality;
    architecture: DLArchitecture;
    target_column?: string;
    max_epochs: number;
}

////////////////////////////////////////////////////////////
// Metrics
////////////////////////////////////////////////////////////

export interface AutoDLJobMetrics {
    architecture?: string;
    modality?: string;
    accuracy?: number;
    final_loss?: number;
    confidence_level?: "High" | "Medium" | "Low" | string;
    summary?: string;
}

////////////////////////////////////////////////////////////
// Dataset Summary
////////////////////////////////////////////////////////////

export interface AutoDLDatasetSummary {
    modality?: string;

    total_samples?: number;
    training_samples?: number;
    validation_samples?: number;

    class_count?: number;
    classes?: string[];

    image_size?: number | null;
    input_channels?: number | null;

    batch_size?: number;

    file_size_kb?: number | null;
}

////////////////////////////////////////////////////////////
// Training Information
////////////////////////////////////////////////////////////

export interface AutoDLTrainingInfo {
    epochs_requested?: number;
    epochs_trained?: number;
    best_epoch?: number;

    early_stopped?: boolean;

    training_time?: number;
}

////////////////////////////////////////////////////////////
// Training History
////////////////////////////////////////////////////////////

export interface AutoDLTrainingHistory {
    train_loss?: number[];
    validation_loss?: number[];

    train_accuracy?: number[];
    validation_accuracy?: number[];
}

export interface AutoDLTrainingProgress {
    stage: string;
    current_epoch: number;
    total_epochs: number;
    percentage: number;
    latest_train_loss?: number | null;
    latest_validation_loss?: number | null;
    latest_train_accuracy?: number | null;
    latest_validation_accuracy?: number | null;
}

export interface AutoDLDatasetInspection {
    modality: Modality;
    filename: string;
    file_count?: number | null;
    class_counts: Record<string, number>;
    dimensions: Array<{ width: number; height: number; count: number }>;
    columns: string[];
    row_count?: number | null;
    missing_values: Record<string, number>;
    target_column?: string | null;
    target_valid?: boolean | null;
    target_error?: string | null;
}

////////////////////////////////////////////////////////////
// Artifact
////////////////////////////////////////////////////////////

export interface AutoDLArtifactInfo {
    // Training progress and inspection types are declared below.
    artifact_id?: string;

    model_name?: string;

    status?: string;

    artifact_path?: string;
    model_version_id?: string | null;
    artifact_integrity_sha256?: string | null;
}

////////////////////////////////////////////////////////////
// Job Response
////////////////////////////////////////////////////////////

export interface AutoDLJobResponse {
    job_id: string;

    status:
        | "queued"
        | "pending"
        | "running"
        | "completed"
        | "failed";

    architecture: DLArchitecture;

    modality: Modality;

    best_model_id?: string | null;

    metrics?: AutoDLJobMetrics | null;

    dataset_summary?: AutoDLDatasetSummary | null;

    training_info?: AutoDLTrainingInfo | null;

    training_history?: AutoDLTrainingHistory | null;

    progress?: AutoDLTrainingProgress | null;
    leaderboard?: Array<{
        rank?: number | null;
        model_name: string;
        score?: number | null;
        accuracy?: number | null;
        final_loss?: number | null;
        training_time?: number | null;
        success: boolean;
        error?: string | null;
    }>;
    evaluation?: { labels: string[]; confusion_matrix: number[][] } | null;

    artifact?: AutoDLArtifactInfo | null;

    created_at?: string | null;

    archived_at?: string | null;

    error?: string | null;
}

////////////////////////////////////////////////////////////
// Prediction
////////////////////////////////////////////////////////////

export interface AutoDLPredictionProbability {
    label: string;
    probability: number;
}

export interface AutoDLPredictionResponse {
    job_id: string;

    model_name: string;

    predicted_label: string;

    confidence: number;

    probabilities: AutoDLPredictionProbability[];
    explanation_status: string;
    gradcam_image?: string | null;
}
