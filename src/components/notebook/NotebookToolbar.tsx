"use client";

import useNotebookEditor from "@/hooks/useNotebookEditor";
import ExportMenu from "./ExportMenu";

export default function NotebookToolbar() {
  const {
    notebook,
    cells,
    saving,
    runAllCells,
    restartKernel,
    interruptKernel,
  } = useNotebookEditor();

  return (
    <div className="border-b border-slate-800 bg-[#111827]">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-8 py-4">
        <button
          type="button"
          onClick={runAllCells}
          disabled={saving}
          className="rounded-lg border border-slate-700 px-5 py-2 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Run All
        </button>

        <button
          type="button"
          onClick={restartKernel}
          disabled={saving}
          className="rounded-lg border border-slate-700 px-5 py-2 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Restart Kernel
        </button>

        <button
          type="button"
          onClick={interruptKernel}
          className="rounded-lg border border-slate-700 px-5 py-2 transition hover:bg-slate-800"
        >
          Interrupt
        </button>

        {notebook && <ExportMenu notebook={notebook} cells={cells} />}

        <span className="ml-auto text-sm text-slate-400" aria-live="polite">
          {saving ? "Saving or executing..." : "Autosave enabled"}
        </span>
      </div>
    </div>
  );
}
