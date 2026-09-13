export interface MarketingLeadPayload {
  name: string;
  email: string;
  phone: string;
  profession: string;
  program_interest: string;
  preferred_demo_date: string;
  message?: string;
  source?: string;
  city?: string;
  qualification?: string;
  organization?: string;
  experience?: string;
  referral_source?: string;
  consent?: boolean;
}

export interface MarketingContactValues {
  name: string;
  email: string;
  phone: string;
  interest: string;
  message: string;
}

const marketingApiUrl = (process.env.NEXT_PUBLIC_MARKETING_API_URL ?? "").replace(/\/$/, "");

export async function submitMarketingLead(payload: MarketingLeadPayload): Promise<{ id: string; message: string }> {
  const response = await fetch(`${marketingApiUrl}/api/leads/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error("Your enquiry could not be submitted. Please try again.");
  }
  return response.json();
}

export function nextSaturdayIso(now = new Date()): string {
  const next = new Date(now);
  const days = (6 - next.getDay() + 7) % 7;
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
}

export function buildMarketingLeadPayload(
  values: MarketingContactValues,
  now = new Date(),
): MarketingLeadPayload {
  return {
    name: values.name.trim(),
    email: values.email.trim(),
    phone: values.phone.trim(),
    profession: "Website enquiry",
    program_interest: values.interest,
    preferred_demo_date: nextSaturdayIso(now),
    message: values.message.trim(),
  };
}
