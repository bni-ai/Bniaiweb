import { notFound, redirect } from "next/navigation";

import { DeckRuntime } from "../../../components/slides/deck-runtime";
import { toRuntimeDeck } from "../../../lib/presentation/runtime";
import { getPublishedPresentationDeck } from "../../../lib/presentation/viewer";
import { createServerClient } from "../../../lib/supabase/server";

type Props = {
  params: Promise<{ "week-date": string }>;
};

export default async function PresentationWeekPage({ params }: Props) {
  const { "week-date": weekDateOrId } = await params;
  const supabase = await createServerClient();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekDateOrId)) {
    const { data, error } = await supabase
      .from("presentations" as never)
      .select("week_date, status")
      .eq("id", weekDateOrId as never)
      .eq("status", "published" as never)
      .maybeSingle();
    if (error) throw error;
    const alias = data as { week_date?: string } | null;
    if (!alias?.week_date) {
      notFound();
    }
    redirect(`/presentation/${alias.week_date}`);
  }

  let deck;
  try {
    deck = await getPublishedPresentationDeck(weekDateOrId, supabase);
  } catch {
    notFound();
  }
  if (!deck) notFound();
  const runtimeDeck = toRuntimeDeck(deck);
  if (runtimeDeck.slides.length === 0) notFound();

  return <DeckRuntime deck={runtimeDeck} />;
}
