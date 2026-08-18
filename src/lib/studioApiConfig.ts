export function validateStudioApiUrl(value: string | undefined, production: boolean): string {
  if (!value) throw new Error("NEXT_PUBLIC_STUDIO_API_URL is not configured.");
  let parsed: URL;
  try { parsed = new URL(value); }
  catch { throw new Error("NEXT_PUBLIC_STUDIO_API_URL must be a valid URL."); }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("NEXT_PUBLIC_STUDIO_API_URL must use HTTP or HTTPS.");
  }
  const loopback = ["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  if (production && parsed.protocol !== "https:" && !loopback) {
    throw new Error("NEXT_PUBLIC_STUDIO_API_URL must use HTTPS in production.");
  }
  return value.replace(/\/$/, "");
}
