const buckets = new Map<string, { count: number; expires: number }>();

export const enforceRateLimit = (key: string, limit = 10, windowMs = 60_000) => {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.expires < now) {
    buckets.set(key, { count: 1, expires: now + windowMs });
    return;
  }

  if (current.count >= limit) {
    throw new Error("Rate limit excedido. Intenta nuevamente en unos segundos.");
  }

  current.count += 1;
  buckets.set(key, current);
};
