"use client";

import { Notebook } from "@/types/notebook";

import Link from "next/link";

import {
  Trash2,
  Calendar,
} from "lucide-react";

import useNotebook from "@/hooks/useNotebook";

interface Props {
  notebook: Notebook;
}

export default function NotebookCard({
  notebook,
}: Props) {
  const { deleteNotebook } =
    useNotebook();

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <div className="flex items-start justify-between">

        <Link
          href={`/notebooks/${notebook.id}`}
        >
          <h2 className="text-xl font-semibold hover:text-blue-400">

            {notebook.title}

          </h2>
        </Link>

        <button
          onClick={() =>
            deleteNotebook(notebook.id)
          }
        >
          <Trash2
            className="text-red-500"
            size={18}
          />
        </button>

      </div>

      <p className="mt-3 text-sm text-slate-400">

        {notebook.description}

      </p>

      <div className="mt-5 flex items-center justify-between text-xs text-slate-500">

        <span>

          {notebook.visibility}

        </span>

        <span className="flex items-center gap-1">

          <Calendar size={14} />

          {new Date(
            notebook.created_at
          ).toLocaleDateString()}

        </span>

      </div>

    </div>
  );
}