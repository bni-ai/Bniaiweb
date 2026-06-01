## ADDED Requirements

### Requirement: CSV Upload and Parse

The system SHALL accept CSV file uploads containing member data. The parser SHALL handle UTF-8 encoding with BOM and common delimiters (comma, tab).

#### Scenario: Officer uploads CSV

- **WHEN** an officer uploads a UTF-8 CSV file with 36 rows
- **THEN** the system SHALL parse all rows and display a preview table

---

### Requirement: Column Mapping

After parsing, the system SHALL display a column mapping interface where the officer can match CSV columns to member table fields. The system SHALL auto-detect common column names.

#### Scenario: System auto-detects columns

- **WHEN** the CSV has columns named "編號", "中文名", "專業別"
- **THEN** the system SHALL auto-map them to member_number, chinese_name, specialty_title

---

### Requirement: Row-Level Validation

The system SHALL validate each row before import: required fields (member_number, chinese_name) SHALL be non-empty, email format SHALL be valid if provided, member_number SHALL be numeric.

#### Scenario: Validation catches errors

- **WHEN** row 5 has an empty chinese_name and row 12 has an invalid email
- **THEN** the system SHALL highlight both rows with specific error messages and block import until resolved

---

### Requirement: Duplicate Detection

The system SHALL detect duplicates by matching on email or member_number against existing records. Duplicates SHALL be flagged with options: skip, overwrite, or merge.

#### Scenario: Import detects duplicate

- **WHEN** a CSV row has member_number "001" which already exists in the database
- **THEN** the system SHALL flag the row as duplicate and offer skip/overwrite/merge options

---

### Requirement: Import Confirmation and Commit

After validation passes, the system SHALL show a final confirmation summary (N new records, M updates, K skipped) before committing to the database. The import SHALL be atomic — all-or-nothing.

#### Scenario: Officer confirms import

- **WHEN** an officer reviews "新增 30 筆, 更新 5 筆, 跳過 1 筆" and clicks "確認匯入"
- **THEN** the system SHALL commit all 35 records atomically to the `members` table
