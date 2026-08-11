"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import { Cell } from "@/types/cell";
import { useNotebookEditor } from "@/contexts/NotebookEditorContext";

import "highlight.js/styles/github-dark.css";

interface Props {
  cell: Cell;
}

export default function MarkdownCell({
  cell,
}: Props) {

  const { updateCell } = useNotebookEditor();

  const [text, setText] = useState(cell.source);

  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setText(cell.source);
  }, [cell.source]);

  function handleChange(
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {

    const value = e.target.value;

    setText(value);

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      updateCell(cell.id, value);
    }, 500);

  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700 bg-[#0F172A]">

      <div className="border-b border-slate-700 bg-slate-900 px-4 py-2">
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-400">
          Markdown
        </span>
      </div>

      <textarea
        value={text}
        onChange={handleChange}
        className="
          min-h-[160px]
          w-full
          resize-none
          border-none
          bg-[#0F172A]
          p-5
          font-mono
          text-[15px]
          text-slate-200
          outline-none
        "
      />

      <div className="border-t border-slate-700 bg-[#020617] p-6">

        <div className="prose prose-invert max-w-none">

          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
          >
            {text}
          </ReactMarkdown>

        </div>

      </div>

    </div>
  );
}