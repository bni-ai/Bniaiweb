## ADDED Requirements

### Requirement: Supabase Client Utilities

The system SHALL provide `lib/supabase/server.ts` and `lib/supabase/client.ts` as the ONLY entry points for Supabase access throughout the codebase. All Server Components, Server Actions, and Route Handlers SHALL use `createServerClient()` from `lib/supabase/server.ts`. All Client Components SHALL use `createBrowserClient()` from `lib/supabase/client.ts`. Direct imports from `@supabase/supabase-js` outside these files SHALL NOT exist.

#### Scenario: Server component fetches data

- **WHEN** a Server Component calls `createServerClient()` and executes a query
- **THEN** the query SHALL execute with the authenticated user's session cookie, applying Supabase RLS automatically

#### Scenario: Client component accesses auth state

- **WHEN** a Client Component calls `createBrowserClient()` and calls `.auth.getSession()`
- **THEN** the function SHALL return the current browser session without page reload

### Requirement: Environment Variable Validation

The application SHALL validate that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set at startup. If either is missing, the application SHALL throw an error at module import time with the message "Missing Supabase env var: <NAME>" so CI/CD pipelines catch the misconfiguration before deployment.

#### Scenario: Missing env var causes startup failure

- **WHEN** `NEXT_PUBLIC_SUPABASE_URL` is undefined and `lib/supabase/client.ts` is imported
- **THEN** an error with message "Missing Supabase env var: NEXT_PUBLIC_SUPABASE_URL" SHALL be thrown before any component renders
