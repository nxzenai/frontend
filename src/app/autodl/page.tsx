"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import AutoDLV2Workspace from "@/components/autodl-v2/AutoDLV2Workspace";
import LearningReturnLink from "@/components/learning/LearningReturnLink";

export default function AutoDLPage() {

  return (

    <ProtectedRoute>

      <DashboardLayout>

        <LearningReturnLink /><AutoDLV2Workspace />

      </DashboardLayout>

    </ProtectedRoute>

  );

}
