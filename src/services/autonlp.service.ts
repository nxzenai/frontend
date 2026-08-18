import api from "@/lib/studioApi";

import {
    AutoNLPJobCreateRequest,
    AutoNLPJobResponse,
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
            "architecture",
            request.architecture,
        );

        formData.append(
            "max_epochs",
            String(request.max_epochs),
        );


        ////////////////////////////////////////////////////////
        // Request
        ////////////////////////////////////////////////////////

        const response =
            await api.post<AutoNLPJobResponse>(
                "/autonlp/jobs",
                formData,
                {
                    /*
                     * studioApi normally uses:
                     *
                     * Content-Type: application/json
                     *
                     * AutoNLP is a file-upload endpoint,
                     * so this request must be multipart.
                     *
                     * Axios/browser will generate the
                     * multipart boundary automatically.
                     */
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );


        ////////////////////////////////////////////////////////
        // Response
        ////////////////////////////////////////////////////////

        return response.data;
    }
}


export default new AutoNLPService();