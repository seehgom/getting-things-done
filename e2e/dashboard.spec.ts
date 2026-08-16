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
