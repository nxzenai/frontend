"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import SQLWorkspace from "@/components/sql/SQLWorkspace";

export default function SQLPage() {
  return (
    <ProtectedRoute>

      <DashboardLayout>

        <SQLWorkspace />

      </DashboardLayout>

    </ProtectedRoute>
  );
}