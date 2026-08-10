import { expect, test } from "@playwright/test";

test("primary recruiter journey reaches every product stage", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("decision engineering can trust");
  await page.getByRole("link", { name: "Open the synthetic evidence packet" }).click();
  await expect(page).toHaveURL(/\/signals$/);
  await expect(page.getByRole("heading", { name: "Signal inbox" })).toBeVisible();
  await page.getByRole("link", { name: "Decision", exact: true }).click();
  await expect(page.getByText("DO_NOT_BUILD", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Prototype", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Saturday Fundamentals · 10:00" })).toBeVisible();
  await page.getByTestId("primary-step").click();
  await expect(page.getByText("OFFER_ACTIVE", { exact: true })).toBeVisible();
  await page.getByTestId("primary-step").click();
  await expect(page.getByText("RESERVED", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Spec", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Acceptance criteria" })).toBeVisible();
  await page.getByRole("link", { name: "Proof", exact: true }).click();
  await expect(page.getByText("SPEC_READY_FOR_HUMAN_REVIEW", { exact: true })).toBeVisible();
});

test("blocked, expiry, pause, and reset states are visible", async ({ page }) => {
  await page.goto("/prototype");
  await page.getByRole("button", { name: /Ineligible/ }).click();
  await page.getByTestId("primary-step").click();
  await expect(page.getByText("BLOCKED_INELIGIBLE", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Expiry/ }).click();
  await page.getByTestId("primary-step").click();
  await page.getByTestId("primary-step").click();
  await expect(page.getByText("OFFER_WINDOW_ELAPSED", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: /Staff pause/ }).click();
  await page.getByTestId("primary-step").click();
  await expect(page.getByText("BLOCKED_PAUSED", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Reset exact seed" }).click();
  await expect(page.getByText("FULL", { exact: true })).toBeVisible();
  await expect(page.getByText("YES", { exact: true })).toBeVisible();
});

test("no route overflows supported viewports", async ({ page }) => {
  for (const width of [375, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/signals", "/decision", "/prototype", "/spec", "/proof"]) {
      await page.goto(route);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      expect(overflow, `${route} overflows at ${width}px`).toBe(false);
    }
  }
});
