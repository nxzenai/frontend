"use client";

import {
  CheckCircle2,
  XCircle,
  Trophy,
  Clock3,
} from "lucide-react";

import type {
  LeaderboardEntry,
} from "@/types/automl";

interface LeaderboardProps {

  leaderboard: LeaderboardEntry[];

}

function score(entry: LeaderboardEntry): string {

  if (entry.accuracy !== undefined)
    return entry.accuracy.toFixed(4);

  if (entry.f1_score !== undefined)
    return entry.f1_score.toFixed(4);

  if (entry.precision !== undefined)
    return entry.precision.toFixed(4);

  if (entry.recall !== undefined)
    return entry.recall.toFixed(4);

  if (entry.roc_auc !== undefined)
    return entry.roc_auc.toFixed(4);

  if (entry.r2_score !== undefined)
    return entry.r2_score.toFixed(4);

  if (entry.silhouette_score !== undefined)
    return entry.silhouette_score.toFixed(4);

  if (entry.explained_variance !== undefined)
    return entry.explained_variance.toFixed(4);

  return "--";

}

export default function Leaderboard({

  leaderboard,

}: LeaderboardProps) {

  if (!leaderboard.length)
    return null;

  return (

    <div className="rounded-2xl border border-slate-700 bg-slate-900">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-700 p-6">

        <div>

          <h2 className="text-2xl font-bold text-white">

            AutoML Leaderboard

          </h2>

          <p className="mt-2 text-sm text-slate-400">

            Ranked Machine Learning Models

          </p>

        </div>

        <div className="rounded-xl bg-yellow-500/10 p-3">

          <Trophy
            className="text-yellow-400"
            size={28}
          />

        </div>

      </div>

      {/* Table */}

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-slate-950">

            <tr>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">

                Rank

              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">

                Model

              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">

                Score

              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">

                Time

              </th>

              <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">

                Status

              </th>

            </tr>

          </thead>

          <tbody>

            {leaderboard.map(

              (model, index) => (

                <tr

                  key={index}

                  className="border-t border-slate-800 hover:bg-slate-800/40"

                >

                  {/* Rank */}

                  <td className="px-6 py-4">

                    <div className="flex items-center gap-3">

                      {index === 0 && (

                        <Trophy

                          size={18}

                          className="text-yellow-400"

                        />

                      )}

                      <span className="font-semibold text-white">

                        #{model.rank}

                      </span>

                    </div>

                  </td>

                  {/* Model */}

                  <td className="px-6 py-4">

                    <div>

                      <p className="font-semibold text-white">

                        {model.model_name}

                      </p>

                    </div>

                  </td>

                  {/* Score */}

                  <td className="px-6 py-4 text-center">

                    <span className="rounded-lg bg-blue-500/10 px-4 py-2 font-semibold text-blue-300">

                      {score(model)}

                    </span>

                  </td>

                  {/* Training Time */}

                  <td className="px-6 py-4 text-center">

                    <div className="flex items-center justify-center gap-2 text-slate-300">

                      <Clock3 size={15} />

                      {model.training_time}s

                    </div>

                  </td>

                  {/* Status */}

                  <td className="px-6 py-4 text-center">

                    {model.success ? (

                      <div className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-2 text-green-400">

                        <CheckCircle2 size={16} />

                        Success

                      </div>

                    ) : (

                      <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-2 text-red-400">

                        <XCircle size={16} />

                        Failed

                      </div>

                    )}

                  </td>

                </tr>

              ),

            )}

          </tbody>

        </table>

      </div>

      {/* Footer */}

      <div className="border-t border-slate-700 bg-slate-950 p-5">

        <p className="text-sm text-slate-400">

          {leaderboard.length} models evaluated

        </p>

      </div>

    </div>

  );

}