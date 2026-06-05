## ADDED Requirements

### Requirement: Admin return_to redirect whitelist

`publishPresentationAction` and `unpublishPresentationAction` SHALL sanitize `return_to` form values before calling `redirect()`.

Allowed values SHALL be same-origin relative paths starting with `/admin/`. Any other value SHALL fall back to a safe default path for the current presentation editor.

#### Scenario: Malicious external return_to is submitted

- **WHEN** `return_to` is `https://evil.example/phish`
- **THEN** the action SHALL redirect to the fallback admin path instead of the external URL

#### Scenario: Valid admin return_to is submitted

- **WHEN** `return_to` is `/admin/presentations/abc-123?published=1`
- **THEN** the action SHALL redirect to that path after a successful publish

### Requirement: Publish always redirects after success

After a successful publish or unpublish, the action SHALL always redirect the user to a known admin URL.

When `return_to` is missing or invalid, the fallback SHALL be `/admin/presentations/{id}` with an appropriate query flag (for example `published=1` or `unpublished=1`).

#### Scenario: Publish without return_to

- **WHEN** `publishPresentationAction` succeeds and `return_to` is absent
- **THEN** the user SHALL be redirected to `/admin/presentations/{id}?published=1` (or equivalent documented fallback)
