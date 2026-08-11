////////////////////////////////////////////////////////////
// Enums
////////////////////////////////////////////////////////////

export enum NLPTask {
    TEXT_CLASSIFICATION = "text_classification",
    NAMED_ENTITY_RECOGNITION = "ner",
}

export enum NLPArchitecture {
    LSTM = "lstm",
    RNN = "rnn",
}

////////////////////////////////////////////////////////////
// Job Create Request
////////////////////////////////////////////////////////////

export interface AutoNLPJobCreateRequest {

    dataset_id: string;

    text_column: string;

    target_column?: string;

    task: NLPTask;

    architecture: NLPArchitecture;

    max_epochs: number;
}

////////////////////////////////////////////////////////////
// Job Metrics
////////////////////////////////////////////////////////////

export interface AutoNLPJobMetrics {

    accuracy?: number;

    precision?: number;

    recall?: number;

    final_loss?: number;

    architecture?: NLPArchitecture;

    input_tokens?: number;

    confidence_level?: "High" | "Medium" | "Low";

    summary?: string;
}

////////////////////////////////////////////////////////////
// Job Response
////////////////////////////////////////////////////////////

export interface AutoNLPJobResponse {

    job_id: string;

    status: "pending" | "running" | "completed" | "failed";

    task: NLPTask;

    architecture: NLPArchitecture;

    metrics?: AutoNLPJobMetrics;
}
