## ADDED Requirements

### Requirement: Presentation asset library
The system SHALL provide a reusable presentation asset library for slide backgrounds, inline images, and chapter branding assets.

#### Scenario: Admin uploads an asset
- **WHEN** an administrator uploads a PNG, JPG, SVG, or WebP asset from the presentation editor
- **THEN** the system MUST store the file in managed media storage and register a reusable asset record with metadata

##### Example: upload a background image
- **GIVEN** presentation `p-2026-10-31` is open in the editor
- **WHEN** admin uploads `weekly-cover.jpg`
- **THEN** the asset library stores the image and shows a selectable asset card for `weekly-cover.jpg`

#### Scenario: Admin assigns a library asset to a slide block
- **WHEN** an administrator selects an image or background block and chooses an existing asset from the library
- **THEN** the system MUST bind that block to the chosen asset without requiring a fresh upload

##### Example: reuse a chapter logo
- **GIVEN** asset `chapter-logo.svg` already exists in the library
- **WHEN** admin assigns it to block `header-logo`
- **THEN** the active slide stage renders `chapter-logo.svg` in that block

#### Scenario: Admin replaces an asset while preserving block binding
- **WHEN** an administrator replaces an existing asset file with a new file version
- **THEN** all blocks bound to that asset MUST render the replacement without manually rebinding each slide

##### Example: replace a low-resolution cover
- **GIVEN** block `cover-background` uses asset `weekly-cover`
- **WHEN** admin replaces `weekly-cover` with a new higher-resolution image
- **THEN** the cover slide continues to reference `weekly-cover` and renders the new image
