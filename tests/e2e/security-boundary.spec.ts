import { expect, test } from "@playwright/test";

test("production surface sends security headers and makes no off-origin request", async ({ page, request }) => {
  const response = await request.get("/");
  expect(response.headers()["content-security-policy"]).toContain("default-src 'self'");
  expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(response.headers()["cross-origin-opener-policy"]).toBe("same-origin");
  expect(response.headers()["permissions-policy"]).toBe("camera=(), microphone=(), geolocation=()");
  expect(response.headers()["referrer-policy"]).toBe("no-referrer");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");

  const externalRequests: string[] = [];
  const browserErrors: string[] = [];
  page.on("request", (outgoing) => {
    const target = new URL(outgoing.url());
    if (!new Set(["127.0.0.1", "localhost"]).has(target.hostname)) externalRequests.push(outgoing.url());
  });
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });
  page.on("pageerror", (error) => browserErrors.push(error.message));

  for (const route of ["/", "/signals", "/decision", "/prototype", "/spec", "/proof"]) {
    await page.goto(route);
  }

  expect(externalRequests).toEqual([]);
  expect(browserErrors).toEqual([]);
});
