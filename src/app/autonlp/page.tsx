"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import AutoNLPWorkspace from "@/components/autonlp/AutoNLPWorkspace";

export default function AutoNLPPage() {

  return (

    <ProtectedRoute>

      <DashboardLayout>

        <AutoNLPWorkspace />

      </DashboardLayout>

    </ProtectedRoute>

  );

}
