export function normalizeAttachmentIds(ids: readonly string[] | null | undefined): string[] {
  return [...new Set((ids ?? []).filter(Boolean))];
}

export function restoreConversationAttachmentIds(activeAttachmentIds: readonly string[] | null | undefined): string[] {
  return normalizeAttachmentIds(activeAttachmentIds);
}

export function addComposerAttachment(ids: readonly string[], attachmentId: string): string[] {
  return normalizeAttachmentIds([...ids, attachmentId]);
}

export function removeComposerAttachment(ids: readonly string[], attachmentId: string): string[] {
  return normalizeAttachmentIds(ids.filter(id => id !== attachmentId));
}

export function attachmentIdsForMessage(ids: readonly string[]): string[] {
  return normalizeAttachmentIds(ids);
}

export function preserveComposerAttachmentIds(ids: readonly string[]): string[] {
  return normalizeAttachmentIds(ids);
}
