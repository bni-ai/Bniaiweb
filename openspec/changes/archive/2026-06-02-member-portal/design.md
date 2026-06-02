## Context

The member portal sits on top of the app foundation and member module work. It gives authenticated members a focused dashboard for weekly participation tasks: checking whether their brief is ready, jumping to self-service profile pages, and finding other active members in the chapter directory.

## Goals / Non-Goals

**Goals:**
- Provide a dashboard home that summarizes this week's member state and key actions
- Let members draft and submit a weekly brief tied to the current week
- Let members browse active chapter members with basic search and profile details
- Reuse the same auth and chapter scoping rules established in earlier SRs

**Non-Goals:**
- No direct messaging, chat, or referral handoff workflows
- No push notifications or real-time presence
- No member-visible officer analytics or award management
- No cross-chapter directory browsing

## Decisions

### D1 — Dashboard Home

Route: `/dashboard`. Shows: member's own profile summary card (photo, name, specialty), this week's brief status (submitted/draft/not started), quick-action buttons: `填寫本週 Brief`, `查看成員名冊`, `更新個人資料`.
The dashboard SHALL derive the brief status from the current week for the signed-in member and surface it without requiring a second navigation.

### D2 — Weekly Brief Submission

Route: `/dashboard/report`（對齊 `ui-mockup-member-v3` 的 `page-report`）。Week date auto-set to current week (Monday). Two text areas: `本週可提供` (`have_this_week`) and `本週需要` (`want_this_week`). `儲存草稿` saves with `status='draft'`. `提交` saves with `status='submitted'` and sets `submitted_at`. Member can re-edit until admin locks the week. If brief already exists for this week, pre-fill form.
Backward-compat: `/dashboard/brief` 與 `/dashboard/weekly` SHALL redirect to `/dashboard/report`.
If the week is locked by admin policy, the page SHALL show the stored content read-only with a visible locked message.

### D3 — Member Directory

Route: `/dashboard/directory`. Grid of member cards (photo, chinese_name, specialty_title, company_name). Search by name or specialty. Click card → member profile modal showing full specialty description, referral targets, contact info (LINE name). No direct contact action (use LINE group).
The directory SHALL show only active members in the current chapter and exclude admin-only controls.

## Implementation Contract

**Behavior:**
- Signed-in members land on `/dashboard` and immediately see their current-week brief status
- Members can save a draft brief, submit it later, and reopen the same week to edit until the week is locked
- Members can search the directory by Chinese name, English name, or specialty keywords
- Directory cards open richer member details without exposing edit or contact-action buttons

**Interface:**
- `app/(member)/dashboard/page.tsx` renders the dashboard summary and quick actions
- `app/(member)/dashboard/report/page.tsx` renders the current-week brief form with draft and submit actions
- `app/(member)/dashboard/directory/page.tsx` renders the searchable active-member grid and detail modal
- `lib/actions/weekly-briefs.ts` extends the admin weekly brief module with member-scoped create and update actions

**Failure modes:**
- No existing brief for the week: render an empty draft form initialized to the current Monday
- Validation failure on submit: keep `have_this_week` and `want_this_week` visible with inline feedback
- Locked week: reject writes and keep the prior submitted or draft content visible in read-only mode
- Empty directory search: show a no-results state without clearing the search term

**Acceptance criteria:**
1. The member-dashboard route shows profile summary, brief status, and quick actions for the current member
2. The weekly-brief-submission route supports draft save, submit, prefill, and locked-week behavior
3. The member-directory route lists active chapter members only and filters by name or specialty
4. Directory detail views show profile context but no direct contact action

## Risks / Trade-offs

- **Week locking dependency**: The portal depends on an admin-defined lock signal that may not exist yet, so the contract should tolerate a default unlocked state.
- **Directory privacy**: Showing too much detail could expose sensitive data, so the modal is limited to professional profile fields already intended for member sharing.
- **Shared brief actions**: Reusing weekly brief actions across admin and member routes reduces duplication, but action authorization must remain member-scoped on dashboard routes.
