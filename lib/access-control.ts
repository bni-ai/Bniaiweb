export type AppRole = "admin" | "member" | "guest" | null;

export type AccessDecision = {
  allow: boolean;
  redirectTo?: "/login" | "/dashboard" | "/admin" | "/guest";
};

export function normalizeMemberRole(role: string | null | undefined): "admin" | "member" {
  if (role === "member") return "member";
  return "admin";
}

export function resolveAuthDestination(input: { memberRole: string | null; isGuest: boolean }): { role: AppRole; redirectTo: "/admin" | "/dashboard" | "/guest" | "/error" } {
  if (input.memberRole) {
    const role = normalizeMemberRole(input.memberRole);
    return { role, redirectTo: role === "admin" ? "/admin" : "/dashboard" };
  }
  if (input.isGuest) return { role: "guest", redirectTo: "/guest" };
  return { role: null, redirectTo: "/error" };
}

export function resolveAccessDecision(pathname: string, role: AppRole): AccessDecision {
  if (pathname.startsWith("/presentation/") || pathname === "/error") {
    return { allow: true };
  }

  if (pathname === "/guest" || pathname.startsWith("/guest/")) {
    return { allow: true };
  }

  if (pathname === "/login") {
    if (role === "admin") return { allow: false, redirectTo: "/admin" };
    if (role === "member") return { allow: false, redirectTo: "/dashboard" };
    if (role === "guest") return { allow: false, redirectTo: "/guest" };
    return { allow: true };
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!role) return { allow: false, redirectTo: "/login" };
    if (role === "guest") return { allow: false, redirectTo: "/guest" };
    if (role !== "admin") return { allow: false, redirectTo: "/dashboard" };
    return { allow: true };
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!role) return { allow: false, redirectTo: "/login" };
    if (role === "guest") return { allow: false, redirectTo: "/guest" };
    return { allow: true };
  }

  return { allow: true };
}
