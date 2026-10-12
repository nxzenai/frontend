"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import AutoNLPWorkspace from "@/components/autonlp/AutoNLPWorkspace";
import LearningReturnLink from "@/components/learning/LearningReturnLink";

export default function AutoNLPPage() {

  return (

    <ProtectedRoute>

      <DashboardLayout>

        <LearningReturnLink /><AutoNLPWorkspace />

      </DashboardLayout>

    </ProtectedRoute>

  );

}
