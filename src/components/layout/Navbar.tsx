"use client";

import useAuth from "@/hooks/useAuth";

import {
  Bell,
  Search,
  ShieldCheck,
} from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header
      className="
        flex
        h-20
        items-center
        justify-between
        border-b
        border-slate-800
        bg-[#020617]
        px-8
      "
    >
      {/* Left Section */}
      <div className="flex flex-col">

        <h1 className="text-2xl font-bold text-white">
          NxZen AI Studio
        </h1>

        <p className="text-sm text-slate-400">
          Enterprise AI Development Platform
        </p>

      </div>

      {/* Center Search */}
      <div className="hidden w-full max-w-xl px-12 lg:block">

        <div className="relative">

          <Search
            size={18}
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-500
            "
          />

          <input
            type="text"
            placeholder="Search notebooks, SQL queries, CRM..."
            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-900
              py-3
              pl-11
              pr-4
              text-sm
              outline-none
              transition
              focus:border-blue-500
            "
          />

        </div>

      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">

        {/* Notifications */}
        <button
          className="
            rounded-xl
            border
            border-slate-700
            bg-slate-900
            p-3
            transition
            hover:border-blue-500
          "
        >
          <Bell size={18} />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-4">

          {/* Avatar */}
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-blue-600
              text-lg
              font-bold
              text-white
            "
          >
            {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
          </div>

          {/* User Details */}
          <div className="hidden text-right md:block">

            <p className="font-semibold text-white">
              {user?.full_name}
            </p>

            <p className="text-sm text-slate-400">
              {user?.email}
            </p>

            <div
              className="
                mt-2
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-blue-900/40
                px-3
                py-1
                text-xs
                font-semibold
                text-blue-300
              "
            >
              <ShieldCheck size={12} />

              {user?.role
                ?.replace("_", " ")
                .toUpperCase()}
            </div>

          </div>

        </div>

      </div>

    </header>
  );
}