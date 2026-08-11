"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Sparkles } from "lucide-react";

export default function WelcomeBanner() {
  const { user } = useAuth();

  const firstName =
    user?.full_name?.split(" ")[0] ?? "User";

  return (
    <section
      className="
        mb-8
        rounded-2xl
        border
        border-slate-800
        bg-gradient-to-r
        from-[#0B1225]
        via-[#111827]
        to-[#0F172A]
        px-10
        py-8
      "
    >
      <div className="max-w-5xl">

        {/* Badge */}

        <div className="flex items-center gap-3">

          <Sparkles
            size={22}
            className="text-blue-400"
          />

          <span
            className="
              rounded-full
              bg-blue-600/20
              px-3
              py-1
              text-sm
              font-semibold
              text-blue-400
            "
          >
            Enterprise Workspace
          </span>

        </div>

        {/* Heading */}

        <h1
          className="
            mt-6
            text-4xl
            font-bold
            tracking-tight
            text-white
          "
        >
          Welcome back,
          <span className="text-blue-400">
            {" "}
            {firstName}
          </span>
          👋
        </h1>

        {/* Description */}

        <p
          className="
            mt-5
            max-w-4xl
            text-lg
            leading-8
            text-slate-400
          "
        >
          Build AI models, write Python code, analyze SQL datasets,
          manage CRM pipelines, and deploy intelligent applications
          from one unified AI development platform.
        </p>

      </div>
    </section>
  );
}