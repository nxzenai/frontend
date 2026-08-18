"use client";

import DOMPurify from "dompurify";

import type { CellOutputValue, RichOutputContent } from "@/types/cell";

interface Props {
  outputs: CellOutputValue[];
  executionCount?: number | null;
}

function asRichContent(value: CellOutputValue["content"]): RichOutputContent {
  return typeof value === "object" && value !== null ? value : {};
}

function dataString(content: RichOutputContent, mime: string): string | null {
  const value = content.data?.[mime];
  if (typeof value === "string") return value;
  if (Array.isArray(value) && value.every((part) => typeof part === "string")) {
    return value.join("");
  }
  return null;
}

function safeHtmlDocument(html: string): string {
  const sanitized = DOMPurify.sanitize(html, {
    FORBID_TAGS: ["script", "iframe", "object", "embed", "link", "meta", "base", "form"],
    FORBID_ATTR: ["srcdoc"],
  });

  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'"><style>body{font-family:system-ui,sans-serif;color:#111;margin:0}table{border-collapse:collapse}th,td{border:1px solid #d1d5db;padding:.4rem}</style></head><body>${sanitized}</body></html>`;
}

export default function CellOutput({ outputs, executionCount }: Props) {
  if (!outputs.length) return null;

  return (
    <div className="border-t border-slate-700 bg-[#020617]">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-3">
        <span className="rounded bg-green-700 px-2 py-1 text-xs font-bold text-white">
          Out [{executionCount ?? "-"}]
        </span>
      </div>

      <div className="space-y-4 p-5">
        {outputs.map((output, index) => {
          if (output.output_type === "stream") {
            const content = asRichContent(output.content);
            const stream = typeof output.content === "string" ? output.content : content.text ?? "";
            return <pre key={index} className="whitespace-pre-wrap rounded-lg bg-slate-900 p-4 font-mono text-sm text-green-300">{stream}</pre>;
          }

          if (output.output_type === "error") {
            const error = asRichContent(output.content);
            return (
              <div key={index} className="overflow-hidden rounded-xl border border-red-700 bg-red-950/30">
                <div className="border-b border-red-700 bg-red-900/50 px-5 py-4">
                  <div className="text-lg font-semibold text-red-300">{error.ename ?? "Execution Error"}</div>
                  {error.evalue && <div className="mt-2 text-sm text-red-200">{error.evalue}</div>}
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap p-5 font-mono text-xs leading-6 text-red-100">
                  {error.traceback?.join("\n") ?? JSON.stringify(error, null, 2)}
                </pre>
              </div>
            );
          }

          const content = asRichContent(output.content);
          const image = dataString(content, "image/png");
          if (image) {
            // eslint-disable-next-line @next/next/no-img-element -- Jupyter images are runtime-sized data URLs.
            return <img key={index} src={`data:image/png;base64,${image}`} alt="Notebook output" className="max-w-full rounded-lg border border-slate-700 shadow-lg" />;
          }

          const html = dataString(content, "text/html");
          if (html?.trim()) {
            return (
              <iframe
                key={index}
                title={`Notebook HTML output ${index + 1}`}
                sandbox=""
                srcDoc={safeHtmlDocument(html)}
                className="min-h-32 w-full rounded-lg border border-slate-300 bg-white p-4"
              />
            );
          }

          const text = dataString(content, "text/plain");
          if (text?.trim()) {
            return <pre key={index} className="whitespace-pre-wrap rounded-lg bg-slate-900 p-4 font-mono text-sm text-slate-100">{text}</pre>;
          }

          return <pre key={index} className="whitespace-pre-wrap rounded-lg bg-slate-900 p-4 font-mono text-xs text-slate-300">{JSON.stringify(output, null, 2)}</pre>;
        })}
      </div>
    </div>
  );
}
