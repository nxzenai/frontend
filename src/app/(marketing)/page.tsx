import Link from "next/link";

import Hero from "@/components/home/Hero";
import WhyNxZenAI from "@/components/home/WhyNxZenAI";
import Programs from "@/components/home/Programs";
import NxZenAIStudio from "@/components/home/NxZenAIStudio";
import Journey from "@/components/home/Journey";
import IndustryChallengeLabs from "@/components/home/IndustryChallengeLabs";
import IndustryReadiness from "@/components/home/IndustryReadiness";
import CareerSupport from "@/components/home/CareerSupport";
import CTA from "@/components/home/CTA";

const consultingServices = [
  {
    title: "AI Strategy & Consulting",
    description:
      "Identify high-impact AI opportunities, define practical roadmaps and plan AI adoption aligned with your business goals.",
  },
  {
    title: "Custom AI Solutions",
    description:
      "Design and develop AI-powered solutions tailored to real business workflows, operational challenges and customer needs.",
  },
  {
    title: "Generative AI",
    description:
      "Build intelligent applications using LLMs, RAG, conversational AI and enterprise knowledge systems.",
  },
  {
    title: "Machine Learning & Analytics",
    description:
      "Turn business data into predictive insights using machine learning, analytics and intelligent decision systems.",
  },
  {
    title: "AI Automation",
    description:
      "Automate repetitive workflows and improve productivity using AI-powered automation and intelligent agents.",
  },
  {
    title: "AI PoC & MVP Development",
    description:
      "Validate AI ideas quickly through focused proof-of-concepts and scalable minimum viable products.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <Hero />

      <WhyNxZenAI />

      {/* AI Consultancy & Solutions */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-14">
            <p className="text-blue-400 font-semibold mb-3">
              AI Consultancy & Solutions
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Turn AI Opportunities Into Business Solutions
            </h2>

            <p className="text-slate-400 text-lg max-w-3xl mx-auto">
              NxZenAI helps organizations identify, build and implement
              practical AI solutions that improve productivity,
              decision-making and business performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {consultingServices.map((service) => (
              <div
                key={service.title}
                className="
                  bg-slate-950
                  border
                  border-slate-800
                  rounded-3xl
                  p-8
                  hover:border-blue-500
                  transition-all
                  duration-300
                "
              >
                <h3 className="text-xl font-semibold mb-3">
                  {service.title}
                </h3>

                <p className="text-slate-400 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Link
              href="/contact"
              className="
                inline-flex
                items-center
                justify-center
                bg-blue-600
                hover:bg-blue-700
                px-8
                py-4
                rounded-xl
                font-semibold
                transition
              "
            >
              Discuss Your AI Requirement
            </Link>

            <Link
              href="/projects"
              className="
                inline-flex
                items-center
                justify-center
                border
                border-slate-700
                hover:bg-slate-900
                px-8
                py-4
                rounded-xl
                font-semibold
                transition
              "
            >
              Explore Industry Applications
            </Link>
          </div>

        </div>
      </section>

      {/* Existing Education & Platform Sections */}
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