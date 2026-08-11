"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import AutoMLWorkspace from "@/components/automl/AutoMLWorkspace";

export default function AutoMLPage() {

  return (

    <ProtectedRoute>

      <DashboardLayout>

        <AutoMLWorkspace />

      </DashboardLayout>

    </ProtectedRoute>

  );

}