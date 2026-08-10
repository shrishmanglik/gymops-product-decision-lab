import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

test("captures the primary journey at the release viewports", async ({ page }, testInfo) => {
  const output = join(process.cwd(), "evidence", "screenshots");
  mkdirSync(output, { recursive: true });
  const mobile = testInfo.project.name === "mobile";
  await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 });
  const routes = mobile
    ? [["home-mobile", "/"], ["prototype-mobile", "/prototype"]]
    : [["home-desktop", "/"], ["signals-desktop", "/signals"], ["decision-desktop", "/decision"], ["prototype-desktop", "/prototype"], ["spec-desktop", "/spec"], ["proof-desktop", "/proof"]];

  for (const [name, route] of routes) {
    await page.goto(route);
    if (route === "/prototype") await page.getByTestId("primary-step").click();
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    });
    // Full-page Chromium capture tiles fixed/sticky elements at intermediate
    // scroll offsets. Freeze only those two chrome elements for a faithful page
    // evidence image; interactive browser tests still exercise production CSS.
    await page.addStyleTag({ content: ".site-header{position:static!important}.skip-link{display:none!important}" });
    await page.screenshot({ path: join(output, `${name}.png`), fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});
