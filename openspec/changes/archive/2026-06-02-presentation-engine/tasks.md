## 1. Viewer delivery

- [x] [P] Implement slide viewer per **d1 — slide viewer route** and **d5 — visual layout** in design.md so published decks render fullscreen, unpublished or missing records return not found, and the shared 16:9 frame remains centered; verify by exercising the slide-viewer published, missing, unpublished, and malformed-entry scenarios on `/presentation/[week-date]`.
- [x] Implement route compatibility alias `/presentation/[id]` -> `/presentation/[week-date]`; verify old ID-based links still open the same published deck.

## 2. Typed slide rendering

- [x] [P] Implement slide components per **d2 — slide component contract**, **d3 — seven slide types**, and **d5 — visual layout** in design.md so the seven presentation segments render from pre-fetched props only and keep overflowing content readable inside the shared frame; verify by exercising the slide-components cover, member-and-keynote, guest-award-team-vp, and overflow scenarios through the presentation viewer.

## 3. Slide order generation

- [x] Implement slide builder per **d4 — slide builder** in design.md so `buildSlideOrder()` creates chapter-scoped, deterministic slide_order arrays with visible flags on supported slide types; verify by exercising the slide-builder complete-deck, missing-dataset, visible-flag, and chapter-scope scenarios against `lib/presentation/builder.ts`.
