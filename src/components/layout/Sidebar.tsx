"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

import SidebarSection from "./SidebarSection";

import { NAVIGATION } from "@/lib/navigation";
import { canAccess, UserRole } from "@/lib/rbac";

import {
  ShieldCheck,
  LogOut,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();

  const { user, logout } = useAuth();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  //////////////////////////////////////////////////////
  // Navigation Groups
  //////////////////////////////////////////////////////

  const homeItems = NAVIGATION.filter(
    (item) =>
      item.section === "home" &&
      canAccess(
        user?.role as UserRole,
        item.permission
      )
  );

  const labItems = NAVIGATION.filter(
    (item) =>
      item.section === "labs" &&
      canAccess(
        user?.role as UserRole,
        item.permission
      )
  );

  const businessItems = NAVIGATION.filter(
    (item) =>
      item.section === "business" &&
      canAccess(
        user?.role as UserRole,
        item.permission
      )
  );

  const platformItems = NAVIGATION.filter(
    (item) =>
      item.section === "platform" &&
      canAccess(
        user?.role as UserRole,
        item.permission
      )
  );

  //////////////////////////////////////////////////////
  // UI
  //////////////////////////////////////////////////////

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-800 bg-[#020617]">

      {/* Logo */}

      <div className="border-b border-slate-800 px-6 py-6">

        <h1 className="text-2xl font-bold text-white">
          NxZen AI Studio
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Enterprise AI Platform
        </p>

      </div>

      {/* Navigation */}

      <div
    className="
        flex-1
        overflow-y-auto
        px-4
        py-5
        pb-40
    "
>

    <SidebarSection
        title="Home"
        items={homeItems}
    />

    <SidebarSection
        title="AI Labs"
        items={labItems}
    />

    <SidebarSection
        title="Business"
        items={businessItems}
    />

    <SidebarSection
        title="Platform"
        items={platformItems}
    />

</div>
      {/* Bottom Profile */}

      <div
    className="
        sticky
        bottom-0
        border-t
        border-slate-800
        bg-[#020617]
        p-4
    "
>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">

          {/* User */}

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">

              {user?.full_name?.charAt(0).toUpperCase()}

            </div>

            <div className="min-w-0 flex-1">

              <p className="truncate font-semibold text-white">

                {user?.full_name}

              </p>

              <p className="truncate text-xs text-slate-400">

                {user?.email}

              </p>

            </div>

          </div>

          {/* Role */}

          <div className="mt-4">

            <span
              className={`
                inline-flex
                items-center
                gap-2
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold
                ${
                  user?.role === "super_admin"
                    ? "bg-red-500/20 text-red-300"
                    : user?.role === "admin"
                    ? "bg-purple-500/20 text-purple-300"
                    : user?.role === "instructor"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-green-500/20 text-green-300"
                }
              `}
            >
              <ShieldCheck size={14} />

              {user?.role
                ?.replace("_", " ")
                .toUpperCase()}
            </span>

          </div>

          {/* Divider */}

          <div className="my-4 border-t border-slate-800" />

          {/* Logout */}

          <button
            onClick={handleLogout}
            className="
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-red-500/30
              bg-red-500/10
              px-4
              py-3
              text-red-300
              transition-all
              duration-200
              hover:bg-red-500
              hover:text-white
            "
          >
            <LogOut size={18} />

            Logout

          </button>

        </div>

        {/* Version */}

        <div className="mt-4 text-center">

          <p className="text-xs text-slate-500">
            NxZen AI Studio
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Enterprise Edition • v1.0.0
          </p>

        </div>

      </div>

    </aside>
  );
}