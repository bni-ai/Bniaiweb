## Context

The admin backend creates presentation records, but Bniaiweb still needs a rendering engine that can turn those records into a shareable meeting deck. This SR defines the public slide route, the typed slide contracts used by React components, and the builder logic that assembles a stable slide order from weekly chapter data.

## Goals / Non-Goals

**Goals:**
- Render public HTML presentations at `/presentation/[week-date]` without requiring office software
- Define typed slide entries so the viewer and builder share one contract
- Cover the seven BNI meeting slide types described in the master design
- Build deterministic slide order data from weekly chapter records

**Non-Goals:**
- No PDF export, animation, collaboration, or external embed mode
- No editing UI in the public viewer
- No unaudited raw database access from individual slide components
- No slide transitions beyond static layout changes

## Decisions

### D1 — Slide Viewer Route

Route: `/presentation/[week-date]`（對齊 `ui-mockup-admin-v3` 的發佈語意與 bni 主 SR）. Server Component fetches published presentation record by `week_date` and all linked data in parallel using `createServerClient()`. No authentication required. Full-viewport rendering, no navigation chrome. URL shared via LINE for Zoom screen share.
Backward-compat: old `/presentation/[id]` links SHOULD remain supported as a lookup alias that resolves `id -> week_date` and redirects to canonical route. In Next.js this alias is handled inside the same dynamic segment route rather than a sibling `[id]` folder, because sibling dynamic segments at the same level would conflict.
The viewer SHALL return a not-found response when the presentation week does not exist or the record is not published.

### D2 — Slide Component Contract

Each slide component is a typed React Server Component:

```typescript
// lib/presentation/types.ts
type SlideEntry =
  | { type: 'cover' }
  | { type: 'keynote'; id: string; visible: boolean }
  | { type: 'member'; id: string; visible: boolean }
  | { type: 'guest'; id: string; visible: boolean }
  | { type: 'award'; id: string; visible: boolean }
  | { type: 'vp_report'; id: string; visible: boolean }
  | { type: 'team' }
```

Slide components receive pre-fetched data as props; no DB calls inside components.
Unknown or malformed slide entries SHALL be rejected during validation before rendering.

### D3 — Seven Slide Types

| Type | Data Source | Key Display Fields |
|---|---|---|
| CoverSlide | static + presentations.week_date | Chapter name, week date, meeting time |
| MemberCard | members + weekly_briefs | Photo, chinese_name, specialty, have/want |
| KeynoteSlide | keynote_talks + members | Speaker photo, topic, outline, product images |
| GuestSlide | guests + guest_visits + members (referrer) | Guest name, specialty, referrer, visit_number badge, self_intro |
| TeamSlide | members WHERE position IS NOT NULL | Photo grid of leadership team |
| AwardSlide | weekly_awards + members | Award type icon, recipient name, description |
| VPReportSlide | weekly_vp_reports | Total referrals, 1-on-1s, visitors, attendance, TWD value |

Each slide component SHALL render within the shared presentation frame so typography, spacing, and background treatment stay consistent across slide types.

### D4 — Slide Builder

`lib/presentation/builder.ts` exports `buildSlideOrder(weekDate: string, chapterId: string): Promise<SlideEntry[]>`. Logic:
1. Start with `[{ type: 'cover' }]`
2. Append keynote entry if `keynote_talks` record exists for that week
3. Append one `member` entry per `weekly_briefs` record for that week (ordered by member_number)
4. Append one `guest` entry per `guest_visits` record for that week
5. Append `award` entries if `weekly_awards` records exist for that week
6. Append `vp_report` entry if `weekly_vp_reports` record exists for that week
7. End with `[{ type: 'team' }]`
All entries default to `visible: true` when the type supports visibility.
The builder SHALL skip missing datasets gracefully rather than emitting broken slide IDs.

### D5 — Visual Layout

Each slide renders at 16:9 aspect ratio (1280×720 logical px). CSS: `width: 100vw; height: 56.25vw; max-height: 100vh; max-width: 177.78vh`. BNI red `#dc2626` used for headers and accents. Noto Sans TC for all text. Member photos displayed in circular `80px` avatars.
The viewer SHALL center the 16:9 frame within the viewport and preserve readability on both projected displays and laptop screens.

## Implementation Contract

**Behavior:**
- Visiting `/presentation/[week-date]` with a published record renders only the visible slides in stored order
- Unknown slide types or malformed entries are rejected before component rendering begins
- Slide components are pure renderers over pre-fetched data props
- `buildSlideOrder()` creates a deterministic ordered deck from the available week data for one chapter
- Missing keynote, guest, award, or VP data shortens the deck without producing invalid placeholders

**Interface:**
- `app/presentation/[week-date]/page.tsx` loads the presentation, resolves all required linked data, validates slide_order, renders the slide list, and also handles legacy ID-based alias lookup before redirecting to the canonical week-date URL
- `lib/presentation/types.ts` exports the `SlideEntry` union and slide-specific prop types
- `lib/presentation/builder.ts` exports `buildSlideOrder(weekDate, chapterId)`
- `components/slides/*.tsx` export server components for CoverSlide, MemberCard, KeynoteSlide, GuestSlide, TeamSlide, AwardSlide, and VPReportSlide

**Failure modes:**
- Unpublished or missing presentation ID: return not found
- Malformed `slide_order`: fail validation and block rendering until the record is corrected
- Missing linked row for a stored slide ID: omit the slide and surface a validation or logging signal for officers
- Oversized content: clamp slide content to the shared frame rather than letting it overflow the viewport

**Acceptance criteria:**
1. The slide-viewer route renders a published presentation fullscreen with no app chrome
2. The slide-components contract supports the seven planned slide types using pre-fetched props only
3. The slide-builder output starts with cover, ends with team, and conditionally inserts keynote, member, guest, award, and VP report slides based on week data
4. The viewer rejects missing or unpublished records and malformed slide entries
5. The shared 16:9 frame remains centered and readable across supported viewports

## Risks / Trade-offs

- **Public accessibility**: A public route is convenient for screen sharing, but it requires the viewer to enforce published-only access strictly.
- **Data fan-out**: The viewer depends on multiple tables at once, so data fetching and validation must be coordinated before rendering.
- **Typed contract rigidity**: Strong typing reduces runtime surprises, though future slide types will require deliberate contract updates.
- **Award granularity**: Emitting one award slide per award gives officers maximum control but may lengthen the deck on busy weeks.
