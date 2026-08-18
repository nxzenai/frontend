export interface DraftCell {
  id: string;
  source: string;
  position: number;
}

export async function persistThenRun(
  cellId: string,
  source: string,
  save: (cellId: string, source: string) => Promise<void>,
  run: (cellId: string) => Promise<void>,
): Promise<void> {
  await save(cellId, source);
  await run(cellId);
}

export async function flushDraftsBeforeRun(
  cells: DraftCell[],
  save: (cellId: string, source: string) => Promise<void>,
  runAll: () => Promise<void>,
): Promise<void> {
  const ordered = [...cells].sort((left, right) => left.position - right.position);
  await Promise.all(ordered.map((cell) => save(cell.id, cell.source)));
  await runAll();
}
