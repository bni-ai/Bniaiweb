import { randomBytes } from "node:crypto";

type MemberInviteRecord = {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  used_at: string | null;
};

export function generateMemberInviteToken() {
  return randomBytes(32).toString("hex");
}

export function isMemberInviteValid(invite: MemberInviteRecord | null | undefined, email?: string | null) {
  if (!invite) return false;
  if (invite.used_at) return false;
  if (new Date(invite.expires_at).getTime() <= Date.now()) return false;
  if (email && invite.email.trim().toLowerCase() !== email.trim().toLowerCase()) return false;
  return true;
}

export function getMemberInviteExpiry(days = 7) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt.toISOString();
}

