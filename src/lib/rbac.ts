export type UserRole =
  | "user"
  | "instructor"
  | "admin"
  | "super_admin";

export const PERMISSIONS = {
  dashboard: [
    "user",
    "instructor",
    "admin",
    "super_admin",
  ],

  python_lab: [
    "user",
    "instructor",
    "admin",
    "super_admin",
  ],

  sql_lab: [
    "user",
    "instructor",
    "admin",
    "super_admin",
  ],

  datasets: [
    "user",
    "instructor",
    "admin",
    "super_admin",
  ],

  automl: [
    "user",
    "instructor",
    "admin",
    "super_admin",
  ],

  autodl: [
    "user",
    "instructor",
    "admin",
    "super_admin",
  ],

  autonlp: [
    "user",
    "instructor",
    "admin",
    "super_admin",
  ],

  genai: [
    "user",
    "instructor",
    "admin",
    "super_admin",
  ],

  agentic_ai: [
    "user",
    "instructor",
    "admin",
    "super_admin",
  ],

  crm: [
    "admin",
    "super_admin",
  ],

  user_management: [
    "super_admin",
  ],

  platform: [
    "super_admin",
  ],
} as const;

export function canAccess(
  role: UserRole | undefined,
  module: keyof typeof PERMISSIONS
) {
  if (!role) return false;

  return (PERMISSIONS[module] as readonly UserRole[]).includes(role);
}

export function isAdmin(
  role?: UserRole
) {
  return (
    role === "admin" ||
    role === "super_admin"
  );
}

export function isSuperAdmin(
  role?: UserRole
) {
  return role === "super_admin";
}

export function isInstructor(
  role?: UserRole
) {
  return (
    role === "instructor" ||
    role === "admin" ||
    role === "super_admin"
  );
}
