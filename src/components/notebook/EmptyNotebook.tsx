"use client";

import { FilePlus2 } from "lucide-react";

export default function EmptyNotebook() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900 py-24">

      <FilePlus2
        size={64}
        className="text-slate-500"
      />

      <h2 className="mt-6 text-2xl font-semibold">

        Your notebook is empty

      </h2>

      <p className="mt-2 text-slate-400">

        Add your first code or markdown cell.

      </p>

      <div className="mt-8 flex gap-4">

        <button className="rounded-lg bg-blue-600 px-6 py-3 hover:bg-blue-700">

          + Code Cell

        </button>

        <button className="rounded-lg border border-slate-700 px-6 py-3 hover:bg-slate-800">

          + Markdown Cell

        </button>

      </div>

    </div>
  );
}