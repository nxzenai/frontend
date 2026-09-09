"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Bot, Plus, RefreshCw } from "lucide-react";
import NewAgenticProject from "./NewAgenticProject";
import AgenticWorkspace from "./AgenticWorkspace";
import PlanningProgress from "./PlanningProgress";
import agenticService from "@/services/agentic.service";
import type { AgenticPlan, AgenticProject } from "@/types/agentic";

function errorMessage(error: unknown): string {
  const candidate = error as { response?: { data?: { detail?: { message?: string } } }; message?: string };
  return candidate.response?.data?.detail?.message ?? candidate.message ?? "The request could not be completed.";
}

const statusLabel: Record<AgenticProject["status"], string> = {
  draft: "Draft", planning: "Planning", plan_ready: "Plan ready", approved: "Approved", planning_failed: "Planning failed",
  generating: "Generating", generated: "Generated", generation_failed: "Generation failed",
};

export default function AgenticProjects() {
  const [projects, setProjects] = useState<AgenticProject[]>([]);
  const [selected, setSelected] = useState<AgenticProject | null>(null);
  const [plan, setPlan] = useState<AgenticPlan | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadProjects() {
    setError(null);
    try {
      setProjects(await agenticService.projects());
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    let active = true;
    agenticService.projects().then(items => {
      if (active) setProjects(items);
    }).catch(requestError => {
      if (active) setError(errorMessage(requestError));
    }).finally(() => {
      if (active) setBusy(false);
    });
    return () => { active = false; };
  }, []);

  async function openProject(project: AgenticProject) {
    setBusy(true);
    setError(null);
    try {
      const current = await agenticService.project(project.id);
      if (!current.current_plan_id) {
        setSelected(current);
        setError(current.status === "planning_failed" ? "Architecture planning failed. You can retry from a new project." : "This project does not have an architecture plan yet.");
        return;
      }
      const revisions = await agenticService.plans(project.id);
      const currentPlan = revisions.find(item => item.id === current.current_plan_id);
      if (!currentPlan) throw new Error("The current architecture plan could not be loaded.");
      setSelected(current);
      setPlan(currentPlan);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function design(values: { name: string; problem: string; files: File[] }) {
    setBusy(true);
    setError(null);
    let created: AgenticProject | null = null;
    try {
      const uploaded = [];
      for (const file of values.files) uploaded.push(await agenticService.uploadSupportingFile(file));
      created = await agenticService.createProject({
        name: values.name, problem_statement: values.problem, attachment_ids: uploaded.map(file => file.id),
      });
      setSelected(created);
      const generated = await agenticService.generatePlan(created.id);
      setPlan(generated);
      setSelected(await agenticService.project(created.id));
      setCreating(false);
      await loadProjects();
    } catch (requestError) {
      setError(errorMessage(requestError));
      if (created) setSelected(await agenticService.project(created.id).catch(() => created));
    } finally {
      setBusy(false);
    }
  }

  if (busy && (creating || selected)) return <PlanningProgress />;

  if (selected && plan) return (
    <AgenticWorkspace
      project={selected} initialPlan={plan}
      onBack={() => { setSelected(null); setPlan(null); void loadProjects(); }}
      onProjectChanged={updated => { setSelected(updated); setProjects(current => current.map(item => item.id === updated.id ? updated : item)); }}
    />
  );

  if (creating) return <><NewAgenticProject busy={busy} onCancel={() => setCreating(false)} onSubmit={design} />{error && <p role="alert" className="mx-auto mt-4 max-w-3xl text-sm text-red-300">{error}</p>}</>;

  return (
    <div>
      <div className="flex items-start justify-between gap-5">
        <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-400">NxZenAI Studio</p><h1 className="mt-2 text-3xl font-semibold text-white">Agentic AI</h1><p className="mt-2 max-w-xl text-sm text-slate-400">Turn a business requirement into a reviewable, structured AI solution architecture.</p></div>
        <button onClick={() => { setError(null); setCreating(true); }} className="flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400"><Plus className="h-4 w-4" /> New AI Solution</button>
      </div>
      {error && <div role="alert" className="mt-6 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"><span>{error}</span><button title="Retry" onClick={() => void loadProjects()}><RefreshCw className="h-4 w-4" /></button></div>}
      {busy ? <div className="mt-12 text-center text-sm text-slate-500">Loading Agentic projects...</div> : projects.length === 0 ? (
        <div className="mt-12 flex min-h-80 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 text-center"><div className="rounded-2xl bg-cyan-500/10 p-4 text-cyan-400"><Bot className="h-8 w-8" /></div><h2 className="mt-5 text-lg font-semibold text-white">Design your first AI solution</h2><p className="mt-2 max-w-md text-sm text-slate-400">Start with the business problem. NxZenAI will create a structured architecture for your review.</p></div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{projects.map(project => <button key={project.id} onClick={() => void openProject(project)} className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-500/40"><div className="flex items-start justify-between"><span className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400"><Bot className="h-5 w-5" /></span><span className={`rounded-full px-2.5 py-1 text-xs ${project.status === "approved" || project.status === "generated" ? "bg-emerald-500/15 text-emerald-300" : project.status === "planning_failed" || project.status === "generation_failed" ? "bg-red-500/15 text-red-300" : "bg-slate-800 text-slate-300"}`}>{statusLabel[project.status]}</span></div><h2 className="mt-5 font-semibold text-white">{project.name}</h2><p className="mt-2 text-xs text-slate-500">Updated {new Date(project.updated_at).toLocaleString()}</p><span className="mt-5 flex items-center gap-1 text-xs font-medium text-cyan-400">Open workspace <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></button>)}</div>
      )}
    </div>
  );
}
