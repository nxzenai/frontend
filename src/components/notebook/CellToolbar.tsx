"use client";

import {
  Play,
  Trash2,
  Copy,
  MoreHorizontal,
} from "lucide-react";

interface CellToolbarProps {
  onRun?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export default function CellToolbar({
  onRun,
  onDelete,
  onDuplicate,
}: CellToolbarProps) {
  return (
    <div className="flex items-center gap-2">

      <button
        onClick={onRun}
        className="rounded-md p-2 transition hover:bg-green-600/20"
        title="Run Cell"
      >
        <Play
          size={18}
          className="text-green-400"
        />
      </button>

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

      <button
        className="rounded-md p-2 transition hover:bg-slate-700"
      >
        <MoreHorizontal
          size={18}
          className="text-slate-300"
        />
      </button>

    </div>
  );
}