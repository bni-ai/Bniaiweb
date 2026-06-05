import { expect, test } from "@playwright/test";

test.describe("auth login page", () => {
  test("shows password and magic-link modes, member OAuth actions, and guest entry", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "會員登入" })).toBeVisible();
    await expect(page.getByRole("button", { name: "密碼登入" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Magic Link" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: "GitHub" })).toBeVisible();
    await expect(page.getByRole("button", { name: "進入來賓專區 →" })).toBeVisible();

    await page.getByRole("button", { name: "密碼登入" }).click();
    await expect(page.locator('input[autocomplete="current-password"]')).toBeVisible();

    await page.getByRole("button", { name: "Magic Link" }).click();
    await expect(page.locator('input[autocomplete="current-password"]')).toHaveCount(0);
  });

  test("renders readable password auth error from route response", async ({ page }) => {
    await page.route("**/auth/password-login", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Email 或密碼錯誤，請再試一次。" }),
      });
    });

    await page.goto("/login");
    await page.getByRole("button", { name: "密碼登入" }).click();
    await page.getByLabel("會員 Email").fill("member@example.com");
    await page.locator('input[autocomplete="current-password"]').fill("wrong-password");
    await page.getByRole("button", { name: "登入", exact: true }).click();

    await expect(page.getByText("Email 或密碼錯誤，請再試一次。")).toBeVisible();
  });

  test("renders forgot password link and guest registration handoff", async ({ page }) => {
    await page.goto("/login");

    const forgotLink = page.locator("#forgot-password-link");

    await expect(forgotLink).toBeVisible();

    await forgotLink.click();
    await expect(page).toHaveURL(/.*forgot-password/);

    await page.goto("/login");
    await page.getByRole("button", { name: "進入來賓專區 →" }).click();
    await expect(page).toHaveURL(/.*guest/);
    await page.getByRole("main").getByRole("link", { name: "註冊來賓帳號" }).click();
    await expect(page).toHaveURL(/.*guest\/register/);
  });
});
