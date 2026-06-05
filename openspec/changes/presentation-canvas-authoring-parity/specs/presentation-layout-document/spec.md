## ADDED Requirements

### Requirement: Presentation layout document persistence
The system SHALL persist each presentation as a versioned layout document that stores slide order, block trees, style data, asset references, and data bindings.

#### Scenario: System saves a draft layout document
- **WHEN** an administrator saves the presentation editor
- **THEN** the system MUST persist a draft layout document for that presentation instead of flattening the edit into only `slide_order`

##### Example: save draft layout
- **GIVEN** admin edited slide `cover` and slide `keynote-01`
- **WHEN** admin clicks Save
- **THEN** the saved draft includes both slide documents with their block frames, styles, and bindings

#### Scenario: System creates a published layout snapshot
- **WHEN** an administrator publishes a presentation
- **THEN** the system MUST generate or update a published layout snapshot that the public viewer and present mode can read without consulting draft-only editor state

##### Example: publish after editing
- **GIVEN** the draft cover title is `十月例會簡報`
- **WHEN** admin publishes the presentation
- **THEN** the published snapshot for that week contains `十月例會簡報`

#### Scenario: System validates the layout schema before publish
- **WHEN** a presentation layout document contains invalid block data, invalid asset references, or unsupported block kinds
- **THEN** the system MUST block publish and show a validation error instead of releasing a broken viewer deck

##### Example: invalid block kind
- **GIVEN** a slide document contains block `{kind:\"unknown-widget\"}`
- **WHEN** admin clicks Publish
- **THEN** publish is rejected with a schema validation error for that block

#### Scenario: System backfills a legacy presentation
- **WHEN** an existing presentation has slide order data but no layout document
- **THEN** the system MUST generate a default layout document from the legacy slide data before the editor opens

##### Example: migrate an older deck
- **GIVEN** presentation `p-legacy` has `slide_order` but no saved layout document
- **WHEN** admin opens the editor
- **THEN** the system creates a default layout with one generated slide document per slide entry
