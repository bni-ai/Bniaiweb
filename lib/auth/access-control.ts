export type AppRole = "admin" | "member" | null;

export type AccessDecision = {
  allow: boolean;
  redirectTo?: "/login" | "/dashboard" | "/admin";
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

  if (pathname === "/login") {
    if (role === "admin") return { allow: false, redirectTo: "/admin" };
    if (role === "member") return { allow: false, redirectTo: "/dashboard" };
    return { allow: true };
  }

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!role) return { allow: false, redirectTo: "/login" };
    if (role !== "admin") return { allow: false, redirectTo: "/dashboard" };
    return { allow: true };
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!role) return { allow: false, redirectTo: "/login" };
    return { allow: true };
  }

  return { allow: true };
}
