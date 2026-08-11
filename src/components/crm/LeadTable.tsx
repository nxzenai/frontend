"use client";

import { Lead } from "@/types/crm";

import {
  ChevronRight,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";

import StatusBadge from "./StatusBadge";

interface Props {
  leads: Lead[];

  onSelectLead: (
    lead: Lead
  ) => void;
}

export default function LeadTable({
  leads,
  onSelectLead,
}: Props) {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
      "
    >

      {/* Header */}

      <div
        className="
          grid
          grid-cols-12
          border-b
          border-slate-800
          bg-slate-950
          px-6
          py-4
          text-sm
          font-semibold
          uppercase
          tracking-wider
          text-slate-400
        "
      >

        <div className="col-span-3">
          Lead
        </div>

        <div className="col-span-2">
          Program
        </div>

        <div className="col-span-2">
          Priority
        </div>

        <div className="col-span-2">
          Status
        </div>

        <div className="col-span-2">
          Demo Date
        </div>

        <div className="col-span-1 text-right">
          Action
        </div>

      </div>
            {/* Rows */}

      <div>

        {leads.map((lead) => (

          <button
            key={lead.id}
            onClick={() => onSelectLead(lead)}
            className="
              grid
              w-full
              grid-cols-12
              items-center
              border-b
              border-slate-800
              px-6
              py-5
              text-left
              transition
              hover:bg-slate-800/50
            "
          >

            {/* Name */}

            <div className="col-span-3">

              <h3 className="font-semibold text-white">

                {lead.name}

              </h3>

              <div className="mt-2 space-y-1">

                <div className="flex items-center gap-2 text-sm text-slate-400">

                  <Mail size={14} />

                  {lead.email}

                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">

                  <Phone size={14} />

                  {lead.phone}

                </div>

              </div>

            </div>

            {/* Program */}

            <div className="col-span-2">

              <span
                className="
                  rounded-full
                  bg-blue-500/20
                  px-3
                  py-1
                  text-sm
                  text-blue-300
                "
              >

                {lead.program_interest}

              </span>

            </div>
                        {/* Priority */}

            <div className="col-span-2">

              <StatusBadge
                value={lead.priority}
                type="priority"
              />

            </div>

            {/* Status */}

            <div className="col-span-2">

              <StatusBadge
                value={lead.status}
                type="status"
              />

            </div>

            {/* Demo */}

            <div className="col-span-2">

              <div className="flex items-center gap-2 text-slate-300">

                <Calendar size={16} />

                {lead.preferred_demo_date ||
                  "--"}

              </div>

            </div>

            {/* Action */}

            <div className="col-span-1 flex justify-end">

              <ChevronRight
                className="
                  text-slate-500
                  transition
                  group-hover:text-white
                "
                size={22}
              />

            </div>

          </button>

        ))}

      </div>

    </div>

  );

}