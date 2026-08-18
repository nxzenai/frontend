export class SerializedSaveQueue {
  private readonly queues = new Map<string, Promise<void>>();

  enqueue(key: string, operation: () => Promise<void>): Promise<void> {
    const previous = this.queues.get(key) ?? Promise.resolve();
    const current = previous.catch(() => undefined).then(operation);
    this.queues.set(key, current);
    void current.finally(() => {
      if (this.queues.get(key) === current) this.queues.delete(key);
    }).catch(() => undefined);
    return current;
  }

  get pending(): boolean {
    return this.queues.size > 0;
  }
}
