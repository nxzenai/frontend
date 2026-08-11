"use client";

import { GripVertical } from "lucide-react";

import { Cell } from "@/types/cell";
import { useNotebookEditor } from "@/contexts/NotebookEditorContext";

import CellToolbar from "./CellToolbar";

interface Props {
  cell: Cell;
  children: React.ReactNode;
}

export default function CellContainer({
  cell,
  children,
}: Props) {
  const {
    executeCell,
    deleteCell,
    duplicateCell,
    updateCell,
  } = useNotebookEditor();

  /**
   * Execute Cell
   */
  async function handleRun() {
  await updateCell(
    cell.id,
    cell.source
  );

  await executeCell(cell.id);
}

  /**
   * Delete Cell
   */
  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this cell?"
    );

    if (!confirmed) return;

    try {
      await deleteCell(cell.id);
    } catch (error) {
      console.error("Failed to delete cell:", error);
    }
  }

  /**
   * Duplicate Cell
   */
  async function handleDuplicate() {
    try {
      await duplicateCell(cell.id);
    } catch (error) {
      console.error("Failed to duplicate cell:", error);
    }
  }

  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <GripVertical
            size={18}
            className="cursor-move text-slate-500"
          />

          <span className="rounded bg-slate-800 px-3 py-1 text-xs font-semibold uppercase">
            {cell.cell_type}
          </span>

          <span className="text-xs text-slate-500">
            Cell {cell.position + 1}
          </span>
        </div>

        <CellToolbar
          onRun={handleRun}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
        />
      </div>

      {/* Cell Content */}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}