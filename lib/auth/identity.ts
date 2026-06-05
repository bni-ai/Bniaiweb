import { createAdminClient } from "../actions/admin-common";
import { resolveAuthDestination } from "../access-control";

export class AuthIdentityError extends Error {
  constructor(public readonly reason: string) {
    super(reason);
    this.name = "AuthIdentityError";
  }
}

export async function resolveAuthIdentityByEmail(email: string, userId?: string) {
  const adminClient = createAdminClient();
  const { data: memberData, error: memberError } = await adminClient
    .from("members" as never)
    .select("id, role")
    .ilike("email", email as never)
    .maybeSingle();

  const member = memberData as { id: string; role: string } | null;
  if (memberError) {
    throw new AuthIdentityError("member-lookup-failed");
  }

  if (member && userId) {
    const { error: bindError } = await adminClient
      .from("members" as never)
      .update({ auth_uid: userId } as never)
      .eq("id", member.id as never);
    void bindError;
  }

  const { data: guestData, error: guestError } = member
    ? { data: null, error: null }
    : await adminClient
        .from("guests" as never)
        .select("id")
        .ilike("email", email as never)
        .maybeSingle();

  if (guestError) {
    throw new AuthIdentityError("guest-lookup-failed");
  }

  return resolveAuthDestination({
    memberRole: member?.role || null,
    isGuest: Boolean(guestData),
  });
}
