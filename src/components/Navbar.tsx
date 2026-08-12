"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Programs", href: "/programs" },
  { name: "Curriculum", href: "/curriculum" },
  { name: "Projects", href: "/projects" },
  { name: "Demo", href: "/demo" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/70 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-wide text-white transition hover:text-blue-400 md:text-3xl lg:text-4xl"
        >
          NxZenAI
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navigation.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition ${
                  active
                    ? "text-blue-400"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* AI Studio */}
          <Link
            href="/login"
            className={`rounded-lg border px-4 py-2 font-semibold transition ${
              pathname.startsWith("/login") ||
              pathname.startsWith("/dashboard") ||
              pathname.startsWith("/automl") ||
              pathname.startsWith("/autodl")
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-blue-500/50 text-blue-400 hover:border-blue-400 hover:bg-blue-600 hover:text-white"
            }`}
          >
            AI Studio
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/demo"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Book Demo
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          className="rounded-lg border border-slate-700 p-2 text-white transition hover:bg-slate-800 lg:hidden"
        >
          {mobileOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden border-t border-slate-800 bg-slate-950 transition-all duration-300 lg:hidden ${
          mobileOpen ? "max-h-[600px]" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col px-6 py-5">

          {navigation.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-4 py-3 transition ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* Mobile AI Studio */}
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className={`mt-3 rounded-xl border px-4 py-3 text-center font-semibold transition ${
              pathname.startsWith("/login") ||
              pathname.startsWith("/dashboard") ||
              pathname.startsWith("/automl") ||
              pathname.startsWith("/autodl")
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-blue-500/50 text-blue-400 hover:border-blue-400 hover:bg-blue-600 hover:text-white"
            }`}
          >
            AI Studio
          </Link>

          {/* Mobile Book Demo */}
          <Link
            href="/demo"
            onClick={() => setMobileOpen(false)}
            className="mt-5 rounded-xl bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
          >
            Book Demo
          </Link>
        </nav>
      </div>
    </header>
  );
}