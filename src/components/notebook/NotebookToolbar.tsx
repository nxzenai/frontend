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

  //////////////////////////////////////////////////////
  // SAVE
  //////////////////////////////////////////////////////

  async function handleSave() {
    // Phase 2.2
    console.log("Save Notebook");
  }

  //////////////////////////////////////////////////////
  // RUN ALL
  //////////////////////////////////////////////////////

  async function handleRunAll() {
    await runAllCells();
  }

  //////////////////////////////////////////////////////
  // RESTART KERNEL
  //////////////////////////////////////////////////////

  async function handleRestartKernel() {
    await restartKernel();
  }

  //////////////////////////////////////////////////////
  // INTERRUPT KERNEL
  //////////////////////////////////////////////////////

  async function handleInterruptKernel() {
    await interruptKernel();
  }

  return (
    <div className="border-b border-slate-800 bg-[#111827]">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-8 py-4">

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="
            rounded-lg
            bg-blue-600
            px-5
            py-2
            font-medium
            text-white
            transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          💾 Save
        </button>

        {/* Run All */}
        <button
          onClick={handleRunAll}
          disabled={saving}
          className="
            rounded-lg
            border
            border-slate-700
            px-5
            py-2
            transition
            hover:bg-slate-800
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          ▶ Run All
        </button>

        {/* Restart Kernel */}
        <button
          onClick={handleRestartKernel}
          disabled={saving}
          className="
            rounded-lg
            border
            border-slate-700
            px-5
            py-2
            transition
            hover:bg-slate-800
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          🔄 Restart Kernel
        </button>

        {/* Interrupt */}
        <button
          onClick={handleInterruptKernel}
          disabled={saving}
          className="
            rounded-lg
            border
            border-slate-700
            px-5
            py-2
            transition
            hover:bg-slate-800
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          ⏹ Interrupt
        </button>

        {/* Export */}
        {notebook && (
          <ExportMenu
            notebook={notebook}
            cells={cells}
          />
        )}

      </div>
    </div>
  );
}