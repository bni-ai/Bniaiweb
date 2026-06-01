## ADDED Requirements

### Requirement: Route Access Control

The Next.js `middleware.ts` SHALL enforce role-based access on every request using the JWT `app_role` claim. The middleware SHALL run on all routes except `/presentation/*`, `/error`, and `/_next/*`.

| Path pattern | Minimum role | Redirect when unauthorized |
|---|---|---|
| `/admin` and `/admin/*` | `admin` | `/dashboard` |
| `/dashboard` and `/dashboard/*` | `member` or `admin` | `/login` |
| `/login` | unauthenticated only | `/dashboard` (member) or `/admin` (admin) |

#### Scenario: Unauthenticated user visits dashboard

- **WHEN** a request with no valid session cookie matches `/dashboard`
- **THEN** the middleware SHALL redirect to `/login`

#### Scenario: Member-role user visits admin

- **WHEN** a request with `app_role: 'member'` in the JWT matches `/admin`
- **THEN** the middleware SHALL redirect to `/dashboard`

#### Scenario: Admin-role user visits login

- **WHEN** a request with `app_role: 'admin'` in the JWT matches `/login`
- **THEN** the middleware SHALL redirect to `/admin`

#### Scenario: Presentation route is public

- **WHEN** a request matches `/presentation/abc123` with no session cookie
- **THEN** the middleware SHALL allow the request through without redirection

### Requirement: Middleware Performance

The middleware SHALL read role from the session JWT without making any database queries. The JWT `app_role` claim (injected at login by the Auth hook) is the sole source of role truth in the middleware.

#### Scenario: No DB call in middleware

- **WHEN** middleware evaluates an incoming request
- **THEN** no Supabase database queries SHALL be made; only JWT decoding is performed
