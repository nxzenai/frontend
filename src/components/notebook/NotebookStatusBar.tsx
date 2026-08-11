"use client";

export default function NotebookStatusBar() {
  return (
    <footer className="border-t border-slate-800 bg-[#0B1220]">

      <div className="flex items-center justify-between px-8 py-3 text-sm">

        <div>

          Kernel Status

          <span className="ml-2 font-semibold text-green-400">

            ● Ready

          </span>

        </div>

        <div>

          Autosave Enabled

        </div>

      </div>

    </footer>
  );
}