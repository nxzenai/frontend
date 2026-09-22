import api from "@/lib/studioApi";

export const MODULES = [
  "dashboard", "python_lab", "sql_lab", "eda", "automl", "autodl", "autonlp",
  "genai", "agentic_ai", "crm", "leads", "user_management", "platform",
] as const;

export type Entity = Record<string, unknown> & { id: string; name?: string };
export type ManagedUser = Entity & {
  email: string; full_name: string; username: string; role: string; account_status: string;
  organization_id?: string; course_id?: string; batch_id?: string;
  allowed_modules?: string[]; denied_modules?: string[]; last_login?: string; access_end_at?: string;
};

async function get<T>(path: string, params?: Record<string, string>) {
  return (await api.get<{ data: T }>(path, { params })).data.data;
}

const userManagement = {
  overview: () => get<Record<string, number>>("/user-management/overview"),
  requests: () => get<ManagedUser[]>("/user-management/access-requests"),
  users: (params: Record<string, string> = {}) => get<ManagedUser[]>("/user-management/users", params),
  organizations: () => get<Entity[]>("/user-management/organizations"),
  courses: () => get<Entity[]>("/user-management/courses"),
  batches: () => get<Entity[]>("/user-management/batches"),
  roles: () => get<Record<string, string[]>>("/user-management/roles"),
  usage: (params: Record<string, string> = {}) => get<Record<string, unknown>>("/user-management/usage", params),
  audits: () => get<Entity[]>("/user-management/audit-logs"),
  approve: (id: string, payload: Record<string, unknown>) => api.post(`/user-management/access-requests/${id}/approve`, payload),
  reject: (id: string, reason?: string) => api.post(`/user-management/access-requests/${id}/reject`, { reason }),
  createUser: (payload: Record<string, unknown>) => api.post("/user-management/users", payload),
  bulkUsers: (users: Record<string, unknown>[]) => api.post("/user-management/users/bulk", { users }),
  updateUser: (id: string, payload: Record<string, unknown>) => api.patch(`/user-management/users/${id}`, payload),
  lifecycle: (id: string, action: string, access_end_at?: string) => api.post(`/user-management/users/${id}/lifecycle`, { action, access_end_at }),
  deleteUser: (id: string, permanent = false, confirmation?: string) => api.delete(`/user-management/users/${id}`, { params: { permanent, confirmation } }),
  createOrganization: (payload: Record<string, unknown>) => api.post("/user-management/organizations", payload),
  updateOrganization: (id: string, payload: Record<string, unknown>) => api.patch(`/user-management/organizations/${id}`, payload),
  deactivateOrganization: (id: string) => api.patch(`/user-management/organizations/${id}/deactivate`),
  reactivateOrganization: (id: string) => api.patch(`/user-management/organizations/${id}/reactivate`),
  permanentlyDeleteOrganization: (id: string, confirmation: string) => api.delete(`/user-management/organizations/${id}`, { params: { permanent: true, confirmation } }),
  createCourse: (payload: Record<string, unknown>) => api.post("/user-management/courses", payload),
  updateCourse: (id: string, payload: Record<string, unknown>) => api.patch(`/user-management/courses/${id}`, payload),
  deactivateCourse: (id: string) => api.patch(`/user-management/courses/${id}/deactivate`),
  reactivateCourse: (id: string) => api.patch(`/user-management/courses/${id}/reactivate`),
  permanentlyDeleteCourse: (id: string, confirmation: string) => api.delete(`/user-management/courses/${id}`, { params: { permanent: true, confirmation } }),
  createBatch: (payload: Record<string, unknown>) => api.post("/user-management/batches", payload),
  updateBatch: (id: string, payload: Record<string, unknown>) => api.patch(`/user-management/batches/${id}`, payload),
  deactivateBatch: (id: string) => api.patch(`/user-management/batches/${id}/deactivate`),
  reactivateBatch: (id: string) => api.patch(`/user-management/batches/${id}/reactivate`),
  permanentlyDeleteBatch: (id: string, confirmation: string) => api.delete(`/user-management/batches/${id}`, { params: { permanent: true, confirmation } }),
  track: (module: string, event: string, metadata: Record<string, unknown> = {}) => api.post("/usage/events", { module, event, metadata }),
};

export default userManagement;
