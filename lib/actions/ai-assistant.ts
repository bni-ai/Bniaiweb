"use server";

import { redirect } from "next/navigation";

import { buildAiMemberResponse, type AiProvider } from "../ai-assistant";
import { buildReminderMessage } from "../chapter-settings";
import { createAdminClient, getChapter, requireText } from "./admin-common";
import { getCurrentMember } from "./member-portal";

function currentWeekDate() {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const year = monday.getFullYear();
  const month = String(monday.getMonth() + 1).padStart(2, "0");
  const date = String(monday.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

async function getActiveProviderRow() {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { data, error } = await supabase
    .from("ai_settings" as never)
    .select("provider, model_name")
    .eq("chapter_id", chapter.id as never)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  const row = (data || { provider: "claude", model_name: "claude-3-5-sonnet" }) as {
    provider: AiProvider;
    model_name: string | null;
  };
  return row;
}

export async function getAiAssistantPageData(query?: string, weekDate?: string) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const member = await getCurrentMember();
  const activeProvider = await getActiveProviderRow();
  const effectiveWeek = weekDate || currentWeekDate();

  const [membersResult, briefsResult, conversationResult] = await Promise.all([
    supabase
      .from("members" as never)
      .select("id, chinese_name, specialty_title, specialty_description, company_name, committee")
      .eq("chapter_id", chapter.id as never)
      .eq("is_active", true as never)
      .order("member_number", { ascending: true, nullsFirst: false }),
    supabase
      .from("weekly_briefs" as never)
      .select("member_id, status")
      .eq("week_date", effectiveWeek as never),
    supabase
      .from("ai_conversations" as never)
      .select("id, provider, query, response, created_at")
      .eq("chapter_id", chapter.id as never)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);
  if (membersResult.error) throw membersResult.error;
  if (briefsResult.error) throw briefsResult.error;
  if (conversationResult.error) throw conversationResult.error;

  const members = (membersResult.data || []) as Array<{
    id: string;
    chinese_name: string;
    specialty_title: string | null;
    specialty_description: string | null;
    company_name: string | null;
    committee: string | null;
  }>;
  const submittedIds = new Set(
    ((briefsResult.data || []) as Array<{ member_id: string; status: string }>).filter((row) => row.status === "submitted").map((row) => row.member_id),
  );
  const pendingMembers = members.filter((row) => !submittedIds.has(row.id));

  const reminderPreview = pendingMembers.map((pendingMember) => ({
    memberName: pendingMember.chinese_name,
    message: buildReminderMessage(pendingMember.chinese_name, effectiveWeek),
  }));

  const queryResult = query ? buildAiMemberResponse(query, activeProvider.provider, members) : null;

  return {
    member,
    activeProvider,
    queryResult,
    effectiveWeek,
    reminderPreview,
    recentConversations: (conversationResult.data || []) as Array<{
      id: string;
      provider: AiProvider;
      query: string;
      response: string;
      created_at: string;
    }>,
  };
}

export async function submitAiQueryAction(formData: FormData) {
  const query = requireText(formData, "query").trim();
  if (!query) {
    redirect("/dashboard/ai?error=請輸入問題");
  }
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const member = await getCurrentMember();
  const activeProvider = await getActiveProviderRow();

  const { data: membersData, error: membersError } = await supabase
    .from("members" as never)
    .select("chinese_name, specialty_title, specialty_description, company_name, committee")
    .eq("chapter_id", chapter.id as never)
    .eq("is_active", true as never);
  if (membersError) throw membersError;

  const result = buildAiMemberResponse(query, activeProvider.provider, (membersData || []) as Array<{
    chinese_name: string;
    specialty_title: string | null;
    specialty_description: string | null;
    company_name: string | null;
    committee: string | null;
  }>);

  const { error } = await supabase.from("ai_conversations" as never).insert({
    chapter_id: chapter.id,
    member_id: member?.id || null,
    provider: activeProvider.provider,
    query,
    response: result.answer,
    intent: result.intent,
    fallback_used: result.fallbackUsed,
  } as never);
  if (error) throw error;

  redirect(`/dashboard/ai?q=${encodeURIComponent(query)}`);
}
