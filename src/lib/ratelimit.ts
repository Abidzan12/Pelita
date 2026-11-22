import { createHmac, randomBytes } from "node:crypto";

type Bucket = {
  count: number;
  resetAt: number;
};

const requestBuckets = new Map<string, Bucket>();
const failureBuckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;
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
  requestBuckets.clear();
  failureBuckets.clear();
}

function pruneMap(map: Map<string, Bucket>, now: number): void {
  if (map.size <= MAX_BUCKETS) {
    return;
  }
  for (const [bucketKey, bucket] of map) {
    if (bucket.resetAt <= now) {
      map.delete(bucketKey);
    }
  }
  for (const bucketKey of map.keys()) {
    if (map.size <= MAX_BUCKETS) {
      break;
    }
    map.delete(bucketKey);
  }
}

function hmacKey(value: string): string {
  const secret = process.env.SESSION_SECRET
    ? Buffer.from(process.env.SESSION_SECRET, "base64")
    : fallbackSecret;
  return createHmac("sha256", secret).update(`${salt}:${value}`).digest("hex");
}

function requestValue(request: Request): string {
  // Header ini harus diisi atau ditimpa reverse proxy (lihat docs/DEPLOY.md).
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) {
    return realIp;
  }
  // Entri terakhir ditambahkan proxy terdekat; entri pertama bisa dari klien.
  const forwarded = request.headers.get("x-forwarded-for");
  const nearest = forwarded?.split(",").pop()?.trim();
  return nearest || "tidak-diketahui";
}

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

function isBlocked(
  map: Map<string, Bucket>,
  key: string,
  limit: number,
  now: number,
): RateLimitResult | null {
  const bucket = map.get(key);
  if (!bucket || bucket.resetAt <= now || bucket.count < limit) {
    return null;
  }
  return {
    allowed: false,
    retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  };
}

function consumeFrom(
  map: Map<string, Bucket>,
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  rotateSaltIfNeeded();
  const now = Date.now();
  pruneMap(map, now);

  const bucket = map.get(key);

  if (!bucket || bucket.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + windowMs });
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
  rotateSaltIfNeeded();
  const now = Date.now();
  const clientKey = `${namespace}:${hmacKey(requestValue(request))}`;
  const blockedClient = isBlocked(requestBuckets, clientKey, limit, now);
  if (blockedClient) {
    return blockedClient;
  }

  // Periksa batas global sebelum menyisipkan bucket baru agar banjir IP palsu tidak
  // menumbuhkan atau mengevict tabel saat batas global sudah penuh.
  const globalKey = `${namespace}:semua`;
  const globalLimit = limit * 20;
  const blockedGlobal = isBlocked(requestBuckets, globalKey, globalLimit, now);
  if (blockedGlobal) {
    return blockedGlobal;
  }

  const client = consumeFrom(requestBuckets, clientKey, limit, windowMs);
  if (!client.allowed) {
    return client;
  }
  const global = consumeFrom(requestBuckets, globalKey, globalLimit, windowMs);
  return global.allowed ? client : global;
}

export function limitValue(
  namespace: string,
  value: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  return consumeFrom(requestBuckets, `${namespace}:${hmacKey(value)}`, limit, windowMs);
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
  const bucket = failureBuckets.get(`${namespace}:${hmacKey(value)}`);
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

export function consumeFailureSlot(
  namespace: string,
  value: string,
  limit: number,
  windowMs: number,
): FailureStatus {
  rotateSaltIfNeeded();
  const now = Date.now();
  pruneMap(failureBuckets, now);
  const key = `${namespace}:${hmacKey(value)}`;
  const bucket = failureBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    failureBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, retryAfterSeconds: 0 };
  }
  if (bucket.count >= limit) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  bucket.count += 1;
  return { limited: false, retryAfterSeconds: 0 };
}

export function releaseFailureSlot(namespace: string, value: string): void {
  const key = `${namespace}:${hmacKey(value)}`;
  const bucket = failureBuckets.get(key);
  if (!bucket) {
    return;
  }
  if (bucket.count <= 1) {
    failureBuckets.delete(key);
    return;
  }
  bucket.count -= 1;
}

export function recordFailure(namespace: string, value: string, windowMs: number): void {
  rotateSaltIfNeeded();
  const now = Date.now();
  pruneMap(failureBuckets, now);
  const key = `${namespace}:${hmacKey(value)}`;
  const bucket = failureBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    failureBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
}

export function clearFailures(namespace: string, value: string): void {
  failureBuckets.delete(`${namespace}:${hmacKey(value)}`);
}
