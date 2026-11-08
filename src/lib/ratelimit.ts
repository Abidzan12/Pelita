import { createHmac, randomBytes } from "node:crypto";

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const fallbackSecret = randomBytes(32);
let salt = randomBytes(16).toString("hex");
let saltDay = currentDay();

function currentDay(): string {
  return new Date().toISOString().slice(0, 10);
}

function rotateSaltIfNeeded(): void {
  const today = currentDay();
  if (today === saltDay) {
    return;
  }
  salt = randomBytes(16).toString("hex");
  saltDay = today;
  buckets.clear();
}

function clientKey(request: Request): string {
  // IP hanya dipakai untuk hash di memori, tidak pernah disimpan atau di-log.
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "tidak-diketahui";
  const secret = process.env.SESSION_SECRET
    ? Buffer.from(process.env.SESSION_SECRET, "base64")
    : fallbackSecret;
  return createHmac("sha256", secret).update(`${salt}:${ip}`).digest("hex");
}

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export function limitRequest(
  request: Request,
  namespace: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  rotateSaltIfNeeded();

  if (buckets.size > 10_000) {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }

  const key = `${namespace}:${clientKey(request)}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}
