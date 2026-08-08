const FALLBACK_ORIGIN = "https://weddings.dyrane.tech";

function withProtocol(value: string) {
  return /^https?:\/\//.test(value) ? value : `https://${value}`;
}

export function getSiteOrigin() {
  const previewOrigin =
    process.env.VERCEL_ENV === "preview" ? process.env.VERCEL_URL : undefined;
  const value =
    previewOrigin ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    FALLBACK_ORIGIN;

  return new URL(withProtocol(value));
}
