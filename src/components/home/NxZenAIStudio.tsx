export default function NxZenAIStudio() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4">
          Learn with NxZenAI Studio
        </h2>

        <p className="text-slate-400 text-center max-w-3xl mx-auto mb-16">
          Master AI through structured learning paths,
          hands-on projects, industry use cases, and
          real-world implementation experience.
        </p>

        <div className="grid md:grid-cols-5 gap-6">
          {[
            "AI Foundations",
            "Hands-on Labs",
            "Capstone Projects",
            "Agentic AI",
            "Career Readiness",
          ].map((item) => (
            <div
              key={item}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center hover:border-blue-500 transition"
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}