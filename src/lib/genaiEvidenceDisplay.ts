import type { EvidenceRecord, ResearchStatus } from "@/types/evidence";

const groups = [["f1", "f1_score"], ["r2", "r2_score"], ["silhouette", "silhouette_score"],
  ["davies_bouldin", "davies_bouldin_score"], ["calinski_harabasz", "calinski_harabasz_score"]];
export function metricAliases(metric = "", module = ""): string[] {
  if (module === "automl") {
    const group = [["weighted_precision", "precision"], ["weighted_recall", "recall"], ["weighted_f1", "f1_score", "f1"]].find(group => group.includes(metric));
    if (group) return [metric, ...group.filter(key => key !== metric)];
  }
  if (module === "autodl" && metric === "weighted_f1") return ["weighted_f1", "f1"];
  const group = groups.find(group => group.includes(metric)) ?? [];
  return [metric, ...group.filter(key => key !== metric)];
}
export function metricLabel(metric?: string, module = ""): string {
  if (!metric) return "Unavailable";
  if (module === "automl") metric = ({ precision: "weighted_precision", recall: "weighted_recall", f1: "weighted_f1", f1_score: "weighted_f1" } as Record<string, string>)[metric] ?? metric;
  const labels: Record<string, string> = { precision_positive: "Positive-class Precision", recall_positive: "Positive-class Recall (Sensitivity)",
    f1_positive: "Positive-class F1", weighted_precision: "Weighted Precision", weighted_recall: "Weighted Recall",
    macro_precision: "Macro Precision", macro_recall: "Macro Recall", accuracy: "Accuracy", precision: "Precision", recall: "Recall",
    f1: "F1", f1_score: "F1 Score", macro_f1: "Macro F1", weighted_f1: "Weighted F1", roc_auc: "ROC-AUC",
    r2: "R²", r2_score: "R²", mae: "MAE", mse: "MSE", rmse: "RMSE", mape: "MAPE",
    silhouette: "Silhouette", silhouette_score: "Silhouette Score", davies_bouldin: "Davies-Bouldin",
    davies_bouldin_score: "Davies-Bouldin", calinski_harabasz: "Calinski-Harabasz", calinski_harabasz_score: "Calinski-Harabasz" };
  return labels[metric] ?? readableWords(metric);
}
export function metricValue(metric: string | undefined, value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value)) return "Unavailable";
  const percentage = ["precision_positive", "recall_positive", "f1_positive", "weighted_precision", "weighted_recall", "macro_precision", "macro_recall", "accuracy", "precision", "recall", "f1", "f1_score", "macro_f1", "weighted_f1", "roc_auc"];
  return percentage.includes(metric ?? "") && value >= 0 && value <= 1 ? (value * 100).toFixed(2) + "%" : String(Number(value.toPrecision(5)));
}
export function readableWords(raw: string): string {
  return raw.split(/[_\s]+/).filter(Boolean).map(word => word.toLowerCase() === "bmi" ? "BMI"
    : word.charAt(0).toUpperCase() + word.slice(1)).join(" ") || raw;
}
export function featureLabel(raw: string, originals: string[] = []): string {
  const cleaned = raw.replace(/^(numeric|categorical|num|cat)__/i, "");
  if (/^(categorical|cat)__/i.test(raw)) {
    const original = originals.filter(name => cleaned.startsWith(name + "_")).sort((a, b) => b.length - a.length)[0];
    if (original) return readableWords(original) + ": " + readableWords(cleaned.slice(original.length + 1));
  }
  return readableWords(cleaned);
}
export function classLabel(raw: unknown, mapping: Record<string, string> = {}): string {
  const key = String(raw);
  return Object.prototype.hasOwnProperty.call(mapping, key) && typeof mapping[key] === "string" && mapping[key].trim()
    ? mapping[key] : key;
}
export function savedResearchStatus(record: EvidenceRecord): ResearchStatus {
  // An empty source list is a successful, possibly insufficient, search.
  if (record.research_evidence !== null && record.research_evidence !== undefined) return "AVAILABLE";
  if (record.research_status === "FAILED" ||
      record.research_error === "Research validation is temporarily unavailable.") return "FAILED";
  if (record.research_status === "LOADING") return "LOADING";
  return record.native_evidence.research_findings?.length ? "READY" : "NOT_REQUESTED";
}
