"use client";

interface Props {
  bestModel: any;
  task?: string;
}

export default function BestModelCard({
  bestModel,
  task,
}: Props) {
  if (!bestModel) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
      <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Best Model
            </p>

            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              {bestModel.model_name}
            </h2>

            {task && (
              <p className="mt-1 text-sm capitalize text-slate-600">
                {task}
              </p>
            )}
          </div>

          <div className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
            ✓ Selected
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
        {bestModel.accuracy !==
          undefined && (
          <Metric
            label="Accuracy"
            value={bestModel.accuracy}
          />
        )}

        {bestModel.f1_score !==
          undefined && (
          <Metric
            label="F1 Score"
            value={bestModel.f1_score}
          />
        )}

        {bestModel.roc_auc !==
          undefined &&
          bestModel.roc_auc !== null && (
            <Metric
              label="ROC-AUC"
              value={bestModel.roc_auc}
            />
          )}

        {bestModel.r2_score !==
          undefined && (
          <Metric
            label="R² Score"
            value={bestModel.r2_score}
          />
        )}

        {bestModel.silhouette_score !==
          undefined && (
          <Metric
            label="Silhouette"
            value={
              bestModel.silhouette_score
            }
          />
        )}

        {bestModel.mae !==
          undefined && (
          <Metric
            label="MAE"
            value={bestModel.mae}
            raw
          />
        )}

        {bestModel.training_time !==
          undefined && (
          <Metric
            label="Training Time"
            value={
              bestModel.training_time
            }
            suffix="s"
            raw
          />
        )}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  suffix = "",
  raw = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  raw?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-950">
        {raw
          ? `${Number(value).toFixed(2)}${suffix}`
          : `${(Number(value) * 100).toFixed(
              1
            )}%`}
      </p>
    </div>
  );
}