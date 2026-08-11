import api from "@/lib/studioApi";

import {
    SQLExecuteResponse,
    SchemaResponse,
} from "@/types/sql";

class SQLService {

    //////////////////////////////////////////////////////
    // Execute Query
    //////////////////////////////////////////////////////

    async execute(
        query: string,
    ): Promise<SQLExecuteResponse> {

        const response = await api.post(
            "/sql/execute",
            {
                query,
            },
        );

        return response.data.data;
    }

    //////////////////////////////////////////////////////
    // Load Schema
    //////////////////////////////////////////////////////

    async schema(): Promise<SchemaResponse> {

        const response = await api.get(
            "/sql/schema",
        );

        return response.data.data;
    }

}

export default new SQLService();
