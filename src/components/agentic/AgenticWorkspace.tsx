"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, GitPullRequestArrow, History } from "lucide-react";
import ArchitecturePlan from "./ArchitecturePlan";
import PlanningProgress from "./PlanningProgress";
import agenticService from "@/services/agentic.service";
import type { AgenticPlan, AgenticProject } from "@/types/agentic";

interface Props {
  project: AgenticProject;
  initialPlan: AgenticPlan;
  onBack: () => void;
  onProjectChanged: (project: AgenticProject) => void;
}

function errorMessage(error: unknown): string {
  const candidate = error as { response?: { data?: { detail?: { message?: string } } }; message?: string };
  return candidate.response?.data?.detail?.message ?? candidate.message ?? "The request could not be completed.";
}

export default function AgenticWorkspace({ project, initialPlan, onBack, onProjectChanged }: Props) {
  const [plan, setPlan] = useState(initialPlan);
  const [instruction, setInstruction] = useState("");
  const [showChanges, setShowChanges] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshProject() {
    const updated = await agenticService.project(project.id);
    onProjectChanged(updated);
  }

  async function requestChanges() {
    if (!instruction.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const revised = await agenticService.revisePlan(project.id, instruction.trim());
      setPlan(revised);
      setInstruction("");
      setShowChanges(false);
      await refreshProject();
    } catch (requestError) {
      setError(errorMessage(requestError));
      await refreshProject().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }

  async function approve() {
    setBusy(true);
    setError(null);
    try {
      const approved = await agenticService.approvePlan(project.id);
      setPlan(approved);
      await refreshProject();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  if (busy) return <PlanningProgress />;

  return (
    <div>
      <button onClick={onBack} className="mb-5 flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> All Agentic projects</button>
      <div className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:flex-row md:items-center">
        <div><div className="flex items-center gap-3"><h1 className="text-2xl font-semibold text-white">{project.name}</h1><span className={`rounded-full px-3 py-1 text-xs ${plan.status === "approved" ? "bg-emerald-500/15 text-emerald-300" : "bg-cyan-500/15 text-cyan-300"}`}>{plan.status === "approved" ? "Approved" : "Ready for review"}</span></div><p className="mt-2 max-w-2xl text-sm text-slate-400">{project.problem_statement}</p></div>
        <div className="flex items-center gap-2 text-xs text-slate-500"><History className="h-4 w-4" /> Plan revision {plan.revision}</div>
      </div>

      {error && <div role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
      <ArchitecturePlan plan={plan} />

      {showChanges && (
        <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-slate-900 p-6">
          <label className="text-sm font-medium text-white">What should change?</label>
          <textarea
            autoFocus rows={4} value={instruction} onChange={event => setInstruction(event.target.value)}
            placeholder="Remove the escalation agent and create a support ticket instead."
            className="mt-3 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-white outline-none focus:border-cyan-500"
          />
          <div className="mt-3 flex justify-end gap-3"><button onClick={() => setShowChanges(false)} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button><button disabled={!instruction.trim()} onClick={() => void requestChanges()} className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">Create new revision</button></div>
        </div>
      )}

      <div className="sticky bottom-4 mt-6 flex justify-end gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur">
        <button disabled={plan.status === "approved"} onClick={() => setShowChanges(true)} className="flex items-center gap-2 rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-medium text-white hover:border-cyan-400 disabled:opacity-40"><GitPullRequestArrow className="h-4 w-4" /> Request Changes</button>
        <button disabled={plan.status === "approved"} onClick={() => void approve()} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-40"><CheckCircle2 className="h-4 w-4" /> {plan.status === "approved" ? "Architecture Approved" : "Approve Architecture"}</button>
      </div>
    </div>
  );
}
