"use client";

import { useState, type ReactNode } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip,
  XAxis, YAxis,
} from "recharts";

import type { AutoMLResult, LeaderboardEntry, PredictionValue } from "@/types/automl";

const COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f472b6", "#a78bfa", "#fb7185", "#22d3ee", "#a3e635"];
const finite = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
const label = (value: PredictionValue) => value === null ? "null" : String(value);
const clusterLabel = (value: PredictionValue) => String(value) === "-1" ? "Noise / Outliers (-1)" : `Cluster ${label(value)}`;

type Metric = { key: keyof LeaderboardEntry; name: string; higher: boolean; percent?: boolean; explanation: string };
const METRICS: Record<string, Metric[]> = {
  classification: [
    { key: "accuracy", name: "Accuracy", higher: true, percent: true, explanation: "Fraction of predictions that were correct." },
    { key: "precision", name: "Precision", higher: true, percent: true, explanation: "Weighted precision across classes." },
    { key: "recall", name: "Recall", higher: true, percent: true, explanation: "Weighted recall across classes." },
    { key: "f1_score", name: "F1", higher: true, percent: true, explanation: "Weighted balance of precision and recall." },
    { key: "roc_auc", name: "ROC-AUC", higher: true, percent: true, explanation: "Ranking quality across classification thresholds." },
  ],
  regression: [
    { key: "r2_score", name: "R²", higher: true, explanation: "How much target variation the model explains." },
    { key: "mae", name: "MAE", higher: false, explanation: "Average absolute prediction error." },
    { key: "rmse", name: "RMSE", higher: false, explanation: "Error measure that gives larger mistakes more weight." },
  ],
  clustering: [
    { key: "silhouette_score", name: "Silhouette", higher: true, explanation: "Higher values generally indicate better-separated clusters." },
    { key: "davies_bouldin_score", name: "Davies-Bouldin", higher: false, explanation: "Lower values generally indicate better-separated clusters." },
    { key: "calinski_harabasz_score", name: "Calinski-Harabasz", higher: true, explanation: "Higher values generally indicate stronger separation relative to within-cluster variation." },
  ],
};

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return <section className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
    <h3 className="font-semibold text-slate-100">{title}</h3>
    {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    <div className="mt-4">{children}</div>
  </section>;
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-400">{children}</p>;
}

function SilhouetteQuality({ score }: { score: number }) {
  const quality = score < 0.25
    ? { label: "Poor", classes: "border-red-500/30 bg-red-500/10 text-red-300" }
    : score < 0.5
      ? { label: "Moderate", classes: "border-yellow-500/30 bg-yellow-500/10 text-yellow-200" }
      : { label: "Good", classes: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" };
  return <div className={`rounded-xl border px-4 py-3 ${quality.classes}`}>
    <p className="text-xs font-semibold uppercase tracking-wide">Silhouette quality: {quality.label}</p>
    <p className="mt-1 text-sm">{score.toFixed(3)}</p>
    <p className="mt-1 text-xs opacity-80">Poor &lt; 0.25, moderate 0.25-0.49, good &gt;= 0.50.</p>
  </div>;
}

function displayMetric(value: number, percent?: boolean) {
  // Training classification metrics are fractions; tolerate older percentage payloads.
  return percent ? `${(Math.abs(value) <= 1 ? value * 100 : value).toFixed(2)}%` : value.toFixed(3);
}

function ModelComparison({ result }: { result: AutoMLResult }) {
  const options = METRICS[result.task] ?? [];
  const [selectedKey, setSelectedKey] = useState<string>(String(result.ranking_metric ?? options[0]?.key ?? ""));
  const [limit, setLimit] = useState<5 | 8 | 10 | "all">(8);
  const metric = options.find((item) => item.key === selectedKey) ?? options[0];
  if (!metric) return null;
  const rows = (result.leaderboard ?? []).flatMap((row) => {
    const value = row[metric.key];
    if (row.success === false || row.status === "failed" || row.status === "skipped" || !finite(value)) return [];
    return [{ model: String(row.model_name ?? row.model ?? "Model"), value: metric.percent && Math.abs(value) <= 1 ? value * 100 : value }];
  }).sort((a, b) => metric.higher ? b.value - a.value : a.value - b.value);
  const visibleRows = limit === "all" ? rows : rows.slice(0, limit);
  return <Section title="Model Comparison" hint="Compare how successful models performed on one selected metric at a time.">
    <div className="flex flex-wrap gap-2" role="group" aria-label="Comparison metric">
      {options.map((option) => <button key={option.key} type="button" onClick={() => setSelectedKey(String(option.key))}
        aria-pressed={metric.key === option.key}
        className={`rounded-lg border px-3 py-1.5 text-xs ${metric.key === option.key ? "border-blue-400 bg-blue-500/20 text-blue-100" : "border-slate-700 text-slate-300 hover:bg-slate-800"}`}>
        {option.name}
      </button>)}
    </div>
    <p className="mt-3 text-xs text-slate-400">{metric.explanation} {metric.higher ? "Higher is better." : "Lower is better."}</p>
    {rows.length > 8 && <div className="mt-3 flex gap-2 text-xs">{([5, 8, 10, "all"] as const).map((option) => <button key={option} type="button" aria-pressed={limit === option} onClick={() => setLimit(option)} className={`rounded border px-2 py-1 ${limit === option ? "border-blue-400 text-blue-200" : "border-slate-700 text-slate-400"}`}>{option === "all" ? "All" : `Top ${option}`}</button>)}</div>}
    {rows.length ? <div className="mt-4 min-w-0" style={{ height: Math.max(240, visibleRows.length * 36) }} aria-label={`${metric.name} model comparison`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={visibleRows} layout="vertical" margin={{ left: 12, right: 20 }}>
          <CartesianGrid stroke="#1e293b" horizontal={false} />
          <XAxis type="number" domain={["auto", "auto"]} stroke="#94a3b8" tickFormatter={(value: number) => metric.percent ? `${value}%` : String(value)} />
          <YAxis type="category" dataKey="model" width={145} stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(value: string) => value.length > 21 ? `${value.slice(0, 19)}…` : value} />
          <Tooltip contentStyle={{ background: "#020617", borderColor: "#334155" }} formatter={(value) => finite(value) ? displayMetric(value, metric.percent) : "Unavailable"} />
          <Bar dataKey="value" name={metric.name} fill="#60a5fa" maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div> : <div className="mt-4"><Empty>{metric.name} is not available for the trained models.</Empty></div>}
  </Section>;
}

function bestClassificationRow(result: AutoMLResult): LeaderboardEntry | undefined {
  const name = result.best_model?.model_name;
  return result.leaderboard?.find((row) => row.success !== false && (row.model_name ?? row.model) === name);
}

function classificationMetrics(result: AutoMLResult) {
  const row = bestClassificationRow(result);
  const matrix = row?.confusion_matrix;
  const classes = row?.classes;
  if (!matrix || !classes || !classes.length || matrix.length !== classes.length ||
    matrix.some((values) => !Array.isArray(values) || values.length !== classes.length || values.some((value) => !finite(value)))) return null;
  const perClass = classes.map((className, index) => {
    const tp = matrix[index][index];
    const support = matrix[index].reduce((sum, value) => sum + value, 0);
    const predicted = matrix.reduce((sum, values) => sum + values[index], 0);
    const precision = predicted ? tp / predicted : 0;
    const recall = support ? tp / support : 0;
    return { className, support, precision, recall, f1: precision + recall ? 2 * precision * recall / (precision + recall) : 0 };
  });
  return { matrix, classes, perClass };
}

function ConfusionMatrix({ data }: { data: NonNullable<ReturnType<typeof classificationMetrics>> }) {
  const { matrix, classes } = data;
  const max = Math.max(1, ...matrix.flat());
  const correct = matrix.reduce((sum, row, index) => sum + row[index], 0);
  return <Section title="Confusion Matrix" hint="Rows are actual classes; columns are predicted classes. Diagonal cells are correct predictions.">
    <div className="overflow-x-auto"><table className="min-w-max border-collapse text-center text-sm">
      <thead><tr><th className="p-2 text-left text-slate-400">Actual ↓ / Predicted →</th>{classes.map((value, index) => <th key={index} className="min-w-20 p-2 text-slate-300">{label(value)}</th>)}</tr></thead>
      <tbody>{matrix.map((row, index) => <tr key={index}><th className="p-2 text-left text-slate-300">{label(classes[index])}</th>{row.map((count, column) => <td key={column} className="border border-slate-800 p-3 font-semibold text-white" style={{ backgroundColor: `rgba(${index === column ? "52, 211, 153" : "248, 113, 113"}, ${0.12 + 0.48 * count / max})` }}>{count}</td>)}</tr>)}</tbody>
    </table></div>
    {classes.length === 2 && <p className="mt-3 text-xs text-slate-400">Correct: {correct} · False positives for {label(classes[1])}: {matrix[0][1]} · False negatives for {label(classes[1])}: {matrix[1][0]}</p>}
  </Section>;
}

function PerClassMetrics({ data }: { data: NonNullable<ReturnType<typeof classificationMetrics>> }) {
  return <Section title="Per-Class Metrics" hint="Precision measures prediction correctness; recall measures how many actual members of each class were found.">
    <div className="overflow-x-auto"><table className="w-full min-w-[450px] text-left text-sm">
      <thead className="text-slate-400"><tr><th className="p-2">Class</th><th className="p-2">Precision</th><th className="p-2">Recall</th><th className="p-2">F1</th><th className="p-2">Support</th></tr></thead>
      <tbody>{data.perClass.map((row, index) => <tr key={index} className="border-t border-slate-800 text-slate-200"><td className="p-2">{label(row.className)}</td><td className="p-2">{displayMetric(row.precision, true)}</td><td className="p-2">{displayMetric(row.recall, true)}</td><td className="p-2">{displayMetric(row.f1, true)}</td><td className="p-2">{row.support}</td></tr>)}</tbody>
    </table></div>
  </Section>;
}

function RocChart({ result, classes }: { result: AutoMLResult; classes?: PredictionValue[] }) {
  const all = (result.visual_results?.roc_curves ?? []).filter((curve) => finite(curve.auc) && curve.points?.some((point) => finite(point.fpr) && finite(point.tpr)));
  const binary = classes?.length === 2;
  const curves = binary ? all.filter((curve) => label(curve.class_name) === label(classes![1])) : !classes && all.length === 2 ? [] : all;
  const title = binary ? `ROC Curve — Positive class: ${label(classes![1])}` : "One-vs-Rest ROC Curves";
  return <Section title={title} hint="Shows the trade-off between true-positive and false-positive rates across thresholds.">
    {curves.length ? <div className="h-80 min-w-0" aria-label="ROC curve chart"><ResponsiveContainer width="100%" height="100%"><LineChart>
      <CartesianGrid stroke="#1e293b" />
      <XAxis type="number" dataKey="fpr" domain={[0, 1]} stroke="#94a3b8" label={{ value: "False positive rate", position: "insideBottom", offset: -4 }} />
      <YAxis type="number" dataKey="tpr" domain={[0, 1]} stroke="#94a3b8" label={{ value: "True positive rate", angle: -90, position: "insideLeft" }} />
      <Tooltip contentStyle={{ background: "#020617", borderColor: "#334155" }} />
      <Legend />
      <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#64748b" strokeDasharray="4 4" />
      {curves.map((curve, index) => <Line key={`${label(curve.class_name)}-${index}`} data={curve.points.filter((point) => finite(point.fpr) && finite(point.tpr))} dataKey="tpr" name={`${label(curve.class_name)} (AUC ${curve.auc.toFixed(3)})`} stroke={COLORS[index % COLORS.length]} dot={false} type="monotone" />)}
    </LineChart></ResponsiveContainer></div> : <Empty>ROC-AUC is not available for this result.</Empty>}
  </Section>;
}

function PrecisionRecallChart({ result }: { result: AutoMLResult }) {
  const curve = result.visual_results?.precision_recall_curve;
  const points = (curve?.points ?? []).filter((point) => finite(point.recall) && finite(point.precision));
  const averagePrecision = curve?.average_precision;
  if (points.length < 2) return null;
  return <Section title={`Precision–Recall Curve · Positive class: ${label(curve!.positive_class)}`} hint="Shows the precision–recall trade-off across thresholds, especially useful with imbalanced classes.">
    {finite(averagePrecision) && <p className="mb-2 text-xs text-slate-300">Average precision: {averagePrecision.toFixed(3)}</p>}
    <div className="h-80 min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{ bottom: 18 }}>
      <CartesianGrid stroke="#1e293b" /><XAxis type="number" dataKey="recall" domain={[0, 1]} stroke="#94a3b8" label={{ value: "Recall", position: "insideBottom", offset: -4 }} /><YAxis type="number" domain={[0, 1]} stroke="#94a3b8" label={{ value: "Precision", angle: -90, position: "insideLeft" }} />
      <Tooltip contentStyle={{ background: "#020617", borderColor: "#334155" }} /><Line dataKey="precision" name="Precision" stroke="#34d399" dot={false} type="linear" isAnimationActive={false} />
    </LineChart></ResponsiveContainer></div>
  </Section>;
}

function ThresholdChart({ result }: { result: AutoMLResult }) {
  const points = (result.visual_results?.threshold_metrics ?? []).filter((point) => finite(point.threshold) && finite(point.precision) && finite(point.recall) && finite(point.f1));
  if (points.length < 2) return null;
  const decision = result.visual_results?.threshold_score_type === "decision";
  return <Section title="Threshold Performance" hint="Shows how precision, recall, and F1 vary with the score threshold. This chart does not change the saved model's prediction threshold.">
    {decision && <p className="mb-2 text-xs text-slate-400">Thresholds are decision scores, not probabilities.</p>}
    <div className="h-80 min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart data={points} margin={{ bottom: 18 }}>
      <CartesianGrid stroke="#1e293b" /><XAxis type="number" dataKey="threshold" domain={["dataMin", "dataMax"]} stroke="#94a3b8" tickFormatter={(value: number) => value.toFixed(2)} label={{ value: "Decision threshold", position: "insideBottom", offset: -4 }} /><YAxis type="number" domain={[0, 1]} stroke="#94a3b8" />
      <Tooltip contentStyle={{ background: "#020617", borderColor: "#334155" }} /><Legend /><Line dataKey="precision" name="Precision" stroke="#60a5fa" dot={false} type="linear" isAnimationActive={false} /><Line dataKey="recall" name="Recall" stroke="#34d399" dot={false} type="linear" isAnimationActive={false} /><Line dataKey="f1" name="F1" stroke="#fbbf24" dot={false} type="linear" isAnimationActive={false} />
    </LineChart></ResponsiveContainer></div>
  </Section>;
}

function featureDisplayName(name: string) {
  const pretty = (part: string) => part.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  if (name.startsWith("categorical__")) {
    const cleaned = name.slice("categorical__".length);
    const splitAt = cleaned.lastIndexOf("_");
    return splitAt > 0 ? `${pretty(cleaned.slice(0, splitAt))}: ${pretty(cleaned.slice(splitAt + 1))}` : pretty(cleaned);
  }
  return pretty(name.replace(/^numeric__/, ""));
}

function FeatureImportance({ result }: { result: AutoMLResult }) {
  const [showAll, setShowAll] = useState(false);
  const allValues = (result.artifact?.feature_importance ?? []).filter((item) => finite(item.importance) && item.importance >= 0);
  const values = showAll ? allValues : allValues.slice(0, 10);
  const source = values[0]?.source;
  const title = source === "coef_" ? "Coefficient Magnitude" : source === "feature_importances_" ? "Feature Importance" : "Model Feature Importance / Coefficient Magnitude";
  const max = Math.max(1e-12, ...values.map((item) => item.importance));
  return <Section title={title} hint="Importance indicates influence on this fitted model, not causation.">
    {values.length ? <div className="space-y-3" role="img" aria-label="Horizontal feature importance bar chart">{values.map((item, index) => <div key={`${item.feature}-${index}`} className="grid grid-cols-[minmax(0,12rem)_minmax(0,1fr)_auto] items-center gap-3 text-xs text-slate-300">
      <span className="break-words" title={item.feature}>{featureDisplayName(item.feature)}</span>
      <div className="h-3 rounded bg-slate-800"><div className="h-3 rounded bg-blue-400" style={{ width: `${item.importance / max * 100}%` }} /></div>
      <span className="font-mono">{item.importance.toPrecision(3)}</span>
    </div>)}{allValues.length > 10 && <button type="button" onClick={() => setShowAll(!showAll)} className="text-xs text-blue-300 hover:underline">{showAll ? "Show top 10" : `Show all ${allValues.length}`}</button>}</div> : <Empty>Feature importance is not available for this estimator.</Empty>}
  </Section>;
}

function residualBins(values: number[]) {
  if (!values.length) return [];
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  if (minimum === maximum) return [{ interval: minimum.toFixed(2), count: values.length }];
  const bins = Math.min(12, Math.max(8, Math.ceil(Math.sqrt(values.length))));
  const width = (maximum - minimum) / bins;
  const counts = Array<number>(bins).fill(0);
  values.forEach((value) => { counts[Math.min(bins - 1, Math.floor((value - minimum) / width))] += 1; });
  return counts.map((count, index) => ({ interval: `${(minimum + index * width).toFixed(2)}–${(minimum + (index + 1) * width).toFixed(2)}`, count }));
}

function predictionRangeBins(points: Array<{ actual: number; predicted: number; residual: number }>) {
  if (points.length < 2) return [];
  const ordered = [...points].sort((a, b) => a.predicted - b.predicted);
  const binCount = Math.min(10, Math.max(2, Math.floor(Math.sqrt(ordered.length))));
  const bins = Array.from({ length: binCount }, () => ({ predicted: 0, actual: 0, error: 0, count: 0 }));
  ordered.forEach((point, index) => {
    const bin = bins[Math.min(binCount - 1, Math.floor(index * binCount / ordered.length))];
    bin.predicted += point.predicted;
    bin.actual += point.actual;
    bin.error += Math.abs(point.residual);
    bin.count += 1;
  });
  return bins.filter((bin) => bin.count).map((bin) => ({
    mean_predicted: bin.predicted / bin.count,
    mean_actual: bin.actual / bin.count,
    mean_absolute_error: bin.error / bin.count,
    count: bin.count,
  }));
}

function RegressionPerformance({ result }: { result: AutoMLResult }) {
  const points = (result.visual_results?.regression_points ?? []).filter((point) => finite(point.actual) && finite(point.predicted) && finite(point.residual));
  const values = points.flatMap((point) => [point.actual, point.predicted]);
  const minimum = values.length ? Math.min(...values) : 0;
  const maximum = values.length ? Math.max(...values) : 1;
  const bins = residualBins(points.map((point) => point.residual));
  const rangeBins = predictionRangeBins(points);
  const hasRange = new Set(rangeBins.map((bin) => bin.mean_predicted)).size > 1;
  return <div className="grid gap-4 xl:grid-cols-2">
    <Section title="Actual vs Predicted" hint="Points closer to the diagonal indicate more accurate predictions.">
      {points.length ? <div className="h-80 min-w-0"><ResponsiveContainer width="100%" height="100%"><ScatterChart>
        <CartesianGrid stroke="#1e293b" /><XAxis type="number" dataKey="actual" name="Actual" stroke="#94a3b8" label={{ value: "Actual", position: "insideBottom", offset: -4 }} /><YAxis type="number" dataKey="predicted" name="Predicted" stroke="#94a3b8" label={{ value: "Predicted", angle: -90, position: "insideLeft" }} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#020617", borderColor: "#334155" }} /><ReferenceLine segment={[{ x: minimum, y: minimum }, { x: maximum, y: maximum }]} stroke="#34d399" strokeDasharray="5 5" /><Scatter data={points} name="Evaluation points" fill="#60a5fa" />
      </ScatterChart></ResponsiveContainer></div> : <Empty>Residual visualization is unavailable for this result.</Empty>}
    </Section>
    <Section title="Residuals vs Predicted" hint="Shows how prediction errors vary across predicted values. A pattern can suggest a modeling issue; this is not a formal test.">
      {points.length ? <div className="h-80 min-w-0"><ResponsiveContainer width="100%" height="100%"><ScatterChart>
        <CartesianGrid stroke="#1e293b" /><XAxis type="number" dataKey="predicted" name="Predicted" stroke="#94a3b8" label={{ value: "Predicted", position: "insideBottom", offset: -4 }} /><YAxis type="number" dataKey="residual" name="Residual" stroke="#94a3b8" label={{ value: "Residual", angle: -90, position: "insideLeft" }} />
        <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#020617", borderColor: "#334155" }} /><ReferenceLine y={0} stroke="#34d399" strokeDasharray="5 5" /><Scatter data={points} name="Evaluation points" fill="#fbbf24" />
      </ScatterChart></ResponsiveContainer></div> : <Empty>Residual visualization is unavailable for this result.</Empty>}
    </Section>
    <Section title="Sampled Residual Distribution" hint="A histogram of the bounded evaluation points returned for visualization, not the full test-set distribution.">
      {bins.length ? <div className="h-72 min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={bins} margin={{ bottom: 24 }}>
        <CartesianGrid stroke="#1e293b" /><XAxis dataKey="interval" stroke="#94a3b8" angle={-35} textAnchor="end" height={65} tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} stroke="#94a3b8" /><Tooltip contentStyle={{ background: "#020617", borderColor: "#334155" }} /><Bar dataKey="count" name="Evaluation points" fill="#a78bfa" />
      </BarChart></ResponsiveContainer></div> : <Empty>Residual visualization is unavailable for this result.</Empty>}
    </Section>
    <Section title="Prediction Range Error Profile" hint="Shows how mean absolute error changes across increasing predicted-value ranges, using sampled evaluation points.">
      {hasRange ? <div className="h-72 min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart data={rangeBins} margin={{ bottom: 18 }}>
        <CartesianGrid stroke="#1e293b" /><XAxis type="number" dataKey="mean_predicted" domain={["dataMin", "dataMax"]} stroke="#94a3b8" tickFormatter={(value: number) => value.toFixed(1)} label={{ value: "Mean predicted value", position: "insideBottom", offset: -4 }} /><YAxis type="number" stroke="#94a3b8" label={{ value: "Mean absolute error", angle: -90, position: "insideLeft" }} /><Tooltip contentStyle={{ background: "#020617", borderColor: "#334155" }} /><Line dataKey="mean_absolute_error" name="Mean absolute error" stroke="#fbbf24" dot={{ r: 2 }} type="linear" isAnimationActive={false} />
      </LineChart></ResponsiveContainer></div> : <Empty>At least two distinct predicted ranges are needed.</Empty>}
    </Section>
    <Section title="Actual vs Predicted Trend" hint="Compares mean actual and predicted values across ordered prediction ranges in the sampled evaluation points.">
      {hasRange ? <div className="h-72 min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart data={rangeBins} margin={{ bottom: 18 }}>
        <CartesianGrid stroke="#1e293b" /><XAxis type="number" dataKey="mean_predicted" domain={["dataMin", "dataMax"]} stroke="#94a3b8" tickFormatter={(value: number) => value.toFixed(1)} label={{ value: "Mean predicted value", position: "insideBottom", offset: -4 }} /><YAxis type="number" stroke="#94a3b8" /><Tooltip contentStyle={{ background: "#020617", borderColor: "#334155" }} /><Legend /><Line dataKey="mean_predicted" name="Mean predicted" stroke="#60a5fa" dot={{ r: 2 }} type="linear" isAnimationActive={false} /><Line dataKey="mean_actual" name="Mean actual" stroke="#34d399" dot={{ r: 2 }} type="linear" isAnimationActive={false} />
      </LineChart></ResponsiveContainer></div> : <Empty>At least two distinct predicted ranges are needed.</Empty>}
    </Section>
  </div>;
}

function ClusterScatter({ result }: { result: AutoMLResult }) {
  const groups = new Map<string, Array<{ x: number; y: number }>>();
  result.visual_results?.cluster_points?.forEach((point) => {
    if (!finite(point.x) || !finite(point.y)) return;
    const key = label(point.cluster);
    groups.set(key, [...(groups.get(key) ?? []), { x: point.x, y: point.y }]);
  });
  return <Section title="Cluster Scatter" hint="A two-dimensional view of transformed features; it may use PCA when the prepared feature space has more than two dimensions.">
    {groups.size ? <><div className="h-80 min-w-0" aria-label="Two-dimensional cluster chart"><ResponsiveContainer width="100%" height="100%"><ScatterChart>
      <CartesianGrid stroke="#1e293b" /><XAxis type="number" dataKey="x" name="Component 1" stroke="#94a3b8" /><YAxis type="number" dataKey="y" name="Component 2" stroke="#94a3b8" /><Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#020617", borderColor: "#334155" }} /><Legend />
      {[...groups.entries()].map(([cluster, points], index) => <Scatter key={cluster} name={clusterLabel(cluster)} data={points} fill={cluster === "-1" ? "#f87171" : COLORS[index % COLORS.length]} />)}
    </ScatterChart></ResponsiveContainer></div>
      <p className="mt-2 text-xs text-slate-500">{result.visual_results?.reduced_with_pca ? "PCA projects the transformed features for this display only." : "The first two transformed dimensions are shown without PCA."}</p>
    </> : <Empty>Cluster coordinates are unavailable for this result.</Empty>}
  </Section>;
}

function ClusterDistribution({ result, percentage }: { result: AutoMLResult; percentage: boolean }) {
  const rows = (result.cluster_distribution ?? []).filter((item) => finite(item.count) && item.count >= 0 && finite(item.percentage)).map((item) => ({
    name: String(item.cluster_id) === "-1" ? clusterLabel(item.cluster_id) : item.label || clusterLabel(item.cluster_id), count: item.count, percentage: item.percentage, noise: String(item.cluster_id) === "-1",
  }));
  return <Section title={percentage ? "Cluster Percentage Distribution" : "Cluster Size Distribution"} hint={percentage ? "Share of all assigned and noise records, computed from full model labels." : "Exact record counts from all best-model assignments, not the scatter sample."}>
    {rows.length ? <div className="min-w-0" style={{ height: Math.max(288, rows.length * 36) }} aria-label={percentage ? "Cluster percentage bar chart" : "Cluster size bar chart"}><ResponsiveContainer width="100%" height="100%"><BarChart data={rows} layout="vertical" margin={{ left: 12, right: 20 }}>
      <CartesianGrid stroke="#1e293b" horizontal={false} /><XAxis type="number" stroke="#94a3b8" tickFormatter={(value: number) => percentage ? `${value}%` : String(value)} /><YAxis type="category" dataKey="name" width={145} stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(value: string) => value.length > 23 ? `${value.slice(0, 21)}…` : value} />
      <Tooltip contentStyle={{ background: "#020617", borderColor: "#334155" }} formatter={(value, name) => name === "percentage" && finite(value) ? `${value.toFixed(2)}%` : value} /><Bar dataKey={percentage ? "percentage" : "count"} name={percentage ? "percentage" : "count"} maxBarSize={28}>{rows.map((item, index) => <Cell key={`${item.name}-${index}`} fill={item.noise ? "#f87171" : COLORS[index % COLORS.length]} />)}</Bar>
    </BarChart></ResponsiveContainer></div> : <Empty>Exact cluster counts are unavailable for this result.</Empty>}
  </Section>;
}

function ClusterCountDiagnostics({ result }: { result: AutoMLResult }) {
  const points = (result.visual_results?.cluster_k_diagnostics ?? []).filter((point) => Number.isInteger(point.k) && point.k >= 2);
  if (!points.length) return null;
  const inertia = points.filter((point) => finite(point.inertia));
  const silhouette = points.filter((point) => finite(point.silhouette));
  const rowsUsed = result.visual_results?.cluster_k_rows_used;
  const currentK = result.best_model?.effective_number_of_clusters;
  return <section className="space-y-3">
    <div><h3 className="font-semibold text-slate-100">Cluster Count Diagnostics</h3><p className="text-xs text-slate-400">Diagnostic KMeans refits on {rowsUsed ?? "a bounded sample of"} transformed rows. These curves do not change the selected model or cluster count.{finite(currentK) ? ` Current K: ${currentK}.` : ""}</p></div>
    <div className="grid gap-4 xl:grid-cols-2">
      <Section title="Elbow Curve" hint="Shows how within-cluster error changes as K increases. A bend may suggest a reasonable count; it does not prove an optimum.">
        {inertia.length > 1 ? <div className="h-72 min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart data={inertia} margin={{ bottom: 18 }}>
          <CartesianGrid stroke="#1e293b" /><XAxis type="number" dataKey="k" domain={["dataMin", "dataMax"]} allowDecimals={false} stroke="#94a3b8" label={{ value: "Number of clusters (K)", position: "insideBottom", offset: -4 }} /><YAxis type="number" stroke="#94a3b8" label={{ value: "Inertia", angle: -90, position: "insideLeft" }} /><Tooltip contentStyle={{ background: "#020617", borderColor: "#334155" }} /><Line dataKey="inertia" name="Inertia" stroke="#60a5fa" dot={{ r: 2 }} type="linear" isAnimationActive={false} />
        </LineChart></ResponsiveContainer></div> : <Empty>Elbow data is unavailable.</Empty>}
      </Section>
      <Section title="Silhouette vs Cluster Count" hint="Higher silhouette values generally indicate better-separated clusters in this bounded diagnostic sample.">
        {silhouette.length > 1 ? <div className="h-72 min-w-0"><ResponsiveContainer width="100%" height="100%"><LineChart data={silhouette} margin={{ bottom: 18 }}>
          <CartesianGrid stroke="#1e293b" /><XAxis type="number" dataKey="k" domain={["dataMin", "dataMax"]} allowDecimals={false} stroke="#94a3b8" label={{ value: "Number of clusters (K)", position: "insideBottom", offset: -4 }} /><YAxis type="number" stroke="#94a3b8" label={{ value: "Silhouette score", angle: -90, position: "insideLeft" }} /><Tooltip contentStyle={{ background: "#020617", borderColor: "#334155" }} /><Line dataKey="silhouette" name="Silhouette score" stroke="#34d399" dot={{ r: 2 }} type="linear" isAnimationActive={false} />
        </LineChart></ResponsiveContainer></div> : <Empty>Silhouette data is unavailable.</Empty>}
      </Section>
    </div>
  </section>;
}

export default function ResultsVisualizations({ result, view = "all" }: { result: AutoMLResult; view?: "all" | "comparison" | "performance" | "explainability" }) {
  const classification = result.task === "classification" ? classificationMetrics(result) : null;
  const silhouette = result.best_model?.silhouette_score;
  return <div className="space-y-5">
    {(view === "all" || view === "comparison") && <ModelComparison result={result} />}
    {(view === "all" || view === "performance") && <section className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl sm:p-6">
      <p className="text-xs font-medium uppercase tracking-wider text-blue-400">Performance</p>
      {result.task === "classification" && <>
        {classification ? <div className="grid gap-4 2xl:grid-cols-2"><ConfusionMatrix data={classification} /><PerClassMetrics data={classification} /></div> : <Empty>Confusion matrix and per-class metrics are unavailable for this result.</Empty>}
        <div className={`grid gap-4 ${(result.visual_results?.precision_recall_curve?.points?.length ?? 0) > 1 ? "2xl:grid-cols-2" : ""}`}><RocChart result={result} classes={bestClassificationRow(result)?.classes ?? undefined} /><PrecisionRecallChart result={result} /></div>
        <ThresholdChart result={result} />
      </>}
      {result.task === "regression" && <RegressionPerformance result={result} />}
      {result.task === "clustering" && <>
        {finite(silhouette) && <SilhouetteQuality score={silhouette} />}
        <ClusterScatter result={result} />
        <div className="grid gap-4 xl:grid-cols-2"><ClusterDistribution result={result} percentage={false} /><ClusterDistribution result={result} percentage /></div>
        <ClusterCountDiagnostics result={result} />
      </>}
    </section>}
    {(view === "all" || view === "explainability") && (result.task === "classification" || result.task === "regression") && <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-xl sm:p-6">
      <p className="mb-4 text-xs font-medium uppercase tracking-wider text-blue-400">Explainability</p>
      <FeatureImportance result={result} />
    </section>}
  </div>;
}
