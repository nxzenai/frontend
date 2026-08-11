"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Cell } from "@/types/cell";

import { useNotebookEditor } from "@/contexts/NotebookEditorContext";

import CellOutput from "./CellOutput";

interface CodeCellProps {
  cell: Cell;
}

export default function CodeCell({
  cell,
}: CodeCellProps) {
  const {
    updateCell,
    executeCell,
    focusNextCell,
  } = useNotebookEditor();

  const [code, setCode] = useState(
    cell.source
  );

  const debounceTimer =
    useRef<NodeJS.Timeout | null>(null);

  //////////////////////////////////////////////////////
  // Sync editor with backend updates
  //////////////////////////////////////////////////////

  useEffect(() => {
    setCode(cell.source);
  }, [cell.source]);

  //////////////////////////////////////////////////////
  // Autosave (500ms debounce)
  //////////////////////////////////////////////////////

  function handleChange(
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    const value = e.target.value;

    setCode(value);

    if (debounceTimer.current) {
      clearTimeout(
        debounceTimer.current
      );
    }

    debounceTimer.current =
      setTimeout(() => {
        updateCell(
          cell.id,
          value
        );
      }, 500);
  }

  //////////////////////////////////////////////////////
  // Shift + Enter
  //////////////////////////////////////////////////////

  async function handleKeyDown(
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      e.key === "Enter" &&
      e.shiftKey
    ) {
      e.preventDefault();

      if (debounceTimer.current) {
        clearTimeout(
          debounceTimer.current
        );
      }

      await updateCell(
        cell.id,
        code
      );

      await executeCell(
        cell.id
      );

      focusNextCell(
        cell.id
      );
    }
  }

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700 bg-[#0F172A]">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-2">

        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-400">
          Python
        </span>

        <span className="rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-400">
          Shift + Enter to Run
        </span>

      </div>

      {/* Editor */}
      <textarea
        value={code}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        placeholder="Write Python code..."
        className="
          min-h-[180px]
          w-full
          resize-none
          border-none
          bg-[#0F172A]
          p-5
          font-mono
          text-[15px]
          leading-7
          text-slate-200
          outline-none
        "
      />

      {/* Output */}
      <CellOutput
        outputs={cell.outputs}
        executionCount={
          cell.execution_count
        }
      />

    </div>
  );
}