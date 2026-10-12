"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { learningService } from "@/services/learning.service";
import type { LearningTopic, TopicJourney, TopicProgress } from "@/types/learning";
const panel = "rounded-xl border border-slate-800 bg-slate-900/70 p-4";
const field = "w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-sm";
const button = "rounded-lg border border-blue-500/50 px-3 py-2 text-sm disabled:opacity-50";
export function TopicJourneySupport({ topic, progress, labHref }: {
  topic: LearningTopic; progress?: TopicProgress; labHref: (url: string) => string;
}) {
  const [journey, setJourney] = useState<TopicJourney | null>(null);
  const [response, setResponse] = useState("");
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState<Array<{ question: string; answer: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    let active = true;
    learningService.journey(topic.id).then(value => {
      if (active) { setJourney(value); setResponse(current => current || value.reflection?.response || ""); }
    }).catch(() => { if (active) setFeedback("Saved topic journey is temporarily unavailable."); });
    return () => { active = false; };
  }, [topic.id, progress]);
  async function save() {
    setBusy(true); setFeedback("");
    try {
      const result = await learningService.saveReflection(topic.id, response.trim());
      setFeedback(result.feedback);
      setJourney(await learningService.journey(topic.id));
    } catch { setFeedback("Your explanation could not be saved. Keep it here and retry."); }
    finally { setBusy(false); }
  }
  async function ask(value: string) {
    if (busy || !value.trim()) return;
    setBusy(true);
    try {
      const result = await learningService.tutor(topic.id, value.trim());
      setAnswers(current => [...current, { question: value, answer: result.answer }].slice(-5));
      setQuestion("");
    } catch { setFeedback("AI tutoring is temporarily unavailable. Your topic activities remain available."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-4">
    <details className={panel}>
      <summary className="cursor-pointer font-semibold">Ask AI about this topic</summary>
      <p className="mt-1 text-xs text-slate-400">Hints, explanations and different examples. Active graded work receives guidance rather than a solution.</p>
      <div className="mt-3 flex flex-wrap gap-2">{["Explain this simply", "Give me another example", "Why is this important?"].map(value => <button key={value} type="button" className={button} disabled={busy} onClick={() => void ask(value)}>{value}</button>)}</div>
      <label className="mt-3 block text-xs">Your question<input className={field + " mt-1"} maxLength={1000} value={question} onChange={event => setQuestion(event.target.value)} placeholder="Compare this with another concept…" /></label>
      <button type="button" className={button + " mt-2"} disabled={busy || !question.trim()} onClick={() => void ask(question)}>Ask AI</button>
      {answers.map((item, index) => <div key={index} className="mt-3 rounded border border-slate-700 p-3 text-sm"><p className="font-medium">{item.question}</p><p className="mt-2 whitespace-pre-wrap text-slate-300">{item.answer}</p></div>)}
    </details>
    <details id="topic-explain" className={panel}>
      <summary className="cursor-pointer font-semibold">Explain in your own words</summary>
      <p className="mt-1 text-sm text-slate-400">Explain {topic.title.toLowerCase()}, why it matters, and one limitation or example.</p>
      <textarea className={field + " mt-3"} rows={3} maxLength={2000} value={response} onChange={event => setResponse(event.target.value)} aria-label="Your topic explanation" />
      <p className="mt-1 text-xs text-slate-400">Saved as ungraded evidence; this activity does not award mastery.</p>
      <button type="button" className={button + " mt-2"} disabled={busy || response.trim().length < 10} onClick={() => void save()}>Save explanation</button>
      {journey?.reflection && <p className="mt-2 text-xs text-slate-400">Last saved: {new Date(journey.reflection.created_at).toLocaleString()}</p>}
    </details>
    <section id="topic-apply" className={panel}>
      <h3 className="font-semibold">Try in NxZenAI Lab</h3>
      <p className="mt-1 text-sm text-slate-400">Apply the concept in its existing native environment, then return to this topic. A lab artifact alone does not establish foundation understanding.</p>
      <Link className={button + " mt-3 inline-block"} href={labHref(topic.lab_url)}>Open related lab</Link>
    </section>
    <section id="topic-mastery" className={panel}>
      <h3 className="font-semibold">Mastery evidence</h3>
      <div className="mt-3 flex flex-wrap gap-2">{(["learned", "practiced", "applied", "mastered"] as const).map(state => <span key={state} className="rounded border border-slate-700 px-3 py-1 text-sm">{journey?.states[state] ? "✓ " : "○ "}{state[0].toUpperCase() + state.slice(1)}</span>)}</div>
      <p className="mt-2 text-xs text-slate-400">Learned: concept evidence. Practiced: a recorded attempt. Applied: passing verified lab evidence. Mastered: all existing requirements satisfied.</p>
      {journey && <><p className="mt-2 text-xs">{Object.entries(journey.mastery_requirements).map(([key, value]) => key.replaceAll("_", " ") + ": " + (journey.scores[key] ?? "Not yet") + " / " + value + "%").join(" · ")}</p><p className="mt-2 text-xs text-slate-400">{journey.note}</p></>}
    </section>
    {feedback && <p role="status" className="text-sm text-blue-200">{feedback}</p>}
  </div>;
}
