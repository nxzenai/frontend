export function notebookLoadError(status?: number): string {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 404) return "Notebook not found or you do not have access.";
  return "Failed to load notebook.";
}
