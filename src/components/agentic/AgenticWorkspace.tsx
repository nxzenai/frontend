"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, CodeXml, Download, GitPullRequestArrow, History, Layers3 } from "lucide-react";
import ArchitecturePlan from "./ArchitecturePlan";
import GenerationProgress from "./GenerationProgress";
import PlanningProgress from "./PlanningProgress";
import SourceBrowser from "./SourceBrowser";
import VersionHistory from "./VersionHistory";
import BuildPanel from "./BuildPanel";
import PreviewPanel from "./PreviewPanel";
import agenticService from "@/services/agentic.service";
import type { AgenticPlan, AgenticProject, AgenticVersion } from "@/types/agentic";

interface Props {
  project: AgenticProject;
  initialPlan: AgenticPlan;
  onBack: () => void;
  onProjectChanged: (project: AgenticProject) => void;
}

type WorkspaceTab = "overview" | "architecture" | "source" | "build" | "preview" | "versions";

function errorMessage(error: unknown): string {
  const candidate = error as { response?: { data?: { detail?: { message?: string } } }; message?: string };
  return candidate.response?.data?.detail?.message ?? candidate.message ?? "The request could not be completed.";
}

export default function AgenticWorkspace({ project, initialPlan, onBack, onProjectChanged }: Props) {
  const [plan, setPlan] = useState(initialPlan);
  const [instruction, setInstruction] = useState("");
  const [showChanges, setShowChanges] = useState(false);
  const [planning, setPlanning] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [versions, setVersions] = useState<AgenticVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<AgenticVersion | null>(null);
  const [successfulBuildVersionIds, setSuccessfulBuildVersionIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<WorkspaceTab>("overview");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    agenticService.versions(project.id).then(items => {
      if (!active) return;
      setVersions(items);
      const current = items.find(item => item.id === project.current_version_id && item.status === "ready");
      setSelectedVersion(current ?? items.find(item => item.status === "ready") ?? null);
    }).catch(() => {
      if (active) setError("Application versions could not be loaded.");
    });
    return () => { active = false; };
  }, [project.id, project.current_version_id]);

  useEffect(() => {
    let active = true;
    agenticService.builds(project.id).then(items => {
      if (active) setSuccessfulBuildVersionIds(
        new Set(items.filter(item => item.status === "succeeded").map(item => item.version_id)),
      );
    }).catch(() => undefined);
    return () => { active = false; };
  }, [project.id]);

  const buildSucceeded = useCallback((versionId: string) => {
    setSuccessfulBuildVersionIds(current => new Set(current).add(versionId));
  }, []);

  async function refreshProject() {
    const updated = await agenticService.project(project.id);
    onProjectChanged(updated);
    return updated;
  }

  async function refreshVersions(preferredId?: string) {
    const items = await agenticService.versions(project.id);
    setVersions(items);
    const selected = items.find(item => item.id === preferredId && item.status === "ready")
      ?? items.find(item => item.id === project.current_version_id && item.status === "ready")
      ?? items.find(item => item.status === "ready")
      ?? null;
    setSelectedVersion(selected);
    return items;
  }

  async function requestChanges() {
    if (!instruction.trim()) return;
    setPlanning(true);
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
      setPlanning(false);
    }
  }

  async function approve() {
    setPlanning(true);
    setError(null);
    try {
      const approved = await agenticService.approvePlan(project.id);
      setPlan(approved);
      setTab("overview");
      await refreshProject();
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPlanning(false);
    }
  }

  async function generateApplication() {
    setGenerating(true);
    setError(null);
    try {
      const generated = await agenticService.generateApplication(project.id);
      await refreshProject();
      await refreshVersions(generated.id);
      setTab("source");
    } catch (requestError) {
      setError(errorMessage(requestError));
      await Promise.all([
        refreshProject().catch(() => undefined),
        refreshVersions().catch(() => []),
      ]);
      setTab("versions");
    } finally {
      setGenerating(false);
    }
  }

  function browse(version: AgenticVersion) {
    setSelectedVersion(version);
    setTab("source");
  }

  if (planning) return <PlanningProgress />;
  if (generating) return <GenerationProgress />;

  const readyVersions = versions.filter(version => version.status === "ready");
  const previewAvailable = Boolean(selectedVersion && successfulBuildVersionIds.has(selectedVersion.id));
  const tabs: Array<{ id: WorkspaceTab; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "architecture", label: "Architecture" },
    ...(readyVersions.length ? [{ id: "source" as const, label: "Source" }] : []),
    ...(readyVersions.length ? [{ id: "build" as const, label: "Build" }] : []),
    ...(previewAvailable ? [{ id: "preview" as const, label: "Preview" }] : []),
    ...(versions.length ? [{ id: "versions" as const, label: "Versions" }] : []),
  ];

  return (
    <div>
      <button onClick={onBack} className="mb-5 flex items-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="h-4 w-4" /> All Agentic projects</button>
      <div className="mb-5 flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:flex-row md:items-center">
        <div><div className="flex flex-wrap items-center gap-3"><h1 className="text-2xl font-semibold text-white">{project.name}</h1><span className={`rounded-full px-3 py-1 text-xs ${project.status === "generated" ? "bg-emerald-500/15 text-emerald-300" : project.status === "generation_failed" ? "bg-red-500/15 text-red-300" : "bg-cyan-500/15 text-cyan-300"}`}>{project.status.replaceAll("_", " ")}</span></div><p className="mt-2 max-w-2xl text-sm text-slate-400">{project.problem_statement}</p></div>
        <div className="flex items-center gap-2 text-xs text-slate-500"><History className="h-4 w-4" /> Plan revision {plan.revision}</div>
      </div>

      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70 p-1" aria-label="Agentic workspace">
        {tabs.map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`rounded-lg px-4 py-2 text-sm transition ${tab === item.id ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>{item.label}</button>)}
      </nav>

      {error && <div role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      {tab === "overview" && (
        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Approved solution</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{plan.plan.application.name}</h2>
            <p className="mt-3 leading-7 text-slate-300">{plan.plan.application.summary}</p>
            <div className="mt-6 rounded-xl bg-slate-950/70 p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Objective</p><p className="mt-2 text-sm text-slate-300">{plan.plan.application.objective}</p></div>
          </section>
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-7">
            <Layers3 className="h-7 w-7 text-violet-400" />
            <h2 className="mt-4 text-lg font-semibold text-white">Application source</h2>
            {plan.status === "approved" ? <><p className="mt-2 text-sm leading-6 text-slate-400">Generate an immutable source version from this approved architecture. Generated code is stored for review and download only.</p><button onClick={() => void generateApplication()} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-400"><CodeXml className="h-4 w-4" /> Generate Application</button></> : <p className="mt-2 text-sm text-slate-400">Approve the architecture before generating application source.</p>}
            {selectedVersion && <button onClick={() => void agenticService.downloadSource(project.id, selectedVersion)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-white hover:border-cyan-400"><Download className="h-4 w-4" /> Download Source · V{selectedVersion.version_number}</button>}
          </section>
        </div>
      )}

      {tab === "architecture" && <ArchitecturePlan plan={plan} />}
      {tab === "source" && selectedVersion && <SourceBrowser key={selectedVersion.id} projectId={project.id} version={selectedVersion} />}
      {tab === "versions" && <VersionHistory projectId={project.id} versions={versions} currentVersionId={project.current_version_id} onBrowse={browse} />}
      {tab === "build" && selectedVersion && <BuildPanel key={selectedVersion.id} projectId={project.id} version={selectedVersion} onBuildSucceeded={buildSucceeded} />}
      {tab === "preview" && selectedVersion && previewAvailable && <PreviewPanel key={selectedVersion.id} projectId={project.id} version={selectedVersion} />}

      {tab === "architecture" && showChanges && (
        <div className="mt-5 rounded-2xl border border-cyan-500/30 bg-slate-900 p-6">
          <label className="text-sm font-medium text-white">What should change?</label>
          <textarea autoFocus rows={4} value={instruction} onChange={event => setInstruction(event.target.value)} placeholder="Remove the escalation agent and create a support ticket instead." className="mt-3 w-full resize-none rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm text-white outline-none focus:border-cyan-500" />
          <div className="mt-3 flex justify-end gap-3"><button onClick={() => setShowChanges(false)} className="rounded-lg px-4 py-2 text-sm text-slate-400 hover:text-white">Cancel</button><button disabled={!instruction.trim()} onClick={() => void requestChanges()} className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-50">Create new revision</button></div>
        </div>
      )}

      {tab === "architecture" && (
        <div className="sticky bottom-4 mt-6 flex justify-end gap-3 rounded-2xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur">
          <button disabled={plan.status === "approved"} onClick={() => setShowChanges(true)} className="flex items-center gap-2 rounded-xl border border-slate-600 px-5 py-2.5 text-sm font-medium text-white hover:border-cyan-400 disabled:opacity-40"><GitPullRequestArrow className="h-4 w-4" /> Request Changes</button>
          <button disabled={plan.status === "approved"} onClick={() => void approve()} className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-40"><CheckCircle2 className="h-4 w-4" /> {plan.status === "approved" ? "Architecture Approved" : "Approve Architecture"}</button>
        </div>
      )}
    </div>
  );
}
