"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient, getChapter, optionalText, requireText } from "./admin-common";
import { getCurrentMember } from "./member-portal";

export async function getAdminEvents() {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { data, error } = await supabase
    .from("events" as never)
    .select("id, title, date, description, registration_deadline, max_participants, created_at")
    .eq("chapter_id", chapter.id as never)
    .order("date", { ascending: true });
  if (error) throw error;

  const eventIds = ((data || []) as Array<{ id: string }>).map((row) => row.id);
  const registrations = eventIds.length
    ? await supabase
        .from("event_registrations" as never)
        .select("id, event_id, member_id, status")
        .in("event_id", eventIds as never)
    : { data: [], error: null };
  if (registrations.error) throw registrations.error;

  const registrationRows = (registrations.data || []) as Array<{ id: string; event_id: string; member_id: string; status: string }>;
  const memberIds = Array.from(new Set(registrationRows.map((row) => row.member_id)));
  const memberLookupResult = memberIds.length
    ? await supabase.from("members" as never).select("id, chinese_name").in("id", memberIds as never)
    : { data: [], error: null };
  if (memberLookupResult.error) throw memberLookupResult.error;
  const memberLookup = new Map(((memberLookupResult.data || []) as Array<{ id: string; chinese_name: string }>).map((row) => [row.id, row.chinese_name]));
  const counts = registrationRows.reduce<Record<string, { registered: number; attended: number }>>((acc, row) => {
    acc[row.event_id] ||= { registered: 0, attended: 0 };
    if (row.status !== "cancelled") acc[row.event_id].registered += 1;
    if (row.status === "attended") acc[row.event_id].attended += 1;
    return acc;
  }, {});

  return ((data || []) as Array<{
    id: string;
    title: string;
    date: string;
    description: string | null;
    registration_deadline: string | null;
    max_participants: number | null;
  }>).map((event) => ({
    ...event,
    registeredCount: counts[event.id]?.registered || 0,
    attendedCount: counts[event.id]?.attended || 0,
    registrations: registrationRows
      .filter((row) => row.event_id === event.id)
      .map((row) => ({
        ...row,
        memberName: memberLookup.get(row.member_id) || row.member_id,
      })),
  }));
}

export async function getMemberEvents() {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const member = await getCurrentMember();
  const { data, error } = await supabase
    .from("events" as never)
    .select("id, title, date, description, registration_deadline, max_participants")
    .eq("chapter_id", chapter.id as never)
    .order("date", { ascending: true });
  if (error) throw error;

  const eventIds = ((data || []) as Array<{ id: string }>).map((row) => row.id);
  const registrations = eventIds.length
    ? await supabase
        .from("event_registrations" as never)
        .select("id, event_id, member_id, status")
        .in("event_id", eventIds as never)
    : { data: [], error: null };
  if (registrations.error) throw registrations.error;

  const registrationRows = (registrations.data || []) as Array<{ id: string; event_id: string; member_id: string; status: string }>;
  return ((data || []) as Array<{
    id: string;
    title: string;
    date: string;
    description: string | null;
    registration_deadline: string | null;
    max_participants: number | null;
  }>).map((event) => {
    const eventRegistrations = registrationRows.filter((row) => row.event_id === event.id && row.status !== "cancelled");
    const memberRegistration = member ? eventRegistrations.find((row) => row.member_id === member.id) || null : null;
    const remaining = event.max_participants === null ? null : Math.max(event.max_participants - eventRegistrations.length, 0);
    const isClosed = event.registration_deadline ? new Date(`${event.registration_deadline}T23:59:59+08:00`).getTime() < Date.now() : false;
    return {
      ...event,
      registrationCount: eventRegistrations.length,
      remaining,
      isClosed,
      memberRegistration,
    };
  });
}

export async function createEventAction(formData: FormData) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { error } = await supabase.from("events" as never).insert({
    chapter_id: chapter.id,
    title: requireText(formData, "title"),
    date: requireText(formData, "date"),
    description: optionalText(formData, "description"),
    registration_deadline: optionalText(formData, "registration_deadline"),
    max_participants: requireText(formData, "max_participants") ? Number(requireText(formData, "max_participants")) : null,
  } as never);
  if (error) throw error;
  revalidatePath("/admin/events");
  revalidatePath("/dashboard/events");
  redirect("/admin/events?saved=1");
}

export async function registerEventAction(formData: FormData) {
  const supabase = createAdminClient();
  const member = await getCurrentMember();
  if (!member) throw new Error("找不到登入會員資料");
  const eventId = requireText(formData, "event_id");
  const { data: eventData, error: eventError } = await supabase
    .from("events" as never)
    .select("id, registration_deadline, max_participants")
    .eq("id", eventId as never)
    .single();
  if (eventError) throw eventError;
  const event = eventData as { id: string; registration_deadline: string | null; max_participants: number | null };

  if (event.registration_deadline && new Date(`${event.registration_deadline}T23:59:59+08:00`).getTime() < Date.now()) {
    throw new Error("活動報名已截止");
  }

  const { count, error: countError } = await supabase
    .from("event_registrations" as never)
    .select("id", { count: "exact", head: true })
    .eq("event_id", eventId as never)
    .neq("status", "cancelled" as never);
  if (countError) throw countError;
  if (event.max_participants !== null && (count || 0) >= event.max_participants) {
    throw new Error("活動已額滿");
  }

  const { error } = await supabase.from("event_registrations" as never).upsert(
    {
      event_id: eventId,
      member_id: member.id,
      status: "registered",
    } as never,
    { onConflict: "event_id,member_id" },
  );
  if (error) throw error;
  revalidatePath("/dashboard/events");
}

export async function markEventAttendanceAction(formData: FormData) {
  const supabase = createAdminClient();
  const registrationId = requireText(formData, "registration_id");
  const status = requireText(formData, "status") === "attended" ? "attended" : "registered";
  const { error } = await supabase
    .from("event_registrations" as never)
    .update({ status } as never)
    .eq("id", registrationId as never);
  if (error) throw error;
  revalidatePath("/admin/events");
}
