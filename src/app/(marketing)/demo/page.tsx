"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "",
    program_interest: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      await api.post("/api/leads/", formData);

      setSuccess(true);

      setFormData({
        name: "",
        email: "",
        phone: "",
        profession: "",
        program_interest: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to submit form");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Hero */}
      <section className="py-20 px-6">

        <div className="max-w-4xl mx-auto text-center">

          <span className="inline-block px-4 py-2 rounded-full border border-blue-500 text-blue-400 text-sm mb-6">
            FREE AI CAREER CONSULTATION
          </span>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Start Your AI Journey
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Talk to our mentors, understand your learning path,
            and discover how AI, Data Science and Generative AI
            can accelerate your career.
          </p>

        </div>

      </section>
      {/* Studio Workflow */}

<section className="pb-20 px-6">

  <div className="max-w-6xl mx-auto">

    <h2 className="text-4xl font-bold text-center mb-4">
      How NxZenAI Studio Works
    </h2>

    <p className="text-slate-400 text-center max-w-3xl mx-auto mb-12">
      Learn AI through practical experimentation,
      industry challenge labs and guided learning.
    </p>

    <div className="grid md:grid-cols-5 gap-6">

      {[
        "Upload Dataset",
        "Train Model",
        "Compare Experiments",
        "Run Predictions",
        "Analyze Results",
      ].map((item) => (
        <div
          key={item}
          className="
            bg-slate-950
            border
            border-slate-800
            rounded-2xl
            p-6
            text-center
            hover:border-blue-500
            transition
          "
        >
          <p className="font-medium">
            {item}
          </p>
        </div>
      ))}

    </div>

  </div>

</section>

{/* Studio Features */}

<section className="pb-20 px-6">

  <div className="max-w-6xl mx-auto">

    <h2 className="text-4xl font-bold text-center mb-12">
      What You'll Learn
    </h2>

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

      {[
        "Dataset Management",
        "Machine Learning",
        "Experiment Tracking",
        "Analytics & Insights",
      ].map((feature) => (
        <div
          key={feature}
          className="
            bg-slate-950
            border
            border-slate-800
            rounded-2xl
            p-6
            text-center
          "
        >
          {feature}
        </div>
      ))}

    </div>

  </div>

</section>

      {/* Form Section */}
      <section className="pb-24 px-6">

        <div className="max-w-3xl mx-auto">

          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl">

            {success && (
              <div className="mb-6 p-4 rounded-xl border border-green-500 bg-green-900/20 text-green-300">
                ✅ Thank you! Your demo request has been submitted successfully.
                Our team will contact you shortly.
              </div>
            )}

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">

              <div className="border border-slate-800 rounded-xl p-4 text-center">
                <div className="text-green-400 text-lg mb-2">✓</div>
                <p className="text-sm text-slate-300">
                  Free Consultation
                </p>
              </div>

              <div className="border border-slate-800 rounded-xl p-4 text-center">
                <div className="text-green-400 text-lg mb-2">✓</div>
                <p className="text-sm text-slate-300">
                  Career Guidance
                </p>
              </div>

              <div className="border border-slate-800 rounded-xl p-4 text-center">
                <div className="text-green-400 text-lg mb-2">✓</div>
                <p className="text-sm text-slate-300">
                  Personalized Roadmap
                </p>
              </div>

            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              <input
                type="text"
                name="name"
                required
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-black border border-slate-700 rounded-xl px-4 py-4 text-white"
              />

              <input
                type="email"
                name="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-black border border-slate-700 rounded-xl px-4 py-4 text-white"
              />

              <input
                type="tel"
                name="phone"
                required
                placeholder="Phone Number"
                maxLength={10}
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-black border border-slate-700 rounded-xl px-4 py-4 text-white"
              />

              <select
                name="profession"
                required
                value={formData.profession}
                onChange={handleChange}
                className="w-full bg-black border border-slate-700 rounded-xl px-4 py-4 text-white"
              >
                <option value="">Select Profession</option>
                <option>Student</option>
                <option>Working Professional</option>
                <option>Career Switcher</option>
                <option>Entrepreneur</option>
              </select>

              <select
                name="program_interest"
                required
                value={formData.program_interest}
                onChange={handleChange}
                className="w-full bg-black border border-slate-700 rounded-xl px-4 py-4 text-white"
              >
                <option value="">Select Course</option>
                <option>AI Foundations</option>
                <option>AI Engineering</option>
                <option>Enterprise AI & Agentic Systems</option>
                <option>AI for Organizations</option>
                <option>Not Sure Yet</option>
              </select>

              <textarea
                rows={5}
                name="message"
                placeholder="Tell us about your goals..."
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-black border border-slate-700 rounded-xl px-4 py-4 text-white"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 transition py-4 rounded-xl font-semibold text-lg"
              >
                {loading
                  ? "Submitting..."
                  : "Schedule My Free AI Consultation"}
              </button>

            </form>

          </div>

        </div>

      </section>

    </main>
  );
}