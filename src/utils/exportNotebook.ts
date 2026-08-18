import type { Notebook } from "@/types/notebook";
import type { Cell, CellOutputValue, RichOutputContent } from "@/types/cell";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function safeFilename(title: string): string {
  return title.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").trim() || "notebook";
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function richContent(output: CellOutputValue): RichOutputContent {
  return typeof output.content === "object" && output.content !== null ? output.content : {};
}

function outputText(output: CellOutputValue): string {
  if (typeof output.content === "string") return output.content;
  const plain = output.content.data?.["text/plain"];
  if (typeof plain === "string") return plain;
  if (Array.isArray(plain)) return plain.filter((part): part is string => typeof part === "string").join("");
  return JSON.stringify(output.content);
}

function toJupyterOutput(output: CellOutputValue, cellExecutionCount: number | null) {
  const content = richContent(output);

  if (output.output_type === "stream") {
    return {
      output_type: "stream",
      name: content.name === "stderr" || output.metadata?.name === "stderr" ? "stderr" : "stdout",
      text: typeof output.content === "string" ? output.content : content.text ?? "",
    };
  }

  if (output.output_type === "error") {
    return {
      output_type: "error",
      ename: content.ename ?? "Error",
      evalue: content.evalue ?? "",
      traceback: content.traceback ?? [],
    };
  }

  const data = content.data ?? {};
  const metadata = content.metadata ?? output.metadata ?? {};
  if (output.output_type === "execute_result") {
    return {
      output_type: "execute_result",
      data,
      metadata,
      execution_count: content.execution_count ?? cellExecutionCount,
    };
  }

  return { output_type: "display_data", data, metadata };
}

export function exportJSON(notebook: Notebook, cells: Cell[]) {
  download(`${safeFilename(notebook.title)}.json`, JSON.stringify({ notebook, cells }, null, 2), "application/json");
}

export function exportPython(notebook: Notebook, cells: Cell[]) {
  let text = `# ${notebook.title}\n\n`;
  cells.forEach((cell, index) => {
    text += `# ----------------------------------\n# Cell ${index + 1}\n\n`;
    text += cell.cell_type === "markdown"
      ? `${cell.source.split("\n").map((line) => `# ${line}`).join("\n")}\n\n`
      : `${cell.source}\n\n`;
  });
  download(`${safeFilename(notebook.title)}.py`, text, "text/x-python");
}

export function exportMarkdown(notebook: Notebook, cells: Cell[]) {
  let markdown = `# ${notebook.title}\n\n`;
  cells.forEach((cell) => {
    if (cell.cell_type === "markdown") {
      markdown += `${cell.source}\n\n`;
      return;
    }
    markdown += `\`\`\`python\n${cell.source}\n\`\`\`\n\n`;
    if (cell.outputs.length) {
      markdown += `**Output**\n\n\`\`\`\n${cell.outputs.map(outputText).join("\n")}\n\`\`\`\n\n`;
    }
  });
  download(`${safeFilename(notebook.title)}.md`, markdown, "text/markdown");
}

export function exportHTML(notebook: Notebook, cells: Cell[]) {
  const body = cells.map((cell) => {
    if (cell.cell_type === "markdown") {
      return `<p>${escapeHtml(cell.source).replaceAll("\n", "<br>")}</p>`;
    }
    const outputs = cell.outputs.map((output) => `<pre>${escapeHtml(outputText(output))}</pre>`).join("");
    return `<pre>${escapeHtml(cell.source)}</pre>${outputs ? `<div class="output">${outputs}</div>` : ""}`;
  }).join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(notebook.title)}</title><style>body{font-family:Arial,sans-serif;padding:40px;background:#fafafa}pre{background:#222;color:#fff;padding:15px;border-radius:8px;overflow:auto}.output{background:#eee;padding:15px;margin-bottom:20px}</style></head><body><h1>${escapeHtml(notebook.title)}</h1>${body}</body></html>`;
  download(`${safeFilename(notebook.title)}.html`, html, "text/html");
}

export function exportIPYNB(notebook: Notebook, cells: Cell[]) {
  const ipynb = {
    cells: cells.map((cell) => cell.cell_type === "markdown" ? {
      cell_type: "markdown",
      metadata: cell.metadata ?? {},
      source: cell.source,
    } : {
      cell_type: "code",
      metadata: cell.metadata ?? {},
      source: cell.source,
      execution_count: cell.execution_count,
      outputs: cell.outputs.map((output) => toJupyterOutput(output, cell.execution_count)),
    }),
    metadata: {
      kernelspec: { display_name: "Python 3", language: "python", name: "python3" },
      language_info: { name: "python" },
    },
    nbformat: 4,
    nbformat_minor: 5,
  };
  download(`${safeFilename(notebook.title)}.ipynb`, JSON.stringify(ipynb, null, 2), "application/x-ipynb+json");
}
