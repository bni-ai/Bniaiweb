## ADDED Requirements

### Requirement: Middleware role cookie is not sufficient for authorization

Route middleware that reads the `sb-role` cookie SHALL be treated as a navigation convenience only. Authorization for data mutations SHALL NOT rely solely on the `sb-role` cookie or middleware path checks.

Server Actions and Route Handlers that perform administrator mutations SHALL perform independent session verification as defined in `server-action-authorization`.

#### Scenario: Middleware allows admin page but action still checks session

- **WHEN** a request reaches `/admin/presentations/[id]` with a forged `sb-role=admin` cookie but no valid Supabase session
- **THEN** middleware SHALL apply existing route rules without treating the cookie alone as proof of authorization
- **AND** any Server Action invoked from that session SHALL still reject unauthorized mutations
