## Context

Bniaiweb needs a public entry point separate from the authenticated member and admin route groups. This SR adds a lightweight marketing surface that reflects the chapter brand, explains why BNI 華AI分會 exists, and gives prospective members a single contact path without introducing backend lead management.

## Goals / Non-Goals

**Goals:**
- Serve a polished public homepage at `/` without requiring authentication
- Present chapter value, core stats, and a clear member-login path
- Reuse the app-foundation design tokens and typography for brand consistency
- Keep the content simple enough to maintain as static copy in the codebase

**Non-Goals:**
- No contact form submission backend
- No CMS, dynamic content feed, or multilingual support
- No member-only data exposure beyond static high-level stats
- No SEO microsite beyond the single landing page route

## Decisions

### D1 — Route and Layout

Route: `/` using `app/(marketing)/layout.tsx`. Layout: full-width, minimal header with logo + "會員登入" button linking to `/login`. Footer with chapter name and contact info.
The marketing layout SHALL not render member or admin navigation chrome so first-time visitors only see public content.

### D2 — Page Sections

1. **Hero**: Chapter name "BNI 華AI分會", tagline "用系統化商業推薦，讓每個人的事業持續成長", CTA button "了解更多" scrolling to features.
2. **Stats**: 3 stats cards — 36名會員, 每週例會, 累計推薦成交 (static placeholders).
3. **Features**: 4 value props — 每週例會、一對一配對、會員成長追蹤、AI 簡報系統.
4. **CTA**: "申請加入" button linking to `mailto:huaai@bni.com.tw`.
Sections SHALL render in that order so the page moves from identity to proof points to conversion.

### D3 — Visual Design

Uses design tokens from `app-foundation`: primary red `#dc2626`, Noto Sans TC. Cards use `var(--radius-card)`. Page background `var(--surface-2)`. Fully responsive (mobile-first, single column on `<768px`, grid on `≥768px`).
Hero content SHALL prioritize readable typography and a strong contrast ratio for the red CTA button.

## Implementation Contract

**Behavior:**
- Visiting `/` as any user shows the public marketing page without authentication
- The header login button takes visitors to `/login`
- The hero CTA scrolls visitors to the features section on the same page
- The final CTA opens the default mail client with `huaai@bni.com.tw`
- The page remains legible on mobile and desktop layouts

**Interface:**
- `app/(marketing)/layout.tsx` wraps the public page shell
- `app/(marketing)/page.tsx` composes `Hero`, `Stats`, `Features`, and `CTA` sections in order
- `components/landing/hero.tsx`, `stats.tsx`, `features.tsx`, and `cta.tsx` render static content blocks with reusable section containers

**Failure modes:**
- Missing image/logo asset: fallback to a text-only chapter name in the header
- Small viewport widths: sections collapse to a single-column layout without horizontal scrolling
- Missing browser mail client: the CTA still exposes the contact email in visible text next to the button

**Acceptance criteria:**
1. The public-landing-page route loads at `/` without authentication
2. The page displays hero, stats, features, and CTA sections in order
3. The login button links to `/login` and the join CTA links to `mailto:huaai@bni.com.tw`
4. Mobile layout uses a single-column stack and desktop layout uses the planned grid presentation

## Risks / Trade-offs

- **Static stats**: Hard-coded numbers are simple for Phase 1 but require a code change when chapter metrics change.
- **Single-page scope**: A one-page site reduces maintenance burden, but deeper SEO content must wait for a later SR if needed.
- **Minimal header**: Removing extra navigation keeps focus high, though repeat visitors have fewer exploration paths.
