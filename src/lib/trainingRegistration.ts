import type { MarketingLeadPayload } from "./marketingApi";

export const professions = ["Student", "Working Professional", "Entrepreneur", "Career Switcher", "Other"];
export const experiences = ["Fresher", "0–2 years", "2–5 years", "5+ years"];
export const programs = ["AI Foundations", "AI Engineering", "Enterprise AI & Agentic Systems", "AI for Organizations", "Corporate AI Training", "Not Sure Yet"];

export function buildTrainingRegistration(data: FormData): MarketingLeadPayload {
  const value = (key: string) => String(data.get(key) ?? "").trim();
  const required = ["name", "email", "phone", "city", "profession", "program_interest", "qualification"];
  if (required.some(key => !value(key))) throw new Error("Please complete all required fields.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email"))) throw new Error("Enter a valid email address.");
  const phone = value("phone");
  if (!/^\+?[0-9 ()-]+$/.test(phone) || !/^\d{10,15}$/.test(phone.replace(/\D/g, ""))) {
    throw new Error("Enter a valid mobile number with 10 to 15 digits.");
  }
  if (!professions.includes(value("profession"))) throw new Error("Select your profession.");
  if (!data.get("consent")) throw new Error("Please consent to being contacted.");
  return {
    name: value("name"), email: value("email"), phone, city: value("city"),
    profession: value("profession"), program_interest: value("program_interest"),
    qualification: value("qualification"), organization: value("organization"),
    experience: value("experience"), preferred_demo_date: value("preferred_demo_date"),
    referral_source: value("referral_source"), message: value("message"),
    source: "training_registration", consent: true,
  };
}
