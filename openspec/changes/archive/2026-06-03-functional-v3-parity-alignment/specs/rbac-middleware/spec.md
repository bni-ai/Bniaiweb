## MODIFIED Requirements

### Requirement: Route Access Control

The Next.js `middleware.ts` SHALL enforce role-based access on every request using the resolved authenticated role and surface intent. The middleware SHALL run on all routes except `/presentation/*`, `/error`, and `/_next/*`.

| Path pattern | Allowed role(s) | Redirect when unauthorized |
|---|---|---|
| `/admin` and `/admin/*` | `admin` | `member -> /dashboard`, `guest -> /guest`, unauthenticated -> `/login` |
| `/dashboard` and `/dashboard/*` | `member`, `admin` | `guest -> /guest`, unauthenticated -> `/login` |
| `/guest` and `/guest/*` | `guest`, `member`, `admin` | unauthenticated -> `/login` |
| `/login` | unauthenticated only | `admin -> /admin`, `member -> /dashboard`, `guest -> /guest` |

#### Scenario: Unauthenticated user visits dashboard

- **WHEN** a request with no valid session cookie matches `/dashboard`
- **THEN** the middleware SHALL redirect to `/login`

#### Scenario: Member-role user visits admin

- **WHEN** a request with resolved role `member` matches `/admin`
- **THEN** the middleware SHALL redirect to `/dashboard`

#### Scenario: Guest-role user visits dashboard

- **WHEN** a request with resolved role `guest` matches `/dashboard`
- **THEN** the middleware SHALL redirect to `/guest`

#### Scenario: Admin-role user visits login

- **WHEN** a request with resolved role `admin` matches `/login`
- **THEN** the middleware SHALL redirect to `/admin`

#### Scenario: Member-role user visits guest area

- **WHEN** a request with resolved role `member` matches `/guest`
- **THEN** the middleware SHALL allow the request through without redirection

#### Scenario: Presentation route is public

- **WHEN** a request matches `/presentation/2026-06-07` with no session cookie
- **THEN** the middleware SHALL allow the request through without redirection
