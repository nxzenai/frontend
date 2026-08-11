import api from "@/lib/studioApi";

import {
    Dataset,
    DatasetListResponse,
    DatasetPreview,
    DatasetSummary,
    DatasetUploadResponse,
} from "@/types/dataset";

class DatasetService {

    //////////////////////////////////////////////////////////
    // Upload Dataset
    //////////////////////////////////////////////////////////

    async upload(
        file: File,
    ): Promise<DatasetUploadResponse> {

        const formData = new FormData();

        formData.append(
            "file",
            file,
        );

        const response =
            await api.post(
                "/datasets/upload",
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                },
            );

        return response.data.data;
    }

    //////////////////////////////////////////////////////////
    // List Datasets
    //////////////////////////////////////////////////////////

    async list(
        page = 1,
        search = "",
    ): Promise<DatasetListResponse> {

        const response =
            await api.get(
                "/datasets",
                {
                    params: {
                        page,
                        search,
                    },
                },
            );

        return response.data.data;
    }

    //////////////////////////////////////////////////////////
    // Get Dataset
    //////////////////////////////////////////////////////////

    async get(
        datasetId: string,
    ): Promise<Dataset> {

        const response =
            await api.get(
                `/datasets/${datasetId}`,
            );

        return response.data.data;
    }

    //////////////////////////////////////////////////////////
    // Dataset Preview
    //////////////////////////////////////////////////////////

    async preview(
        datasetId: string,
    ): Promise<DatasetPreview> {

        const response =
            await api.get(
                `/datasets/${datasetId}/preview`,
            );

        return response.data.data;
    }

    //////////////////////////////////////////////////////////
    // Dataset Summary
    //////////////////////////////////////////////////////////

    async summary(
        datasetId: string,
    ): Promise<DatasetSummary> {

        const response =
            await api.get(
                `/datasets/${datasetId}/summary`,
            );

        return response.data.data;
    }

    //////////////////////////////////////////////////////////
    // Delete Dataset
    //////////////////////////////////////////////////////////

    async delete(
        datasetId: string,
    ): Promise<void> {

        await api.delete(
            `/datasets/${datasetId}`,
        );
    }

}

export default new DatasetService();
