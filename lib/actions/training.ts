"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient, getChapter, optionalText, requireText } from "./admin-common";
import { getCurrentMember } from "./member-portal";

export async function getTrainingOverview() {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const [coursesResult, membersResult, recordsResult] = await Promise.all([
    supabase.from("training_courses" as never).select("*").order("name", { ascending: true }),
    supabase.from("members" as never).select("id, chinese_name, member_number").eq("chapter_id", chapter.id as never).order("member_number", { ascending: true, nullsFirst: false }),
    supabase.from("training_records" as never).select("id, member_id, course_id, completed_at, credits_earned").order("completed_at", { ascending: false }),
  ]);
  if (coursesResult.error) throw coursesResult.error;
  if (membersResult.error) throw membersResult.error;
  if (recordsResult.error) throw recordsResult.error;

  const courses = (coursesResult.data || []) as Array<{
    id: string;
    name: string;
    system_form_name: string | null;
    desktop_form_name: string | null;
    credits: number | null;
    first_fee: number | null;
    repeat_fee: number | null;
    provider: string | null;
  }>;
  const members = (membersResult.data || []) as Array<{ id: string; chinese_name: string; member_number: string | null }>;
  const records = (recordsResult.data || []) as Array<{ id: string; member_id: string; course_id: string; completed_at: string; credits_earned: number | null }>;
  const courseLookup = new Map(courses.map((course) => [course.id, course]));

  const memberSummaries = members
    .map((member) => {
      const memberRecords = records.filter((record) => record.member_id === member.id);
      return {
        ...member,
        totalCredits: memberRecords.reduce((sum, record) => sum + (record.credits_earned || 0), 0),
        completedCourses: memberRecords.length,
      };
    })
    .sort((a, b) => b.totalCredits - a.totalCredits || a.chinese_name.localeCompare(b.chinese_name, "zh-Hant"));

  return {
    courses,
    records: records.map((record) => ({
      ...record,
      courseName: courseLookup.get(record.course_id)?.name || record.course_id,
    })),
    memberSummaries,
    members,
  };
}

export async function getMemberTrainingDashboard() {
  const supabase = createAdminClient();
  const member = await getCurrentMember();
  if (!member) return { totalCredits: 0, records: [], remainingCourses: 0 };

  const [coursesResult, recordsResult] = await Promise.all([
    supabase.from("training_courses" as never).select("*").order("name", { ascending: true }),
    supabase.from("training_records" as never).select("id, course_id, completed_at, credits_earned").eq("member_id", member.id as never).order("completed_at", { ascending: false }),
  ]);
  if (coursesResult.error) throw coursesResult.error;
  if (recordsResult.error) throw recordsResult.error;

  const courses = (coursesResult.data || []) as Array<{ id: string; name: string; credits: number | null; provider: string | null }>;
  const records = (recordsResult.data || []) as Array<{ id: string; course_id: string; completed_at: string; credits_earned: number | null }>;
  const courseLookup = new Map(courses.map((course) => [course.id, course]));

  return {
    totalCredits: records.reduce((sum, record) => sum + (record.credits_earned || 0), 0),
    records: records.map((record) => ({
      ...record,
      courseName: courseLookup.get(record.course_id)?.name || record.course_id,
      provider: courseLookup.get(record.course_id)?.provider || null,
    })),
    remainingCourses: Math.max(courses.length - records.length, 0),
  };
}

export async function createTrainingCourseAction(formData: FormData) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("training_courses" as never).insert({
    name: requireText(formData, "name"),
    system_form_name: optionalText(formData, "system_form_name"),
    desktop_form_name: optionalText(formData, "desktop_form_name"),
    credits: Number(requireText(formData, "credits") || 0),
    first_fee: Number(requireText(formData, "first_fee") || 0),
    repeat_fee: Number(requireText(formData, "repeat_fee") || 0),
    provider: optionalText(formData, "provider"),
  } as never);
  if (error) throw error;
  revalidatePath("/admin/training");
  revalidatePath("/dashboard/training");
  redirect("/admin/training?saved=course");
}

export async function recordTrainingCompletionAction(formData: FormData) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("training_records" as never).insert({
    member_id: requireText(formData, "member_id"),
    course_id: requireText(formData, "course_id"),
    completed_at: requireText(formData, "completed_at"),
    credits_earned: Number(requireText(formData, "credits_earned") || 0),
  } as never);
  if (error) throw error;
  revalidatePath("/admin/training");
  revalidatePath("/dashboard/training");
  revalidatePath("/dashboard");
  redirect("/admin/training?saved=record");
}
