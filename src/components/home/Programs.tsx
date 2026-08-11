export default function Programs() {
  return (
    <section className="bg-slate-950 py-24">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-14">
          Our Programs
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-blue-500 transition">
            <h3 className="text-2xl font-bold mb-4">
              AI Foundations
            </h3>

            <p className="text-slate-400 mb-6">
              Build strong AI fundamentals and create your first AI
              applications.
            </p>

            <ul className="space-y-2 text-slate-300">
              <li>✔ Python</li>
              <li>✔ SQL</li>
              <li>✔ Machine Learning</li>
              <li>✔ LLMs</li>
              <li>✔ RAG</li>
            </ul>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-blue-500 transition">
            <h3 className="text-2xl font-bold mb-4">
              AI Engineering
            </h3>

            <p className="text-slate-400 mb-6">
              Build production-ready AI applications and solve industry
              problems.
            </p>

            <ul className="space-y-2 text-slate-300">
              <li>✔ Advanced ML</li>
              <li>✔ Deep Learning</li>
              <li>✔ Neural Networks</li>
              <li>✔ NLP</li>
              <li>✔ Industry Projects</li>
            </ul>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-blue-500 transition">
            <h3 className="text-2xl font-bold mb-4">
              Enterprise AI
            </h3>

            <p className="text-slate-400 mb-6">
              Design and deploy enterprise-grade AI systems and intelligent
              agents.
            </p>

            <ul className="space-y-2 text-slate-300">
              <li>✔ MLOps</li>
              <li>✔ AIOps</li>
              <li>✔ Agentic AI</li>
              <li>✔ Governance</li>
              <li>✔ Guardrails</li>
            </ul>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-blue-500 transition">
            <h3 className="text-2xl font-bold mb-4">
              AI for Organizations
            </h3>

            <p className="text-slate-400 mb-6">
              Accelerate AI transformation across teams and businesses.
            </p>

            <ul className="space-y-2 text-slate-300">
              <li>✔ Executive AI</li>
              <li>✔ Productivity AI</li>
              <li>✔ Prompt Engineering</li>
              <li>✔ AI Adoption</li>
              <li>✔ Governance</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}