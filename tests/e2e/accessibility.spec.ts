import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const route of ["/", "/signals", "/decision", "/prototype", "/spec", "/proof"]) {
  test(`${route} has no WCAG A or AA violations`, async ({ page }) => {
    await page.goto(route);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(result.violations).toEqual([]);
  });
}
