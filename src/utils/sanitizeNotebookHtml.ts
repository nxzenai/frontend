import DOMPurify from "dompurify";

interface Sanitizer {
  sanitize: (dirty: string, config?: Record<string, unknown>) => string;
}

export function sanitizeNotebookHtml(html: string, sanitizer: Sanitizer = DOMPurify): string {
  const sanitized = sanitizer.sanitize(html, {
    FORBID_TAGS: ["script", "iframe", "object", "embed", "link", "meta", "base", "form"],
    FORBID_ATTR: ["srcdoc", "style"],
  });

  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'"><style>body{font-family:system-ui,sans-serif;color:#111;margin:0}table{border-collapse:collapse}th,td{border:1px solid #d1d5db;padding:.4rem}</style></head><body>${sanitized}</body></html>`;
}
