import "server-only";

import { getSiteOrigin } from "@/domains/weddings/site-origin";

type StaticAssetBinding = {
  fetch(request: Request): Promise<Response>;
};

type AssetReadResult =
  | { data: ArrayBuffer; error?: never }
  | { data?: never; error: string };

function getStaticAssetBinding() {
  return (
    globalThis as typeof globalThis & {
      __dyraneEventBindings?: { ASSETS?: StaticAssetBinding };
    }
  ).__dyraneEventBindings?.ASSETS;
}

function isLocalOrigin(url: URL) {
  return (
    url.hostname === "localhost" ||
    url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]"
  );
}

function uniqueAssetUrls(pathname: string, requestUrl: string) {
  const requestAssetUrl = new URL(pathname, requestUrl);
  const canonicalAssetUrl = new URL(pathname, getSiteOrigin());
  const candidates = isLocalOrigin(requestAssetUrl)
    ? [requestAssetUrl, canonicalAssetUrl]
    : [canonicalAssetUrl, requestAssetUrl];
  const seen = new Set<string>();

  return candidates.filter((candidate) => {
    if (seen.has(candidate.href)) return false;
    seen.add(candidate.href);
    return true;
  });
}

function hasHtmlSignature(data: ArrayBuffer) {
  const sample = new TextDecoder()
    .decode(new Uint8Array(data, 0, Math.min(data.byteLength, 96)))
    .trimStart()
    .toLowerCase();

  return sample.startsWith("<!doctype html") || sample.startsWith("<html");
}

async function readAssetResponse(
  response: Response,
  label: string,
): Promise<AssetReadResult> {
  if (!response.ok) {
    return { error: `${label} returned ${response.status}` };
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  const data = await response.arrayBuffer();

  if (data.byteLength === 0) {
    return { error: `${label} returned an empty body` };
  }

  if (
    contentType.includes("text/html") ||
    contentType.includes("application/xhtml+xml") ||
    hasHtmlSignature(data)
  ) {
    return { error: `${label} returned HTML instead of a binary asset` };
  }

  return { data };
}

export function isOpenTypeFontData(data: ArrayBuffer) {
  if (data.byteLength < 4) return false;

  const bytes = new Uint8Array(data, 0, 4);
  if (bytes[0] === 0x00 && bytes[1] === 0x01 && bytes[2] === 0x00 && bytes[3] === 0x00) {
    return true;
  }

  const signature = String.fromCharCode(...bytes);
  return ["OTTO", "true", "typ1", "wOFF", "wOF2"].includes(signature);
}

export function fetchRuntimeAsset(pathname: string, requestUrl: string) {
  const request = new Request(new URL(pathname, requestUrl));
  const assets = getStaticAssetBinding();

  if (assets) return assets.fetch(request);

  const [assetUrl] = uniqueAssetUrls(pathname, requestUrl);
  return fetch(assetUrl, {
    cache: "force-cache",
    redirect: "follow",
  });
}

export async function readRuntimeAsset(pathname: string, requestUrl: string) {
  const failures: string[] = [];
  const assets = getStaticAssetBinding();

  if (assets) {
    try {
      const boundUrl = new URL(pathname, requestUrl);
      const result = await readAssetResponse(
        await assets.fetch(new Request(boundUrl)),
        `asset binding ${boundUrl.pathname}`,
      );
      if (result.data) return result.data;
      failures.push(result.error);
    } catch (error) {
      failures.push(
        `asset binding failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  }

  for (const assetUrl of uniqueAssetUrls(pathname, requestUrl)) {
    try {
      const result = await readAssetResponse(
        await fetch(assetUrl, {
          cache: "force-cache",
          redirect: "follow",
        }),
        `${assetUrl.origin}${assetUrl.pathname}`,
      );
      if (result.data) return result.data;
      failures.push(result.error);
    } catch (error) {
      failures.push(
        `${assetUrl.origin}${assetUrl.pathname} failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      );
    }
  }

  throw new Error(
    `Unable to load runtime asset ${pathname}. ${failures.join("; ")}`,
  );
}

export async function readRuntimeFontAsset(
  pathname: string,
  requestUrl: string,
) {
  const data = await readRuntimeAsset(pathname, requestUrl);

  if (!isOpenTypeFontData(data)) {
    throw new Error(`Runtime font ${pathname} is not valid OpenType font data.`);
  }

  return data;
}
