"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-black/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="text-4xl font-bold tracking-wide text-white"
        >
          NxZenAI
        </Link>

        {/* Navigation */}
        <div className="hidden lg:flex items-center gap-10 text-lg text-slate-300">

          <Link
            href="/"
            className="hover:text-white transition"
          >
            Home
          </Link>

          <Link
            href="/programs"
            className="hover:text-white transition"
          >
            Programs
          </Link>

          <Link
            href="/curriculum"
            className="hover:text-white transition"
          >
            Curriculum
          </Link>

          <Link
            href="/projects"
            className="hover:text-white transition"
          >
            Projects
          </Link>

          <Link
            href="/demo"
            className="hover:text-white transition"
          >
            Demo
          </Link>

          <Link
            href="/contact"
            className="hover:text-white transition"
          >
            Contact
          </Link>

        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">

          <Link
            href="/demo"
            className="
              hidden md:flex
              bg-slate-800
              hover:bg-slate-700
              px-5
              py-3
              rounded-xl
              text-white
              font-medium
              transition
            "
          >
            Book Demo
          </Link>

        

        </div>

      </div>
    </nav>
  );
}