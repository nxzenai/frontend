import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 py-28">
      <div className="container mx-auto px-6 text-center">

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
          Build AI Solutions.
          <br />
          Develop AI Skills.
          <br />
          Transform with AI.
        </h1>

        {/* Supporting Message */}
        <p className="text-xl max-w-4xl mx-auto mb-10 text-slate-300 leading-relaxed">
          NxZenAI helps businesses, professionals and organizations
          adopt Artificial Intelligence through AI consulting,
          custom AI solutions, practical training and hands-on
          AI development.
        </p>

        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Link
            href="/contact"
            className="
              inline-flex
              items-center
              justify-center
              rounded-xl
              bg-blue-600
              px-8
              py-4
              font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            Explore AI Solutions
          </Link>

          <Link
            href="/programs"
            className="
              inline-flex
              items-center
              justify-center
              rounded-xl
              border
              border-slate-600
              px-8
              py-4
              font-semibold
              text-white
              transition
              hover:border-blue-500
              hover:bg-slate-900
            "
          >
            Explore AI Training
          </Link>
        </div>

        {/* Capability Highlights */}
        <div className="flex flex-wrap justify-center gap-4">
          <span className="px-4 py-2 border border-slate-600 rounded-full">
            🤖 AI Consulting & Solutions
          </span>

          <span className="px-4 py-2 border border-slate-600 rounded-full">
            ⚡ Generative AI & Automation
          </span>

          <span className="px-4 py-2 border border-slate-600 rounded-full">
            🎓 Industry-Focused AI Training
          </span>

          <span className="px-4 py-2 border border-slate-600 rounded-full">
            🚀 NxZenAI Studio
          </span>
        </div>

      </div>
    </section>
  );
}