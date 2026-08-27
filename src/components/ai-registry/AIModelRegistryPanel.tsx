"use client";

import { useCallback, useEffect, useState } from "react";
import AIRegistryService from "@/services/ai-registry.service";
import type { AIMonitoringSummary, AIModelStage, AIRegisteredModel } from "@/types/ai-registry";

export default function AIModelRegistryPanel({ module }: { module: "autodl" | "autonlp" }) {
  const [models, setModels] = useState<AIRegisteredModel[]>([]);
  const [monitoring, setMonitoring] = useState<AIMonitoringSummary | null>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [registered, summary] = await Promise.all([
        AIRegistryService.list(module), AIRegistryService.monitoring(module),
      ]);
      setModels(registered);
      setMonitoring(summary);
      setError("");
    } catch {
      setError("Registry information is temporarily unavailable.");
    }
  }, [module]);

  useEffect(() => { void refresh(); }, [refresh]);

  if (!models.length && !monitoring && !error) return null;

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white">Model Registry</h2>
        {monitoring && (
          <span className="text-xs text-slate-400">
            Queue {monitoring.queue.depth} · Predictions {monitoring.predictions.count} · Errors {monitoring.predictions.errors}
          </span>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-amber-300">{error}</p>}
      <div className="mt-4 space-y-3">
        {models.map(model => (
          <div key={model.id} className="rounded-lg bg-slate-950 p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-slate-300">
                {model.model_type} · v{model.version} · {model.lifecycle_stage} · {model.task.replaceAll("_", " ")}
              </span>
              <select
                value={model.lifecycle_stage}
                onChange={async event => {
                  try {
                    await AIRegistryService.changeStage(module, model.id, event.target.value as AIModelStage);
                    await refresh();
                  } catch {
                    setError("That lifecycle change is not permitted for this account.");
                  }
                }}
                className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200"
              >
                <option value="draft">Draft</option>
                <option value="validated">Validated</option>
                <option value="production">Production</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 text-xs text-indigo-300">
              Retrain with new dataset
              <input
                className="hidden"
                type="file"
                onChange={async event => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  try {
                    await AIRegistryService.retrain(module, model.id, file);
                    setError("");
                  } catch {
                    setError("Retraining could not be queued for this dataset.");
                  } finally {
                    event.target.value = "";
                  }
                }}
              />
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
