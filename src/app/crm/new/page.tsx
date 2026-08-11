"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export default function CreateLeadPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-3xl font-bold text-white">
            Create Lead
          </h1>

          <p className="mt-3 text-slate-400">
            Create Lead module is coming soon.
          </p>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}