"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AutoDLV2Workspace from "@/components/autodl-v2/AutoDLV2Workspace";

export default function AutoDLV2Page() {
  return <ProtectedRoute><DashboardLayout><AutoDLV2Workspace /></DashboardLayout></ProtectedRoute>;
}
