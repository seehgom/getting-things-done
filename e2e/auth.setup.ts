import path from "node:path";
import { clerk } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";

const authFile = path.join(__dirname, "../playwright/.clerk/user.json");

setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_CLERK_USER_EMAIL;
  if (!email) {
    throw new Error(
      "Set E2E_CLERK_USER_EMAIL to an existing Clerk user's email before running e2e tests."
    );
  }

  // Sign-in must start from an unprotected page so Clerk's script loads
  // before proxy.ts's auth.protect() would otherwise redirect us away.
  await page.goto("/sign-in");
  await clerk.signIn({ page, emailAddress: email });
  await page.context().storageState({ path: authFile });
});
