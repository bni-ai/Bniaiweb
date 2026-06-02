"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildReminderMessage, DEFAULT_CHAPTER_SETTINGS, type ChapterSettings } from "../chapter-settings";
import { decryptSecret, encryptSecret } from "../settings-crypto";
import { createAdminClient, getChapter, optionalText, requireText } from "./admin-common";
import { getCurrentMember } from "./member-portal";

type AiProviderSetting = {
  provider: "claude" | "gemini" | "openai";
  model_name: string | null;
  api_key_encrypted: string | null;
  is_active: boolean | null;
};

export async function getAdminSettings() {
  const supabase = createAdminClient();
  const chapter = await getChapter();

  const [settingsResult, aiResult, syncLogsResult] = await Promise.all([
    supabase.from("chapter_settings" as never).select("*").eq("chapter_id", chapter.id as never).maybeSingle(),
    supabase.from("ai_settings" as never).select("*").eq("chapter_id", chapter.id as never).order("provider", { ascending: true }),
    supabase
      .from("sync_logs" as never)
      .select("id, week_date, status, trigger_type, synced_at, error_message, triggered_by")
      .eq("chapter_id", chapter.id as never)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (settingsResult.error) throw settingsResult.error;
  if (aiResult.error) throw aiResult.error;
  if (syncLogsResult.error) throw syncLogsResult.error;

  const settings = (settingsResult.data || null) as
    | null
    | {
        meeting_time: string | null;
        submission_deadline_day: number;
        submission_deadline_time: string;
        reminder_day: number;
        reminder_time: string;
        bni_connect_username_encrypted: string | null;
        bni_connect_password_encrypted: string | null;
      };

  const aiRows = ((aiResult.data || []) as AiProviderSetting[]).reduce<Record<string, AiProviderSetting>>((acc, row) => {
    acc[row.provider] = row;
    return acc;
  }, {});

  return {
    chapter,
    settings: {
      meetingTime: settings?.meeting_time || DEFAULT_CHAPTER_SETTINGS.meetingTime,
      submissionDeadlineDay: settings?.submission_deadline_day ?? DEFAULT_CHAPTER_SETTINGS.submissionDeadlineDay,
      submissionDeadlineTime: settings?.submission_deadline_time || DEFAULT_CHAPTER_SETTINGS.submissionDeadlineTime,
      reminderDay: settings?.reminder_day ?? DEFAULT_CHAPTER_SETTINGS.reminderDay,
      reminderTime: settings?.reminder_time || DEFAULT_CHAPTER_SETTINGS.reminderTime,
      bniConnectUsername: decryptSecret(settings?.bni_connect_username_encrypted),
      bniConnectPassword: decryptSecret(settings?.bni_connect_password_encrypted),
    },
    aiProviders: {
      claude: {
        modelName: aiRows.claude?.model_name || "claude-3-5-sonnet",
        apiKey: decryptSecret(aiRows.claude?.api_key_encrypted),
        isActive: Boolean(aiRows.claude?.is_active),
      },
      gemini: {
        modelName: aiRows.gemini?.model_name || "gemini-2.5-pro",
        apiKey: decryptSecret(aiRows.gemini?.api_key_encrypted),
        isActive: Boolean(aiRows.gemini?.is_active),
      },
      openai: {
        modelName: aiRows.openai?.model_name || "gpt-4.1",
        apiKey: decryptSecret(aiRows.openai?.api_key_encrypted),
        isActive: Boolean(aiRows.openai?.is_active),
      },
    },
    syncLogs: (syncLogsResult.data || []) as Array<{
      id: string;
      week_date: string;
      status: "pending" | "success" | "failed";
      trigger_type: "submission" | "manual";
      synced_at: string | null;
      error_message: string | null;
      triggered_by: string | null;
    }>,
  };
}

export async function getResolvedChapterSettings(): Promise<ChapterSettings> {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { data: rawData, error } = await supabase.from("chapter_settings" as never).select("*").eq("chapter_id", chapter.id as never).maybeSingle();
  if (error) throw error;
  const data = (rawData || null) as null | {
    meeting_time: string | null;
    submission_deadline_day: number;
    submission_deadline_time: string;
    reminder_day: number;
    reminder_time: string;
  };
  return {
    meetingTime: data?.meeting_time || DEFAULT_CHAPTER_SETTINGS.meetingTime,
    submissionDeadlineDay: data?.submission_deadline_day ?? DEFAULT_CHAPTER_SETTINGS.submissionDeadlineDay,
    submissionDeadlineTime: data?.submission_deadline_time || DEFAULT_CHAPTER_SETTINGS.submissionDeadlineTime,
    reminderDay: data?.reminder_day ?? DEFAULT_CHAPTER_SETTINGS.reminderDay,
    reminderTime: data?.reminder_time || DEFAULT_CHAPTER_SETTINGS.reminderTime,
  };
}

export async function saveAdminSettingsAction(formData: FormData) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const activeProvider = requireText(formData, "active_provider") as "claude" | "gemini" | "openai";

  const { error: chapterError } = await supabase
    .from("chapters" as never)
    .update({
      name: requireText(formData, "chapter_name") || chapter.name,
      region: optionalText(formData, "chapter_region"),
    } as never)
    .eq("id", chapter.id as never);
  if (chapterError) throw chapterError;

  const { error: settingsError } = await supabase.from("chapter_settings" as never).upsert(
    {
      chapter_id: chapter.id,
      meeting_time: optionalText(formData, "meeting_time"),
      submission_deadline_day: Number(requireText(formData, "submission_deadline_day") || DEFAULT_CHAPTER_SETTINGS.submissionDeadlineDay),
      submission_deadline_time: requireText(formData, "submission_deadline_time") || DEFAULT_CHAPTER_SETTINGS.submissionDeadlineTime,
      reminder_day: Number(requireText(formData, "reminder_day") || DEFAULT_CHAPTER_SETTINGS.reminderDay),
      reminder_time: requireText(formData, "reminder_time") || DEFAULT_CHAPTER_SETTINGS.reminderTime,
      bni_connect_username_encrypted: encryptSecret(optionalText(formData, "bni_connect_username")),
      bni_connect_password_encrypted: encryptSecret(optionalText(formData, "bni_connect_password")),
    } as never,
    { onConflict: "chapter_id" },
  );
  if (settingsError) throw settingsError;

  const providers = ["claude", "gemini", "openai"] as const;
  for (const provider of providers) {
    const { error } = await supabase.from("ai_settings" as never).upsert(
      {
        chapter_id: chapter.id,
        provider,
        model_name: optionalText(formData, `${provider}_model_name`),
        api_key_encrypted: encryptSecret(optionalText(formData, `${provider}_api_key`)),
        is_active: provider === activeProvider,
      } as never,
      { onConflict: "chapter_id,provider" },
    );
    if (error) throw error;
  }

  revalidatePath("/admin/settings");
  revalidatePath("/dashboard/report");
  revalidatePath("/admin/submission");
  redirect("/admin/settings?saved=1");
}

export async function sendBulkReminderAction(formData: FormData) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const weekDate = requireText(formData, "week_date");

  const [membersResult, briefsResult] = await Promise.all([
    supabase.from("members" as never).select("id, chinese_name").eq("chapter_id", chapter.id as never),
    supabase.from("weekly_briefs" as never).select("member_id, status").eq("week_date", weekDate as never),
  ]);
  if (membersResult.error) throw membersResult.error;
  if (briefsResult.error) throw briefsResult.error;

  const submittedIds = new Set(
    ((briefsResult.data || []) as Array<{ member_id: string; status: string }>).filter((row) => row.status === "submitted").map((row) => row.member_id),
  );
  const pendingMembers = ((membersResult.data || []) as Array<{ id: string; chinese_name: string }>).filter((member) => !submittedIds.has(member.id));

  if (pendingMembers.length > 0) {
    const { error } = await supabase.from("reminder_logs" as never).insert(
      pendingMembers.map((member) => ({
        chapter_id: chapter.id,
        member_id: member.id,
        week_date: weekDate,
        message: buildReminderMessage(member.chinese_name, weekDate),
        trigger_type: "manual",
      })) as never,
    );
    if (error) throw error;
  }

  revalidatePath("/admin/submission");
  redirect(`/admin/submission?week=${weekDate}&reminded=${pendingMembers.length}`);
}

export async function triggerManualSyncAction(formData: FormData) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const actor = await getCurrentMember();
  const weekDate = requireText(formData, "week_date");

  const { data: insertedData, error } = await supabase
    .from("sync_logs" as never)
    .insert({
      chapter_id: chapter.id,
      week_date: weekDate,
      status: "pending",
      trigger_type: "manual",
      triggered_by: actor?.id || null,
      payload: { source: "admin-settings-baseline" },
    } as never)
    .select("id")
    .single();
  if (error) throw error;
  const data = insertedData as { id: string };

  const { error: updateError } = await supabase
    .from("sync_logs" as never)
    .update({
      status: "success",
      synced_at: new Date().toISOString(),
      error_message: null,
    } as never)
    .eq("id", data.id as never);
  if (updateError) throw updateError;

  revalidatePath("/admin/settings");
  redirect(`/admin/settings?sync=1&week=${weekDate}`);
}
