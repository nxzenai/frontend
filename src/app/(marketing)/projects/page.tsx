import Link from "next/link";

export default function ProjectsPage() {
  const industries = [
    {
      title: "Banking & Finance",
      description:
        "Explore how AI is used to improve decision-making, risk management, customer experience and operational efficiency.",
    },

    {
      title: "Healthcare",
      description:
        "Understand how AI supports healthcare workflows, diagnostics, research and patient-centric solutions.",
    },

    {
      title: "Retail & E-Commerce",
      description:
        "Learn how AI enhances customer insights, personalization, forecasting and business performance.",
    },

    {
      title: "Human Resources",
      description:
        "Discover AI applications for talent acquisition, workforce analytics and employee engagement.",
    },

    {
      title: "Manufacturing",
      description:
        "Explore how AI improves operational efficiency, quality management and industrial intelligence.",
    },

    {
      title: "Cross-Industry Innovation",
      description:
        "Work on multidisciplinary AI challenges inspired by emerging business and technology trends.",
    },
  ];

  return (
    <main className="min-h-screen py-20 px-6">

      <div className="max-w-7xl mx-auto">

        {/* Hero */}

        <div className="text-center mb-16">

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Industry Challenge Labs
          </h1>

          <p className="text-slate-400 text-xl max-w-3xl mx-auto">
            Move beyond theory and learn how Artificial
            Intelligence is applied to solve real-world
            business challenges across industries.
          </p>

        </div>

        {/* Key Highlights */}

        <div className="grid md:grid-cols-4 gap-6 mb-20">

          {[
            "Real Business Problems",
            "Industry Datasets",
            "Hands-On AI Solutions",
            "Portfolio Ready Experience",
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

        {/* Learning Approach */}

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
            Our Industry Challenge Approach
          </h2>

          <div className="grid md:grid-cols-5 gap-6 text-center">

            <div>
              <h3 className="font-semibold mb-2">
                Problem
              </h3>

              <p className="text-slate-400 text-sm">
                Understand the challenge
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Data
              </h3>

              <p className="text-slate-400 text-sm">
                Explore industry datasets
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Build
              </h3>

              <p className="text-slate-400 text-sm">
                Develop AI solutions
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Evaluate
              </h3>

              <p className="text-slate-400 text-sm">
                Measure performance
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Present
              </h3>

              <p className="text-slate-400 text-sm">
                Showcase outcomes
              </p>
            </div>

          </div>

        </div>

        {/* CTA */}

        <div className="text-center mt-20">

          <h2 className="text-4xl font-bold mb-4">
            Ready to Solve Real Industry Problems?
          </h2>

          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Gain practical experience through
            industry-inspired AI challenges and
            hands-on learning.
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
            Explore NxZenAI Studio
          </Link>

        </div>

      </div>

    </main>
  );
}