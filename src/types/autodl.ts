////////////////////////////////////////////////////////////
// Enums
////////////////////////////////////////////////////////////

export enum Modality {
    IMAGE = "image",
    AUDIO = "audio",
    TIME_SERIES = "time_series",
}

export enum DLArchitecture {
    CNN = "cnn",
    RNN = "rnn",
    LSTM = "lstm",
    DAE = "dae",
    DBN = "dbn",
}

////////////////////////////////////////////////////////////
// Job Create Request
////////////////////////////////////////////////////////////

export interface AutoDLJobCreateRequest {
    dataset_id: string;
    modality: Modality;
    architecture: DLArchitecture;
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

////////////////////////////////////////////////////////////
// Artifact
////////////////////////////////////////////////////////////

export interface AutoDLArtifactInfo {
    artifact_id?: string;

    model_name?: string;

    status?: string;

    artifact_path?: string;
}

////////////////////////////////////////////////////////////
// Job Response
////////////////////////////////////////////////////////////

export interface AutoDLJobResponse {
    job_id: string;

    status:
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

    artifact?: AutoDLArtifactInfo | null;

    created_at?: string | null;
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
}