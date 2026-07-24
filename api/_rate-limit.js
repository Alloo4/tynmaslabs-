// Best-effort in-memory rate limiter. Resets on cold start and is scoped to a single
// function instance, so it does not guarantee a hard cap under distributed load — but it
// meaningfully raises the bar against a single scripted client hammering an endpoint.
// For a hard guarantee under real abuse, back this with Upstash Redis (`@upstash/ratelimit`).
const buckets = new Map();

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket && req.socket.remoteAddress || 'unknown';
}

function rateLimit(req, res, { windowMs = 60000, max = 20 } = {}) {
  const key = getClientIp(req);
  const now = Date.now();
  const bucket = buckets.get(key) || [];
  const recent = bucket.filter((t) => now - t < windowMs);

  if (recent.length >= max) {
    res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    return false;
  }

  recent.push(now);
  buckets.set(key, recent);

  // Prevent unbounded growth of the map across many distinct IPs.
  if (buckets.size > 5000) {
    const cutoff = now - windowMs;
    for (const [k, v] of buckets) {
      if (!v.some((t) => t > cutoff)) buckets.delete(k);
    }
  }

  return true;
}

module.exports = { rateLimit };
