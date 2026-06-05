"use client";

import { createBrowserClient as createSsrBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

function requireSupabaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) {
    throw new Error("Missing Supabase env var: NEXT_PUBLIC_SUPABASE_URL");
  }
  return value;
}

function requireSupabaseAnonKey(): string {
  const value = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!value) {
    throw new Error("Missing Supabase env var: NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return value;
}

const supabaseUrl = requireSupabaseUrl();
const supabaseAnonKey = requireSupabaseAnonKey();

export function createBrowserClient(): SupabaseClient<Database> {
  return createSsrBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
