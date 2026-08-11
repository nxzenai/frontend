"use client";

import useNotebookEditor from "@/hooks/useNotebookEditor";

import CellContainer from "./CellContainer";
import CodeCell from "./CodeCell";
import MarkdownCell from "./MarkdownCell";
import AddCellButton from "./AddCellButton";

export default function CellList() {
  const {
    cells,
    loading,
    createCodeCell,
    createMarkdownCell,
  } = useNotebookEditor();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-slate-400">
          Loading notebook...
        </p>
      </div>
    );
  }

  if (!cells || cells.length === 0) {
    return (
      <div className="space-y-8">
        <div className="mb-4 text-xl font-semibold text-green-400">
          Total Active Cells: 0
        </div>

        

        <AddCellButton
          onAddCode={createCodeCell}
          onAddMarkdown={createMarkdownCell}
        />
      </div>
    );
  }

  return (
    <>
      {/* Cell Count */}
      <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3">
        <span className="text-sm font-medium text-slate-300">
          Total Active Cells:
        </span>

        <span className="ml-2 text-lg font-bold text-green-400">
          {cells.length}
        </span>
      </div>

      <div className="space-y-8">
        {cells.map((cell) => (
          <div
            key={cell.id}
            className="space-y-5"
          >
            <CellContainer cell={cell}>
              {cell.cell_type === "code" ? (
                <CodeCell cell={cell} />
              ) : (
                <MarkdownCell cell={cell} />
              )}
            </CellContainer>

            <AddCellButton
              onAddCode={createCodeCell}
              onAddMarkdown={createMarkdownCell}
            />
          </div>
        ))}
      </div>
    </>
  );
}
