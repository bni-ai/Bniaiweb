"use server";

import { revalidatePath } from "next/cache";

import { createAdminClient, getChapter, optionalText, parseWeekDate, requireText } from "./admin-common";

export async function getWeeklyBriefRows(weekDate: string) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { data: members, error: memberError } = await supabase
    .from("members")
    .select("id, chinese_name, email, specialty_title, company_name")
    .eq("chapter_id", chapter.id)
    .order("member_number", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (memberError) throw memberError;

  const memberRows = (members || []) as Array<{ id: string; chinese_name: string; email: string; specialty_title: string | null; company_name: string | null }>;
  const memberIds = memberRows.map((member) => member.id);
  const { data: briefs, error: briefError } = await supabase
    .from("weekly_briefs" as never)
    .select("id, member_id, have_this_week, want_this_week, status, submitted_at, approved_at")
    .eq("week_date", weekDate)
    .in("member_id", memberIds as never);
  if (briefError) throw briefError;

  const briefRows = (briefs || []) as Array<{ id: string; member_id: string; have_this_week: string | null; want_this_week: string | null; status: string; submitted_at: string | null; approved_at?: string | null }>;
  const briefsByMember = new Map(briefRows.map((brief) => [brief.member_id, brief]));
  const rows = memberRows.map((member) => ({ member, brief: briefsByMember.get(member.id) || null }));
  return {
    rows,
    submittedCount: rows.filter((row) => row.brief?.status === "submitted").length,
    totalCount: rows.length,
  };
}

export async function saveBriefAction(formData: FormData) {
  const supabase = createAdminClient();
  const weekDate = parseWeekDate(requireText(formData, "week_date"));
  const memberId = requireText(formData, "member_id");
  const haveThisWeek = optionalText(formData, "have_this_week");
  const wantThisWeek = optionalText(formData, "want_this_week");
  const status = requireText(formData, "status") === "submitted" ? "submitted" : "draft";

  const { error } = await supabase.from("weekly_briefs" as never).upsert(
    {
      member_id: memberId,
      week_date: weekDate,
      have_this_week: haveThisWeek,
      want_this_week: wantThisWeek,
      status,
      submitted_at: status === "submitted" ? new Date().toISOString() : null,
    } as never,
    { onConflict: "member_id,week_date" },
  );
  if (error) throw error;
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
