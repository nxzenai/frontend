"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";

export default function DemoPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ======================================================
  // Generate Next 3 Saturdays
  // ======================================================

  const availableDemoDates = useMemo(() => {
    const dates: {
      value: string;
      label: string;
    }[] = [];

    const today = new Date();
    const current = new Date(today);

    while (dates.length < 3) {
      if (current.getDay() === 6 && current >= today) {
        dates.push({
          value: current.toISOString().split("T")[0],
          label: current.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        });
      }

      current.setDate(current.getDate() + 1);
    }

    return dates;
  }, []);

  // ======================================================
  // Form State
  // ======================================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "",
    program_interest: "",
    preferred_demo_date: "",
    message: "",
  });

  // ======================================================
  // Handle Input Change
  // ======================================================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ======================================================
  // Submit Form
  // ======================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
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
        preferred_demo_date: "",
        message: "",
      });

    } catch (error) {
      console.error(error);
      alert("Failed to submit demo request.");
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <main className="min-h-screen bg-black text-white">

  {/* Hero Section */}

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


  {/* Form */}

  <section className="pb-24 px-6">

    <div className="max-w-3xl mx-auto">

      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl">

        {success && (

          <div className="mb-6 rounded-xl border border-green-500 bg-green-900/20 p-4 text-green-300">

            ✅ Thank you! Your consultation has been booked successfully.

            <br />

            Our team will contact you shortly.

          </div>

        )}

        {/* Benefits */}

        <div className="grid md:grid-cols-3 gap-4 mb-8">

          <div className="border border-slate-800 rounded-xl p-4 text-center">

            <div className="text-green-400 text-xl mb-2">✓</div>

            <p className="text-sm text-slate-300">

              Free Consultation

            </p>

          </div>

          <div className="border border-slate-800 rounded-xl p-4 text-center">

            <div className="text-green-400 text-xl mb-2">✓</div>

            <p className="text-sm text-slate-300">

              Career Guidance

            </p>

          </div>

          <div className="border border-slate-800 rounded-xl p-4 text-center">

            <div className="text-green-400 text-xl mb-2">✓</div>

            <p className="text-sm text-slate-300">

              Personalized Roadmap

            </p>

          </div>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Name */}

          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full rounded-xl border border-slate-700 bg-black px-4 py-4 text-white focus:border-blue-500 focus:outline-none"
          />

          {/* Email */}

          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full rounded-xl border border-slate-700 bg-black px-4 py-4 text-white focus:border-blue-500 focus:outline-none"
          />

          {/* Phone */}

          <input
            type="tel"
            name="phone"
            required
            maxLength={10}
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="w-full rounded-xl border border-slate-700 bg-black px-4 py-4 text-white focus:border-blue-500 focus:outline-none"
          />

          {/* Profession */}

          <select
            name="profession"
            required
            value={formData.profession}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-black px-4 py-4 text-white"
          >

            <option value="">Select Profession</option>

            <option value="Student">Student</option>

            <option value="Working Professional">
              Working Professional
            </option>

            <option value="Career Switcher">
              Career Switcher
            </option>

            <option value="Entrepreneur">
              Entrepreneur
            </option>

          </select>

          {/* Course */}

          <select
            name="program_interest"
            required
            value={formData.program_interest}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-700 bg-black px-4 py-4 text-white"
          >

            <option value="">
              Select Course
            </option>

            <option value="AI Foundations">
              AI Foundations
            </option>

            <option value="AI Engineering">
              AI Engineering
            </option>

            <option value="Enterprise AI & Agentic Systems">
              Enterprise AI & Agentic Systems
            </option>

            <option value="AI for Organizations">
              AI for Organizations
            </option>

            <option value="Not Sure Yet">
              Not Sure Yet
            </option>

          </select>

          {/* Demo Date */}

          <div>

            <label className="block mb-2 text-sm text-slate-300">

              Preferred Demo Slot

            </label>

            <select
              required
              name="preferred_demo_date"
              value={formData.preferred_demo_date}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-700 bg-black px-4 py-4 text-white"
            >

              <option value="">
                Select Saturday
              </option>

              {availableDemoDates.map((date) => (

                <option
                  key={date.value}
                  value={date.value}
                >
                  {date.label}
                </option>

              ))}

            </select>

            <p className="mt-2 text-xs text-slate-400">

              Demo sessions are conducted only on Saturdays.
              Choose one of the next three available slots.

            </p>

          </div>

          {/* Message */}

          <textarea
            rows={5}
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us about your goals..."
            className="w-full rounded-xl border border-slate-700 bg-black px-4 py-4 text-white resize-none focus:border-blue-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-4 text-lg font-semibold transition hover:bg-blue-700 disabled:opacity-60"
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
