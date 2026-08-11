"use client";

import React from "react";

interface Props {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthLayout({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <main className="relative flex min-h-screen overflow-hidden bg-[#020617]">

      {/* Background */}

      <div className="absolute inset-0">

        <div className="absolute -left-32 top-10 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl" />

      </div>

      {/* Left */}

      <section className="relative hidden w-1/2 flex-col justify-center px-20 lg:flex">

        <div className="max-w-xl">

          <div className="mb-8 inline-flex rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-semibold text-blue-300">

            NxZen AI

          </div>

          <h1 className="mb-8 text-6xl font-black leading-tight text-white">

            NxZen
            <br />
            AI Studio

          </h1>

          <p className="mb-10 text-xl leading-9 text-slate-300">

            Build, Train, Deploy and Scale Artificial Intelligence
            solutions using one unified enterprise platform.

          </p>

          <div className="grid grid-cols-2 gap-6">

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">

              <h3 className="mb-2 font-bold text-white">
                Python Lab
              </h3>

              <p className="text-sm text-slate-400">
                Interactive notebook environment.
              </p>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">

              <h3 className="mb-2 font-bold text-white">
                AutoML
              </h3>

              <p className="text-sm text-slate-400">
                No-code Machine Learning.
              </p>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">

              <h3 className="mb-2 font-bold text-white">
                Agentic AI
              </h3>

              <p className="text-sm text-slate-400">
                Enterprise AI Agents.
              </p>

            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">

              <h3 className="mb-2 font-bold text-white">
                GenAI Studio
              </h3>

              <p className="text-sm text-slate-400">
                LLM Applications & RAG.
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* Right */}

      <section className="relative flex w-full items-center justify-center px-8 lg:w-1/2">

        <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900/80 p-10 shadow-2xl backdrop-blur-xl">

          <div className="mb-8 text-center">

            <h2 className="mb-2 text-4xl font-bold text-white">

              {title}

            </h2>

            <p className="text-slate-400">

              {subtitle}

            </p>

          </div>

          {children}

        </div>

      </section>

    </main>
  );
}