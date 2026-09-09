import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Bot, Braces, BrainCircuit, Code2, Database, MessageSquareText, Orbit, Workflow } from "lucide-react";
import { CtaBand, FeatureCard, PageHero, SectionHeading, StudioPreview } from "@/components/marketing/MarketingPrimitives";

export const metadata: Metadata = { title: "AI Platform", description: "Explore NxZenAI Studio—one connected workspace for data, machine learning, deep learning, NLP, GenAI, and agentic AI." };

const capabilities = [
  [Database,"SQL Lab","Explore structured data and work with queries in a focused analytics environment."],
  [Code2,"Python Lab","Develop and run notebook-based data science and AI workflows."],
  [BarChart3,"EDA Hub","Profile, clean, transform, and understand datasets before modeling."],
  [BrainCircuit,"AutoML","Train and compare supported tabular classification, regression, and clustering workflows."],
  [Orbit,"AutoDL","Work with supported deep-learning, image, tabular, and time-series workflows."],
  [Braces,"AutoNLP","Build supported text classification and language intelligence workflows."],
  [MessageSquareText,"GenAI","Use conversational assistance across connected Studio workflows and knowledge."],
  [Bot,"Agentic AI","Coordinate goal-driven AI experiences across validated tools and processes."],
] as const;

export default function PlatformPage() {
  return <main><PageHero eyebrow="NxZenAI Studio" title="One workspace for" accent="applied AI." description="Move from data exploration to trained models and intelligent experiences in a connected AI development platform." />
    <section className="mk-section pt-0"><div className="mk-container"><StudioPreview /><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/login" className="mk-button-primary">Explore AI Studio <ArrowRight size={16} /></Link><Link href="/contact" className="mk-button-secondary">Book Consultation</Link></div></div></section>
    <section id="capabilities" className="mk-section mk-section-alt"><div className="mk-container"><SectionHeading kicker="Platform capabilities" title="The tools to explore, build, and operationalize." description="Each capability is part of the same Studio experience, so teams can work with consistent data and project context." /><div className="mk-card-grid mk-four">{capabilities.map(([Icon,title,description]) => <FeatureCard key={title} icon={Icon} title={title} description={description} />)}</div></div></section>
    <section className="mk-section"><div className="mk-container"><SectionHeading kicker="Connected workflow" title="From dataset to decision support." description="Choose the right native workspace for the task while keeping the development journey connected." /><div className="mk-process">{[["01","Explore","Understand data with SQL, Python, and EDA."],["02","Build","Train through code or supported native Auto labs."],["03","Evaluate","Review real metrics, artifacts, and readiness."],["04","Apply","Use models and GenAI in practical workflows."]].map(([n,title,text]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{text}</p></article>)}</div><div className="mt-10 rounded-3xl border border-white/[.08] bg-[#090f1e] p-8"><Workflow className="text-cyan-300" /><h3 className="mt-5 text-2xl font-semibold">Built for learning and delivery</h3><p className="mt-3 max-w-3xl text-slate-400">NxZenAI Studio supports hands-on learning, structured experimentation, and practical solution development without exposing unnecessary implementation complexity.</p></div></div></section>
    <CtaBand title="Bring your AI work into one workspace." /></main>;
}
