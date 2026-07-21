export default function IndustryChallengeLabs() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4">
          Industry Challenge Labs
        </h2>

        <p className="text-slate-400 text-center max-w-3xl mx-auto mb-16">
          Move beyond theory and work on real-world challenges inspired by
          modern industries. Learn how AI is applied to solve business,
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
  );
}