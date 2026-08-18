"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

import notebookService from "@/services/notebook.service";
import cellService from "@/services/cell.service";

import { Notebook } from "@/types/notebook";
import { Cell } from "@/types/cell";

interface NotebookEditorContextType {
  notebook: Notebook | null;
  cells: Cell[];

  loading: boolean;
  saving: boolean;

  error: string | null;
  kernelStatus: string;

  activeCellId: string | null;
  selectedCellId: string | null;

  loadNotebook: (id: string) => Promise<void>;
  refreshCells: () => Promise<Cell[]>;

  createCodeCell: () => Promise<void>;
  createMarkdownCell: () => Promise<void>;

  executeCell: (cellId: string) => Promise<void>;

  deleteCell: (cellId: string) => Promise<void>;
  duplicateCell: (cellId: string) => Promise<void>;
  runAllCells: () => Promise<void>;
  restartKernel: () => Promise<void>;

  interruptKernel: () => Promise<void>;

  

  updateCell: (
  cellId: string,
  source: string
) => Promise<void>;
  
  focusNextCell: (cellId: string) => void;


  setCells: React.Dispatch<React.SetStateAction<Cell[]>>;

  setActiveCellId: React.Dispatch<
    React.SetStateAction<string | null>
  >;

  setSelectedCellId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
}

const NotebookEditorContext =
  createContext<NotebookEditorContextType | null>(
    null
  );

interface Props {
  notebookId: string;
  children: ReactNode;
}

export function NotebookEditorProvider({
  notebookId,
  children,
}: Props) {
  const [notebook, setNotebook] =
    useState<Notebook | null>(null);

  const [cells, setCells] = useState<Cell[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [kernelStatus, setKernelStatus] = useState("stopped");

  const [activeCellId, setActiveCellId] =
    useState<string | null>(null);

  const [selectedCellId, setSelectedCellId] =
    useState<string | null>(null);

  const saveQueues = useRef(new Map<string, Promise<void>>());

  //////////////////////////////////////////////////////
  // NOTEBOOK
  //////////////////////////////////////////////////////

  async function loadNotebook(id: string) {
    try {
      setLoading(true);
      setError(null);

      const notebookData =
        await notebookService.get(id);

      const notebookCells =
        await cellService.list(id);

      const runtime = await cellService.kernelStatus(id);

      setNotebook(notebookData);

      setCells(notebookCells);
      setKernelStatus(runtime.status);

      if (notebookCells.length > 0) {
        setActiveCellId(notebookCells[0].id);
        setSelectedCellId(notebookCells[0].id);
      }
    } catch (err) {
      console.error(err);

      setError("Failed to load notebook.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshCells(): Promise<Cell[]> {
  if (!notebook) return [];

  try {
    const updated =
      await cellService.list(notebook.id);

    setCells(updated);

    return updated;
  } catch (err) {
    console.error(err);
    return [];
  }
}

  //////////////////////////////////////////////////////
  // CREATE
  //////////////////////////////////////////////////////

  async function createCell(
    type: "code" | "markdown"
  ) {
    if (!notebook) return;

    try {
      setSaving(true);
      setError(null);

      const newCell =
        await cellService.create(
          notebook.id,
          {
            cell_type: type,
            source: "",
            
          }
        );

      setCells((prev) => [
        ...prev,
        newCell,
      ]);

      setActiveCellId(newCell.id);
      setSelectedCellId(newCell.id);
    } catch (err) {
      console.error(err);

      setError("Unable to create cell.");
    } finally {
      setSaving(false);
    }
  }

  async function createCodeCell() {
    await createCell("code");
  }

  async function createMarkdownCell() {
    await createCell("markdown");
  }


//////////////////////////////////////////////////////
// EXECUTE
//////////////////////////////////////////////////////

async function executeCell(cellId: string) {

  if (!notebook) return;

  try {

    setSaving(true);
    setError(null);
    setKernelStatus("busy");

    // Execute the cell
    await cellService.execute(
      notebook.id,
      cellId
    );

    // Reload cells from backend
    const latestCells = await refreshCells();

    const runtime = await cellService.kernelStatus(notebook.id);
    setKernelStatus(runtime.status);

    // Preserve selection
    const current = latestCells.find(
      (c) => c.id === cellId
    );

    if (current) {
      setActiveCellId(current.id);
      setSelectedCellId(current.id);
    }

  } catch (err) {

    console.error(err);

    setError("Failed to execute cell.");
    setKernelStatus("failed");

  } finally {

    setSaving(false);

  }

}

  //////////////////////////////////////////////////////
  // DELETE
  //////////////////////////////////////////////////////

async function deleteCell(cellId: string) {
  if (!notebook) return;

  try {
    setSaving(true);
    setError(null);

    // 1. Delete the cell in backend
    await cellService.delete(notebook.id, cellId);

    // 2. Reload updated cells
    const latestCells = await refreshCells();

    // 3. Update active/selected cell
    if (latestCells.length > 0) {
      setActiveCellId(latestCells[0].id);
      setSelectedCellId(latestCells[0].id);
    } else {
      setActiveCellId(null);
      setSelectedCellId(null);
    }
  } catch (err) {
    console.error(err);
    setError("Unable to delete cell.");
  } finally {
    setSaving(false);
  }
}
  //////////////////////////////////////////////////////
  // DUPLICATE
  //////////////////////////////////////////////////////

  async function duplicateCell(
    cellId: string
  ) {
    if (!notebook) return;

    try {
      setSaving(true);

      const original =
        cells.find(
          (cell) => cell.id === cellId
        );

      if (!original) return;

      const duplicated =
        await cellService.create(
          notebook.id,
          {
            cell_type:
              original.cell_type,

            source:
              original.source,

            
          }
        );

      setCells((prev) => [
        ...prev,
        duplicated,
      ]);

      setActiveCellId(
        duplicated.id
      );

      setSelectedCellId(
        duplicated.id
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to duplicate cell."
      );
    } finally {
      setSaving(false);
    }
  }



//////////////////////////////////////////////////////
// UPDATE CELL
//////////////////////////////////////////////////////

async function updateCell(
  cellId: string,
  source: string
) {
  if (!notebook) return;

  const previous = saveQueues.current.get(cellId) ?? Promise.resolve();
  const current = previous
    .catch(() => undefined)
    .then(async () => {
      const updatedCell = await cellService.update(notebook.id, cellId, { source });
      setCells((existing) => existing.map((cell) =>
        cell.id === cellId
          ? {
              ...updatedCell,
              source: cell.source === source ? updatedCell.source : cell.source,
            }
          : cell
      ));
    });

  saveQueues.current.set(cellId, current);

  try {
    await current;
  } catch (err) {
    console.error(err);
    setError("Unable to update cell. Your latest changes may not be saved.");
  } finally {
    if (saveQueues.current.get(cellId) === current) {
      saveQueues.current.delete(cellId);
    }
  }
}


//////////////////////////////////////////////////////
// FOCUS NEXT CELL
//////////////////////////////////////////////////////

function focusNextCell(cellId: string) {
  const index = cells.findIndex(
    (cell) => cell.id === cellId
  );

  if (index === -1) return;

  if (index < cells.length - 1) {
    const next = cells[index + 1];

    setActiveCellId(next.id);
    setSelectedCellId(next.id);
  }
}


//////////////////////////////////////////////////////
// RUN ALL CELLS
//////////////////////////////////////////////////////

async function runAllCells() {
  if (!notebook) return;

  try {
    setSaving(true);
    setKernelStatus("busy");

    // Persist the in-memory drafts before asking the backend to execute them.
    const drafts = [...cells].sort((left, right) => left.position - right.position);
    await Promise.all(drafts.map((cell) => updateCell(cell.id, cell.source)));
    const latestCells = await refreshCells();

    for (const cell of latestCells) {
      if (cell.cell_type !== "code") continue;

      await cellService.execute(
        notebook.id,
        cell.id
      );

      // refresh output after every execution
      await refreshCells();
    }

    const runtime = await cellService.kernelStatus(notebook.id);
    setKernelStatus(runtime.status);
  } catch (err) {
    console.error(err);

    setError("Failed to run notebook.");
    setKernelStatus("failed");
  } finally {
    setSaving(false);
  }
}

//////////////////////////////////////////////////////
// RESTART KERNEL
//////////////////////////////////////////////////////

async function restartKernel() {
  if (!notebook) return;

  try {
    await cellService.restartKernel(
      notebook.id
    );

    setKernelStatus("idle");

    alert("Kernel restarted.");
  } catch (err) {
    console.error(err);
    setError("Unable to restart the kernel.");
    setKernelStatus("failed");
  }
}

//////////////////////////////////////////////////////
// INTERRUPT KERNEL
//////////////////////////////////////////////////////

async function interruptKernel() {
  if (!notebook) return;

  try {
    await cellService.interruptKernel(
      notebook.id
    );

    setKernelStatus("idle");

    alert("Execution interrupted.");
  } catch (err) {
    console.error(err);
    setError("Unable to interrupt the kernel.");
    setKernelStatus("failed");
  }
}

  //////////////////////////////////////////////////////
  // EFFECTS
  //////////////////////////////////////////////////////

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotebook(notebookId);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [notebookId]);
  //////////////////////////////////////////////////////
  // PROVIDER
  //////////////////////////////////////////////////////

  return (
    <NotebookEditorContext.Provider
      value={{
        notebook,

        cells,

        loading,
        saving,

        error,
        kernelStatus,

        activeCellId,
        selectedCellId,

        loadNotebook,
        refreshCells,

        createCodeCell,
        createMarkdownCell,

        executeCell,
        runAllCells,

        focusNextCell,

        deleteCell,
        duplicateCell,

        updateCell,

        setCells,
        restartKernel,
        interruptKernel,

        setActiveCellId,
        setSelectedCellId,
      }}
    >
      {children}
    </NotebookEditorContext.Provider>
  );
}

//////////////////////////////////////////////////////
// HOOK
//////////////////////////////////////////////////////

export function useNotebookEditor() {
  const context = useContext(
    NotebookEditorContext
  );

  if (!context) {
    throw new Error(
      "useNotebookEditor must be used inside NotebookEditorProvider."
    );
  }

  return context;
}
