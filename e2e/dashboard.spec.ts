import { expect, test } from "@playwright/test";

test("signed-in dashboard renders GTD buckets", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /^Hi .+—/ })
  ).toBeVisible();
  await expect(page.getByText("Inbox", { exact: true })).toBeVisible();
  await expect(page.getByText("Next Actions", { exact: true })).toBeVisible();
  await expect(page.getByText("Waiting For", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Someday / Maybe", { exact: true })
  ).toBeVisible();
});

test("weekly review page loads", async ({ page }) => {
  await page.goto("/review");

  await expect(
    page.getByRole("heading", { name: "Weekly Review" })
  ).toBeVisible();
});

test("horizons page lists all altitude levels", async ({ page }) => {
  await page.goto("/horizons");

  await expect(
    page.getByRole("heading", { name: "Horizons of Focus" })
  ).toBeVisible();
  await expect(page.getByText(/50,000 ft/)).toBeVisible();
  await expect(page.getByText(/40,000 ft/)).toBeVisible();
  await expect(page.getByText(/30,000 ft/)).toBeVisible();
  await expect(page.getByText(/20,000 ft/)).toBeVisible();
  await expect(page.getByText(/10,000 ft/)).toBeVisible();
});
