"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { buildMarketingLeadPayload, submitMarketingLead } from "@/lib/marketingApi";

const interests = [
  "AI Foundations", "AI Engineering", "Enterprise AI & Agentic Systems",
  "AI for Organizations", "Corporate AI Training", "AI Consultation", "Not Sure Yet",
];

const emptyForm = { name: "", email: "", phone: "", interest: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    try {
      await submitMarketingLead(buildMarketingLeadPayload(form));
      setForm(emptyForm);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const update = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(current => ({ ...current, [event.target.name]: event.target.value }));

  return (
    <form className="mk-contact-form" onSubmit={submit}>
      <div className="mk-form-grid">
        <label><span>Full Name</span><input required autoComplete="name" name="name" value={form.name} onChange={update} placeholder="Your full name" /></label>
        <label><span>Email Address</span><input required autoComplete="email" type="email" name="email" value={form.email} onChange={update} placeholder="you@company.com" /></label>
        <label><span>Mobile Number</span><input required autoComplete="tel" type="tel" name="phone" value={form.phone} onChange={update} placeholder="Your mobile number" /></label>
        <label><span>What are you exploring?</span><select required name="interest" value={form.interest} onChange={update}><option value="">Select an option</option>{interests.map(item => <option key={item}>{item}</option>)}</select></label>
      </div>
      <label><span>Message</span><textarea rows={5} name="message" value={form.message} onChange={update} placeholder="Tell us about your goals, team, or AI opportunity." /></label>
      {status === "success" && <p className="mk-form-success" role="status"><CheckCircle2 size={17} />Thank you. Your enquiry has been received and our team will contact you.</p>}
      {status === "error" && <p className="mk-form-error" role="alert">Your enquiry could not be submitted. Please try again.</p>}
      <button className="mk-button-primary" disabled={status === "loading"} type="submit">{status === "loading" ? "Submitting…" : "Submit enquiry"}<ArrowRight size={16} /></button>
    </form>
  );
}
