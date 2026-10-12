"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import SQLWorkspace from "@/components/sql/SQLWorkspace";
import LearningReturnLink from "@/components/learning/LearningReturnLink";

export default function SQLPage() {
  return (
    <ProtectedRoute>

      <DashboardLayout>

        <LearningReturnLink /><SQLWorkspace />

      </DashboardLayout>

    </ProtectedRoute>
  );
}
