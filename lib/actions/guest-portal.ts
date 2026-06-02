/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";

import { filterGuestContentItems, selectCurrentGuestVisit } from "../guest-portal";
import { createServerClient } from "../supabase/server";
import { createAdminClient, getChapter } from "./admin-common";

export async function getGuestRole(): Promise<"guest" | null> {
  const cookieStore = await cookies();
  return cookieStore.get("sb-role")?.value === "guest" ? "guest" : null;
}

export async function getGuestContentItems() {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const isGuest = (await getGuestRole()) === "guest";
  const { data, error } = await supabase
    .from("guest_content_items" as never)
    .select("id, title, summary, body, video_url, visibility, status, published_at")
    .eq("chapter_id", chapter.id as never)
    .order("published_at", { ascending: false, nullsFirst: false });
  if (error) throw error;
  return filterGuestContentItems((data || []) as any[], isGuest);
}

export async function getCurrentGuestContext() {
  const role = await getGuestRole();
  if (role !== "guest") return null;

  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  const email = user?.email;
  if (!email) return null;

  const supabase = createAdminClient();
  const { data: guest, error: guestError } = await supabase
    .from("guests" as never)
    .select("id, name, company, specialty, email, referrer_id, members(chinese_name)")
    .ilike("email", email as never)
    .maybeSingle();
  if (guestError) throw guestError;
  if (!guest) return null;

  const { data: visits, error: visitsError } = await supabase
    .from("guest_visits" as never)
    .select("id, week_date, visit_number, status, self_intro")
    .eq("guest_id", (guest as any).id as never)
    .order("week_date", { ascending: false });
  if (visitsError) throw visitsError;

  return {
    guest: guest as any,
    visit: selectCurrentGuestVisit((visits || []) as any[]),
  };
}

export async function getLimitedGuestMemberDirectory() {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { data, error } = await supabase
    .from("members" as never)
    .select("id, chinese_name, specialty_title, specialty_description, company_name")
    .eq("chapter_id", chapter.id as never)
    .order("member_number", { ascending: true, nullsFirst: false });
  if (error) throw error;
  return (data || []) as Array<{
    id: string;
    chinese_name: string;
    specialty_title: string | null;
    specialty_description: string | null;
    company_name: string | null;
  }>;
}
