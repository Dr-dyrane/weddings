#!/usr/bin/env node

const configuredOrigin =
  process.env.WEDDINGS_PRODUCTION_ORIGIN ?? "https://weddings.dyrane.tech";
const origin = new URL(configuredOrigin);
origin.pathname = "/";
origin.search = "";
origin.hash = "";

const expectedOrigin = origin.href.replace(/\/$/u, "");
const timeoutMs = Number.parseInt(
  process.env.WEDDINGS_PRODUCTION_TIMEOUT_MS ?? "20000",
  10,
);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function contentType(response) {
  return response.headers.get("content-type")?.toLowerCase() ?? "";
}

function isPng(data) {
  return (
    data.byteLength >= 8 &&
    data[0] === 0x89 &&
    data[1] === 0x50 &&
    data[2] === 0x4e &&
    data[3] === 0x47 &&
    data[4] === 0x0d &&
    data[5] === 0x0a &&
    data[6] === 0x1a &&
    data[7] === 0x0a
  );
}

async function request(pathname) {
  const url = new URL(pathname, origin);
  const response = await fetch(url, {
    headers: {
      Accept: "*/*",
      "User-Agent": "Dyrane-Weddings-Production-Smoke/1.0",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = new Uint8Array(await response.arrayBuffer());

  assert(
    response.ok,
    `${url.pathname} returned ${response.status} ${response.statusText}`,
  );

  return { data, response, url };
}

async function checkHtml(pathname) {
  const result = await request(pathname);
  assert(
    contentType(result.response).includes("text/html"),
    `${pathname} did not return HTML`,
  );
  assert(result.data.byteLength > 500, `${pathname} returned an incomplete page`);
}

async function checkPng(pathname, minimumBytes = 500) {
  const result = await request(pathname);
  assert(
    contentType(result.response).includes("image/png"),
    `${pathname} did not return image/png`,
  );
  assert(isPng(result.data), `${pathname} did not return a valid PNG signature`);
  assert(
    result.data.byteLength > minimumBytes,
    `${pathname} returned an unexpectedly small PNG`,
  );
}

const checks = [
  {
    name: "root experience",
    run: () => checkHtml("/"),
  },
  {
    name: "package enquiry",
    run: () => checkHtml("/start"),
  },
  {
    name: "yardstick invitation",
    run: () => checkHtml("/the_ogranyas"),
  },
  {
    name: "celebration hub",
    run: () => checkHtml("/the_ogranyas/celebration"),
  },
  {
    name: "192px app icon",
    run: () => checkPng("/the_ogranyas/icon/192", 1_000),
  },
  {
    name: "512px app icon",
    run: () => checkPng("/the_ogranyas/icon/512", 2_000),
  },
  {
    name: "root share card",
    run: () => checkPng("/card", 2_000),
  },
  {
    name: "yardstick share card",
    run: () => checkPng("/the_ogranyas/card/3", 2_000),
  },
  {
    name: "wedding manifest",
    run: async () => {
      const result = await request("/the_ogranyas/manifest.webmanifest");
      assert(
        contentType(result.response).includes("application/manifest+json"),
        "manifest route returned the wrong content type",
      );
      const manifest = JSON.parse(new TextDecoder().decode(result.data));
      assert(manifest.start_url === "/the_ogranyas/", "manifest start_url drifted");
      assert(Array.isArray(manifest.icons) && manifest.icons.length === 3, "manifest icons are incomplete");
    },
  },
  {
    name: "calendar artifact",
    run: async () => {
      const result = await request("/the_ogranyas/calendar");
      const calendar = new TextDecoder().decode(result.data);
      assert(
        contentType(result.response).includes("text/calendar"),
        "calendar route returned the wrong content type",
      );
      assert(calendar.includes("BEGIN:VCALENDAR"), "calendar artifact is invalid");
      assert(calendar.includes("END:VCALENDAR"), "calendar artifact is incomplete");
    },
  },
  {
    name: "crawler policy",
    run: async () => {
      const result = await request("/robots.txt");
      const policy = new TextDecoder().decode(result.data);
      assert(policy.includes("Disallow: /api/"), "robots.txt exposes API routes");
      assert(policy.includes("Disallow: /*/invite/"), "robots.txt does not protect personalized routes");
      assert(policy.includes(`${expectedOrigin}/sitemap.xml`), "robots.txt does not advertise the canonical sitemap");
    },
  },
  {
    name: "canonical sitemap",
    run: async () => {
      const result = await request("/sitemap.xml");
      const sitemap = new TextDecoder().decode(result.data);
      assert(sitemap.includes(`${expectedOrigin}/the_ogranyas`), "sitemap omits the yardstick invitation");
      assert(!sitemap.includes("/invite/"), "sitemap exposes personalized invitation routes");
      assert(!sitemap.includes("/studio/"), "sitemap exposes Studio routes");
    },
  },
];

let failures = 0;
console.log(`Dyrane Weddings production smoke — ${expectedOrigin}`);

for (const check of checks) {
  const startedAt = performance.now();
  try {
    await check.run();
    const duration = Math.round(performance.now() - startedAt);
    console.log(`PASS  ${check.name} (${duration}ms)`);
  } catch (error) {
    failures += 1;
    console.error(
      `FAIL  ${check.name}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

if (failures > 0) {
  console.error(`Production smoke failed: ${failures} check${failures === 1 ? "" : "s"}.`);
  process.exitCode = 1;
} else {
  console.log(`Production smoke passed: ${checks.length} checks.`);
}
