import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

async function setRole(page: import("@playwright/test").Page, role: "admin" | "member" | "guest") {
  const baseURL = new URL(process.env.E2E_BASE_URL || "http://localhost:4010");
  await page.context().addCookies([
    {
      name: "sb-role",
      value: role,
      url: baseURL.origin,
      httpOnly: true,
      sameSite: "Lax",
      secure: baseURL.protocol === "https:",
    },
  ]);
}

function loadLocalEnv() {
  try {
    const contents = readFileSync(".env.local", "utf8");
    for (const line of contents.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...valueParts] = trimmed.split("=");
      process.env[key] ||= valueParts.join("=").replace(/^["']|["']$/g, "");
    }
  } catch {
    // CI can provide env vars directly; local runs use .env.local.
  }
}

function getSupabaseAdmin() {
  loadLocalEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) throw new Error("Missing Supabase env for E2E locked-week seed");

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function seedLockedWeek(weekDate: string) {
  const supabase = getSupabaseAdmin();
  const { data: chapter, error: chapterError } = await supabase
    .from("chapters")
    .select("id")
    .eq("slug", "hua-ai")
    .single();
  if (chapterError) throw chapterError;

  const { error } = await supabase.from("chapter_week_locks").upsert(
    {
      chapter_id: chapter.id,
      week_date: weekDate,
      reason: "E2E 鎖週驗收",
    },
    { onConflict: "chapter_id,week_date" },
  );
  if (error) throw error;
}

async function signInWithGeneratedLink(page: import("@playwright/test").Page, email: string) {
  const supabase = getSupabaseAdmin();
  await supabase.auth.admin.createUser({ email, email_confirm: true }).catch(() => undefined);
  const baseURL = new URL(process.env.E2E_BASE_URL || "http://localhost:4010");
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${baseURL.origin}/auth/callback` },
  });
  if (error) throw error;
  const tokenHash = data.properties?.hashed_token;
  if (!tokenHash) throw new Error(`Missing generated auth token for ${email}`);
  const callbackUrl = new URL("/auth/callback", baseURL.origin);
  callbackUrl.searchParams.set("token_hash", tokenHash);
  callbackUrl.searchParams.set("type", "magiclink");
  await page.goto(callbackUrl.toString());
}

test.describe("auth shell", () => {
  test("login exposes Email, Google, and GitHub entry points", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "會員登入" })).toBeVisible();
    await expect(page.getByRole("button", { name: /寄送 Email 登入連結/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Google" })).toBeVisible();
    await expect(page.getByRole("button", { name: "GitHub" })).toBeVisible();
  });

  test("protected routes redirect anonymous users to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("callback routes member, guest, and unknown emails correctly", async ({ page }) => {
    await signInWithGeneratedLink(page, "fish@fishot.com");
    await expect(page).toHaveURL(/\/admin$/);

    await page.context().clearCookies();
    await signInWithGeneratedLink(page, "guest@example.com");
    await expect(page).toHaveURL(/\/guest$/);

    await page.context().clearCookies();
    await signInWithGeneratedLink(page, `unknown-${Date.now()}@example.com`);
    await expect(page).toHaveURL(/\/error\?reason=identity-not-found/);
    await expect(page.getByText("不是正式會員，也不是目前已登記 email 的受邀來賓")).toBeVisible();
  });
});

test.describe("guest portal", () => {
  test("public guest hub and public content render without authentication", async ({ page }) => {
    await page.goto("/guest");
    await expect(page.getByRole("heading", { name: /第一次來 BNI/ })).toBeVisible();
    await expect(page.getByText("BNI 是什麼")).toBeVisible();
    await expect(page.getByText("來賓須知")).toBeVisible();

    await page.goto("/guest/content");
    await expect(page.getByText("第一次參加 BNI 例會指南")).toBeVisible();
    await expect(page.getByText("來賓限定：如何提出有效引薦需求")).toHaveCount(0);
  });

  test("guest role can access guest-only content and is blocked from member/admin areas", async ({ page }) => {
    await setRole(page, "guest");

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/guest$/);
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/guest$/);

    await page.goto("/guest/content");
    await expect(page.getByText("來賓限定：如何提出有效引薦需求")).toBeVisible();
  });

  test("guest preparation and limited member directory exclude member-only actions", async ({ page }) => {
    await setRole(page, "guest");

    await page.goto("/guest/prepare");
    for (const prompt of ["姓名", "公司", "專業", "希望被引薦的對象", "一句明確需求"]) {
      await expect(page.getByText(prompt, { exact: true })).toBeVisible();
    }

    await page.goto("/guest/members");
    await expect(page.getByRole("heading", { name: "來賓可見會員資訊" })).toBeVisible();
    await expect(page.getByText("一對一預約")).toHaveCount(0);
    await expect(page.getByText("會員編輯")).toHaveCount(0);
    await expect(page.getByText("後台操作")).toHaveCount(0);
  });
});

test.describe("admin backend", () => {
  test.beforeEach(async ({ page }) => {
    await setRole(page, "admin");
  });

  test("admin dashboard and operational pages render", async ({ page }) => {
    const cases = [
      ["/admin", "總覽儀表板"],
      ["/admin/members", "會員管理"],
      ["/admin/submission", "提交狀況"],
      ["/admin/guests", "來賓管理"],
      ["/admin/keynote", "8 分鐘短講"],
      ["/admin/vp-report", "VP 報告"],
      ["/admin/awards", "獎項管理"],
      ["/admin/presentation", "簡報管理"],
      ["/admin/import", "資料匯入"],
      ["/admin/settings", "系統設定"],
    ] as const;

    for (const [path, heading] of cases) {
      await page.goto(path);
      await expect(page.getByText(heading).first()).toBeVisible();
    }
  });

  test("VP report rejects negative values and can save valid metrics", async ({ page }) => {
    await page.goto("/admin/vp-report?week=2026-06-01");
    const referrals = page.locator('input[name="total_referrals"]');
    await referrals.fill("-1");
    await page.getByRole("button", { name: "儲存 VP 報告" }).click();
    await expect(page.getByText(/total_referrals: 不可小於 0/)).toBeVisible();

    await referrals.fill("19");
    await page.getByRole("button", { name: "儲存 VP 報告" }).click();
    await expect(referrals).toHaveValue("19");
  });

  test("guest management creates a login-ready guest visit", async ({ page }) => {
    const stamp = Date.now();
    await page.goto("/admin/guests?week=2026-06-01");
    await page.locator('input[name="name"]').fill(`E2E 來賓 ${stamp}`);
    await page.locator('input[name="email"]').fill(`guest-${stamp}@example.com`);
    await page.locator('input[name="company"]').fill("E2E Company");
    await page.locator('input[name="specialty"]').fill("E2E 顧問");
    await page.locator('textarea[name="self_intro"]').fill("這是 E2E 來賓 15 秒介紹。");
    await page.getByRole("button", { name: "儲存來賓" }).click();
    await expect(page.getByText(`E2E 來賓 ${stamp}`)).toBeVisible();
    await expect(page.getByText("可登入").last()).toBeVisible();
  });

  test("legacy admin links redirect to canonical pages", async ({ page }) => {
    await page.goto("/admin/weekly-briefs");
    await expect(page).toHaveURL(/\/admin\/submission$/);
    await page.goto("/admin/presentations");
    await expect(page).toHaveURL(/\/admin\/presentation$/);
  });

  test("admin placeholder pages are safe and explicit", async ({ page }) => {
    await page.goto("/admin/import");
    await expect(page.getByText("正式匯入流程會包含欄位對應")).toBeVisible();

    await page.goto("/admin/settings");
    await expect(page.getByText("分會資訊：coming soon")).toBeVisible();
  });
});

test.describe("member portal", () => {
  test.beforeEach(async ({ page }) => {
    await setRole(page, "member");
  });

  test("member dashboard, report, and directory render", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/Member Dashboard|早安/)).toBeVisible();
    await page.goto("/dashboard/report");
    await expect(page.getByText("每週 Brief")).toBeVisible();
    await page.goto("/dashboard/directory");
    await expect(page.getByRole("heading", { name: "會員通訊錄" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "王小明" }).first()).toBeVisible();
  });

  test("locked weekly report is read-only", async ({ page }) => {
    await seedLockedWeek("2026-05-25");
    await page.goto("/dashboard/report?week=2026-05-25");
    await expect(page.getByText("此週已鎖定，Brief 只能檢視，不能修改。")).toBeVisible();
    await expect(page.locator('textarea[name="have_this_week"]')).toBeDisabled();
    await expect(page.getByRole("button", { name: "儲存草稿" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "提交" })).toBeDisabled();
  });

  test("legacy member links redirect to weekly report", async ({ page }) => {
    await page.goto("/dashboard/brief");
    await expect(page).toHaveURL(/\/dashboard\/report$/);
    await page.goto("/dashboard/weekly");
    await expect(page).toHaveURL(/\/dashboard\/report$/);
  });

  test("member v3 placeholder routes are reachable", async ({ page }) => {
    const cases = [
      ["/dashboard/profile", "個人資料"],
      ["/dashboard/one-on-one", "一對一預約"],
      ["/dashboard/events", "活動"],
      ["/dashboard/training", "培訓紀錄"],
      ["/dashboard/ai", "AI 助手"],
    ] as const;

    for (const [path, heading] of cases) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    }
  });
});
