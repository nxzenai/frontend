export default function CareerSupport() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-4">
          Free Career Support
        </h2>

        <p className="text-slate-400 text-center max-w-3xl mx-auto mb-14">
          Every registered learner receives additional career support designed
          to improve confidence, professional readiness, and career growth
          opportunities.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-black border border-slate-800 rounded-3xl p-8 text-center hover:border-blue-500 transition">
            <div className="text-5xl mb-5">🎯</div>

            <h3 className="text-2xl font-semibold mb-4">
              Career Guidance
            </h3>

            <p className="text-slate-400">
              Personalized guidance on career paths, AI learning roadmaps,
              skill development, and industry opportunities.
            </p>
          </div>

          <div className="bg-black border border-slate-800 rounded-3xl p-8 text-center hover:border-blue-500 transition">
            <div className="text-5xl mb-5">🎤</div>

            <h3 className="text-2xl font-semibold mb-4">
              Mock Interviews
            </h3>

            <p className="text-slate-400">
              Practice technical and HR interviews, receive feedback, and
              improve confidence before attending real interviews.
            </p>
          </div>

          <div className="bg-black border border-slate-800 rounded-3xl p-8 text-center hover:border-blue-500 transition">
            <div className="text-5xl mb-5">📄</div>

            <h3 className="text-2xl font-semibold mb-4">
              Resume Optimization
            </h3>

            <p className="text-slate-400">
              Get professional guidance to improve resume quality, ATS
              compatibility, and recruiter visibility.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}