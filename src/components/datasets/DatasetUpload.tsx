"use client";

import { useRef } from "react";

import {
    UploadCloud,
    FileSpreadsheet,
    Loader2,
} from "lucide-react";

interface Props {

    uploading: boolean;

    onUpload: (
        file: File
    ) => Promise<void>;

}

export default function DatasetUpload({

    uploading,

    onUpload,

}: Props) {

    //////////////////////////////////////////////////////////
    // File Input
    //////////////////////////////////////////////////////////

    const inputRef =
        useRef<HTMLInputElement>(null);

    //////////////////////////////////////////////////////////
    // Upload
    //////////////////////////////////////////////////////////

    async function handleFile(
        file: File,
    ) {

        if (!file) return;

        const extension =
            file.name
                .split(".")
                .pop()
                ?.toLowerCase();

        if (
            ![
                "csv",
                "xls",
                "xlsx",
            ].includes(
                extension ?? ""
            )
        ) {

            alert(
                "Only CSV, XLS and XLSX files are supported."
            );

            return;

        }

        await onUpload(file);

    }

    //////////////////////////////////////////////////////////
    // Drag
    //////////////////////////////////////////////////////////

    function onDrop(
        e: React.DragEvent<
            HTMLDivElement
        >,
    ) {

        e.preventDefault();

        const file =
            e.dataTransfer.files[0];

        if (file) {

            handleFile(file);

        }

    }

    //////////////////////////////////////////////////////////
    // UI
    //////////////////////////////////////////////////////////

    return (

        <div
            onDragOver={(e) =>
                e.preventDefault()
            }
            onDrop={onDrop}
            className="
                rounded-2xl
                border-2
                border-dashed
                border-slate-700
                bg-slate-900
                p-10
                transition
                hover:border-blue-500
            "
        >

            <input

                ref={inputRef}

                hidden

                type="file"

                accept=".csv,.xls,.xlsx"

                onChange={(e) => {

                    const file =
                        e.target.files?.[0];

                    if (file) {

                        handleFile(file);

                    }

                }}

            />

            <div
                className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                "
            >

                {uploading ? (

                    <Loader2
                        size={52}
                        className="
                            animate-spin
                            text-blue-500
                        "
                    />

                ) : (

                    <UploadCloud
                        size={52}
                        className="
                            text-blue-500
                        "
                    />

                )}

                <h2
                    className="
                        mt-6
                        text-2xl
                        font-bold
                        text-white
                    "
                >

                    Upload Dataset

                </h2>

                <p
                    className="
                        mt-3
                        max-w-xl
                        text-slate-400
                    "
                >

                    Drag & Drop your dataset here
                    or browse your computer.

                </p>

                <button

                    disabled={uploading}

                    onClick={() =>
                        inputRef.current?.click()
                    }

                    className="
                        mt-8
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        bg-blue-600
                        px-6
                        py-3
                        font-semibold
                        text-white
                        transition
                        hover:bg-blue-700
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "

                >

                    <FileSpreadsheet
                        size={20}
                    />

                    {uploading
                        ? "Uploading..."
                        : "Browse Files"}

                </button>

                <p
                    className="
                        mt-6
                        text-sm
                        text-slate-500
                    "
                >

                    Supported formats:
                    CSV • XLS • XLSX

                </p>

            </div>

        </div>

    );

}