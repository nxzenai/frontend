export type ProtectedRouteState = "loading" | "redirect" | "content";

export function resolveProtectedRouteState(loading: boolean, hasUser: boolean): ProtectedRouteState {
  if (loading) return "loading";
  return hasUser ? "content" : "redirect";
}
