"use client";

import { FormEvent, useState } from "react";
import { ArrowLeft, FileText, Paperclip, Sparkles, X } from "lucide-react";

interface Props {
  busy: boolean;
  onCancel: () => void;
  onSubmit: (values: { name: string; problem: string; files: File[] }) => Promise<void>;
}

export default function NewAgenticProject({ busy, onCancel, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [problem, setProblem] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSubmit({ name, problem, files });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={onCancel} className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </button>
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-black/20">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400">Solution brief</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Design a new AI solution</h1>
          <p className="mt-2 text-sm text-slate-400">Describe the business outcome. The planner will produce an architecture, not source code.</p>
        </div>
        <form onSubmit={submit} className="space-y-6">
          <label className="block text-sm font-medium text-slate-200">
            Project Name
            <input
              required maxLength={160} value={name} onChange={event => setName(event.target.value)}
              placeholder="Customer Support Copilot"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
            />
          </label>
          <label className="block text-sm font-medium text-slate-200">
            Business Problem
            <textarea
              required minLength={10} rows={7} value={problem} onChange={event => setProblem(event.target.value)}
              placeholder="Explain the current workflow, who experiences the problem, and the outcome you need..."
              className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-500"
            />
          </label>
          <div>
            <span className="text-sm font-medium text-slate-200">Optional supporting files</span>
            <label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 bg-slate-950/70 px-5 py-5 text-sm text-slate-400 hover:border-cyan-500/60 hover:text-cyan-300">
              <Paperclip className="h-4 w-4" /> Select reference documents
              <input
                type="file" multiple className="hidden" accept=".pdf,.docx,.txt,.csv,.xlsx,.zip,.py,.sql,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff"
                onChange={event => setFiles(current => [...current, ...Array.from(event.target.files ?? [])])}
              />
            </label>
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300">
                    <span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 text-cyan-400" /><span className="truncate">{file.name}</span></span>
                    <button type="button" title="Remove file" onClick={() => setFiles(current => current.filter((_, item) => item !== index))}><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            disabled={busy} type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles className="h-5 w-5" /> {busy ? "Preparing solution..." : "Design AI Solution"}
          </button>
        </form>
      </div>
    </div>
  );
}
