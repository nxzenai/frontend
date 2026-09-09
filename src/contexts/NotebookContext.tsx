"use client";

import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import { shouldLoadNotebookCatalog } from "@/lib/notebookRoute";
import AuthService from "@/services/auth.service";
import NotebookService from "@/services/notebook.service";

import {
  Notebook,
  CreateNotebookRequest,
} from "@/types/notebook";

interface NotebookContextType {
  notebooks: Notebook[];

  loading: boolean;

  refresh: () => Promise<void>;

  createNotebook: (
    notebook: CreateNotebookRequest
  ) => Promise<void>;

  deleteNotebook: (
    id: string
  ) => Promise<void>;
}

const NotebookContext =
  createContext<NotebookContextType | null>(
    null
  );

export function NotebookProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const loadNotebookCatalog = shouldLoadNotebookCatalog(pathname);

  const [notebooks, setNotebooks] =
    useState<Notebook[]>([]);

  const [loading, setLoading] =
    useState(false);

  //////////////////////////////////////////////////////
  // Refresh Notebooks
  //////////////////////////////////////////////////////

  const refresh = useCallback(async () => {
    // The catalog is consumed by Dashboard only. Public routes must not fetch it.
    if (!loadNotebookCatalog || !AuthService.isAuthenticated()) {
      return;
    }

    await Promise.resolve();
    setLoading(true);

    try {
      const data =
        await NotebookService.getAll();

      setNotebooks(data);
    } catch (err: unknown) {
      // Ignore expired token errors.
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (
        status !== 401
      ) {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [loadNotebookCatalog]);

  //////////////////////////////////////////////////////
  // Create Notebook
  //////////////////////////////////////////////////////

  async function createNotebook(
    notebook: CreateNotebookRequest
  ) {
    await NotebookService.create(notebook);

    await refresh();
  }

  //////////////////////////////////////////////////////
  // Delete Notebook
  //////////////////////////////////////////////////////

  async function deleteNotebook(
    id: string
  ) {
    await NotebookService.delete(id);

    await refresh();
  }

  //////////////////////////////////////////////////////
  // Initial Load
  //////////////////////////////////////////////////////

  useEffect(() => {
    if (!loadNotebookCatalog) return;
    const refreshTimer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(refreshTimer);
  }, [loadNotebookCatalog, refresh]);

  //////////////////////////////////////////////////////
  // Provider
  //////////////////////////////////////////////////////

  return (
    <NotebookContext.Provider
      value={{
        notebooks,
        loading,
        refresh,
        createNotebook,
        deleteNotebook,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
}

//////////////////////////////////////////////////////
// Hook
//////////////////////////////////////////////////////

export function useNotebook() {
  const context =
    useContext(NotebookContext);

  if (!context) {
    throw new Error(
      "NotebookContext missing"
    );
  }

  return context;
}
