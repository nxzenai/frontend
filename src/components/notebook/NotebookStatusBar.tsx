"use client";

import useNotebookEditor from "@/hooks/useNotebookEditor";

export default function NotebookStatusBar() {
  const { kernelStatus, saving, saveStatus } = useNotebookEditor();

  return (
    <footer className="border-t border-slate-800 bg-[#0B1220]">
      <div className="flex items-center justify-between px-8 py-3 text-sm">
        <div>
          Kernel Status
          <span className="ml-2 font-semibold text-green-400" aria-live="polite">
            {kernelStatus}
          </span>
        </div>
        <div aria-live="polite">{saving ? "Working..." : saveStatus === "saving" ? "Saving..." : saveStatus === "error" ? "Save failed" : "Saved"}</div>
      </div>
    </footer>
  );
}
