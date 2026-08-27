import api from "@/lib/studioApi";

import {
    AutoNLPJobCreateRequest,
    AutoNLPJobResponse,
    AutoNLPDatasetInspection,
    AutoNLPBatchPredictionResponse,
    AutoNLPPredictRequest,
    AutoNLPPredictResponse,
} from "@/types/autonlp";


class AutoNLPService {

    async inspect(
        file: File,
        textColumn?: string,
        targetColumn?: string,
    ): Promise<AutoNLPDatasetInspection> {
        const formData = new FormData();
        formData.append("file", file);
        if (textColumn) formData.append("text_column", textColumn);
        if (targetColumn) formData.append("target_column", targetColumn);
        return (await api.post<AutoNLPDatasetInspection>(
            "/autonlp/inspect",
            formData,
        )).data;
    }

    async listJobs(): Promise<AutoNLPJobResponse[]> {
        return (await api.get<AutoNLPJobResponse[]>("/autonlp/jobs")).data;
    }

    async archiveJob(jobId: string): Promise<void> {
        await api.delete(`/autonlp/jobs/${jobId}`);
    }

    async predictBatch(
        jobId: string,
        file: File,
        textColumn: string,
    ): Promise<AutoNLPBatchPredictionResponse> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("text_column", textColumn);
        return (await api.post<AutoNLPBatchPredictionResponse>(
            `/autonlp/jobs/${jobId}/predict/csv`,
            formData,
        )).data;
    }

    ////////////////////////////////////////////////////////////
    // Start AutoNLP Training Job
    ////////////////////////////////////////////////////////////

    async startJob(
        request: AutoNLPJobCreateRequest,
    ): Promise<AutoNLPJobResponse> {

        ////////////////////////////////////////////////////////
        // Build Multipart Form
        ////////////////////////////////////////////////////////

        const formData = new FormData();

        formData.append(
            "file",
            request.file,
            request.file.name,
        );

        formData.append(
            "text_column",
            request.text_column,
        );

        formData.append(
            "target_column",
            request.target_column,
        );

        formData.append(
            "task",
            request.task,
        );

        formData.append(
            "max_epochs",
            String(
                request.max_epochs,
            ),
        );
        if (request.candidate_architectures?.length) {
            formData.append("candidate_architectures", request.candidate_architectures.join(","));
        }


        ////////////////////////////////////////////////////////
        // Request
        ////////////////////////////////////////////////////////

        const response =
            await api.post<AutoNLPJobResponse>(
                "/autonlp/jobs",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                },
            );


        ////////////////////////////////////////////////////////
        // Response
        ////////////////////////////////////////////////////////

        return response.data;
    }


    ////////////////////////////////////////////////////////////
    // Get AutoNLP Job
    ////////////////////////////////////////////////////////////

    async getJob(
        jobId: string,
    ): Promise<AutoNLPJobResponse> {

        const response =
            await api.get<AutoNLPJobResponse>(
                `/autonlp/jobs/${jobId}`,
            );

        return response.data;
    }


    ////////////////////////////////////////////////////////////
    // Predict Using Saved LSTM Artifact
    ////////////////////////////////////////////////////////////

    async predict(
        jobId: string,
        request: AutoNLPPredictRequest,
    ): Promise<AutoNLPPredictResponse> {

        const response =
            await api.post<AutoNLPPredictResponse>(
                `/autonlp/jobs/${jobId}/predict`,
                request,
            );

        return response.data;
    }
}


export default new AutoNLPService();
