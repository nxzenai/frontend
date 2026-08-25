"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AutoMLResult, PredictionValue } from "@/types/automl";

const COLORS = [
  "#60a5fa", "#34d399", "#fbbf24", "#f472b6",
  "#a78bfa", "#fb7185", "#22d3ee", "#a3e635",
];

function label(value: PredictionValue): string {
  return value === null ? "null" : String(value);
}

function SilhouetteQuality({ score }: { score: number }) {
  const quality = score < 0.25
    ? { label: "Poor", classes: "border-red-500/30 bg-red-500/10 text-red-300" }
    : score < 0.5
      ? { label: "Moderate", classes: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200" }
      : { label: "Good", classes: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" };

  return (
    <div className={`rounded-xl border px-4 py-3 ${quality.classes}`}>
      <p className="text-xs font-semibold uppercase tracking-wide">Silhouette quality: {quality.label}</p>
      <p className="mt-1 text-sm">{score.toFixed(3)}</p>
      <p className="mt-1 text-xs opacity-80">Poor &lt; 0.25, moderate 0.25-0.49, good &gt;= 0.50.</p>
    </div>
  );
}

export default function ResultsVisualizations({ result }: { result: AutoMLResult }) {
  const visuals = result.visual_results;
  const hasSilhouette =
    result.task === "clustering" &&
    typeof result.best_model?.silhouette_score === "number";
  if ((!visuals || Object.keys(visuals).length === 0) && !hasSilhouette) return null;

  const clusterGroups = new Map<string, Array<{ x: number; y: number }>>();
  visuals?.cluster_points?.forEach((point) => {
    const key = label(point.cluster);
    clusterGroups.set(key, [...(clusterGroups.get(key) ?? []), { x: point.x, y: point.y }]);
  });

  const regressionPoints = visuals?.regression_points ?? [];
  const regressionValues = regressionPoints.flatMap((point) => [point.actual, point.predicted]);
  const regressionMin = regressionValues.length ? Math.min(...regressionValues) : 0;
  const regressionMax = regressionValues.length ? Math.max(...regressionValues) : 1;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
      <p className="text-xs font-medium uppercase tracking-wider text-blue-400">Visual Results</p>
      <h2 className="mt-2 font-semibold text-slate-100">Best model diagnostics</h2>

      {result.task === "classification" && visuals?.roc_curves && (
        <div className="mt-5 h-80" aria-label="ROC curve chart">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart>
              <CartesianGrid stroke="#1e293b" />
              <XAxis type="number" dataKey="fpr" domain={[0, 1]} stroke="#94a3b8" label={{ value: "False positive rate", position: "insideBottom", offset: -4 }} />
              <YAxis type="number" dataKey="tpr" domain={[0, 1]} stroke="#94a3b8" label={{ value: "True positive rate", angle: -90, position: "insideLeft" }} />
              <Tooltip contentStyle={{ background: "#020617", borderColor: "#334155" }} />
              <Legend />
              <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#64748b" strokeDasharray="4 4" />
              {visuals.roc_curves.map((curve, index) => (
                <Line
                  key={`${label(curve.class_name)}-${index}`}
                  data={curve.points}
                  dataKey="tpr"
                  name={`Class ${label(curve.class_name)} (AUC ${curve.auc.toFixed(3)})`}
                  stroke={COLORS[index % COLORS.length]}
                  dot={false}
                  type="monotone"
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {result.task === "regression" && regressionPoints.length > 0 && (
        <div className="mt-5 h-80" aria-label="Actual versus predicted chart">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid stroke="#1e293b" />
              <XAxis type="number" dataKey="actual" name="Actual" stroke="#94a3b8" />
              <YAxis type="number" dataKey="predicted" name="Predicted" stroke="#94a3b8" />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#020617", borderColor: "#334155" }} />
              <ReferenceLine segment={[{ x: regressionMin, y: regressionMin }, { x: regressionMax, y: regressionMax }]} stroke="#34d399" strokeDasharray="5 5" />
              <Scatter name="Actual vs predicted" data={regressionPoints} fill="#60a5fa" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}

      {result.task === "clustering" && (
        <>
          {typeof result.best_model?.silhouette_score === "number" && (
            <div className="mt-5"><SilhouetteQuality score={result.best_model.silhouette_score} /></div>
          )}
          {visuals?.cluster_points && <div className="mt-5 h-80" aria-label="Two-dimensional cluster chart">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid stroke="#1e293b" />
                <XAxis type="number" dataKey="x" name="Component 1" stroke="#94a3b8" />
                <YAxis type="number" dataKey="y" name="Component 2" stroke="#94a3b8" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#020617", borderColor: "#334155" }} />
                <Legend />
                {[...clusterGroups.entries()].map(([cluster, points], index) => (
                  <Scatter key={cluster} name={`Cluster ${cluster}`} data={points} fill={COLORS[index % COLORS.length]} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
          </div>}
          {visuals?.cluster_points && <p className="mt-2 text-xs text-slate-500">
            {visuals?.reduced_with_pca
              ? "PCA was applied only to project the transformed feature space into two dimensions for this visualization."
              : "The first two transformed dimensions are shown; PCA was not required."}
          </p>}
        </>
      )}
    </section>
  );
}
