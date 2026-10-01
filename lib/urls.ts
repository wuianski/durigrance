function readEnv(name: string): string {
  // Dynamic key so Next does not inline values at build time.
  // Local .env.local and the Droplet .env.local stay independent.
  return (process.env[name] ?? "").trim();
}

export function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Hostname encoded into printed QR images. Seed on the Droplet with the public domain. */
export function qrBaseUrl(): string {
  return stripTrailingSlash(
    readEnv("QR_BASE_URL") || readEnv("BASE_URL") || "http://localhost:3000"
  );
}

/** Optional public origin from env. Prefer the live request host when rendering links. */
export function appBaseUrl(): string {
  return stripTrailingSlash(
    readEnv("APP_URL") || readEnv("BASE_URL") || "http://localhost:3000"
  );
}

/** Origin of the current request (localhost locally, your domain on the Droplet). */
export async function requestOrigin(): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const forwarded = h.get("x-forwarded-proto");
  const proto =
    forwarded || (host.startsWith("localhost") || host.startsWith("127.") ? "http" : "https");
  return `${proto}://${host}`;
}

export function qrPublicUrl(token: string): string {
  return `${qrBaseUrl()}/q/${token}`;
}

export function guestPagePath(token: string): string {
  return `/u/${token}`;
}

export function guestPageUrl(token: string, origin: string): string {
  return `${stripTrailingSlash(origin)}${guestPagePath(token)}`;
}

export function defaultDestination(token: string): string {
  return `${appBaseUrl()}/u/${token}`;
}

export function resolveDestination(token: string): string {
  return defaultDestination(token);
}
