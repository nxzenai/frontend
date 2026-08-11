"use client";

import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen py-20 px-6">

      <div className="max-w-6xl mx-auto">

        {/* Hero */}

        <div className="text-center mb-16">

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Let's Connect
          </h1>

          <p className="text-slate-400 text-xl max-w-3xl mx-auto">
            Whether you're a student, professional,
            organization or institution, we're here
            to help you navigate your AI journey.
          </p>

        </div>

        {/* Contact Cards */}

        <div className="grid md:grid-cols-3 gap-8 mb-16">

          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center">

            <div className="text-4xl mb-4">
              📧
            </div>

            <h3 className="text-xl font-semibold mb-3">
              Email
            </h3>

            <p className="text-slate-400">
              info@nextgenai.in
            </p>

          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center">

            <div className="text-4xl mb-4">
              📱
            </div>

            <h3 className="text-xl font-semibold mb-3">
              Phone
            </h3>

            <p className="text-slate-400">
              +91 99496 14407
            </p>

          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 text-center">

            <div className="text-4xl mb-4">
              🤝
            </div>

            <h3 className="text-xl font-semibold mb-3">
              Consultation
            </h3>

            <p className="text-slate-400">
              Free AI Career & Program Guidance
            </p>

          </div>

        </div>

        {/* Who We Work With */}

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-10 mb-16">

          <h2 className="text-3xl font-bold text-center mb-10">
            Who We Work With
          </h2>

          <div className="grid md:grid-cols-4 gap-6 text-center">

            <div className="border border-slate-800 rounded-2xl p-6">
              🎓
              <p className="mt-3">
                Students
              </p>
            </div>

            <div className="border border-slate-800 rounded-2xl p-6">
              💼
              <p className="mt-3">
                Professionals
              </p>
            </div>

            <div className="border border-slate-800 rounded-2xl p-6">
              🚀
              <p className="mt-3">
                Entrepreneurs
              </p>
            </div>

            <div className="border border-slate-800 rounded-2xl p-6">
              🏢
              <p className="mt-3">
                Organizations
              </p>
            </div>

          </div>

        </div>

        {/* Services */}

        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-10 mb-16">

          <h2 className="text-3xl font-bold text-center mb-10">
            How We Can Help
          </h2>

          <div className="grid md:grid-cols-2 gap-6">

            <div className="border border-slate-800 rounded-2xl p-6">
              AI Learning Programs
            </div>

            <div className="border border-slate-800 rounded-2xl p-6">
              NxZenAI Studio Access
            </div>

            <div className="border border-slate-800 rounded-2xl p-6">
              Industry Challenge Labs
            </div>

            <div className="border border-slate-800 rounded-2xl p-6">
              AI for Organizations
            </div>

          </div>

        </div>

        {/* CTA */}

        <div className="text-center">

          <h2 className="text-4xl font-bold mb-4">
            Ready to Begin?
          </h2>

          <p className="text-slate-400 mb-8">
            Schedule a consultation and discover
            the right AI learning path for you.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4">

            <Link
              href="/demo"
              className="
                bg-blue-600
                hover:bg-blue-700
                px-8
                py-4
                rounded-xl
                font-semibold
                transition
              "
            >
              Book Studio Demo
            </Link>

            <Link
              href="/programs"
              className="
                border
                border-slate-700
                px-8
                py-4
                rounded-xl
                hover:bg-slate-900
                transition
              "
            >
              Explore Programs
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}