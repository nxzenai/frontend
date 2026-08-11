"use client";

import React from "react";

interface Props {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

export default function StatsCard({
  title,
  value,
  icon,
}: Props) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-400">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {value}
          </h2>

        </div>

        <div className="rounded-lg bg-blue-600/20 p-3">
          {icon}
        </div>

      </div>

    </div>
  );
}