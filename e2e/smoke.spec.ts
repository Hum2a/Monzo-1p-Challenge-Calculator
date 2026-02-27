import { test, expect } from "@playwright/test";

test.describe("1p Challenge Calculator - Smoke test", () => {
  test("loads and shows calculator", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText(/1p challenge calculator/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/plan your penny accumulator/i)).toBeVisible();
  });

  test("shows result for default Next N days mode", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("tab", { name: /next n days/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/£/)).toBeVisible({ timeout: 10000 });
  });

  test("Month tab calculates for selected month", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.getByRole("tab", { name: /month/i }).click();
    await expect(page.getByText(/£/)).toBeVisible({ timeout: 10000 });
  });

  test("Copy and Share buttons are present", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("button", { name: /copy result/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: /share link/i })).toBeVisible();
  });

  test("About page loads", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
    await expect(page.getByRole("heading", { name: /about the 1p challenge/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/1p challenge/i)).toBeVisible();
  });
});
