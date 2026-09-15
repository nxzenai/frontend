import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight, BarChart3, Bot, Braces, BrainCircuit, Check, Code2,
  Database, LayoutDashboard, MessageSquareText, Orbit, Play, Sparkles,
} from "lucide-react";

export function PageHero({ eyebrow, title, accent, description }: {
  eyebrow: string; title: string; accent?: string; description: string;
}) {
  return (
    <section className="mk-page-hero">
      <div className="mk-grid" aria-hidden="true" />
      <div className="mk-orb mk-orb-one" aria-hidden="true" />
      <div className="mk-container mk-page-hero-inner">
        <p className="mk-eyebrow"><span />{eyebrow}</p>
        <h1>{title}{accent && <><br /><span className="mk-gradient-text">{accent}</span></>}</h1>
        <p className="mk-lead">{description}</p>
      </div>
    </section>
  );
}

export function SectionHeading({ kicker, title, description, centered = false }: {
  kicker: string; title: string; description?: string; centered?: boolean;
}) {
  return (
    <div className={`mk-section-heading${centered ? " mk-centered" : ""}`}>
      <div><p className="mk-kicker">{kicker}</p><h2>{title}</h2></div>
      {description && <p>{description}</p>}
    </div>
  );
}

export function CtaBand({ title = "Ready to build with AI?", description = "Talk with NxZenAI about your platform, training, or enterprise AI goals." }: { title?: string; description?: string }) {
  return (
    <section className="mk-section mk-pt-0"><div className="mk-container"><div className="mk-final-cta">
      <div><p className="mk-kicker">Make AI practical</p><h2>{title}</h2><p>{description}</p></div>
      <div className="mk-cta-actions"><Link className="mk-button-primary" href="/contact">Book Consultation <ArrowRight size={16} /></Link><Link className="mk-button-secondary" href="/login">Explore AI Studio</Link></div>
    </div></div></section>
  );
}

const studioItems = [
  [LayoutDashboard, "Dashboard"], [Code2, "Python Lab"], [Database, "SQL Lab"],
  [BarChart3, "EDA Hub"], [BrainCircuit, "AutoML"], [Orbit, "AutoDL"],
  [Braces, "AutoNLP"], [MessageSquareText, "GenAI"], [Bot, "Agentic AI"],
] as const;

export function StudioPreview() {
  return (
    <div className="mk-studio" aria-label="Illustration of the NxZenAI Studio workspace">
      <div className="mk-studio-bar"><div className="mk-studio-logo"><span>N</span>NxZenAI Studio</div><div className="mk-window-dots"><i /><i /><i /></div><div className="mk-studio-status"><span />Workspace online</div></div>
      <div className="mk-studio-body">
        <aside>{studioItems.map(([Icon, name]) => <div key={name} className={name === "AutoML" ? "active" : ""}><Icon size={14} /><span>{name}</span></div>)}</aside>
        <div className="mk-workspace">
          <div className="mk-workspace-head"><div><small>PROJECT / CUSTOMER INTELLIGENCE</small><h3>Customer churn analysis</h3></div><button type="button" tabIndex={-1}><Play size={13} fill="currentColor" /> Run workflow</button></div>
          <div className="mk-workspace-grid">
            <div className="mk-ui-panel mk-dataset"><div className="mk-panel-title"><span>Dataset preview</span><small>12,480 rows</small></div><div className="mk-fake-table"><div><b>customer</b><b>tenure</b><b>monthly</b><b>churn</b></div><div><span>CX-1042</span><span>18</span><span>2,499</span><span>No</span></div><div><span>CX-1043</span><span>4</span><span>3,890</span><span>Yes</span></div><div><span>CX-1044</span><span>31</span><span>1,890</span><span>No</span></div></div></div>
            <div className="mk-ui-panel mk-metrics"><div className="mk-panel-title"><span>Model metrics</span><small className="mk-live">Validated</small></div><div className="mk-metric-big">92.4<span>%</span></div><small>F1 score</small><div className="mk-mini-bars">{[42,68,54,86,73,93,76,88].map((height, index) => <i key={index} style={{height: `${height}%`}} />)}</div></div>
            <div className="mk-ui-panel mk-code"><div className="mk-panel-title"><span>Python notebook</span><small>Cell 4</small></div><pre><em>from</em> sklearn.ensemble <em>import</em>{" RandomForestClassifier\n"}<span>model</span>{" = RandomForestClassifier()\n"}<span>model</span>.fit(X_train, y_train)</pre><div className="mk-cell-result"><Check size={13} /> Model trained</div></div>
            <div className="mk-ui-panel mk-leader"><div className="mk-panel-title"><span>Model leaderboard</span><small>Accuracy</small></div>{[["Random Forest","92.4%"],["XGBoost","91.8%"],["Logistic Regression","87.2%"]].map(([name, score], index) => <div className="mk-model-row" key={name}><span>{index + 1}</span><strong>{name}</strong><b>{score}</b></div>)}</div>
            <div className="mk-ui-panel mk-genai"><div className="mk-panel-title"><span>GenAI analyst</span><small>RAG enabled</small></div><div className="mk-chat-line"><Sparkles size={15} /><p>Short tenure and premium monthly plans are the strongest churn signals.</p></div><div className="mk-prompt-line">Ask about this dataset <ArrowRight size={14} /></div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeatureCard({ icon: Icon, eyebrow, title, description, items }: {
  icon: ComponentType<{ size?: number }>; eyebrow?: string; title: string; description: string; items?: string[];
}) {
  return <article className="mk-feature-card"><div className="mk-icon"><Icon size={21} /></div>{eyebrow && <p className="mk-card-eyebrow">{eyebrow}</p>}<h3>{title}</h3><p>{description}</p>{items && <ul>{items.map(item => <li key={item}><Check size={14} />{item}</li>)}</ul>}</article>;
}
