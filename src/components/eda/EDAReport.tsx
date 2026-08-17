"use client";
import { useState } from "react";
import { Download, FileText } from "lucide-react";
import EDAService from "@/services/eda.service";
import type { EDAProject, EDAReport as Report } from "@/types/eda";
export default function EDAReport({ project }: { project: EDAProject }) {
  const [report, setReport] = useState<Report | null>(null); const [working, setWorking] = useState(false); const [error, setError] = useState("");
  const generate = async () => { setWorking(true); setError(""); try { setReport(await EDAService.createReport(project.id)); } catch { setError("The report could not be generated."); } finally { setWorking(false); } };
  const download = async () => { if (!report) return; const response = await EDAService.downloadReport(project.id, report.id); const url = URL.createObjectURL(response.data); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${project.original_filename.replace(/\.[^.]+$/, "")}_eda_report.html`; anchor.click(); URL.revokeObjectURL(url); };
  return <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center"><FileText className="mx-auto text-blue-400" size={48} /><h2 className="mt-4 text-xl font-semibold text-white">Authoritative EDA report</h2><p className="mt-2 text-sm text-slate-400">Generate a downloadable HTML report from server-side overview, profiles, quality findings, statistics, correlations, and sampling disclosures.</p>{!report ? <button onClick={() => void generate()} disabled={working} className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50">{working ? "Generating report…" : "Generate HTML report"}</button> : <div className="mt-6"><p className="mb-3 text-sm text-emerald-300">Report generated {new Date(report.created_at).toLocaleString()}</p><button onClick={() => void download()} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-semibold text-white"><Download size={18} />Download report</button></div>}{error && <p className="mt-4 text-sm text-red-300">{error}</p>}</div>;
}
