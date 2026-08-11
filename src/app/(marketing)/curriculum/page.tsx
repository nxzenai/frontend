import Link from "next/link";

export default function CurriculumPage() {
  const tracks = [
    {
      title: "AI Foundations",
      description:
        "Build strong AI fundamentals and create your first AI applications.",
      modules: [
        "Python Fundamentals",
        "SQL for Data Science",
        "Machine Learning Fundamentals",
        "Introduction to LLMs",
        "Introduction to RAG",
      ],
    },

    {
      title: "AI Engineering",
      description:
        "Develop advanced AI skills and solve real-world industry problems.",
      modules: [
        "Advanced Machine Learning",
        "Deep Learning",
        "Neural Networks",
        "Natural Language Processing",
        "Industry Case Studies",
      ],
    },

    {
      title: "Enterprise AI & Agentic Systems",
      description:
        "Build enterprise-grade AI systems and autonomous agents.",
      modules: [
        "MLOps",
        "AIOps",
        "Agentic AI Frameworks",
        "Governance",
        "Guardrails",
        "Enterprise AI Deployment",
      ],
    },

    {
      title: "AI for Organizations",
      description:
        "Accelerate AI adoption and transformation across teams.",
      modules: [
        "Executive AI Awareness",
        "Prompt Engineering",
        "AI Productivity",
        "Custom AI Solutions",
        "AI Governance",
      ],
    },
  ];

  return (
    <main className="min-h-screen py-20 px-6">

      <div className="max-w-7xl mx-auto">

        {/* Hero */}

        <div className="text-center mb-16">

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Curriculum
          </h1>

          <p className="text-slate-400 text-xl max-w-3xl mx-auto">
            A structured learning roadmap designed to
            take learners from AI fundamentals to
            enterprise-scale AI systems and agentic AI.
          </p>

        </div>

        {/* Learning Path */}

        <div className="space-y-10">

          {tracks.map((track) => (
            <div
              key={track.title}
              className="
                bg-slate-950
                border
                border-slate-800
                rounded-3xl
                p-8
              "
            >
              <h2 className="text-3xl font-bold mb-4">
                {track.title}
              </h2>

              <p className="text-slate-400 mb-8">
                {track.description}
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                {track.modules.map((module) => (
                  <div
                    key={module}
                    className="
                      bg-slate-900
                      border
                      border-slate-800
                      rounded-xl
                      p-4
                    "
                  >
                    <p className="text-slate-300">
                      {module}
                    </p>
                  </div>
                ))}

              </div>

            </div>
          ))}

        </div>

        {/* Learning Journey */}

        <div
          className="
            mt-20
            bg-slate-950
            border
            border-slate-800
            rounded-3xl
            p-12
            text-center
          "
        >

          <h2 className="text-4xl font-bold mb-6">
            Your AI Learning Journey
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-lg">

            <span>Learn</span>

            <span className="text-blue-400">→</span>

            <span>Build</span>

            <span className="text-blue-400">→</span>

            <span>Practice</span>

            <span className="text-blue-400">→</span>

            <span>Deploy</span>

            <span className="text-blue-400">→</span>

            <span>Become Industry Ready</span>

          </div>

        </div>

        {/* CTA */}

        <div className="text-center mt-16">

          <Link
            href="/demo"
            className="
              inline-flex
              bg-blue-600
              hover:bg-blue-700
              px-8
              py-4
              rounded-xl
              font-semibold
              transition
            "
          >
            Schedule a Consultation
          </Link>

        </div>

      </div>

    </main>
  );
}