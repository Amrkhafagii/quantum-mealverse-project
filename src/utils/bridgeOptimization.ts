
/**
 * Utilities for optimizing JS-Native bridge communications
 */

// Debounce function to prevent rapid sequential calls
export function debounce<F extends (...args: any[]) => any>(
  func: F,
  waitFor: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };
}

// Batch collector for location updates
export class BatchCollector<T> {
  private batchSize: number;
  private flushInterval: number;
  private items: T[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private onFlush: (items: T[]) => void;

  constructor(options: {
    batchSize: number;
    flushInterval: number;
    onFlush: (items: T[]) => void;
  }) {
    this.batchSize = options.batchSize;
    this.flushInterval = options.flushInterval;
    this.onFlush = options.onFlush;
  }

  add(item: T): void {
    this.items.push(item);

    // Start timer if this is the first item
    if (this.items.length === 1 && !this.timer) {
      this.timer = setTimeout(() => this.flush(), this.flushInterval);
    }

    // If batch size reached, flush immediately
    if (this.items.length >= this.batchSize) {
      this.flush();
    }
  }

  flush(): void {
    if (this.items.length === 0) return;

    // Clear any existing timer
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Process the batch
    const batch = [...this.items];
    this.items = [];
    this.onFlush(batch);
  }

  clear(): void {
    this.items = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

// Local state cache for bridge communication
export class BridgeStateCache<T> {
  private cache: Map<string, T> = new Map();
  private ttl: number;
  private expiryTimes: Map<string, number> = new Map();

  constructor(ttlMs: number = 30000) { // Default 30s TTL
    this.ttl = ttlMs;
  }

  get(key: string): T | undefined {
    // Check if item exists and isn't expired
    if (this.cache.has(key)) {
      const expiryTime = this.expiryTimes.get(key) || 0;
      if (Date.now() < expiryTime) {
        return this.cache.get(key);
      } else {
        // Remove expired item
        this.cache.delete(key);
        this.expiryTimes.delete(key);
      }
    }
    return undefined;
  }

  set(key: string, value: T): void {
    this.cache.set(key, value);
    this.expiryTimes.set(key, Date.now() + this.ttl);
  }

  clear(): void {
    this.cache.clear();
    this.expiryTimes.clear();
  }

  // Update TTL for an item
  touch(key: string): boolean {
    if (this.cache.has(key)) {
      this.expiryTimes.set(key, Date.now() + this.ttl);
      return true;
    }
    return false;
  }
}
