import api from "@/lib/studioApi";

import {
    AutoDLJobResponse,
    AutoDLPredictionResponse,
    Modality,
    DLArchitecture,
} from "@/types/autodl";


class AutoDLService {

    ////////////////////////////////////////////////////////////
    // Start Training Job
    ////////////////////////////////////////////////////////////

    async startJob(
        file: File,
        modality: Modality,
        architecture: DLArchitecture,
        max_epochs: number,
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