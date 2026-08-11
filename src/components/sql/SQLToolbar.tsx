"use client";

import { Play } from "lucide-react";

interface Props {
  loading: boolean;
  onExecute: () => void;
}

export default function SQLToolbar({
  loading,
  onExecute,
}: Props) {
  return (
    <div className="mb-6 flex justify-end">
      <button
        onClick={onExecute}
        disabled={loading}
        className="
          flex
          items-center
          gap-2
          rounded-xl
          bg-blue-600
          px-6
          py-3
          font-semibold
          text-white
          transition
          hover:bg-blue-700
          disabled:opacity-50
        "
      >
        <Play size={18} />

        {loading
          ? "Executing..."
          : "Run Query"}
      </button>
    </div>
  );
}