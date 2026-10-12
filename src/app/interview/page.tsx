"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LearningWorkspace from "@/components/learning/LearningWorkspace";
export default function Page() { return <ProtectedRoute><DashboardLayout><LearningWorkspace view="interview" /></DashboardLayout></ProtectedRoute>; }
