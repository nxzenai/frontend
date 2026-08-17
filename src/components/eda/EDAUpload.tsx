"use client";
import { useRef } from "react";
import { Loader2, UploadCloud } from "lucide-react";

export default function EDAUpload({ uploading, onUpload }: { uploading: boolean; onUpload: (file: File) => Promise<void> }) {
  const input = useRef<HTMLInputElement>(null);
  const accept = async (file?: File) => {
    if (!file) return;
    if (!/\.(csv|xls|xlsx)$/i.test(file.name)) { window.alert("Upload a CSV, XLS, or XLSX file."); return; }
    await onUpload(file);
    if (input.current) input.current.value = "";
  };
  return <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void accept(event.dataTransfer.files[0]); }} className="rounded-2xl border border-dashed border-blue-500/40 bg-blue-500/5 p-5">
    <input ref={input} className="sr-only" type="file" accept=".csv,.xls,.xlsx" onChange={(event) => void accept(event.target.files?.[0])} />
    <button type="button" disabled={uploading} onClick={() => input.current?.click()} className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60">
      {uploading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}{uploading ? "Analyzing upload…" : "Upload tabular data"}
    </button>
    <p className="mt-3 text-center text-xs text-slate-400">CSV, XLS, or XLSX · Maximum 100 MB</p>
  </div>;
}
