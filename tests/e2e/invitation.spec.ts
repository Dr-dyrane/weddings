import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { DEMO_INVITATION_TOKEN } from "../../domains/invitations/invitation";

test("the public invitation remains useful before the optional presentation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/the_ogranyas");

  const open = page.getByRole("button", { name: "Play invitation" });
  await expect(open).toBeEnabled();
  await open.click();
  await expect(
    page.getByRole("heading", { name: "You’re invited to celebrate with us." }),
  ).toBeVisible();
  await page.locator("#details").scrollIntoViewIfNeeded();
  await expect(page.locator("#details")).toContainText("The Glass House");
  await expect(page.locator("#details")).toContainText("Moon Garden");
  await expect(page.getByRole("link", { name: "Add to calendar" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /index, follow/,
  );

  const accessibility = await new AxeBuilder({ page })
    // This oversized date is incidental artwork; the adjacent semantic <time>
    // carries the same date at full contrast for assistive technology.
    .exclude(".journey-welcome-date")
    .analyze();
  const blockers = accessibility.violations.filter((violation) =>
    ["critical", "serious"].includes(violation.impact ?? ""),
  );
  expect(blockers).toEqual([]);
});

test("the live threshold contracts to the bar height before Play grows", async ({
  page,
}) => {
  await page.goto("/the_ogranyas");

  const opening = page.locator(".live-ogb-opening");
  const fill = page.locator(".live-ogb-threshold-fill");
  const label = page.locator(".live-ogb-threshold-label");

  await expect(opening).toHaveAttribute("data-phase", "collapse", {
    timeout: 10_000,
  });
  await expect
    .poll(() => fill.evaluate((element) => element.getBoundingClientRect().width))
    .toBeLessThanOrEqual(35);
  await expect
    .poll(() => fill.evaluate((element) => element.getBoundingClientRect().height))
    .toBe(34);

  await expect(opening).toHaveAttribute("data-phase", "ready");
  await expect
    .poll(() => label.evaluate((element) => element.getBoundingClientRect().width))
    .toBe(64);
  await expect(page.getByRole("button", { name: "Play invitation" })).toBeEnabled();
});

test("the public RSVP exposes a real guest response form", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/the_ogranyas");
  await page.getByRole("button", { name: "Play invitation" }).click();
  await page.locator("#rsvp").scrollIntoViewIfNeeded();

  const attending = page.getByRole("radio", { name: "Joyfully, yes" });
  await expect(attending).not.toBeChecked();
  await expect(attending).toBeEnabled();
  await page.locator("label").filter({ hasText: "Joyfully, yes" }).click();
  const name = page.getByPlaceholder("How should we welcome you?");
  await expect(name).toBeVisible();
  await name.fill("Release Guest");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("Table preference")).toBeVisible();
  const orbIsContained = await page
    .locator('.journey-rsvp-form [role="progressbar"]')
    .evaluate((orb) => {
      const orbBounds = orb.getBoundingClientRect();
      const journeyBounds = orb.closest("section")?.getBoundingClientRect();
      return Boolean(
        journeyBounds &&
          orbBounds.left >= journeyBounds.left &&
          orbBounds.right <= journeyBounds.right,
      );
    });
  expect(orbIsContained).toBe(true);
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  const submit = page.getByRole("button", { name: "Send my response" });
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(
    page.getByRole("heading", { name: "Thank you, Release Guest." }),
  ).toBeVisible();
});

test("opening and bypass actions move focus to meaningful content", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/the_ogranyas");

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.getByRole("button", { name: "Play invitation" }).click();
  await expect(page.locator("#welcome-copy")).toBeFocused();
  await expect(page.locator("main")).toHaveAttribute(
    "data-active-chapter",
    "welcome",
  );
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);

  await page.goto("/the_ogranyas");
  const skip = page.getByRole("link", {
    name: "Skip to celebration details",
  });
  await skip.focus();
  await skip.click();
  await expect(page.locator("#details")).toBeFocused();
  await expect(page.locator("main")).toHaveClass(/is-open/);
  await expect(page.locator(".live-ogb-opening")).toHaveClass(/is-hidden/);
  await expect(page.locator("body")).not.toHaveClass(/live-opening-locked/);
});

test("the no-JavaScript bypass exposes the semantic journey", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto("/the_ogranyas");
  const skip = page.getByRole("link", { name: "Skip to celebration details" });
  await skip.focus();
  await skip.press("Enter");

  await expect(page).toHaveURL(/#details$/);
  await expect(page.locator("#details")).toBeVisible();
  await expect(page.locator(".live-ogb-opening")).toBeHidden();
  await expect(page.locator("body")).not.toHaveClass(/live-opening-locked/);

  await context.close();
});

test("a personalized invitation is private and offers deliberate share choices", async ({
  page,
  request,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const response = await page.goto(
    `/the_ogranyas/invite/${DEMO_INVITATION_TOKEN}`,
  );

  await page.getByRole("button", { name: "Play invitation" }).click();
  await expect(page.getByText("For Dr. Dyrane")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  expect(response?.headers()["cache-control"]).toContain("no-store");
  expect(response?.headers()["referrer-policy"]).toBe("no-referrer");

  await page.locator("#details").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Share invitation" }).click();
  await expect(page.getByRole("button", { name: "Share public card" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Share my named card" })).toBeVisible();
  await expect(page.getByText("Named links may be cached by social apps.")).toBeVisible();

  const personalizedCardUrl = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  expect(personalizedCardUrl).not.toBeNull();
  const personalizedCard = await request.get(
    new URL(personalizedCardUrl!).pathname,
  );
  expect(personalizedCard.ok()).toBeTruthy();
  expect(personalizedCard.headers()["cache-control"]).toContain("no-store");
  expect(personalizedCard.headers()["x-robots-tag"]).toContain("noindex");
});

test("play directs the journey and guest input pauses it", async ({ page }) => {
  await page.goto("/the_ogranyas");
  const play = page.getByRole("button", { name: "Play invitation" });
  await expect(play).toBeEnabled({ timeout: 10_000 });
  await play.click();

  await expect(page.locator("main")).toHaveAttribute("data-playback", "playing");
  await expect(page.getByRole("button", { name: "Pause invitation" })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => window.scrollY), { timeout: 1_500 })
    .toBeGreaterThan(12);

  await page.mouse.wheel(0, 30);
  await expect(page.locator("main")).toHaveAttribute("data-playback", "paused");
  await expect(page.getByRole("button", { name: "Play invitation" })).toBeVisible();
  await expect(page.getByText("Scroll to enter")).toBeVisible();
});

test("reduced motion keeps authored chapter art and removes the spatial canvas", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/the_ogranyas");

  await page.getByRole("button", { name: "Play invitation" }).click();
  await expect(page.locator("main")).toHaveAttribute("data-spatial-mode", "static");
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.locator("#story").scrollIntoViewIfNeeded();
  await expect(page.locator(".journey-static-world")).toHaveAttribute(
    "data-static-chapter",
    "story-one",
  );
  await expect(page.locator(".journey-static-world img")).toHaveAttribute(
    "src",
    "/concepts/scene-3-story-garden-desktop.webp",
  );
  await page.locator("#details").scrollIntoViewIfNeeded();
  await expect(page.locator("#details")).toContainText("The Glass House");
});

test("WebGL context loss swaps the live world for its authored static equivalent", async ({
  browserName,
  page,
}) => {
  test.skip(
    browserName !== "chromium",
    "The release gate exercises context loss in Chromium.",
  );

  await page.goto("/the_ogranyas");
  const open = page.getByRole("button", { name: "Play invitation" });
  await expect(open).toBeEnabled({ timeout: 10_000 });
  await open.click();
  await expect(page.locator("main")).toHaveAttribute("data-spatial-mode", "webgl");
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-context-loss-ready",
    "true",
  );

  await page.locator("canvas").evaluate((canvas) =>
    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
  );

  await expect(page.locator("main")).toHaveAttribute("data-spatial-mode", "static");
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.locator("#story").scrollIntoViewIfNeeded();
  await expect(page.locator(".journey-static-world")).toHaveAttribute(
    "data-static-chapter",
    "story-one",
  );
});

test("an invalid credential reveals no recipient", async ({ page }) => {
  await page.goto("/the_ogranyas/invite/not-valid");

  await expect(
    page.getByRole("heading", { name: "This invitation can’t be opened." }),
  ).toBeVisible();
  await expect(page.getByText("Dr. Dyrane")).toHaveCount(0);
});

test("the share card and calendar endpoints return real artifacts", async ({
  page,
  request,
}) => {
  await page.goto("/the_ogranyas");
  const imageUrl = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  expect(imageUrl).not.toBeNull();

  const imagePath = new URL(imageUrl!).pathname + new URL(imageUrl!).search;
  const image = await request.get(imagePath);
  expect(image.ok()).toBeTruthy();
  expect(image.headers()["content-type"]).toContain("image/png");
  expect((await image.body()).byteLength).toBeGreaterThan(50_000);

  const calendar = await request.get("/the_ogranyas/calendar");
  expect(calendar.ok()).toBeTruthy();
  expect(calendar.headers()["content-type"]).toContain("text/calendar");
  expect(calendar.headers()["cache-control"]).toContain("public");
  expect(await calendar.text()).toContain("BEGIN:VCALENDAR");
});

test("invalid share-card routes degrade without exposing a recipient", async ({
  request,
}) => {
  const invalidCard = await request.get(
    "/the_ogranyas/invite/not-valid/card/1",
  );
  const publicCard = await request.get("/the_ogranyas/card/3");

  expect(invalidCard.ok()).toBeTruthy();
  expect(invalidCard.headers()["content-type"]).toContain("image/png");
  expect(invalidCard.headers()["cache-control"]).toContain("no-store");
  expect(invalidCard.headers()["x-robots-tag"]).toContain("noindex");
  expect(Buffer.compare(await invalidCard.body(), await publicCard.body())).toBe(0);
});
