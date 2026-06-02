## Why

Officers currently build weekly presentations manually in PowerPoint, taking 2-3 hours. The system needs to auto-generate HTML presentations from structured member data, renderable on any screen without software installation.

## What Changes

A public presentation viewer at `/presentation/[week-date]` renders an HTML slide deck from `presentations.slide_order` JSONB. Seven slide component types cover all BNI meeting segments. A slide builder auto-generates the initial slide_order from all available data for a week. Backward-compat supports ID-based links by redirecting `/presentation/[id]` to canonical week-date URLs.

## Non-Goals

- No PDF export
- No animation or slide transitions (static HTML only)
- No real-time collaborative editing of slides
- No embed mode for external sites

## Capabilities

### New Capabilities

- `slide-viewer`: Public fullscreen HTML slide viewer
- `slide-components`: Seven typed React slide components
- `slide-builder`: Auto-generate slide_order from week data

### Modified Capabilities

(none)

## Impact

- Affected specs: slide-viewer, slide-components, slide-builder
- Affected code:
  - New: app/presentation/[week-date]/page.tsx
  - New: app/presentation/[id]/page.tsx (compat redirect)
  - New: components/slides/CoverSlide.tsx
  - New: components/slides/MemberCard.tsx
  - New: components/slides/KeynoteSlide.tsx
  - New: components/slides/GuestSlide.tsx
  - New: components/slides/TeamSlide.tsx
  - New: components/slides/AwardSlide.tsx
  - New: components/slides/VPReportSlide.tsx
  - New: lib/presentation/builder.ts
  - New: lib/presentation/types.ts
