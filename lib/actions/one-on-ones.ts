"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { buildJitsiRoom, hasBookingConflict, isWithinAvailabilityWindowByLocalParts, parseAvailabilityPayload, parseLocalDateTimeParts } from "../one-on-one";
import { createAdminClient, getChapter, requireText } from "./admin-common";
import { getCurrentMember } from "./member-portal";

type OneOnOneStatus = "pending" | "confirmed" | "completed" | "cancelled";

function assertAllowedStatus(status: string): asserts status is Exclude<OneOnOneStatus, "pending"> {
  if (!["confirmed", "completed", "cancelled"].includes(status)) {
    throw new Error("狀態不合法");
  }
}

export async function getOneOnOneDashboardData(selectedInviteeId?: string | null) {
  const member = await getCurrentMember();
  if (!member) {
    return {
      member: null,
      availability: [],
      members: [],
      bookings: [],
      selectedInviteeId: selectedInviteeId || null,
    };
  }

  const supabase = createAdminClient();
  const chapter = await getChapter();

  const [availabilityResult, membersResult, bookingsResult] = await Promise.all([
    supabase
      .from("member_availability" as never)
      .select("*")
      .eq("member_id", member.id as never)
      .order("day_of_week", { ascending: true })
      .order("start_time", { ascending: true }),
    supabase
      .from("members" as never)
      .select("id, chinese_name, specialty_title, company_name, is_active")
      .eq("chapter_id", chapter.id as never)
      .neq("id", member.id as never)
      .eq("is_active", true as never)
      .order("member_number", { ascending: true, nullsFirst: false }),
    supabase
      .from("one_on_ones" as never)
      .select("*")
      .or(`inviter_id.eq.${member.id},invitee_id.eq.${member.id}` as never)
      .order("scheduled_at", { ascending: true }),
  ]);

  if (availabilityResult.error) throw availabilityResult.error;
  if (membersResult.error) throw membersResult.error;
  if (bookingsResult.error) throw bookingsResult.error;

  const bookingRows = (bookingsResult.data || []) as Array<{
    id: string;
    inviter_id: string;
    invitee_id: string;
    scheduled_at: string | null;
    status: OneOnOneStatus;
    notes: string | null;
    jitsi_room: string | null;
  }>;

  const members = (membersResult.data || []) as Array<{
    id: string;
    chinese_name: string;
    specialty_title: string | null;
    company_name: string | null;
    is_active: boolean;
  }>;

  const memberIds = Array.from(new Set([member.id, ...members.map((row) => row.id), ...bookingRows.flatMap((row) => [row.inviter_id, row.invitee_id])]));
  const namesResult = memberIds.length
    ? await supabase.from("members" as never).select("id, chinese_name").in("id", memberIds as never)
    : { data: [], error: null };
  if (namesResult.error) throw namesResult.error;
  const nameMap = new Map(((namesResult.data || []) as Array<{ id: string; chinese_name: string }>).map((row) => [row.id, row.chinese_name]));

  const bookings = bookingRows.map((booking) => ({
    ...booking,
    inviter_name: nameMap.get(booking.inviter_id) || "未知會員",
    invitee_name: nameMap.get(booking.invitee_id) || "未知會員",
    can_manage: booking.inviter_id === member.id || booking.invitee_id === member.id,
  }));

  return {
    member,
    availability: (availabilityResult.data || []) as Array<{
      id: string;
      member_id: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
    }>,
    members,
    bookings,
    selectedInviteeId: selectedInviteeId || null,
  };
}

export async function saveMyAvailabilityAction(formData: FormData) {
  try {
    const member = await getCurrentMember();
    if (!member) throw new Error("找不到登入會員資料");

    const supabase = createAdminClient();
    const rows = parseAvailabilityPayload(formData);
    const { error: deleteError } = await supabase.from("member_availability" as never).delete().eq("member_id", member.id as never);
    if (deleteError) throw deleteError;
    if (rows.length > 0) {
      const { error } = await supabase.from("member_availability" as never).insert(
        rows.map((row) => ({
          member_id: member.id,
          ...row,
        })) as never,
      );
      if (error) throw error;
    }
    revalidatePath("/dashboard/one-on-one");
    redirect("/dashboard/one-on-one?saved=availability");
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "可預約時段儲存失敗";
    redirect(`/dashboard/one-on-one?error=${encodeURIComponent(message)}`);
  }
}

export async function createOneOnOneBookingAction(formData: FormData) {
  const inviteeId = requireText(formData, "invitee_id");
  try {
    const member = await getCurrentMember();
    if (!member) throw new Error("找不到登入會員資料");

    if (!inviteeId) throw new Error("請選擇預約對象");
    if (inviteeId === member.id) throw new Error("不能預約自己");

    const scheduledAt = parseLocalDateTimeParts(requireText(formData, "scheduled_at"));
    const notes = requireText(formData, "notes") || null;
    const supabase = createAdminClient();

    const [availabilityResult, bookingsResult] = await Promise.all([
      supabase
        .from("member_availability" as never)
        .select("day_of_week, start_time, end_time")
        .eq("member_id", inviteeId as never),
      supabase
        .from("one_on_ones" as never)
        .select("inviter_id, invitee_id, scheduled_at, status")
        .eq("scheduled_at", scheduledAt.iso as never),
    ]);

    if (availabilityResult.error) throw availabilityResult.error;
    if (bookingsResult.error) throw bookingsResult.error;

    const availability = (availabilityResult.data || []) as Array<{ day_of_week: number; start_time: string; end_time: string }>;
    if (!availability.length) {
      throw new Error("對方尚未設定可預約時段");
    }
    if (!isWithinAvailabilityWindowByLocalParts(scheduledAt, availability)) {
      throw new Error("此時段不在對方可預約範圍內");
    }

    const existingRows = (bookingsResult.data || []) as Array<{
      inviter_id: string;
      invitee_id: string;
      scheduled_at: string | null;
      status: OneOnOneStatus;
    }>;
    if (hasBookingConflict(existingRows, member.id, inviteeId, scheduledAt.iso)) {
      throw new Error("此時段已有重疊的一對一預約");
    }

    const { error } = await supabase.from("one_on_ones" as never).insert({
      inviter_id: member.id,
      invitee_id: inviteeId,
      scheduled_at: scheduledAt.iso,
      status: "pending",
      notes,
      jitsi_room: buildJitsiRoom(),
    } as never);
    if (error) throw error;

    revalidatePath("/dashboard/one-on-one");
    revalidatePath("/dashboard");
    redirect(`/dashboard/one-on-one?invitee=${encodeURIComponent(inviteeId)}&saved=booking`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "建立預約失敗";
    redirect(`/dashboard/one-on-one?invitee=${encodeURIComponent(inviteeId)}&error=${encodeURIComponent(message)}`);
  }
}

export async function updateOneOnOneStatusAction(formData: FormData) {
  try {
    const member = await getCurrentMember();
    if (!member) throw new Error("找不到登入會員資料");

    const bookingId = requireText(formData, "booking_id");
    const nextStatus = requireText(formData, "next_status");
    assertAllowedStatus(nextStatus);

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("one_on_ones" as never)
      .select("id, inviter_id, invitee_id")
      .eq("id", bookingId as never)
      .maybeSingle();
    if (error) throw error;
    const booking = (data as { id: string; inviter_id: string; invitee_id: string } | null) || null;
    if (!booking) throw new Error("找不到預約紀錄");
    if (![booking.inviter_id, booking.invitee_id].includes(member.id)) {
      throw new Error("你沒有權限修改這筆預約");
    }

    const { error: updateError } = await supabase
      .from("one_on_ones" as never)
      .update({ status: nextStatus } as never)
      .eq("id", bookingId as never);
    if (updateError) throw updateError;

    revalidatePath("/dashboard/one-on-one");
    revalidatePath("/dashboard");
    redirect(`/dashboard/one-on-one?saved=status-${nextStatus}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : "更新狀態失敗";
    redirect(`/dashboard/one-on-one?error=${encodeURIComponent(message)}`);
  }
}

export async function getOneOnOneVideoSession(bookingId: string) {
  const member = await getCurrentMember();
  if (!member) throw new Error("找不到登入會員資料");
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("one_on_ones" as never)
    .select("id, inviter_id, invitee_id, scheduled_at, status, notes, jitsi_room")
    .eq("id", bookingId as never)
    .maybeSingle();
  if (error) throw error;
  const booking = (data || null) as null | {
    id: string;
    inviter_id: string;
    invitee_id: string;
    scheduled_at: string | null;
    status: OneOnOneStatus;
    notes: string | null;
    jitsi_room: string | null;
  };
  if (!booking) throw new Error("找不到預約紀錄");
  if (![booking.inviter_id, booking.invitee_id].includes(member.id)) throw new Error("你沒有權限查看這場會議");
  if (booking.status !== "confirmed") throw new Error("只有已確認的預約可以進入視訊頁");
  if (!booking.scheduled_at || !booking.jitsi_room) throw new Error("這筆預約還沒有有效的會議連結");

  const scheduledAt = new Date(booking.scheduled_at);
  const now = new Date();
  const earliest = new Date(scheduledAt.getTime() - 30 * 60 * 1000);
  const latest = new Date(scheduledAt.getTime() + 90 * 60 * 1000);
  if (now < earliest || now > latest) {
    throw new Error("目前不在可進入視訊的時間窗口");
  }

  const ids = [booking.inviter_id, booking.invitee_id];
  const { data: memberRows, error: memberError } = await supabase
    .from("members" as never)
    .select("id, chinese_name")
    .in("id", ids as never);
  if (memberError) throw memberError;
  const nameMap = new Map(((memberRows || []) as Array<{ id: string; chinese_name: string }>).map((row) => [row.id, row.chinese_name]));

  return {
    ...booking,
    inviter_name: nameMap.get(booking.inviter_id) || "未知會員",
    invitee_name: nameMap.get(booking.invitee_id) || "未知會員",
    meetUrl: `https://meet.jit.si/bni-huaai-${booking.jitsi_room}`,
  };
}
