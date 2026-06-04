/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";

import { filterGuestContentItems, selectCurrentGuestVisit } from "../guest-portal";
import { createServerClient } from "../supabase/server";
import { createAdminClient, getChapter } from "./admin-common";

export async function getGuestRole(): Promise<"guest" | "pending_member" | null> {
  const cookieStore = await cookies();
  const role = cookieStore.get("sb-role")?.value;
  if (role === "guest" || role === "pending_member") return role;
  return null;
}

export async function getGuestContentItems() {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const role = await getGuestRole();
  const isGuest = role === "guest" || role === "pending_member";
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
  if (!role) return null;

  const authClient = await createServerClient();
  const { data: { user } } = await authClient.auth.getUser();
  const email = user?.email;
  if (!email) return null;

  const supabase = createAdminClient();

  if (role === "pending_member") {
    const { data: member, error: memberError } = await supabase
      .from("members" as never)
      .select("id, chinese_name, company_name, specialty_title, email")
      .ilike("email", email as never)
      .maybeSingle();

    if (memberError) throw memberError;
    if (!member) return null;

    const pm = member as { id: string; chinese_name: string; company_name: string | null; specialty_title: string | null; email: string };
    return {
      isPending: true,
      guest: {
        id: pm.id,
        name: pm.chinese_name,
        email: pm.email,
        company: pm.company_name,
        specialty: pm.specialty_title,
      },
      visit: null,
    };
  }

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
    isPending: false,
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
