## Why

BNI 華AI分會 needs a public-facing landing page that introduces the chapter, explains the value of BNI membership, and directs prospective members to a contact or inquiry path. Currently there is no public web presence.

## What Changes

A public marketing page at the root URL `/` showcasing the chapter, its members, and membership benefits. Accessible without login.

## Non-Goals

- No contact form backend (mailto link only in Phase 1)
- No member testimonials dynamic feed (static content)
- No multilingual toggle (Traditional Chinese only)

## Capabilities

### New Capabilities

- `public-landing-page`: BNI 華AI分會 public homepage

### Modified Capabilities

(none)

## Impact

- Affected specs: public-landing-page
- Affected code:
  - New: app/(marketing)/page.tsx
  - New: app/(marketing)/layout.tsx
  - New: components/landing/hero.tsx
  - New: components/landing/features.tsx
  - New: components/landing/stats.tsx
  - New: components/landing/cta.tsx
