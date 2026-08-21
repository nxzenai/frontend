import Link from "next/link";

export default function ProjectsPage() {
  const industries = [
    {
      title: "Banking & Finance",
      description:
        "AI applications for decision-making, fraud detection, risk management, customer intelligence and operational efficiency.",
    },

    {
      title: "Healthcare",
      description:
        "AI applications supporting healthcare workflows, intelligent analytics, research and patient-centric solutions.",
    },

    {
      title: "Retail & E-Commerce",
      description:
        "AI solutions for customer insights, personalization, demand forecasting and business performance.",
    },

    {
      title: "Human Resources",
      description:
        "AI applications for talent acquisition, workforce analytics, employee engagement and HR automation.",
    },

    {
      title: "Manufacturing",
      description:
        "AI solutions for operational efficiency, predictive maintenance, quality management and industrial intelligence.",
    },

    {
      title: "Cross-Industry Innovation",
      description:
        "AI solutions and challenge labs inspired by emerging business, data and technology requirements.",
    },
  ];

  return (
    <main className="min-h-screen py-20 px-6">

      <div className="max-w-7xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-16">

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Industry AI Solutions & Challenge Labs
          </h1>

          <p className="text-slate-400 text-xl max-w-3xl mx-auto">
            Explore how Artificial Intelligence can be applied
            to real-world business challenges across industries
            through practical solutions, use cases and hands-on
            challenge labs.
          </p>

        </div>

        {/* Key Highlights */}
        <div className="grid md:grid-cols-4 gap-6 mb-20">

          {[
            "Real Business Problems",
            "Industry Data",
            "Practical AI Solutions",
            "Real-World Applications",
          ].map((item) => (
            <div
              key={item}
              className="
                bg-slate-950
                border
                border-slate-800
                rounded-2xl
                p-6
                text-center
              "
            >
              <p className="font-medium">
                {item}
              </p>
            </div>
          ))}

        </div>

        {/* Industry Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

          {industries.map((industry) => (
            <div
              key={industry.title}
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
              <h2 className="text-2xl font-bold mb-4">
                {industry.title}
              </h2>

              <p className="text-slate-400 leading-relaxed">
                {industry.description}
              </p>
            </div>
          ))}

        </div>

        {/* Approach */}
        <div
          className="
            mt-20
            bg-slate-950
            border
            border-slate-800
            rounded-3xl
            p-12
          "
        >

          <h2 className="text-3xl font-bold mb-8 text-center">
            Our AI Solution Approach
          </h2>

          <div className="grid md:grid-cols-5 gap-6 text-center">

            <div>
              <h3 className="font-semibold mb-2">
                Problem
              </h3>

              <p className="text-slate-400 text-sm">
                Understand the business challenge
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Data
              </h3>

              <p className="text-slate-400 text-sm">
                Explore available data
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Build
              </h3>

              <p className="text-slate-400 text-sm">
                Develop the AI solution
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Evaluate
              </h3>

              <p className="text-slate-400 text-sm">
                Measure business and model performance
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Deploy
              </h3>

              <p className="text-slate-400 text-sm">
                Move solutions toward real-world use
              </p>
            </div>

          </div>

        </div>

        {/* CTA */}
        <div className="text-center mt-20">

          <h2 className="text-4xl font-bold mb-4">
            Have an AI Challenge to Solve?
          </h2>

          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Whether you are exploring AI for your organization
            or developing practical AI skills, NxZenAI helps
            turn real-world problems into AI solutions.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">

            <Link
              href="/contact"
              className="
                inline-flex
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
              Discuss an AI Project
            </Link>

            <Link
              href="/demo"
              className="
                inline-flex
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
              Explore NxZenAI Studio
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}