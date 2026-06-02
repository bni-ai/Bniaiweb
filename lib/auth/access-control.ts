export type AppRole = "admin" | "member" | "guest" | null;

export type AccessDecision = {
  allow: boolean;
  redirectTo?: "/login" | "/dashboard" | "/admin" | "/guest";
};

export function resolveAccessDecision(
  pathname: string,
  role: AppRole,
  dbQuerySpy?: () => void
): AccessDecision {
  void dbQuerySpy;
  if (pathname.startsWith("/presentation/") || pathname === "/error") {
    return { allow: true };
  }

  if (pathname === "/guest" || pathname.startsWith("/guest/")) {
    if (!role) return { allow: false, redirectTo: "/login" };
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
