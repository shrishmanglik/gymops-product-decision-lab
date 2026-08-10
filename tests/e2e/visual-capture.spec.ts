import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import sharp from "sharp";

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
    // scroll offsets. Freeze the sticky navigation/index surfaces only for a
    // faithful evidence image; interactive browser tests still exercise production CSS.
    await page.addStyleTag({
      content: ".site-header,.scenario-panel,.spec-index{position:static!important}.skip-link{display:none!important}",
    });
    const screenshot = await page.screenshot({ fullPage: true, animations: "disabled" });
    await sharp(screenshot)
      .png({ compressionLevel: 9, adaptiveFiltering: false, palette: false })
      .toFile(join(output, `${name}.png`));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  }
});
