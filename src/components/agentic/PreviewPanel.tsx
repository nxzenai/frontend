"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, LoaderCircle, Play, RefreshCw, Square } from "lucide-react";
import agenticService from "@/services/agentic.service";
import type { AgenticPreview, AgenticVersion } from "@/types/agentic";

function requestMessage(error: unknown): string {
  const value = error as { response?: { data?: { detail?: { message?: string } } }; message?: string };
  return value.response?.data?.detail?.message ?? value.message ?? "The preview request failed.";
}

export default function PreviewPanel({ projectId, version }: {
  projectId: string;
  version: AgenticVersion;
}) {
  const [previews, setPreviews] = useState<AgenticPreview[]>([]);
  const [current, setCurrent] = useState<AgenticPreview | null>(null);
  const [operation, setOperation] = useState<"starting" | "stopping" | "restarting" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  const loadPreview = useCallback(async (previewId: string) => {
    const preview = await agenticService.preview(projectId, previewId);
    setNow(Date.now());
    setCurrent(preview);
    setPreviews(items => items.map(item => item.id === preview.id ? preview : item));
    return preview;
  }, [projectId]);

  useEffect(() => {
    let active = true;
    agenticService.previews(projectId).then(items => {
      if (!active) return;
      const versionPreviews = items.filter(item => item.version_id === version.id);
      setPreviews(versionPreviews);
      setCurrent(versionPreviews[0] ?? null);
      setNow(Date.now());
    }).catch(requestError => active && setError(requestMessage(requestError)));
    return () => { active = false; };
  }, [projectId, version.id]);

  useEffect(() => {
    if (!current || !["starting", "running", "stopping"].includes(current.status)) return;
    const timer = window.setInterval(() => {
      setNow(Date.now());
      void loadPreview(current.id).catch(requestError => setError(requestMessage(requestError)));
    }, 2000);
    return () => window.clearInterval(timer);
  }, [current, loadPreview]);

  const expiresIn = useMemo(() => {
    if (!current || current.status !== "running") return null;
    return Math.max(0, Math.ceil((new Date(current.expires_at).getTime() - now) / 60000));
  }, [current, now]);

  async function start() {
    setOperation("starting");
    setError(null);
    try {
      const preview = await agenticService.startPreview(projectId, version.id);
      setNow(Date.now());
      setCurrent(preview);
      setPreviews(items => [preview, ...items]);
    } catch (requestError) {
      setError(requestMessage(requestError));
    } finally {
      setOperation(null);
    }
  }

  async function stop() {
    if (!current) return;
    setOperation("stopping");
    setError(null);
    try {
      const preview = await agenticService.stopPreview(projectId, current.id);
      setCurrent(preview);
      setPreviews(items => items.map(item => item.id === preview.id ? preview : item));
    } catch (requestError) {
      setError(requestMessage(requestError));
    } finally {
      setOperation(null);
    }
  }

  async function restart() {
    if (!current) return;
    setOperation("restarting");
    setError(null);
    try {
      const preview = await agenticService.restartPreview(projectId, current.id);
      setNow(Date.now());
      setCurrent(preview);
      setPreviews(items => [preview, ...items]);
    } catch (requestError) {
      setError(requestMessage(requestError));
    } finally {
      setOperation(null);
    }
  }

  const active = current && ["starting", "running", "stopping"].includes(current.status);
  const starting = operation === "starting" || operation === "restarting" || current?.status === "starting";

  return (
    <div className="space-y-5" data-preview-panel>
      {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-500">Local Docker preview · V{version.version_number}</p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              {starting ? "Starting preview..." : current ? `Preview ${current.status}` : "Preview not started"}
            </h2>
            {current?.status === "running" && <p className="mt-2 text-sm text-emerald-300">Preview Running · Expires in {expiresIn} minute{expiresIn === 1 ? "" : "s"}</p>}
            {current?.last_error && <p className="mt-2 text-sm text-red-300">{current.last_error}</p>}
            {current?.status === "expired" && <p className="mt-2 text-sm text-amber-300">This preview expired and its container was removed.</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {!active && <button disabled={Boolean(operation)} onClick={() => void start()} className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-40"><Play className="h-4 w-4" /> Start Preview</button>}
            {current?.status === "running" && current.preview_url && <a href={current.preview_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950"><ExternalLink className="h-4 w-4" /> Open Preview</a>}
            {current?.status === "running" && <button disabled={Boolean(operation)} onClick={() => void restart()} className="flex items-center gap-2 rounded-xl border border-slate-600 px-4 py-2.5 text-sm text-white disabled:opacity-40"><RefreshCw className="h-4 w-4" /> Restart</button>}
            {active && <button disabled={Boolean(operation) || current?.status === "stopping"} onClick={() => void stop()} className="flex items-center gap-2 rounded-xl border border-red-500/40 px-4 py-2.5 text-sm text-red-300 disabled:opacity-40"><Square className="h-4 w-4" /> Stop</button>}
          </div>
        </div>
        {starting && <div className="mt-5 flex items-center gap-3 rounded-xl bg-cyan-500/10 p-4 text-sm text-cyan-200"><LoaderCircle className="h-4 w-4 animate-spin" /> Preparing isolated backend and frontend runtime...</div>}
        {current?.status === "running" && <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400"><span>Frontend: {current.preview_url}</span><span>Backend: {current.backend_url}</span></div>}
      </section>

      {current?.status === "running" && current.preview_url && (
        <section className="overflow-hidden rounded-2xl border border-slate-700 bg-white">
          <iframe title={`Agentic preview V${version.version_number}`} src={current.preview_url} className="h-[620px] w-full" sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts" />
        </section>
      )}

      {current && <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h3 className="font-semibold text-white">Preview logs</h3><pre className="mt-4 max-h-72 min-h-28 overflow-auto whitespace-pre-wrap rounded-xl bg-black/50 p-4 font-mono text-xs text-slate-300">{current.logs || "No runtime output yet."}</pre></section>}

      {previews.length > 1 && <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><h3 className="font-semibold text-white">Preview attempts</h3><div className="mt-3 space-y-2">{previews.map(preview => <button key={preview.id} onClick={() => setCurrent(preview)} className="flex w-full items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2 text-left text-sm"><span className="text-slate-300">{new Date(preview.created_at).toLocaleString()}</span><span className="capitalize text-slate-500">{preview.status}</span></button>)}</div></section>}
    </div>
  );
}
