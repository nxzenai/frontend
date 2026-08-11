"use client";

import { Plus, Users } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function CRMHeader() {
  const { user } = useAuth();

  const canCreateLead =
    user?.role === "super_admin" ||
    user?.role === "admin" ||
    user?.role === "sales";

  return (
    <div className="flex items-center justify-between">

      {/* Left */}

      <div>

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-blue-600/20 p-3">

            <Users
              className="text-blue-400"
              size={28}
            />

          </div>

          <div>

            <h1 className="text-3xl font-bold text-white">

              CRM

            </h1>

            <p className="mt-1 text-slate-400">

              Lead Management & Sales Pipeline

            </p>

          </div>

        </div>

        <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-400">

          Manage demo bookings, qualify leads,
          schedule follow-ups and convert
          prospects into enrolled students.

        </p>

      </div>

      {/* Right */}

      {canCreateLead && (

        <Link
          href="/crm/new"
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-blue-600
            px-5
            py-3
            font-semibold
            text-white
            transition
            hover:bg-blue-700
          "
        >

          <Plus size={18} />

          New Lead

        </Link>

      )}

    </div>
  );
}