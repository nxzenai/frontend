"use client";

import { Database, Table2 } from "lucide-react";

import { TableSchema } from "@/types/sql";

interface Props {
  tables: TableSchema[];
}

export default function SchemaExplorer({
  tables,
}: Props) {
  return (
    <aside
      className="
        h-full
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
      "
    >
      {/* Header */}

      <div className="border-b border-slate-800 p-5">

        <div className="flex items-center gap-3">

          <Database
            className="text-blue-400"
            size={22}
          />

          <div>

            <h2 className="text-lg font-semibold text-white">
              Database
            </h2>

            <p className="text-sm text-slate-400">
              Tables
            </p>

          </div>

        </div>

      </div>

      {/* Tables */}

      <div className="space-y-5 p-5">

        {tables.map((table) => (

          <div
            key={table.name}
            className="
              rounded-xl
              border
              border-slate-800
              bg-slate-950
              p-4
            "
          >

            <div className="mb-3 flex items-center gap-2">

              <Table2
                size={18}
                className="text-blue-400"
              />

              <span className="font-semibold text-white">

                {table.name}

              </span>

            </div>

            <div className="space-y-2">

              {table.columns.map((column) => (

                <div
                  key={column}
                  className="
                    rounded-lg
                    bg-slate-900
                    px-3
                    py-2
                    text-sm
                    text-slate-300
                  "
                >
                  {column}
                </div>

              ))}

            </div>

          </div>

        ))}

      </div>

    </aside>
  );
}