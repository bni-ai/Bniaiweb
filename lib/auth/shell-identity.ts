import { createAdminClient, getChapter } from "../actions/admin-common";
import { createServerClient } from "../supabase/server";
import type { AppRole } from "../access-control";
import { getSessionRole } from "./session-role";

type ShellMember = {
  chinese_name: string;
  email: string;
  member_number: string | null;
  photo_url: string | null;
  position: string | null;
  role: string | null;
  specialty_title: string | null;
};

export type ShellIdentity = {
  role: AppRole;
  email: string | null;
  displayName: string;
  secondaryLabel: string;
  roleLabel: string;
  avatarUrl: string | null;
  initial: string;
  hasMemberProfile: boolean;
};

const roleLabels: Record<Exclude<AppRole, null>, string> = {
  admin: "管理員",
  member: "會員",
  guest: "來賓",
  pending_member: "待審核會員",
};

export function getInitial(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "?";
  const source = trimmed.includes("@") ? trimmed[0] : trimmed[trimmed.length - 1];
  return source.toLocaleUpperCase("zh-TW");
}

export function buildShellIdentity(input: { role: AppRole; email: string | null; member: ShellMember | null }): ShellIdentity {
  const roleLabel = input.role ? roleLabels[input.role] : "未登入";
  const displayName = input.member?.chinese_name || input.email || roleLabel;
  const memberMeta = [input.member?.position || input.member?.specialty_title || roleLabel, input.member?.member_number].filter(Boolean).join(" · ");
  const secondaryLabel = input.member ? memberMeta : input.email ? `${roleLabel} · 尚未連結會員資料` : roleLabel;

  return {
    role: input.role,
    email: input.email,
    displayName,
    secondaryLabel,
    roleLabel,
    avatarUrl: input.member?.photo_url || null,
    initial: getInitial(displayName),
    hasMemberProfile: Boolean(input.member),
  };
}

export async function getShellIdentity(): Promise<ShellIdentity> {
  const role = await getSessionRole();
  let email: string | null = null;

  try {
    const authClient = await createServerClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();
    email = user?.email || null;
  } catch {
    email = null;
  }

  if (!email) {
    return buildShellIdentity({ role, email, member: null });
  }

  const supabase = createAdminClient();
  const chapter = await getChapter();
  const { data, error } = await supabase
    .from("members" as never)
    .select("chinese_name, email, member_number, photo_url, position, role, specialty_title")
    .eq("chapter_id", chapter.id as never)
    .ilike("email", email as never)
    .maybeSingle();
  if (error) throw error;

  return buildShellIdentity({
    role,
    email,
    member: (data as ShellMember | null) || null,
  });
}
