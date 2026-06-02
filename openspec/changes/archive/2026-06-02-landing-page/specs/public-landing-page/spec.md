## ADDED Requirements

### Requirement: Public landing page

The system SHALL expose a public homepage at `/` that introduces BNI 華AI分會, presents core chapter value, and routes visitors toward login or inquiry actions.

#### Scenario: Visitor opens the homepage
- **WHEN** an unauthenticated visitor requests `/`
- **THEN** the system MUST render the public landing page without redirecting to login

#### Scenario: Visitor reviews core sections
- **WHEN** the landing page finishes loading
- **THEN** the system MUST show hero, stats, features, and CTA sections in that order with Traditional Chinese marketing copy

##### Example:
- **GIVEN** viewport width `1440px`
- **WHEN** visitor opens `/`
- **THEN** page section order is `hero -> stats -> features -> cta` and each section shows Traditional Chinese copy

#### Scenario: Visitor uses primary actions
- **WHEN** the visitor clicks the header login button or the final join CTA
- **THEN** the system MUST route the login action to `/login` and the join action to `mailto:huaai@bni.com.tw`

#### Scenario: Visitor views the page on mobile
- **WHEN** the landing page is rendered on a viewport narrower than 768 pixels
- **THEN** the system MUST collapse the section layouts to a readable single-column presentation without horizontal scrolling
