"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import NotebookList from "@/components/notebook/NotebookList";

export default function PythonLabPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">
            Python Lab
          </h1>

          <p className="mt-2 text-slate-400">
            Create, edit and execute Python notebooks
            using NxZen AI Studio.
          </p>
        </div>

        <NotebookList />

      </DashboardLayout>
    </ProtectedRoute>
  );
}