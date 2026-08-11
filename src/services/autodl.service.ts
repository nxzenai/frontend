import api from "@/lib/studioApi";

import {
    AutoDLJobResponse,
    Modality,
    DLArchitecture,
} from "@/types/autodl";

class AutoDLService {

    ////////////////////////////////////////////
    // Start Job
    ////////////////////////////////////////////

    async startJob(

        file: File,

        modality: Modality,

        architecture: DLArchitecture,

        max_epochs: number,

    ): Promise<AutoDLJobResponse> {

        const formData = new FormData();

        formData.append("file", file);

        formData.append("modality", modality);

        formData.append("architecture", architecture);

        formData.append("max_epochs", max_epochs.toString());

        const response =
            await api.post<AutoDLJobResponse>(
                "/autodl/jobs",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );

        return response.data;

    }

}

export default new AutoDLService();
