"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import ChatWindow from "@/components/genai/ChatWindow";

export default function GenAIPage() {

  return (

    <ProtectedRoute>

      <DashboardLayout>

        <ChatWindow />

      </DashboardLayout>

    </ProtectedRoute>

  );

}
