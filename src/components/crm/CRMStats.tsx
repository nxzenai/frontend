"use client";

import {
  Users,
  Phone,
  BadgeCheck,
  GraduationCap,
  XCircle,
} from "lucide-react";

import { DashboardResponse } from "@/types/crm";

interface Props {
  dashboard: DashboardResponse | null;
}

export default function CRMStats({
  dashboard,
}: Props) {

  const stats = [

    {
      title: "Total Leads",
      value: dashboard?.total ?? 0,
      icon: Users,
      color: "text-blue-400",
    },

    {
      title: "Contacted",
      value: dashboard?.contacted ?? 0,
      icon: Phone,
      color: "text-yellow-400",
    },

    {
      title: "Qualified",
      value: dashboard?.qualified ?? 0,
      icon: BadgeCheck,
      color: "text-purple-400",
    },

    {
      title: "Enrolled",
      value: dashboard?.enrolled ?? 0,
      icon: GraduationCap,
      color: "text-green-400",
    },

    {
      title: "Lost",
      value: dashboard?.lost ?? 0,
      icon: XCircle,
      color: "text-red-400",
    },

  ];

  return (

    <div className="grid gap-6 md:grid-cols-5">

      {stats.map((item) => {

        const Icon = item.icon;

        return (

          <div
            key={item.title}
            className="
              rounded-2xl
              border
              border-slate-800
              bg-slate-900
              p-6
            "
          >

            <div className="flex items-center justify-between">

              <p className="text-sm text-slate-400">

                {item.title}

              </p>

              <Icon
                className={item.color}
                size={22}
              />

            </div>

            <h2 className="mt-6 text-3xl font-bold">

              {item.value}

            </h2>

          </div>

        );

      })}

    </div>

  );
}