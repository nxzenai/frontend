import Link from "next/link";
import { ArrowRight, Bot, BrainCircuit, BriefcaseBusiness, Building2, Check, Code2, GraduationCap, HeartPulse, Lightbulb, Network, ScanSearch, Sparkles, Workflow } from "lucide-react";
import { CtaBand, FeatureCard, SectionHeading, StudioPreview } from "@/components/marketing/MarketingPrimitives";

const pillars = [
  [GraduationCap, "Learn", "AI Training", "Practical programs built around real tools, datasets, and industry problems."],
  [Code2, "Build", "NxZenAI Studio", "One connected workspace for data, machine learning, and generative AI."],
  [Lightbulb, "Solve", "AI Solutions", "Focused consulting and implementation for high-value business workflows."],
  [Building2, "Scale", "Enterprise AI", "Capability, governance, and delivery systems for organization-wide adoption."],
] as const;

const solutions = [
  [Workflow, "AI Automation", "Streamline repeatable workflows with intelligent, human-guided automation."],
  [Sparkles, "Generative AI", "Create grounded assistants, knowledge experiences, and content workflows."],
  [BrainCircuit, "Machine Learning", "Build predictive and analytical systems around business-ready data."],
] as const;

const industries = [
  [BriefcaseBusiness, "Finance", "Risk patterns, customer intelligence, and operational analytics."],
  [HeartPulse, "Healthcare", "Responsible decision-support, document intelligence, and workflow analytics."],
  [ScanSearch, "Retail", "Customer segmentation, demand signals, and personalized experiences."],
  [Workflow, "Manufacturing", "Quality intelligence, forecasting, and predictive maintenance workflows."],
] as const;

export default function HomePage() {
  return <main>
    <section className="mk-page-hero min-h-[760px] pt-40 md:pt-44">
      <div className="mk-grid" aria-hidden="true" /><div className="mk-orb mk-orb-one" aria-hidden="true" /><div className="mk-orb mk-orb-two" aria-hidden="true" />
      <div className="mk-container relative z-10 text-center">
        <p className="mk-eyebrow"><span />An applied AI ecosystem</p>
        <h1 className="mx-auto mt-7 max-w-5xl text-[clamp(3.8rem,10vw,7.7rem)] font-semibold leading-[.87] tracking-[-.075em]">Build. Learn.<br /><span className="mk-gradient-text">Deploy AI.</span></h1>
        <p className="mk-lead mx-auto mt-7 max-w-3xl">One AI ecosystem for individuals, teams, and organizations to learn, experiment, build, and deploy intelligent solutions.</p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link className="mk-button-primary" href="/login">Explore AI Studio <ArrowRight size={17} /></Link><Link className="mk-button-secondary" href="/contact">Book Consultation</Link></div>
        <div className="mt-8 flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm text-slate-400"><span>AI Studio</span><span>AI Training</span><span>Enterprise AI</span><span>AI Consulting</span></div>
        <StudioPreview />
      </div>
    </section>

    <section className="mk-section mk-section-alt"><div className="mk-container"><SectionHeading kicker="One AI ecosystem" title="From learning AI to deploying it." description="Four connected capabilities create a practical path from first principles to production value." /><div className="mk-card-grid mk-four">{pillars.map(([Icon, eyebrow, title, description], index) => <FeatureCard key={title} icon={Icon} eyebrow={`0${index + 1} · ${eyebrow}`} title={title} description={description} />)}</div></div></section>

    <section className="mk-section"><div className="mk-container"><SectionHeading kicker="NxZenAI Studio" title="Your workspace for applied AI." description="Move from raw data to working intelligence without stitching together disconnected tools." /><div className="mt-12 grid gap-8 lg:grid-cols-[.9fr_1.1fr]"><div className="rounded-3xl border border-white/[.08] bg-[#090f1e] p-8 md:p-10"><p className="mk-kicker">Connected capabilities</p><h3 className="mt-4 text-3xl font-semibold tracking-[-.04em]">One workspace. Multiple paths to value.</h3><p className="mt-5 text-slate-400">Explore data, build notebooks, automate model development, and work with GenAI from a unified Studio experience.</p><div className="mt-8 grid grid-cols-2 gap-3 text-sm text-slate-300">{["SQL Lab","Python Lab","EDA Hub","AutoML","AutoDL","AutoNLP","GenAI","Agentic AI"].map(item => <div key={item} className="flex items-center gap-2 rounded-xl border border-white/[.07] bg-white/[.025] px-3 py-3"><Check size={14} className="text-cyan-300" />{item}</div>)}</div><Link href="/platform" className="mk-button-secondary mt-8">Discover the platform <ArrowRight size={16} /></Link></div><div className="rounded-3xl border border-cyan-300/10 bg-[radial-gradient(circle_at_25%_20%,rgba(53,211,235,.15),transparent_35%),#080d1a] p-8 md:p-10"><div className="flex h-full min-h-80 flex-col justify-between"><Bot size={34} className="text-cyan-300" /><div><p className="text-sm font-semibold text-cyan-300">GenAI-native workflows</p><h3 className="mt-3 text-3xl font-semibold tracking-[-.04em]">Ask. Inspect. Train. Predict.</h3><p className="mt-4 max-w-lg text-slate-400">Use natural language to move through supported native lab workflows while retaining the context, validation, and real results produced by the platform.</p></div></div></div></div></div></section>

    <section className="mk-section mk-section-alt"><div className="mk-container"><SectionHeading kicker="AI solutions" title="Solve meaningful business problems." description="Business-focused consulting and delivery across automation, analytics, machine learning, generative AI, and agentic systems." /><div className="mk-card-grid">{solutions.map(([Icon,title,description]) => <FeatureCard key={title} icon={Icon} title={title} description={description} />)}</div><Link href="/solutions" className="mk-button-secondary mt-8">Explore solutions <ArrowRight size={16} /></Link></div></section>

    <section className="mk-section"><div className="mk-container grid items-center gap-14 lg:grid-cols-2"><div><p className="mk-kicker">Training</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.05em] md:text-6xl">Learn AI by building with it.</h2><p className="mk-lead mt-6">Structured pathways for students, professionals, technical teams, and organizations—supported by hands-on labs, projects, and mentorship.</p><Link href="/training" className="mk-button-secondary mt-8">Explore Training <ArrowRight size={16} /></Link></div><div className="grid gap-3 rounded-3xl border border-white/[.08] bg-[#090f1e] p-7 md:grid-cols-2 md:p-9">{["Hands-on labs","Real-world datasets","Project-based learning","AI Studio access","Mentorship","Industry readiness"].map(item => <div key={item} className="flex items-center gap-3 rounded-xl border border-white/[.06] bg-white/[.025] p-4 text-sm text-slate-300"><Check size={16} className="text-cyan-300" />{item}</div>)}</div></div></section>

    <section className="mk-section mk-section-alt"><div className="mk-container"><SectionHeading kicker="Industries" title="AI grounded in real operations." description="Illustrative applications mapped to the data, decisions, and workflows that matter across sectors." /><div className="mk-card-grid mk-four">{industries.map(([Icon,title,description]) => <FeatureCard key={title} icon={Icon} title={title} description={description} />)}</div><Link href="/industries" className="mk-button-secondary mt-8">View industry applications <ArrowRight size={16} /></Link></div></section>

    <section className="mk-section"><div className="mk-container"><div className="grid gap-10 rounded-3xl border border-blue-400/15 bg-[radial-gradient(circle_at_80%_10%,rgba(130,80,255,.17),transparent_35%),#091126] p-8 md:p-12 lg:grid-cols-[1.1fr_.9fr]"><div><p className="mk-kicker">Enterprise AI transformation</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.05em] md:text-6xl">Strategy, capability, and execution.</h2><p className="mk-lead mt-6 max-w-2xl">NxZenAI helps teams identify priority opportunities, build practical skills, validate solutions, and create a responsible path to adoption.</p></div><div className="grid gap-3 self-center">{["AI opportunity and readiness assessment","Solution discovery and proof of concept","Team enablement and corporate training","Responsible scale-up and operating guidance"].map(item => <div key={item} className="flex gap-3 border-b border-white/[.08] py-4 text-slate-300"><Network size={18} className="mt-0.5 flex-none text-cyan-300" />{item}</div>)}</div></div></div></section>
    <CtaBand />
  </main>;
}
