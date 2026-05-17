import { Injectable } from '@nestjs/common';

type CacheEntry = {
  expiresAt: number;
  value: unknown;
};

@Injectable()
export class CacheService {
  private readonly store = new Map<string, CacheEntry>();

  async getOrSet<T>(
    key: string,
    ttlMs: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttlMs);
    return value;
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);

    if (!entry || entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, {
      expiresAt: Date.now() + ttlMs,
      value,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  invalidateByPrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
      }
    }
  }

  clear(): void {
    this.store.clear();
  }
}
