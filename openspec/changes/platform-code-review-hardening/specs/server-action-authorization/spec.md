## ADDED Requirements

### Requirement: Admin server actions verify session before service role writes

Every Server Action that uses `createAdminClient()` to insert, update, delete, or upload chapter data SHALL verify an authenticated administrator session before performing the mutation.

The verification SHALL use the Supabase authenticated user from `createServerClient()` and SHALL confirm the user's email maps to a `members` row whose role resolves to administrator (same rule as `resolveAuthDestination` / `normalizeMemberRole`).

#### Scenario: Unauthenticated caller invokes publish presentation

- **WHEN** `publishPresentationAction` is invoked without a valid Supabase session
- **THEN** the action SHALL reject the request and SHALL NOT update `presentations.status`

#### Scenario: Member-role caller invokes save slide order

- **WHEN** `saveSlideOrderAction` is invoked by a user whose member role is `member` (not administrator)
- **THEN** the action SHALL reject the request and SHALL NOT write `slide_order`

#### Scenario: Administrator invokes presentation mutation

- **WHEN** `saveSlideOrderAction` is invoked by an authenticated administrator
- **THEN** the action SHALL proceed with `createAdminClient()` after verification succeeds
