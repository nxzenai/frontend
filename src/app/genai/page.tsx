"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import ChatWindow from "@/components/genai/ChatWindow";
import GenAIExtras from "@/components/genai/GenAIExtras";

export default function GenAIPage() {
  const [tab, setTab] = useState<"chat" | "documents" | "prompts">("chat");

  return (

    <ProtectedRoute>

      <DashboardLayout>

        <nav className="mb-3 flex gap-2" aria-label="GenAI workspace">
          {([ ["chat", "Chat"], ["documents", "Documents"], ["prompts", "Prompt Lab"] ] as const).map(([key, label]) => (
            <button key={key} type="button" onClick={() => setTab(key)} className={`rounded px-3 py-2 text-sm ${tab === key ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"}`}>{label}</button>
          ))}
        </nav>
        <div className={tab === "chat" ? "" : "hidden"}><ChatWindow /></div>
        {tab !== "chat" && <GenAIExtras mode={tab} />}

      </DashboardLayout>

    </ProtectedRoute>

  );

}
