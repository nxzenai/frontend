"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AgenticProjects from "@/components/agentic/AgenticProjects";

export default function AgenticPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AgenticProjects />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
