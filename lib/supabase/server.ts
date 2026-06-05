import { createServerClient as createSsrServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

import type { Database } from "./types";

function requireEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing Supabase env var: ${name}`);
  }
  return value;
}

const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
const supabaseAnonKey = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");

export async function createServerClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createSsrServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies. Route Handlers and Server
          // Actions still can, and middleware/auth callback handle session writes.
        }
      },
    },
  });
}

export function createRouteHandlerClient(
  request: Pick<NextRequest, "cookies">,
  response: NextResponse
): SupabaseClient<Database> {
  return createSsrServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
}

export function copyResponseCookies(source: NextResponse, target: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
}

export function clearAuthCookies(request: Pick<NextRequest, "cookies">, response: NextResponse) {
  for (const cookie of request.cookies.getAll()) {
    if (cookie.name === "sb-role" || cookie.name.includes("auth-token")) {
      response.cookies.delete(cookie.name);
    }
  }
  response.cookies.delete("sb-role");
}
