"use client";

import { useRef } from "react";

interface Props {
  file: File | null;
  loading?: boolean;
  onFileSelected: (
    file: File
  ) => void;
}

export default function DatasetUploader({
  file,
  loading = false,
  onFileSelected,
}: Props) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selected =
      event.target.files?.[0];

    if (!selected) {
      return;
    }

    const allowedExtensions = [
      ".csv",
      ".xlsx",
      ".xls",
    ];

    const valid =
      allowedExtensions.some(
        (extension) =>
          selected.name
            .toLowerCase()
            .endsWith(extension)
      );

    if (!valid) {
      return;
    }

    onFileSelected(selected);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={handleChange}
        className="hidden"
      />

      <button
        type="button"
        disabled={loading}
        onClick={() =>
          inputRef.current?.click()
        }
        className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50 disabled:cursor-wait"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
          📊
        </div>

        <p className="mt-5 text-base font-bold text-slate-900">
          {loading
            ? "Analyzing dataset..."
            : file
            ? "Change dataset"
            : "Upload your dataset"}
        </p>

        <p className="mt-2 text-sm text-slate-500">
          CSV, XLSX or XLS
        </p>

        <p className="mt-3 text-xs text-slate-400">
          Click to browse your computer
        </p>
      </button>

      {file && !loading && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {file.name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {(file.size / 1024).toFixed(
                1
              )} KB
            </p>
          </div>

          <span className="ml-4 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Ready
          </span>
        </div>
      )}
    </div>
  );
}