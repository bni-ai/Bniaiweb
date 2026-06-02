import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import type { Database } from "../../../lib/supabase/types";

export const runtime = "nodejs";

function requireServerEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing server env var: ${name}`);
  }
  return value;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendMagicLinkEmail(params: { email: string; actionLink: string }) {
  const apiKey = requireServerEnv("TOSEND_API_KEY");
  const fromEmail = process.env.TOSEND_FROM_EMAIL || process.env.MAIL_FROM;
  if (!fromEmail) {
    throw new Error("Missing server env var: TOSEND_FROM_EMAIL");
  }

  const response = await fetch("https://api.tosend.com/v2/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: {
        email: fromEmail,
        name: "BNI 華 AI 分會",
      },
      to: [{ email: params.email }],
      subject: "BNI 華 AI 分會會員登入連結",
      html: `
        <div style="font-family:Arial,'Noto Sans TC',sans-serif;line-height:1.6;color:#111827">
          <h1 style="font-size:22px">會員登入連結</h1>
          <p>請點擊下方按鈕登入 BNI 華 AI 分會會員系統。</p>
          <p>
            <a href="${params.actionLink}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px">
              登入會員系統
            </a>
          </p>
          <p style="font-size:13px;color:#6b7280">如果按鈕無法開啟，請複製以下連結到瀏覽器：</p>
          <p style="font-size:13px;word-break:break-all;color:#374151">${params.actionLink}</p>
        </div>
      `,
      text: `請開啟以下連結登入 BNI 華 AI 分會會員系統：\n${params.actionLink}`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`toSend failed with status ${response.status}: ${errorText}`);
  }
}

export async function POST(request: Request) {
  const { email } = (await request.json().catch(() => ({}))) as { email?: string };
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return NextResponse.json({ error: "請輸入有效的 email。" }, { status: 400 });
  }

  const supabase = createClient<Database>(
    requireServerEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireServerEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: normalizedEmail,
    options: {
      redirectTo: `${new URL(request.url).origin}/auth/callback`,
    },
  });

  const tokenHash = data.properties?.hashed_token;
  if (error || !tokenHash) {
    return NextResponse.json({ error: "無法建立登入連結，請稍後再試。" }, { status: 500 });
  }
  const actionLink = new URL("/auth/callback", request.url);
  actionLink.searchParams.set("token_hash", tokenHash);
  actionLink.searchParams.set("type", "magiclink");

  await sendMagicLinkEmail({ email: normalizedEmail, actionLink: actionLink.toString() });

  return NextResponse.json({ ok: true });
}
