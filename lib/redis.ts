import { Redis } from "@upstash/redis";

export interface RedisInterface {
  get<T = unknown>(key: string): Promise<T | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(key: string, value: unknown, opts?: { nx?: boolean; ex?: number }): Promise<any>;
  del(...keys: string[]): Promise<number>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zadd(key: string, ...args: any[]): Promise<number>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zrange(key: string, min: unknown, max: unknown, opts?: { rev?: boolean }): Promise<any[]>;
  zrem(key: string, ...members: string[]): Promise<number>;
}

// Redis が未設定の場合のインメモリ fallback（再起動でデータはリセット）
class MemoryRedis implements RedisInterface {
  private kv = new Map<string, string>();
  private zsets = new Map<string, { score: number; member: string }[]>();

  async get<T>(key: string): Promise<T | null> {
    const val = this.kv.get(key);
    if (val === undefined) return null;
    try { return JSON.parse(val) as T; } catch { return val as unknown as T; }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async set(key: string, value: unknown, opts?: { nx?: boolean; ex?: number }): Promise<any> {
    if (opts?.nx && this.kv.has(key)) return null;
    this.kv.set(key, typeof value === "string" ? value : JSON.stringify(value));
    return "OK";
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const k of keys) { if (this.kv.delete(k)) count++; }
    return count;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async zadd(key: string, ...args: any[]): Promise<number> {
    if (!this.zsets.has(key)) this.zsets.set(key, []);
    const set = this.zsets.get(key)!;
    let count = 0;
    for (const arg of args) {
      if (arg && typeof arg === "object" && "score" in arg && "member" in arg) {
        const { score, member } = arg as { score: number; member: string };
        const idx = set.findIndex(x => x.member === member);
        if (idx >= 0) { set[idx].score = score; } else { set.push({ score, member }); count++; }
      }
    }
    set.sort((a, b) => a.score - b.score);
    return count;
  }

  async zrange(key: string, _min: unknown, _max: unknown, opts?: { rev?: boolean }): Promise<string[]> {
    const set = this.zsets.get(key) ?? [];
    const ordered = opts?.rev ? [...set].reverse() : set;
    return ordered.map(x => x.member);
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    const set = this.zsets.get(key);
    if (!set) return 0;
    let count = 0;
    for (const m of members) {
      const idx = set.findIndex(x => x.member === m);
      if (idx >= 0) { set.splice(idx, 1); count++; }
    }
    return count;
  }
}

const isRedisConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
);

export const redis: RedisInterface = isRedisConfigured
  ? (new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }) as unknown as RedisInterface)
  : new MemoryRedis();

if (!isRedisConfigured && process.env.NODE_ENV !== "test") {
  console.warn(
    "[Synapse] Upstash Redis 未設定 → インメモリモードで動作します（再起動でデータはリセットされます）"
  );
}
