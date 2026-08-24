"use client";

import { useRef, useState } from "react";
import useNotebookEditor from "@/hooks/useNotebookEditor";

export default function NotebookSidebar() {
  const { files, runtimeInfo, uploadProgress, uploadFile, deleteFile, downloadFile } = useNotebookEditor();
  const [tab, setTab] = useState<"files" | "runtime">("files");
  const [copied, setCopied] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function copyPath(id: string, path: string) {
    await navigator.clipboard.writeText(path);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1500);
  }

  return (
    <aside className="w-80 shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-950/70 p-4" aria-label="Notebook tools">
      <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-900 p-1">
        <button type="button" onClick={() => setTab("files")} className={`rounded px-3 py-2 text-sm ${tab === "files" ? "bg-blue-600" : "text-slate-400"}`}>Files</button>
        <button type="button" onClick={() => setTab("runtime")} className={`rounded px-3 py-2 text-sm ${tab === "runtime" ? "bg-blue-600" : "text-slate-400"}`}>Runtime</button>
      </div>

      {tab === "files" ? (
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.json,.txt,.xlsx"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadFile(file);
              event.currentTarget.value = "";
            }}
          />
          <button type="button" onClick={() => inputRef.current?.click()} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500">Upload dataset</button>
          {uploadProgress != null && (
            <div aria-live="polite" className="text-xs text-slate-300">
              Uploading {uploadProgress}%
              <div className="mt-1 h-1.5 overflow-hidden rounded bg-slate-800"><div className="h-full bg-blue-500" style={{ width: `${uploadProgress}%` }} /></div>
            </div>
          )}
          <p className="text-xs text-slate-500">CSV, JSON, TXT, XLSX. Paths below are available only inside this notebook runtime.</p>
          {files.length === 0 && <p className="rounded border border-dashed border-slate-700 p-4 text-center text-sm text-slate-500">No uploaded files</p>}
          {files.map((file) => (
            <div key={file.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
              <p className="truncate text-sm font-medium" title={file.original_filename}>{file.original_filename}</p>
              <code className="mt-2 block break-all text-[11px] text-emerald-300">{file.runtime_path}</code>
              <p className="mt-1 text-[11px] text-slate-500">{(file.size_bytes / 1024).toFixed(1)} KB</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => void copyPath(file.id, file.runtime_path)} className="rounded bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700">{copied === file.id ? "Copied" : "Copy Path"}</button>
                <button type="button" onClick={() => void downloadFile(file)} className="rounded bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700">Download</button>
                <button type="button" onClick={() => void deleteFile(file.id)} className="rounded bg-red-950 px-2 py-1 text-xs text-red-300 hover:bg-red-900">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm">
            <p><span className="text-slate-500">Status:</span> {runtimeInfo?.status ?? "unavailable"}</p>
            <p><span className="text-slate-500">Python:</span> {runtimeInfo?.python_version ?? "unknown"}</p>
            <p><span className="text-slate-500">CPU:</span> {runtimeInfo?.cpu_available ? "available" : "unavailable"}</p>
            <p><span className="text-slate-500">GPU:</span> {runtimeInfo?.gpu_available ? runtimeInfo.gpu_details ?? "available" : "unavailable"}</p>
          </div>
          <div className="space-y-1">
            {runtimeInfo?.packages.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded px-2 py-1 text-xs hover:bg-slate-900">
                <span>{item.name}</span>
                <span className={item.installed ? "text-emerald-400" : "text-slate-600"} title={item.error ?? undefined}>{item.installed ? item.version : item.version ? "import failed" : "not installed"}</span>
              </div>
            )) ?? <p className="text-sm text-slate-500">Runtime information unavailable.</p>}
          </div>
          <p className="rounded border border-amber-800 bg-amber-950/40 p-3 text-xs text-amber-200">Host runtime: private staging only. GPU is reported only after framework and hardware detection.</p>
        </div>
      )}
    </aside>
  );
}
