"use server";

import { revalidatePath } from "next/cache";
import { isLateBriefSubmission } from "../chapter-settings";
import { createAdminClient, getChapter, optionalText, parseWeekDate, requireText } from "./admin-common";
import { getResolvedChapterSettings } from "./settings";

export async function getWeeklyBriefRows(weekDate: string) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const [membersResult, briefsResult, remindersResult] = await Promise.all([
    supabase
      .from("members")
      .select("id, chinese_name, email, specialty_title, company_name")
      .eq("chapter_id", chapter.id)
      .order("member_number", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
    supabase
      .from("weekly_briefs" as never)
      .select("id, member_id, have_this_week, want_this_week, status, submitted_at, approved_at, submitted_late")
      .eq("week_date", weekDate as never),
    supabase
      .from("reminder_logs" as never)
      .select("member_id, sent_at")
      .eq("chapter_id", chapter.id as never)
      .eq("week_date", weekDate as never),
  ]);
  const { data: members, error: memberError } = membersResult;
  if (memberError) throw memberError;
  const memberRows = (members || []) as Array<{ id: string; chinese_name: string; email: string; specialty_title: string | null; company_name: string | null }>;
  const { data: briefs, error: briefError } = briefsResult;
  if (briefError) throw briefError;
  const { data: reminders, error: remindersError } = remindersResult;
  if (remindersError) throw remindersError;

  const briefRows = (briefs || []) as Array<{ id: string; member_id: string; have_this_week: string | null; want_this_week: string | null; status: string; submitted_at: string | null; approved_at?: string | null; submitted_late?: boolean | null }>;
  const briefsByMember = new Map(briefRows.map((brief) => [brief.member_id, brief]));
  const reminderMap = new Map<string, string>();
  for (const reminder of (reminders || []) as Array<{ member_id: string; sent_at: string }>) {
    reminderMap.set(reminder.member_id, reminder.sent_at);
  }
  const rows = memberRows.map((member) => ({
    member,
    brief: briefsByMember.get(member.id) || null,
    remindedAt: reminderMap.get(member.id) || null,
  }));
  return {
    rows,
    submittedCount: rows.filter((row) => row.brief?.status === "submitted").length,
    totalCount: rows.length,
    lateCount: rows.filter((row) => row.brief?.submitted_late).length,
    remindedCount: rows.filter((row) => Boolean(row.remindedAt)).length,
  };
}

export async function saveBriefAction(formData: FormData) {
  const supabase = createAdminClient();
  const weekDate = parseWeekDate(requireText(formData, "week_date"));
  const memberId = requireText(formData, "member_id");
  const haveThisWeek = optionalText(formData, "have_this_week");
  const wantThisWeek = optionalText(formData, "want_this_week");
  const status = requireText(formData, "status") === "submitted" ? "submitted" : "draft";
  const settings = await getResolvedChapterSettings();
  const submittedAt = status === "submitted" ? new Date().toISOString() : null;
  const chapter = await getChapter();

  const { error } = await supabase.from("weekly_briefs" as never).upsert(
    {
      member_id: memberId,
      week_date: weekDate,
      have_this_week: haveThisWeek,
      want_this_week: wantThisWeek,
      status,
      submitted_at: submittedAt,
      submitted_late: submittedAt ? isLateBriefSubmission(weekDate, submittedAt, settings) : false,
    } as never,
    { onConflict: "member_id,week_date" },
  );
  if (error) throw error;
  if (status === "submitted") {
    const { data: briefData, error: briefError } = await supabase
      .from("weekly_briefs" as never)
      .select("id")
      .eq("member_id", memberId as never)
      .eq("week_date", weekDate as never)
      .single();
    if (briefError) throw briefError;
    const brief = briefData as { id: string };
    const { error: syncError } = await supabase.from("sync_logs" as never).insert({
      chapter_id: chapter.id,
      week_date: weekDate,
      brief_id: brief.id,
      status: "pending",
      trigger_type: "submission",
      triggered_by: memberId,
      payload: { member_id: memberId, source: "admin-brief-submit" },
    } as never);
    if (syncError) throw syncError;
  }
  revalidatePath("/admin/submission");
}

export async function approveBriefAction(formData: FormData) {
  const supabase = createAdminClient();
  const briefId = requireText(formData, "brief_id");
  const { error } = await supabase
    .from("weekly_briefs" as never)
    .update({ approved_at: new Date().toISOString(), status: "submitted" } as never)
    .eq("id", briefId as never);
  if (error) throw error;
  revalidatePath("/admin/submission");
}
