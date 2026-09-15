export type VerificationStatus = "pending" | "verified" | "not_verified";
export interface IntakeLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  profession: string;
  program_interest: string;
  qualification?: string;
  organization?: string;
  experience?: string;
  preferred_demo_date?: string;
  referral_source?: string;
  source: string;
  message?: string;
  created_at: string;
  verification_status: VerificationStatus;
  verification_notes?: string;
  verified_by?: string;
  verified_at?: string;
  crm_status: "not_pushed" | "pushed";
  crm_lead_id?: string;
}
export interface IntakeList {
  items: IntakeLead[];
  total: number;
  page: number;
  pages: number;
  summary: Record<"total" | "pending" | "verified" | "not_verified" | "ready", number>;
  courses: string[];
  sources: string[];
}
export interface IntakeFilters {
  page: number;
  search: string;
  status: string;
  course: string;
  source: string;
  start: string;
  end: string;
}
