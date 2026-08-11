"use client";

import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";

interface DatasetUploaderProps {
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  onUpload: () => void;
  loading: boolean;
}

export default function DatasetUploader({
  selectedFile,
  onFileChange,
  onUpload,
  loading,
}: DatasetUploaderProps) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">

      {/* Header */}

      <div className="flex items-center gap-4">

        <div className="rounded-xl bg-blue-600/20 p-3">

          <UploadCloud
            size={28}
            className="text-blue-400"
          />

        </div>

        <div>

          <h2 className="text-3xl font-bold text-white">
            Upload Dataset
          </h2>

          <p className="mt-1 text-slate-400">
            Upload a CSV dataset to start AutoML training.
          </p>

        </div>

      </div>

      {/* Upload Area */}

      <label
        className="
          mt-8
          flex
          cursor-pointer
          flex-col
          items-center
          justify-center
          rounded-2xl
          border-2
          border-dashed
          border-slate-700
          bg-slate-950
          p-12
          transition
          hover:border-blue-500
          hover:bg-slate-800
        "
      >

        <UploadCloud
          size={52}
          className="text-blue-400"
        />

        <p className="mt-5 text-lg font-semibold text-white">
          Click to upload a dataset
        </p>

        <p className="mt-2 text-sm text-slate-400">
          CSV files only
        </p>

        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file =
              e.target.files?.[0] ?? null;

            onFileChange(file);
          }}
        />

      </label>

      {/* Selected File */}

      {selectedFile && (

        <div className="mt-8 rounded-2xl border border-green-500/20 bg-green-500/10 p-5">

          <div className="flex items-center gap-4">

            <div className="rounded-xl bg-green-500/20 p-3">

              <FileSpreadsheet
                size={26}
                className="text-green-400"
              />

            </div>

            <div className="flex-1">

              <p className="font-semibold text-white">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>

            </div>

            <CheckCircle2
              size={28}
              className="text-green-400"
            />

          </div>

        </div>

      )}

      {/* Upload Button */}

      <button
        onClick={onUpload}
        disabled={!selectedFile || loading}
        className="
          mt-8
          w-full
          rounded-xl
          bg-blue-600
          px-6
          py-4
          text-lg
          font-semibold
          text-white
          transition-all
          duration-200
          hover:bg-blue-700
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {loading
          ? "Uploading Dataset..."
          : "Upload Dataset"}
      </button>

    </div>
  );
}