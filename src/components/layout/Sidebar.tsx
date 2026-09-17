"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

import SidebarSection from "./SidebarSection";

import { NAVIGATION } from "@/lib/navigation";
import { canAccess, UserRole } from "@/lib/rbac";

import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  ShieldCheck,
} from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  mobile?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export default function Sidebar({
  collapsed = false,
  mobile = false,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  const navigation = NAVIGATION;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const labItems = navigation.filter(
    (item) =>
      item.section === "labs" &&
      canAccess(user?.role as UserRole, item.permission)
  );

  const businessItems = navigation.filter(
    (item) =>
      item.section === "business" &&
      canAccess(user?.role as UserRole, item.permission)
  );

  const platformItems = navigation.filter(
    (item) =>
      item.section === "platform" &&
      canAccess(user?.role as UserRole, item.permission)
  );

  const dashboardItems = navigation.filter(
    (item) =>
      item.section === "dashboard" &&
      canAccess(user?.role as UserRole, item.permission)
  );

  const showExpanded = mobile || !collapsed;

  return (
    <aside className="flex h-full w-full flex-col bg-[#020617]">
      {/* Branding */}
      <div
        className={`
          flex h-24 shrink-0 items-center border-b border-slate-800
          ${showExpanded ? "justify-between px-4" : "justify-center px-2"}
        `}
      >
        <div className="flex min-w-0 items-center">
          {showExpanded ? (
            <div>
              <Image
                src="/nxzenai-navbar-logo-v2.png"
                width={2172}
                height={724}
                priority
                alt="NxZenAI"
                className="h-[36px] w-[145px] object-contain object-left"
              />

              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                AI Studio
              </p>
            </div>
          ) : (
            <Image
              src="/nxzenai-icon.png"
              width={48}
              height={48}
              alt="NxZenAI"
              className="h-9 w-9 object-contain"
            />
          )}
        </div>

        {!mobile && onToggleCollapse && showExpanded && (
          <button
            type="button"
            aria-label="Collapse sidebar"
            onClick={onToggleCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <ChevronLeft size={17} />
          </button>
        )}
      </div>

      {/* Collapsed Expand Button */}
      {!mobile && collapsed && onToggleCollapse && (
        <div className="flex justify-center border-b border-slate-800 py-3">
          <button
            type="button"
            aria-label="Expand sidebar"
            onClick={onToggleCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <div
        className="
          flex-1 overflow-y-auto px-3 py-4
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        <SidebarSection
          title="AI Labs"
          items={labItems}
          collapsed={!showExpanded}
          onNavigate={onNavigate}
        />

        <SidebarSection
          title="Management"
          items={businessItems}
          collapsed={!showExpanded}
          onNavigate={onNavigate}
        />

        <SidebarSection
          title="System"
          items={platformItems}
          collapsed={!showExpanded}
          onNavigate={onNavigate}
        />

        <SidebarSection
          title="Dashboard"
          items={dashboardItems}
          collapsed={!showExpanded}
          onNavigate={onNavigate}
        />
      </div>

      {/* Profile Footer */}
      <div className="shrink-0 border-t border-slate-800 bg-[#020617] p-3">
        {showExpanded ? (
          <>
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {user?.full_name?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.full_name || "User"}
                </p>

                <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                  <ShieldCheck size={12} />
                  <span className="truncate capitalize">
                    {user?.role?.replace("_", " ") || "User"}
                  </span>
                </div>
              </div>

              <button
                type="button"
                title="Logout"
                onClick={handleLogout}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={16} />
              </button>
            </div>

            <p className="mt-3 text-center text-[10px] text-slate-600">
              Enterprise Edition • v1.0.0
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div
              title={user?.full_name || "User"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white"
            >
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
            </div>

            <button
              type="button"
              title="Logout"
              onClick={handleLogout}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}