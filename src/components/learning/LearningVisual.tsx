"use client";

import { useState, type ReactNode } from "react";

type Visual = { type: string; config?: Record<string, unknown> };

const frame = "mt-3 rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-200";
const control = "rounded-md border border-slate-600 px-2 py-1 text-xs hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400";

export function LearningVisual({ visual }: { visual?: Visual | null }) {
  const [split, setSplit] = useState(80);
  const [step, setStep] = useState(0);
  const [rate, setRate] = useState<"small" | "reasonable" | "large">("reasonable");
  const [clusters, setClusters] = useState(3);
  const [focus, setFocus] = useState("declined");
  if (!visual) return null;

  let content: ReactNode;
  switch (visual.type) {
    case "TRAIN_TEST_SPLIT":
      content = <><div className="mb-3 flex flex-wrap gap-2">{[70, 80, 90].map((value) => <button className={control} aria-pressed={split === value} key={value} onClick={() => setSplit(value)}>{value}/{100 - value}</button>)}</div><div className="flex h-9 overflow-hidden rounded-lg text-center text-xs font-medium"><div className="flex items-center justify-center bg-blue-600" style={{ width: `${split}%` }}>Train {split}%</div><div className="flex items-center justify-center bg-amber-600" style={{ width: `${100 - split}%` }}>Test {100 - split}%</div></div><p className="mt-2 text-slate-400">This illustration does not change the lab split. Test rows stay unseen while fitting.</p></>;
      break;
    case "NEURAL_NETWORK":
      content = <><div className="flex items-center justify-between gap-2 text-center"><div className="rounded-lg bg-blue-900/60 p-3">Inputs<br />clues</div><span aria-hidden="true">→</span><div className="rounded-lg bg-violet-900/60 p-3">Hidden layer<br />weighted signals</div><span aria-hidden="true">→</span><div className="rounded-lg bg-emerald-900/60 p-3">Output<br />decision</div></div><button className={`${control} mt-3`} onClick={() => setStep((old) => (old + 1) % 3)}>Next step</button><p className="mt-2 text-slate-400">{["Inputs provide measurements.", "Neurons combine weighted inputs with a bias and activation.", "The final layer produces a prediction."][step]}</p></>;
      break;
    case "CNN_KERNEL": {
      const positions = [[0, 0], [0, 1], [1, 0], [1, 1]];
      const [row, col] = positions[step % positions.length];
      content = <><div className="grid w-36 grid-cols-3 gap-1" aria-label={`Illustrative 2 by 2 filter at row ${row + 1}, column ${col + 1}`}>{Array.from({ length: 9 }, (_, index) => <span key={index} className={`h-10 rounded-sm ${Math.floor(index / 3) >= row && Math.floor(index / 3) <= row + 1 && index % 3 >= col && index % 3 <= col + 1 ? "bg-blue-500" : "bg-slate-700"}`} />)}</div><button className={`${control} mt-3`} onClick={() => setStep((old) => old + 1)}>Move filter</button><p className="mt-2 text-slate-400">A small filter scans nearby pixels to form a feature map. This grid is illustrative, not a trained CNN.</p></>;
      break;
    }
    case "GRADIENT_DESCENT": {
      const x = rate === "small" ? 92 : rate === "reasonable" ? 162 : 235;
      content = <><div className="flex flex-wrap gap-2">{(["small", "reasonable", "large"] as const).map((value) => <button key={value} className={control} aria-pressed={rate === value} onClick={() => setRate(value)}>{value} step</button>)}</div><svg className="mt-3 h-32 w-full" viewBox="0 0 320 120" role="img" aria-label={`Illustrative loss curve with ${rate} learning rate`}><path d="M20 10 Q160 200 300 10" fill="none" stroke="#60a5fa" strokeWidth="3" /><circle cx={x} cy={rate === "reasonable" ? 103 : rate === "small" ? 77 : 65} r="6" fill="#fbbf24" /></svg><p className="text-slate-400">{rate === "small" ? "Small steps may converge slowly." : rate === "large" ? "Large steps may overshoot the low-loss region." : "Moderate steps can approach a low-loss region steadily."}</p></>;
      break;
    }
    case "CLUSTERING": {
      const points = [[12, 25], [18, 35], [25, 22], [32, 30], [58, 20], [64, 29], [71, 18], [78, 34], [35, 70], [43, 82], [52, 74], [58, 85]];
      content = <><div className="flex gap-2">{[2, 3, 4].map((value) => <button key={value} className={control} aria-pressed={clusters === value} onClick={() => setClusters(value)}>K = {value}</button>)}</div><div className="relative mt-3 h-40 rounded-lg border border-slate-700">{points.map(([x, y], index) => { const group = clusters === 2 ? (x < 50 ? 0 : 1) : y > 55 ? (clusters === 3 ? 2 : x < 50 ? 2 : 3) : x < 50 ? 0 : 1; return <span key={index} className={`absolute h-3 w-3 rounded-full ${["bg-blue-400", "bg-amber-400", "bg-emerald-400", "bg-violet-400"][group]}`} style={{ left: `${x}%`, top: `${y}%` }} />; })}</div><p className="mt-2 text-slate-400">Changing K changes the illustrative grouping. Real cluster quality needs metrics and feature profiles.</p></>;
      break;
    }
    case "TOKENIZATION":
      content = <><p className="text-slate-300">NxZenAI makes AI practical</p><p className="my-2 text-slate-500" aria-hidden="true">↓</p><div className="flex flex-wrap gap-2">{["NxZenAI", "makes", "AI", "practical"].map((word) => <span key={word} className="rounded-md bg-blue-900/70 px-2 py-1">{word}</span>)}</div><p className="mt-2 text-slate-400">Real tokenizers may split text differently.</p></>;
      break;
    case "ATTENTION": {
      const words = ["The", "bank", "declined", "the", "loan", "because", "his", "credit", "score", "was", "low"];
      content = <><div className="flex flex-wrap gap-2">{words.map((word, index) => <button key={index} className={`${control} ${focus === word ? "bg-blue-900" : ""}`} onClick={() => setFocus(word)}>{word}</button>)}</div><p className="mt-3 text-slate-400">{focus === "declined" ? "For ‘declined’, loan, credit score and low provide helpful context." : `Focus on ‘${focus}’ and consider which nearby words clarify its meaning.`} These are conceptual highlights, not model attention weights.</p></>;
      break;
    }
    case "CONFUSION_MATRIX":
      content = <><div className="grid max-w-xs grid-cols-3 gap-1 text-center text-xs"><span /><span>Predicted no</span><span>Predicted yes</span><span>Actual no</span><span className="rounded bg-emerald-900 p-2">Correct no</span><span className="rounded bg-amber-900 p-2">False alarm</span><span>Actual yes</span><span className="rounded bg-rose-900 p-2">Missed case</span><span className="rounded bg-emerald-900 p-2">Correct yes</span></div><p className="mt-2 text-slate-400">A confusion matrix separates different kinds of prediction errors.</p></>;
      break;
    case "PRECISION_RECALL":
      content = <><div className="grid gap-2 sm:grid-cols-2"><div className="rounded-lg bg-blue-900/40 p-3"><strong>Precision</strong><p>Of flagged cases, how many were truly positive?</p></div><div className="rounded-lg bg-emerald-900/40 p-3"><strong>Recall</strong><p>Of all true positives, how many did we find?</p></div></div><p className="mt-2 text-slate-400">The right balance depends on the cost of false alarms and missed cases.</p></>;
      break;
    case "PROCESS_FLOW":
      content = <><div className="flex flex-wrap items-center gap-2"><span className="rounded-lg bg-blue-900/60 p-2">Input evidence</span><span aria-hidden="true">→</span><span className="rounded-lg bg-violet-900/60 p-2">Method</span><span aria-hidden="true">→</span><span className="rounded-lg bg-emerald-900/60 p-2">Result</span></div><p className="mt-2 text-slate-400">Trace what information enters a method and what outcome it produces.</p></>;
      break;
    default:
      return null;
  }
  return <section className={frame} aria-label="Interactive concept illustration"><h3 className="mb-2 font-semibold text-white">Visualise it</h3>{content}</section>;
}
