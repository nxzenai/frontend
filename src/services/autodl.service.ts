import api from "@/lib/studioApi";

import {
    AutoDLJobResponse,
    AutoDLDatasetInspection,
    AutoDLPredictionResponse,
    Modality,
    DLArchitecture,
} from "@/types/autodl";


class AutoDLService {

    async inspect(
        file: File,
        modality: Modality,
        targetColumn?: string,
    ): Promise<AutoDLDatasetInspection> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("modality", modality);
        if (targetColumn) formData.append("target_column", targetColumn);
        return (await api.post<AutoDLDatasetInspection>(
            "/autodl/inspect",
            formData,
        )).data;
    }

    async listJobs(): Promise<AutoDLJobResponse[]> {
        return (await api.get<AutoDLJobResponse[]>("/autodl/jobs")).data;
    }

    async archiveJob(jobId: string): Promise<void> {
        await api.delete(`/autodl/jobs/${jobId}`);
    }

    ////////////////////////////////////////////////////////////
    // Start Training Job
    ////////////////////////////////////////////////////////////

    async startJob(
        file: File,
        modality: Modality,
        architecture: DLArchitecture,
        max_epochs: number,
        target_column?: string,
        candidate_architectures?: DLArchitecture[],
    ): Promise<AutoDLJobResponse> {

        const formData = new FormData();

        formData.append(
            "file",
            file,
        );

        formData.append(
            "modality",
            modality,
        );

        formData.append(
            "architecture",
            architecture,
        );

        formData.append(
            "max_epochs",
            max_epochs.toString(),
        );

        if (target_column) {
            formData.append(
                "target_column",
                target_column,
            );
        }
        if (candidate_architectures?.length) {
            formData.append("candidate_architectures", candidate_architectures.join(","));
        }


        const response =
            await api.post<AutoDLJobResponse>(
                "/autodl/jobs",
                formData,
            );


        return response.data;
    }


    ////////////////////////////////////////////////////////////
    // Get Job
    ////////////////////////////////////////////////////////////

    async getJob(
        jobId: string,
    ): Promise<AutoDLJobResponse> {

        const response =
            await api.get<AutoDLJobResponse>(
                `/autodl/jobs/${jobId}`,
            );


        return response.data;
    }


    ////////////////////////////////////////////////////////////
    // Predict Using Trained Model
    ////////////////////////////////////////////////////////////

    async predict(
        jobId: string,
        file: File,
    ): Promise<AutoDLPredictionResponse> {

        const formData =
            new FormData();


        formData.append(
            "file",
            file,
        );


        const response =
            await api.post<AutoDLPredictionResponse>(
                `/autodl/jobs/${jobId}/predict`,
                formData,
            );


        return response.data;
    }
}


export default new AutoDLService();
