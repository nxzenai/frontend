"use client";

import type { DatasetPreview as DatasetPreviewData } from "@/types/dataset";

import {
    Table2,
} from "lucide-react";

interface Props {

    preview: DatasetPreviewData | null;

}

export default function DatasetPreview({

    preview,

}: Props) {

    ////////////////////////////////////////////////////////////
    // Empty State
    ////////////////////////////////////////////////////////////

    if (!preview) {

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

                <Table2
                    size={50}
                    className="
                        mx-auto
                        text-slate-700
                    "
                />

                <h2
                    className="
                        mt-5
                        text-xl
                        font-semibold
                        text-white
                    "
                >

                    Dataset Preview

                </h2>

                <p
                    className="
                        mt-3
                        text-slate-400
                    "
                >

                    Select a dataset to preview its
                    contents.

                </p>

            </div>

        );

    }

    ////////////////////////////////////////////////////////////
    // UI
    ////////////////////////////////////////////////////////////

    return (

        <div
            className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-800
                bg-slate-900
            "
        >

            {/* Header */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-slate-800
                    px-6
                    py-5
                "
            >

                <div>

                    <h2
                        className="
                            text-xl
                            font-semibold
                            text-white
                        "
                    >

                        Dataset Preview

                    </h2>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-slate-400
                        "
                    >

                        Showing

                        {" "}

                        {preview.preview_rows}

                        {" "}

                        of

                        {" "}

                        {preview.total_rows.toLocaleString()}

                        {" "}

                        rows

                    </p>

                </div>

            </div>

            {/* Table */}

            <div
                className="
                    overflow-auto
                    max-h-[600px]
                "
            >

                <table
                    className="
                        min-w-full
                        border-collapse
                    "
                >

                    {/* Header */}

                    <thead
                        className="
                            sticky
                            top-0
                            z-20
                            bg-slate-950
                        "
                    >

                        <tr>

                            <th
                                className="
                                    border-b
                                    border-slate-800
                                    px-4
                                    py-3
                                    text-left
                                    text-sm
                                    font-semibold
                                    text-slate-400
                                "
                            >

                                #

                            </th>

                            {preview.columns.map(
                                (
                                    column,
                                ) => (

                                    <th

                                        key={column}

                                        className="
                                            whitespace-nowrap
                                            border-b
                                            border-slate-800
                                            px-4
                                            py-3
                                            text-left
                                            text-sm
                                            font-semibold
                                            text-slate-300
                                        "
                                    >

                                        {column}

                                    </th>

                                )
                            )}

                        </tr>

                    </thead>

                    {/* Body */}

                    <tbody>

                        {preview.rows.map(
                            (
                                row,
                                index,
                            ) => (

                                <tr

                                    key={index}

                                    className="
                                        border-b
                                        border-slate-800
                                        hover:bg-slate-800/40
                                    "
                                >

                                    {/* Row Number */}

                                    <td
                                        className="
                                            whitespace-nowrap
                                            px-4
                                            py-3
                                            text-sm
                                            text-slate-500
                                        "
                                    >

                                        {index + 1}

                                    </td>

                                    {/* Cells */}

                                    {preview.columns.map(
                                        (
                                            column,
                                        ) => (

                                            <td

                                                key={`${index}-${column}`}

                                                className="
                                                    max-w-[240px]
                                                    truncate
                                                    whitespace-nowrap
                                                    px-4
                                                    py-3
                                                    text-sm
                                                    text-slate-300
                                                "

                                                title={
                                                    row[
                                                        column
                                                    ]?.toString() ??
                                                    ""
                                                }

                                            >

                                                {

                                                    row[
                                                        column
                                                    ] ?? "-"

                                                }

                                            </td>

                                        )
                                    )}

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );

}
