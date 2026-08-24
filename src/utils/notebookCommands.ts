import type { Cell } from "@/types/cell";

export function executionShortcut(event: {
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}): "run-next" | "run" | null {
  if (event.key !== "Enter") return null;
  if (event.shiftKey) return "run-next";
  if (event.ctrlKey || event.metaKey) return "run";
  return null;
}

export function selectCellRange(
  cells: Cell[],
  cellId: string,
  direction: "above" | "below",
): Cell[] {
  const ordered = [...cells].sort((left, right) => left.position - right.position);
  const index = ordered.findIndex((cell) => cell.id === cellId);
  if (index < 0) return [];
  return direction === "above" ? ordered.slice(0, index) : ordered.slice(index + 1);
}
