"use client";

import {
  Loader2,
  CheckCircle2,
  Cpu,
  BrainCircuit,
} from "lucide-react";

interface TrainingProgressProps {
  loading: boolean;
}

export default function TrainingProgress({
  loading,
}: TrainingProgressProps) {

  if (!loading) return null;

  return (

    <div className="rounded-2xl border border-blue-500/20 bg-slate-900 p-6">

      {/* Header */}

      <div className="flex items-center gap-4">

        <Loader2
          className="animate-spin text-blue-500"
          size={34}
        />

        <div>

          <h2 className="text-2xl font-bold text-white">

            AutoML Training Running

          </h2>

          <p className="mt-1 text-slate-400">

            Please wait while NxZen AI Studio trains and evaluates models.

          </p>

        </div>

      </div>

      {/* Progress Bar */}

      <div className="mt-8 h-3 overflow-hidden rounded-full bg-slate-800">

        <div
          className="
            h-full
            w-full
            animate-pulse
            rounded-full
            bg-gradient-to-r
            from-blue-500
            via-cyan-500
            to-blue-500
          "
        />

      </div>

      {/* Training Steps */}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <div className="rounded-xl border border-slate-700 bg-slate-950 p-5">

          <Cpu
            className="text-blue-400"
            size={24}
          />

          <h3 className="mt-4 font-semibold text-white">

            Dataset Validation

          </h3>

          <p className="mt-2 text-sm text-slate-400">

            Validating uploaded dataset...

          </p>

        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-950 p-5">

          <BrainCircuit
            className="text-purple-400"
            size={24}
          />

          <h3 className="mt-4 font-semibold text-white">

            Feature Engineering

          </h3>

          <p className="mt-2 text-sm text-slate-400">

            Preprocessing features...

          </p>

        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-950 p-5">

          <Loader2
            className="animate-spin text-green-400"
            size={24}
          />

          <h3 className="mt-4 font-semibold text-white">

            Model Training

          </h3>

          <p className="mt-2 text-sm text-slate-400">

            Training all supported algorithms...

          </p>

        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-950 p-5">

          <CheckCircle2
            className="text-yellow-400"
            size={24}
          />

          <h3 className="mt-4 font-semibold text-white">

            Leaderboard

          </h3>

          <p className="mt-2 text-sm text-slate-400">

            Ranking models by performance...

          </p>

        </div>

      </div>

      {/* Footer */}

      <div className="mt-8 rounded-xl border border-blue-500/20 bg-blue-500/10 p-5">

        <p className="text-sm text-blue-300">

          Depending on dataset size and selected algorithms,
          training may take a few seconds to several minutes.

        </p>

      </div>

    </div>

  );

}