"use client";

import { useState } from "react";
import type { LearningPath } from "@/types/learning";

export function LifecyclePanel({ path }: { path: LearningPath }) {
  const variants = path.lifecycle_variants ?? Object.keys(path.lifecycles ?? {}).map(id => ({ id, title: id, description: "" }));
  const [selected, setSelected] = useState(path.default_lifecycle_key ?? variants[0]?.id ?? "");
  const variant = variants.find(item => item.id === selected) ?? variants[0];
  const stages = path.lifecycles?.[variant?.id ?? ""] ?? [];
  if (!stages.length) return null;
  return <details className="mt-4 rounded-lg border border-slate-700 p-3">
    <summary className="cursor-pointer text-sm font-medium">Explore the {path.lifecycle_title ?? "learning lifecycle"}</summary>
    {variants.length > 1 && <div className="mt-3 flex flex-wrap gap-2">{variants.map(value => <button type="button" key={value.id} aria-pressed={variant?.id === value.id} onClick={() => setSelected(value.id)} className={"rounded border px-3 py-1 text-xs " + (variant?.id === value.id ? "border-blue-400 bg-blue-500/10" : "border-slate-700")}>{value.title}</button>)}</div>}
    {variant?.description && <p className="mt-2 text-xs text-slate-400">{variant.description}</p>}
    <p className="mt-2 text-xs text-blue-200">{stages.map(stage => stage.title).join(" → ")}</p>
    <p className="mt-2 text-xs text-slate-400">Conceptual guidance, not a checklist that awards mastery. Roadmap groups below contain only existing topics.</p>
    <ol className="mt-3 list-inside list-decimal space-y-2 text-xs">{stages.map(stage => <li key={stage.id}><strong>{stage.title}</strong><p className="ml-4 text-slate-400">{stage.description}</p></li>)}</ol>
  </details>;
}
