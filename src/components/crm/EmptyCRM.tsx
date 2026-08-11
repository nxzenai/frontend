"use client";

import { Users } from "lucide-react";

export default function EmptyCRM() {
  return (
    <div
      className="
        rounded-2xl
        border
        border-dashed
        border-slate-700
        bg-slate-900
        py-24
        text-center
      "
    >
      <Users
        className="mx-auto text-slate-500"
        size={60}
      />

      <h2 className="mt-6 text-2xl font-semibold text-white">
        No Leads Found
      </h2>

      <p className="mt-3 text-slate-400">
        There are currently no leads matching
        your filters.
      </p>
    </div>
  );
}