export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 py-28">
      <div className="container mx-auto px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
          Learn AI.
          <br />
          Build AI Solutions.
          <br />
          Become Industry Ready.
        </h1>

        <p className="text-xl max-w-4xl mx-auto mb-10 text-slate-300 leading-relaxed">
          NxZenAI helps students, professionals, educators,
          entrepreneurs and organizations leverage Artificial
          Intelligence through industry-focused learning,
          real-world projects and domain-specific AI programs.
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <span className="px-4 py-2 border border-slate-600 rounded-full">
            🚀 Project-Based Learning
          </span>

          <span className="px-4 py-2 border border-slate-600 rounded-full">
            🎯 Industry-Relevant Curriculum
          </span>

          <span className="px-4 py-2 border border-slate-600 rounded-full">
            💼 Industry Readiness
          </span>

          <span className="px-4 py-2 border border-slate-600 rounded-full">
            🤖 AI & Generative AI
          </span>
        </div>
      </div>
    </section>
  );
}