"use client";

interface Props {
  value: string;
  type: "status" | "priority";
}

export default function StatusBadge({
  value,
  type,
}: Props) {
  //////////////////////////////////////////////////////
  // Priority Colors
  //////////////////////////////////////////////////////

  if (type === "priority") {
    switch (value) {
      case "hot":
        return (
          <span
            className="
              inline-flex
              items-center
              rounded-full
              bg-red-500/20
              px-3
              py-1
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-red-400
            "
          >
            🔴 Hot
          </span>
        );

      case "warm":
        return (
          <span
            className="
              inline-flex
              items-center
              rounded-full
              bg-amber-500/20
              px-3
              py-1
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-amber-400
            "
          >
            🟡 Warm
          </span>
        );

      case "cold":
        return (
          <span
            className="
              inline-flex
              items-center
              rounded-full
              bg-sky-500/20
              px-3
              py-1
              text-xs
              font-semibold
              uppercase
              tracking-wide
              text-sky-400
            "
          >
            🔵 Cold
          </span>
        );

      default:
        return (
          <span
            className="
              inline-flex
              items-center
              rounded-full
              bg-slate-700
              px-3
              py-1
              text-xs
              font-semibold
              text-slate-300
            "
          >
            Unknown
          </span>
        );
    }
  }

  //////////////////////////////////////////////////////
  // Status Colors
  //////////////////////////////////////////////////////

  switch (value) {
    case "new":
      return (
        <span
          className="
            inline-flex
            rounded-full
            bg-blue-500/20
            px-3
            py-1
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-blue-400
          "
        >
          New
        </span>
      );

    case "contacted":
      return (
        <span
          className="
            inline-flex
            rounded-full
            bg-cyan-500/20
            px-3
            py-1
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-cyan-400
          "
        >
          Contacted
        </span>
      );

    case "qualified":
      return (
        <span
          className="
            inline-flex
            rounded-full
            bg-purple-500/20
            px-3
            py-1
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-purple-400
          "
        >
          Qualified
        </span>
      );

    case "demo_scheduled":
      return (
        <span
          className="
            inline-flex
            rounded-full
            bg-indigo-500/20
            px-3
            py-1
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-indigo-400
          "
        >
          Demo Scheduled
        </span>
      );

    case "proposal_sent":
      return (
        <span
          className="
            inline-flex
            rounded-full
            bg-orange-500/20
            px-3
            py-1
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-orange-400
          "
        >
          Proposal Sent
        </span>
      );

    case "enrolled":
      return (
        <span
          className="
            inline-flex
            rounded-full
            bg-green-500/20
            px-3
            py-1
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-green-400
          "
        >
          Enrolled
        </span>
      );

    case "lost":
      return (
        <span
          className="
            inline-flex
            rounded-full
            bg-red-500/20
            px-3
            py-1
            text-xs
            font-semibold
            uppercase
            tracking-wide
            text-red-400
          "
        >
          Lost
        </span>
      );

    default:
      return (
        <span
          className="
            inline-flex
            rounded-full
            bg-slate-700
            px-3
            py-1
            text-xs
            font-semibold
            text-slate-300
          "
        >
          Unknown
        </span>
      );
  }
}