import Link from "next/link";

export default function ProgramsPage() {
  const programs = [
    {
      title: "AI Foundations",
      audience:
        "Students, Fresh Graduates and Career Switchers",
      skills: [
        "Python",
        "SQL for Data Science",
        "Machine Learning",
        "Introduction to LLMs",
        "Introduction to RAG",
      ],
      outcome:
        "Build strong AI fundamentals, train your first ML models and create your first RAG application.",
    },

    {
      title: "AI Engineering",
      audience:
        "Learners with AI fundamentals who want to build real-world AI applications.",
      skills: [
        "Advanced Machine Learning",
        "Deep Learning",
        "Neural Networks",
        "Natural Language Processing",
        "Industry Case Studies",
      ],
      outcome:
        "Develop production-ready AI solutions and solve industry-level business problems.",
    },

    {
      title: "Enterprise AI & Agentic Systems",
      audience:
        "AI Engineers, Working Professionals and Technical Architects.",
      skills: [
        "MLOps",
        "AIOps",
        "Agentic AI",
        "Governance",
        "Guardrails",
      ],
      outcome:
        "Design, deploy and manage enterprise-scale AI systems and intelligent agents.",
    },

    {
      title: "AI for Organizations",
      audience:
        "Organizations, Universities and Corporate Teams.",
      skills: [
        "Executive AI Awareness",
        "AI Productivity",
        "Prompt Engineering",
        "Custom AI Solutions",
        "AI Governance",
      ],
      outcome:
        "Accelerate AI adoption, productivity and digital transformation across teams.",
    },
  ];

  return (
    <main className="min-h-screen py-20 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16">

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Our Programs
          </h1>

          <p className="text-slate-400 text-xl max-w-3xl mx-auto">
            Structured AI learning pathways designed to
            take learners from foundations to
            enterprise-scale AI systems.
          </p>

        </div>

        {/* Programs Grid */}
        <div className="grid lg:grid-cols-2 gap-8">

          {programs.map((program) => (
            <div
              key={program.title}
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
              {/* Title */}
              <h2 className="text-3xl font-bold mb-4">
                {program.title}
              </h2>

              {/* Audience */}
              <div className="mb-6">

                <h3 className="font-semibold text-white mb-2">
                  Who is this for?
                </h3>

                <p className="text-slate-400">
                  {program.audience}
                </p>

              </div>

              {/* Skills */}
              <div className="mb-6">

                <h3 className="font-semibold text-white mb-3">
                  Key Skills
                </h3>

                <div className="flex flex-wrap gap-2">

                  {program.skills.map((skill) => (
                    <span
                      key={skill}
                      className="
                        bg-slate-900
                        border
                        border-slate-700
                        px-3
                        py-2
                        rounded-lg
                        text-sm
                        text-slate-300
                      "
                    >
                      {skill}
                    </span>
                  ))}

                </div>

              </div>

              {/* Outcome */}
              <div className="mb-8">

                <h3 className="font-semibold text-white mb-2">
                  Outcome
                </h3>

                <p className="text-slate-400">
                  {program.outcome}
                </p>

              </div>

              {/* CTA */}
              <div className="flex gap-4">

                <Link
                  href="/curriculum"
                  className="
                    bg-blue-600
                    hover:bg-blue-700
                    px-6
                    py-3
                    rounded-xl
                    font-medium
                    transition
                  "
                >
                  View Curriculum
                </Link>

                <Link
                  href="/demo"
                  className="
                    bg-slate-800
                    hover:bg-slate-700
                    px-6
                    py-3
                    rounded-xl
                    font-medium
                    transition
                  "
                >
                  Book Consultation
                </Link>

              </div>

            </div>
          ))}

        </div>

        {/* Bottom CTA */}
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

          <h2 className="text-4xl font-bold mb-4">
            Not Sure Which Program Fits You?
          </h2>

          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            Speak with our team and receive a personalized
            AI learning roadmap based on your goals,
            experience and career aspirations.
          </p>

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