"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

import {
  Plus,
  Code2,
  Database,
  Users,
  UserPlus,
  ArrowRight,
} from "lucide-react";

export default function QuickActions() {
  const router = useRouter();

  const { user } = useAuth();

  const isAdmin =
    user?.role === "admin" ||
    user?.role === "super_admin";

  const isSuperAdmin =
    user?.role === "super_admin";

  return (
    <section className="mb-8">

      <div className="mb-5 flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Frequently used actions based on your role.
          </p>

        </div>

      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        {/* Python Lab */}

        <button
          onClick={() => router.push("/dashboard")}
          className="
            group
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
            p-6
            text-left
            transition
            hover:border-blue-500
            hover:bg-slate-800
          "
        >

          <div className="mb-5 flex items-center justify-between">

            <div className="rounded-xl bg-blue-600/20 p-3">

              <Code2
                className="text-blue-400"
                size={28}
              />

            </div>

            <ArrowRight
              size={18}
              className="opacity-40 transition group-hover:translate-x-1"
            />

          </div>

          <h3 className="text-lg font-semibold">
            New Python Notebook
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Launch a new notebook inside Python Lab.
          </p>

        </button>

        {/* SQL */}

        <button
          onClick={() => router.push("/sql")}
          className="
            group
            rounded-2xl
            border
            border-slate-800
            bg-slate-900
            p-6
            text-left
            transition
            hover:border-green-500
            hover:bg-slate-800
          "
        >

          <div className="mb-5 flex items-center justify-between">

            <div className="rounded-xl bg-green-600/20 p-3">

              <Database
                className="text-green-400"
                size={28}
              />

            </div>

            <ArrowRight
              size={18}
              className="opacity-40 transition group-hover:translate-x-1"
            />

          </div>

          <h3 className="text-lg font-semibold">
            SQL Workspace
          </h3>

          <p className="mt-2 text-sm text-slate-400">
            Open SQL Lab and execute queries.
          </p>

        </button>

        {/* CRM */}

        {isAdmin && (

          <button
            onClick={() => router.push("/crm")}
            className="
              group
              rounded-2xl
              border
              border-slate-800
              bg-slate-900
              p-6
              text-left
              transition
              hover:border-purple-500
              hover:bg-slate-800
            "
          >

            <div className="mb-5 flex items-center justify-between">

              <div className="rounded-xl bg-purple-600/20 p-3">

                <Users
                  className="text-purple-400"
                  size={28}
                />

              </div>

              <ArrowRight
                size={18}
                className="opacity-40 transition group-hover:translate-x-1"
              />

            </div>

            <h3 className="text-lg font-semibold">
              CRM Dashboard
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Manage leads, customers and conversions.
            </p>

          </button>

        )}

        {/* User */}

        {isSuperAdmin && (

          <button
            onClick={() => router.push("/users")}
            className="
              group
              rounded-2xl
              border
              border-slate-800
              bg-slate-900
              p-6
              text-left
              transition
              hover:border-orange-500
              hover:bg-slate-800
            "
          >

            <div className="mb-5 flex items-center justify-between">

              <div className="rounded-xl bg-orange-600/20 p-3">

                <UserPlus
                  className="text-orange-400"
                  size={28}
                />

              </div>

              <ArrowRight
                size={18}
                className="opacity-40 transition group-hover:translate-x-1"
              />

            </div>

            <h3 className="text-lg font-semibold">
              User Management
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Create and manage platform users.
            </p>

          </button>

        )}

      </div>

    </section>
  );
}