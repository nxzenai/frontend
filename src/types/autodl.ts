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
// Job Metrics
////////////////////////////////////////////////////////////

export interface AutoDLJobMetrics {

    accuracy?: number;

    final_loss?: number;

    architecture?: DLArchitecture;

    modality?: Modality;

    confidence_level?: "High" | "Medium" | "Low";

    summary?: string;
}

////////////////////////////////////////////////////////////
// Job Response
////////////////////////////////////////////////////////////

export interface AutoDLJobResponse {

    job_id: string;

    status: "pending" | "running" | "completed" | "failed";

    architecture: DLArchitecture;

    modality: Modality;

    metrics?: AutoDLJobMetrics;
}
