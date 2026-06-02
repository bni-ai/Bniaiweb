import { notFound, redirect } from "next/navigation";

import { createServerClient } from "../../../lib/supabase/server";

type Props = {
  params: Promise<{ "week-date": string }>;
};

export default async function PresentationWeekPage({ params }: Props) {
  const { "week-date": weekDateOrId } = await params;
  const isWeekDate = /^\d{4}-\d{2}-\d{2}$/.test(weekDateOrId);
  const supabase = await createServerClient();

  if (!isWeekDate) {
    const { data: presentationData } = await supabase
      .from("presentations")
      .select("week_date")
      .eq("id", weekDateOrId)
      .maybeSingle();

    const presentation = presentationData as { week_date: string } | null;

    if (!presentation?.week_date) {
      notFound();
    }

    redirect(`/presentation/${presentation.week_date}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <section className="aspect-video w-full max-w-6xl rounded-md border border-white/20 bg-zinc-900 p-8">
        <p className="mb-2 text-sm text-zinc-300">Public Presentation</p>
        <h1 className="text-2xl font-semibold">週次：{weekDateOrId}</h1>
        <p className="mt-4 text-sm text-zinc-300">
          這是全螢幕 placeholder；正式 slide viewer 由 `presentation-engine` SR 實作。
        </p>
      </section>
    </main>
  );
}
