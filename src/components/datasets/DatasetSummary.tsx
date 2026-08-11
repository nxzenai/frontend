"use client";

import {
    Database,
    Columns3,
    AlertTriangle,
    HardDrive,
    FileSpreadsheet,
} from "lucide-react";

import type { DatasetSummary as DatasetSummaryData } from "@/types/dataset";

interface Props {
    summary: DatasetSummaryData | null;
}

export default function DatasetSummary({
    summary,
}: Props) {

    ////////////////////////////////////////////////////////
    // Empty State
    ////////////////////////////////////////////////////////

    if (!summary) {

        return (

            <div
                className="
                    rounded-2xl
                    border
                    border-slate-800
                    bg-slate-900
                    p-10
                    text-center
                "
            >

                <Database
                    size={48}
                    className="
                        mx-auto
                        text-slate-700
                    "
                />

                <h3
                    className="
                        mt-5
                        text-xl
                        font-semibold
                        text-white
                    "
                >

                    No Dataset Selected

                </h3>

                <p
                    className="
                        mt-3
                        text-slate-400
                    "
                >

                    Upload or select a dataset to view
                    its statistics.

                </p>

            </div>

        );

    }

    ////////////////////////////////////////////////////////
    // UI
    ////////////////////////////////////////////////////////

    return (

        <div
            className="
                rounded-2xl
                border
                border-slate-800
                bg-slate-900
                overflow-hidden
            "
        >

            {/* Header */}

            <div
                className="
                    border-b
                    border-slate-800
                    px-6
                    py-5
                "
            >

                <h2
                    className="
                        text-xl
                        font-semibold
                        text-white
                    "
                >

                    Dataset Summary

                </h2>

                <p
                    className="
                        mt-1
                        text-sm
                        text-slate-400
                    "
                >

                    Quick overview of the selected dataset

                </p>

            </div>

            {/* Cards */}

            <div
                className="
                    grid
                    gap-5
                    p-6
                    md:grid-cols-2
                    xl:grid-cols-5
                "
            >

                {/* Rows */}

                <SummaryCard
                    icon={
                        <Database
                            className="text-blue-400"
                        />
                    }
                    label="Rows"
                    value={summary.rows.toLocaleString()}
                />

                {/* Columns */}

                <SummaryCard
                    icon={
                        <Columns3
                            className="text-green-400"
                        />
                    }
                    label="Columns"
                    value={summary.columns}
                />

                {/* Missing */}

                <SummaryCard
                    icon={
                        <AlertTriangle
                            className="text-amber-400"
                        />
                    }
                    label="Missing Values"
                    value={summary.missing_values}
                />

                {/* Memory */}

                <SummaryCard
                    icon={
                        <HardDrive
                            className="text-purple-400"
                        />
                    }
                    label="Memory Usage"
                    value={summary.memory_usage}
                />

                {/* File */}

                <SummaryCard
                    icon={
                        <FileSpreadsheet
                            className="text-cyan-400"
                        />
                    }
                    label="File Size"
                    value={
                        `${(
                            summary.file_size /
                            1024 /
                            1024
                        ).toFixed(2)} MB`
                    }
                />

            </div>

            {/* Columns */}

            <div
                className="
                    border-t
                    border-slate-800
                    px-6
                    py-6
                "
            >

                <h3
                    className="
                        mb-4
                        text-lg
                        font-semibold
                        text-white
                    "
                >

                    Dataset Columns

                </h3>

                <div
                    className="
                        flex
                        flex-wrap
                        gap-2
                    "
                >

                    {summary.column_names.map(
                        (column) => (

                            <span
                                key={column}
                                className="
                                    rounded-full
                                    bg-slate-800
                                    px-3
                                    py-1
                                    text-sm
                                    text-slate-300
                                "
                            >

                                {column}

                            </span>

                        )
                    )}

                </div>

            </div>

        </div>

    );

}

////////////////////////////////////////////////////////
// Summary Card
////////////////////////////////////////////////////////

interface SummaryCardProps {

    icon: React.ReactNode;

    label: string;

    value: string | number;

}

function SummaryCard({

    icon,

    label,

    value,

}: SummaryCardProps) {

    return (

        <div
            className="
                rounded-xl
                border
                border-slate-800
                bg-slate-950
                p-5
            "
        >

            <div
                className="
                    flex
                    items-center
                    justify-between
                "
            >

                {icon}

            </div>

            <p
                className="
                    mt-4
                    text-sm
                    text-slate-400
                "
            >

                {label}

            </p>

            <h3
                className="
                    mt-2
                    text-2xl
                    font-bold
                    text-white
                "
            >

                {value}

            </h3>

        </div>

    );

}
