import { NextResponse } from "next/server";

import { persistGuestVisit } from "../../../../../lib/actions/guests";

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = await persistGuestVisit(formData);
  return NextResponse.json({ ok: true, weekDate: result.weekDate });
}
