"use client";

import Link from "next/link";

import useNotebookEditor from "@/hooks/useNotebookEditor";

export default function NotebookHeader() {
  const { notebook } = useNotebookEditor();

  if (!notebook) return null;

  return (
    <header className="border-b border-slate-800 bg-[#0B1220]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">

        <div>

          <Link
            href="/dashboard"
            className="text-sm text-blue-400 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-2 text-3xl font-bold">
            {notebook.title}
          </h1>

          <p className="mt-2 text-slate-400">
            {notebook.description || "No description"}
          </p>

        </div>

        <div className="text-right">

          <div className="rounded-full bg-slate-800 px-4 py-2 text-sm">

            {notebook.visibility.toUpperCase()}

          </div>

          <p className="mt-4 text-xs text-slate-500">

            {notebook.tags.length} tags

          </p>

        </div>

      </div>
    </header>
  );
}