"use client";

import { SQLExecuteResponse } from "@/types/sql";

interface Props {
  result: SQLExecuteResponse | null;
  error?: string;
}

export default function SQLResultTable({
  result,
  error,
}: Props) {

  //////////////////////////////////////////////////////
  // Error State
  //////////////////////////////////////////////////////

  if (error) {

    return (

      <div
        className="
          rounded-2xl
          border
          border-red-700
          bg-red-950/40
          p-6
        "
      >

        <h2 className="font-semibold text-red-300">

          SQL Error

        </h2>

        <p
          className="
            mt-3
            whitespace-pre-wrap
            text-red-100
          "
        >

          {error}

        </p>

      </div>

    );

  }

  //////////////////////////////////////////////////////
  // Empty State
  //////////////////////////////////////////////////////

  if (!result) {

    return (

      <div
        className="
          flex
          h-72
          items-center
          justify-center
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          text-slate-400
        "
      >

        Execute a SQL query to view results.

      </div>

    );

  }

  //////////////////////////////////////////////////////
  // Results
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

      <div className="border-b border-slate-800 p-4">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="font-semibold text-white">

              Query Results

            </h2>

            <p className="mt-1 text-sm text-slate-400">

              {result.rows.length} rows returned

            </p>

          </div>

          <span
            className="
              rounded-lg
              bg-green-500/10
              px-3
              py-1
              text-sm
              font-medium
              text-green-400
            "
          >

            {result.execution_time}s

          </span>

        </div>

      </div>

      {/* Results Table */}

      <div className="max-h-[450px] overflow-auto">

        <table className="min-w-full">

          <thead className="sticky top-0 bg-slate-950">

            <tr>

              {result.columns.map((column) => (

                <th
                  key={column}
                  className="
                    border-b
                    border-slate-800
                    px-5
                    py-3
                    text-left
                    text-sm
                    font-semibold
                    text-white
                  "
                >

                  {column}

                </th>

              ))}

            </tr>

          </thead>

          <tbody>

            {result.rows.length === 0 ? (

              <tr>

                <td
                  colSpan={Math.max(result.columns.length, 1)}
                  className="
                    py-10
                    text-center
                    text-slate-400
                  "
                >

                  Query executed successfully.

                  <br />

                  No rows returned.

                </td>

              </tr>

            ) : (

              result.rows.map((row, rowIndex) => (

                <tr
                  key={rowIndex}
                  className="
                    border-b
                    border-slate-800
                    transition-colors
                    hover:bg-slate-800/50
                  "
                >

                  {row.map((value, colIndex) => (

                    <td
                      key={colIndex}
                      className="
                        px-5
                        py-3
                        text-sm
                        text-slate-300
                      "
                    >

                      {value === null ? (

                        <span className="italic text-slate-500">

                          NULL

                        </span>

                      ) : (

                        String(value)

                      )}

                    </td>

                  ))}

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}