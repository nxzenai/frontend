export default function WhyNxZenAI() {
  return (
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
            "Generative AI Focus",
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
  );
}