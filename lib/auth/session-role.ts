import { cookies } from "next/headers";

import type { AppRole } from "../access-control";

export async function getSessionRole(): Promise<AppRole> {
  const cookieStore = await cookies();
  const role = cookieStore.get("sb-role")?.value;
  if (role === "admin" || role === "member" || role === "guest") return role;
  return null;
}
