"use client";

import { LifecyclePanel } from "@/components/learning/LifecyclePanel";
import Link from "next/link";
import type { LearningPath, RoadmapTopicState } from "@/types/learning";

function statusText(state?: RoadmapTopicState) {
  if (!state) return "Progress unavailable";
  switch (state.status) {
    case "LOCKED": return "Complete prerequisites first";
    case "MASTERED": return "Mastered · " + state.mastery_score + "%";
    case "IN_PROGRESS": return "In progress · " + state.mastery_score + "%";
    case "READY": return "Ready to learn";
    default: return "Not started";
  }
}

export function MasteryRoadmap({ path, busy, onOpen, labHref }: {
  path: LearningPath; busy: boolean; onOpen: (id: string) => void; labHref: string;
}) {
  const topics = path.topics ?? [];
  const progress = path.roadmap_progress;
  const states = progress?.topic_states ?? {};
  const next = topics.find(topic => topic.id === progress?.continue_topic_id);
  const configured = (path.roadmap_groups ?? []).filter(group => group.id !== "additional").sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  const known = new Set(configured.map(group => group.id));
  const additional = topics.filter(topic => !topic.roadmap_group || !known.has(topic.roadmap_group));
  const groups = [...configured.filter(group => topics.some(topic => topic.roadmap_group === group.id)), ...(additional.length ? [{ id: "additional", title: "Additional Topics", order: 999, lifecycle_stages: [] }] : [])];
  const topicTitle = (id: string) => topics.find(topic => topic.id === id)?.title ?? "Required topic";
  const canOpen = (id: string) => Boolean(states[id] && states[id].status !== "LOCKED");
  const topicCard = (id: string) => {
    const topic = topics.find(item => item.id === id)!;
    const state = states[id];
    const missing = state?.unmet_prerequisites ?? [];
    return <article key={id} className="rounded-lg border border-slate-700 bg-slate-950/40 p-3">
      <button type="button" disabled={busy || !canOpen(id)} onClick={() => onOpen(id)} className="w-full text-left disabled:cursor-not-allowed disabled:opacity-70">
        <span className="block font-medium text-slate-100">{topic.title}</span>
        {topic.task_note && <span className="mt-1 block text-xs text-blue-300">{topic.task_note}</span>}
        <span className="mt-1 block text-xs text-slate-400">{statusText(state)}</span>
      </button>
      {state && state.mastery_score > 0 && <progress className="mt-2 h-1.5 w-full accent-blue-500" value={state.mastery_score} max={100} aria-label={topic.title + " mastery evidence"} />}
      {(state?.practiced || state?.applied) && <p className="mt-1 text-xs text-slate-400">{[state.practiced ? "Practice recorded" : null, state.applied ? "Verified application" : null].filter(Boolean).join(" · ")}</p>}
      {missing.length === 1 && <p className="mt-2 text-xs text-amber-200">Complete “{topicTitle(missing[0])}” first{topic.is_capstone ? " (mastery required)." : " (concept check required)."}</p>}
      {missing.length > 1 && <details className="mt-2 text-xs text-amber-200"><summary className="cursor-pointer">View prerequisites ({missing.length})</summary><ul className="mt-1 list-disc pl-4">{missing.map(ref => <li key={ref}>{topicTitle(ref)}{topic.is_capstone ? " — mastery required" : " — concept check required"}</li>)}</ul></details>}
    </article>;
  };
  return <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5" aria-label={path.title + " learning roadmap"}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-lg font-semibold">{path.title}</h2><p className="mt-1 text-xs text-slate-400">Learn → Understand → See → Check → Practice → Explain → Apply → Assess → Master</p>
        {progress && <p className="mt-2 text-sm text-blue-200">{progress.summary.practiced} of {progress.summary.total} topics practiced · {progress.summary.mastered} mastered · {progress.summary.applied} applied</p>}
      </div>
      <div className="flex flex-wrap gap-2"><button type="button" disabled={busy || !next} onClick={() => next && onOpen(next.id)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium disabled:opacity-50">Continue Learning</button><Link href={labHref} className="rounded-lg border border-slate-700 px-3 py-2 text-sm">Open {path.native_lab_label ?? "Related Lab"}</Link></div>
    </div>
    {next ? <p className="mt-2 text-xs text-slate-400">Continue with: {next.title}</p> : progress && <p className="mt-2 text-xs text-slate-400">{progress.summary.mastered === progress.summary.total ? "All topics mastered. Revisit any topic for revision." : "No topic is ready yet. Review the prerequisites below."}</p>}
    <LifecyclePanel key={path.id} path={path} />
    <p className="mt-4 text-xs text-slate-400">A roadmap of existing topics. Prerequisites still determine which topic you can start; each topic contains its full learning journey. Page views do not award mastery.</p>
    <div className="mt-3 space-y-3">{groups.map((group, index) => {
      const items = group.id === "additional" ? additional : topics.filter(topic => topic.roadmap_group === group.id);
      if (!items.length) return null;
      return <details key={group.id} open={items.some(topic => topic.id === next?.id)} className="rounded-lg border border-slate-700 p-3">
        <summary className="cursor-pointer text-sm font-semibold">{index + 1}. {group.title}<span className="ml-2 font-normal text-slate-400">{items.filter(topic => states[topic.id]?.mastered).length} / {items.length} mastered</span></summary>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">{items.map(topic => topicCard(topic.id))}</div>
      </details>;
    })}</div>
    {!groups.length && <p role="status" className="mt-3 text-sm text-amber-200">Roadmap metadata is unavailable. Reload after the Learning API is updated.</p>}
  </section>;
}
