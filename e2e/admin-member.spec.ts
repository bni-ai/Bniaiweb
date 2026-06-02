import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { parseLocalDateTimeToIso } from "../lib/one-on-one";

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn1L0sAAAAASUVORK5CYII=",
  "base64",
);

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

async function getMemberSnapshot(email: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("members")
    .select("line_name, company_name, gains_goals, gains_skills, gains_interests, specialty_title, is_active, committee, role, photo_url")
    .ilike("email", email)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function deleteMembersByEmail(emails: string[]) {
  if (!emails.length) return;
  const supabase = getSupabaseAdmin();
  const chapterId = await getChapterId();
  const { error } = await supabase
    .from("members")
    .delete()
    .eq("chapter_id", chapterId)
    .in("email", emails);
  if (error) throw error;
}

async function getTopClientIndustry(email: string) {
  const supabase = getSupabaseAdmin();
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id")
    .ilike("email", email)
    .single();
  if (memberError) throw memberError;

  const { data, error } = await supabase
    .from("member_top_clients")
    .select("industry")
    .eq("member_id", member.id)
    .eq("rank", 1)
    .maybeSingle();
  if (error) throw error;
  return data?.industry || null;
}

async function hasContactName(email: string, name: string) {
  const supabase = getSupabaseAdmin();
  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id")
    .ilike("email", email)
    .single();
  if (memberError) throw memberError;

  const { data, error } = await supabase
    .from("member_contacts_circle")
    .select("id")
    .eq("member_id", member.id)
    .eq("name", name)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data?.id);
}

async function getMemberIdByEmail(email: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("members").select("id").ilike("email", email).single();
  if (error) throw error;
  return data.id as string;
}

async function getMemberByNumber(memberNumber: string) {
  const supabase = getSupabaseAdmin();
  const chapterId = await getChapterId();
  const { data, error } = await supabase
    .from("members")
    .select("id, email, chinese_name, specialty_title, company_name")
    .eq("chapter_id", chapterId)
    .eq("member_number", memberNumber)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function getChapterSettingsSnapshot() {
  const supabase = getSupabaseAdmin();
  const chapterId = await getChapterId();
  const { data, error } = await supabase.from("chapter_settings").select("*").eq("chapter_id", chapterId).maybeSingle();
  if (error) throw error;
  return data;
}

async function restoreChapterSettings(snapshot: Record<string, unknown> | null) {
  const supabase = getSupabaseAdmin();
  const chapterId = await getChapterId();
  if (!snapshot) {
    const { error } = await supabase.from("chapter_settings").delete().eq("chapter_id", chapterId);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("chapter_settings").upsert({ ...snapshot, chapter_id: chapterId });
  if (error) throw error;
}

async function getActiveAiProvider() {
  const supabase = getSupabaseAdmin();
  const chapterId = await getChapterId();
  const { data, error } = await supabase.from("ai_settings").select("provider").eq("chapter_id", chapterId).eq("is_active", true).maybeSingle();
  if (error) throw error;
  return data?.provider || null;
}

async function countReminderLogs(weekDate: string) {
  const supabase = getSupabaseAdmin();
  const chapterId = await getChapterId();
  const { count, error } = await supabase
    .from("reminder_logs")
    .select("id", { count: "exact", head: true })
    .eq("chapter_id", chapterId)
    .eq("week_date", weekDate);
  if (error) throw error;
  return count || 0;
}

async function getLatestSyncLog(weekDate: string, triggerType?: "manual" | "submission") {
  const supabase = getSupabaseAdmin();
  const chapterId = await getChapterId();
  let query = supabase
    .from("sync_logs")
    .select("id, status, trigger_type, week_date, triggered_by, brief_id")
    .eq("chapter_id", chapterId)
    .eq("week_date", weekDate)
    .order("created_at", { ascending: false })
    .limit(1);
  if (triggerType) query = query.eq("trigger_type", triggerType);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data;
}

async function getEventByTitle(title: string) {
  const supabase = getSupabaseAdmin();
  const chapterId = await getChapterId();
  const { data, error } = await supabase
    .from("events")
    .select("id, title, max_participants")
    .eq("chapter_id", chapterId)
    .eq("title", title)
    .order("created_at", { ascending: false })
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function getEventRegistration(eventId: string, email: string) {
  const supabase = getSupabaseAdmin();
  const memberId = await getMemberIdByEmail(email);
  const { data, error } = await supabase
    .from("event_registrations")
    .select("id, status")
    .eq("event_id", eventId)
    .eq("member_id", memberId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function getTrainingCourseByName(name: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("training_courses")
    .select("id, name")
    .eq("name", name)
    .order("id", { ascending: false })
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function getTrainingCredits(email: string) {
  const supabase = getSupabaseAdmin();
  const memberId = await getMemberIdByEmail(email);
  const { data, error } = await supabase
    .from("training_records")
    .select("credits_earned")
    .eq("member_id", memberId);
  if (error) throw error;
  return ((data || []) as Array<{ credits_earned: number | null }>).reduce((sum, row) => sum + (row.credits_earned || 0), 0);
}

async function getLatestAiConversation(query: string) {
  const supabase = getSupabaseAdmin();
  const chapterId = await getChapterId();
  const { data, error } = await supabase
    .from("ai_conversations")
    .select("id, provider, query")
    .eq("chapter_id", chapterId)
    .eq("query", query)
    .order("created_at", { ascending: false })
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function getMemberPhotoUrl(email: string) {
  const snapshot = await getMemberSnapshot(email);
  return (snapshot as { photo_url?: string | null } | null)?.photo_url || null;
}

async function countMemberProductImages(email: string) {
  const supabase = getSupabaseAdmin();
  const memberId = await getMemberIdByEmail(email);
  const { count, error } = await supabase
    .from("member_product_images")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId);
  if (error) throw error;
  return count || 0;
}

async function clearMemberProductImages(email: string) {
  const supabase = getSupabaseAdmin();
  const memberId = await getMemberIdByEmail(email);
  const { error } = await supabase.from("member_product_images").delete().eq("member_id", memberId);
  if (error) throw error;
}

async function getKeynoteImageCount(weekDate: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("keynote_talks")
    .select("product_images")
    .eq("week_date", weekDate)
    .maybeSingle();
  if (error) throw error;
  const productImages = (data as { product_images?: Array<{ url: string }> | null } | null)?.product_images || [];
  return productImages.length;
}

async function deleteKeynoteByWeek(weekDate: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("keynote_talks").delete().eq("week_date", weekDate);
  if (error) throw error;
}

async function upsertImportSeedMember(input: { email: string; memberNumber: string; chineseName: string; specialtyTitle: string }) {
  const supabase = getSupabaseAdmin();
  const chapterId = await getChapterId();
  const { error } = await supabase.from("members").upsert(
    {
      chapter_id: chapterId,
      email: input.email,
      member_number: input.memberNumber,
      chinese_name: input.chineseName,
      specialty_title: input.specialtyTitle,
      company_name: "既有公司",
      role: "member",
      is_active: true,
    },
    { onConflict: "chapter_id,email" },
  );
  if (error) throw error;
}

async function replaceAvailability(email: string, rows: Array<{ day_of_week: number; start_time: string; end_time: string }>) {
  const supabase = getSupabaseAdmin();
  const memberId = await getMemberIdByEmail(email);
  const { error: deleteError } = await supabase.from("member_availability").delete().eq("member_id", memberId);
  if (deleteError) throw deleteError;
  if (rows.length) {
    const { error } = await supabase.from("member_availability").insert(rows.map((row) => ({ member_id: memberId, ...row })));
    if (error) throw error;
  }
}

async function getBookingByNotes(notes: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("one_on_ones")
    .select("id, inviter_id, invitee_id, scheduled_at, status, jitsi_room, notes")
    .eq("notes", notes)
    .order("created_at", { ascending: false })
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function deleteBookingsForSlot(inviterEmail: string, inviteeEmail: string, scheduledAtLocal: string) {
  const supabase = getSupabaseAdmin();
  const inviterId = await getMemberIdByEmail(inviterEmail);
  const inviteeId = await getMemberIdByEmail(inviteeEmail);
  const scheduledAtIso = parseLocalDateTimeToIso(scheduledAtLocal);
  const memberIds = [inviterId, inviteeId];
  const { error: inviterError } = await supabase
    .from("one_on_ones")
    .delete()
    .eq("scheduled_at", scheduledAtIso)
    .in("inviter_id", memberIds);
  if (inviterError) throw inviterError;
  const { error: inviteeError } = await supabase
    .from("one_on_ones")
    .delete()
    .eq("scheduled_at", scheduledAtIso)
    .in("invitee_id", memberIds);
  if (inviteeError) throw inviteeError;
}

async function createConfirmedBookingWithinWindow(inviterEmail: string, inviteeEmail: string, notes: string) {
  const supabase = getSupabaseAdmin();
  const inviterId = await getMemberIdByEmail(inviterEmail);
  const inviteeId = await getMemberIdByEmail(inviteeEmail);
  const scheduledAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("one_on_ones")
    .insert({
      inviter_id: inviterId,
      invitee_id: inviteeId,
      scheduled_at: scheduledAt,
      status: "confirmed",
      notes,
      jitsi_room: `window${Date.now()}`,
    })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

function getNextWeekdaySlot(targetDay: number, hour: number, minute = 0) {
  const now = new Date();
  const date = new Date(now);
  date.setSeconds(0, 0);
  let diff = (targetDay - date.getDay() + 7) % 7;
  if (diff === 0 && (date.getHours() > hour || (date.getHours() === hour && date.getMinutes() >= minute))) {
    diff = 7;
  }
  date.setDate(date.getDate() + diff);
  date.setHours(hour, minute, 0, 0);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return {
    localValue: `${year}-${month}-${day}T${hours}:${minutes}`,
    dayOfWeek: date.getDay(),
  };
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function futureWeekDate(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return formatDate(date);
}

function currentWeekDate() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  return formatDate(monday);
}

async function getChapterId() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("chapters").select("id").eq("slug", "hua-ai").single();
  if (error) throw error;
  return data.id as string;
}

async function ensurePresentationMember(email: string, overrides?: { chinese_name?: string; position?: string | null }) {
  const supabase = getSupabaseAdmin();
  const chapterId = await getChapterId();
  const { data: existing, error: existingError } = await supabase
    .from("members")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing?.id) return existing.id as string;

  const { data, error } = await supabase
    .from("members")
    .insert({
      chapter_id: chapterId,
      email,
      chinese_name: overrides?.chinese_name || "簡報驗收會員",
      specialty_title: "簡報驗收顧問",
      company_name: "BNI 驗收公司",
      role: "officer",
      position: overrides?.position ?? "活動協調",
      is_active: true,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

async function ensurePresentationGuest(email: string, referrerId: string) {
  const supabase = getSupabaseAdmin();
  const chapterId = await getChapterId();
  const { data: existing, error: existingError } = await supabase
    .from("guests")
    .select("id")
    .ilike("email", email)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing?.id) return existing.id as string;

  const { data, error } = await supabase
    .from("guests")
    .insert({
      chapter_id: chapterId,
      email,
      name: "簡報驗收來賓",
      company: "簡報驗收公司",
      specialty: "商務開發",
      referrer_id: referrerId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

async function seedPresentationScenario(weekDate: string, mode: "published" | "draft" | "malformed") {
  const supabase = getSupabaseAdmin();
  const chapterId = await getChapterId();
  const stamp = weekDate.replace(/-/g, "");
  const memberId = await ensurePresentationMember(`presentation-${stamp}@example.com`, {
    chinese_name: `簡報會員${stamp.slice(-4)}`,
    position: "活動協調",
  });
  const guestId = await ensurePresentationGuest(`presentation-guest-${stamp}@example.com`, memberId);

  await supabase.from("presentations").delete().eq("chapter_id", chapterId).eq("week_date", weekDate);
  await supabase.from("weekly_awards").delete().eq("chapter_id", chapterId).eq("week_date", weekDate);
  await supabase.from("weekly_vp_reports").delete().eq("chapter_id", chapterId).eq("week_date", weekDate);
  await supabase.from("keynote_talks").delete().eq("week_date", weekDate);
  await supabase.from("guest_visits").delete().eq("week_date", weekDate);
  await supabase.from("weekly_briefs").delete().eq("week_date", weekDate).eq("member_id", memberId);

  const { data: brief, error: briefError } = await supabase
    .from("weekly_briefs")
    .insert({
      member_id: memberId,
      week_date: weekDate,
      have_this_week: "我有商務簡報優化與資訊流程整合服務。",
      want_this_week: "我想認識正在建立 B2B 內部流程的決策者。",
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (briefError) throw briefError;

  const { data: keynote, error: keynoteError } = await supabase
    .from("keynote_talks")
    .insert({
      speaker_id: memberId,
      week_date: weekDate,
      topic: "如何把例會資料變成可分享簡報",
      outline: "整理來源\n建立順序\n驗收 viewer",
      product_images: [],
      status: "submitted",
    })
    .select("id")
    .single();
  if (keynoteError) throw keynoteError;

  const { data: visit, error: visitError } = await supabase
    .from("guest_visits")
    .insert({
      guest_id: guestId,
      week_date: weekDate,
      visit_number: 2,
      status: "confirmed",
      self_intro: "我想了解如何讓例會資料能快速整理成對外簡報。",
    })
    .select("id")
    .single();
  if (visitError) throw visitError;

  const { data: award, error: awardError } = await supabase
    .from("weekly_awards")
    .insert({
      chapter_id: chapterId,
      week_date: weekDate,
      recipient_id: memberId,
      award_type: "top_referrer",
      description: "本週完成最多高品質引薦。",
    })
    .select("id")
    .single();
  if (awardError) throw awardError;

  const { data: vpReport, error: vpReportError } = await supabase
    .from("weekly_vp_reports")
    .insert({
      chapter_id: chapterId,
      week_date: weekDate,
      total_referrals: 18,
      total_one_on_ones: 9,
      total_visitors: 4,
      member_attendance: 31,
      referral_value_twd: 520000,
      notes: "本週簡報 viewer 驗收資料。",
    })
    .select("id")
    .single();
  if (vpReportError) throw vpReportError;

  const slideOrder =
    mode === "malformed"
      ? [{ type: "unknown", id: "bad-entry" }]
      : [
          { type: "cover" },
          { type: "keynote", id: keynote.id, visible: true },
          { type: "member", id: brief.id, visible: true },
          { type: "guest", id: visit.id, visible: true },
          { type: "award", id: award.id, visible: true },
          { type: "vp_report", id: vpReport.id, visible: true },
          { type: "team" },
        ];

  const { data: presentation, error: presentationError } = await supabase
    .from("presentations")
    .insert({
      chapter_id: chapterId,
      week_date: weekDate,
      title: `E2E 簡報 ${weekDate}`,
      slide_order: slideOrder,
      status: mode === "draft" ? "draft" : "published",
      published_url: mode === "published" ? `/presentation/${weekDate}` : null,
    })
    .select("id")
    .single();
  if (presentationError) throw presentationError;

  return { id: presentation.id as string, weekDate };
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
      ["/admin/training", "培訓管理"],
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

  test("admin can see the member-view switch entry", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("link", { name: "切換到會員視角" })).toBeVisible();
  });

  test("admin shell shows signed-in identity card", async ({ page }) => {
    await signInWithGeneratedLink(page, "fish@fishot.com");
    await page.goto("/admin");
    await expect(page.getByTestId("shell-user-card")).toContainText("余啟彰");
    await expect(page.getByTestId("shell-user-card")).toContainText(/管理員|主席|president/i);
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

  test("admin import and settings pages are safe and explicit", async ({ page }) => {
    await page.goto("/admin/import");
    await expect(page.getByRole("heading", { name: "資料匯入" })).toBeVisible();
    await expect(page.getByText("上傳會員 CSV 後")).toBeVisible();

    await page.goto("/admin/settings");
    await expect(page.getByRole("heading", { name: "系統設定" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "分會資訊" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "AI 設定" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "例會設定" })).toBeVisible();
  });

  test("admin settings critical controls remain usable across desktop tablet and mobile", async ({ page }) => {
    const viewports = [
      { name: "desktop", width: 1440, height: 900 },
      { name: "tablet", width: 834, height: 1112 },
      { name: "mobile", width: 390, height: 844 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/admin/settings");
      await expect(page.getByRole("heading", { name: "系統設定" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "分會資訊" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "AI 設定" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "例會設定" })).toBeVisible();
      await expect(page.getByRole("button", { name: "儲存設定" })).toBeVisible();
      await expect(page.getByRole("button", { name: "儲存設定" })).toBeEnabled();
    }
  });

  test("admin can create and find a member record", async ({ page }) => {
    const stamp = Date.now();
    await signInWithGeneratedLink(page, "fish@fishot.com");
    await page.goto("/admin/members/new");
    await page.locator('input[name="member_number"]').fill(`E2E-${stamp}`);
    await page.locator('input[name="email"]').fill(`member-${stamp}@example.com`);
    await page.locator('input[name="chinese_name"]').fill(`測試會員${stamp}`);
    await page.locator('input[name="specialty_title"]').fill("E2E 測試顧問");
    await page.locator('select[name="committee"]').selectOption("資訊組員");
    await page.locator('select[name="role"]').selectOption("officer");
    await page.getByRole("button", { name: "建立會員" }).click();
    await expect(page).toHaveURL(/\/admin\/members\/.+\?saved=1$/);

    await page.locator('input[name="specialty_title"]').fill(`E2E 更新顧問 ${stamp}`);
    await page.getByRole("button", { name: "儲存會員資料" }).click();
    await expect.poll(async () => (await getMemberSnapshot(`member-${stamp}@example.com`))?.specialty_title).toBe(`E2E 更新顧問 ${stamp}`);

    await page.goto(`/admin/members?q=${encodeURIComponent(`測試會員${stamp}`)}&committee=${encodeURIComponent("資訊組員")}&role=officer&active=active`);
    await expect(page.getByText(`測試會員${stamp}`)).toBeVisible();
    await expect(page.getByText(`member-${stamp}@example.com`)).toBeVisible();
    await page.getByRole("button", { name: "停用" }).first().click();
    await expect.poll(async () => (await getMemberSnapshot(`member-${stamp}@example.com`))?.is_active).toBe(false);

    await page.goto(`/admin/members?q=${encodeURIComponent(`測試會員${stamp}`)}&active=inactive`);
    await expect(page.getByText(`測試會員${stamp}`)).toBeVisible();
  });

  test("admin can preview and commit member csv import", async ({ page }) => {
    test.setTimeout(60_000);
    const stamp = Date.now();
    const duplicateNumber = `9${String(stamp).slice(-5)}`;
    const newNumber = `8${String(stamp).slice(-5)}`;
    const duplicateEmail = `import-duplicate-${stamp}@example.com`;
    const newEmail = `import-new-${stamp}@example.com`;
    await deleteMembersByEmail([duplicateEmail, newEmail]);
    await upsertImportSeedMember({
      email: duplicateEmail,
      memberNumber: duplicateNumber,
      chineseName: `既有會員${stamp}`,
      specialtyTitle: "舊專業",
    });

    const csv = [
      "編號,中文名,Email,專業別,公司名稱",
      `${duplicateNumber},更新會員${stamp},${duplicateEmail},新專業,更新公司`,
      `${newNumber},新會員${stamp},${newEmail},AI顧問,新公司`,
    ].join("\n");

    await signInWithGeneratedLink(page, "fish@fishot.com");
    await page.goto("/admin/import");
    await page.locator('input[name="csv_file"]').setInputFiles({
      name: "members.csv",
      mimeType: "text/csv",
      buffer: Buffer.from(csv, "utf8"),
    });
    await page.getByRole("button", { name: "解析並預覽" }).click();

    await expect(page.getByRole("heading", { name: "欄位對應" })).toBeVisible();
    await expect(page.getByRole("cell", { name: `更新會員${stamp}`, exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: `新會員${stamp}`, exact: true })).toBeVisible();
    await expect(page.getByText(/重複：既有會員/)).toBeVisible();

    await page.getByRole("button", { name: "確認匯入" }).click();
    await expect(page.getByText("匯入完成。")).toBeVisible();

    await expect.poll(async () => (await getMemberByNumber(duplicateNumber))?.specialty_title).toBe("新專業");
    await expect.poll(async () => (await getMemberByNumber(duplicateNumber))?.company_name).toBe("更新公司");
    await expect.poll(async () => (await getMemberByNumber(newNumber))?.email).toBe(newEmail);
    await expect.poll(async () => (await getMemberByNumber(newNumber))?.chinese_name).toBe(`新會員${stamp}`);
  });

  test("admin settings drive late briefs, reminders, and manual sync baseline", async ({ page }) => {
    test.setTimeout(90_000);
    const weekDate = currentWeekDate();
    const originalSettings = await getChapterSettingsSnapshot();
    const reminderCountBefore = await countReminderLogs(weekDate);

    try {
      await signInWithGeneratedLink(page, "fish@fishot.com");
      await page.goto("/admin/settings");
      await page.locator('input[name="chapter_name"]').fill("BNI 華 AI 分會");
      await page.locator('input[name="chapter_region"]').fill("台北");
      await page.locator('input[name="meeting_time"]').fill("每週五 07:00");
      await page.locator('select[name="submission_deadline_day"]').selectOption("0");
      await page.locator('input[name="submission_deadline_time"]').fill("00:00");
      await page.locator('select[name="reminder_day"]').selectOption("3");
      await page.locator('input[name="reminder_time"]').fill("17:30");
      await page.locator('input[type="radio"][value="openai"]').check();
      await page.locator('input[name="openai_model_name"]').fill("gpt-4.1-mini");
      await page.locator('input[name="bni_connect_username"]').fill("bnitest@example.com");
      await page.locator('input[name="bni_connect_password"]').fill("secret-123");
      await page.getByRole("button", { name: "儲存設定" }).click();
      await expect(page).toHaveURL(/saved=1/);
      await expect.poll(async () => (await getActiveAiProvider())).toBe("openai");

      await signInWithGeneratedLink(page, "fish.myfb@gmail.com");
      await page.goto(`/dashboard/report?week=${weekDate}`);
      await page.locator('textarea[name="have_this_week"]').fill("E2E late offer");
      await page.locator('textarea[name="want_this_week"]').fill("E2E late ask");
      await page.getByRole("button", { name: "提交本週簡報" }).click();

      await signInWithGeneratedLink(page, "fish@fishot.com");
      await page.goto(`/admin/submission?week=${weekDate}`);
      await expect(page.getByRole("cell", { name: /已提交 \/ 逾期/ })).toBeVisible();
      await expect.poll(async () => (await getLatestSyncLog(weekDate, "submission"))?.status).toBe("pending");

      await page.getByRole("button", { name: "提醒未提交會員" }).click();
      await expect(page).toHaveURL(/reminded=/);
      await expect.poll(async () => await countReminderLogs(weekDate)).toBeGreaterThan(reminderCountBefore);

      await page.goto("/admin/settings");
      await page.locator('input[name="week_date"]').fill(weekDate);
      await page.getByRole("button", { name: "手動同步本週" }).click();
      await expect(page).toHaveURL(/sync=1/);
      await expect.poll(async () => (await getLatestSyncLog(weekDate, "manual"))?.status).toBe("success");
    } finally {
      await restoreChapterSettings(originalSettings as Record<string, unknown> | null);
    }
  });

  test("admin creates an event and member can register", async ({ page }) => {
    test.setTimeout(60_000);
    const stamp = Date.now();
    const title = `E2E 活動 ${stamp}`;
    const eventDate = futureWeekDate(21);

    await signInWithGeneratedLink(page, "fish@fishot.com");
    await page.goto("/admin/events");
    await page.locator('input[name="title"]').fill(title);
    await page.locator('input[name="date"]').fill(eventDate);
    await page.locator('input[name="registration_deadline"]').fill(eventDate);
    await page.locator('input[name="max_participants"]').fill("2");
    await page.locator('textarea[name="description"]').fill("E2E 活動說明");
    await page.getByRole("button", { name: "建立活動" }).click();
    await expect(page).toHaveURL(/saved=1/);
    await expect.poll(async () => (await getEventByTitle(title))?.id).not.toBeNull();

    const event = await getEventByTitle(title);
    if (!event?.id) throw new Error("Missing event after create");

    await signInWithGeneratedLink(page, "fish.myfb@gmail.com");
    await page.goto("/dashboard/events");
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await page.getByRole("button", { name: "立即報名" }).click();
    await expect.poll(async () => (await getEventRegistration(event.id, "fish.myfb@gmail.com"))?.status).toBe("registered");

    await signInWithGeneratedLink(page, "fish@fishot.com");
    await page.goto("/admin/events");
    const card = page.locator("div.rounded-\\[24px\\]").filter({ hasText: title }).first();
    await card.getByRole("button", { name: "已出席" }).first().click();
    await expect.poll(async () => (await getEventRegistration(event.id, "fish.myfb@gmail.com"))?.status).toBe("attended");
  });

  test("admin creates training course and completion updates member credits", async ({ page }) => {
    test.setTimeout(60_000);
    const stamp = Date.now();
    const courseName = `E2E 培訓 ${stamp}`;
    const completedAt = futureWeekDate(10);
    const memberEmail = "fish.myfb@gmail.com";
    const creditsBefore = await getTrainingCredits(memberEmail);

    await signInWithGeneratedLink(page, "fish@fishot.com");
    await page.goto("/admin/training");
    await page.locator('input[name="name"]').fill(courseName);
    await page.locator('input[name="system_form_name"]').fill(`SYS-${stamp}`);
    await page.locator('input[name="desktop_form_name"]').fill(`DESK-${stamp}`);
    await page.locator('input[name="credits"]').fill("3");
    await page.locator('input[name="first_fee"]').fill("800");
    await page.locator('input[name="repeat_fee"]').fill("400");
    await page.locator('input[name="provider"]').fill("BNI 台灣");
    await page.getByRole("button", { name: "建立課程" }).click();
    await expect(page).toHaveURL(/saved=course/);
    await expect.poll(async () => (await getTrainingCourseByName(courseName))?.id).not.toBeNull();

    await page.locator('select[name="member_id"]').selectOption(await getMemberIdByEmail(memberEmail));
    const course = await getTrainingCourseByName(courseName);
    if (!course?.id) throw new Error("Missing training course");
    await page.locator('select[name="course_id"]').selectOption(course.id);
    await page.locator('input[name="completed_at"]').fill(completedAt);
    await page.locator('input[name="credits_earned"]').fill("3");
    await page.getByRole("button", { name: "新增完課" }).click();
    await expect(page).toHaveURL(/saved=record/);
    await expect.poll(async () => await getTrainingCredits(memberEmail)).toBe(creditsBefore + 3);

    await signInWithGeneratedLink(page, memberEmail);
    await page.goto("/dashboard/training");
    await expect(page.getByText(String(creditsBefore + 3)).first()).toBeVisible();
    await expect(page.getByText(courseName)).toBeVisible();
  });

  test("published presentation viewer renders and legacy id links redirect", async ({ page }) => {
    test.setTimeout(60_000);
    const seeded = await seedPresentationScenario(futureWeekDate(120), "published");

    await page.goto(`/presentation/${seeded.weekDate}`);
    await expect(page.getByText("如何把例會資料變成可分享簡報")).toBeVisible();
    await expect(page.getByText("簡報驗收來賓")).toBeVisible();
    await expect(page.getByText("本週績效摘要")).toBeVisible();
    await expect(page.locator(".aspect-video").first()).toBeVisible();

    await page.goto(`/presentation/${seeded.id}`);
    await expect(page).toHaveURL(new RegExp(`/presentation/${seeded.weekDate}$`));
    await expect(page.getByText("如何把例會資料變成可分享簡報")).toBeVisible();
  });

  test("admin presentation workbench hides raw JSON editor and exposes preview publishing controls", async ({ page }) => {
    test.setTimeout(60_000);
    const seeded = await seedPresentationScenario(futureWeekDate(128), "draft");
    await setRole(page, "admin");
    await page.goto(`/admin/presentations/${seeded.id}`);
    await expect(page.getByRole("heading", { name: "簡報工作台" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "投影片順序" })).toBeVisible();
    await expect(page.getByRole("link", { name: "預覽簡報" })).toBeVisible();
    await expect(page.getByRole("button", { name: "發布簡報" })).toBeVisible();
    await expect(page.locator('textarea[name="slide_order"]')).toHaveCount(0);
    await page.locator('input[name="slide_order_0"]').fill("1");
    await page.getByRole("button", { name: "儲存投影片設定" }).click();
    await expect(page.getByRole("heading", { name: "簡報工作台" })).toBeVisible();
  });

  test("presentation viewer blocks missing, draft, and malformed decks", async ({ page }) => {
    test.setTimeout(60_000);
    const missingWeek = futureWeekDate(127);
    const draftDeck = await seedPresentationScenario(futureWeekDate(134), "draft");
    const malformedDeck = await seedPresentationScenario(futureWeekDate(141), "malformed");

    const missingResponse = await page.goto(`/presentation/${missingWeek}`);
    expect(missingResponse?.status()).toBe(404);

    const draftResponse = await page.goto(`/presentation/${draftDeck.weekDate}`);
    expect(draftResponse?.status()).toBe(404);

    const malformedResponse = await page.goto(`/presentation/${malformedDeck.weekDate}`);
    expect(malformedResponse?.status()).toBe(404);
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

  test("member shell shows signed-in identity card", async ({ page }) => {
    await signInWithGeneratedLink(page, "fish.myfb@gmail.com");
    await page.goto("/dashboard");
    await expect(page.getByTestId("shell-user-card")).toContainText("余啟銘");
    await expect(page.getByTestId("shell-user-card")).toContainText(/會員|資訊|member/i);
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
      await expect(page.getByRole("heading", { name: heading, exact: true })).toBeVisible();
    }
  });

  test("admin entering member area can return to admin backend", async ({ page }) => {
    await setRole(page, "admin");
    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: "返回管理後台" })).toBeVisible();
  });

  test("signed-in member can update profile, gains, top clients, and contacts circle", async ({ page }) => {
    const stamp = Date.now();
    const email = "fish.myfb@gmail.com";
    await signInWithGeneratedLink(page, "fish.myfb@gmail.com");

    await page.goto("/dashboard/profile");
    await page.locator('input[name="line_name"]').fill(`line-${stamp}`);
    await page.locator('input[name="company_name"]').fill(`E2E 公司 ${stamp}`);
    await page.getByRole("button", { name: "儲存個人資料" }).click();
    await expect.poll(async () => (await getMemberSnapshot(email))?.line_name).toBe(`line-${stamp}`);
    await page.goto(`/dashboard/profile?ts=${stamp}`);
    await expect(page.locator('input[name="company_name"]')).toHaveValue(`E2E 公司 ${stamp}`);

    await page.goto("/dashboard/gains");
    await page.locator('textarea[name="gains_goals"]').fill(`goals-${stamp}`);
    await page.locator('textarea[name="gains_skills"]').fill(`skills-${stamp}`);
    await page.locator('textarea[name="gains_skills"]').blur();
    await expect(page.getByText("已自動儲存。")).toBeVisible();
    await expect.poll(async () => (await getMemberSnapshot(email))?.gains_goals).toBe(`goals-${stamp}`);
    await page.goto(`/dashboard/gains?ts=${stamp}`);
    await expect(page.locator('textarea[name="gains_goals"]')).toHaveValue(`goals-${stamp}`);
    await expect(page.locator('textarea[name="gains_skills"]')).toHaveValue(`skills-${stamp}`);

    await page.goto("/dashboard/top-clients");
    await page.locator('input[name="rank_1_industry"]').fill(`TopClient-${stamp}`);
    await page.locator('input[name="rank_1_company_type"]').fill("顧問公司");
    await page.getByRole("button", { name: "儲存前十名客戶" }).click();
    await expect.poll(async () => await getTopClientIndustry(email)).toBe(`TopClient-${stamp}`);
    await page.goto(`/dashboard/top-clients?ts=${stamp}`);
    await expect(page.locator('input[name="rank_1_industry"]')).toHaveValue(`TopClient-${stamp}`);

    await page.goto("/dashboard/contacts-circle");
    const contactNames = page.locator('input[name^="contact_name_"]');
    const contactRelationships = page.locator('input[name^="contact_relationship_"]');
    await contactNames.last().fill(`聯絡人-${stamp}`);
    await contactRelationships.last().fill("E2E 關係");
    await page.getByRole("button", { name: "儲存人脈圈" }).click();
    await expect.poll(async () => await hasContactName(email, `聯絡人-${stamp}`)).toBe(true);
    await page.goto(`/dashboard/contacts-circle?ts=${stamp}`);
    await expect(page.locator(`input[value="聯絡人-${stamp}"]`)).toBeVisible();
    const contactCard = page.locator("div.rounded-2xl.border").filter({ has: page.locator(`input[value="聯絡人-${stamp}"]`) }).first();
    await contactCard.getByRole("button", { name: "刪除此聯絡人" }).click();
    await expect.poll(async () => await hasContactName(email, `聯絡人-${stamp}`)).toBe(false);
  });

  test("gains auto-save failure preserves text and exposes retry", async ({ page }) => {
    const stamp = Date.now();
    await signInWithGeneratedLink(page, "fish.myfb@gmail.com");
    await page.goto("/dashboard/gains?fail=1");
    await page.locator('textarea[name="gains_interests"]').fill(`AI社群交流-${stamp}`);
    await page.locator('textarea[name="gains_interests"]').blur();
    await expect(page.getByText("自動儲存失敗，內容已保留，請重試。")).toBeVisible();
    await expect(page.locator('textarea[name="gains_interests"]')).toHaveValue(`AI社群交流-${stamp}`);
    await expect(page.getByRole("button", { name: "重試" })).toBeVisible();
  });

  test("member can manage one-on-one availability, booking, conflict, and status", async ({ page }) => {
    test.setTimeout(60_000);
    const stamp = Date.now();
    const memberEmail = "fish.myfb@gmail.com";
    const inviteeEmail = "fish@fishot.com";
    const inviteeId = await getMemberIdByEmail(inviteeEmail);
    const slot = getNextWeekdaySlot(4, 10);
    await deleteBookingsForSlot(memberEmail, inviteeEmail, slot.localValue);
    await replaceAvailability(inviteeEmail, [
      { day_of_week: slot.dayOfWeek, start_time: "10:00", end_time: "12:00" },
    ]);

    await signInWithGeneratedLink(page, memberEmail);
    await page.goto("/dashboard/one-on-one");
    const availabilityStarts = page.locator('input[name^="availability_start_time_"]');
    const availabilityEnds = page.locator('input[name^="availability_end_time_"]');
    await availabilityStarts.first().fill("14:00");
    await availabilityEnds.first().fill("15:00");
    await page.getByRole("button", { name: "儲存可預約時段" }).click();
    await expect.poll(async () => {
      const supabase = getSupabaseAdmin();
      const memberId = await getMemberIdByEmail(memberEmail);
      const { data, error } = await supabase.from("member_availability").select("start_time,end_time").eq("member_id", memberId).maybeSingle();
      if (error) throw error;
      return data ? `${String(data.start_time).slice(0, 5)}-${String(data.end_time).slice(0, 5)}` : null;
    }).toBe("14:00-15:00");

    await page.goto(`/dashboard/one-on-one?invitee=${inviteeId}`);
    await page.locator('input[name="scheduled_at"]').fill(slot.localValue);
    await page.locator('textarea[name="notes"]').fill(`E2E one-on-one ${stamp}`);
    await page.getByRole("button", { name: "建立一對一預約" }).click();
    await expect.poll(async () => (await getBookingByNotes(`E2E one-on-one ${stamp}`))?.status).toBe("pending");
    await expect.poll(async () => (await getBookingByNotes(`E2E one-on-one ${stamp}`))?.jitsi_room).not.toBeNull();

    await page.goto(`/dashboard/one-on-one?invitee=${inviteeId}`);
    await page.locator('input[name="scheduled_at"]').fill(slot.localValue);
    await page.locator('textarea[name="notes"]').fill(`E2E conflict ${stamp}`);
    await page.getByRole("button", { name: "建立一對一預約" }).click();
    await expect(page.getByText("此時段已有重疊的一對一預約")).toBeVisible();
    await expect(await getBookingByNotes(`E2E conflict ${stamp}`)).toBeNull();

    await page.goto("/dashboard/one-on-one");
    const bookingCard = page.locator("div.rounded-2xl.border").filter({ hasText: `E2E one-on-one ${stamp}` }).first();
    await bookingCard.getByRole("button", { name: "confirmed" }).click();
    await expect.poll(async () => (await getBookingByNotes(`E2E one-on-one ${stamp}`))?.status).toBe("confirmed");

    await page.goto("/dashboard/one-on-one");
    const confirmedCard = page.locator("div.rounded-2xl.border").filter({ hasText: `E2E one-on-one ${stamp}` }).first();
    await confirmedCard.getByRole("button", { name: "completed" }).click();
    await expect.poll(async () => (await getBookingByNotes(`E2E one-on-one ${stamp}`))?.status).toBe("completed");
  });

  test("ai baseline uses active provider and answers member query", async ({ page }) => {
    test.setTimeout(60_000);
    const query = `誰的專業是 AI顧問 ${Date.now()}`;
    const memberNumber = `7${String(Date.now()).slice(-5)}`;
    const email = `ai-member-${Date.now()}@example.com`;
    await deleteMembersByEmail([email]);
    await upsertImportSeedMember({
      email,
      memberNumber,
      chineseName: "AI 查詢會員",
      specialtyTitle: query.replace("誰的專業是 ", ""),
    });

    await signInWithGeneratedLink(page, "fish@fishot.com");
    await page.goto("/admin/settings");
    await page.locator('input[type="radio"][value="gemini"]').check();
    await page.locator('input[name="gemini_model_name"]').fill("gemini-2.5-pro");
    await page.getByRole("button", { name: "儲存設定" }).click();
    await expect(page).toHaveURL(/saved=1/);

    await signInWithGeneratedLink(page, "fish.myfb@gmail.com");
    await page.goto("/dashboard/ai");
    await expect(page.getByText(/目前使用中的 provider：gemini/i)).toBeVisible();
    await page.locator('textarea[name="query"]').fill(query);
    await page.getByRole("button", { name: "送出查詢" }).click();
    await expect(page.getByText("AI 查詢會員", { exact: true }).first()).toBeVisible();
    await expect(page.getByText(query).first()).toBeVisible();
    await expect.poll(async () => (await getLatestAiConversation(query))?.provider).toBe("gemini");
  });

  test("member profile media and keynote materials upload flow works", async ({ page }) => {
    test.setTimeout(90_000);
    const memberEmail = "fish.myfb@gmail.com";
    await clearMemberProductImages(memberEmail);
    const productCountBefore = 0;
    const weekDate = futureWeekDate(28);
    await deleteKeynoteByWeek(weekDate);

    await signInWithGeneratedLink(page, memberEmail);
    await page.goto("/dashboard/profile");
    await page.locator('input[name="photo_file"]').setInputFiles({
      name: "avatar.png",
      mimeType: "image/png",
      buffer: TINY_PNG,
    });
    await page.getByRole("button", { name: "上傳頭像" }).click();
    await expect(page).toHaveURL(/photo=1/);
    await expect.poll(async () => await getMemberPhotoUrl(memberEmail)).toMatch(/bniai-media/);
    await expect(page.locator('img[alt="余啟銘"]').first()).toBeVisible();

    await page.locator('input[name="product_files"]').setInputFiles([
      { name: "product-1.png", mimeType: "image/png", buffer: TINY_PNG },
      { name: "product-2.png", mimeType: "image/png", buffer: TINY_PNG },
    ]);
    await page.getByRole("button", { name: "上傳產品圖" }).click();
    await expect(page).toHaveURL(/products=1/);
    await expect.poll(async () => await countMemberProductImages(memberEmail)).toBe(productCountBefore + 2);

    await signInWithGeneratedLink(page, "fish@fishot.com");
    await page.goto(`/admin/keynote?week=${weekDate}`);
    await page.locator('select[name="speaker_id"]').selectOption(await getMemberIdByEmail(memberEmail));
    await page.locator('input[name="topic"]').fill(`E2E 素材短講 ${weekDate}`);
    await page.locator('textarea[name="outline"]').fill("一對一素材\n簡報用圖");
    await page.locator('input[name="product_image_files"]').setInputFiles([
      { name: "keynote-1.png", mimeType: "image/png", buffer: TINY_PNG },
      { name: "keynote-2.png", mimeType: "image/png", buffer: TINY_PNG },
    ]);
    await page.getByRole("button", { name: "儲存短講" }).click();
    await expect(page).toHaveURL(/saved=1/);
    await expect.poll(async () => await getKeynoteImageCount(weekDate)).toBe(2);
  });

  test("confirmed one-on-one can enter video page within allowed window", async ({ page }) => {
    test.setTimeout(60_000);
    const bookingId = await createConfirmedBookingWithinWindow("fish.myfb@gmail.com", "fish@fishot.com", `video-check-${Date.now()}`);
    await signInWithGeneratedLink(page, "fish.myfb@gmail.com");
    await page.goto(`/dashboard/one-on-one/${bookingId}/video`);
    await expect(page.getByRole("heading", { name: "一對一視訊入口" })).toBeVisible();
    await expect(page.getByRole("link", { name: "進入 Jitsi 視訊會議" })).toBeVisible();
  });
});
