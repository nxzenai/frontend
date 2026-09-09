"use client";

import { Check, Download, FileCode2 } from "lucide-react";
import agenticService from "@/services/agentic.service";
import type { AgenticVersion } from "@/types/agentic";

export default function VersionHistory({
  projectId, versions, currentVersionId, onBrowse,
}: {
  projectId: string;
  versions: AgenticVersion[];
  currentVersionId: string | null;
  onBrowse: (version: AgenticVersion) => void;
}) {
  return (
    <div className="space-y-3" data-version-history>
      {versions.length === 0 && <div className="rounded-2xl border border-dashed border-slate-800 p-10 text-center text-sm text-slate-500">No application versions generated yet.</div>}
      {versions.map(version => (
        <article key={version.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-3"><span className="text-lg font-semibold text-white">V{version.version_number}</span><span className={`rounded-full px-2.5 py-1 text-xs ${version.status === "ready" ? "bg-emerald-500/15 text-emerald-300" : version.status === "failed" ? "bg-red-500/15 text-red-300" : "bg-violet-500/15 text-violet-300"}`}>{version.status[0].toUpperCase() + version.status.slice(1)}</span>{currentVersionId === version.id && <span className="flex items-center gap-1 text-xs text-cyan-300"><Check className="h-3.5 w-3.5" /> Current</span>}</div>
            <p className="mt-2 text-xs text-slate-500">Created {new Date(version.created_at).toLocaleString()}</p>
            {version.error && <p className="mt-2 text-sm text-red-300">{version.error}</p>}
          </div>
          {version.status === "ready" && <div className="flex gap-2"><button onClick={() => onBrowse(version)} className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-white hover:border-cyan-400"><FileCode2 className="h-4 w-4" /> Browse source</button><button onClick={() => void agenticService.downloadSource(projectId, version)} className="flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"><Download className="h-4 w-4" /> Download Source</button></div>}
        </article>
      ))}
    </div>
  );
}
