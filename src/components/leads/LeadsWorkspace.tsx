"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAxiosError } from "axios";
import { leadIntake } from "@/services/leadIntake.service";
import type { IntakeFilters, IntakeLead, IntakeList, VerificationStatus } from "@/types/leadIntake";

const statusLabels = { pending: "Pending", verified: "Verified", not_verified: "Not Verified", pushed: "Pushed to CRM", not_pushed: "Not pushed" };
const fieldClass = "rounded-lg border border-slate-700 bg-slate-900 p-3 text-sm text-white";
const buttonClass = "rounded-lg border border-slate-600 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed";
const initialFilters: IntakeFilters = { page: 1, search: "", status: "", course: "", source: "", start: "", end: "" };

function errorMessage(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 401) return "Your session has expired. Please sign in again.";
    if (error.response?.status === 403) return "You do not have permission to manage leads.";
    if (typeof error.response?.data?.detail === "string") return error.response.data.detail;
  }
  return "The request failed. Please try again.";
}

function Badge({ status }: { status: keyof typeof statusLabels }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2 py-1 text-xs ${status === "verified" || status === "pushed" ? "bg-emerald-500/15 text-emerald-300" : status === "not_verified" ? "bg-red-500/15 text-red-300" : "bg-amber-500/15 text-amber-300"}`}>{statusLabels[status]}</span>;
}

export default function LeadsWorkspace() {
  const [filters, setFilters] = useState(initialFilters);
  const [data, setData] = useState<IntakeList | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [selected, setSelected] = useState<IntakeLead | null>(null);
  const [notes, setNotes] = useState("");
  const sequence = useRef(0);
  const acting = useRef(false);
  const reviewHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (selected) {
      reviewHeading.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      reviewHeading.current?.focus({ preventScroll: true });
    }
  }, [selected?.id]);

  const refresh = useCallback(async () => {
    const request = ++sequence.current;
    setLoading(true);
    setError("");
    try {
      const result = await leadIntake.list(filters);
      if (request === sequence.current) setData(result);
    } catch (err) {
      if (request === sequence.current) { setError(errorMessage(err)); setData(null); }
    } finally {
      if (request === sequence.current) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => { void refresh(); }, 250);
    return () => { clearTimeout(timer); sequence.current += 1; };
  }, [refresh]);

  function filter(key: keyof IntakeFilters, value: string) {
    setLoading(true);
    setFilters(current => ({ ...current, [key]: value, page: 1 }));
  }

  async function action(work: () => Promise<string>) {
    if (acting.current) return;
    acting.current = true;
    setBusy(true); setError(""); setFeedback("");
    try {
      const message = await work();
      setFeedback(message);
      await refresh();
    } catch (err) { setError(errorMessage(err)); }
    finally { setBusy(false); acting.current = false; }
  }

  async function review(id: string) {
    await action(async () => {
      const lead = await leadIntake.get(id);
      setSelected(lead); setNotes(lead.verification_notes ?? "");
      return "";
    });
  }

  function verify(status: VerificationStatus) {
    if (!selected) return;
    void action(async () => {
      const updated = await leadIntake.verify(selected.id, status, notes);
      setSelected(updated);
      return `Lead marked ${statusLabels[status]}.`;
    });
  }

  function push(lead: IntakeLead) {
    void action(async () => {
      const result = await leadIntake.push(lead.id);
      if (selected?.id === lead.id) setSelected(result.lead);
      return result.pushed ? "Lead pushed to CRM." : "Lead is already in CRM.";
    });
  }

  const canPush = (lead: IntakeLead) => lead.verification_status === "verified" && lead.crm_status === "not_pushed" && !lead.crm_lead_id;
  const summary = data?.summary;

  return <div className="space-y-6 text-slate-200">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold text-white">Leads</h1><p className="mt-2 text-slate-400">Review incoming enquiries and verify candidates before CRM follow-up.</p></div>
      <button className={`${buttonClass} bg-blue-600`} disabled={busy || loading || !summary?.ready} onClick={() => void action(async () => {
        const result = await leadIntake.pushVerified();
        if (selected) setSelected(await leadIntake.get(selected.id));
        return `${result.pushed} pushed to CRM. ${result.skipped} skipped. ${result.failed.length} failed${result.failed.length ? "; retry to process remaining leads" : ""}.`;
      })}>{busy ? "Processing…" : "Push Verified Leads to CRM"}</button>
    </div>
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{([["total", "Total Leads"], ["pending", "Pending"], ["verified", "Verified"], ["not_verified", "Not Verified"], ["ready", "Ready for CRM"]] as const).map(([key, label]) => <div key={key} className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-white">{summary?.[key] ?? "—"}</p></div>)}</div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <label className="grid gap-1 text-sm">Search<input className={fieldClass} placeholder="Name, email or mobile" value={filters.search} maxLength={200} onChange={e => filter("search", e.target.value)} /></label>
      <label className="grid gap-1 text-sm">Status<select className={fieldClass} value={filters.status} onChange={e => filter("status", e.target.value)}><option value="">All</option>{["pending", "verified", "not_verified", "pushed"].map(status => <option key={status} value={status}>{statusLabels[status as keyof typeof statusLabels]}</option>)}</select></label>
      <label className="grid gap-1 text-sm">Course<select className={fieldClass} value={filters.course} onChange={e => filter("course", e.target.value)}><option value="">All courses</option>{data?.courses.map(course => <option key={course}>{course}</option>)}</select></label>
      <label className="grid gap-1 text-sm">Source<select className={fieldClass} value={filters.source} onChange={e => filter("source", e.target.value)}><option value="">All sources</option>{data?.sources.map(source => <option key={source}>{source}</option>)}</select></label>
      <label className="grid gap-1 text-sm">Registered from (UTC)<input className={fieldClass} type="date" value={filters.start} onChange={e => filter("start", e.target.value)} /></label>
      <label className="grid gap-1 text-sm">Registered through (UTC)<input className={fieldClass} type="date" value={filters.end} onChange={e => filter("end", e.target.value)} /></label>
    </div>
    <div className="flex gap-3"><button className={buttonClass} disabled={busy} onClick={() => void refresh()}>Refresh</button><button className={buttonClass} onClick={() => setFilters(initialFilters)}>Clear filters</button></div>
    {error && <p role="alert" className="rounded-lg bg-red-500/10 p-3 text-red-300">{error}</p>}
    {feedback && <p role="status" className="rounded-lg bg-emerald-500/10 p-3 text-emerald-300">{feedback}</p>}
    {loading ? <p role="status" className="p-8 text-center">Loading leads…</p> : data && <>
      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900"><table className="w-full text-left text-sm"><caption className="sr-only">Incoming candidate leads</caption><thead className="text-slate-400"><tr>{["Candidate Name", "Email", "Mobile", "Course / Interest", "Profession", "Source", "Registered Date", "Verification Status", "CRM Status", "Actions"].map(title => <th className="whitespace-nowrap p-4" key={title}>{title}</th>)}</tr></thead><tbody>{data.items.map(lead => <tr key={lead.id} className="border-t border-slate-800"><td className="p-4">{lead.name}</td><td className="p-4">{lead.email}</td><td className="whitespace-nowrap p-4">{lead.phone}</td><td className="p-4">{lead.program_interest}</td><td className="p-4">{lead.profession}</td><td className="p-4">{lead.source}</td><td className="p-4">{new Date(lead.created_at).toLocaleDateString()}</td><td className="p-4"><Badge status={lead.verification_status} /></td><td className="p-4"><Badge status={lead.crm_status} /></td><td className="space-y-2 p-4"><button className={buttonClass} disabled={busy} onClick={() => void review(lead.id)}>Review</button><button className={`${buttonClass} whitespace-nowrap`} disabled={busy || !canPush(lead)} onClick={() => push(lead)}>{lead.crm_status === "pushed" ? "Already pushed" : "Push to CRM"}</button></td></tr>)}</tbody></table>{!data.items.length && <p className="p-10 text-center text-slate-400">No leads match your filters.</p>}</div>
      <div className="flex flex-wrap items-center gap-4"><span>{data.total} leads · Page {data.page} of {Math.max(data.pages, 1)}</span><button className={buttonClass} disabled={filters.page <= 1 || busy} onClick={() => setFilters(current => ({ ...current, page: current.page - 1 }))}>Previous</button><button className={buttonClass} disabled={filters.page >= data.pages || busy} onClick={() => setFilters(current => ({ ...current, page: current.page + 1 }))}>Next</button></div>
    </>}
    {selected && <section aria-label="Lead review" className="rounded-2xl border border-slate-700 bg-slate-900 p-5 sm:p-8">
      <div className="flex items-center justify-between gap-3"><h2 ref={reviewHeading} tabIndex={-1} className="text-xl font-bold">Review {selected.name}</h2><button className={buttonClass} disabled={busy} onClick={() => setSelected(null)}>Close review</button></div>
      <dl className="my-6 grid gap-4 sm:grid-cols-2">{([
        ["Full Name", selected.name], ["Email", selected.email], ["Mobile", selected.phone], ["City", selected.city], ["Profession", selected.profession], ["College / Company", selected.organization], ["Course / Program", selected.program_interest], ["Current Qualification / Role", selected.qualification], ["Experience", selected.experience], ["Preferred Date", selected.preferred_demo_date], ["Source", selected.source], ["How did you hear about NxZenAI?", selected.referral_source], ["Message", selected.message], ["Registered Date", new Date(selected.created_at).toLocaleString()], ["Verified by", selected.verified_by], ["Verified at", selected.verified_at],
      ]).map(([label, value]) => <div key={label}><dt className="text-xs text-slate-400">{label}</dt><dd className="mt-1 break-words whitespace-pre-wrap">{value || "—"}</dd></div>)}</dl>
      <div className="mb-4 flex gap-2"><Badge status={selected.verification_status} /><Badge status={selected.crm_status} /></div>
      <label className="grid gap-2">Verification Notes<textarea className={fieldClass} rows={3} maxLength={4000} value={notes} disabled={busy} onChange={e => setNotes(e.target.value)} /></label>
      <div className="mt-4 flex flex-wrap gap-3"><button className={`${buttonClass} bg-emerald-600`} disabled={busy} onClick={() => verify("verified")}>Verify</button><button className={buttonClass} disabled={busy} onClick={() => verify("not_verified")}>Not Verified</button><button className={buttonClass} disabled={busy || !canPush(selected)} onClick={() => push(selected)}>{selected.crm_status === "pushed" ? "Already pushed" : "Push to CRM"}</button></div>
    </section>}
  </div>;
}
