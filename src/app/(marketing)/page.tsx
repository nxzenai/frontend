import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      {/* Hero Section */}
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

      {/* Why NxZenAI */}
      <section className="py-24">
        <div className="container mx-auto px-6">

          <h2 className="text-4xl font-bold text-center mb-14">
            Why NxZenAI?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            {[
              "Hands-On Learning",
              "Industry Relevant Curriculum",
              "Project Based Training",
              "Mentorship & Guidance",
              "Portfolio Building",
              "Generative AI Focus"
            ].map((item) => (
              <div
                key={item}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-8 hover:border-blue-500 transition"
              >
                <h3 className="text-xl font-semibold">
                  {item}
                </h3>
              </div>
            ))}

          </div>

        </div>
      </section>

      
{/* Programs */}
{/* Programs */}
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
          Build strong AI fundamentals and create your first AI applications.
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
          Build production-ready AI applications and solve industry problems.
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
          Design and deploy enterprise-grade AI systems and intelligent agents.
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
{/* NxZenAI Studio */}

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
{/* Learning Journey */}

<section className="py-24 bg-slate-950">

  <div className="max-w-6xl mx-auto px-6 text-center">

    <h2 className="text-4xl font-bold mb-12">
      Your Learning Journey
    </h2>

    <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-xl">

  <span>Learn</span>

  <span className="text-blue-500">→</span>

  <span>Build</span>

  <span className="text-blue-500">→</span>

  <span>Deploy</span>

  <span className="text-blue-500">→</span>

  <span>Publish</span>

  <span className="text-blue-500">→</span>

  <span>Lead with AI</span>

</div>

  </div>

</section>

{/* Industry Challenge Labs */}

<section className="py-24">

  <div className="max-w-7xl mx-auto px-6">

    <h2 className="text-4xl font-bold text-center mb-4">
      Industry Challenge Labs
    </h2>

    <p className="text-slate-400 text-center max-w-3xl mx-auto mb-16">
      Move beyond theory and work on real-world
      challenges inspired by modern industries.
      Learn how AI is applied to solve business,
      operational and strategic problems.
    </p>

    <div className="grid md:grid-cols-5 gap-6">

      {[
        "Banking & Finance",
        "Healthcare",
        "Retail & E-Commerce",
        "Human Resources",
        "Manufacturing",
      ].map((industry) => (
        <div
          key={industry}
          className="
            bg-slate-950
            border
            border-slate-800
            rounded-2xl
            p-8
            text-center
            hover:border-blue-500
            transition
          "
        >
          <h3 className="font-semibold text-lg">
            {industry}
          </h3>
        </div>
      ))}

    </div>

  </div>

</section>


      {/* Industry Readiness */}
      <section className="py-24">

        <div className="max-w-5xl mx-auto px-6 text-center">

          <h2 className="text-4xl font-bold mb-8">
            Industry Readiness First
          </h2>

          <p className="text-slate-400 text-lg leading-relaxed">
            Our programs are designed to help learners build
            industry-ready AI skills through practical projects,
            portfolio development, mentorship, technical interview
            preparation, real-world implementation experience and
            innovative AI thinking.
          </p>

        </div>

      </section>

      {/* Free Career Support */}

<section className="py-24 bg-slate-950">

  <div className="max-w-6xl mx-auto px-6">

    <h2 className="text-4xl font-bold text-center mb-4">
      Free Career Support
    </h2>

    <p className="text-slate-400 text-center max-w-3xl mx-auto mb-14">
      Every registered learner receives additional career support
      designed to improve confidence, professional readiness,
      and career growth opportunities.
    </p>

    <div className="grid md:grid-cols-3 gap-8">

      <div className="bg-black border border-slate-800 rounded-3xl p-8 text-center hover:border-blue-500 transition">

        <div className="text-5xl mb-5">
          🎯
        </div>

        <h3 className="text-2xl font-semibold mb-4">
          Career Guidance
        </h3>

        <p className="text-slate-400">
          Personalized guidance on career paths,
          AI learning roadmaps, skill development,
          and industry opportunities.
        </p>

      </div>

      <div className="bg-black border border-slate-800 rounded-3xl p-8 text-center hover:border-blue-500 transition">

        <div className="text-5xl mb-5">
          🎤
        </div>

        <h3 className="text-2xl font-semibold mb-4">
          Mock Interviews
        </h3>

        <p className="text-slate-400">
          Practice technical and HR interviews,
          receive feedback, and improve confidence
          before attending real interviews.
        </p>

      </div>

      <div className="bg-black border border-slate-800 rounded-3xl p-8 text-center hover:border-blue-500 transition">

        <div className="text-5xl mb-5">
          📄
        </div>

        <h3 className="text-2xl font-semibold mb-4">
          Resume Optimization
        </h3>

        <p className="text-slate-400">
          Get professional guidance to improve
          resume quality, ATS compatibility,
          and recruiter visibility.
        </p>

      </div>

    </div>

  </div>

</section>

     

      {/* CTA */}
      <section className="py-24 bg-slate-950">

        <div className="container mx-auto px-6 text-center">

          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your AI Journey?
          </h2>

          <p className="text-slate-400 text-lg mb-10">
            Explore our curriculum, connect with mentors,
            and discover the right AI learning path.
          </p>

          {/* Included Free With Every Program */}

<div className="mt-8 mb-10">

  <p className="text-slate-400 text-sm uppercase tracking-wider mb-5">
    Included Free With Every Program
  </p>

  <div className="flex flex-wrap justify-center gap-5">

    <div className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4">
      <div className="text-green-400 font-semibold">
        🎯 Career Guidance
      </div>
    </div>

    <div className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4">
      <div className="text-blue-400 font-semibold">
        🎤 Mock Interviews
      </div>
    </div>

    <div className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4">
      <div className="text-purple-400 font-semibold">
        📄 Resume Optimization
      </div>
    </div>

  </div>

</div>

          <div className="flex flex-col md:flex-row justify-center gap-4">

            <Link
              href="/demo"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold"
            >
              Book Free Consultation
            </Link>

            <Link
              href="/curriculum"
              className="border border-slate-600 px-8 py-4 rounded-xl hover:bg-white hover:text-black transition"
            >
              View Curriculum
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

