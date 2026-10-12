"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { learningService } from "@/services/learning.service";
import { LearningAssignments, VerifiedPractice } from "@/components/learning/LearningV1Extras";
import { CapstoneLifecycle } from "@/components/learning/CapstoneLifecycle";
import { TopicJourneySupport } from "@/components/learning/TopicJourneySupport";
import { MasteryRoadmap } from "@/components/learning/MasteryRoadmap";
import { LearningVisual } from "@/components/learning/LearningVisual";
import type { InterviewSession, LearningAssessment, LearningCase, LearningDashboard, LearningPath, LearningTopic, TopicProgress } from "@/types/learning";

type View = "learn" | "practice" | "projects" | "assessments" | "interview" | "progress";
const NAV: Array<{ view: View; title: string; href: string }> = [
  { view: "learn", title: "Learn", href: "/learn" },
  { view: "practice", title: "Practice Library", href: "/practice" },
  { view: "projects", title: "Projects", href: "/learn/projects" },
  { view: "assessments", title: "Assessments", href: "/assessments" },
  { view: "interview", title: "Interview", href: "/interview" },
  { view: "progress", title: "My Progress", href: "/my-progress" },
];
const panel = "rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5";
const button = "rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50";
const secondary = "rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800";
const AUTOMATION_STEPS: Record<string, string[]> = {
  automl: ["Inspect features and target where applicable", "Choose a supervised split or unsupervised preparation strategy", "Fit preprocessing using the appropriate learning data", "Train candidate models", "Compare held-out metrics", "Keep the selected fitted artifact"],
  autodl: ["Inspect class data", "Prepare tensors and validation data", "Train model candidates", "Evaluate held-out results", "Save the selected model"],
  autonlp: ["Inspect text and labels", "Prepare text features", "Split held-out examples", "Train candidates", "Review class metrics"],
};
const EXAMPLE_LABELS = {
  python: "View illustrative Python example",
  sql: "View illustrative SQL example",
  prompt: "View prompt example",
  json: "View JSON example",
  pseudocode: "View conceptual pseudocode",
};

function errorText(error: unknown) {
  if (typeof error === "object" && error && "response" in error) {
    const response = (error as { response?: { data?: { detail?: string } } }).response;
    if (typeof response?.data?.detail === "string") return response.data.detail;
  }
  return error instanceof Error ? error.message : "The request could not be completed.";
}

export default function LearningWorkspace({ view = "learn", initialModule, initialTopic }: { view?: View; initialModule?: string; initialTopic?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [dashboard, setDashboard] = useState<LearningDashboard | null>(null);
  const [progress, setProgress] = useState<Record<string, TopicProgress>>({});
  const [module, setModule] = useState(initialModule || "automl");
  const [path, setPath] = useState<LearningPath | null>(null);
  const [topicId, setTopicId] = useState(initialTopic || "");
  const [topic, setTopic] = useState<LearningTopic | null>(null);
  const [cases, setCases] = useState<LearningCase[]>([]);
  const [caseAttempts, setCaseAttempts] = useState<Awaited<ReturnType<typeof learningService.attempts>>>([]);
  const [caseSelection, setCaseSelection] = useState<Record<string, string>>({});
  const [assessments, setAssessments] = useState<LearningAssessment[]>([]);
  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [assessmentChoices, setAssessmentChoices] = useState<number[]>([]);
  const [assessmentFeedback, setAssessmentFeedback] = useState("");
  const [choice, setChoice] = useState<number | null>(null);
  const [activityChoices, setActivityChoices] = useState<Record<string, number>>({});
  const [reasonText, setReasonText] = useState("");
  const [activityFeedback, setActivityFeedback] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const [labReference, setLabReference] = useState("");
  const [labNotes, setLabNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [interviewHistory, setInterviewHistory] = useState<InterviewSession[]>([]);
  const [readiness, setReadiness] = useState<Record<string, { score: number; sessions: number; competencies: Record<string, number>; weakest_competency: string | null }>>({});
  const [mode, setMode] = useState<"practice" | "mock">("practice");
  const [questionCount, setQuestionCount] = useState(5);
  const [interviewLevel, setInterviewLevel] = useState(5);
  const [targetRole, setTargetRole] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [answer, setAnswer] = useState("");
  const [lastAnswer, setLastAnswer] = useState<InterviewSession["answers"][number] | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [faculty, setFaculty] = useState<{ learner_count: number; module_averages: Record<string, number>; interview_readiness: number | null; assessment_average: number | null; assessment_participation?: number; common_weak_topics: string[] } | null>(null);
  const [pendingReviews, setPendingReviews] = useState<Array<{ id: string; topic_id: string; activity_type: string; lab_reference: string; response: string }>>([]);
  const [reviewScore, setReviewScore] = useState(0);
  const [reviewFeedback, setReviewFeedback] = useState("");

  const reloadProgress = useCallback(async () => {
    const [nextProgress, nextDashboard] = await Promise.all([learningService.progress(), learningService.dashboard()]);
    setProgress(nextProgress); setDashboard(nextDashboard);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([learningService.paths(), learningService.progress(), learningService.dashboard()])
      .then(([nextPaths, nextProgress, nextDashboard]) => { if (active) { setPaths(nextPaths); setProgress(nextProgress); setDashboard(nextDashboard); } })
      .catch((cause) => { if (active) setError(errorText(cause)); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    learningService.path(module).then((value) => { if (active) setPath(value); }).catch((cause) => { if (active) setError(errorText(cause)); });
    return () => { active = false; };
  }, [module, progress]);

  useEffect(() => {
    if (!topicId) { setTopic(null); return; }
    let active = true;
    learningService.topic(module, topicId).then((value) => { if (active) { setTopic(value); setChoice(null); setFeedback(""); setActivityChoices({}); setReasonText(""); setActivityFeedback({}); } })
      .catch((cause) => { if (active) setError(errorText(cause)); });
    return () => { active = false; };
  }, [module, topicId]);

  useEffect(() => {
    if (!initialTopic) return;
    learningService.startTopic(initialTopic).then(reloadProgress).catch((cause) => setError(errorText(cause)));
  }, [initialTopic, reloadProgress]);

  useEffect(() => {
    if (view === "projects") {
      learningService.cases().then(setCases).catch((cause) => setError(errorText(cause)));
      learningService.attempts().then(setCaseAttempts).catch((cause) => setError(errorText(cause)));
    }
    if (view === "interview") {
      learningService.interviewHistory().then(setInterviewHistory).catch((cause) => setError(errorText(cause)));
      learningService.readiness().then(setReadiness).catch((cause) => setError(errorText(cause)));
    }
  }, [view]);

  useEffect(() => {
    if (view !== "assessments") return;
    learningService.assessments(module).then((value) => { setAssessments(value); setAssessmentIndex(0); setAssessmentChoices([]); setAssessmentFeedback(""); })
      .catch((cause) => setError(errorText(cause)));
  }, [view, module]);

  async function act(operation: () => Promise<void>) {
    setBusy(true); setError("");
    try { await operation(); } catch (cause) { setError(errorText(cause)); }
    finally { setBusy(false); }
  }

  function selectModule(value: string) { setModule(value); setPath(null); setTopicId(""); setTopic(null); setFeedback(""); }
  const moduleTitle = paths.find((item) => item.id === module)?.title ?? module;
  const labHref = (url: string, destination = `/learn/${module}/${topicId}`) => `${url}${url.includes("?") ? "&" : "?"}returnTo=${encodeURIComponent(destination)}`;

  async function openTopic(id: string) {
    setTopicId(id);
    const selected = path?.topics?.find((item) => item.id === id);
    if (selected?.is_capstone && selected.prerequisites.some((ref) => progress[ref]?.status !== "MASTERED")) return;
    if (selected && !selected.is_capstone && selected.prerequisites.some((ref) => (progress[ref]?.scores?.theory ?? 0) < 70)) return;
    await act(async () => { await learningService.startTopic(id); await reloadProgress(); });
  }

  async function submitCheck() {
    if (!topic || choice === null) return;
    await act(async () => {
      const result = await learningService.answer(topic.id, choice);
      setFeedback(result.attempt?.feedback || "Attempt saved.");
      await reloadProgress();
    });
  }

  async function submitFoundation(kind: "concept" | "reasoning" | "quiz" | "code_reading") {
    if (!topic || activityChoices[kind] === undefined) return;
    await act(async () => {
      const result = await learningService.checkActivity(topic.id, kind, activityChoices[kind], kind === "reasoning" ? reasonText.trim() : "");
      setActivityFeedback((old) => ({ ...old, [kind]: result.attempt?.feedback || "Answer recorded." }));
      await reloadProgress();
    });
  }

  async function recordLab(kind: "coding" | "practical") {
    if (!topic || !labReference.trim()) return;
    await act(async () => {
      const result = await learningService.labAttempt(topic.id, kind === "coding" && module === "sql" ? "sql" : kind, labReference.trim(), labNotes);
      setFeedback(result.feedback || "Practice recorded."); setLabReference(""); setLabNotes("");
      await reloadProgress();
    });
  }

  async function openPythonChallenge() {
    if (!topic) return;
    await act(async () => {
      const spec = await learningService.pythonChallenge(topic.id);
      const id = await learningService.createPythonChallenge(topic.title, spec.instruction, spec.starter_code);
      localStorage.setItem(`learning-notebook:${topic.id}`, id);
      router.push(`/notebooks/${encodeURIComponent(id)}?returnTo=${encodeURIComponent(`/learn/${module}/${topic.id}`)}`);
    });
  }

  async function submitAssessment() {
    const activity = assessments[assessmentIndex];
    if (!activity || !assessmentChoices.length) return;
    await act(async () => {
      const result = await learningService.submitAssessment(activity.id, assessmentChoices);
      setAssessmentFeedback(result.attempt?.feedback || "Assessment saved.");
      await reloadProgress();
    });
  }

  async function changeCase(item: LearningCase, step: string) {
    const current = item.progress?.completed_steps || [];
    const completed = current.includes(step) ? current.filter((value) => value !== step) : [...current, step];
    await act(async () => {
      await learningService.caseProgress(item.id, completed, []);
      setCases(await learningService.cases());
    });
  }

  async function verifyCase(item: LearningCase) {
    const attempt = caseSelection[item.id];
    if (!attempt) return;
    await act(async () => {
      await learningService.verifyCase(item.id, attempt);
      setCases(await learningService.cases());
      await reloadProgress();
    });
  }

  async function startInterview() {
    await act(async () => {
      const created = await learningService.interviewStart(module, mode, questionCount, interviewLevel, targetRole, topicId || undefined, questionType || undefined);
      setSession(created); setLastAnswer(null); setShowHint(false); setAnswer("");
      setSession(await learningService.interviewQuestion(created.id));
    });
  }

  async function nextQuestion() {
    if (!session) return;
    await act(async () => { setSession(await learningService.interviewQuestion(session.id)); setLastAnswer(null); setShowHint(false); setAnswer(""); });
  }

  async function submitInterview() {
    if (!session || !answer.trim()) return;
    await act(async () => {
      const result = await learningService.interviewAnswer(session.id, answer.trim());
      if (result.status === "provider_failed") { setError(result.message || "Evaluation unavailable. Your answer is saved; retry later."); return; }
      if (result.session) setSession(result.session);
      if (result.answer) setLastAnswer(result.answer);
      if (result.session?.status === "completed") {
        setInterviewHistory(await learningService.interviewHistory());
        setReadiness(await learningService.readiness());
      }
      await reloadProgress();
    });
  }

  async function retryInterview() {
    if (!session) return;
    await act(async () => { setSession(await learningService.interviewRetry(session.id)); setLastAnswer(null); setShowHint(false); setAnswer(""); });
  }

  async function loadFaculty() {
    await act(async () => {
      setFaculty(await learningService.faculty());
      setPendingReviews(await learningService.pendingReviews());
    });
  }

  async function review(id: string, category: "coding" | "practical") {
    if (!reviewFeedback.trim()) return;
    await act(async () => {
      await learningService.review(id, category, reviewScore, reviewFeedback.trim());
      setPendingReviews(await learningService.pendingReviews());
      setReviewFeedback("");
    });
  }

  const selector = <label className="block text-sm text-slate-300">Learning path
    <select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-100 sm:w-auto" value={module} onChange={(event) => selectModule(event.target.value)}>
      {paths.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
    </select>
  </label>;

  const structuredFoundation = topic && !topic.is_capstone && (["automl", "autodl", "autonlp"].includes(module) || Boolean(topic.reasoning_check || topic.code_check));
  const capstoneMissing = topic?.is_capstone ? topic.prerequisites.filter((id) => progress[id]?.status !== "MASTERED") : [];
  const foundationMissing = topic && !topic.is_capstone ? topic.prerequisites.filter((id) => (progress[id]?.scores?.theory ?? 0) < 70) : [];
  const foundationChecks = topic && structuredFoundation ? ([
    ["concept", "Learn · concept check", topic.quick_check],
    ["reasoning", "Reason · apply the concept", topic.reasoning_check],
    ["code_reading", "Code · read an example", topic.code_check],
    ["quiz", "Check understanding", topic.quiz_check],
  ] as const).filter((entry) => entry[2]) : [];
  const journeySupport = topic && <TopicJourneySupport key={topic.id} topic={topic} progress={progress[topic.id]} labHref={(url) => labHref(url, "/learn/" + module + "/" + topic.id)} />;
  const lesson = topic && (foundationMissing.length ? <div className={panel}><h2 className="font-semibold">Prerequisite required</h2><p className="mt-2 text-sm text-slate-300">Complete the prerequisite quick check before this lesson:</p><ul className="mt-2 list-disc pl-5 text-sm text-slate-300">{foundationMissing.map((id) => <li key={id}>{path?.topics?.find((item) => item.id === id)?.title || id}</li>)}</ul><Link className={`${secondary} mt-3 inline-block`} href={labHref(topic.lab_url, `/learn/${module}/${topic.id}`)}>Open lab directly</Link></div> : <div className="space-y-4">
    <nav className="flex flex-wrap gap-3 text-xs text-blue-300" aria-label="Topic journey"><a href="#topic-concept">Learn &amp; Understand</a><a href="#topic-see">See example</a><a href="#topic-check">Check &amp; Reason</a>{!topic.is_capstone && <a href="#topic-practice">Practice</a>}<a href="#topic-explain">Explain</a><a href="#topic-apply">Apply</a><a href="#topic-mastery">Mastery evidence</a></nav>
    <div id="topic-concept" className={panel}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase text-blue-300">{topic.level} · {topic.stage}</p><h2 className="mt-1 text-xl font-semibold text-white">{topic.title}</h2></div><Link className={secondary} href={labHref(topic.lab_url, `/learn/${module}/${topic.id}`)}>Open {path?.native_lab_label || moduleTitle.replace(" Mastery", "")}</Link></div>
      <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300"><p>{topic.description}</p>{topic.theory_sections?.map((section) => <div key={section.heading}><h3 className="font-semibold text-slate-100">{section.heading}</h3><p>{section.text}</p></div>)}<p><strong className="text-slate-100">Example:</strong> {topic.example}</p><p><strong className="text-slate-100">Why it matters / Common mistake:</strong> {topic.common_mistake}</p></div>
      {topic.analogy && <div className="mt-4 rounded-lg border border-blue-900/70 bg-blue-950/30 p-3 text-sm"><p className="font-medium text-blue-200">Everyday example · {topic.analogy.title}</p><p className="mt-1 text-slate-300">{topic.analogy.description}</p></div>}
      <div id="topic-see"><LearningVisual visual={topic.visual} /></div>
      {!!topic.learner_lifecycle?.length && !topic.is_capstone && <details className="mt-3 rounded border border-slate-700 p-3"><summary className="cursor-pointer text-sm font-medium">Where this fits in the wider lifecycle</summary><ol className="mt-2 list-inside list-decimal space-y-2">{topic.learner_lifecycle.map(stage => <li key={stage.id} className="text-sm"><strong>{stage.title}</strong><p className="ml-4 text-xs text-slate-400">{stage.description}</p></li>)}</ol></details>}
      <div className="mt-4 flex flex-wrap gap-2">{topic.key_takeaways?.map((value) => <span key={value} className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">{value}</span>)}</div>
      {AUTOMATION_STEPS[module] && <details className="mt-4 rounded-lg border border-slate-700 p-3 text-sm"><summary className="cursor-pointer font-medium">What NxZenAI does</summary><ol className="mt-2 list-inside list-decimal space-y-1 text-slate-300">{AUTOMATION_STEPS[module].map((step) => <li key={step}>{step}</li>)}</ol></details>}
      {progress[topic.id]?.verification_unavailable?.includes("coding") && <p className="mt-3 text-sm text-amber-300">Execution grading unavailable in this environment. Notebook and theory practice remain available; no coding score is awarded.</p>}
      <p className="mt-2 text-xs text-slate-400">Required for mastery: {Object.entries(progress[topic.id]?.mastery_requirements || topic.mastery_requirements || { theory: 70 }).map(([category, threshold]) => `${category} ${threshold}%`).join(" · ")}{topic.is_capstone ? " · required life-cycle stages" : ""}</p>
      {topic.illustrative_example && <details className="mt-2 rounded-lg border border-slate-700 p-3 text-sm"><summary className="cursor-pointer font-medium">{EXAMPLE_LABELS[topic.illustrative_example.type]}</summary><p className="mt-2 text-sm font-medium text-slate-200">{topic.illustrative_example.title}</p><p className="mt-1 text-xs text-slate-400">{topic.is_capstone ? "Educational example; it is not a reconstruction of this saved run." : "Illustrative learning example."}</p><pre className="mt-2 overflow-x-auto rounded bg-slate-950 p-3 text-xs"><code>{topic.illustrative_example.content}</code></pre>{topic.illustrative_example.note && <p className="mt-2 text-xs text-slate-400">{topic.illustrative_example.note}</p>}</details>}
    </div>
    {topic.is_capstone && <div className={panel}><h3 className="font-semibold">{capstoneMissing.length ? "Capstone locked" : "Capstone unlocked"}</h3><p className="mt-2 text-sm text-slate-300">Master these foundations before starting the business case:</p><ul className="mt-2 space-y-1 text-sm">{topic.prerequisites.map((id) => <li key={id}>{progress[id]?.status === "MASTERED" ? "✓" : "○"} {path?.topics?.find((item) => item.id === id)?.title || id}</li>)}</ul>{capstoneMissing.length > 0 && <p className="mt-3 text-sm text-amber-300">Complete the remaining lessons to unlock this business case.</p>}</div>}
    {topic.is_capstone && <CapstoneLifecycle topicId={topic.id} module={module} startedAt={progress[topic.id]?.activity_started_at} labHref={(url) => labHref(url, `/learn/${module}/${topic.id}`)} onProgress={() => void reloadProgress()} />}
    <div id="topic-check" />
    {foundationChecks.map(([kind, title, check]) => check && <div className={panel} key={kind}><h3 className="font-semibold text-white">{title} {progress[topic.id]?.scores?.[kind === "concept" ? "theory" : kind] !== null && progress[topic.id]?.scores?.[kind === "concept" ? "theory" : kind] !== undefined ? `· ${progress[topic.id]?.scores?.[kind === "concept" ? "theory" : kind]}%` : ""}</h3>{"scenario" in check && <p className="mt-2 text-sm text-slate-400">{check.scenario}</p>}<p className="mt-2 text-sm text-slate-300">{check.question}</p><div className="mt-3 space-y-2">{check.choices.map((value, index) => <label key={index} className="flex gap-2 text-sm text-slate-200"><input type="radio" name={`${topic.id}-${kind}`} checked={activityChoices[kind] === index} onChange={() => setActivityChoices((old) => ({ ...old, [kind]: index }))} />{value}</label>)}</div>{kind === "reasoning" && <textarea className="mt-3 w-full rounded border border-slate-700 bg-slate-950 p-2 text-sm" rows={2} value={reasonText} onChange={(event) => setReasonText(event.target.value)} placeholder="Briefly explain why you chose this answer." />}<button className={`${button} mt-3`} disabled={busy || activityChoices[kind] === undefined || kind === "reasoning" && !reasonText.trim()} onClick={() => submitFoundation(kind)}>Check answer</button>{activityFeedback[kind] && <p className="mt-2 text-sm text-blue-200" role="status">{activityFeedback[kind]}</p>}</div>)}
    {structuredFoundation && ["automl-features-target", "automl-splits", "automl-metrics"].includes(topic.id) && <div className={panel}><h3 className="font-semibold">Optional runnable code challenge</h3><p className="mt-2 text-sm text-slate-400">Try this in a Python Lab notebook. Execution verification is unavailable in production; the code-reading activity above remains the mastery check.</p><button className={`${button} mt-3`} disabled={busy} onClick={openPythonChallenge}>Open starter notebook</button><div className="mt-3"><VerifiedPractice module="python" topicId={topic.id} onVerified={() => void reloadProgress()} /></div></div>}
    {!structuredFoundation && !topic.is_capstone && <div className={panel}><h3 className="font-semibold text-white">Practice: quick check</h3><p className="mt-2 text-sm text-slate-300">{topic.quick_check?.question}</p><div className="mt-3 space-y-2">{topic.quick_check?.choices.map((value, index) => <label key={index} className="flex gap-2 text-sm text-slate-200"><input type="radio" checked={choice === index} onChange={() => setChoice(index)} />{value}</label>)}</div><button className={`${button} mt-4`} disabled={busy || choice === null} onClick={submitCheck}>Submit answer</button>
      {feedback && <p className="mt-3 text-sm text-blue-200" role="status">{feedback}</p>}</div>}
    {!topic.is_capstone && <section id="topic-practice" className={panel}><h3 className="font-semibold">Practice this concept</h3><p className="mt-2 text-sm text-slate-300">{topic.practice_activity || "Use the existing topic checks and related lab to apply the concept."}</p>{topic.coding_exercise && <p className="mt-2 text-sm text-slate-400">{topic.coding_exercise}</p>}<p className="mt-2 text-xs text-slate-400">Existing checks and verified practice provide evidence; reading this instruction does not award a score.</p></section>}
    {(module === "python" || module === "sql") && <div className={panel}>
      <h3 className="font-semibold text-white">Code and experiment</h3><p className="mt-2 text-sm text-slate-300">{topic.coding_exercise || "Open the related lab and reproduce the example."}</p>
      <Link className={`${secondary} mt-3 inline-block`} href={labHref(topic.lab_url, `/learn/${module}/${topic.id}`)}>Open existing lab</Link>
      {module === "python" && ["python-basics", "python-collections", "python-pandas"].includes(topic.id) && <button className={`${button} ml-2 mt-3`} disabled={busy} onClick={openPythonChallenge}>Create practice notebook</button>}
      <p className="mt-4 text-xs text-slate-400">Record a lab reference for your own history. This is unverified and does not award coding mastery.</p>
      <input className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm" placeholder="Link or description of your lab work for faculty review" value={labReference} onChange={(event) => setLabReference(event.target.value)} />
      <textarea className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm" placeholder="What did you change or learn?" value={labNotes} onChange={(event) => setLabNotes(event.target.value)} rows={2} />
      <div className="mt-2 flex flex-wrap gap-2"><button className={secondary} disabled={busy || !labReference.trim()} onClick={() => recordLab("coding")}>Record coding practice</button><button className={secondary} disabled={busy || !labReference.trim()} onClick={() => recordLab("practical")}>Record lab outcome</button></div>
    </div>}
    {((!["automl", "autodl", "autonlp", "python", "sql"].includes(module) && Boolean(topic.mastery_requirements?.practical)) || module === "python" && ["python-basics", "python-collections", "python-pandas"].includes(topic.id) || module === "sql" && ["sql-select", "sql-groups", "sql-joins"].includes(topic.id)) && <VerifiedPractice module={module} topicId={topic.id} topicStage={topic.stage} onVerified={() => void reloadProgress()} />}
    {journeySupport}
  </div>);

  return <div className="mx-auto max-w-6xl space-y-5 p-4 text-slate-100 sm:p-6">
    <header><p className="text-xs font-semibold uppercase tracking-widest text-blue-300">NxZenAI AI Studio</p><h1 className="mt-1 text-2xl font-semibold">Learning & Mastery</h1><p className="mt-1 text-sm text-slate-400">Learn concepts, practice in the existing labs, assess reasoning, and prepare for interviews.</p></header>
    <nav className="flex gap-2 overflow-x-auto border-b border-slate-800 pb-2" aria-label="Learning sections">{NAV.map((item) => <Link key={item.view} href={item.href} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm ${view === item.view ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"}`}>{item.title}</Link>)}</nav>
    {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200" role="alert">{error}</p>}

    {view === "learn" && <>
      {!initialModule && <LearningAssignments />}
      {!initialModule && dashboard && <div className="grid gap-3 sm:grid-cols-4"><div className={panel}><p className="text-xs text-slate-400">Overall AI Readiness</p><p className="mt-1 text-3xl font-semibold">{dashboard.overall_readiness}%</p><p className="text-xs text-slate-500">Based on recorded assessment evidence</p></div><div className={panel}><p className="text-xs text-slate-400">Verified Practical Progress</p><p className="mt-1 text-3xl font-semibold">{dashboard.verified_practical_topics ?? 0}</p><p className="text-xs text-slate-500">Topics with verified practical evidence</p></div><div className={panel}><p className="text-xs text-slate-400">Continue Learning</p><p className="mt-2 text-sm">{dashboard.recommended_next?.title || "Choose your first lesson"}</p></div><div className={panel}><p className="text-xs text-slate-400">Weak Areas</p><p className="mt-2 text-sm">{dashboard.weak_areas.map((item) => item.title).join(", ") || "None recorded yet"}</p></div></div>}
      {!initialModule && <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{dashboard?.modules.map((item) => <Link key={item.module} href={`/learn/${item.module}`} className={`${panel} hover:border-blue-500/60`}><h2 className="font-semibold">{item.title}</h2><p className="mt-2 text-2xl">{item.mastery_score}%</p><p className="mt-1 text-xs text-slate-400">{item.mastered}/{item.topic_count} mastered · {item.current_level}</p><p className="mt-2 text-xs text-blue-300">{item.next_topic?.title || "Explore path"}</p></Link>)}</div>}
      {(initialModule || topicId) && (topicId ? <div className={panel}><Link href={"/learn/" + module} className="text-sm text-blue-300 hover:underline">← {moduleTitle} roadmap</Link><h2 className="mt-2 text-lg font-semibold">{topic?.title || moduleTitle}</h2><p className="mt-1 text-xs text-slate-400">Follow the unified topic journey below.</p></div> : path?.id === module ? <MasteryRoadmap key={path.id} path={path} busy={busy} onOpen={(id) => router.push("/learn/" + path.id + "/" + id)} labHref={labHref(path.native_lab_url || path.lab_url, "/learn/" + path.id)} /> : <p className="text-sm text-slate-400" role="status">Loading learning roadmap…</p>)}{lesson}
    </>}

    {view === "practice" && <><div className={panel}><h2 className="mb-3 text-lg font-semibold">Practice Library / Revision Practice</h2>{selector}<p className="mt-2 text-sm text-slate-400">Practice Library / Revision Practice: revisit existing topic checks and exercises. First-time learning stays in the unified topic journey; prerequisite and mastery rules still apply.</p><div className="mt-4 flex flex-wrap gap-2">{path?.topics?.map((item) => <button key={item.id} className={topicId === item.id ? button : secondary} onClick={() => openTopic(item.id)}>{item.title}{!item.is_capstone && item.prerequisites.some((id) => (progress[id]?.scores?.theory ?? 0) < 70) ? " · Locked" : ""}</button>)}</div></div>{lesson}</>}

    {view === "assessments" && <><div className={panel}>{selector}<p className="mt-2 text-sm text-slate-400">Deterministic topic, coding-output, debugging, result-interpretation and case questions. Executable coding work stays in the existing labs.</p></div>{assessments.length ? <div className={panel}><p className="text-xs uppercase text-blue-300">Question {assessmentIndex + 1} of {assessments.length} · {assessments[assessmentIndex].type.replaceAll("_", " ")}</p><h2 className="mt-2 font-semibold">{assessments[assessmentIndex].prompt}</h2><div className="mt-4 space-y-2">{assessments[assessmentIndex].choices.map((value, index) => <label key={index} className="flex gap-2 text-sm text-slate-200"><input type={assessments[assessmentIndex].type === "multi_select" ? "checkbox" : "radio"} checked={assessmentChoices.includes(index)} onChange={() => setAssessmentChoices((current) => assessments[assessmentIndex].type === "multi_select" ? current.includes(index) ? current.filter((item) => item !== index) : [...current, index] : [index])} />{value}</label>)}</div><div className="mt-4 flex gap-2"><button className={button} disabled={busy || !assessmentChoices.length} onClick={submitAssessment}>Submit assessment</button><button className={secondary} disabled={assessmentIndex + 1 >= assessments.length} onClick={() => { setAssessmentIndex((index) => index + 1); setAssessmentChoices([]); setAssessmentFeedback(""); }}>Next question</button></div>{assessmentFeedback && <p className="mt-3 text-sm text-blue-200" role="status">{assessmentFeedback}</p>}</div> : <p className="text-sm text-slate-400">No assessment questions for this path yet.</p>}</>}

    {view === "projects" && <><p className="text-sm text-slate-400">Track steps, complete the lab, then select a verified result. Checkboxes alone do not complete a case.</p><div className="grid gap-4 lg:grid-cols-2">{cases.map((item) => { const eligible = caseAttempts.filter((attempt) => attempt.verified && attempt.evidence_type === item.evidence_type && attempt.topic_id === item.topic_id && (attempt.combined_score ?? 0) >= 70 && (!item.expected_task || attempt.task_type === item.expected_task) && (!item.compatible_tasks || item.compatible_tasks.includes(attempt.task_type || "")) && (!item.expected_target || attempt.target_column?.toLowerCase() === item.expected_target)); return <div className={panel} key={item.id} id={item.id}><p className="text-xs uppercase text-blue-300">{item.module} · {item.progress?.status === "completed" ? "Verified complete" : "In progress"}</p><h2 className="mt-1 font-semibold">{item.title}</h2><p className="mt-2 text-sm text-slate-400">{item.problem}</p><p className="mt-2 text-sm text-slate-300">Input: {item.input_requirements}</p><div className="mt-3 space-y-2">{item.steps.map((step) => <label key={step} className="flex gap-2 text-sm"><input type="checkbox" checked={item.progress?.completed_steps.includes(step) || false} disabled={busy} onChange={() => changeCase(item, step)} />{step}</label>)}</div><div className="mt-3 flex flex-wrap gap-2">{(item.id === "customer-churn" ? [{ label: "Open EDA", url: "/eda" }, { label: "Open Python", url: "/python-lab" }, { label: "Open SQL", url: "/sql" }, { label: "Open AutoML", url: "/automl" }] : item.id === "enterprise-rag" ? [{ label: "Open Prompt Lab", url: "/genai?tab=prompts" }, { label: "Open Documents", url: "/genai?tab=documents" }, { label: "Open GenAI Chat", url: "/genai" }] : [{ label: "Open related lab", url: item.lab_url }]).map((link) => <Link key={link.label} className={secondary} href={labHref(link.url, `/learn/projects#${item.id}`)}>{link.label}</Link>)}</div>{eligible.length ? <div className="mt-3 flex gap-2"><select className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-950 p-2 text-sm" value={caseSelection[item.id] || ""} onChange={(event) => setCaseSelection((old) => ({ ...old, [item.id]: event.target.value }))}><option value="">Select verified lab result</option>{eligible.map((attempt) => <option key={attempt.id} value={attempt.id}>{attempt.evidence_type?.replaceAll("_", " ")} · {item.title}</option>)}</select><button className={button} disabled={busy || !caseSelection[item.id]} onClick={() => verifyCase(item)}>Verify case</button></div> : <p className="mt-3 text-xs text-slate-400">No matching verified lab result yet. Verify a result for {item.topic_id?.replaceAll("-", " ")} first.</p>}</div>; })}</div></>}

    {view === "interview" && <><div className={panel}><h2 className="font-semibold">Interview Arena</h2><p className="mt-1 text-xs text-slate-400">Questions are generated one at a time with the configured Fast model. Answers receive AI-assisted evaluation.</p><div className="mt-4 grid gap-3 sm:grid-cols-4">{selector}<label className="text-sm">Mode<select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={mode} onChange={(event) => setMode(event.target.value as "practice" | "mock")}><option value="practice">Practice</option><option value="mock">Mock</option></select></label><label className="text-sm">Questions<select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))}>{[5, 10, 15].map((value) => <option key={value}>{value}</option>)}</select></label><label className="text-sm">Target role<input className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} placeholder="Optional" /></label></div><button className={`${button} mt-4`} disabled={busy} onClick={startInterview}>Start interview</button></div>
      <label className="block text-sm text-slate-300">Question type for a new interview
        <select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 sm:w-auto" value={questionType} onChange={(event) => setQuestionType(event.target.value)}>
          <option value="">Adaptive mix</option>{["THEORY", "CODING", "DEBUGGING", "CASE_STUDY", "RESULT_INTERPRETATION", "ARCHITECTURE"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ")}</option>)}
        </select>
      </label>
      <label className="block text-sm text-slate-300">Starting difficulty
        <select className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 p-2 sm:w-auto" value={interviewLevel} onChange={(event) => setInterviewLevel(Number(event.target.value))}>
          <option value={3}>Beginner</option><option value={5}>Intermediate</option><option value={7}>Advanced</option>
        </select>
      </label>
      {session && <div className={panel}><p className="text-xs uppercase text-blue-300">{session.mode} · Question {session.answers.length + (session.current_question ? 1 : 0)} / {session.question_count} · Difficulty {session.current_question?.difficulty ?? session.difficulty}</p>{session.current_question ? <><h3 className="mt-3 text-lg font-medium">{session.current_question.question}</h3><p className="mt-1 text-xs text-slate-400">{session.current_question.type.replaceAll("_", " ")}</p><textarea className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm" value={answer} onChange={(event) => setAnswer(event.target.value)} rows={6} placeholder="Explain your reasoning..." /><button className={`${button} mt-3`} disabled={busy || !answer.trim()} onClick={submitInterview}>Submit answer</button></> : session.status === "completed" ? <p className="mt-3">Interview complete · Overall {session.overall_score ?? "Unavailable"}%</p> : <button className={`${button} mt-3`} disabled={busy} onClick={nextQuestion}>Next question</button>}
        {session.mode === "practice" && session.current_question && <button className={`${secondary} mt-3 ml-2`} type="button" onClick={() => setShowHint(true)}>Show hint</button>}
        {showHint && session.mode === "practice" && session.current_question && <p className="mt-2 text-xs text-blue-200">Consider: {session.current_question.competencies?.[0] || "Explain your reasoning and any trade-offs."}</p>}
        {lastAnswer && (session.mode === "practice" || session.status === "completed") && <div className="mt-4 rounded-lg border border-slate-700 p-3 text-sm"><p className="font-semibold">AI-assisted evaluation · {lastAnswer.score}%</p><p className="mt-2 text-slate-300">{lastAnswer.evaluation.feedback}</p><p className="mt-2 text-slate-400">Suggested answer: {lastAnswer.evaluation.improved_answer}</p>{session.mode === "practice" && <button className={`${secondary} mt-3`} disabled={busy} onClick={retryInterview}>Retry this question</button>}</div>}
      </div>}
      <div className="grid gap-4 lg:grid-cols-2"><div className={panel}><h3 className="font-semibold">Interview History</h3>{interviewHistory.length ? interviewHistory.map((item) => <button key={item.id} className="mt-2 block text-left text-sm text-blue-300 hover:underline" onClick={() => act(async () => { setSession(await learningService.interview(item.id)); setLastAnswer(null); })}>{item.module} · {item.mode} · {item.status} · {item.overall_score ?? "—"}%</button>) : <p className="mt-2 text-sm text-slate-400">No sessions yet.</p>}</div>
        <div className={panel}><h3 className="font-semibold">Interview Readiness</h3>{Object.entries(readiness).length ? Object.entries(readiness).map(([key, value]) => <div key={key} className="mt-3 border-t border-slate-800 pt-2 text-sm"><p>{key}: {value.score}% across {value.sessions} sessions</p><div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-400">{Object.entries(value.competencies).map(([name, score]) => <span key={name}>{name.replaceAll("_", " ")}: {score}%</span>)}</div>{value.weakest_competency && <p className="mt-1 text-xs text-blue-300">Review {value.weakest_competency.replaceAll("_", " ").toLowerCase()} questions next.</p>}</div>) : <p className="mt-2 text-sm text-slate-400">Complete a mock interview to see readiness.</p>}</div></div>
    </>}

    {view === "progress" && <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{dashboard?.modules.map((item) => <Link href={`/learn/${item.module}`} key={item.module} className={panel}><p className="font-semibold">{item.title}</p><p className="mt-2 text-2xl">{item.mastery_score}%</p><p className="text-xs text-slate-400">{item.mastered} of {item.topic_count} topics mastered</p>{item.module === "prompting" && <p className="mt-1 text-xs text-slate-400">Prompt Lab evaluations: {item.prompt_lab_evaluated_attempts || 0}</p>}</Link>)}</div><div className={panel}><h2 className="font-semibold">Recent Assessments</h2>{dashboard?.recent_assessments.length ? dashboard.recent_assessments.map((item) => <p className="mt-2 text-sm" key={item.id}>{item.topic_id} · {item.combined_score ?? "Unverified"} · {new Date(item.created_at).toLocaleDateString()}</p>) : <p className="mt-2 text-sm text-slate-400">No assessments yet.</p>}</div>{["trainer", "admin", "super_admin"].includes(user?.role || "") && user?.organization_id && <button className={secondary} onClick={loadFaculty}>Institute overview (faculty)</button>}{faculty && <div className={panel}><h2 className="font-semibold">Institute Overview</h2><p className="text-sm">Learners: {faculty.learner_count} · Interview readiness: {faculty.interview_readiness ?? "Unavailable"}</p>{Object.entries(faculty.module_averages).map(([key, value]) => <p key={key} className="text-sm">{key}: {value}%</p>)}</div>}{faculty && <div className={panel}><h2 className="font-semibold">Pending lab reviews</h2>{pendingReviews.length ? pendingReviews.map((item) => <div key={item.id} className="mt-3 border-t border-slate-800 pt-3 text-sm"><p>{item.topic_id} · {item.activity_type}</p><p className="text-slate-400">Reference: {item.lab_reference}</p><p className="text-slate-400">Notes: {item.response || "None"}</p><div className="mt-2 flex flex-wrap gap-2"><input type="number" min={0} max={100} className="w-20 rounded border border-slate-700 bg-slate-950 p-2" value={reviewScore} onChange={(event) => setReviewScore(Number(event.target.value))} aria-label="Review score" /><input className="min-w-48 flex-1 rounded border border-slate-700 bg-slate-950 p-2" placeholder="Review feedback" value={reviewFeedback} onChange={(event) => setReviewFeedback(event.target.value)} /><button className={secondary} disabled={busy || !reviewFeedback.trim()} onClick={() => review(item.id, item.activity_type === "practical" ? "practical" : "coding")}>Record review</button></div></div>) : <p className="mt-2 text-sm text-slate-400">No pending lab submissions.</p>}</div>}</>}
    {view === "progress" && faculty && <div className={panel}><h3 className="font-semibold">Assessment trends</h3><p className="mt-2 text-sm">Assessment participation: {faculty.assessment_participation ?? "Unavailable"}%</p><p className="mt-1 text-sm text-slate-400">Common weak topics: {faculty.common_weak_topics.length ? faculty.common_weak_topics.join(", ") : "No scored topics yet"}</p></div>}
    {view === "progress" && ["trainer", "admin", "super_admin"].includes(user?.role || "") && user?.organization_id && <LearningAssignments faculty />}
  </div>;
}

