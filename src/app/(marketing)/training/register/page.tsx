import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/MarketingPrimitives";
import TrainingRegistrationForm from "@/components/marketing/TrainingRegistrationForm";

export const metadata: Metadata = { title: "Training Registration", description: "Register your interest in NxZenAI training, demos, and consultations." };

export default function TrainingRegistrationPage() {
  return <main><PageHero eyebrow="Training registration" title="Take your next step" accent="with AI." description="Tell us about your goals. Our team will help you choose a program and arrange a demo or consultation." /><section className="mk-section mk-section-alt"><div className="mk-container max-w-4xl"><TrainingRegistrationForm /></div></section></main>;
}
