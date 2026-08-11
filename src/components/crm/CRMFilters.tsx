"use client";

import {
  Search,
  RotateCw,
  Filter,
} from "lucide-react";

interface Props {
  search: string;
  setSearch: (value: string) => void;

  status: string;
  setStatus: (value: string) => void;

  priority: string;
  setPriority: (value: string) => void;

  onRefresh: () => void;
}

export default function CRMFilters({
  search,
  setSearch,

  status,
  setStatus,

  priority,
  setPriority,

  onRefresh,
}: Props) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-6
      "
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

        {/* Search */}

        <div className="relative flex-1">

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
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              py-3
              pl-11
              pr-4
              text-white
              outline-none
              transition
              focus:border-blue-500
            "
          />

        </div>

        {/* Status */}

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
          className="
            rounded-xl
            border
            border-slate-700
            bg-slate-950
            px-4
            py-3
            text-white
            outline-none
            focus:border-blue-500
          "
        >
          <option value="">
            All Status
          </option>

          <option value="new">
            New
          </option>

          <option value="contacted">
            Contacted
          </option>

          <option value="qualified">
            Qualified
          </option>

          <option value="demo_scheduled">
            Demo Scheduled
          </option>

          <option value="proposal_sent">
            Proposal Sent
          </option>

          <option value="enrolled">
            Enrolled
          </option>

          <option value="lost">
            Lost
          </option>

        </select>

        {/* Priority */}

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value)
          }
          className="
            rounded-xl
            border
            border-slate-700
            bg-slate-950
            px-4
            py-3
            text-white
            outline-none
            focus:border-blue-500
          "
        >
          <option value="">
            All Priority
          </option>

          <option value="hot">
            🔴 Hot
          </option>

          <option value="warm">
            🟡 Warm
          </option>

          <option value="cold">
            🔵 Cold
          </option>

        </select>

        {/* Refresh */}

        <button
          onClick={onRefresh}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-blue-600
            px-5
            py-3
            font-medium
            text-white
            transition
            hover:bg-blue-700
          "
        >
          <RotateCw size={18} />

          Refresh

        </button>

      </div>

      {/* Filter Summary */}

      <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">

        <Filter
          size={16}
          className="text-blue-400"
        />

        <span>
          Filter leads by search, status and priority.
        </span>

      </div>

    </div>
  );
}