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

function hmacKey(value: string): string {
  const secret = process.env.SESSION_SECRET
    ? Buffer.from(process.env.SESSION_SECRET, "base64")
    : fallbackSecret;
  return createHmac("sha256", secret).update(`${salt}:${value}`).digest("hex");
}

function requestValue(request: Request): string {
  // IP hanya dipakai untuk hash di memori, tidak pernah disimpan atau di-log.
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "tidak-diketahui"
  );
}

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function consume(key: string, limit: number, windowMs: number): RateLimitResult {
  rotateSaltIfNeeded();

  if (buckets.size > 10_000) {
    const now = Date.now();
    for (const [bucketKey, bucket] of buckets) {
      if (bucket.resetAt <= now) {
        buckets.delete(bucketKey);
      }
    }
  }

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

export function limitRequest(
  request: Request,
  namespace: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  return consume(`${namespace}:${hmacKey(requestValue(request))}`, limit, windowMs);
}

export function limitValue(
  namespace: string,
  value: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  return consume(`${namespace}:${hmacKey(value)}`, limit, windowMs);
}

export type FailureStatus = {
  limited: boolean;
  retryAfterSeconds: number;
};

export function peekFailures(
  namespace: string,
  value: string,
  limit: number,
): FailureStatus {
  rotateSaltIfNeeded();
  const bucket = buckets.get(`${namespace}:${hmacKey(value)}`);
  if (!bucket || bucket.resetAt <= Date.now()) {
    return { limited: false, retryAfterSeconds: 0 };
  }
  if (bucket.count < limit) {
    return { limited: false, retryAfterSeconds: 0 };
  }
  return {
    limited: true,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - Date.now()) / 1000)),
  };
}

export function recordFailure(namespace: string, value: string, windowMs: number): void {
  rotateSaltIfNeeded();
  const key = `${namespace}:${hmacKey(value)}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
}

export function clearFailures(namespace: string, value: string): void {
  buckets.delete(`${namespace}:${hmacKey(value)}`);
}
