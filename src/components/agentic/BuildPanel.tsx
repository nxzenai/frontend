"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Ban, Check, Circle, CircleX, Hammer, LoaderCircle, RefreshCw, Square,
} from "lucide-react";
import agenticService from "@/services/agentic.service";
import type {
  AgenticBuild, AgenticBuildEvent, AgenticBuildStage, AgenticVersion,
} from "@/types/agentic";

const stages: Array<{ id: AgenticBuildStage; label: string }> = [
  { id: "validating_source", label: "Source integrity" },
  { id: "creating_sandbox", label: "Docker sandbox" },
  { id: "installing_backend_dependencies", label: "Backend dependencies" },
  { id: "validating_backend", label: "Backend validation" },
  { id: "running_backend_tests", label: "Backend tests" },
  { id: "installing_frontend_dependencies", label: "Frontend dependencies" },
  { id: "building_frontend", label: "Frontend build" },
];

function message(error: unknown): string {
  const value = error as { response?: { data?: { detail?: { message?: string } } }; message?: string };
  return value.response?.data?.detail?.message ?? value.message ?? "The build request failed.";
}

function StageIcon({ stage, build, events }: { stage: AgenticBuildStage; build: AgenticBuild; events: AgenticBuildEvent[] }) {
  const completed = events.some(event => event.stage === stage && event.type === "stage.completed");
  const failed = build.status === "failed" && build.stage === "completed"
    && events.some(event => event.type === "build.failed")
    && !completed && events.some(event => event.stage === stage);
  const active = build.status === "running" && build.stage === stage;
  if (completed) return <Check className="h-4 w-4 text-emerald-400" />;
  if (failed) return <CircleX className="h-4 w-4 text-red-400" />;
  if (active) return <LoaderCircle className="h-4 w-4 animate-spin text-cyan-300" />;
  return <Circle className="h-4 w-4 text-slate-700" />;
}

export default function BuildPanel({ projectId, version }: { projectId: string; version: AgenticVersion }) {
  const [builds, setBuilds] = useState<AgenticBuild[]>([]);
  const [selected, setSelected] = useState<AgenticBuild | null>(null);
  const [events, setEvents] = useState<AgenticBuildEvent[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBuild = useCallback(async (buildId: string) => {
    const [build, buildEvents] = await Promise.all([
      agenticService.build(projectId, buildId),
      agenticService.buildEvents(projectId, buildId),
    ]);
    setSelected(build);
    setEvents(buildEvents);
    setBuilds(current => current.map(item => item.id === build.id ? build : item));
    return build;
  }, [projectId]);

  useEffect(() => {
    let active = true;
    agenticService.builds(projectId).then(items => {
      if (!active) return;
      const versionBuilds = items.filter(item => item.version_id === version.id);
      setBuilds(versionBuilds);
      const latest = versionBuilds[0];
      if (latest) void loadBuild(latest.id);
    }).catch(requestError => {
      if (active) setError(message(requestError));
    });
    return () => { active = false; };
  }, [projectId, version.id, loadBuild]);

  useEffect(() => {
    if (!selected || !["queued", "running"].includes(selected.status)) return;
    const timer = window.setInterval(() => {
      void loadBuild(selected.id).catch(requestError => setError(message(requestError)));
    }, 2000);
    return () => window.clearInterval(timer);
  }, [selected, loadBuild]);

  const logs = useMemo(
    () => events.filter(event => event.type === "log").map(event => event.message).join(""),
    [events],
  );

  async function startBuild() {
    setBusy(true);
    setError(null);
    try {
      const build = await agenticService.createBuild(projectId, version.id);
      setBuilds(current => [build, ...current]);
      setSelected(build);
      setEvents(await agenticService.buildEvents(projectId, build.id));
    } catch (requestError) {
      setError(message(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!selected) return;
    setBusy(true);
    try {
      const build = await agenticService.cancelBuild(projectId, selected.id);
      setSelected(build);
      await loadBuild(build.id);
    } catch (requestError) {
      setError(message(requestError));
    } finally {
      setBusy(false);
    }
  }

  const active = selected && ["queued", "running"].includes(selected.status);
  return (
    <div className="grid gap-5 xl:grid-cols-[250px_minmax(0,1fr)]" data-build-panel>
      <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-white">Build history</h2><span className="text-xs text-slate-500">V{version.version_number}</span></div>
        <div className="space-y-2">{builds.map((build, index) => <button key={build.id} onClick={() => void loadBuild(build.id)} className={`w-full rounded-xl border p-3 text-left ${selected?.id === build.id ? "border-cyan-500/50 bg-cyan-500/10" : "border-slate-800 bg-slate-950/60 hover:border-slate-700"}`}><div className="flex items-center justify-between"><span className="text-sm font-medium text-white">Build #{builds.length - index}</span><span className={`text-xs ${build.status === "succeeded" ? "text-emerald-300" : build.status === "failed" ? "text-red-300" : build.status === "cancelled" ? "text-slate-400" : "text-cyan-300"}`}>{build.status}</span></div><p className="mt-1 text-[11px] text-slate-600">{new Date(build.created_at).toLocaleString()}</p></button>)}</div>
        <button disabled={busy || Boolean(active)} onClick={() => void startBuild()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-400 disabled:opacity-40"><Hammer className="h-4 w-4" /> {builds.length ? "Build & Test Again" : "Build & Test"}</button>
      </aside>

      <section className="space-y-5">
        {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
        {!selected ? <div className="flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 text-center"><Hammer className="h-8 w-8 text-violet-400" /><h2 className="mt-4 font-semibold text-white">Build this source version</h2><p className="mt-2 max-w-md text-sm text-slate-400">The separate Agentic worker will validate and build this version in Docker.</p></div> : <>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-slate-500">Build status</p><h2 className="mt-1 text-xl font-semibold capitalize text-white">{selected.status}</h2></div>{active && <button disabled={busy || selected.cancel_requested} onClick={() => void cancel()} className="flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-40"><Square className="h-3.5 w-3.5" /> {selected.cancel_requested ? "Cancelling..." : "Cancel build"}</button>}</div>
            <p className="mt-3 text-sm text-slate-400">Current stage: <span className="text-slate-200">{selected.stage.replaceAll("_", " ")}</span></p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
              {selected.started_at && <span>Started {new Date(selected.started_at).toLocaleString()}</span>}
              {selected.completed_at && <span>Completed {new Date(selected.completed_at).toLocaleString()}</span>}
              {selected.result.duration_ms > 0 && <span>Duration {(selected.result.duration_ms / 1000).toFixed(1)}s</span>}
            </div>
            {selected.error && <div className="mt-4 flex gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-300"><Ban className="mt-0.5 h-4 w-4 shrink-0" />{selected.error}</div>}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
            ["Package policy", selected.result.package_validation],
            ["Backend validation", selected.result.backend_validation],
            ["Backend tests", selected.result.backend_tests],
            ["Frontend build", selected.result.frontend_build],
          ].map(([label, value]) => <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"><p className="text-xs text-slate-500">{label}</p><p className={`mt-1 text-sm font-medium capitalize ${value === "passed" ? "text-emerald-300" : value === "failed" ? "text-red-300" : "text-slate-300"}`}>{value.replaceAll("_", " ")}</p></div>)}</div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h3 className="font-semibold text-white">Build stages</h3><div className="mt-4 grid gap-2 md:grid-cols-2">{stages.map(stage => <div key={stage.id} className="flex items-center gap-3 rounded-lg bg-slate-950/60 px-3 py-2.5 text-sm text-slate-300"><StageIcon stage={stage.id} build={selected} events={events} />{stage.label}</div>)}</div></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-center justify-between"><h3 className="font-semibold text-white">Logs</h3>{active && <RefreshCw className="h-4 w-4 animate-spin text-slate-500" />}</div><pre className="mt-4 max-h-80 min-h-32 overflow-auto whitespace-pre-wrap rounded-xl bg-black/50 p-4 font-mono text-xs leading-5 text-slate-300">{logs || "No container output yet."}</pre></div>
        </>}
      </section>
    </div>
  );
}
