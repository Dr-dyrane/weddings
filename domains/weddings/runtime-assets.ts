import "server-only";

type StaticAssetBinding = {
  fetch(request: Request): Promise<Response>;
};

function getStaticAssetBinding() {
  return (
    globalThis as typeof globalThis & {
      __dyraneEventBindings?: { ASSETS?: StaticAssetBinding };
    }
  ).__dyraneEventBindings?.ASSETS;
}

export function fetchRuntimeAsset(pathname: string, requestUrl: string) {
  const request = new Request(new URL(pathname, requestUrl));
  const assets = getStaticAssetBinding();
  return assets ? assets.fetch(request) : fetch(request);
}

export async function readRuntimeAsset(pathname: string, requestUrl: string) {
  const response = await fetchRuntimeAsset(pathname, requestUrl);

  if (!response.ok) {
    throw new Error(`Unable to load runtime asset: ${pathname}`);
  }

  return response.arrayBuffer();
}
