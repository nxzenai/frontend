"use client";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import EDAWorkspace from "@/components/eda/EDAWorkspace";
export default function EDAPage() { return <ProtectedRoute><DashboardLayout><header className="mb-7"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">Explore · understand · improve</p><h1 className="mt-2 text-4xl font-bold text-white">EDA Hub</h1><p className="mt-2 max-w-3xl text-slate-400">A private workspace for inspecting tabular data, assessing quality, exploring patterns, applying safe transformations, and generating analysis reports.</p></header><EDAWorkspace /></DashboardLayout></ProtectedRoute>; }
