import api from "@/lib/studioApi";

import {
    AutoNLPJobCreateRequest,
    AutoNLPJobResponse,
    AutoNLPPredictRequest,
    AutoNLPPredictResponse,
} from "@/types/autonlp";


class AutoNLPService {

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