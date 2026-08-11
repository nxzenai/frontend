"use client";

import { BookOpen } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 py-24">

      <BookOpen
        size={72}
        className="text-slate-600"
      />

      <h2 className="mt-6 text-2xl font-bold">

        No Notebooks

      </h2>

      <p className="mt-2 text-slate-400">

        Click the + button to create your first notebook.

      </p>

    </div>
  );
}