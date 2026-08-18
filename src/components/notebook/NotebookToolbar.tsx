"use client";

import useNotebookEditor from "@/hooks/useNotebookEditor";
import ExportMenu from "./ExportMenu";
import { kernelControlState } from "@/utils/kernelControls";

export default function NotebookToolbar() {
  const {
    notebook,
    cells,
    saving,
    runAllCells,
    restartKernel,
    interruptKernel,
    shutdownKernel,
    clearAllOutputs,
    kernelStatus,
    saveStatus,
  } = useNotebookEditor();
  const controls = kernelControlState(kernelStatus, saving, saveStatus);

  return (
    <div className="border-b border-slate-800 bg-[#111827]">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-8 py-4">
        <button
          type="button"
          onClick={runAllCells}
          disabled={controls.runDisabled}
          className="rounded-lg border border-slate-700 px-5 py-2 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Run All
        </button>

        <button
          type="button"
          onClick={restartKernel}
          disabled={controls.restartDisabled}
          className="rounded-lg border border-slate-700 px-5 py-2 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Restart Kernel
        </button>

        <button
          type="button"
          onClick={interruptKernel}
          disabled={controls.interruptDisabled}
          className="rounded-lg border border-slate-700 px-5 py-2 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Interrupt
        </button>

        <button type="button" onClick={clearAllOutputs} disabled={saving} className="rounded-lg border border-slate-700 px-5 py-2 transition hover:bg-slate-800 disabled:opacity-50">
          Clear All Outputs
        </button>

        <button type="button" onClick={shutdownKernel} disabled={controls.shutdownDisabled} className="rounded-lg border border-slate-700 px-5 py-2 transition hover:bg-slate-800 disabled:opacity-50">
          Shutdown
        </button>

        {notebook && <ExportMenu notebook={notebook} cells={cells} />}

        <span className="ml-auto text-sm text-slate-400" aria-live="polite">
          {saving ? "Executing..." : saveStatus === "saving" ? "Saving..." : saveStatus === "error" ? "Save failed" : "Saved"}
        </span>
      </div>
    </div>
  );
}
