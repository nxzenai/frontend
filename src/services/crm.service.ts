import api from "@/lib/studioApi";

import {

    Lead,

    LeadListResponse,

    DashboardResponse,

    CRMOverview,

} from "@/types/crm";

class CRMService {

    ////////////////////////////////////////////
    // Dashboard
    ////////////////////////////////////////////

    async dashboard():

    Promise<DashboardResponse> {

        const response =
            await api.get(
                "/crm/dashboard"
            );

        return response.data;

    }

    ////////////////////////////////////////////
    // Overview
    ////////////////////////////////////////////

    async overview():

    Promise<CRMOverview> {

        const response =
            await api.get(
                "/crm/overview"
            );

        return response.data;

    }

    ////////////////////////////////////////////
    // List Leads
    ////////////////////////////////////////////

    async list(

        page = 1,

        search = "",

        status = "",

        priority = "",

    ): Promise<LeadListResponse> {

        const response =
            await api.get("/crm/leads", {

                params: {

                    page,

                    search,

                    status,

                    priority,

                },

            });

        return response.data;

    }

}

export default new CRMService();
