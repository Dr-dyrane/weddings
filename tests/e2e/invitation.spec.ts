import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { DEMO_INVITATION_TOKEN } from "../../domains/invitations/invitation";

test("the public invitation remains useful before the optional presentation", async ({
  page,
}) => {
  await page.goto("/the_ogranyas");

  await expect(
    page.getByRole("heading", { name: "You’re invited to celebrate with us." }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "View invitation details" })).toBeVisible();
  await expect(page.getByText("Adaeze Ojukwu")).toBeAttached();
  await expect(page.getByText("Violet & Palm Atelier")).toBeAttached();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );

  const accessibility = await new AxeBuilder({ page }).analyze();
  const blockers = accessibility.violations.filter((violation) =>
    ["critical", "serious"].includes(violation.impact ?? ""),
  );
  expect(blockers).toEqual([]);
});

test("attendance is a semantic single choice with progressive disclosure", async ({
  page,
}) => {
  await page.goto("/the_ogranyas");

  const attending = page.getByRole("radio", { name: "Joyfully, yes" });
  const declining = page.getByRole("radio", { name: "With love, no" });
  const attendingControl = page
    .locator("label.dyrane-choice")
    .filter({ has: attending });
  await expect(attending).not.toBeChecked();
  await attendingControl.click();
  await expect(attending).toBeChecked();
  await expect(declining).not.toBeChecked();
  await expect(
    page.getByRole("textbox", { name: "How should we welcome you?" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Replies open soon/ })).toBeDisabled();
});

test("opening and bypass actions move focus to meaningful content", async ({
  page,
}) => {
  await page.goto("/the_ogranyas");

  await page.getByRole("button", { name: "Open your invitation" }).click();
  await expect(page.locator("#story")).toBeFocused();

  await page.goto("/the_ogranyas");
  const skip = page.getByRole("link", {
    name: "Skip to celebration details",
  });
  await skip.focus();
  await skip.click();
  await expect(page.locator("#details")).toBeFocused();
});

test("a personalized invitation is private and recipient-specific", async ({
  page,
  request,
}) => {
  const response = await page.goto(
    `/the_ogranyas/invite/${DEMO_INVITATION_TOKEN}`,
  );

  await expect(page.getByText("Reserved for Dr. Dyrane")).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  expect(response?.headers()["cache-control"]).toContain("no-store");
  expect(response?.headers()["referrer-policy"]).toBe("no-referrer");
  await expect(page.getByRole("button", { name: "Share public card" })).toBeVisible();
  await expect(page.getByText("Share my named card")).toBeVisible();
  await page.getByText("Share my named card").click();
  await expect(
    page.getByText(/Social apps may keep its preview/),
  ).toBeVisible();

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

test("reduced motion keeps the full invitation and removes the spatial canvas", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/the_ogranyas");

  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "View invitation details" })).toBeVisible();
  await expect(page.locator("#details")).toContainText("The Glass House");
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
  expect(calendar.headers()["cache-control"]).toContain("no-store");
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
