import { createClient } from "@supabase/supabase-js";

import type { Database, Json } from "../supabase/types";

export const awardTypeLabels: Record<string, string> = {
  top_referrer: "頂尖推薦人",
  visitor_award: "訪客獎",
  bni_bucks: "BNI 幣",
  spotlight: "聚光燈",
  other: "其他",
};

export function getDefaultWeekDate(): string {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  return monday.toISOString().slice(0, 10);
}

export function parseWeekDate(value: string | string[] | undefined): string {
  const week = Array.isArray(value) ? value[0] : value;
  return week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? week : getDefaultWeekDate();
}

export function requireText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export function optionalText(formData: FormData, name: string): string | null {
  const value = requireText(formData, name);
  return value.length > 0 ? value : null;
}

export function numberField(formData: FormData, name: string): number {
  const value = Number(requireText(formData, name) || 0);
  return Number.isFinite(value) ? value : 0;
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin environment variables");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function getChapter() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("chapters" as never)
    .select("id, name, slug")
    .eq("slug", "hua-ai")
    .maybeSingle();

  if (error) throw error;
  if (data) return data as { id: string; name: string; slug: string };

  const { data: inserted, error: insertError } = await supabase
    .from("chapters" as never)
    .insert({ slug: "hua-ai", name: "BNI 華 AI 分會", region: "台北" } as never)
    .select("id, name, slug")
    .single();

  if (insertError) throw insertError;
  return inserted as { id: string; name: string; slug: string };
}

export async function getMembers() {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { data, error } = await supabase
    .from("members")
    .select("id, email, chinese_name, role, specialty_title, company_name")
    .eq("chapter_id", chapter.id)
    .order("member_number", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data || []) as Array<{
    id: string;
    email: string;
    chinese_name: string;
    role: string;
    specialty_title: string | null;
    company_name: string | null;
  }>;
}

export function asJson(value: unknown): Json {
  return value as Json;
}
