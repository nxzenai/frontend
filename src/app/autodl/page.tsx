"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import AutoDLWorkspace from "@/components/autodl/AutoDLWorkspace";

export default function AutoDLPage() {

  return (

    <ProtectedRoute>

      <DashboardLayout>

        <AutoDLWorkspace />

      </DashboardLayout>

    </ProtectedRoute>

  );

}
