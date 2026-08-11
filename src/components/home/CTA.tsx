import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 bg-slate-950">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-6">
          Ready to Start Your AI Journey?
        </h2>

        <p className="text-slate-400 text-lg mb-10">
          Explore our curriculum, connect with mentors, and discover the right
          AI learning path.
        </p>


        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            href="/demo"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-semibold transition"
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
  );
}