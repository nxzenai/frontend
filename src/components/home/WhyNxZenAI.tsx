const reasons = [
  {
    title: "AI Strategy to Implementation",
    description:
      "We help organizations move from identifying AI opportunities to building practical, business-focused AI solutions.",
  },
  {
    title: "Custom AI Solutions",
    description:
      "Build AI, machine learning, Generative AI and automation solutions tailored to real business requirements.",
  },
  {
    title: "Industry-Focused Expertise",
    description:
      "We connect AI technology with real-world industry problems across finance, healthcare, retail, HR and other domains.",
  },
  {
    title: "AI Training & Upskilling",
    description:
      "Practical AI training for students, professionals, corporate teams and organizations developing AI capabilities.",
  },
  {
    title: "Hands-On AI Development",
    description:
      "Learn and experiment through real projects, industry challenges and the NxZenAI Studio environment.",
  },
  {
    title: "Generative AI & Emerging Tech",
    description:
      "Explore modern AI capabilities including LLMs, RAG, intelligent agents, automation and enterprise AI systems.",
  },
];

export default function WhyNxZenAI() {
  return (
    <section className="bg-slate-950 py-24 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-blue-400 font-semibold mb-3">
            Why NxZenAI?
          </p>

          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            From AI Strategy to AI Capability
          </h2>

          <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed">
            NxZenAI combines AI consulting, solution development
            and practical training to help businesses and people
            build real-world AI capabilities.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="
                bg-slate-950
                border
                border-slate-800
                rounded-3xl
                p-8
                transition-all
                duration-300
                hover:border-blue-500
              "
            >
              <h3 className="text-2xl font-semibold mb-4">
                {reason.title}
              </h3>

              <p className="text-slate-400 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}