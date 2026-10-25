/**
 * Lightweight in-process event dispatcher.
 *
 * Usage:
 *   eventBus.on('order.paid', async (order) => { ... });
 *   await eventBus.emit('order.paid', orderDoc);
 *
 * Listeners run concurrently via Promise.allSettled so one
 * failing listener never blocks the others.
 */

type Listener<T = unknown> = (payload: T) => Promise<void> | void;

class EventBus {
  private listeners = new Map<string, Listener[]>();

  on<T = unknown>(event: string, fn: Listener<T>): void {
    const existing = this.listeners.get(event) ?? [];
    existing.push(fn as Listener);
    this.listeners.set(event, existing);
  }

  off(event: string, fn: Listener): void {
    const existing = this.listeners.get(event);
    if (!existing) return;
    this.listeners.set(
      event,
      existing.filter((l) => l !== fn)
    );
  }

  async emit<T = unknown>(event: string, payload: T): Promise<void> {
    const fns = this.listeners.get(event);
    if (!fns || fns.length === 0) return;

    const results = await Promise.allSettled(fns.map((fn) => fn(payload)));

    // Log failures but never throw — the webhook must always return 200
    for (const r of results) {
      if (r.status === 'rejected') {
        console.error(`[EventBus] Listener failed for "${event}":`, r.reason);
      }
    }
  }
}

// Singleton — shared across the entire server process
export const eventBus = new EventBus();
