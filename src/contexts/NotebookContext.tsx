"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

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
  const [notebooks, setNotebooks] =
    useState<Notebook[]>([]);

  const [loading, setLoading] =
    useState(true);

  //////////////////////////////////////////////////////
  // Refresh Notebooks
  //////////////////////////////////////////////////////

  async function refresh() {
    // Do not call backend if user is not logged in
    if (!AuthService.isAuthenticated()) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const data =
        await NotebookService.getAll();

      setNotebooks(data);
    } catch (err: any) {
      // Ignore expired token errors.
      if (
        err?.response?.status !== 401
      ) {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }

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
    refresh();
  }, []);

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