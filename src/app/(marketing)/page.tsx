import Hero from "@/components/home/Hero";
import WhyNxZenAI from "@/components/home/WhyNxZenAI";
import Programs from "@/components/home/Programs";
import NxZenAIStudio from "@/components/home/NxZenAIStudio";
import Journey from "@/components/home/Journey";
import IndustryChallengeLabs from "@/components/home/IndustryChallengeLabs";
import IndustryReadiness from "@/components/home/IndustryReadiness";
import CareerSupport from "@/components/home/CareerSupport";
import CTA from "@/components/home/CTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Hero />
      <WhyNxZenAI />
      <Programs />
      <NxZenAIStudio />
      <Journey />
      <IndustryChallengeLabs />
      <IndustryReadiness />
      <CareerSupport />
      <CTA />
    </main>
  );
}