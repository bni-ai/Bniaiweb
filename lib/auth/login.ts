export type LoginMode = "password" | "magic-link";

export function isGithubOauthEnabled(value = process.env.NEXT_PUBLIC_AUTH_GITHUB_ENABLED) {
  return value === "true";
}

export function getReadableAuthErrorMessage(fallback: string, error?: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (typeof error === "string" && error.trim()) {
    return error;
  }
  return fallback;
}
