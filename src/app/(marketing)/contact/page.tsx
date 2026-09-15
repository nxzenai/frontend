import type { Metadata } from "next";
import { Building2, GraduationCap, Mail, Phone, Sparkles, Users } from "lucide-react";
import ContactForm from "@/components/marketing/ContactForm";
import { FeatureCard, PageHero } from "@/components/marketing/MarketingPrimitives";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk with NxZenAI about AI training, NxZenAI Studio, consulting, and enterprise AI solutions.",
};

const audiences = [
  { icon: GraduationCap, title: "Learners", description: "Choose a practical pathway into AI, machine learning, GenAI, and agentic systems." },
  { icon: Users, title: "Teams", description: "Build role-relevant AI capability with hands-on corporate and university programs." },
  { icon: Building2, title: "Organizations", description: "Explore AI strategy, automation, prototypes, and responsible enterprise adoption." },
];

export default function ContactPage() {
  return (
    <main>
      <PageHero
        eyebrow="Start a conversation"
        title="Make your next AI move"
        accent="practical."
        description="Tell us what you want to learn, build, or transform. Our team will help you identify the right next step."
      />

      <section className="mk-section mk-section-alt">
        <div className="mk-container mk-contact-layout">
          <div>
            <p className="mk-kicker">Contact NxZenAI</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-.04em] md:text-5xl">Let&apos;s explore what AI can do for you.</h2>
            <p className="mt-5 max-w-xl leading-7 text-slate-400">For training guidance, AI Studio access, or an enterprise consultation, share a little context and we will connect you with the right team.</p>
            <div className="mt-9 grid gap-3 sm:grid-cols-2">
              <a className="mk-contact-detail" href="mailto:bhargav@nxzenai.com"><Mail size={18} /><span><small>Email</small>bhargav@nxzenai.com</span></a>
              <a className="mk-contact-detail" href="tel:+919949614407"><Phone size={18} /><span><small>Mobile</small>+91 99496 14407</span></a>
            </div>
            <div className="mt-9 rounded-2xl border border-cyan-300/15 bg-cyan-300/[.04] p-5 text-sm leading-6 text-slate-400">
              <Sparkles className="mb-3 text-cyan-300" size={19} />
              Expect a practical conversation focused on your goals, readiness, and the most useful next step.
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-container">
          <div className="mk-card-grid mk-three">
            {audiences.map(({ icon, title, description }) => <FeatureCard key={title} icon={icon} title={title} description={description} />)}
          </div>
        </div>
      </section>
    </main>
  );
}
