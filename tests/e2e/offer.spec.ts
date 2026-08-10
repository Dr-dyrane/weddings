import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("the root presents the complete Nigerian wedding offer", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "An invitation should feel like arrival.",
    }),
  ).toBeVisible();

  const packageNames = ["The Invitation", "The Signature", "The Heirloom"];
  for (const packageName of packageNames) {
    await expect(
      page.getByRole("heading", { level: 2, name: packageName }),
    ).toBeAttached();
  }

  await expect(page.locator("#basic")).toContainText("₦650,000");
  await expect(page.locator("#intermediate")).toContainText("₦900,000");
  await expect(page.locator("#premium")).toContainText("₦1,500,000");
  await expect(page.locator("#basic")).toContainText(
    "Founding rate: ₦450,000",
  );

  const accessibility = await new AxeBuilder({ page })
    // These oversized numerals are intentionally low-contrast, aria-hidden
    // chapter artwork. The adjacent package labels carry the same sequence.
    .exclude(".offer-package-index")
    .analyze();
  const blockers = accessibility.violations.filter((violation) =>
    ["critical", "serious"].includes(violation.impact ?? ""),
  );
  expect(blockers).toEqual([]);

  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("the offer keeps the live invitation one action away", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: "Enter Alexander & Chioma" })
    .click();

  await expect(page).toHaveURL(/\/the_ogranyas$/);
  await expect(
    page.getByRole("button", { name: "Play invitation" }),
  ).toBeVisible();
});
