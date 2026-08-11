"use client";

import {
  Trophy,
  Clock3,
  CheckCircle2,
  BrainCircuit,
  Award,
} from "lucide-react";

interface BestModelCardProps {
  model: any;
}

function getPrimaryMetric(model: any) {
  const metrics = model?.metrics ?? {};

  if (metrics.f1_score != null)
    return ["F1 Score", metrics.f1_score];

  if (metrics.accuracy != null)
    return ["Accuracy", metrics.accuracy];

  if (metrics.precision != null)
    return ["Precision", metrics.precision];

  if (metrics.recall != null)
    return ["Recall", metrics.recall];

  if (metrics.roc_auc != null)
    return ["ROC AUC", metrics.roc_auc];

  return ["Score", model?.score];
}

export default function BestModelCard({
  model,
}: BestModelCardProps) {
  if (!model) return null;

  const metrics = model.metrics ?? {};

  const [metricName, metricValue] =
    getPrimaryMetric(model);

  return (
    <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-amber-500/5 shadow-xl">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-yellow-500/20 p-6">

        <div className="flex items-center gap-4">

          <div className="rounded-2xl bg-yellow-500/20 p-4">

            <Trophy
              className="text-yellow-400"
              size={34}
            />

          </div>

          <div>

            <h2 className="text-3xl font-bold text-white">

              Best Model

            </h2>

            <p className="mt-1 text-slate-400">

              Highest Ranked Model selected by AutoML

            </p>

          </div>

        </div>

        <Award
          className="text-yellow-400"
          size={40}
        />

      </div>

      {/* Model Info */}

      <div className="grid gap-6 p-6 md:grid-cols-2">

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

          <div className="flex items-center gap-3">

            <BrainCircuit
              size={22}
              className="text-blue-400"
            />

            <span className="font-semibold text-white">

              Algorithm

            </span>

          </div>

          <h3 className="mt-4 text-2xl font-bold text-blue-400">

            {model.model_name}

          </h3>

        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

          <div className="flex items-center gap-3">

            <Clock3
              size={22}
              className="text-green-400"
            />

            <span className="font-semibold text-white">

              Training Time

            </span>

          </div>

          <h3 className="mt-4 text-2xl font-bold text-green-400">

            {model.training_time.toFixed(3)} sec

          </h3>

        </div>

      </div>

      {/* Highlight */}

      <div className="grid gap-6 px-6 pb-6 md:grid-cols-2">

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

          <p className="text-sm uppercase tracking-wide text-slate-400">

            Ranking Metric

          </p>

          <h2 className="mt-3 text-4xl font-bold text-blue-400">

            {metricValue != null
              ? Number(metricValue).toFixed(4)
              : "--"}

          </h2>

          <p className="mt-2 text-slate-300">

            {metricName}

          </p>

        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

          <p className="text-sm uppercase tracking-wide text-slate-400">

            Overall Score

          </p>

          <h2 className="mt-3 text-4xl font-bold text-emerald-400">

            {model.score.toFixed(4)}

          </h2>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-green-400">

            <CheckCircle2 size={18} />

            Training Successful

          </div>

        </div>

      </div>

      {/* Metrics */}

      <div className="border-t border-slate-700 bg-slate-950 p-6">

        <h3 className="mb-6 text-xl font-semibold text-white">

          Performance Metrics

        </h3>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">

          <MetricCard
            title="Accuracy"
            value={metrics.accuracy}
          />

          <MetricCard
            title="Precision"
            value={metrics.precision}
          />

          <MetricCard
            title="Recall"
            value={metrics.recall}
          />

          <MetricCard
            title="F1 Score"
            value={metrics.f1_score}
          />

          <MetricCard
            title="ROC AUC"
            value={metrics.roc_auc}
          />

        </div>

      </div>

    </div>
  );
}

interface MetricCardProps {

  title: string;

  value?: number | null;

}

function MetricCard({

  title,

  value,

}: MetricCardProps) {

  return (

    <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">

      <p className="text-xs uppercase tracking-wide text-slate-400">

        {title}

      </p>

      <p className="mt-3 text-2xl font-bold text-white">

        {value == null

          ? "--"

          : value.toFixed(4)}

      </p>

    </div>

  );

}