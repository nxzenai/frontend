"use client";

import axios from "axios";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";

import cellService from "@/services/cell.service";
import notebookService from "@/services/notebook.service";
import type { Cell, NotebookFile, RuntimeInfo } from "@/types/cell";
import type { Notebook } from "@/types/notebook";
import { flushDraftsBeforeRun } from "@/utils/notebookExecution";
import { notebookLoadError } from "@/utils/notebookLoadError";
import { SerializedSaveQueue } from "@/utils/serializedSaveQueue";
import { selectCellRange } from "@/utils/notebookCommands";

export type SaveStatus = "saved" | "saving" | "error";
type ExecutionState = "idle" | "running" | "succeeded" | "failed";

interface NotebookEditorContextType {
  notebook: Notebook | null;
  cells: Cell[];
  files: NotebookFile[];
  runtimeInfo: RuntimeInfo | null;
  uploadProgress: number | null;
  loading: boolean;
  saving: boolean;
  saveStatus: SaveStatus;
  error: string | null;
  kernelStatus: string;
  activeCellId: string | null;
  selectedCellId: string | null;
  executionState: (cellId: string) => ExecutionState;
  loadNotebook: (id: string) => Promise<void>;
  refreshCells: () => Promise<Cell[]>;
  createCodeCell: () => Promise<void>;
  createMarkdownCell: () => Promise<void>;
  insertCell: (cellId: string, placement: "above" | "below", type: "code" | "markdown") => Promise<void>;
  executeCell: (cellId: string) => Promise<void>;
  runAllCells: () => Promise<void>;
  runAbove: (cellId: string) => Promise<void>;
  runBelow: (cellId: string) => Promise<void>;
  deleteCell: (cellId: string) => Promise<void>;
  duplicateCell: (cellId: string) => Promise<void>;
  moveCell: (cellId: string, direction: -1 | 1) => Promise<void>;
  restartKernel: () => Promise<void>;
  restartAndRunAll: () => Promise<void>;
  interruptKernel: () => Promise<void>;
  shutdownKernel: () => Promise<void>;
  clearCellOutputs: (cellId: string) => Promise<void>;
  clearAllOutputs: () => Promise<void>;
  updateCell: (cellId: string, source: string) => Promise<void>;
  updateNotebookTitle: (title: string) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  downloadFile: (file: NotebookFile) => Promise<void>;
  focusNextCell: (cellId: string) => Promise<void>;
  setCells: React.Dispatch<React.SetStateAction<Cell[]>>;
  setActiveCellId: React.Dispatch<React.SetStateAction<string | null>>;
  setSelectedCellId: React.Dispatch<React.SetStateAction<string | null>>;
}

const NotebookEditorContext = createContext<NotebookEditorContextType | null>(null);

export function NotebookEditorProvider({ notebookId, children }: { notebookId: string; children: ReactNode }) {
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [cells, setCells] = useState<Cell[]>([]);
  const [files, setFiles] = useState<NotebookFile[]>([]);
  const [runtimeInfo, setRuntimeInfo] = useState<RuntimeInfo | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [error, setError] = useState<string | null>(null);
  const [kernelStatus, setKernelStatus] = useState("stopped");
  const [activeCellId, setActiveCellId] = useState<string | null>(null);
  const [selectedCellId, setSelectedCellId] = useState<string | null>(null);
  const [executionStates, setExecutionStates] = useState<Record<string, ExecutionState>>({});
  const saveQueue = useRef(new SerializedSaveQueue());
  const saveCount = useRef(0);
  const saveFailed = useRef(false);

  const orderedCells = (items = cells) => [...items].sort((left, right) => left.position - right.position);
  const executionState = (cellId: string): ExecutionState => executionStates[cellId]
    ?? cells.find((cell) => cell.id === cellId)?.execution_state
    ?? "idle";

  async function loadNotebook(id: string) {
    setLoading(true);
    setError(null);
    try {
      const [notebookData, notebookCells, notebookFiles] = await Promise.all([
        notebookService.get(id), cellService.list(id), cellService.listFiles(id),
      ]);
      setNotebook(notebookData);
      setCells(notebookCells);
      setFiles(notebookFiles);
      const first = notebookCells[0]?.id ?? null;
      setActiveCellId(first);
      setSelectedCellId(first);
      try {
        const info = await cellService.runtimeInfo(id);
        setRuntimeInfo(info);
        setKernelStatus(info.status);
      } catch {
        setKernelStatus("failed");
        setError("Notebook loaded, but runtime information is unavailable.");
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

  async function createCell(type: "code" | "markdown", position?: number): Promise<Cell | null> {
    if (!notebook) return null;
    setSaving(true);
    setError(null);
    try {
      const created = await cellService.create(notebook.id, { cell_type: type, source: "", position });
      const latest = await refreshCells();
      const selected = latest.find((cell) => cell.id === created.id) ?? created;
      setActiveCellId(selected.id);
      setSelectedCellId(selected.id);
      return selected;
    } catch {
      setError("Unable to create cell.");
      return null;
    } finally { setSaving(false); }
  }

  async function createCodeCell() { await createCell("code"); }
  async function createMarkdownCell() { await createCell("markdown"); }
  async function insertCell(cellId: string, placement: "above" | "below", type: "code" | "markdown") {
    const current = cells.find((cell) => cell.id === cellId);
    if (current) await createCell(type, current.position + (placement === "below" ? 1 : 0));
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

  async function executeCell(cellId: string) {
    if (!notebook) return;
    setSaving(true); setError(null); setKernelStatus("busy");
    setExecutionStates((states) => ({ ...states, [cellId]: "running" }));
    try {
      await cellService.execute(notebook.id, cellId);
      await refreshCells();
      const status = await cellService.kernelStatus(notebook.id);
      setKernelStatus(status.status);
      setExecutionStates((states) => ({ ...states, [cellId]: "succeeded" }));
      setActiveCellId(cellId); setSelectedCellId(cellId);
    } catch {
      setError("Failed to execute cell.");
      setKernelStatus("failed");
      setExecutionStates((states) => ({ ...states, [cellId]: "failed" }));
    } finally { setSaving(false); }
  }

  async function runAllCells() {
    if (!notebook) return;
    setSaving(true); setError(null); setKernelStatus("busy");
    const drafts = orderedCells();
    try {
      await flushDraftsBeforeRun(drafts, updateCell, async () => { await cellService.executeAll(notebook.id); });
      await refreshCells();
      setKernelStatus((await cellService.kernelStatus(notebook.id)).status);
    } catch {
      setError("Failed to run notebook. Unsaved cells were not executed.");
      setKernelStatus("failed");
    } finally { setSaving(false); }
  }

  async function runRange(cellId: string, direction: "above" | "below") {
    const target = selectCellRange(cells, cellId, direction);
    try {
      await flushDraftsBeforeRun(target, updateCell, async () => {
        for (const cell of target) if (cell.cell_type === "code") await executeCell(cell.id);
      });
    } catch { setError(`Failed to run cells ${direction} the selected cell.`); }
  }
  async function runAbove(cellId: string) { await runRange(cellId, "above"); }
  async function runBelow(cellId: string) { await runRange(cellId, "below"); }

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
    const original = cells.find((cell) => cell.id === cellId);
    if (!original || !notebook) return;
    setSaving(true); setError(null);
    try {
      const copy = await cellService.create(notebook.id, {
        cell_type: original.cell_type, source: original.source, position: original.position + 1,
      });
      await refreshCells();
      setActiveCellId(copy.id); setSelectedCellId(copy.id);
    } catch { setError("Unable to duplicate cell."); }
    finally { setSaving(false); }
  }

  async function moveCell(cellId: string, direction: -1 | 1) {
    if (!notebook) return;
    const ordered = orderedCells();
    const index = ordered.findIndex((cell) => cell.id === cellId);
    const destination = index + direction;
    if (index < 0 || destination < 0 || destination >= ordered.length) return;
    [ordered[index], ordered[destination]] = [ordered[destination], ordered[index]];
    try {
      const updated = await cellService.reorder(notebook.id, {
        cells: ordered.map((cell, position) => ({ cell_id: cell.id, position })),
      });
      setCells(updated);
    } catch { setError("Unable to move cell."); }
  }

  async function runtimeAction(action: () => Promise<void>, status: string, failure: string): Promise<boolean> {
    setSaving(true); setError(null);
    try { await action(); setKernelStatus(status); return true; }
    catch { setError(failure); setKernelStatus("failed"); return false; }
    finally { setSaving(false); }
  }
  async function restartKernel() {
    if (notebook) await runtimeAction(() => cellService.restartKernel(notebook.id), "idle", "Unable to restart the runtime.");
  }
  async function restartAndRunAll() {
    if (!notebook) return;
    const restarted = await runtimeAction(() => cellService.restartKernel(notebook.id), "idle", "Unable to restart the runtime.");
    if (restarted) await runAllCells();
  }
  async function interruptKernel() {
    if (notebook) await runtimeAction(() => cellService.interruptKernel(notebook.id), "idle", "Unable to interrupt the runtime.");
  }
  async function shutdownKernel() {
    if (notebook) await runtimeAction(() => cellService.shutdownKernel(notebook.id), "stopped", "Unable to shut down the runtime.");
  }
  async function clearCellOutputs(cellId: string) {
    if (!notebook) return;
    await runtimeAction(async () => { await cellService.clearOutputs(notebook.id, cellId); await refreshCells(); }, kernelStatus, "Unable to clear cell output.");
  }
  async function clearAllOutputs() {
    if (!notebook) return;
    await runtimeAction(async () => { await cellService.clearAllOutputs(notebook.id); await refreshCells(); }, kernelStatus, "Unable to clear notebook outputs.");
  }

  async function updateNotebookTitle(title: string) {
    if (!notebook || !title.trim() || title.trim() === notebook.title) return;
    setSaveStatus("saving"); setError(null);
    try {
      const updated = await notebookService.update(notebook.id, { title: title.trim() });
      setNotebook(updated); setSaveStatus("saved");
    } catch { setSaveStatus("error"); setError("Unable to update notebook title."); }
  }

  async function uploadFile(file: File) {
    if (!notebook) return;
    setUploadProgress(0); setError(null);
    try {
      const uploaded = await cellService.uploadFile(notebook.id, file, setUploadProgress);
      setFiles((existing) => [...existing, uploaded]);
    } catch { setError("Unable to upload dataset. Use CSV, JSON, TXT, or XLSX within the size limit."); }
    finally { setUploadProgress(null); }
  }
  async function deleteFile(fileId: string) {
    if (!notebook) return;
    try { await cellService.deleteFile(notebook.id, fileId); setFiles((existing) => existing.filter((file) => file.id !== fileId)); }
    catch { setError("Unable to delete notebook file."); }
  }
  async function downloadFile(file: NotebookFile) {
    if (!notebook) return;
    try {
      const blob = await cellService.downloadFile(notebook.id, file.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = file.original_filename; anchor.click();
      URL.revokeObjectURL(url);
    } catch { setError("Unable to download notebook file."); }
  }

  async function focusNextCell(cellId: string) {
    const ordered = orderedCells();
    const next = ordered[ordered.findIndex((cell) => cell.id === cellId) + 1];
    if (next) { setActiveCellId(next.id); setSelectedCellId(next.id); return; }
    await createCell("code", ordered.length);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadNotebook(notebookId); }, 0);
    return () => window.clearTimeout(timer);
  }, [notebookId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void cellService.kernelStatus(notebookId).then((runtime) => {
        setKernelStatus(runtime.status);
        setRuntimeInfo((current) => current ? { ...current, status: runtime.status } : current);
        setError((current) => current === "Kernel status refresh failed." ? null : current);
      }).catch(() => { setKernelStatus("failed"); setError("Kernel status refresh failed."); });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [notebookId]);

  return <NotebookEditorContext.Provider value={{
    notebook, cells, files, runtimeInfo, uploadProgress, loading, saving, saveStatus, error,
    kernelStatus, activeCellId, selectedCellId, executionState, loadNotebook, refreshCells,
    createCodeCell, createMarkdownCell, insertCell, executeCell, runAllCells, runAbove, runBelow,
    deleteCell, duplicateCell, moveCell, restartKernel, restartAndRunAll, interruptKernel,
    shutdownKernel, clearCellOutputs, clearAllOutputs, updateCell, updateNotebookTitle,
    uploadFile, deleteFile, downloadFile, focusNextCell, setCells, setActiveCellId, setSelectedCellId,
  }}>{children}</NotebookEditorContext.Provider>;
}

export function useNotebookEditor() {
  const context = useContext(NotebookEditorContext);
  if (!context) throw new Error("useNotebookEditor must be used inside NotebookEditorProvider.");
  return context;
}
