import { notFound } from "next/navigation";

import { DeckRuntime } from "../../../../components/slides/deck-runtime";
import { toRuntimeDeck } from "../../../../lib/presentation/runtime";
import { getPublishedPresentationDeck } from "../../../../lib/presentation/viewer";
import { createServerClient } from "../../../../lib/supabase/server";

type Props = {
  params: Promise<{ "week-date": string }>;
};

export default async function PresentationPresentPage({ params }: Props) {
  const { "week-date": weekDate } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekDate)) {
    notFound();
  }

  const supabase = await createServerClient();
  let deck;
  try {
    deck = await getPublishedPresentationDeck(weekDate, supabase);
  } catch {
    notFound();
  }
  if (!deck) notFound();

  const runtimeDeck = toRuntimeDeck(deck);
  if (runtimeDeck.slides.length === 0) notFound();

  return <DeckRuntime deck={runtimeDeck} mode="present" />;
}
