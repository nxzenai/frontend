"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import cellService from "@/services/cell.service";
import notebookService from "@/services/notebook.service";
import type { Cell } from "@/types/cell";
import type { Notebook } from "@/types/notebook";
import { flushDraftsBeforeRun } from "@/utils/notebookExecution";
import { SerializedSaveQueue } from "@/utils/serializedSaveQueue";
import { notebookLoadError } from "@/utils/notebookLoadError";
import axios from "axios";

export type SaveStatus = "saved" | "saving" | "error";

interface NotebookEditorContextType {
  notebook: Notebook | null;
  cells: Cell[];
  loading: boolean;
  saving: boolean;
  saveStatus: SaveStatus;
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
  shutdownKernel: () => Promise<void>;
  clearCellOutputs: (cellId: string) => Promise<void>;
  clearAllOutputs: () => Promise<void>;
  updateCell: (cellId: string, source: string) => Promise<void>;
  focusNextCell: (cellId: string) => void;
  setCells: React.Dispatch<React.SetStateAction<Cell[]>>;
  setActiveCellId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedCellId: React.Dispatch<React.SetStateAction<string | null>>;
}

const NotebookEditorContext = createContext<NotebookEditorContextType | null>(null);

export function NotebookEditorProvider({ notebookId, children }: { notebookId: string; children: ReactNode }) {
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [cells, setCells] = useState<Cell[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [error, setError] = useState<string | null>(null);
  const [kernelStatus, setKernelStatus] = useState("stopped");
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const saveQueue = useRef(new SerializedSaveQueue());
  const saveCount = useRef(0);
  const saveFailed = useRef(false);

  async function loadNotebook(id: string) {
    setLoading(true);
    setError(null);
    try {
      const [notebookData, notebookCells] = await Promise.all([
        notebookService.get(id), cellService.list(id),
      ]);
      setNotebook(notebookData);
      setCells(notebookCells);
      const first = notebookCells[0]?.id ?? null;
      setActiveCellId(first);
      setSelectedCellId(first);
      try {
        setKernelStatus((await cellService.kernelStatus(id)).status);
      } catch {
        setKernelStatus("failed");
        setError("Notebook loaded, but kernel status is unavailable.");
      }
    } catch (cause) {
      setNotebook(null);
      setError(notebookLoadError(axios.isAxiosError(cause) ? cause.response?.status : undefined));
    } finally {
      setLoading(false);
    }
  }

  async function refreshCells(): Promise<Cell[]> {
    if (!notebook) return [];
    try {
      const updated = await cellService.list(notebook.id);
      setCells(updated);
      return updated;
    } catch (cause) {
      setError("Unable to refresh notebook cells.");
      throw cause;
    }
  }

  async function createCell(cellType: "code" | "markdown") {
    if (!notebook) return;
    setSaving(true);
    setError(null);
    try {
      const newCell = await cellService.create(notebook.id, { cell_type: cellType, source: "" });
      setCells((existing) => [...existing, newCell]);
      setActiveCellId(newCell.id);
      setSelectedCellId(newCell.id);
    } catch { setError("Unable to create cell."); }
    finally { setSaving(false); }
  }

  async function createCodeCell() { await createCell("code"); }
  async function createMarkdownCell() { await createCell("markdown"); }

  async function executeCell(cellId: string) {
    if (!notebook) return;
    setSaving(true); setError(null); setKernelStatus("busy");
    try {
      await cellService.execute(notebook.id, cellId);
      const latestCells = await refreshCells();
      setKernelStatus((await cellService.kernelStatus(notebook.id)).status);
      if (latestCells.some((cell) => cell.id === cellId)) {
        setActiveCellId(cellId); setSelectedCellId(cellId);
      }
    } catch { setError("Failed to execute cell."); setKernelStatus("failed"); }
    finally { setSaving(false); }
  }

  async function deleteCell(cellId: string) {
    if (!notebook) return;
    setSaving(true); setError(null);
    try {
      await cellService.delete(notebook.id, cellId);
      const latest = await refreshCells();
      const first = latest[0]?.id ?? null;
      setActiveCellId(first); setSelectedCellId(first);
    } catch { setError("Unable to delete cell."); }
    finally { setSaving(false); }
  }

  async function duplicateCell(cellId: string) {
    if (!notebook) return;
    const original = cells.find((cell) => cell.id === cellId);
    if (!original) return;
    setSaving(true); setError(null);
    try {
      const copy = await cellService.create(notebook.id, {
        cell_type: original.cell_type, source: original.source,
      });
      setCells((existing) => [...existing, copy]);
      setActiveCellId(copy.id); setSelectedCellId(copy.id);
    } catch { setError("Unable to duplicate cell."); }
    finally { setSaving(false); }
  }

  async function updateCell(cellId: string, source: string) {
    if (!notebook) return;
    if (saveCount.current === 0) saveFailed.current = false;
    saveCount.current += 1;
    setSaveStatus("saving");
    setError(null);
    try {
      await saveQueue.current.enqueue(cellId, async () => {
        const updated = await cellService.update(notebook.id, cellId, { source });
        setCells((existing) => existing.map((cell) => cell.id === cellId
          ? { ...updated, source: cell.source === source ? updated.source : cell.source }
          : cell));
      });
    } catch (cause) {
      saveFailed.current = true;
      setError("Unable to update cell. Your latest changes may not be saved.");
      throw cause;
    } finally {
      saveCount.current -= 1;
      if (saveCount.current === 0) setSaveStatus(saveFailed.current ? "error" : "saved");
    }
  }

  function focusNextCell(cellId: string) {
    const next = cells[cells.findIndex((cell) => cell.id === cellId) + 1];
    if (next) { setActiveCellId(next.id); setSelectedCellId(next.id); }
  }

  async function runAllCells() {
    if (!notebook) return;
    setSaving(true); setError(null); setKernelStatus("busy");
    try {
      await flushDraftsBeforeRun(cells, updateCell, async () => { await cellService.executeAll(notebook.id); });
      await refreshCells();
      setKernelStatus((await cellService.kernelStatus(notebook.id)).status);
    } catch {
      setError("Failed to run notebook. Unsaved cells were not executed.");
      setKernelStatus("failed");
    } finally { setSaving(false); }
  }

  async function runtimeAction(action: () => Promise<void>, status: string, failure: string) {
    setSaving(true); setError(null);
    try { await action(); setKernelStatus(status); }
    catch { setError(failure); setKernelStatus("failed"); }
    finally { setSaving(false); }
  }

  async function restartKernel() {
    if (notebook) await runtimeAction(() => cellService.restartKernel(notebook.id), "idle", "Unable to restart the kernel.");
  }
  async function interruptKernel() {
    if (notebook) await runtimeAction(() => cellService.interruptKernel(notebook.id), "idle", "Unable to interrupt the kernel.");
  }
  async function shutdownKernel() {
    if (notebook) await runtimeAction(() => cellService.shutdownKernel(notebook.id), "stopped", "Unable to shut down the kernel.");
  }
  async function clearCellOutputs(cellId: string) {
    if (!notebook) return;
    await runtimeAction(async () => {
      await cellService.clearOutputs(notebook.id, cellId); await refreshCells();
    }, kernelStatus, "Unable to clear cell output.");
  }
  async function clearAllOutputs() {
    if (!notebook) return;
    await runtimeAction(async () => {
      await cellService.clearAllOutputs(notebook.id); await refreshCells();
    }, kernelStatus, "Unable to clear notebook outputs.");
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadNotebook(notebookId); }, 0);
    return () => window.clearTimeout(timer);
  }, [notebookId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void cellService.kernelStatus(notebookId)
        .then((runtime) => {
          setKernelStatus(runtime.status);
          setError((current) => current === "Kernel status refresh failed." ? null : current);
        })
        .catch(() => { setKernelStatus("failed"); setError("Kernel status refresh failed."); });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [notebookId]);

  return <NotebookEditorContext.Provider value={{
    notebook, cells, loading, saving, saveStatus, error, kernelStatus,
    activeCellId, selectedCellId, loadNotebook, refreshCells,
    createCodeCell, createMarkdownCell, executeCell, deleteCell, duplicateCell,
    runAllCells, restartKernel, interruptKernel, shutdownKernel,
    clearCellOutputs, clearAllOutputs, updateCell, focusNextCell,
    setCells, setActiveCellId, setSelectedCellId,
  }}>{children}</NotebookEditorContext.Provider>;
}

export function useNotebookEditor() {
  const context = useContext(NotebookEditorContext);
  if (!context) throw new Error("useNotebookEditor must be used inside NotebookEditorProvider.");
  return context;
}
