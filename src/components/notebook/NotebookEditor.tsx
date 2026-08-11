"use client";

import useNotebookEditor from "@/hooks/useNotebookEditor";

import NotebookHeader from "./NotebookHeader";
import NotebookToolbar from "./NotebookToolbar";
import NotebookStatusBar from "./NotebookStatusBar";
import CellList from "./CellList";

export default function NotebookEditor() {
  const { notebook, loading } = useNotebookEditor();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070B1D] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-600 border-t-blue-500" />
          <p className="text-lg font-medium">
            Loading notebook...
          </p>
        </div>
      </div>
    );
  }

  if (!notebook) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070B1D] text-white">
        <div className="rounded-xl border border-red-800 bg-red-950/40 p-8 text-center">
          <h2 className="text-2xl font-bold text-red-400">
            Notebook Not Found
          </h2>

          <p className="mt-3 text-slate-300">
            The requested notebook could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#070B1D] text-white">
      {/* Header */}
      <NotebookHeader />

      {/* Toolbar */}
      <NotebookToolbar />

      {/* Notebook Workspace */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl px-8 py-8">
          <CellList />
        </div>
      </main>

      {/* Status Bar */}
      <NotebookStatusBar />
    </div>
  );
}