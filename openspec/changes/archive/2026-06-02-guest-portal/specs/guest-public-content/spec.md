## ADDED Requirements

### Requirement: Public guest information hub
The system SHALL provide a public guest portal page that explains the chapter, BNI basics, guest visit expectations, and available public articles or videos without requiring authentication.

#### Scenario: Visitor opens public guest page
- **WHEN** an unauthenticated visitor opens `/guest`
- **THEN** the system MUST render chapter introduction, BNI explanation, guest guidance, and a login call to action without redirecting to `/login`

#### Scenario: Visitor browses public content
- **WHEN** an unauthenticated visitor opens the guest content list
- **THEN** the system MUST show only published content items whose visibility is `public`

##### Example: public content filtering
- **GIVEN** content item `c-public` has `visibility=public` and item `c-guest` has `visibility=guest_only`
- **WHEN** an unauthenticated visitor opens `/guest/content`
- **THEN** only `c-public` appears in the list

### Requirement: Guest content supports articles and videos
The system SHALL store guest-facing content as structured records that can represent articles, videos, or mixed article-video entries.

#### Scenario: Published video appears in guest content
- **WHEN** a published content item has a `video_url`
- **THEN** the guest content UI MUST render it as video content while preserving title, summary, and body text
