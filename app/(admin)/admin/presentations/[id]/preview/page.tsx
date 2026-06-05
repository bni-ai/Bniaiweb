import { notFound } from "next/navigation";

import { RevealRuntime } from "../../../../../../components/presentation/reveal-runtime";
import { getPresentationPreviewData } from "../../../../../../lib/actions/presentations";
import { toRuntimeDeck } from "../../../../../../lib/presentation/runtime";

export default async function PresentationDraftPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let deck;
  try {
    deck = await getPresentationPreviewData(id);
  } catch {
    notFound();
  }

  if (!deck) notFound();
  const runtimeDeck = toRuntimeDeck(deck);
  if (runtimeDeck.slides.length === 0) notFound();

  return <RevealRuntime deck={runtimeDeck} />;
}
