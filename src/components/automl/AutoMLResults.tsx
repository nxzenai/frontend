"use client";

import { useState } from "react";
import ResultsVisualizations from "@/components/automl/ResultsVisualizations";
import type { AutoMLResult } from "@/types/automl";

type Tab = "overview" | "comparison" | "performance" | "explainability" | "details";
type Column = { key: string; label: string; percent?: boolean };

const COLUMNS: Record<string, Column[]> = {
  classification: [
    { key: "accuracy", label: "Accuracy", percent: true }, { key: "precision", label: "Precision", percent: true },
    { key: "recall", label: "Recall", percent: true }, { key: "f1_score", label: "F1", percent: true },
    { key: "roc_auc", label: "ROC-AUC" }, { key: "training_time", label: "Training time" },
  ],
  regression: [
    { key: "r2_score", label: "R²" }, { key: "mae", label: "MAE" },
    { key: "mse", label: "MSE" }, { key: "rmse", label: "RMSE" }, { key: "mape", label: "MAPE" },
    { key: "training_time", label: "Training time" },
  ],
  clustering: [
    { key: "silhouette_score", label: "Silhouette" }, { key: "davies_bouldin_score", label: "Davies-Bouldin" },
    { key: "calinski_harabasz_score", label: "Calinski-Harabasz" }, { key: "n_clusters", label: "Clusters" },
  ],
};
const LABELS: Record<string, string> = {
  f1_score: "F1", r2_score: "R²", silhouette_score: "Silhouette", roc_auc: "ROC-AUC",
  calinski_harabasz_score: "Calinski-Harabasz", davies_bouldin_score: "Davies-Bouldin",
  accuracy: "Accuracy", precision: "Precision", recall: "Recall", mae: "MAE", mse: "MSE",
  rmse: "RMSE", mape: "MAPE", explained_variance: "Explained variance",
};
const NATIVE_SELECTION: Record<string, string> = {
  classification: "f1_score", regression: "r2_score", clustering: "silhouette_score",
};
const formatModel = (name?: string | null) => name ? name.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Unavailable";
const numeric = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
function formatValue(value: unknown, percent = false) {
  if (!numeric(value)) return "—";
  if (percent) return `${(Math.abs(value) <= 1 ? value * 100 : value).toFixed(1)}%`;
  return value.toLocaleString("en-US", { maximumFractionDigits: 3 });
}

function LeaderboardTable({ result }: { result: AutoMLResult }) {
  const [showAll, setShowAll] = useState(false);
  const [sort, setSort] = useState<{ key: string; descending: boolean } | null>(null);
  const columns = COLUMNS[result.task] ?? [];
  const board = [...(result.leaderboard ?? [])];
  if (sort) board.sort((a, b) => {
    const left = a[sort.key], right = b[sort.key];
    if (!numeric(left)) return 1;
    if (!numeric(right)) return -1;
    return sort.descending ? right - left : left - right;
  });
  const rows = showAll ? board : board.slice(0, 10);
  return <section className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
    <div className="mb-3 flex items-center justify-between gap-3"><div><h3 className="font-semibold">Model Leaderboard</h3><p className="text-xs text-slate-400">Original ranking is shown by default. Column sorting changes this table only.</p></div>{board.length > 10 && <button type="button" onClick={() => setShowAll(!showAll)} className="shrink-0 text-xs text-blue-300 hover:underline">{showAll ? "Top 10" : `View all ${board.length}`}</button>}</div>
    <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs">
      <thead className="border-b border-slate-800 text-slate-400"><tr><th className="px-2 py-2">Rank</th><th className="px-2 py-2">{result.task === "clustering" ? "Algorithm" : "Model"}</th>{columns.map((column) => <th key={column.key} className="px-2 py-2 text-right"><button type="button" onClick={() => setSort((current) => ({ key: column.key, descending: current?.key === column.key ? !current.descending : true }))} className="hover:text-blue-200">{column.label}</button></th>)}<th className="px-2 py-2">Status</th></tr></thead>
      <tbody>{rows.map((row, index) => <tr key={`${row.model_name ?? row.model}-${index}`} className={`border-b border-slate-800/70 ${row.rank === 1 || (!row.rank && index === 0 && !sort) ? "bg-blue-500/10" : ""}`}>
        <td className="px-2 py-2 text-slate-400">#{row.rank ?? (sort ? (result.leaderboard ?? []).indexOf(row) + 1 : index + 1)}</td>
        <td className="px-2 py-2 font-medium text-slate-200" title={row.model_name ?? row.model}>{formatModel(row.model_name ?? row.model)}</td>
        {columns.map((column) => <td key={column.key} className="whitespace-nowrap px-2 py-2 text-right tabular-nums text-slate-300">{formatValue(row[column.key], column.percent)}{column.key === "training_time" && numeric(row[column.key]) ? " s" : ""}</td>)}
        <td className="px-2 py-2 capitalize text-slate-400" title={row.error ?? row.skip_reason ?? undefined}>{row.status ?? (row.success ? "success" : "unavailable")}</td>
      </tr>)}</tbody>
    </table></div>
  </section>;
}

export default function AutoMLResults({ result }: { result: AutoMLResult }) {
  const [tab, setTab] = useState<Tab>("overview");
  const best = result.best_model;
  const statistics = result.training_statistics ?? result.statistics;
  const selectionMetric = result.ranking_metric ?? NATIVE_SELECTION[result.task] ?? "silhouette_score";
  const selectionLabel = LABELS[selectionMetric] ?? selectionMetric;
  const lowerIsBetter = ["mae", "mse", "rmse", "mape"].includes(selectionMetric);
  const columns = (COLUMNS[result.task] ?? []).filter((column) => column.key !== "training_time" && column.key !== "n_clusters");
  const tabs: Tab[] = result.task === "clustering" ? ["overview", "comparison", "performance", "details"] : ["overview", "comparison", "performance", "explainability", "details"];
  const extraRecommendations = (result.recommendations ?? []).filter((item) => !/^Best model:|was used as the primary|^The best model includes the fitted preprocessor/i.test(item));
  const attempted = statistics?.models_trained ?? result.leaderboard?.length;
  const succeeded = statistics?.successful_models ?? result.leaderboard?.filter((row) => row.success).length;
  const failed = statistics?.failed_models ?? (attempted ?? 0) - (succeeded ?? 0);

  return <div className="space-y-4">
    <header className="rounded-2xl border border-blue-500/20 bg-slate-900/80 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-blue-300">{result.task} results</p>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1"><h2 className="text-2xl font-bold text-white">{formatModel(best?.model_name)}</h2><span className="text-sm text-slate-400">Best {result.task === "clustering" ? "algorithm" : "model"} · Selected by {selectionLabel}</span></div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">{columns.filter((column) => numeric(best?.[column.key])).map((column) => <div key={column.key} className="rounded-lg bg-slate-950/70 px-3 py-2"><p className="text-xs text-slate-400">{column.label}</p><p className="mt-1 font-semibold text-slate-100">{formatValue(best?.[column.key], column.percent)}</p></div>)}</div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400"><span>Attempted: {attempted ?? "—"}</span><span>Successful: {succeeded ?? "—"}</span><span>Failed: {failed ?? "—"}</span>{numeric(best?.training_time) && <span>Best-model training: {formatValue(best.training_time)} s</span>}</div>
    </header>

    <nav aria-label="AutoML results" className="flex flex-wrap gap-1 border-b border-slate-800">{tabs.map((item) => <button key={item} type="button" onClick={() => setTab(item)} aria-current={tab === item ? "page" : undefined} className={`border-b-2 px-3 py-2 text-sm capitalize ${tab === item ? "border-blue-400 text-blue-200" : "border-transparent text-slate-400 hover:text-slate-200"}`}>{item === "comparison" ? "Model Comparison" : item}</button>)}</nav>

    {tab === "overview" && <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><h3 className="font-semibold">Why this {result.task === "clustering" ? "algorithm" : "model"} won</h3><p className="mt-2 text-sm text-slate-300">{formatModel(best?.model_name)} ranked first{numeric(best?.[selectionMetric]) ? ` with ${lowerIsBetter ? "the lowest" : "the highest"} ${selectionLabel} (${formatValue(best?.[selectionMetric], result.task === "classification")}) among successful models` : ` under the ${selectionLabel} selection order`}.</p></section>
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><h3 className="font-semibold">Training Summary</h3><dl className="mt-2 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-400">Models attempted</dt><dd>{attempted ?? "—"}</dd></div><div><dt className="text-slate-400">Successful</dt><dd>{succeeded ?? "—"}</dd></div><div><dt className="text-slate-400">Failed</dt><dd>{failed ?? "—"}</dd></div><div><dt className="text-slate-400">Artifact</dt><dd>{result.artifact?.available ? "Ready" : "Unavailable"}</dd></div>{result.task === "clustering" && <><div><dt className="text-slate-400">Clusters</dt><dd>{best?.effective_number_of_clusters ?? result.cluster_distribution?.filter((entry) => String(entry.cluster_id) !== "-1").length ?? "—"}</dd></div><div><dt className="text-slate-400">Future prediction</dt><dd>{result.artifact?.prediction_supported ? "Supported" : "Unavailable"}</dd></div></>}</dl></section>
      {result.task === "clustering" && result.clustering && <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 lg:col-span-2"><h3 className="font-semibold">Clustering Setup</h3><p className="mt-2 text-sm text-slate-300">Count mode: {result.clustering.cluster_count_mode} · Requested: {result.clustering.requested_number_of_clusters ?? "Automatic"} · Effective: {result.clustering.effective_number_of_clusters ?? "Model-derived"}</p></section>}
    </div>}
    {tab === "comparison" && <div className="space-y-4"><ResultsVisualizations result={result} view="comparison" /><LeaderboardTable result={result} /></div>}
    {tab === "performance" && <ResultsVisualizations result={result} view="performance" />}
    {tab === "explainability" && <ResultsVisualizations result={result} view="explainability" />}
    {tab === "details" && <div className="space-y-4">
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><h3 className="font-semibold">Training Details</h3><dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3"><div><dt className="text-slate-400">Task</dt><dd className="capitalize">{result.task}</dd></div><div><dt className="text-slate-400">Models attempted</dt><dd>{attempted ?? "—"}</dd></div><div><dt className="text-slate-400">Successful</dt><dd>{succeeded ?? "—"}</dd></div><div><dt className="text-slate-400">Failed</dt><dd>{failed ?? "—"}</dd></div><div><dt className="text-slate-400">Best model</dt><dd>{formatModel(best?.model_name)}</dd></div><div><dt className="text-slate-400">Artifact</dt><dd>{result.artifact?.available ? "Ready" : "Unavailable"}</dd></div></dl>{statistics && <details className="mt-4 text-xs text-slate-400"><summary className="cursor-pointer">View raw metadata</summary><pre className="mt-2 max-h-56 overflow-auto rounded bg-slate-950 p-3">{JSON.stringify(statistics, null, 2)}</pre></details>}</section>
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><h3 className="font-semibold">Recommendations</h3><ul className="mt-2 space-y-1 text-sm text-slate-300"><li>Selection metric: {selectionLabel}</li><li>{succeeded ?? 0} of {attempted ?? 0} models trained successfully.</li><li>Saved artifact: {result.artifact?.available ? "available for supported prediction modes" : "unavailable"}.</li>{extraRecommendations.map((item, index) => <li key={index}>{item}</li>)}</ul></section>
      {!!result.leaderboard?.some((row) => row.success === false) && <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><h3 className="font-semibold">Failed or skipped models</h3><ul className="mt-2 space-y-2 text-sm text-slate-300">{result.leaderboard.filter((row) => row.success === false).map((row, index) => <li key={index}><span className="font-medium">{formatModel(row.model_name ?? row.model)}:</span> {row.skip_reason ?? row.error ?? row.status ?? "Unavailable"}</li>)}</ul></section>}
    </div>}
  </div>;
}
