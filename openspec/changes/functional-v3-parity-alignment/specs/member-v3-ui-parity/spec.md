## MODIFIED Requirements

### Requirement: Member v3 navigation parity

The system SHALL align the authenticated member navigation and page hierarchy with `ui-mockup-member-v3.html`, while keeping admin switch-in and unfinished capabilities in clearly explained states.

#### Scenario: Member opens the v3 shell
- **WHEN** an authenticated member opens the member portal
- **THEN** the system MUST expose the v3 primary navigation semantics for dashboard, report, profile, directory, and any unfinished sections as explicit limited or coming-soon entries instead of broken links

#### Scenario: Admin opens the member surface
- **WHEN** an authenticated admin switches into `/dashboard`
- **THEN** the system MUST either show the resolved member data or a clear fallback state explaining that the member profile is unavailable, and MUST NOT appear as a blank or broken page

#### Scenario: Member opens an unfinished v3 section
- **WHEN** a member selects a v3 mockup section whose underlying module is not complete yet
- **THEN** the system MUST render a safe placeholder or restricted state explaining that the capability is still in progress

### Requirement: Member v3 wired pages expose real status

The system SHALL ensure that member pages already backed by real data show states, summaries, and calls to action consistent with the v3 mockup structure.

#### Scenario: Member opens dashboard or weekly brief
- **WHEN** a member opens `/dashboard` or `/dashboard/report`
- **THEN** the system MUST show current-week summary or deadline/status information derived from real data instead of static mock values

#### Scenario: Member opens directory details
- **WHEN** a member opens the directory page and selects another member
- **THEN** the system MUST show a profile detail view or modal that reflects real member data and does not expose unfinished one-on-one actions as available when the module is not complete

##### Example: directory detail shows real profile data
- **GIVEN** `/dashboard/directory` lists member `王小明`
- **WHEN** the signed-in member opens `王小明` detail view
- **THEN** the view shows `王小明`'s real profile data and any unfinished one-on-one action appears disabled or clearly limited

#### Scenario: Member reviews the portal on smaller screens
- **WHEN** a member uses dashboard, report, or directory on mobile or tablet widths
- **THEN** the system MUST keep core actions, navigation, and status information accessible without broken layout or unreachable controls

##### Example: report CTA remains reachable on mobile
- **GIVEN** the viewport width is `390px`
- **WHEN** the member opens `/dashboard/report`
- **THEN** the submit or save controls and current deadline/status information remain reachable without horizontal breakage

## ADDED Requirements

### Requirement: Shell identity parity

The system SHALL show a signed-in identity card in member and admin shells using member profile data when available and session fallback data when profile data is missing.

#### Scenario: Member shell shows signed-in identity
- **WHEN** an authenticated member opens `/dashboard`
- **THEN** the sidebar MUST show an avatar or initial, display name, and role or member metadata near the top of the shell

##### Example: member identity card
- **GIVEN** member `fish.myfb@gmail.com` has Chinese name `余啟銘`
- **WHEN** the member opens `/dashboard`
- **THEN** the sidebar shows `余啟銘` and a member role or profile descriptor

#### Scenario: Admin viewing member surface has identity fallback
- **WHEN** an authenticated admin opens `/dashboard` without a resolved member profile
- **THEN** the sidebar MUST still show admin identity and a clear fallback state instead of hiding the user card

### Requirement: Media UX parity

The system SHALL present profile photos and product images as visible member assets backed by the existing Supabase Storage flow.

#### Scenario: Member uploads profile photo
- **WHEN** a member uploads a valid profile photo from the profile page
- **THEN** the system MUST show the uploaded photo on the profile surface and use it in member identity or directory surfaces where photo data is available

##### Example: profile photo readback
- **GIVEN** member `m-001` uploads `profile.png`
- **WHEN** the profile page reloads after upload
- **THEN** the profile photo area shows the uploaded image and the shell can use the same photo URL when available

#### Scenario: Member uploads product images
- **WHEN** a member uploads product images from the profile page
- **THEN** the system MUST show the images as a product gallery and keep them available for presentation or admin review surfaces

##### Example: product gallery readback
- **GIVEN** member `m-001` uploads `demo-product.png`
- **WHEN** the profile page reloads
- **THEN** the product gallery shows the uploaded image from the configured media storage URL

### Requirement: One-on-one Jitsi parity

The system SHALL present one-on-one booking and Jitsi Meet entry through a member-facing workflow aligned with the mockup.

#### Scenario: Member sees upcoming one-on-one meetings
- **WHEN** a member opens `/dashboard/one-on-one`
- **THEN** the system MUST show upcoming confirmed or pending meetings separately from the booking form and history list

#### Scenario: Member starts booking from a selected member
- **WHEN** a member opens one-on-one booking with an invitee selected from directory or query string
- **THEN** the booking surface MUST show the selected invitee context and allow choosing a valid time from the existing booking flow

##### Example: directory selected invitee
- **GIVEN** directory member `m-002` is named `林孟葦`
- **WHEN** the signed-in member opens `/dashboard/one-on-one?invitee=m-002`
- **THEN** the booking surface shows `林孟葦` as the selected invitee context

#### Scenario: Member enters Jitsi meeting from booking
- **WHEN** a confirmed booking is within the allowed time window
- **THEN** the system MUST expose a station-internal video entry that links to the generated Jitsi Meet room

##### Example: confirmed meeting entry
- **GIVEN** booking `b-001` has status `confirmed` and `jitsi_room=abc123`
- **WHEN** the member opens `/dashboard/one-on-one/b-001/video` within the allowed time window
- **THEN** the page shows meeting participants and a Jitsi Meet entry action

### Requirement: AI assistant chat parity

The system SHALL present the AI assistant as a chat-style surface while preserving the existing provider and query backend.

#### Scenario: Member opens AI assistant
- **WHEN** a member opens `/dashboard/ai`
- **THEN** the system MUST show AI and user message surfaces, prompt chips, and query input instead of only a raw query form and preformatted result block

#### Scenario: Member submits AI query
- **WHEN** a member submits a query from the chat input
- **THEN** the system MUST persist or read the query through the existing AI backend and display the response as an AI message

##### Example: one-on-one invite prompt
- **GIVEN** active provider is `gemini`
- **WHEN** the member submits `幫我寫一封一對一邀請`
- **THEN** the chat surface shows the user message and an AI response generated through the active provider flow
