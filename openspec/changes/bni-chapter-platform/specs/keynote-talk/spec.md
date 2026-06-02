## ADDED Requirements

### Requirement: Keynote Talk Scheduling

The system SHALL maintain a 6-week lookahead schedule for 8-minute keynote talks. Each week SHALL have exactly one assigned speaker. Officers SHALL be able to assign speakers to upcoming weeks.

#### Scenario: Officer assigns keynote speaker

- **WHEN** an officer assigns member #007 to the week of 2026-06-14
- **THEN** the system SHALL create a `keynote_talks` record and display the assignment in the 6-week schedule

---

### Requirement: Talk Material Upload

The assigned speaker SHALL be able to upload talk materials: topic title, outline text, and up to 5 product images. Materials SHALL be stored in Supabase Storage at `keynotes/{talk_id}/`.

#### Scenario: Speaker uploads talk materials

- **WHEN** a speaker fills in topic, outline, and uploads 3 product images
- **THEN** the system SHALL save all data to `keynote_talks` and store images in Supabase Storage

---

### Requirement: Keynote Slide Auto-Generation

The presentation engine SHALL auto-generate a KeynoteSlide from the `keynote_talks` data, displaying speaker name, topic, outline, and product image gallery.

#### Scenario: Presentation includes keynote slide

- **WHEN** a presentation is generated for a week with a keynote talk
- **THEN** the KeynoteSlide SHALL display the speaker's photo, name, topic, outline, and product images

##### Example: 週簡報渲染 keynote

- **GIVEN** week `2026-06-14` 有 keynote 記錄與 3 張產品圖
- **WHEN** officer 產生該週簡報
- **THEN** slide deck 中包含 1 張 KeynoteSlide，並顯示 3 張圖
