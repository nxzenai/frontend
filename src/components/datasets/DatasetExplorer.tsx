"use client";

import { useMemo, useState } from "react";

import {
  Database,
  FileSpreadsheet,
  Search,
} from "lucide-react";

import { Dataset } from "@/types/dataset";

import CopyCodeButton from "./CopyCodeButton";

interface Props {
  datasets: Dataset[];

  selectedDataset: Dataset | null;

  onSelect: (dataset: Dataset) => void;
}

export default function DatasetExplorer({
  datasets,
  selectedDataset,
  onSelect,
}: Props) {
  //////////////////////////////////////////////////////
  // Search
  //////////////////////////////////////////////////////

  const [search, setSearch] = useState("");

  //////////////////////////////////////////////////////
  // Filter
  //////////////////////////////////////////////////////

  const filteredDatasets = useMemo(() => {
    if (!search.trim()) {
      return datasets;
    }

    return datasets.filter((dataset) =>
      dataset.filename
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [datasets, search]);

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////

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
          border-b
          border-slate-800
          p-5
        "
      >
        <div className="flex items-center gap-3">
          <Database
            className="text-blue-400"
            size={24}
          />

          <div>
            <h2 className="text-lg font-semibold text-white">
              Dataset Explorer
            </h2>

            <p className="text-sm text-slate-400">
              Uploaded datasets
            </p>
          </div>
        </div>
      </div>

      {/* Search */}

      <div className="p-4">
        <div
          className="
            flex
            items-center
            gap-3
            rounded-xl
            border
            border-slate-700
            bg-slate-950
            px-4
            py-3
          "
        >
          <Search
            size={18}
            className="text-slate-500"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search datasets..."
            className="
              w-full
              bg-transparent
              text-white
              outline-none
              placeholder:text-slate-500
            "
          />
        </div>
      </div>

      {/* Dataset List */}

      <div
        className="
          max-h-[560px]
          space-y-4
          overflow-y-auto
          p-4
        "
      >
        {filteredDatasets.length === 0 ? (
          <div className="py-12 text-center">
            <Database
              size={50}
              className="
                mx-auto
                text-slate-700
              "
            />

            <h3
              className="
                mt-5
                text-lg
                font-semibold
                text-white
              "
            >
              No datasets found
            </h3>

            <p className="mt-2 text-slate-500">
              Upload your first dataset.
            </p>
          </div>
        ) : (
          filteredDatasets.map((dataset) => (
            <div
              key={dataset.id}
              className={`
                rounded-xl
                border
                p-4
                transition-all
                ${
                  selectedDataset?.id === dataset.id
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-slate-800 bg-slate-950 hover:border-blue-500/40"
                }
              `}
            >
              <button
                onClick={() => onSelect(dataset)}
                className="w-full text-left"
              >
                <div className="flex gap-3">
                  <FileSpreadsheet
                    size={22}
                    className="mt-1 text-green-400"
                  />

                  <div className="flex-1">
                    <h3 className="truncate font-semibold text-white">
                      {dataset.filename}
                    </h3>

                    <div
                      className="
                        mt-3
                        flex
                        flex-wrap
                        gap-3
                        text-sm
                        text-slate-400
                      "
                    >
                      <span>
                        📄 {dataset.extension}
                      </span>

                      <span>
                        📊 {dataset.rows} Rows
                      </span>

                      <span>
                        📑 {dataset.columns} Columns
                      </span>
                    </div>
                  </div>
                </div>
              </button>

              <div
                className="
                  mt-5
                  flex
                  justify-end
                "
              >
                <CopyCodeButton
                  datasetName={dataset.filename}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
