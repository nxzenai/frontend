"use client";

import { useCallback, useEffect, useState } from "react";

import DatasetService from "@/services/dataset.service";

import {
    Dataset,
    DatasetPreview,
    DatasetSummary,
} from "@/types/dataset";

export default function useDatasets() {

    //////////////////////////////////////////////////////////
    // State
    //////////////////////////////////////////////////////////

    const [datasets, setDatasets] = useState<
        Dataset[]
    >([]);

    const [selectedDataset, setSelectedDataset] =
        useState<Dataset | null>(null);

    const [summary, setSummary] =
        useState<DatasetSummary | null>(null);

    const [preview, setPreview] =
        useState<DatasetPreview | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [uploading, setUploading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    //////////////////////////////////////////////////////////
    // Load Datasets
    //////////////////////////////////////////////////////////

    const loadDatasets =
        useCallback(async () => {

            try {

                setLoading(true);

                setError(null);

                const response =
                    await DatasetService.list();

                setDatasets(
                    response.items
                );

            } catch (err: any) {

                console.error(err);

                setError(
                    err?.response?.data?.message ??
                    "Failed to load datasets."
                );

            } finally {

                setLoading(false);

            }

        }, []);

    //////////////////////////////////////////////////////////
    // Upload Dataset
    //////////////////////////////////////////////////////////

    const uploadDataset =
        useCallback(async (file: File) => {

            try {

                setUploading(true);

                setError(null);

                const uploaded =
                    await DatasetService.upload(file);

                await loadDatasets();

                return uploaded;

            } catch (err: any) {

                console.error(err);

                setError(
                    err?.response?.data?.message ??
                    "Upload failed."
                );

                throw err;

            } finally {

                setUploading(false);

            }

        }, [loadDatasets]);

    //////////////////////////////////////////////////////////
    // Select Dataset
    //////////////////////////////////////////////////////////

    const selectDataset =
        useCallback(async (dataset: Dataset) => {

            try {

                setLoading(true);

                setSelectedDataset(dataset);

                const [
                    summaryResponse,
                    previewResponse,
                ] = await Promise.all([

                    DatasetService.summary(
                        dataset.id
                    ),

                    DatasetService.preview(
                        dataset.id
                    ),

                ]);

                setSummary(
                    summaryResponse
                );

                setPreview(
                    previewResponse
                );

            } catch (err: any) {

                console.error(err);

                setError(
                    err?.response?.data?.message ??
                    "Unable to load dataset."
                );

            } finally {

                setLoading(false);

            }

        }, []);

    //////////////////////////////////////////////////////////
    // Delete Dataset
    //////////////////////////////////////////////////////////

    const deleteDataset =
        useCallback(async (datasetId: string) => {

            try {

                await DatasetService.delete(
                    datasetId
                );

                if (
                    selectedDataset?.id === datasetId
                ) {

                    setSelectedDataset(null);

                    setSummary(null);

                    setPreview(null);

                }

                await loadDatasets();

            } catch (err: any) {

                console.error(err);

                setError(
                    err?.response?.data?.message ??
                    "Unable to delete dataset."
                );

            }

        }, [
            loadDatasets,
            selectedDataset,
        ]);

    //////////////////////////////////////////////////////////
    // Refresh
    //////////////////////////////////////////////////////////

    const refresh =
        useCallback(async () => {

            await loadDatasets();

        }, [
            loadDatasets,
        ]);

    //////////////////////////////////////////////////////////
    // Initial Load
    //////////////////////////////////////////////////////////

    useEffect(() => {

        loadDatasets();

    }, [
        loadDatasets,
    ]);

    //////////////////////////////////////////////////////////
    // Return
    //////////////////////////////////////////////////////////

    return {

        datasets,

        selectedDataset,

        summary,

        preview,

        loading,

        uploading,

        error,

        uploadDataset,

        selectDataset,

        deleteDataset,

        refresh,

    };

}