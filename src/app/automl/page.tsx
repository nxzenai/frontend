"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AutoMLWorkspace from "@/components/automl/AutoMLWorkspace";
import LearningReturnLink from "@/components/learning/LearningReturnLink";

export default function AutoMLPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <LearningReturnLink /><AutoMLWorkspace />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
