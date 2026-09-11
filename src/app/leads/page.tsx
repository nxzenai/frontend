"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import LeadsWorkspace from "@/components/leads/LeadsWorkspace";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";
import { canAccess, type UserRole } from "@/lib/rbac";

export default function LeadsPage() {
  const { user } = useAuth();
  return <ProtectedRoute><DashboardLayout compactSidebar>
    <nav aria-label="Studio navigation" className="mb-5 flex gap-4 text-sm text-blue-300 lg:hidden"><Link href="/dashboard">Studio</Link>{canAccess(user?.role as UserRole, "crm") && <Link href="/crm">CRM</Link>}</nav>
    {canAccess(user?.role as UserRole, "leads") ? <LeadsWorkspace /> : <p role="alert" className="text-slate-300">You do not have permission to manage leads.</p>}
  </DashboardLayout></ProtectedRoute>;
}
