import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800">

      <div className="max-w-7xl mx-auto px-6 py-14">

        <div className="grid md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>

            <h3 className="text-3xl font-bold text-white mb-4">
              NxZenAI
            </h3>

            <p className="text-slate-400 leading-relaxed">
              Learn AI. Build AI.
              Deploy AI.
              Become Industry Ready.
            </p>

          </div>

          {/* Programs */}
          <div>

            <h4 className="text-white font-semibold mb-4">
              Programs
            </h4>

            <div className="flex flex-col gap-2 text-slate-400">

              <p>AI Foundations</p>

              <p>AI Engineering</p>

              <p>Enterprise AI</p>

              <p>AI for Organizations</p>

            </div>

          </div>

          {/* Quick Links */}
          <div>

            <h4 className="text-white font-semibold mb-4">
              Quick Links
            </h4>

            <div className="flex flex-col gap-2 text-slate-400">

              <Link href="/">
                Home
              </Link>

              <Link href="/programs">
                Programs
              </Link>

              <Link href="/curriculum">
                Curriculum
              </Link>

              <Link href="/projects">
                Projects
              </Link>

              <Link href="/demo">
                Demo
              </Link>

              <Link href="/contact">
                Contact
              </Link>

            </div>

          </div>

          {/* Contact */}
          <div>

            <h4 className="text-white font-semibold mb-4">
              Contact
            </h4>

            <div className="space-y-2 text-slate-400">

              <p>info@nxzenai.com</p>

              <p>+91 99496 14407</p>

              <p>
                Empowering the next generation
                of AI professionals.
              </p>

            </div>

          </div>

        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 text-center text-slate-500">

          © 2026 NxZenAI.
          All Rights Reserved.

        </div>

      </div>

    </footer>
  );
}