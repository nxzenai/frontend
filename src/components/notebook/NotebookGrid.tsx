"use client";

import useNotebook from "@/hooks/useNotebook";
import NotebookCard from "./NotebookCard";

export default function NotebookGrid() {
  const { notebooks, loading } = useNotebook();

  if (loading) {
    return (
      <div className="py-20 text-center">
        Loading notebooks...
      </div>
    );
  }

  if (notebooks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-12 text-center">
        <h2 className="text-xl font-semibold">
          No notebooks found
        </h2>

        <p className="mt-2 text-slate-400">
          Create your first notebook.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {notebooks.map((notebook) => (
        <NotebookCard
          key={notebook.id}
          notebook={notebook}
        />
      ))}
    </div>
  );
}