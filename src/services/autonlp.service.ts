import api from "@/lib/studioApi";

import {
    AutoNLPJobCreateRequest,
    AutoNLPJobResponse,
} from "@/types/autonlp";

class AutoNLPService {

    ////////////////////////////////////////////
    // Start Job
    ////////////////////////////////////////////

    async startJob(

        request: AutoNLPJobCreateRequest,

    ): Promise<AutoNLPJobResponse> {

        const response =
            await api.post<AutoNLPJobResponse>(
                "/autonlp/jobs",
                request,
            );

        return response.data;

    }

}

export default new AutoNLPService();
