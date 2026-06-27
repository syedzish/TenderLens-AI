const COOLDOWN_MS = 12_000;
const buckets = new Map<string, number>();

export type CooldownResult = {
  ok: boolean;
  retryAfterSeconds: number;
};

export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();

  return forwardedFor || realIp || "local";
}

export function checkCooldown(key: string, now = Date.now()): CooldownResult {
  const lastRequest = buckets.get(key) ?? 0;
  const elapsed = now - lastRequest;

  if (elapsed < COOLDOWN_MS) {
    return {
      ok: false,
      retryAfterSeconds: Math.ceil((COOLDOWN_MS - elapsed) / 1000),
    };
  }

  buckets.set(key, now);

  return {
    ok: true,
    retryAfterSeconds: 0,
  };
}
