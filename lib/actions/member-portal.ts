"use server";

import { revalidatePath } from "next/cache";

import { createServerClient } from "../supabase/server";
import { isWeekLocked } from "../member-portal-policy";
import { createAdminClient, getChapter, getDefaultWeekDate, optionalText, parseWeekDate, requireText } from "./admin-common";

export async function getCurrentMember() {
  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  const email = user?.email;
  if (!email) return null;

  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { data, error } = await supabase
    .from("members")
    .select("id, email, chinese_name, role, specialty_title, specialty_description, company_name, line_name")
    .eq("chapter_id", chapter.id)
    .ilike("email", email)
    .maybeSingle();
  if (error) throw error;
  return data as {
    id: string;
    email: string;
    chinese_name: string;
    role: string;
    specialty_title: string | null;
    specialty_description: string | null;
    company_name: string | null;
    line_name: string | null;
  } | null;
}

async function getWeekLock(weekDate: string) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { data, error } = await supabase
    .from("chapter_week_locks" as never)
    .select("locked_at, reason")
    .eq("chapter_id", chapter.id as never)
    .eq("week_date", weekDate as never)
    .maybeSingle();
  if (error) throw error;
  return data as { locked_at: string | null; reason: string | null } | null;
}

export async function getMemberDashboardData(weekDate = getDefaultWeekDate()): Promise<{ member: Awaited<ReturnType<typeof getCurrentMember>>; weekDate: string; brief: { id: string; week_date: string; have_this_week: string | null; want_this_week: string | null; status: string; submitted_at: string | null } | null; locked: boolean; lockReason: string | null }> {
  const parsedWeekDate = parseWeekDate(weekDate);
  const lock = await getWeekLock(parsedWeekDate);
  const member = await getCurrentMember();
  if (!member) return { member: null, weekDate: parsedWeekDate, brief: null, locked: isWeekLocked(lock), lockReason: lock?.reason || null };
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("weekly_briefs")
    .select("id, week_date, have_this_week, want_this_week, status, submitted_at")
    .eq("member_id", member.id)
    .eq("week_date", parsedWeekDate)
    .maybeSingle();
  if (error) throw error;
  return {
    member,
    weekDate: parsedWeekDate,
    brief: data as { id: string; week_date: string; have_this_week: string | null; want_this_week: string | null; status: string; submitted_at: string | null } | null,
    locked: isWeekLocked(lock),
    lockReason: lock?.reason || null,
  };
}

export async function saveMyBriefAction(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) throw new Error("找不到登入會員資料");
  const supabase = createAdminClient();
  const weekDate = parseWeekDate(requireText(formData, "week_date"));
  const lock = await getWeekLock(weekDate);
  if (isWeekLocked(lock)) {
    throw new Error("此週已鎖定，Brief 只能檢視，不能修改");
  }
  const status = requireText(formData, "intent") === "submit" ? "submitted" : "draft";
  const { error } = await supabase.from("weekly_briefs" as never).upsert(
    {
      member_id: member.id,
      week_date: weekDate,
      have_this_week: optionalText(formData, "have_this_week"),
      want_this_week: optionalText(formData, "want_this_week"),
      status,
      submitted_at: status === "submitted" ? new Date().toISOString() : null,
    } as never,
    { onConflict: "member_id,week_date" },
  );
  if (error) throw error;
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/report");
}

export async function getMemberDirectory(query = "") {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const normalized = query.trim();
  let builder = supabase
    .from("members" as never)
    .select("id, chinese_name, english_name, email, specialty_title, specialty_description, company_name, line_name")
    .eq("chapter_id", chapter.id as never)
    .order("member_number", { ascending: true, nullsFirst: false });
  if (normalized) {
    builder = builder.or(`chinese_name.ilike.%${normalized}%,english_name.ilike.%${normalized}%,specialty_title.ilike.%${normalized}%` as never);
  }
  const { data, error } = await builder;
  if (error) throw error;
  return (data || []) as Array<{
    id: string;
    chinese_name: string;
    english_name: string | null;
    email: string;
    specialty_title: string | null;
    specialty_description: string | null;
    company_name: string | null;
    line_name: string | null;
  }>;
}

export async function getMemberMonthlySignals() {
  const member = await getCurrentMember();
  if (!member) {
    return {
      monthlyReferrals: 0,
      trainingCredits: null,
      oneOnOnesCompleted: null,
    };
  }

  const supabase = createAdminClient();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [trainingRecords, guestReferrals] = await Promise.all([
    supabase
      .from("training_records" as never)
      .select("credits_earned")
      .eq("member_id", member.id as never),
    supabase
      .from("guests" as never)
      .select("id", { count: "exact", head: true })
      .eq("referrer_id", member.id as never)
      .gte("created_at", monthStart.toISOString() as never),
  ]);

  if (trainingRecords.error) throw trainingRecords.error;
  if (guestReferrals.error) throw guestReferrals.error;

  const trainingCredits = ((trainingRecords.data || []) as Array<{ credits_earned: number | null }>).reduce(
    (total, row) => total + (row.credits_earned || 0),
    0,
  );

  return {
    monthlyReferrals: guestReferrals.count || 0,
    trainingCredits,
    oneOnOnesCompleted: null,
  };
}
