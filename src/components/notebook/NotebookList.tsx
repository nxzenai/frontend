"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import notebookService from "@/services/notebook.service";
import type { Notebook } from "@/types/notebook";
import type { NotebookExample } from "@/types/notebook";

export default function NotebookList() {
  const router = useRouter();

  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examples, setExamples] = useState<NotebookExample[]>([]);
  const importRef = useRef<HTMLInputElement | null>(null);

  // ============================================================
  // LOAD NOTEBOOKS
  // ============================================================

  async function loadNotebooks() {
    try {
      setLoading(true);
      setError(null);

      const [data, availableExamples] = await Promise.all([
        notebookService.getAll(), notebookService.examples(),
      ]);

      setNotebooks(Array.isArray(data) ? data : []);
      setExamples(availableExamples);
    } catch (err) {
      console.error("Failed to load notebooks:", err);

      setError("Unable to load Python Labs.");
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadNotebooks();
  }, []);

  // ============================================================
  // CREATE NEW LAB
  // ============================================================

  async function handleCreateNotebook() {
    try {
      setCreating(true);
      setError(null);

      const notebook = await notebookService.create({
        title: "Untitled Notebook",
        description: "Python AI Lab",
        visibility: "private",
        tags: [],
      });

      // Immediately open the newly created lab
      router.push(`/notebooks/${notebook.id}`);
    } catch (err) {
      console.error("Failed to create notebook:", err);

      setError("Unable to create a new Python Lab.");
    } finally {
      setCreating(false);
    }
  }

  // ============================================================
  // OPEN LAB
  // ============================================================

  function handleOpenNotebook(id: string) {
    router.push(`/notebooks/${id}`);
  }

  async function handleCreateExample(slug: string) {
    try {
      setCreating(true); setError(null);
      const created = await notebookService.createExample(slug);
      router.push(`/notebooks/${created.id}`);
    } catch { setError("Unable to create example notebook."); }
    finally { setCreating(false); }
  }

  async function handleImport(file: File) {
    try {
      setCreating(true); setError(null);
      const imported = await notebookService.importIPYNB(file);
      router.push(`/notebooks/${imported.id}`);
    } catch { setError("Unable to import this .ipynb notebook."); }
    finally { setCreating(false); }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-slate-400">
          Loading Python Labs...
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">



        <div className="flex gap-3">
        <input ref={importRef} type="file" accept=".ipynb,application/x-ipynb+json" className="hidden" onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleImport(file);
          event.currentTarget.value = "";
        }} />
        <button type="button" onClick={() => importRef.current?.click()} disabled={creating} className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50">Import .ipynb</button>
        <button
          type="button"
          onClick={handleCreateNotebook}
          disabled={creating}
          className="
            rounded-xl
            bg-blue-600
            px-6
            py-3
            font-semibold
            text-white
            shadow-lg
            shadow-blue-600/20
            transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {creating ? "Creating..." : "+ New Lab"}
        </button>
        </div>

      </div>

      {/* Error */}

      {error && (
        <div
          role="alert"
          className="
            rounded-xl
            border
            border-red-500/30
            bg-red-500/10
            p-4
            text-red-400
          "
        >
          {error}
        </div>
      )}

      {examples.length > 0 && (
        <section aria-labelledby="examples-title">
          <h3 id="examples-title" className="mb-3 text-lg font-semibold text-white">Start from an example</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {examples.map((example) => (
              <button key={example.slug} type="button" disabled={creating} onClick={() => void handleCreateExample(example.slug)} className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-left hover:border-blue-500 disabled:opacity-50">
                <span className="text-xs uppercase tracking-wide text-blue-400">{example.category}</span>
                <strong className="mt-1 block text-white">{example.title}</strong>
                <span className="mt-1 block text-xs text-slate-400">{example.description}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}

      {notebooks.length === 0 && !error && (
        <div
          className="
            flex
            min-h-[300px]
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-700
            bg-slate-900
            p-10
            text-center
          "
        >
          <div
            className="
              mb-5
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-blue-500/10
              text-3xl
            "
          >
            🐍
          </div>

          <h3 className="text-xl font-semibold text-white">
            No Python Labs yet
          </h3>

          <p className="mt-2 max-w-md text-slate-400">
            Create your first Python Lab and start writing
            and executing Python code.
          </p>

          <button
            type="button"
            onClick={handleCreateNotebook}
            disabled={creating}
            className="
              mt-6
              rounded-xl
              bg-blue-600
              px-6
              py-3
              font-semibold
              text-white
              hover:bg-blue-700
              disabled:opacity-50
            "
          >
            {creating ? "Creating..." : "+ Create Python Lab"}
          </button>
        </div>
      )}

      {/* Notebook Grid */}

      {notebooks.length > 0 && (
        <div
          className="
            grid
            gap-6
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {notebooks.map((notebook) => (
            <div
              key={notebook.id}
              className="
                group
                relative
                rounded-2xl
                border
                border-slate-700
                bg-slate-900
                p-7
                transition
                hover:-translate-y-1
                hover:border-blue-500/50
                hover:shadow-xl
                hover:shadow-blue-500/10
              "
            >

              {/* Visibility */}

              <div className="absolute right-5 top-5">
                <span
                  className="
                    rounded-full
                    bg-slate-800
                    px-3
                    py-1
                    text-xs
                    text-slate-300
                  "
                >
                  {notebook.visibility}
                </span>
              </div>

              {/* Python Icon */}

              <div
                className="
                  mb-6
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-500/10
                  text-2xl
                "
              >
                🐍
              </div>

              {/* Title */}

              <h3
                className="
                  truncate
                  pr-20
                  text-xl
                  font-bold
                  text-white
                "
              >
                {notebook.title || "Untitled Notebook"}
              </h3>

              {/* Description */}

              <p
                className="
                  mt-3
                  min-h-[24px]
                  truncate
                  text-sm
                  text-slate-400
                "
              >
                {notebook.description || "Python AI Lab"}
              </p>

              {/* Footer */}

              <div
                className="
                  mt-8
                  flex
                  items-center
                  justify-between
                "
              >
                <span className="text-sm text-slate-500">
                  {notebook.execution_count || 0} executions
                </span>

                <button
                  type="button"
                  onClick={() =>
                    handleOpenNotebook(notebook.id)
                  }
                  className="
                    text-sm
                    font-medium
                    text-blue-400
                    transition
                    hover:text-blue-300
                  "
                >
                  Open →
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
