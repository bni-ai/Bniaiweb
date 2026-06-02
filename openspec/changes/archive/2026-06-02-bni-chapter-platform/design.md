## Context

BNI Chapter "HuaAI" (華AI分會) is a 36-member BNI chapter currently operating on a fully manual stack: member data lives in Google Sheets, weekly presentations are edited in PowerPoint, one-on-one scheduling happens via LINE chat, and training records exist only in people's heads. Officers spend significant weekly hours on data reconciliation, chasing members for submissions, and manually assembling slide decks.

This change introduces a purpose-built SaaS platform to replace that manual stack. The platform is a standalone Next.js 15 (App Router) + Supabase + Tailwind CSS project deployed on Vercel — intentionally not coupled to the supastarter monorepo.

Scale: ~36 members + ~5-8 officers. Single chapter, single tenant for Phase 1-4.

## Goals / Non-Goals

**Goals:**
- Members log in with Gmail and self-manage profiles, photos, and weekly brief submissions
- System auto-generates an HTML presentation from member data each week; officers publish with one click
- Officers have a unified dashboard: submission progress, member management, presentation control, system settings
- Phased delivery (4 phases) so the most painful problem (weekly presentation) ships first
- AI assistant (Phase 4) supports multiple AI providers (Claude / Gemini / OpenAI), switchable via admin settings

**Non-Goals:**
- No payment / membership fee collection
- No real-time chat (LINE group continues)
- No member-to-member marketplace
- No multi-chapter support in Phase 1-4
- No mobile native app
- No supastarter dependency

## Decisions

### D1 — Database Schema: Normalized, Module-Aligned Tables

Tables per domain:

| Table | Key Columns |
|---|---|
| `members` | id, email, member_number, chinese_name, english_name, line_name, specialty_title, specialty_description, general_referral, ideal_referral, dream_referral, **company_name, company_address, industry_experience_years, previous_career**, **gains_goals, gains_accomplishments, gains_interests, gains_networks, gains_skills**, photo_url, role (`admin`/`member`), **position** (職掌), **committee** (委員會), created_at, updated_at |
| `member_top_clients` | id, member_id, rank (1-10), industry, company_type, location, notes |
| `member_contacts_circle` | id, member_id, tier (1=核心/2=中層/3=外圍), name, relationship, industry, notes |
| `weekly_briefs` | id, member_id, week_date, have_this_week, want_this_week, status (`draft`/`submitted`), submitted_at |
| `presentations` | id, week_date, title, status (`draft`/`published`), published_url, slide_order (jsonb), created_by |
| `keynote_talks` | id, speaker_id, week_date, topic, outline, product_images (jsonb), status (`draft`/`submitted`) |
| `guests` | id, name, specialty, referrer_id, created_at, updated_at |
| `guest_visits` | id, guest_id, week_date, visit_number, self_intro, feedback, status (`invited`/`confirmed`/`attended`/`no_show`/`joined_member`) |
| `weekly_awards` | id, week_date, recipient_id, award_type (`top_referrer`/`visitor_award`/`bni_bucks`/`spotlight`/`other`), description |
| `weekly_vp_reports` | id, week_date, total_referrals, total_one_on_ones, total_visitors, member_attendance, referral_value_twd, notes |
| `member_availability` | id, member_id, day_of_week (0-6), start_time, end_time |
| `one_on_ones` | id, inviter_id, invitee_id, scheduled_at, status (`pending`/`confirmed`/`completed`/`cancelled`), notes, jitsi_room |
| `events` | id, title, date, description, registration_deadline, max_participants |
| `event_registrations` | id, event_id, member_id, status |
| `training_courses` | id, name, system_form_name, desktop_form_name, credits, first_fee, repeat_fee, provider |
| `training_records` | id, member_id, course_id, completed_at, credits_earned |
| `ai_settings` | id, provider (`claude`/`gemini`/`openai`), api_key_encrypted, model_name, is_active |

**`slide_order` JSONB shape:**
```jsonc
[
  { "type": "cover" },                          // 自動生成，無 id
  { "type": "keynote",   "id": "<uuid>",  "visible": true },  // keynote_talks.id
  { "type": "member",    "id": "<uuid>",  "visible": true },  // weekly_briefs.id
  { "type": "guest",     "id": "<uuid>",  "visible": true },  // guests.id
  { "type": "award",     "id": "<date>",  "visible": true },  // week_date string
  { "type": "vp_report", "id": "<uuid>",  "visible": true },  // weekly_vp_reports.id
  { "type": "team" }                            // 自動從 members 生成，無 id
]
```

**Slide 資料來源對應（Admin「編輯」按鈕的目標表單）：**

| 投影片類型 | 資料來源 | Admin 編輯表單 |
|---|---|---|
| CoverSlide | 自動生成 | 無需編輯 |
| MemberCard | `members` + `weekly_briefs` | 編輯該週 `weekly_briefs` 記錄 |
| KeynoteSlide | `keynote_talks` | 編輯 `keynote_talks` 記錄 |
| GuestSlide | `guests` | 編輯 `guests` 記錄 |
| AwardSlide | `weekly_awards` | 編輯該週所有 `weekly_awards` |
| VPReportSlide | `weekly_vp_reports` | 編輯 `weekly_vp_reports` 記錄 |
| TeamSlide | `members`（依 position/committee） | 自動生成，無需編輯 |

**Rationale:** Each capability module owns its tables. Independent tables allow Phase-by-Phase schema migrations without touching earlier phases. `slide_order` as JSONB provides flexibility for presentation page reordering without a separate join table. The data-driven approach means officers edit structured form fields — no HTML or code editing required.

### D2 — Authentication: Supabase Auth + Google OAuth

Flow:
1. User clicks "Sign in with Google" → Supabase Auth Google provider handles OAuth
2. On callback: check `members` table for matching email
3. Match found → bind `auth.uid()` to member record → redirect to member dashboard
4. No match → redirect to "You are not a member of HuaAI Chapter" error page with contact info

Role is stored in `members.role`; no separate roles table. RLS policies on all tables bind to `auth.uid()` via `members` lookup.

**Rationale:** Supabase Auth with Google provider requires zero additional auth infrastructure. RLS policies directly reference `auth.uid()`, keeping authorization logic in the database layer.

### D3 — Presentation Engine: Server Components + Component-Per-Slide-Type

Route: `/presentation/[week-date]` — publicly accessible, no login required (for Zoom screen share).

Slide component types:
- `CoverSlide` — week date, chapter name, meeting info
- `MemberCard` — member photo, specialty, have/want, referral targets
- `KeynoteSlide` — speaker info, topic, outline, product images
- `GuestSlide` — guest name, specialty, referrer, self-intro
- `TeamSlide` — leadership team roster
- `AwardSlide` — weekly awards and recognition
- `VPReportSlide` — VP metrics and chapter stats

`presentations.slide_order` (JSONB) stores the ordered array of `{ type, id }` objects. The engine reads this array and renders the corresponding component for each entry.

**Rationale:** React Server Components provide fast initial load for a ~87-slide HTML document with no JavaScript hydration needed for viewing. Per-type components are independently maintainable. Public URL with no auth allows direct Zoom sharing.

### D4 — AI Integration: Strategy Pattern with Multi-Provider Adapter

Interface:
```typescript
interface AIProviderAdapter {
  chat(prompt: string, options?: ChatOptions): Promise<string>;
}
```

Implementations: `ClaudeAdapter`, `GeminiAdapter`, `OpenAIAdapter`.

Active provider read from `ai_settings` table (row where `is_active = true`). Officers switch providers via admin UI — no code deployment needed.

Fallback chain: if active provider fails → try next enabled provider → if all fail → return `{ error: "AI service temporarily unavailable" }`.

**Rationale:** Strategy pattern isolates provider-specific SDK calls. Switching providers is a DB update, not a code change. Fallback chain prevents total AI outage if one provider has an incident.

### D5 — File Storage: Supabase Storage with Path Convention

Storage path convention:
- Member photos: `members/{member_id}/photo`
- Product images: `members/{member_id}/products/{filename}`
- Keynote materials: `keynotes/{talk_id}/{filename}`

All buckets use public read + signed URLs for uploads. RLS on storage objects mirrors RLS on DB rows.

**Rationale:** Supabase Storage integrates natively with Supabase Auth RLS. Path convention is self-documenting and maps 1:1 to the entity hierarchy.

### D6 — Phased Delivery Strategy

| Phase | Capabilities | Rationale |
|---|---|---|
| 1 | `member-auth`, `member-profile`, `weekly-brief`, `presentation-engine`, `admin-dashboard`, `data-import` | Solves the weekly presentation pain immediately |
| 2 | `keynote-talk`, `guest-management` | Extends presentation engine with talk and guest slides |
| 3 | `one-on-one`, `event-calendar`, `training-tracker` | Adds member engagement and tracking tools |
| 4 | `ai-assistant` | AI layer on top of a fully populated data platform |

Each phase is independently deployable. Phase N does not depend on Phase N+1 being present.

### D7 — Change De-duplication And Acceptance Boundary

`bni-chapter-platform` was originally created as the umbrella change for the whole SaaS, but implementation later split into smaller execution changes. To avoid "做 A 壞 B" and duplicate implementation, this change now treats archived child changes as the source of truth for already-shipped modules.

Already completed elsewhere and therefore out of active implementation scope for this change:

- Authentication base flow（login / callback / middleware / guest boundary）
- Member module core（profile CRUD, GAINS, top clients, contacts circle, one-on-one）
- Presentation engine core（viewer, slide types, builder, alias compatibility）

Active implementation scope for this change is now narrowed to the modules that still block full functional acceptance:

- CSV import flow
- Events management
- Training tracking
- Settings / deadline / reminder / sync baseline
- AI assistant baseline
- Media upload baseline
- Jitsi video entry page completion

Everything else remains documented for product completeness, but SHALL NOT be reimplemented if an archived child change already delivered the behavior.

## Implementation Contract

**Behavior:**

- Visitor visits `/` → sees public landing page（含「會員登入」入口）
- Member logs in with Gmail → if email in `members` → land on `/dashboard` showing: this week's brief status, personal profile summary, upcoming one-on-ones
- Officer logs in → land on `/admin` showing: submission progress for current week, member list, pending presentation for publish
- `/presentation/[week-date]` is publicly accessible; keyboard left/right arrow navigation; fullscreen button supported
- Officers press "Generate Presentation" → system reads all submitted briefs + keynote + guest data for that week → renders slide_order → saves to `presentations` table → publishes URL

**API Routes:**

All routes return `{ data: T, error?: string }`.

| Route | Methods | Auth |
|---|---|---|
| `/api/members` | GET, POST, PATCH | Officer |
| `/api/members/[id]` | GET, PATCH | Self or Officer |
| `/api/weekly-briefs` | GET, POST, PATCH | Member (own), Officer (all) |
| `/api/presentations` | GET, POST | Officer |
| `/api/presentations/[id]` | GET, PATCH | Officer (write), Public (read if published) |
| `/api/keynotes` | GET, POST, PATCH | Member (own), Officer (all) |
| `/api/guests` | GET, POST, PATCH | Officer |
| `/api/one-on-ones` | GET, POST, PATCH | Member (own), Officer (all) |
| `/api/events` | GET, POST | Officer |
| `/api/events/[id]/register` | POST | Member |
| `/api/training` | GET, POST | Officer |
| `/api/ai` | POST | Member, Officer |

**Failure Modes:**

| Failure | Behavior |
|---|---|
| Google OAuth error | Error page with retry button; log OAuth error code |
| Non-member email | "您尚未加入華AI分會" page + officer contact info |
| AI provider API failure | Fallback to next enabled provider; if all fail → "AI 暫時無法使用" |
| Presentation render error on a slide | Skip that slide + log error with slide type and source ID |
| CSV import format mismatch | Show per-row validation errors in preview step; block import until resolved |

**Acceptance Criteria:**

- Member can log in with Gmail and view their own data
- Member submits weekly brief; officer admin dashboard updates submission count within 5 seconds
- Officer clicks "Publish" on a presentation; `/presentation/[week-date]` is publicly accessible within 5 seconds
- Importing a 36-row CSV produces 36 member records with no data loss
- AI assistant correctly answers "誰的專業是 XX" type queries using member profile data

**Scope Boundaries:**

- In scope for the original product vision: All 12 capabilities across Phase 1-4
- In scope for the current execution wave: only the acceptance-blocking modules listed in D7
- Out of scope for the current execution wave: any capability already delivered by archived child changes, plus payment processing, real-time chat, multi-chapter, native mobile app

## Risks / Trade-offs

| Risk | Severity | Mitigation |
|---|---|---|
| Over-engineering for 36-member scale | Low | Single Next.js fullstack app, no microservices. Supabase free tier sufficient. |
| AI provider API key security | High | Keys encrypted at rest in `ai_settings`; decryption server-side only; never transmitted to client. |
| Presentation render performance at ~87 slides | Medium | React Server Components with static generation; CDN caching on Vercel. |
| Google Sheet CSV import data quality | Medium | Multi-step import: upload → parse → preview with per-row validation → confirm → commit. |
| Supabase RLS complexity across 11 tables | Medium | Each table has at most 2 RLS policies. Policy names follow convention `{table}_{role}_{operation}`. |
