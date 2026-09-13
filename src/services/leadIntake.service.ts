import api from "@/lib/studioApi";
import type { IntakeFilters, IntakeLead, IntakeList, VerificationStatus } from "@/types/leadIntake";

export const leadIntake = {
  async list(filters: IntakeFilters): Promise<IntakeList> {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== ""));
    return (await api.get("/leads/", { params })).data;
  },
  async get(id: string): Promise<IntakeLead> {
    return (await api.get(`/leads/${id}`)).data;
  },
  async verify(id: string, verification_status: VerificationStatus, verification_notes: string): Promise<IntakeLead> {
    return (await api.patch(`/leads/${id}/verification`, { verification_status, verification_notes })).data;
  },
  async push(id: string): Promise<{ lead: IntakeLead; pushed: boolean }> {
    return (await api.post(`/leads/${id}/push-to-crm`)).data;
  },
  async pushVerified(): Promise<{ pushed: number; skipped: number; failed: string[] }> {
    return (await api.post("/leads/push-verified")).data;
  },
};
