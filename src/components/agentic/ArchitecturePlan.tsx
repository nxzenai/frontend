import {
  Bot, Boxes, Database, Globe2, KeyRound, Network, Server, ShieldCheck, Wrench,
} from "lucide-react";
import type { AgenticPlan } from "@/types/agentic";

const panel = "rounded-2xl border border-slate-800 bg-slate-900/70 p-6";

function Pills({ values }: { values: string[] }) {
  return <div className="mt-3 flex flex-wrap gap-2">{values.map(value => <span key={value} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-300">{value}</span>)}</div>;
}

export default function ArchitecturePlan({ plan }: { plan: AgenticPlan }) {
  const value = plan.plan;
  return (
    <div className="space-y-5" data-architecture-plan>
      <section className={`${panel} border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-slate-900`}>
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Overview</p><h2 className="mt-2 text-2xl font-semibold text-white">{value.application.name}</h2></div>
          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs text-slate-400">Revision {plan.revision}</span>
        </div>
        <p className="mt-4 text-slate-300">{value.application.summary}</p>
        <p className="mt-3 text-sm text-slate-400"><span className="font-medium text-slate-200">Objective:</span> {value.application.objective}</p>
        <Pills values={value.application.primary_users} />
      </section>

      <section className={panel}><h3 className="flex items-center gap-2 font-semibold text-white"><Bot className="h-5 w-5 text-cyan-400" /> Agents</h3><div className="mt-4 grid gap-3 md:grid-cols-2">{value.agents.map(agent => <article key={agent.name} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4"><p className="font-medium text-white">{agent.name}</p><p className="mt-1 text-xs uppercase tracking-wider text-cyan-400">{agent.role}</p><p className="mt-3 text-sm text-slate-300">{agent.goal}</p><ul className="mt-3 list-inside list-disc space-y-1 text-xs text-slate-400">{agent.responsibilities.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div></section>

      <section className={panel}><h3 className="flex items-center gap-2 font-semibold text-white"><Network className="h-5 w-5 text-cyan-400" /> Workflow</h3><div className="mt-4 flex gap-3 overflow-x-auto pb-2">{value.workflow.map((step, index) => <div key={`${step.step}-${step.action}`} className="flex min-w-56 items-center gap-3"><article className="min-h-40 flex-1 rounded-xl border border-slate-700 bg-slate-950 p-4"><span className="text-xs font-bold text-cyan-400">STEP {step.step}</span><p className="mt-2 font-medium text-white">{step.actor}</p><p className="mt-2 text-sm text-slate-300">{step.action}</p><p className="mt-3 text-xs text-slate-500">Output: {step.output}</p></article>{index < value.workflow.length - 1 && <span className="text-cyan-500">→</span>}</div>)}</div></section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={panel}><h3 className="flex items-center gap-2 font-semibold text-white"><Wrench className="h-5 w-5 text-cyan-400" /> Tools</h3><div className="mt-4 space-y-3">{value.tools.map(tool => <div key={tool.name} className="rounded-xl bg-slate-950 p-4"><div className="flex justify-between gap-3"><span className="font-medium text-white">{tool.name}</span><span className="text-xs text-cyan-400">{tool.type}</span></div><p className="mt-2 text-sm text-slate-400">{tool.purpose}</p></div>)}</div></section>
        <section className={panel}><h3 className="flex items-center gap-2 font-semibold text-white"><Globe2 className="h-5 w-5 text-cyan-400" /> Frontend</h3><p className="mt-3 text-sm text-slate-300">{value.frontend.type}</p><p className="mt-4 text-xs uppercase tracking-wider text-slate-500">Pages</p><Pills values={value.frontend.pages} /><p className="mt-4 text-xs uppercase tracking-wider text-slate-500">Components</p><Pills values={value.frontend.components} /></section>
        <section className={panel}><h3 className="flex items-center gap-2 font-semibold text-white"><Server className="h-5 w-5 text-cyan-400" /> Backend</h3><p className="mt-3 text-sm text-slate-300">Framework: {value.backend.framework}</p><Pills values={value.backend.services} /><div className="mt-4 space-y-2">{value.backend.api_endpoints.map(endpoint => <div key={`${endpoint.method}-${endpoint.path}`} className="rounded-lg bg-slate-950 p-3 text-xs"><span className="font-bold text-cyan-400">{endpoint.method}</span><span className="ml-2 text-white">{endpoint.path}</span><p className="mt-1 text-slate-500">{endpoint.purpose}</p></div>)}</div></section>
        <section className={panel}><h3 className="flex items-center gap-2 font-semibold text-white"><Database className="h-5 w-5 text-cyan-400" /> Data</h3>{(["inputs", "storage", "outputs"] as const).map(key => <div key={key}><p className="mt-4 text-xs uppercase tracking-wider text-slate-500">{key}</p><Pills values={value.data[key]} /></div>)}</section>
        <section className={panel}><h3 className="flex items-center gap-2 font-semibold text-white"><Boxes className="h-5 w-5 text-cyan-400" /> Integrations</h3><div className="mt-4 space-y-3">{value.integrations.length ? value.integrations.map(item => <div key={item.name} className="rounded-xl bg-slate-950 p-4"><div className="flex justify-between"><span className="font-medium text-white">{item.name}</span><span className={item.required ? "text-xs text-amber-300" : "text-xs text-slate-500"}>{item.required ? "Required" : "Optional"}</span></div><p className="mt-2 text-sm text-slate-400">{item.purpose}</p></div>) : <p className="text-sm text-slate-500">No external integrations required.</p>}</div></section>
        <section className={panel}><h3 className="flex items-center gap-2 font-semibold text-white"><ShieldCheck className="h-5 w-5 text-cyan-400" /> Security Considerations</h3><ul className="mt-4 space-y-2 text-sm text-slate-300">{value.security_considerations.map(item => <li key={item} className="flex gap-2"><KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />{item}</li>)}</ul></section>
      </div>
      <section className={panel}><h3 className="font-semibold text-white">Assumptions</h3><ul className="mt-4 list-inside list-disc space-y-2 text-sm text-slate-400">{value.assumptions.map(item => <li key={item}>{item}</li>)}</ul></section>
    </div>
  );
}
