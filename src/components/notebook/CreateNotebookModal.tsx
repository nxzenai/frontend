"use client";

import { useState } from "react";

import useNotebook from "@/hooks/useNotebook";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CreateNotebookModal({
  open,
  onClose,
}: Props) {
  const { createNotebook } =
    useNotebook();

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  if (!open) return null;

  async function submit() {
    await createNotebook({
      title,
      description,
      visibility: "private",
      tags: [],
    });

    setTitle("");
    setDescription("");

    onClose();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70">

      <div className="w-full max-w-lg rounded-xl bg-slate-900 p-8">

        <h2 className="mb-6 text-2xl font-bold">

          New Notebook

        </h2>

        <input
          placeholder="Notebook Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
        />

        <textarea
          rows={4}
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          className="mb-6 w-full rounded-lg border border-slate-700 bg-slate-950 p-3"
        />

        <div className="flex justify-end gap-4">

          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-6 py-3"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            className="rounded-lg bg-blue-600 px-6 py-3"
          >
            Create
          </button>

        </div>

      </div>

    </div>
  );
}