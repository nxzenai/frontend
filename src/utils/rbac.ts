export function isSuperAdmin(role?: string) {
  return role === "super_admin";
}

export function isAdmin(role?: string) {
  return role === "admin";
}

export function isUser(role?: string) {
  return role === "user";
}