////////////////////////////////////////////////////////////
// Enums
////////////////////////////////////////////////////////////

export enum NLPTask {
    TEXT_CLASSIFICATION = "text_classification",
    SENTIMENT_ANALYSIS = "sentiment_analysis",
    NAMED_ENTITY_RECOGNITION = "ner",
}

export enum NLPArchitecture {
    LSTM = "lstm",
    RNN = "rnn",
}

export type AutoNLPJobStatus =
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

    architecture: NLPArchitecture;

    max_epochs: number;
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

    evaluation?: AutoNLPEvaluation | null;

    created_at?: string | null;
}