export default function Journey() {
  return (
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
  );
}