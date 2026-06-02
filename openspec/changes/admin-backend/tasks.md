## 1. Weekly officer operations

- [x] [P] Implement weekly brief management per **d1 — weekly brief management** in design.md so officers can review every active member for a selected week, edit submitted content, and approve rows from the list; verify by exercising the weekly-brief-management coverage, edit, and approval scenarios on `/admin/submission`.
- [x] [P] Implement guest management per **d2 — guest management** in design.md so officers can create guest identities, manage weekly guest visits, and switch between current and next-week tabs with correct new or returning badges; verify by exercising the guest-management first-time, returning, week-tab, and edit scenarios on `/admin/guests`.

## 2. Weekly content entry

- [x] [P] Implement keynote talk management per **d3 — keynote talk management** in design.md so officers can upsert one keynote record per chapter-week and maintain speaker, outline, product images, and status; verify by exercising the keynote-talk-management create, update, and week-switch scenarios on `/admin/keynote`.
- [x] [P] Implement vp report management per **d4 — vp report** in design.md so officers can upsert one validated weekly metrics record and keep invalid negative values from saving; verify by exercising the vp-report-management create, update, and invalid-metric scenarios on `/admin/vp-report`.
- [x] [P] Implement awards management per **d5 — awards** in design.md so officers can add, edit, and delete individual weekly awards without affecting sibling records; verify by exercising the awards-management create, edit, and delete scenarios on `/admin/awards`.

## 3. Presentation preparation

- [x] Implement presentation publishing creation flows per **d6 — presentation publishing** in design.md so officers can generate a presentations record with initial slide_order data and revisit it from the weekly list; verify by exercising the presentation-publishing creation scenario and confirming a generated `slide_order` payload exists.
- [x] Implement presentation publishing editing and publish flows per **d6 — presentation publishing** in design.md so officers can reorder slides, toggle visibility, block empty decks, and persist `published_url` when publishing; verify by exercising the presentation-publishing edit, publish, and incomplete-data scenarios on `/admin/presentations/[id]`.
- [x] Add compatibility redirects `/admin/weekly-briefs` -> `/admin/submission` and `/admin/presentations` -> `/admin/presentation`; verify old links continue to work with no permission regression.
