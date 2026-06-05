## ADDED Requirements

### Requirement: Role-separated portal navigation
The system SHALL present administrator, member, and guest as distinct portal areas with clear identity context and role-specific navigation.

#### Scenario: Admin opens the portal switch
- **WHEN** an authenticated administrator opens the application shell
- **THEN** the shell MUST show administrator, member, and guest portal choices without mixing guest-only pages into the administrator work queue

##### Example: admin portal choices
- **GIVEN** user `fish@fishot.com` has administrator access
- **WHEN** the user opens `/admin`
- **THEN** the shell shows `管理員`, `會員`, and `來賓` portal choices, while the admin work queue remains focused on submissions, presentations, guests, and members

#### Scenario: Member opens the portal switch
- **WHEN** an authenticated member opens the member portal
- **THEN** the shell MUST show the member context and MUST NOT expose administrator-only or guest-only operational actions

##### Example: member portal choices
- **GIVEN** user `fish.myfb@gmail.com` has member access only
- **WHEN** the user opens `/dashboard`
- **THEN** the shell shows member context and does not show admin settings, member import, guest feedback review, or guest contact ownership controls

#### Scenario: Guest opens the portal switch
- **WHEN** an authenticated guest opens the guest portal
- **THEN** the shell MUST show the guest context and MUST NOT expose member weekly tasks or administrator management actions

##### Example: guest portal choices
- **GIVEN** user `guest@example.com` has guest-only access
- **WHEN** the user opens `/guest`
- **THEN** the shell shows guest context and does not show weekly brief, one-on-one booking management, AI assistant, or admin management links

#### Scenario: Guest MVP does not require full admin/member shell rewrite

- **WHEN** the guest portal MVP is delivered
- **THEN** the system SHALL keep the existing admin and member shells unchanged for this slice, while the guest shell clearly presents guest context and does not mix member/admin workflows

##### Example: guest-first scope cut
- **GIVEN** the MVP scope is limited to guest registration, guest homepage, feedback, and connection entry
- **WHEN** the slice is delivered
- **THEN** `/admin` and `/dashboard` remain structurally unchanged, while `/guest` provides the cleaned guest experience
### Requirement: Portal visual consistency
The system SHALL apply the Open Design final alignment visual language to guest portal surfaces and keep them visually compatible with the aligned administrator and member portals.

#### Scenario: Guest portal is designed from the same system
- **WHEN** the guest portal is implemented
- **THEN** it MUST use the same design tokens, spacing rules, status styles, and responsive constraints as the aligned administrator and member portals

##### Example: shared design tokens
- **GIVEN** the aligned admin portal uses BNI red primary buttons, 8px-or-less card radius, and OD status pills
- **WHEN** the guest portal renders its intro, feedback, and connection cards
- **THEN** those cards use the same primary button, card radius, status pill, and spacing system

#### Scenario: Mobile guest portal remains usable
- **WHEN** a user opens the guest portal on a mobile viewport
- **THEN** the guest navigation and CTA area MUST remain visible, non-overlapping, and free of horizontal overflow

##### Example: mobile viewport
- **GIVEN** viewport width is `390px`
- **WHEN** a guest opens `/guest`
- **THEN** the guest navigation and CTA block fit within the viewport, navigation items do not overlap, and horizontal overflow width is `0`
