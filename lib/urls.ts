export function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Hostname encoded into printed QR images. Must stay online as long as the stickers exist. */
export function qrBaseUrl(): string {
  return stripTrailingSlash(
    process.env.QR_BASE_URL || process.env.BASE_URL || "http://localhost:3000"
  );
}

/** Public site URL for /u/ pages and /q/ redirects. Set APP_URL on the server. */
export function appBaseUrl(): string {
  return stripTrailingSlash(
    process.env.APP_URL || process.env.BASE_URL || "http://localhost:3000"
  );
}

export function qrPublicUrl(token: string): string {
  return `${qrBaseUrl()}/q/${token}`;
}

export function defaultDestination(token: string): string {
  return `${appBaseUrl()}/u/${token}`;
}

export function resolveDestination(token: string): string {
  return defaultDestination(token);
}
