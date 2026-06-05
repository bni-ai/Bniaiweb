"use client";

import type { PresentationRuntimeDeck } from "../../lib/presentation/types";
import { DeckRuntime } from "../slides/deck-runtime";

export function RevealRuntime({ deck }: { deck: PresentationRuntimeDeck }) {
  return <DeckRuntime deck={deck} mode="viewer" />;
}
