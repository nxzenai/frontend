"use client";

import { useEffect, useRef, useState } from "react";
import { submitMarketingLead } from "@/lib/marketingApi";
import { buildTrainingRegistration, experiences, professions, programs } from "@/lib/trainingRegistration";

function nextThreeSaturdays() {
  const today = new Date();
  const saturday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  saturday.setDate(saturday.getDate() + (6 - saturday.getDay() + 7) % 7);
  return Array.from({ length: 3 }, (_, index) => {
    const date = new Date(saturday);
    date.setDate(date.getDate() + index * 7);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return { value: `${year}-${month}-${day}`, label: `${day}-${month}-${year}` };
  });
}

export default function TrainingRegistrationForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const [saturdays, setSaturdays] = useState<ReturnType<typeof nextThreeSaturdays>>([]);
  const [preferredDate, setPreferredDate] = useState("");

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function refreshDates() {
      const dates = nextThreeSaturdays();
      setSaturdays(dates);
      setPreferredDate(value => dates.some(date => date.value === value) ? value : "");
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      timer = setTimeout(refreshDates, midnight.getTime() - now.getTime());
    }
    refreshDates();
    return () => clearTimeout(timer);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    try {
      const payload = buildTrainingRegistration(new FormData(event.currentTarget));
      if (payload.preferred_demo_date && !nextThreeSaturdays().some(date => date.value === payload.preferred_demo_date)) {
        setPreferredDate("");
        setSaturdays(nextThreeSaturdays());
        throw new Error("Please select one of the next three Saturdays.");
      }
      submitting.current = true;
      setStatus("loading");
      await submitMarketingLead(payload);
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration could not be submitted. Please try again.");
      setStatus("idle");
    } finally {
      submitting.current = false;
    }
  }

  if (status === "success") return <div className="mk-contact-form" role="status"><h2 className="text-2xl font-semibold">Thank you for registering.</h2><p className="mt-4 text-slate-300">Our team will review your interests and contact you about the next steps. Your confirmation email will follow shortly.</p></div>;

  return <form className="mk-contact-form" onSubmit={submit}>
    <p className="text-sm text-slate-400">Fields marked * are required.</p>
    <fieldset disabled={status === "loading"} className="mk-form-grid">
      <legend className="sr-only">Candidate registration details</legend>
      <label><span>Full Name *</span><input name="name" required maxLength={200} autoComplete="name" /></label>
      <label><span>Email Address *</span><input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
      <label><span>Mobile Number *</span><input name="phone" type="tel" required maxLength={25} autoComplete="tel" placeholder="+91 90000 00000" /></label>
      <label><span>City / Location *</span><input name="city" required maxLength={200} autoComplete="address-level2" /></label>
      <label><span>Profession *</span><select name="profession" required defaultValue=""><option value="">Select profession</option>{professions.map(value => <option key={value}>{value}</option>)}</select></label>
      <label><span>Course / Program Interested In *</span><select name="program_interest" required defaultValue=""><option value="">Select program</option>{programs.map(value => <option key={value}>{value}</option>)}</select></label>
      <label><span>Current Qualification / Role *</span><input name="qualification" required maxLength={300} /></label>
      <label><span>College / Company Name</span><input name="organization" maxLength={300} autoComplete="organization" /></label>
      <label><span>Experience Level</span><select name="experience" defaultValue=""><option value="">Select experience (optional)</option>{experiences.map(value => <option key={value}>{value}</option>)}</select></label>
      <label><span>Preferred Demo / Consultation Date</span><select name="preferred_demo_date" value={preferredDate} onChange={event => setPreferredDate(event.target.value)}><option value="">Select Saturday (optional)</option>{saturdays.map(date => <option key={date.value} value={date.value}>{date.label}</option>)}</select><small className="text-slate-400">Optional. Our team will confirm availability.</small></label>
      <label><span>How did you hear about NxZenAI?</span><input name="referral_source" maxLength={300} /></label>
    </fieldset>
    <label><span>Message / Expectations</span><textarea name="message" rows={4} maxLength={4000} disabled={status === "loading"} /></label>
    <label className="!flex !flex-row items-start gap-3"><input className="!w-4 mt-1" type="checkbox" name="consent" required disabled={status === "loading"} /><span>I consent to NxZenAI contacting me about training, demos, and consultations. *</span></label>
    {error && <p className="mk-form-error" role="alert">{error}</p>}
    <button type="submit" className="mk-button-primary" disabled={status === "loading"}>{status === "loading" ? "Submitting…" : "Register your interest"}</button>
  </form>;
}
