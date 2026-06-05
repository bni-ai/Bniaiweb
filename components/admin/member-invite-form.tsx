"use client";

import { useActionState } from "react";

import { generateMemberInviteAction } from "../../app/actions/member-invite";

const initialState: { inviteUrl?: string; error?: string } = {};

export function MemberInviteForm() {
  const [state, formAction, pending] = useActionState(generateMemberInviteAction, initialState);

  return (
    <form action={formAction} className="space-y-3 rounded-[24px] border border-border bg-white p-4">
      <div>
        <p className="text-sm font-semibold text-text-1">邀請新會員</p>
        <p className="mt-1 text-xs text-text-2">輸入會員 Email，系統會產生一次性邀請連結，供幹部手動轉傳。</p>
      </div>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="email"
          name="email"
          required
          placeholder="member@example.com"
          className="flex-1 rounded-2xl border border-border px-3 py-2.5"
        />
        <button type="submit" disabled={pending} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "產生中..." : "產生邀請連結"}
        </button>
      </div>
      {state.error ? <p className="text-sm text-primary">{state.error}</p> : null}
      {state.inviteUrl ? (
        <div className="rounded-2xl bg-surface p-3 text-sm text-text-1">
          <p className="font-medium">邀請連結</p>
          <p className="mt-1 break-all">{state.inviteUrl}</p>
        </div>
      ) : null}
    </form>
  );
}
