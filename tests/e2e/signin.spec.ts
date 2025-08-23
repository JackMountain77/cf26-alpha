import { test, expect } from "@playwright/test";

test("user can visit sign in page", async ({ page }) => {
  await page.goto("http://localhost:3000/signin");
  await expect(page).toHaveTitle(/Sign in/i);
});
