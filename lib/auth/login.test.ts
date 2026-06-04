import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

import { getReadableAuthErrorMessage, isGithubOauthEnabled } from "./login";

describe("login helpers", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_AUTH_GITHUB_ENABLED", "false");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("treats only explicit true as GitHub enabled", () => {
    expect(isGithubOauthEnabled("true")).toBe(true);
    expect(isGithubOauthEnabled("false")).toBe(false);
    expect(isGithubOauthEnabled(undefined)).toBe(false);
  });

  it("prefers readable error messages over fallback copy", () => {
    expect(getReadableAuthErrorMessage("fallback", new Error("oauth failed"))).toBe("oauth failed");
    expect(getReadableAuthErrorMessage("fallback", "route error")).toBe("route error");
    expect(getReadableAuthErrorMessage("fallback")).toBe("fallback");
  });
});
