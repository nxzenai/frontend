"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { learningService } from "@/services/learning.service";

const card = "rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-slate-100";
const input = "w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm text-slate-100";
const action = "rounded-lg bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50";
function message(error: unknown) { return error instanceof Error ? error.message : "Request failed. Please try again."; }

export function VerifiedPractice({ module, topicId, topicStage, onVerified }: { module: string; topicId: string; topicStage?: string; onVerified?: () => void }) {
  const [starter, setStarter] = useState("");
  const [instruction, setInstruction] = useState("");
  const [fixtureSchema, setFixtureSchema] = useState("");
  const [answer, setAnswer] = useState("");
  const [reference, setReference] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [options, setOptions] = useState<Array<{ id: string; label: string; task?: string }>>([]);
  const [notebookId, setNotebookId] = useState("");
  useEffect(() => {
    let active = true;
    setStarter(""); setInstruction(""); setFixtureSchema(""); setAnswer(""); setFeedback(""); setReference(""); setOptions([]);
    if (["automl", "autodl", "autonlp", "eda", "genai", "prompting"].includes(module)) {
      learningService.evidenceOptions(module, topicId).then((items) => { if (active) setOptions(items); }).catch((error) => { if (active) setFeedback(message(error)); });
    }
    if (module === "python") learningService.pythonChallenge(topicId).then((spec) => {
      if (active) { setInstruction(spec.instruction); setStarter(spec.starter_code); setAnswer(localStorage.getItem(`learning-code:${topicId}`) || spec.starter_code); setNotebookId(localStorage.getItem(`learning-notebook:${topicId}`) || ""); }
    }).catch(() => {});
    if (module === "sql") learningService.sqlChallenge(topicId).then((spec) => {
      if (active) { setInstruction(spec.instruction); setFixtureSchema(spec.fixture_schema); setStarter(spec.starter_query); setAnswer(spec.starter_query); }
    }).catch(() => {});
    return () => { active = false; };
  }, [module, topicId, topicStage]);
  if (!(["python", "sql", "automl", "autodl", "autonlp", "eda", "genai", "prompting"].includes(module))) return null;
  async function submit() {
    setBusy(true); setFeedback("");
    try {
      if (module === "python") {
        const result = await learningService.submitPython(topicId, answer);
        if (!result.grading_available) { setFeedback(result.reason); return; }
        setFeedback(`${result.attempt.feedback} Verified score: ${result.verified_score}/100 · Passed ${result.passed}/${result.total} checks.`);
        onVerified?.();
      } else if (module === "sql") {
        const result = await learningService.submitSQL(topicId, answer);
        setFeedback(`${result.feedback} Verified score: ${result.verified_score}/100.`);
        onVerified?.();
      } else {
        await learningService.verifyEvidence(topicId, reference);
        setFeedback("Completed owned lab result verified. Practical score: 100/100.");
        setReference("");
        onVerified?.();
        learningService.evidenceOptions(module, topicId).then(setOptions).catch(() => {});
      }
    } catch (error) { setFeedback(message(error)); }
    finally { setBusy(false); }
  }
  return <section className={card}>
    <h3 className="font-semibold">Verified practical</h3>
    <p className="mt-1 text-xs text-slate-400">Only a verified lab result contributes to coding or practical mastery.</p>
    {fixtureSchema && <p className="mt-2 text-xs text-slate-300">Challenge data: {fixtureSchema}</p>}
    {options.length > 0 && <select className={`${input} mt-3`} value={reference} onChange={(event) => setReference(event.target.value)} aria-label="Completed lab result"><option value="">Select a completed lab result</option>{options.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>}
    {["automl", "autodl", "autonlp", "eda", "genai", "prompting"].includes(module) && !options.length && <p className="mt-3 text-sm text-slate-400">No eligible saved result yet. Complete the related lab, then return and refresh this lesson.</p>}
    {starter && <><p className="mt-3 text-sm">{instruction}</p><p className="mt-1 text-xs text-slate-400">{module === "python" ? "Execution grading is unavailable in production; notebook and theory practice remain available." : "The existing SQL service runs this against fixed challenge rows."}</p><textarea className={`${input} mt-2 font-mono`} rows={8} value={answer} onChange={(event) => { setAnswer(event.target.value); if (module === "python") localStorage.setItem(`learning-code:${topicId}`, event.target.value); }} aria-label={`${module} challenge solution`} />{module === "python" && notebookId && <button className={`${action} mt-2`} onClick={() => { setBusy(true); learningService.notebookCode(notebookId).then((code) => { if (code.trim()) { setAnswer(code); localStorage.setItem(`learning-code:${topicId}`, code); setFeedback("Notebook code loaded. Review it before submission."); } }).catch((error) => setFeedback(message(error))).finally(() => setBusy(false)); }}>Use notebook solution</button>}</>}
    {!starter && !["automl", "autodl", "autonlp", "eda", "genai", "prompting"].includes(module) && <p className="mt-3 text-sm text-slate-400">No executable challenge is available for this topic yet.</p>}
    {(options.length > 0 || starter) && <button className={`${action} mt-3`} disabled={busy || !(options.length ? reference : answer.trim())} onClick={submit}>Submit for verification</button>}
    {feedback && <p className="mt-3 text-sm text-blue-200" role="status">{feedback}</p>}
  </section>;
}

export function LearningAssignments({ faculty }: { faculty?: boolean }) {
  const [items, setItems] = useState<Awaited<ReturnType<typeof learningService.assignments>>>([]);
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof learningService.cohortSummary>> | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("learning_topic");
  const [referenceId, setReferenceId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [references, setReferences] = useState<Array<{ id: string; label: string }>>([]);
  const [batches, setBatches] = useState<Array<{ id: string; label: string }>>([]);
  useEffect(() => { learningService.assignments().then(setItems).catch(() => {}); }, []);
  useEffect(() => { if (faculty) learningService.cohortSummary().then(setSummary).catch(() => {}); }, [faculty]);
  useEffect(() => { if (faculty) learningService.referenceOptions(type).then(setReferences).catch((error) => setFeedback(message(error))); }, [faculty, type]);
  useEffect(() => { if (faculty) learningService.batches().then(setBatches).catch((error) => setFeedback(message(error))); }, [faculty]);
  function assignmentHref(item: { type: string; reference_id: string }) {
    if (item.type === "case_study") return `/learn/projects#${encodeURIComponent(item.reference_id)}`;
    if (item.type === "mock_interview") return "/interview";
    if (item.type === "assessment") return "/assessments";
    const module = item.reference_id.split("-")[0];
    return `/learn/${module}/${encodeURIComponent(item.reference_id)}`;
  }
  async function assign() {
    setBusy(true); setFeedback("");
    try {
      await learningService.assign({ title: title.trim(), type, reference_id: referenceId.trim(),
        batch_id: batchId.trim() || undefined, due_date: dueDate ? new Date(`${dueDate}T23:59:59`).toISOString() : undefined });
      setFeedback("Assignment created."); setTitle(""); setReferenceId("");
      setSummary(await learningService.cohortSummary());
      setItems(await learningService.assignments());
    } catch (error) { setFeedback(message(error)); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4">
    <section className={card}><h2 className="font-semibold">Assigned learning</h2>{items.length ? <div className="mt-3 space-y-2">{items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-2 text-sm"><div><p>{item.title}</p><p className="text-xs text-slate-400">{item.type.replaceAll("_", " ")}{item.due_date ? ` · Due ${new Date(item.due_date).toLocaleDateString()}` : ""}</p></div><div className="flex items-center gap-2"><span className="text-blue-300">{item.status.replaceAll("_", " ")}</span><Link className={action} href={assignmentHref(item)}>Open</Link></div></div>)}</div> : <p className="mt-2 text-sm text-slate-400">No assignments yet.</p>}</section>
    {faculty && <section className={card}><h2 className="font-semibold">Assign to cohort</h2><div className="mt-3 grid gap-2 sm:grid-cols-2"><input className={input} placeholder="Assignment title" value={title} onChange={(event) => setTitle(event.target.value)} /><select className={input} value={type} onChange={(event) => { setType(event.target.value); setReferenceId(""); }}>{["learning_topic", "capstone", "assessment", "python_challenge", "sql_challenge", "case_study", "mock_interview", "automl_practical", "autodl_practical", "autonlp_practical", "eda_practical", "genai_practical", "prompting_practical"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}</select><select className={input} value={referenceId} onChange={(event) => setReferenceId(event.target.value)}><option value="">Select learning activity</option>{references.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><select className={input} value={batchId} onChange={(event) => setBatchId(event.target.value)}><option value="">All accessible learners</option>{batches.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><label className="text-xs text-slate-400">Due date (optional)<input className={`${input} mt-1`} type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label></div><div className="mt-3 flex flex-wrap gap-2"><button className={action} disabled={busy || !title.trim() || !referenceId.trim()} onClick={assign}>Assign</button><button className="rounded-lg border border-slate-700 px-3 py-2 text-sm" onClick={() => learningService.cohortSummary(batchId.trim() || undefined).then(setSummary).catch((error) => setFeedback(message(error)))}>View cohort summary</button></div>{feedback && <p className="mt-2 text-sm" role="status">{feedback}</p>}</section>}
    {faculty && summary && <section className={card}><h2 className="font-semibold">Cohort summary</h2><div className="mt-3 grid gap-3 text-sm sm:grid-cols-3"><p>Learners: {summary.learner_count}</p><p>Overall mastery: {summary.average_overall_mastery}%</p><p>Assigned assessment completion: {summary.assessment_completion === null ? "No assigned assessments" : `${summary.assessment_completion}%`}</p><p>Assessment participation: {summary.assessment_participation}%</p><p>Interview readiness: {summary.interview_readiness_average ?? "Unavailable"}</p><p>Assignments: {summary.assignment_completion.completed}/{summary.assignment_completion.assigned} complete · {summary.assignment_completion.overdue} overdue</p><p>Needing attention: {summary.learners_needing_attention}</p></div><div className="mt-3 text-sm"><p>Python: {summary.module_averages.python ?? 0}% · SQL: {summary.module_averages.sql ?? 0}% · ML: {summary.module_averages.automl ?? 0}%</p><p className="mt-1">Skill bands: {Object.entries(summary.skill_distribution).map(([band, count]) => `${band}: ${count}`).join(" · ")}</p><p className="mt-1">Common weak topics: {summary.common_weak_topics.join(", ") || "None yet"}</p>{summary.attention_list?.map((item) => <p key={item.learner_id} className="mt-1 text-xs text-slate-400">{item.learner_name}: {item.mastery}% · Review {item.weak_topics.join(", ") || "foundations"}</p>)}</div></section>}
    {faculty && summary && <section className={card}><h3 className="font-semibold">Foundation and capstone progress</h3><div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">{["automl", "autodl", "autonlp"].map((moduleName) => { const lifecycle = summary.capstone_lifecycle?.[moduleName]; return <p key={moduleName}>{moduleName.toUpperCase()}: foundations {summary.foundation_mastery?.[moduleName] ?? 0}% · capstones {summary.capstone_completion?.[moduleName]?.completed ?? 0}/{summary.capstone_completion?.[moduleName]?.possible ?? 0}{lifecycle && <span className="block text-xs text-slate-400">{lifecycle.assigned} assigned · {lifecycle.started} started · {lifecycle.completed} completed · {lifecycle.average_completion_percent}% average stages · Common gap: {lifecycle.most_incomplete_stage?.replaceAll("_", " ") || "None"}</span>}</p>; })}</div></section>}
  </div>;
}
