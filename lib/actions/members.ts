"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { Database } from "../supabase/types";
import { buildContactsCirclePayload, buildTopClientsPayload, parseAdminMemberFormData, parseMemberProfileFormData } from "../member-form";
import { assertImageFile, buildMemberPhotoPath, buildMemberProductPath, ensureMediaBucket, uploadImageFile } from "../media-storage";
import { createAdminClient, getChapter, optionalText, requireText } from "./admin-common";
import { getCurrentMember } from "./member-portal";

export type MemberRecord = {
  id: string;
  chapter_id: string;
  email: string;
  member_number: string | null;
  chinese_name: string;
  english_name: string | null;
  line_name: string | null;
  specialty_title: string | null;
  specialty_description: string | null;
  general_referral: string | null;
  ideal_referral: string | null;
  dream_referral: string | null;
  company_name: string | null;
  company_address: string | null;
  industry_experience_years: number | null;
  previous_career: string | null;
  gains_goals: string | null;
  gains_accomplishments: string | null;
  gains_interests: string | null;
  gains_networks: string | null;
  gains_skills: string | null;
  photo_url: string | null;
  role: "member" | "officer" | "president";
  position: string | null;
  committee: string | null;
  is_active: boolean;
};

type MemberFilters = {
  q?: string;
  committee?: string;
  role?: string;
  active?: string;
  page?: string;
};

export async function getAdminMembers(filters: MemberFilters = {}) {
  const supabase = createAdminClient();
  const chapter = await getChapter();

  let baseQuery = supabase
    .from("members" as never)
    .select("*", { count: "exact" })
    .eq("chapter_id", chapter.id as never)
    .order("member_number", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  const search = filters.q?.trim();
  if (search) {
    baseQuery = baseQuery.or(
      `chinese_name.ilike.%${search}%,english_name.ilike.%${search}%,specialty_title.ilike.%${search}%` as never,
    );
  }
  if (filters.committee) baseQuery = baseQuery.eq("committee", filters.committee as never);
  if (filters.role) baseQuery = baseQuery.eq("role", filters.role as never);
  if (filters.active === "active") baseQuery = baseQuery.eq("is_active", true as never);
  if (filters.active === "inactive") baseQuery = baseQuery.eq("is_active", false as never);

  const pageSize = 20;
  const currentPage = Number.isFinite(Number(filters.page)) ? Math.max(1, Number(filters.page)) : 1;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;
  const { data, error, count } = await baseQuery.range(from, to);
  if (error) throw error;
  return {
    members: (data || []) as MemberRecord[],
    total: count || 0,
    currentPage,
    totalPages: Math.max(1, Math.ceil((count || 0) / pageSize)),
    pageSize,
  };
}

export async function getAdminMemberById(id: string) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { data, error } = await supabase.from("members" as never).select("*").eq("chapter_id", chapter.id as never).eq("id", id as never).maybeSingle();
  if (error) throw error;
  return (data as MemberRecord | null) || null;
}

export async function adminUpsertMemberAction(formData: FormData) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const id = requireText(formData, "id");
  const payload = parseAdminMemberFormData(formData, id ? "update" : "create");
  let memberId = id;

  if (id) {
    const { error } = await supabase.from("members" as never).update(payload as never).eq("chapter_id", chapter.id as never).eq("id", id as never);
    if (error) throw error;
  } else {
    const { data, error } = await supabase.from("members" as never).insert({
      ...payload,
      chapter_id: chapter.id,
    } as never).select("id").single();
    if (error) throw error;
    memberId = (data as { id: string }).id;
  }

  revalidatePath("/admin/members");
  if (memberId) {
    revalidatePath(`/admin/members/${memberId}`);
    redirect(`/admin/members/${memberId}?saved=1`);
  }
}

export async function toggleMemberActiveAction(formData: FormData) {
  const supabase = createAdminClient();
  const chapter = await getChapter();
  const id = requireText(formData, "id");
  const nextActive = requireText(formData, "next_active") === "true";
  const { error } = await supabase
    .from("members" as never)
    .update({ is_active: nextActive } as never)
    .eq("chapter_id", chapter.id as never)
    .eq("id", id as never);
  if (error) throw error;
  revalidatePath("/admin/members");
}

export async function updateMyProfileAction(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) throw new Error("找不到登入會員資料");
  const supabase = createAdminClient();
  const payload = parseMemberProfileFormData(formData);
  const { error } = await supabase.from("members" as never).update(payload as never).eq("id", member.id as never);
  if (error) throw error;
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/directory");
}

export async function getMyProductImages() {
  const member = await getCurrentMember();
  if (!member) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("member_product_images" as never)
    .select("id, public_url, caption, sort_order")
    .eq("member_id", member.id as never)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as Array<{ id: string; public_url: string; caption: string | null; sort_order: number }>;
}

export async function uploadMyProfilePhotoAction(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) throw new Error("找不到登入會員資料");
  const file = formData.get("photo_file");
  if (!(file instanceof File) || file.size === 0) throw new Error("請選擇照片檔案");
  assertImageFile(file, "照片");

  const supabase = createAdminClient();
  await ensureMediaBucket(supabase);
  const publicUrl = await uploadImageFile(supabase, file, buildMemberPhotoPath(member.id, file));

  const { error } = await supabase
    .from("members" as never)
    .update({ photo_url: publicUrl } as never)
    .eq("id", member.id as never);
  if (error) throw error;

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/directory");
  redirect("/dashboard/profile?photo=1");
}

export async function uploadMyProductImagesAction(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) throw new Error("找不到登入會員資料");
  const supabase = createAdminClient();
  const { data: existingData, error: existingError } = await supabase
    .from("member_product_images" as never)
    .select("id")
    .eq("member_id", member.id as never);
  if (existingError) throw existingError;
  const existingCount = (existingData || []).length;

  const files = formData
    .getAll("product_files")
    .filter((value): value is File => value instanceof File && value.size > 0);
  if (!files.length) throw new Error("請至少選擇一張產品圖");
  if (existingCount + files.length > 10) throw new Error("產品圖最多 10 張");

  for (const file of files) {
    assertImageFile(file, "產品圖");
  }

  await ensureMediaBucket(supabase);
  const uploadedRows: Array<{ member_id: string; storage_path: string; public_url: string; sort_order: number }> = [];
  for (const [index, file] of files.entries()) {
    const storagePath = buildMemberProductPath(member.id, file);
    const publicUrl = await uploadImageFile(supabase, file, storagePath);
    uploadedRows.push({
      member_id: member.id,
      storage_path: storagePath,
      public_url: publicUrl,
      sort_order: existingCount + index,
    });
  }

  const { error } = await supabase.from("member_product_images" as never).insert(uploadedRows as never);
  if (error) throw error;
  revalidatePath("/dashboard/profile");
  redirect("/dashboard/profile?products=1");
}

export async function deleteMyProductImageAction(imageId: string, formData: FormData) {
  void formData;
  const member = await getCurrentMember();
  if (!member) throw new Error("找不到登入會員資料");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("member_product_images" as never)
    .delete()
    .eq("id", imageId as never)
    .eq("member_id", member.id as never);
  if (error) throw error;
  revalidatePath("/dashboard/profile");
}

export async function updateMyGainsAction(formData: FormData) {
  if (requireText(formData, "__force_error") === "true") {
    throw new Error("GAINS_AUTOSAVE_FORCED_FAILURE");
  }
  const member = await getCurrentMember();
  if (!member) throw new Error("找不到登入會員資料");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("members" as never)
    .update({
      gains_goals: optionalText(formData, "gains_goals"),
      gains_accomplishments: optionalText(formData, "gains_accomplishments"),
      gains_interests: optionalText(formData, "gains_interests"),
      gains_networks: optionalText(formData, "gains_networks"),
      gains_skills: optionalText(formData, "gains_skills"),
    } as never)
    .eq("id", member.id as never);
  if (error) throw error;
  revalidatePath("/dashboard/gains");
  return { savedAt: new Date().toISOString() };
}

export async function getMyTopClients() {
  const member = await getCurrentMember();
  if (!member) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("member_top_clients")
    .select("*")
    .eq("member_id", member.id as never)
    .order("rank", { ascending: true });
  if (error) throw error;
  return (data || []) as Database["public"]["Tables"]["member_top_clients"]["Row"][];
}

export async function saveMyTopClientsAction(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) throw new Error("找不到登入會員資料");
  const supabase = createAdminClient();
  const rows = buildTopClientsPayload(formData);
  const { error: deleteError } = await supabase.from("member_top_clients" as never).delete().eq("member_id", member.id as never);
  if (deleteError) throw deleteError;
  if (rows.length > 0) {
    const { error } = await supabase.from("member_top_clients" as never).insert(
      rows.map((row) => ({
        member_id: member.id,
        ...row,
      })) as never,
    );
    if (error) throw error;
  }
  revalidatePath("/dashboard/top-clients");
}

export async function getMyContactsCircle() {
  const member = await getCurrentMember();
  if (!member) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("member_contacts_circle")
    .select("*")
    .eq("member_id", member.id as never)
    .order("tier", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []) as Database["public"]["Tables"]["member_contacts_circle"]["Row"][];
}

export async function saveMyContactsCircleAction(formData: FormData) {
  const member = await getCurrentMember();
  if (!member) throw new Error("找不到登入會員資料");
  const supabase = createAdminClient();
  const rows = buildContactsCirclePayload(formData);
  const { error: deleteError } = await supabase.from("member_contacts_circle" as never).delete().eq("member_id", member.id as never);
  if (deleteError) throw deleteError;
  if (rows.length > 0) {
    const { error } = await supabase.from("member_contacts_circle" as never).insert(
      rows.map((row) => ({
        member_id: member.id,
        tier: row.tier,
        name: row.name,
        relationship: row.relationship,
        industry: row.industry,
        notes: row.notes,
      })) as never,
    );
    if (error) throw error;
  }
  revalidatePath("/dashboard/contacts-circle");
}

export async function deleteMyContactAction(contactId: string, formData: FormData) {
  void formData;
  const member = await getCurrentMember();
  if (!member) throw new Error("找不到登入會員資料");
  if (!contactId) throw new Error("缺少聯絡人 ID");
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("member_contacts_circle" as never)
    .delete()
    .eq("id", contactId as never)
    .eq("member_id", member.id as never);
  if (error) throw error;
  revalidatePath("/dashboard/contacts-circle");
}
