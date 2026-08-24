"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import useNotebookEditor from "@/hooks/useNotebookEditor";

export default function NotebookHeader() {
  const { notebook, updateNotebookTitle, saveStatus } = useNotebookEditor();
  const [title, setTitle] = useState("");

  useEffect(() => { if (notebook) setTitle(notebook.title); }, [notebook]);

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

          <label className="sr-only" htmlFor="notebook-title">Notebook title</label>
          <input
            id="notebook-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => void updateNotebookTitle(title)}
            onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
            className="mt-2 w-full max-w-2xl rounded bg-transparent text-3xl font-bold outline-none ring-blue-500 focus:ring-2"
          />
          <span className="sr-only" aria-live="polite">{saveStatus}</span>

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
