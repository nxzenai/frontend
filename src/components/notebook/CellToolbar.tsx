"use client";

import {
  Play,
  Trash2,
  Copy,
  Eraser,
} from "lucide-react";

interface CellToolbarProps {
  onRun?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onClear?: () => void;
  onRunAbove: () => void;
  onRunBelow: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onInsertAbove: (type: "code" | "markdown") => void;
  onInsertBelow: (type: "code" | "markdown") => void;
  disabled?: boolean;
}

export default function CellToolbar({
  onRun,
  onDelete,
  onDuplicate,
  onClear,
  onRunAbove,
  onRunBelow,
  onMoveUp,
  onMoveDown,
  onInsertAbove,
  onInsertBelow,
  disabled,
}: CellToolbarProps) {
  return (
    <div className="flex items-center gap-2">

      <button
        onClick={onRun}
        disabled={disabled}
        className="rounded-md p-2 transition hover:bg-green-600/20"
        title="Run Cell"
      >
        <Play
          size={18}
          className="text-green-400"
        />
      </button>

      <button type="button" onClick={onRunAbove} disabled={disabled} className="rounded px-2 py-1 text-xs hover:bg-slate-700 disabled:opacity-50">Run above</button>
      <button type="button" onClick={onRunBelow} disabled={disabled} className="rounded px-2 py-1 text-xs hover:bg-slate-700 disabled:opacity-50">Run below</button>
      <button type="button" onClick={onMoveUp} className="rounded px-2 py-1 text-xs hover:bg-slate-700" aria-label="Move cell up">↑</button>
      <button type="button" onClick={onMoveDown} className="rounded px-2 py-1 text-xs hover:bg-slate-700" aria-label="Move cell down">↓</button>
      <button type="button" onClick={() => onInsertAbove("code")} className="rounded px-2 py-1 text-xs hover:bg-slate-700">+ Code above</button>
      <button type="button" onClick={() => onInsertAbove("markdown")} className="rounded px-2 py-1 text-xs hover:bg-slate-700">+ Text above</button>
      <button type="button" onClick={() => onInsertBelow("code")} className="rounded px-2 py-1 text-xs hover:bg-slate-700">+ Code below</button>
      <button type="button" onClick={() => onInsertBelow("markdown")} className="rounded px-2 py-1 text-xs hover:bg-slate-700">+ Text below</button>

      {onClear && (
        <button onClick={onClear} className="rounded-md p-2 transition hover:bg-slate-700" title="Clear Output">
          <Eraser size={18} className="text-slate-300" />
        </button>
      )}

      <button
        onClick={onDuplicate}
        className="rounded-md p-2 transition hover:bg-slate-700"
        title="Duplicate Cell"
      >
        <Copy
          size={18}
          className="text-slate-300"
        />
      </button>

      <button
        onClick={onDelete}
        className="rounded-md p-2 transition hover:bg-red-900/40"
        title="Delete Cell"
      >
        <Trash2
          size={18}
          className="text-red-400"
        />
      </button>

    </div>
  );
}
