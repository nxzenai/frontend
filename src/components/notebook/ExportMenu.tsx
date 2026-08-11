"use client";

import { useState } from "react";

import { Notebook } from "@/types/notebook";
import { Cell } from "@/types/cell";

import {
  exportIPYNB,
  exportPython,
  exportMarkdown,
  exportHTML,
  exportJSON,
} from "@/utils/exportNotebook";

interface Props {
  notebook: Notebook;
  cells: Cell[];
}

export default function ExportMenu({
  notebook,
  cells,
}: Props) {
  const [open, setOpen] = useState(false);

  function handleExport(
    type:
      | "ipynb"
      | "py"
      | "md"
      | "html"
      | "json"
  ) {
    switch (type) {
      case "ipynb":
        exportIPYNB(notebook, cells);
        break;

      case "py":
        exportPython(notebook, cells);
        break;

      case "md":
        exportMarkdown(notebook, cells);
        break;

      case "html":
        exportHTML(notebook, cells);
        break;

      case "json":
        exportJSON(notebook, cells);
        break;
    }

    setOpen(false);
  }

  return (
    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="
          rounded-lg
          border
          border-slate-700
          px-5
          py-2
          transition
          hover:bg-slate-800
        "
      >
        📤 Export ▾
      </button>

      {open && (
        <div
          className="
            absolute
            right-0
            z-50
            mt-2
            w-64
            overflow-hidden
            rounded-xl
            border
            border-slate-700
            bg-[#111827]
            shadow-2xl
          "
        >

          <button
            onClick={() => handleExport("ipynb")}
            className="block w-full px-4 py-3 text-left hover:bg-slate-800"
          >
            📒 Jupyter Notebook (.ipynb)
          </button>

          <button
            onClick={() => handleExport("py")}
            className="block w-full px-4 py-3 text-left hover:bg-slate-800"
          >
            🐍 Python Script (.py)
          </button>

          <button
            onClick={() => handleExport("md")}
            className="block w-full px-4 py-3 text-left hover:bg-slate-800"
          >
            📝 Markdown (.md)
          </button>

          <button
            onClick={() => handleExport("html")}
            className="block w-full px-4 py-3 text-left hover:bg-slate-800"
          >
            🌐 HTML (.html)
          </button>

          <button
            onClick={() => handleExport("json")}
            className="block w-full px-4 py-3 text-left hover:bg-slate-800"
          >
            📦 JSON (.json)
          </button>

        </div>
      )}

    </div>
  );
}