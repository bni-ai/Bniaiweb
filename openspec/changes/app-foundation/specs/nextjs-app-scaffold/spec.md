## ADDED Requirements

### Requirement: Route Group Structure

The application SHALL use Next.js 15 App Router with four route groups: `(auth)` for unauthenticated pages, `(member)` for authenticated member pages, `(admin)` for admin-only pages, and `presentation` (ungrouped) for public slide viewing.

#### Scenario: Auth layout applied to login

- **WHEN** a request matches `/login` or `/error`
- **THEN** the system SHALL render the page using the `(auth)` group layout: centered card, no sidebar, no top navigation

#### Scenario: Member layout applied to dashboard

- **WHEN** a request matches `/dashboard`
- **THEN** the system SHALL render the page using the `(member)` group layout with a top navigation bar

#### Scenario: Admin layout applied to admin routes

- **WHEN** a request matches `/admin` or any path under `/admin/`
- **THEN** the system SHALL render the page using the `(admin)` group layout with a left sidebar matching `ui-mockup-admin-v3.html`

#### Scenario: Presentation route is layout-free

- **WHEN** a request matches `/presentation/[id]`
- **THEN** the system SHALL render the page fullscreen with no navigation chrome and no authentication requirement

### Requirement: Tailwind Design Tokens

The application SHALL define CSS custom properties in `app/globals.css` that establish the design system used across all components and all subsequent feature SRs.

Tokens: `--primary: #dc2626`, `--primary-fg: #ffffff`, `--surface: #ffffff`, `--surface-2: #f9fafb`, `--border: #e5e7eb`, `--text-1: #111827`, `--text-2: #6b7280`, `--radius-card: 8px`, `--radius-input: 6px`, `--radius-badge: 4px`. Font: Noto Sans TC loaded via `next/font/google` and applied to `<body>`.

#### Scenario: Tokens apply to all pages

- **WHEN** any page renders
- **THEN** elements referencing `var(--primary)` SHALL resolve to `#dc2626` and Noto Sans TC SHALL be the document default font

### Requirement: Shared UI Primitives

The application SHALL provide `components/ui/button.tsx` and `components/ui/card.tsx` as typed React components usable in all feature SRs without modification.

`Button` SHALL accept a `variant` prop with values `primary` (red fill, white text), `secondary` (white fill, border), `ghost` (no border, transparent). `Card` SHALL render a white container with `var(--radius-card)` corner radius and `1px solid var(--border)` border.

#### Scenario: Button variant renders correctly

- **WHEN** `<Button variant="primary">` is rendered
- **THEN** the button SHALL have background `#dc2626` and white text

#### Scenario: Button variant secondary renders correctly

- **WHEN** `<Button variant="secondary">` is rendered
- **THEN** the button SHALL have white background, `var(--border)` border, and `var(--text-1)` text color
