"use client";

import useDatasets from "@/hooks/useDatasets";

import DatasetUpload from "./DatasetUpload";
import DatasetExplorer from "./DatasetExplorer";
import DatasetSummary from "./DatasetSummary";
import DatasetPreview from "./DatasetPreview";

export default function DatasetWorkspace() {

    //////////////////////////////////////////////////////////
    // Hook
    //////////////////////////////////////////////////////////

    const {

        datasets,

        selectedDataset,

        summary,

        preview,

        uploading,

        loading,

        error,

        uploadDataset,

        selectDataset,

    } = useDatasets();

    //////////////////////////////////////////////////////////
    // Upload Handler
    //////////////////////////////////////////////////////////

    async function handleUpload(
        file: File,
    ) {

        await uploadDataset(file);

    }

    //////////////////////////////////////////////////////////
    // UI
    //////////////////////////////////////////////////////////

    return (

        <div className="space-y-8">

            {/* Upload */}

            <DatasetUpload

                uploading={uploading}

                onUpload={handleUpload}

            />

            {/* Error */}

            {error && (

                <div
                    className="
                        rounded-xl
                        border
                        border-red-500/30
                        bg-red-500/10
                        p-4
                        text-red-400
                    "
                >

                    {error}

                </div>

            )}

            {/* Layout */}

            <div
                className="
                    grid
                    gap-6
                    xl:grid-cols-12
                "
            >

                {/* Explorer */}

                <div
                    className="
                        xl:col-span-3
                    "
                >

                    <DatasetExplorer

                        datasets={datasets}

                        selectedDataset={
                            selectedDataset
                        }

                        onSelect={
                            selectDataset
                        }

                    />

                </div>

                {/* Right */}

                <div
                    className="
                        space-y-6
                        xl:col-span-9
                    "
                >

                    <DatasetSummary
                        summary={summary}
                    />

                    <DatasetPreview
                        preview={preview}
                    />

                </div>

            </div>

            {/* Loading */}

            {loading && (

                <div
                    className="
                        text-center
                        text-slate-400
                    "
                >

                    Loading dataset...

                </div>

            )}

        </div>

    );

}