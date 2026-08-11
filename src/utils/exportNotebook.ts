import { Notebook } from "@/types/notebook";
import { Cell } from "@/types/cell";

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], {
    type: mime,
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;
  a.download = filename;

  document.body.appendChild(a);

  a.click();

  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

export function exportJSON(
  notebook: Notebook,
  cells: Cell[]
) {
  download(
    `${notebook.title}.json`,
    JSON.stringify(
      {
        notebook,
        cells,
      },
      null,
      2
    ),
    "application/json"
  );
}

export function exportPython(
  notebook: Notebook,
  cells: Cell[]
) {
  let text = `# ${notebook.title}\n\n`;

  cells.forEach((cell, index) => {
    text += `# ----------------------------------\n`;
    text += `# Cell ${index + 1}\n\n`;

    if (cell.cell_type === "markdown") {
      text += cell.source
        .split("\n")
        .map((line) => `# ${line}`)
        .join("\n");

      text += "\n\n";
    } else {
      text += cell.source;
      text += "\n\n";
    }
  });

  download(
    `${notebook.title}.py`,
    text,
    "text/x-python"
  );
}

export function exportMarkdown(
  notebook: Notebook,
  cells: Cell[]
) {
  let md = `# ${notebook.title}\n\n`;

  cells.forEach((cell) => {
    if (cell.cell_type === "markdown") {
      md += cell.source + "\n\n";
    } else {
      md += "```python\n";
      md += cell.source;
      md += "\n```\n\n";

      if (cell.outputs.length) {
        md += "**Output**\n\n```\n";

        cell.outputs.forEach((o) => {
          if (typeof o.content === "string") {
            md += o.content + "\n";
          } else {
            md +=
              o.content?.data?.["text/plain"] ??
              JSON.stringify(o.content);

            md += "\n";
          }
        });

        md += "```\n\n";
      }
    }
  });

  download(
    `${notebook.title}.md`,
    md,
    "text/markdown"
  );
}

export function exportHTML(
  notebook: Notebook,
  cells: Cell[]
) {
  let html = `
<!DOCTYPE html>
<html>

<head>

<meta charset="utf-8"/>

<title>${notebook.title}</title>

<style>

body{
font-family:Arial;
padding:40px;
background:#fafafa;
}

pre{
background:#222;
color:#fff;
padding:15px;
border-radius:8px;
overflow:auto;
}

.output{
background:#eee;
padding:15px;
margin-bottom:20px;
}

</style>

</head>

<body>

<h1>${notebook.title}</h1>

`;

  cells.forEach((cell) => {
    if (cell.cell_type === "markdown") {
      html += `<p>${cell.source.replaceAll("\n", "<br/>")}</p>`;
    } else {
      html += `<pre>${cell.source}</pre>`;

      if (cell.outputs.length) {
        html += `<div class="output">`;

        cell.outputs.forEach((o) => {
          if (typeof o.content === "string") {
            html += `<pre>${o.content}</pre>`;
          } else {
            html += `<pre>${
              o.content?.data?.["text/plain"] ??
              JSON.stringify(o.content)
            }</pre>`;
          }
        });

        html += "</div>";
      }
    }
  });

  html += "</body></html>";

  download(
    `${notebook.title}.html`,
    html,
    "text/html"
  );
}

export function exportIPYNB(
  notebook: Notebook,
  cells: Cell[]
) {
  const ipynb = {
    cells: cells.map((cell) => ({
      cell_type: cell.cell_type,
      metadata: cell.metadata ?? {},
      source: cell.source.split("\n").map((x) => x + "\n"),
      execution_count:
        cell.execution_count,

      outputs:
        cell.outputs ?? [],
    })),

    metadata: {
      language_info: {
        name: "python",
      },
    },

    nbformat: 4,

    nbformat_minor: 5,
  };

  download(
    `${notebook.title}.ipynb`,
    JSON.stringify(ipynb, null, 2),
    "application/x-ipynb+json"
  );
}